from datetime import date, datetime
from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.security import hash_aadhaar, create_access_token, get_current_user
from app.schemas import RegisterHeadRequest, AddMemberRequest
from app.ledger_core import append_audit_entry, generate_smart_card_signature

router = APIRouter(prefix="/families", tags=["families"])

MOCK_OTP = "123456"


@router.get("/me")
def get_my_family(user=Depends(get_current_user)):
    """
    Returns the authenticated citizen's own family membership.
    Uses the JWT sub claim (citizen_ref) to find family_id — prevents IDOR.
    """
    if user["role"] != "citizen":
        raise HTTPException(status_code=403, detail="Citizen role required")

    citizen_ref = user["citizen_ref"]

    # Find all active family memberships
    membership = (
        supabase.table("family_members")
        .select("family_id, relationship_type, verification_status")
        .eq("citizen_ref", citizen_ref)
        .is_("removed_at", "null")
        .execute()
    )

    citizen = (
        supabase.table("citizens_registry")
        .select("full_name, dob, gender, aadhaar_last4, mobile_number")
        .eq("citizen_ref", citizen_ref)
        .execute()
    )

    citizen_data = citizen.data[0] if citizen.data else {}
    family_ids = [m["family_id"] for m in membership.data]
    primary_family_id = family_ids[0] if family_ids else None

    # Find which family this citizen is head of
    head_family = (
        supabase.table("families")
        .select("family_id")
        .eq("head_citizen_ref", citizen_ref)
        .execute()
    )
    is_head = len(head_family.data) > 0

    return {
        "citizen_ref": citizen_ref,
        "full_name": citizen_data.get("full_name", ""),
        "aadhaar_last4": citizen_data.get("aadhaar_last4", ""),
        "dob": citizen_data.get("dob"),
        "gender": citizen_data.get("gender"),
        "mobile_number": citizen_data.get("mobile_number"),
        "family_id": primary_family_id,
        "family_ids": family_ids,
        "is_head": is_head,
        "relationship_in_family": membership.data[0]["relationship_type"] if membership.data else None,
    }


def _lookup_citizen(aadhaar_number: str):
    aadhaar_hash = hash_aadhaar(aadhaar_number)
    result = (
        supabase.table("citizens_registry")
        .select("*")
        .eq("aadhaar_hash", aadhaar_hash)
        .execute()
    )
    if not result.data:
        return None
    return result.data[0]


def _years_between(d: date, today: date) -> int:
    return today.year - d.year - ((today.month, today.day) < (d.month, d.day))


@router.post("/register-head")
def register_head(payload: RegisterHeadRequest):
    """Step 1 of the flow: head verifies via mock e-KYC, family record created."""
    if payload.otp != MOCK_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    citizen = _lookup_citizen(payload.aadhaar_number)
    if not citizen:
        raise HTTPException(status_code=404, detail="Identity not found in registry")

    # Government Security Edge Case: Head of Household must be an adult (18+)
    head_age = _years_between(date.fromisoformat(str(citizen["dob"])), date.today())
    if head_age < 18:
        raise HTTPException(status_code=400, detail="Head of household must be an adult (at least 18 years old)")

    family = (
        supabase.table("families")
        .insert({
            "head_citizen_ref": citizen["citizen_ref"],
            "status": "DRAFT",
            "district": payload.district,
            "annual_income": payload.annual_income,
        })
        .execute()
    )
    family_id = family.data[0]["family_id"]

    # Head is auto-added as a verified member of their own family
    head_member = supabase.table("family_members").insert({
        "family_id": family_id,
        "citizen_ref": citizen["citizen_ref"],
        "relationship_type": "head",
        "verification_status": "GREEN",
    }).execute()

    token = create_access_token(subject=citizen["citizen_ref"], role="citizen")

    # Cryptographic GovLedger Genesis Audit Entry
    append_audit_entry(
        family_id=family_id,
        member_id=head_member.data[0]["member_id"] if head_member.data else None,
        field_changed="family_created",
        old_value=None,
        new_value=f"Head: {citizen['full_name']} ({payload.district})",
        changed_by=citizen["citizen_ref"],
        reason="Household registration and e-KYC verification",
    )

    return {
        "family_id": family_id,
        "head": {"full_name": citizen["full_name"], "citizen_ref": citizen["citizen_ref"]},
        "access_token": token,
    }


