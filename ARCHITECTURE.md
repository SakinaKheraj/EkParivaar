# 🏛️ EkParivaar — System Architecture

> **Gujarat Unified Family ID & Civic Welfare Grid**  
> Complete End-to-End System Architecture Reference

---

## 📐 High-Level Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                    BROWSER (Citizen / Officer)                       ║
║              React 18 + Vite SPA  ─  http://localhost:5173           ║
╠══════════════════════════════════════════════════════════════════════╣
║  CITIZEN PORTAL                  │  OFFICER CONSOLE                  ║
║  • Dashboard & Welfare           │  • Role-filtered Review Queue     ║
║  • Family Roster & Add Member    │  • Case Detail & Adjudication     ║
║  • Schemes (1-Click Apply)       │  • District/State Analytics       ║
║  • Kinship Conflict Graph        │  • Dynamic case removal           ║
║  • GovLedger Audit Explorer      │                                   ║
║  • QR Smart Card                 │                                   ║
╚══════════════╤═══════════════════════════════════════════════════════╝
               │  REST API (JSON)  •  JWT Bearer Auth
               │  http://127.0.0.1:8000
╔══════════════▼═══════════════════════════════════════════════════════╗
║                  BACKEND: FastAPI + Uvicorn (Python 3.13)            ║
╠══════════════════════════════════════════════════════════════════════╣
║  /auth /ekyc    │  /families     │  /schemes    │  /officer /ledger  ║
║  • Citizen OTP  │  • Roster CRUD │  • Rule Eval │  • Queue mgmt      ║
║  • JWT issue    │  • Dedup Check │  • 1-Clk Apl │  • SHA-256 Chain   ║
║  • Officer PIN  │  • KYC verify  │  • Welfare ∑ │  • SLA Escalation  ║
╚══════════════╤═══════════════════════════════════════════════════════╝
               │  Supabase REST Client
               │  (SUPABASE_URL + ANON_KEY)
╔══════════════▼═══════════════════════════════════════════════════════╗
║              DATABASE: Supabase (Hosted PostgreSQL)                  ║
╠══════════════════════════════════════════════════════════════════════╣
║  citizens_registry  │  families  │  family_members  │  audit_log     ║
║  duplicate_flags    │  schemes   │  applications    │  officers       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🗺️ Frontend Page Map (React SPA)

```
App.jsx (State-based Router — no react-router)
│
├── / (LandingPage)
│     Public. Shows CTA buttons to login or view schemes.
│
├── /dashboard (CitizenDashboard — tab: "Household Overview")
│     Auth: Citizen JWT. Shows metrics, roster, GovLedger log, welfare.
│
├── /requests (CitizenDashboard — tab: "Statutory Requests & Claims")
│     Auth: Citizen JWT. Shows scheme applications + officer decisions.
│
├── /members (MembersPage)
│     Auth: Citizen JWT. Full roster table + Add Member (Head only).
│     → Backend enforces 403 for non-head. Frontend also checks is_head.
│     → Offline fallback: simulates member locally if backend down.
│
├── /schemes (SchemesPage)
│     Auth: Citizen JWT. Smart Welfare Maximizer + 1-Click Apply.
│
├── /kinship (KinshipGraphPage)
│     Auth: Citizen JWT. Head-anchored network graph. Fraud bridges.
│
├── /smart-card (SmartCardPage)
│     Auth: Citizen JWT. HMAC-signed QR payload download.
│
├── /audit (GovLedgerAuditPage)
│     Auth: Citizen JWT. SHA-256 Merkle block explorer + chain verify.
│
├── /officer-queue (OfficerQueuePage)
│     Auth: Officer PIN. Role-filtered cases. Inline Approve/Reject.
│     → Talati: ward cases   Mamlatdar: 72h escalations   Collector: →analytics
│
├── /officer-case (OfficerCaseDetailPage)
│     Auth: Officer PIN. Full adjudication form → GovLedger commit.
│
├── /officer-decision (OfficerDecisionPage)
│     Auth: Officer PIN. Decision confirmation summary.
│
└── /officer-analytics (OfficerAnalyticsPage)
      Auth: Officer PIN. District & State entitlement grid.
```

---

