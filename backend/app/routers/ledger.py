from fastapi import APIRouter, HTTPException
from app.ledger_core import verify_family_ledger
from app.database import supabase

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("/verify/{family_id}")
def verify_ledger_endpoint(family_id: str):
    """
    GovLedger Verification Endpoint:
    Cryptographically walks the entire SHA-256 hash-chain for a household
    and verifies that zero database records have been manipulated post-facto.
    """
    # Verify the family exists
    fam = supabase.table("families").select("family_id").eq("family_id", family_id).execute()
    if not fam.data:
        raise HTTPException(status_code=404, detail="Family record not found")
        
    verification_result = verify_family_ledger(family_id)
    return verification_result
