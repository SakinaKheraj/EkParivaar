# EkParivaar API Contract — Frontend & Backend Specification

Base URL (once deployed): set as an env var in the React app, e.g. `VITE_API_URL`.
For local dev before backend is deployed, use `http://localhost:8000`.

All authenticated requests need: `Authorization: Bearer <access_token>` (token comes back from `/families/register-head` or `/auth/login`).

---

### 1. Verify identity (used inside the registration form)
`POST /ekyc/verify`
```json
// request
{ "aadhaar_number": "111122223333", "otp": "123456" }

// response 200
{ "citizen_ref": "uuid", "full_name": "Ramesh Patel", "dob": "1978-03-12", "gender": "M", "aadhaar_last4": "3333" }

// response 401/404 on bad OTP or unknown Aadhaar — show an error state
```

### 2. Register the head of household → creates the family
`POST /families/register-head`
```json
// request
{ "aadhaar_number": "111122223333", "otp": "123456", "district": "Ahmedabad", "annual_income": 150000 }

// response 200
{ "family_id": "uuid", "head": { "full_name": "Ramesh Patel", "citizen_ref": "uuid" }, "access_token": "jwt..." }
```
Save `family_id` and `access_token` in app state — everything after this needs both.

### 3. Re-authenticate (when token expires)
`POST /auth/login`
```json
// request
{ "aadhaar_number": "111122223333", "otp": "123456" }

// response 200
{ "access_token": "jwt...", "citizen_ref": "uuid", "full_name": "Ramesh Patel", "family_ids": ["uuid"] }
```

### 4. Add a member
`POST /families/add-member`  (needs Authorization header)
```json
// request
{
  "family_id": "uuid",
  "aadhaar_number": "222233334444",
  "claimed_name": "Sunita Patel",
  "claimed_dob": "1982-07-04",
  "relationship_type": "spouse",
  "attributes": { "is_widow": false, "is_disabled": false, "has_land_holding": false }
}

// response 200
{ "member_id": "uuid", "verification_status": "GREEN", "age": 44, "duplicate_detected": false, "identity_mismatch": false }

// response 409 if this person is already in the family
```
**UI cue:** show a colored badge for `verification_status` (green/yellow/red). If `duplicate_detected` is true, show a clear warning — this is the fraud-detection moment to highlight in your demo.

### 5. Get family verification status
`GET /families/{family_id}/status`
```json
// response 200
{
  "family_id": "uuid",
  "overall_status": "VERIFIED",
  "members": [
    {
      "member_id": "...",
      "relationship_type": "head",
      "verification_status": "GREEN",
      "attributes": {},
      "citizens_registry": { "full_name": "Ramesh Patel", "dob": "1978-03-12" },
      ...
    }
  ]
}
```
Members now include `citizens_registry.full_name` and `citizens_registry.dob` — no separate lookup needed. Status is also persisted to the DB automatically.

### 6. Get audit trail (transparency timeline)
`GET /families/{family_id}/audit-trail`
```json
// response 200
{
  "family_id": "uuid",
  "entries": [
    { "log_id": 1, "field_changed": "member_added", "new_value": "Sunita Patel", "changed_by": "citizen-uuid", "reason": "initial registration", "timestamp": "..." },
    ...
  ]
}
```
This is your transparency differentiator — wire it up as a visual timeline in the UI.

### 7. View eligible schemes
`GET /schemes/eligible/{family_id}`
```json
// response 200
{
  "family_id": "uuid",
  "all_verified": true,
  "eligible_schemes": [
    { "scheme_id": "uuid", "name": "Ayushman-style Health Cover", "department": "Health", "eligible": true, "reason": "Meets all checked criteria" }
  ],
  "ineligible_schemes": [
    { "scheme_id": "uuid", "name": "Widow Pension Scheme", "department": "Social Justice", "eligible": false, "reason": "Scheme requires a widow member" }
  ]
}
```

### 8. Smart Welfare Maximizer & Entitlement Analytics
`GET /schemes/welfare-summary/{family_id}`
```json
// response 200
{
  "family_id": "uuid",
  "total_unlocked_annual_value": 525000,
  "formatted_unlocked_value": "₹5,25,000",
  "eligible_schemes_count": 2,
  "ineligible_schemes_count": 3,
  "department_breakdown": {
    "Health Department": 500000,
    "Education Department": 25000
  },
  "actionable_recommendations": [
    {
      "scheme_name": "Agriculture Input Subsidy",
      "potential_unlock_amount": 20000,
      "action_required": "Link agricultural land parcel records to unlock annual seed & fertilizer subsidy.",
      "impact_tag": "FARMER_SUPPORT"
    }
  ],
  "optimization_score": 75
}
```

