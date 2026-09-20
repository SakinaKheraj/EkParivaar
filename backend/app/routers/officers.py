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
    Officer authentication: look up by name from the officers table.
    Returns JWT with role='officer' and the officer's full record.
    """
    result = (
        supabase.table("officers")
        .select("*")
        .eq("name", payload.name)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Officer '{payload.name}' not found. Check that the name matches exactly.")

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
        .select("*, citizens_registry(full_name, dob, aadhaar_last4), families(district, head_citizen_ref, annual_income)")
        .in_("verification_status", ["YELLOW", "RED"])
        .is_("removed_at", "null")
        .execute()
        .data
    )

    # Flatten for easier consumption
    for m in flagged_members:
        citizen = m.pop("citizens_registry", {}) or {}
        family = m.pop("families", {}) or {}
        m["citizen_name"] = citizen.get("full_name", "")
        m["citizen_dob"] = citizen.get("dob", "")
        m["aadhaar_last4"] = citizen.get("aadhaar_last4", "")
        m["district"] = family.get("district", "")
        m["annual_income"] = family.get("annual_income", 0)

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
        citizen = f_copy.pop("citizens_registry", {}) or {}
        f_copy["citizen_name"] = citizen.get("full_name", "")
        f_copy["citizen_dob"] = citizen.get("dob", "")
        f_copy["aadhaar_last4"] = citizen.get("aadhaar_last4", "")

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


@router.post("/escalate/{flag_id}")
def escalate_case(flag_id: str, user=Depends(get_current_user)):
    """
    Officer escalates a duplicate flag case to higher authority.
    Increments escalation_tier and updates the SLA deadline.
    """
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officer role required")

    flag = supabase.table("duplicate_flags").select("*").eq("flag_id", flag_id).execute()
    if not flag.data:
        raise HTTPException(status_code=404, detail="Flag not found")

    current_tier = flag.data[0].get("escalation_tier", 0)
    if current_tier >= 2:
        raise HTTPException(status_code=400, detail="Already escalated to maximum tier (District Collector)")

    supabase.table("duplicate_flags").update({
        "escalation_tier": current_tier + 1,
    }).eq("flag_id", flag_id).execute()

    tier_names = {1: "Mamlatdar", 2: "District Collector"}
    return {
        "flag_id": flag_id,
        "escalated_to_tier": current_tier + 1,
        "escalated_to": tier_names.get(current_tier + 1, "Higher Authority"),
        "escalated_at": datetime.utcnow().isoformat(),
    }


@router.get("/analytics")
def get_analytics(user=Depends(get_current_user)):
    """
    District-level analytics for administrative dashboard.
    Requires officer role.
    """
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officer role required")

    # Family stats
    all_families = supabase.table("families").select("status, district, annual_income").execute().data or []
    total_families = len(all_families)
    verified_families = sum(1 for f in all_families if f.get("status") == "VERIFIED")
    flagged_families = sum(1 for f in all_families if f.get("status") == "FLAGGED")
    pending_families = sum(1 for f in all_families if f.get("status") == "PENDING_VERIFICATION")
    draft_families = sum(1 for f in all_families if f.get("status") == "DRAFT")

    # Member stats
    all_members = supabase.table("family_members").select("verification_status").is_("removed_at", "null").execute().data or []
    total_members = len(all_members)
    verified_members = sum(1 for m in all_members if m.get("verification_status") == "GREEN")
    pending_members = sum(1 for m in all_members if m.get("verification_status") == "YELLOW")
    flagged_members = sum(1 for m in all_members if m.get("verification_status") == "RED")

    # Duplicate flags
    all_flags = supabase.table("duplicate_flags").select("status, detected_at").execute().data or []
    total_flags = len(all_flags)
    pending_flags = sum(1 for f in all_flags if f.get("status") == "PENDING_REVIEW")
    resolved_flags = sum(1 for f in all_flags if f.get("status") == "RESOLVED")

    now = datetime.utcnow()
    overdue_flags = 0
    escalated_flags = 0
    for flag in all_flags:
        if flag.get("status") == "PENDING_REVIEW":
            detected_at_str = flag.get("detected_at")
            if detected_at_str:
                try:
                    detected_dt = datetime.fromisoformat(detected_at_str.replace("Z", "+00:00").split("+")[0])
                    elapsed_hours = (now - detected_dt).total_seconds() / 3600.0
                    if elapsed_hours >= 72.0:
                        overdue_flags += 1
                        escalated_flags += 1
                    elif elapsed_hours >= 48.0:
                        escalated_flags += 1
                except Exception:
                    pass

    # Applications stats
    all_applications = supabase.table("applications").select("status, scheme_id").execute().data or []
    total_applications = len(all_applications)
    submitted_applications = sum(1 for a in all_applications if a.get("status") == "SUBMITTED")
    approved_applications = sum(1 for a in all_applications if a.get("status") == "APPROVED")

    # Scheme breakdown
    schemes = supabase.table("schemes").select("scheme_id, name, department").execute().data or []
    scheme_app_counts = {}
    for app in all_applications:
        sid = app.get("scheme_id")
        scheme_app_counts[sid] = scheme_app_counts.get(sid, 0) + 1

    scheme_stats = []
    for s in schemes:
        scheme_stats.append({
            "scheme_id": s["scheme_id"],
            "name": s["name"],
            "department": s.get("department", ""),
            "application_count": scheme_app_counts.get(s["scheme_id"], 0),
        })

    # District breakdown
    district_breakdown = {}
    for f in all_families:
        d = f.get("district") or "Unknown"
        district_breakdown[d] = district_breakdown.get(d, 0) + 1

    return {
        "family_stats": {
            "total": total_families,
            "verified": verified_families,
            "flagged": flagged_families,
            "pending_verification": pending_families,
            "draft": draft_families,
        },
        "member_stats": {
            "total": total_members,
            "verified": verified_members,
            "pending_review": pending_members,
            "flagged": flagged_members,
        },
        "case_stats": {
            "total_duplicate_flags": total_flags,
            "pending_review": pending_flags,
            "resolved": resolved_flags,
            "overdue": overdue_flags,
            "escalated": escalated_flags,
        },
        "application_stats": {
            "total": total_applications,
            "submitted": submitted_applications,
            "approved": approved_applications,
        },
        "scheme_breakdown": scheme_stats,
        "district_breakdown": district_breakdown,
    }


@router.get("/me")
def get_officer_profile(user=Depends(get_current_user)):
    """Return the current officer's profile from the DB."""
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Officer role required")

    result = supabase.table("officers").select("*").eq("officer_id", user["citizen_ref"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Officer record not found")

    return result.data[0]