## ⚙️ Backend API Reference (FastAPI)

```
/auth & /ekyc
├── POST /ekyc/verify           Verify Aadhaar + OTP → citizen data
├── POST /auth/login            Citizen login → JWT token
└── POST /officer/login         Officer name + PIN → officer session

/families
├── GET  /families/me           Self-lookup via JWT (anti-IDOR)
├── POST /families/register-head  Register new household (adult 18+ check)
├── POST /families/{id}/members   Add member (Head-only, cross-dedup)
├── GET  /families/{id}/status    Roster + verification tiers
├── GET  /families/{id}/network-graph  Kinship + fraud bridge graph
├── GET  /families/{id}/card-payload   HMAC QR smart card
└── GET  /families/{id}/audit-trail    GovLedger block sequence

/schemes
├── GET  /schemes/              Full scheme catalog
├── GET  /schemes/eligible/{id} Eligibility against household data
├── GET  /schemes/welfare-summary/{id}  Total unlocked annual value
└── POST /schemes/apply         1-Click apply + GovLedger seal

/officer
├── GET  /officer/pending-reviews  Jurisdiction-filtered queue
├── POST /officer/resolve/{id}     Approve/Reject → GovLedger + citizen notice
├── POST /officer/escalate/{id}    Talati → Mamlatdar SLA escalation
└── GET  /officer/analytics        District/State stats grid

/ledger
├── GET  /ledger/verify/{id}    Traverse + validate SHA-256 Merkle chain
└── POST /ledger/append         Internal: auto-called on every civic event
```

---

## 🗄️ Database Schema

```
citizens_registry             ← UIDAI Identity Source of Truth
  citizen_id    UUID PK
  citizen_ref   TEXT UNIQUE    ← used in JWT claims (not aadhaar directly)
  full_name     TEXT
  aadhaar_hash  TEXT           ← SHA-256 of raw aadhaar (never stored plain)
  aadhaar_last4 TEXT
  dob           DATE
  gender        TEXT           M / F / O
  district      TEXT
  kyc_verified  BOOLEAN
  mobile_number TEXT

families                      ← One record per registered household
  family_id     UUID PK
  head_citizen_ref TEXT FK → citizens_registry.citizen_ref
  district      TEXT
  annual_income INT
  status        TEXT           DRAFT / VERIFIED / FLAGGED
  verified_at   TIMESTAMP
  created_at    TIMESTAMP

family_members                ← Many-to-one: citizen in family
  member_id     UUID PK
  family_id     UUID FK → families.family_id
  citizen_ref   TEXT FK → citizens_registry.citizen_ref
  relationship_type TEXT       head / spouse / son / daughter / parent
  verification_status TEXT     GREEN / YELLOW / RED
  attributes    JSONB          {is_widow, is_disabled, has_land_holding}
  removed_at    TIMESTAMP      soft-delete for safe lifecycle ops

duplicate_flags               ← Cross-household collision + 72h SLA
  flag_id           UUID PK
  citizen_ref       TEXT FK
  family_id_a       UUID FK
  family_id_b       UUID FK
  similarity_score  FLOAT      1.0 = exact aadhaar match
  sla_status        TEXT       PENDING / BREACHED_ESCALATED / RESOLVED
  sla_remaining_hours INT
  resolved_by       TEXT
  created_at        TIMESTAMP

schemes                       ← Welfare rule engine metadata
  scheme_id         UUID PK
  name              TEXT
  description       TEXT
  eligibility_rules JSONB      {max_income: 300000, min_members: 2, ...}
  annual_value      INT
  category          TEXT       health / education / housing / agriculture

applications                  ← Citizen scheme applications
  application_id UUID PK
  family_id      UUID FK
  scheme_id      UUID FK
  status         TEXT          APPLIED / ACTIVE / REJECTED
  applied_at     TIMESTAMP

officers                      ← Revenue department officers
  officer_id   UUID PK
  name         TEXT
  role         TEXT            Talati / Mamlatdar / District Collector
  desk         TEXT
  jurisdiction TEXT
  pin_hash     TEXT

audit_log                     ← Append-only GovLedger (never UPDATE/DELETE)
  log_id       UUID PK
  family_id    UUID FK
  member_id    UUID NULL FK
  field_changed TEXT
  old_value    TEXT
  new_value    TEXT
  changed_by   TEXT            citizen_ref or officer name
  reason       TEXT
  sha256_hash  TEXT            ← SHA256(event_data + parent_hash)
  parent_hash  TEXT            ← previous block's sha256_hash
  timestamp    TIMESTAMP
```

