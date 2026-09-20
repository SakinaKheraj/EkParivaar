from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.security import hash_aadhaar, create_access_token
from app.schemas import EkycRequest

router = APIRouter(prefix="/auth", tags=["auth"])

MOCK_OTP = "123456"


@router.post("/login")
def login(payload: EkycRequest):
    """
    Re-authenticate a citizen who already registered.  Verifies OTP + Aadhaar,
    returns a fresh JWT.  Same mock-eKYC approach as initial registration.
    """
    if payload.otp != MOCK_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    aadhaar_hash = hash_aadhaar(payload.aadhaar_number)
    citizen = (
        supabase.table("citizens_registry")
        .select("citizen_ref, full_name")
        .eq("aadhaar_hash", aadhaar_hash)
        .execute()
    )
    if not citizen.data:
        raise HTTPException(status_code=404, detail="Identity not found in registry")

    citizen = citizen.data[0]

    # Find all families this citizen belongs to
    membership = (
        supabase.table("family_members")
        .select("family_id")
        .eq("citizen_ref", citizen["citizen_ref"])
        .is_("removed_at", "null")
        .execute()
    )

    family_ids = [m["family_id"] for m in membership.data]
    token = create_access_token(subject=citizen["citizen_ref"], role="citizen")
    return {
        "access_token": token,
        "citizen_ref": citizen["citizen_ref"],
        "full_name": citizen["full_name"],
        "family_id": family_ids[0] if family_ids else None,
        "family_ids": family_ids,
    }