def _process_add_member(family_id: str, payload: AddMemberRequest, user: dict):
    target_family_id = family_id or payload.family_id
    if not target_family_id:
        raise HTTPException(status_code=400, detail="family_id is required")

    # Statutory Restriction: Only Head of Household can add or edit members
    if user.get("role") == "citizen":
        fam_check = (
            supabase.table("families")
            .select("head_citizen_ref")
            .eq("family_id", target_family_id)
            .execute()
        )
        if fam_check.data and fam_check.data[0].get("head_citizen_ref") != user.get("citizen_ref"):
            raise HTTPException(
                status_code=403,
                detail="Statutory restriction: Only the Head of Household has legal authority to add or modify dependents."
            )

    citizen = _lookup_citizen(payload.aadhaar_number)
    if not citizen:
        raise HTTPException(status_code=404, detail="Identity not found in registry")

    rel_type = payload.relationship_type or payload.relationship_to_head or "dependent"

    # --- Identity cross-check: claimed vs verified ---
    identity_mismatch = False
    if payload.claimed_name and payload.claimed_name.strip().lower() != citizen["full_name"].strip().lower():
        identity_mismatch = True
    if payload.claimed_dob and str(payload.claimed_dob) != str(citizen["dob"]):
        identity_mismatch = True

    # --- Age calculation ---
    age = _years_between(date.fromisoformat(str(citizen["dob"])), date.today())

    # --- Same-family duplicate: already a member of this family? ---
    same_family = (
        supabase.table("family_members")
        .select("member_id")
        .eq("citizen_ref", citizen["citizen_ref"])
        .eq("family_id", target_family_id)
        .is_("removed_at", "null")
        .execute()
    )
    if same_family.data:
        raise HTTPException(status_code=409, detail="This person is already a member of this family")

    # --- Cross-family duplicate check: active member in a DIFFERENT family? ---
    existing = (
        supabase.table("family_members")
        .select("family_id")
        .eq("citizen_ref", citizen["citizen_ref"])
        .neq("family_id", target_family_id)
        .is_("removed_at", "null")
        .execute()
    )
    is_duplicate = len(existing.data) > 0

    if is_duplicate:
        tier = "RED"
    elif identity_mismatch:
        tier = "YELLOW"
    else:
        tier = "GREEN"

    member = (
        supabase.table("family_members")
        .insert({
            "family_id": target_family_id,
            "citizen_ref": citizen["citizen_ref"],
            "relationship_type": rel_type,
            "verification_status": tier,
            "attributes": payload.attributes or {},
        })
        .execute()
    )

    if is_duplicate:
        for row in existing.data:
            supabase.table("duplicate_flags").insert({
                "citizen_ref": citizen["citizen_ref"],
                "family_id_a": target_family_id,
                "family_id_b": row["family_id"],
                "similarity_score": 1.0,
            }).execute()

    # Append immutable event to GovLedger hash chain
    append_audit_entry(
        family_id=target_family_id,
        member_id=member.data[0]["member_id"],
        field_changed="member_added",
        old_value=None,
        new_value=f"{citizen['full_name']} ({rel_type}, {tier})",
        changed_by=user["citizen_ref"],
        reason=f"Added as {rel_type}" + (" [CROSS-FAMILY DUPLICATE DETECTED]" if is_duplicate else ""),
    )

    return {
        "member_id": member.data[0]["member_id"],
        "full_name": citizen["full_name"],
        "verification_status": tier,
        "age": age,
        "duplicate_flag": is_duplicate,
        "duplicate_detected": is_duplicate,
        "identity_mismatch": identity_mismatch,
    }


@router.post("/add-member")
def add_member(payload: AddMemberRequest, user=Depends(get_current_user)):
    return _process_add_member(payload.family_id, payload, user)


@router.post("/{family_id}/members")
def add_member_by_path(family_id: str, payload: AddMemberRequest, user=Depends(get_current_user)):
    return _process_add_member(family_id, payload, user)


@router.get("/{family_id}/status")
def family_status(family_id: str):
    members = (
        supabase.table("family_members")
        .select("*, citizens_registry(full_name, dob, gender, aadhaar_last4)")
        .eq("family_id", family_id)
        .is_("removed_at", "null")
        .execute()
    )
    
    # Flatten citizen fields for simpler frontend consumption
    flattened_members = []
    for m in members.data:
        m_copy = dict(m)
        citizen = m.get("citizens_registry") or {}
        m_copy["full_name"] = citizen.get("full_name", "")
        m_copy["dob"] = citizen.get("dob", "")
        m_copy["gender"] = citizen.get("gender", "")
        m_copy["aadhaar_last4"] = citizen.get("aadhaar_last4", "")
        flattened_members.append(m_copy)

    statuses = [m["verification_status"] for m in flattened_members]
    if all(s == "GREEN" for s in statuses) and statuses:
        overall = "VERIFIED"
        confidence_tier = "GREEN"
    elif "RED" in statuses:
        overall = "FLAGGED"
        confidence_tier = "RED"
    else:
        overall = "PENDING_VERIFICATION"
        confidence_tier = "YELLOW"

    # Persist computed status back to the families table
    update_payload = {"status": overall}
    if overall == "VERIFIED":
        update_payload["verified_at"] = datetime.utcnow().isoformat()
    supabase.table("families").update(update_payload).eq("family_id", family_id).execute()

    return {
        "family_id": family_id,
        "overall_status": overall,
        "confidence_tier": confidence_tier,
        "members": flattened_members,
    }


