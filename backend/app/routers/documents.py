from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.security import get_current_user
from app.schemas import DocumentRecordRequest

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/record")
def record_document(payload: DocumentRecordRequest, user=Depends(get_current_user)):
    """
    Records a document reference after the frontend uploads directly to
    Supabase Storage.  Accepts the resulting file_url — no multipart
    handling needed on the backend.
    """
    # Verify the member exists
    member = (
        supabase.table("family_members")
        .select("family_id")
        .eq("member_id", payload.member_id)
        .execute()
    )
    if not member.data:
        raise HTTPException(status_code=404, detail="Member not found")

    doc = (
        supabase.table("documents")
        .insert({
            "member_id": payload.member_id,
            "doc_type": payload.doc_type,
            "file_url": payload.file_url,
        })
        .execute()
    )

    # Audit trail
    supabase.table("audit_log").insert({
        "family_id": member.data[0]["family_id"],
        "member_id": payload.member_id,
        "field_changed": "document_uploaded",
        "old_value": None,
        "new_value": f"{payload.doc_type}: {payload.file_url}",
        "changed_by": user["citizen_ref"],
        "reason": "document upload",
    }).execute()

    return doc.data[0]
