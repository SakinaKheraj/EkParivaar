from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.security import hash_aadhaar
from app.schemas import EkycRequest

router = APIRouter(prefix="/ekyc", tags=["ekyc"])

MOCK_OTP = "123456"  # fixed demo OTP so your live demo never depends on real SMS


@router.post("/verify")
def verify_ekyc(payload: EkycRequest):
    """
    Simulates a UIDAI e-KYC call. In real life this would hit a government
    API; here it looks up our own `citizens_registry` table, which stands in
    for the national identity source. Returns the verified identity fields —
    never trust client-submitted name/DOB for identity, only what this
    endpoint returns.
    """
    if payload.otp != MOCK_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    aadhaar_hash = hash_aadhaar(payload.aadhaar_number)
    result = (
        supabase.table("citizens_registry")
        .select("*")
        .eq("aadhaar_hash", aadhaar_hash)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="No matching identity record found")

    citizen = result.data[0]
    return {
        "citizen_ref": citizen["citizen_ref"],
        "full_name": citizen["full_name"],
        "dob": citizen["dob"],
        "gender": citizen["gender"],
        "aadhaar_last4": citizen["aadhaar_last4"],
    }