### 9. Apply to a scheme
`POST /schemes/apply`  (needs Authorization header)
```json
// request
{ "family_id": "uuid", "scheme_id": "uuid" }

// response 200
{ "status": "SUBMITTED", "application_id": "uuid", "family_id": "uuid", "scheme_id": "uuid", "scheme_name": "Ayushman-style Health Cover" }
// response 409 if already applied
// response 403 if ineligible
```

### 10. GovLedger Cryptographic Audit Chain Verification
`GET /ledger/verify/{family_id}`
```json
// response 200
{
  "family_id": "uuid",
  "is_valid": true,
  "total_blocks": 5,
  "chain_status": "SECURE_AND_VERIFIED",
  "tampered_blocks_count": 0,
  "corrupted_log_ids": [],
  "last_block_hash": "c8fa3b7e4a5598...",
  "genesis_hash": "0000000000000000000000000000000000000000000000000000000000000000",
  "message": "GovLedger cryptographic verification passed. Zero data tampering detected."
}
```

### 11. Kinship & Fraud Conflict Graph API
`GET /families/{family_id}/network-graph`
```json
// response 200
{
  "family_id": "uuid",
  "nodes": [
    { "id": "fam_uuid", "label": "Family Household (Ahmedabad)", "type": "household", "status": "VERIFIED" },
    { "id": "mem_uuid", "label": "Ramesh Patel", "type": "citizen", "role": "head", "status": "GREEN", "aadhaar_last4": "3333" },
    { "id": "fam_conflict_uuid", "label": "Conflicting Household (Surat...)", "type": "household_conflict", "status": "FLAGGED" }
  ],
  "edges": [
    { "source": "fam_uuid", "target": "mem_uuid", "label": "HEAD", "status": "GREEN", "type": "kinship" },
    { "source": "fam_uuid", "target": "fam_conflict_uuid", "label": "CROSS-FAMILY DUPLICATE FRAUD", "status": "RED", "type": "fraud_conflict" }
  ],
  "total_nodes": 3,
  "total_edges": 2
}
```

### 12. Verifiable Digital QR Smart Card Payload
`GET /families/{family_id}/card-payload`
```json
// response 200
{
  "card_title": "Gujarat EkParivaar Smart Family ID",
  "family_id": "uuid",
  "head_name": "Ramesh Patel",
  "district": "Ahmedabad",
  "member_count": 3,
  "confidence_tier": "VERIFIED",
  "digital_signature": "E84E61F1DDC55401",
  "qr_code_content": "EKPARIVAAR|V1|uuid|Ramesh Patel|3|VERIFIED|E84E61F1DDC55401",
  "issuer": "Government of Gujarat — Citizen Welfare Portal"
}
```

### 13. Officer Login & Pending Reviews with 72h SLA
`POST /officer/login`
```json
// request
{ "name": "Amit Sharma" }

// response 200
{ "access_token": "jwt...", "officer": { "name": "Amit Sharma", "role": "Talati", "jurisdiction": "Ahmedabad" } }
```

`GET /officer/pending-reviews` (needs Authorization header: Bearer <officer_token>)
```json
// response 200
{
  "pending_reviews": [...],
  "duplicate_flags": [
    {
      "flag_id": "uuid",
      "status": "PENDING_REVIEW",
      "sla_status": "NORMAL",
      "sla_remaining_hours": 68.4,
      "assigned_jurisdiction_tier": "Talati (Local Jurisdiction)",
      "urgency": "STANDARD"
    }
  ],
  "total_pending_count": 4,
  "sla_breached_count": 0
}
```

### 14. Officer Resolve / Approve Member
`POST /officer/resolve/{member_id}` (needs Authorization header)
```json
// request
{ "verification_status": "GREEN", "reason": "Physical ration card and local inquiry verified by Talati" }

// response 200
{ "member_id": "uuid", "new_status": "GREEN", "reason": "...", "ledger_committed": true }
```

### 15. Record Document Storage URL
`POST /documents/record` (needs Authorization header)
```json
// request
{ "member_id": "uuid", "doc_type": "marriage_cert", "file_url": "https://supabase.../doc.pdf" }
```

---

## Pages your friend needs to build (suggested order, matches build plan)

1. **Landing / register head** — Aadhaar + OTP + district + income form → calls #1 then #2
2. **Add family members** — repeatable form with optional attributes → calls #4, shows tier badge live
3. **Family status page** — calls #5, shows members with names/DOBs and a timeline via #6
4. **Eligible schemes dashboard** — calls #7 for the list, #8 for eligibility check, "Apply" button wired to #9
5. **Officer panel** — login via #11, work queue via #12, approve/reject via #13

## Test data to use while building (before your own real family exists)
Use the plaintext Aadhaar numbers from `sql/seed.sql` — e.g. `111122223333` (Ramesh Patel, head) and `222233334444` (Sunita Patel, spouse). OTP is always `123456`. To demo the fraud flag live, add `666677778888` (Priya Joshi) to two different families. Officers: `Amit Sharma`, `Deepa Trivedi`, `Rajesh Kumar`.