---

## 🔄 Key Data Flows

### 1. Citizen Login
```
Browser → POST /auth/login { aadhaar_number, otp:"123456" }
Backend → aadhaar_hash lookup in citizens_registry
        → OTP verified (mock: "123456")
        → JWT issued (sub=citizen_ref, role="citizen")
Frontend → stores token in localStorage
         → GET /families/me to resolve family_id + is_head
         → navigates to /dashboard
```

### 2. Add Member (GREEN path)
```
Head Citizen → POST /families/{id}/members { aadhaar, relationship }
Backend → citizens_registry lookup
        → Same-family duplicate check → no match
        → Cross-family duplicate check → no match
        → member inserted (verification_status="GREEN")
        → audit_log block appended (SHA-256 sealed)
Frontend → shows "✅ Member Verified & Added"
         → roster reloads with new member
```

### 3. Add Member (RED - Duplicate Fraud path)
```
Head Citizen → POST /families/{id}/members { aadhaar: "666677778888" }
Backend → citizens_registry lookup → found: Priya Joshi
        → Cross-family duplicate check → MATCH in other family
        → member inserted (verification_status="RED")
        → duplicate_flags record created (72h SLA starts)
        → audit_log block: "[CROSS-FAMILY DUPLICATE DETECTED]"
Frontend → shows "🔴 Duplicate Flagged" banner
         → Talati officer sees new case in /officer-queue
```

### 4. Officer Resolve Case → Citizen Feedback
```
Talati → OfficerQueuePage: clicks "Approve" on case row
       → handleQuickResolve():
           resolved case ID → localStorage.ekparivaar_resolved_cases
           adjudication record → localStorage.ekparivaar_adjudications
           case removed from table state (real-time)
Citizen (next dashboard load) →
       → CitizenDashboard reads ekparivaar_adjudications
       → Renders "Official Officer Adjudications" panel with:
           officer name, determination, timestamp, note
```

### 5. GovLedger SHA-256 Merkle Chain
```
Every civic event (register, add member, scheme apply, officer decision):
  new_block.sha256_hash = SHA256(
    family_id + field_changed + new_value + changed_by + parent_hash
  )
  new_block.parent_hash = previous_block.sha256_hash

Verification (GET /ledger/verify/{family_id}):
  → fetch audit_log ordered by timestamp
  → re-compute SHA-256 for each block
  → compare computed vs stored
  → return VALID (all match) or TAMPERED (mismatch at block N)
```

---

## 👥 Role-Based Access Control

| Role | Credentials | Landing | Queue Scope | Capabilities |
|------|-------------|---------|-------------|--------------|
| Citizen (Head) | Aadhaar + OTP `123456` | /dashboard | Own household | Read all + add members + apply schemes |
| Citizen (Member) | Aadhaar + OTP `123456` | /dashboard | Own household | Read-only (403 on add-member) |
| Talati | Name + PIN `1234` | /officer-queue | Ward-level cases | Approve / Reject / Escalate |
| Mamlatdar | Name + PIN `1234` | /officer-analytics | 72h escalations | Sub-divisional override |
| District Collector | Name + PIN `1234` | /officer-analytics | State-wide grid | Analytics + governance |

---

## 🔒 Security Controls

| Control | Implementation |
|---------|---------------|
| JWT Auth | python-jose HS256, 24h expiry |
| Aadhaar at rest | SHA-256 hashed — raw number never stored |
| Anti-IDOR | JWT sub claim verified against requested resource |
| Head-only add-member | Backend 403 + frontend UI gate |
| Adult head rule | Age ≥ 18 enforced on register-head |
| GovLedger tamper-evidence | Append-only SHA-256 Merkle chain |
| CORS | localhost:5173 whitelist only |
| Offline resilience | Frontend simulates member locally if backend down |
