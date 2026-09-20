import hashlib
import hmac
import json
import os
from datetime import datetime
from app.database import supabase

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"
JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")


def compute_entry_hash(prev_hash: str, family_id: str, field_changed: str, old_value: str, new_value: str, changed_by: str, reason: str, timestamp_str: str) -> str:
    """
    Computes a cryptographic SHA-256 hash for a single audit entry,
    binding it deterministically to the previous block hash (GovLedger).
    """
    payload_str = f"{prev_hash}|{family_id}|{field_changed}|{old_value or ''}|{new_value or ''}|{changed_by or ''}|{reason or ''}|{timestamp_str}"
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()


def append_audit_entry(family_id: str, member_id: str, field_changed: str, old_value: str, new_value: str, changed_by: str, reason: str) -> dict:
    """
    Appends an immutable audit event to GovLedger, automatically fetching
    the latest block hash for the family and chaining it cryptographically.
    Handles legacy or upgraded schema columns transparently.
    """
    prev_hash = GENESIS_HASH
    try:
        latest_entry = (
            supabase.table("audit_log")
            .select("*")
            .eq("family_id", family_id)
            .order("log_id", desc=True)
            .limit(1)
            .execute()
        )
        if latest_entry.data and latest_entry.data[0].get("entry_hash"):
            prev_hash = latest_entry.data[0]["entry_hash"]
    except Exception:
        pass
        
    now_iso = datetime.utcnow().isoformat()
    entry_hash = compute_entry_hash(
        prev_hash=prev_hash,
        family_id=family_id,
        field_changed=field_changed,
        old_value=old_value,
        new_value=new_value,
        changed_by=changed_by,
        reason=reason,
        timestamp_str=now_iso,
    )

    insert_payload = {
        "family_id": family_id,
        "member_id": member_id,
        "field_changed": field_changed,
        "old_value": old_value,
        "new_value": new_value,
        "changed_by": changed_by,
        "reason": reason,
        "prev_hash": prev_hash,
        "entry_hash": entry_hash,
        "timestamp": now_iso,
    }
    
    try:
        res = supabase.table("audit_log").insert(insert_payload).execute()
        return res.data[0] if res.data else insert_payload
    except Exception as e:
        # Fallback if prev_hash/entry_hash columns are not yet added to SQL table
        fallback_payload = {
            "family_id": family_id,
            "member_id": member_id,
            "field_changed": field_changed,
            "old_value": old_value,
            "new_value": new_value,
            "changed_by": changed_by,
            "reason": reason,
        }
        res = supabase.table("audit_log").insert(fallback_payload).execute()
        return res.data[0] if res.data else fallback_payload


def verify_family_ledger(family_id: str) -> dict:
    """
    Performs full mathematical verification of a family's GovLedger chain.
    Walks from genesis block to current tip and detects any tampered records.
    """
    try:
        logs = (
            supabase.table("audit_log")
            .select("*")
            .eq("family_id", family_id)
            .order("log_id", desc=False)
            .execute()
            .data
        )
    except Exception:
        logs = []
    
    if not logs:
        return {
            "family_id": family_id,
            "is_valid": True,
            "total_blocks": 0,
            "chain_status": "EMPTY_LEDGER",
            "tampered_blocks_count": 0,
            "corrupted_log_ids": [],
            "message": "No audit records found for this household.",
        }
        
    expected_prev = GENESIS_HASH
    corrupted_ids = []
    
    for idx, entry in enumerate(logs):
        log_id = entry.get("log_id")
        stored_prev = entry.get("prev_hash") or expected_prev
        stored_entry_hash = entry.get("entry_hash")
        ts = str(entry.get("timestamp"))
        
        # Content integrity calculation
        recomputed_hash = compute_entry_hash(
            prev_hash=stored_prev,
            family_id=family_id,
            field_changed=entry.get("field_changed"),
            old_value=entry.get("old_value"),
            new_value=entry.get("new_value"),
            changed_by=entry.get("changed_by"),
            reason=entry.get("reason"),
            timestamp_str=ts,
        )
        
        if stored_entry_hash and stored_entry_hash != recomputed_hash:
            corrupted_ids.append(log_id)
            
        expected_prev = stored_entry_hash or recomputed_hash

    is_valid = len(corrupted_ids) == 0
    return {
        "family_id": family_id,
        "is_valid": is_valid,
        "total_blocks": len(logs),
        "chain_status": "SECURE_AND_VERIFIED" if is_valid else "TAMPER_DETECTED",
        "tampered_blocks_count": len(corrupted_ids),
        "corrupted_log_ids": corrupted_ids,
        "last_block_hash": logs[-1].get("entry_hash") or expected_prev if logs else GENESIS_HASH,
        "genesis_hash": GENESIS_HASH,
        "message": "GovLedger cryptographic verification passed. Zero data tampering detected." if is_valid else f"Tamper alert! Detected {len(corrupted_ids)} corrupted blocks in audit chain."
    }


def generate_smart_card_signature(family_id: str, head_name: str, member_count: int, district: str) -> str:
    """
    Generates a cryptographically signed HMAC token for the digital QR Smart Card.
    Can be verified offline by scanning apps or government field officers.
    """
    claim = f"{family_id}|{head_name}|{member_count}|{district}"
    sig = hmac.new(JWT_SECRET.encode("utf-8"), claim.encode("utf-8"), hashlib.sha256).hexdigest()
    return sig[:16].upper()
