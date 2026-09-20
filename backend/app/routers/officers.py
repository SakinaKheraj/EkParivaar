from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.security import create_access_token, get_current_user
from app.schemas import OfficerLoginRequest, OfficerResolveRequest
from app.ledger_core import append_audit_entry

router = APIRouter(prefix="/officer", tags=["officer"])


@router.post("/login")
def officer_login(payload: OfficerLoginRequest):
    """
    Mock officer auth — look up by name. In production this would be a
    proper credential check; for the demo, seeded officers can log in by name.
    """
    result = (
        supabase.table("officers")
        .select("*")
        .eq("name", payload.name)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Officer not found")

    officer = result.data[0]
    token = create_access_token(subject=officer["officer_id"], role="officer")
    return {"access_token": token, "officer": officer}


@router.get("/pending-reviews")
def pending_reviews(user=Depends(get_current_user)):
    """
    Returns all members with YELLOW/RED status and unresolved duplicate flags,
    augmented with real-time 72-Hour Citizen SLA countdowns and hierarchical
    escalation tiers (Talati -> Mamlatdar -> District Collector).
    """
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officer role required")

    # Flagged members with citizen names via foreign-key embedding
    flagged_members = (
        supabase.table("family_members")
        .select("*, citizens_registry(full_name, dob, aadhaar_last4)")
        .in_("verification_status", ["YELLOW", "RED"])
        .is_("removed_at", "null")
        .execute()
        .data
    )

    # Unresolved duplicate flags
    duplicate_flags = (
        supabase.table("duplicate_flags")
        .select("*, citizens_registry(full_name, dob, aadhaar_last4)")
        .eq("status", "PENDING_REVIEW")
        .execute()
        .data
    )

    now = datetime.utcnow()
    augmented_flags = []

    for flag in duplicate_flags:
        f_copy = dict(flag)
        detected_at_str = flag.get("detected_at")
        detected_dt = datetime.fromisoformat(detected_at_str.replace("Z", "+00:00").split("+")[0]) if detected_at_str else now
        
        elapsed_hours = (now - detected_dt).total_seconds() / 3600.0
        sla_total_hours = 72.0
        remaining_hours = max(0.0, sla_total_hours - elapsed_hours)

        if elapsed_hours >= 72.0:
            sla_status = "BREACHED_ESCALATED"
            escalated_to = "District Collector (Tier 2 Escalation)"
            urgency = "HIGH"
        elif elapsed_hours >= 48.0:
            sla_status = "CRITICAL"
            escalated_to = "Mamlatdar (Tier 1 Escalation)"
            urgency = "MEDIUM"
        else:
            sla_status = "NORMAL"
            escalated_to = "Talati (Local Jurisdiction)"
            urgency = "STANDARD"

        f_copy["sla_status"] = sla_status
        f_copy["sla_remaining_hours"] = round(remaining_hours, 1)
        f_copy["assigned_jurisdiction_tier"] = escalated_to
        f_copy["urgency"] = urgency
        augmented_flags.append(f_copy)

    return {
        "pending_reviews": flagged_members,
        "flagged_members": flagged_members,
        "duplicate_flags": augmented_flags,
        "total_pending_count": len(flagged_members) + len(augmented_flags),
        "sla_breached_count": sum(1 for f in augmented_flags if f.get("sla_status") == "BREACHED_ESCALATED"),
    }


@router.post("/resolve/{member_id}")
def resolve_member(member_id: str, payload: OfficerResolveRequest, user=Depends(get_current_user)):
    """
    Officer approves (GREEN) or rejects (RED) a flagged member, with official reason.
    Cryptographically commits the resolution to GovLedger and resolves duplicate flags.
    """
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officer role required")

    if payload.verification_status not in ("GREEN", "RED"):
        raise HTTPException(status_code=400, detail="Status must be GREEN or RED")

    # Update the member's verification status
    result = (
        supabase.table("family_members")
        .update({"verification_status": payload.verification_status})
        .eq("member_id", member_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Member not found")

    member = result.data[0]

    # Cryptographically append event to GovLedger
    append_audit_entry(
        family_id=member["family_id"],
        member_id=member_id,
        field_changed="verification_status",
        old_value="YELLOW/RED",
        new_value=payload.verification_status,
        changed_by=f"Officer ({user['citizen_ref']})",
        reason=payload.reason,
    )

    # If approving, also resolve any pending duplicate flags for this citizen
    if payload.verification_status == "GREEN":
        supabase.table("duplicate_flags").update({
            "status": "RESOLVED",
        }).eq("citizen_ref", member["citizen_ref"]).eq("status", "PENDING_REVIEW").execute()

    return {
        "member_id": member_id,
        "new_status": payload.verification_status,
        "reason": payload.reason,
        "resolved_at": datetime.utcnow().isoformat(),
        "ledger_committed": True,
    }