@router.get("/{family_id}/network-graph")
def get_network_graph(family_id: str):
    """
    Kinship & Fraud Conflict Graph API:
    Builds the node-link graph data for interactive visual representation
    showing household members, relationships, and cross-family conflict bridges.
    """
    fam = supabase.table("families").select("*, citizens_registry(full_name)").eq("family_id", family_id).execute()
    if not fam.data:
        raise HTTPException(status_code=404, detail="Family not found")
        
    members = (
        supabase.table("family_members")
        .select("*, citizens_registry(full_name, dob, gender, aadhaar_last4)")
        .eq("family_id", family_id)
        .is_("removed_at", "null")
        .execute()
        .data
    )
    
    flags = (
        supabase.table("duplicate_flags")
        .select("*, citizens_registry(full_name)")
        .or_(f"family_id_a.eq.{family_id},family_id_b.eq.{family_id}")
        .execute()
        .data
    )

    nodes = [
        {
            "id": f"fam_{family_id}",
            "label": f"Family Household ({fam.data[0].get('district', 'Gujarat')})",
            "type": "household",
            "status": fam.data[0].get("status", "DRAFT"),
        }
    ]
    edges = []

    for m in members:
        cit = m.get("citizens_registry") or {}
        m_id = m["member_id"]
        node_status = m["verification_status"]
        nodes.append({
            "id": f"mem_{m_id}",
            "label": cit.get("full_name", "Citizen"),
            "type": "citizen",
            "role": m.get("relationship_type", "member"),
            "status": node_status,
            "dob": cit.get("dob"),
            "aadhaar_last4": cit.get("aadhaar_last4"),
        })
        edges.append({
            "source": f"fam_{family_id}",
            "target": f"mem_{m_id}",
            "label": m.get("relationship_type", "member").upper(),
            "status": node_status,
            "type": "kinship",
        })

    for flag in flags:
        other_fam_id = flag["family_id_b"] if flag["family_id_a"] == family_id else flag["family_id_a"]
        other_node_id = f"fam_{other_fam_id}"
        if not any(n["id"] == other_node_id for n in nodes):
            nodes.append({
                "id": other_node_id,
                "label": f"Conflicting Household ({other_fam_id[:8]}...)",
                "type": "household_conflict",
                "status": "FLAGGED",
            })
        edges.append({
            "source": f"fam_{family_id}",
            "target": other_node_id,
            "label": "CROSS-FAMILY DUPLICATE FRAUD",
            "status": "RED",
            "type": "fraud_conflict",
            "flag_id": flag.get("flag_id"),
        })

    return {
        "family_id": family_id,
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
    }


@router.get("/{family_id}/card-payload")
def get_card_payload(family_id: str):
    """
    Verifiable Digital QR Smart Card Generator:
    Produces a cryptographically signed HMAC payload for official Gujarat
    EkParivaar Smart Card scanning & verification.
    """
    fam = supabase.table("families").select("*, citizens_registry(full_name)").eq("family_id", family_id).execute()
    if not fam.data:
        raise HTTPException(status_code=404, detail="Family not found")
        
    family_row = fam.data[0]
    head_name = (family_row.get("citizens_registry") or {}).get("full_name", "Household Head")
    district = family_row.get("district", "Ahmedabad")
    status = family_row.get("status", "VERIFIED")
    
    member_count = (
        supabase.table("family_members")
        .select("member_id", count="exact")
        .eq("family_id", family_id)
        .is_("removed_at", "null")
        .execute()
        .count or 1
    )

    digital_signature = generate_smart_card_signature(
        family_id=family_id,
        head_name=head_name,
        member_count=member_count,
        district=district,
    )

    qr_code_content = f"EKPARIVAAR|V1|{family_id}|{head_name}|{member_count}|{status}|{digital_signature}"

    return {
        "card_title": "Gujarat EkParivaar Smart Family ID",
        "family_id": family_id,
        "head_name": head_name,
        "district": district,
        "member_count": member_count,
        "confidence_tier": status,
        "digital_signature": digital_signature,
        "qr_code_content": qr_code_content,
        "issued_at": family_row.get("created_at") or datetime.utcnow().isoformat(),
        "issuer": "Government of Gujarat — Citizen Welfare Portal",
    }


@router.get("/{family_id}/audit-trail")
def get_audit_trail(family_id: str):
    """Returns the full audit history for a family with cryptographic hashes, newest first."""
    logs = (
        supabase.table("audit_log")
        .select("*")
        .eq("family_id", family_id)
        .order("log_id", desc=True)
        .execute()
    )
    return {
        "family_id": family_id,
        "entries": logs.data,
        "audit_trail": logs.data,
    }
