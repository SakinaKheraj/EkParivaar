# EkParivaar (Gujarat Unified Family ID) — Verified-at-Source, Transparent-by-Design

## Problem Statement (refined)

> Build a Family ID system for Gujarat that assigns each household a single verified identity, used to determine eligibility across government welfare schemes — without inheriting the two failure modes seen in existing state implementations: **(1)** dependency on a pre-existing, error-prone database like the ration card system (UP), which excludes non-holders and inherits legacy fraud, and **(2)** unverified self-declared data with opaque, slow correction processes (Haryana), which has caused real documented harm to citizens.

**Core differentiator:** every fact in the system is either verified at the point of entry or explicitly marked as pending verification with a visible status — nothing is silently trusted, and nothing is silently "fixed later."

---

## Tech Stack Recommendation

Given the 8-hour window and your existing stack (Flutter/BLoC, FastAPI, Firebase, React, Spring Boot, Kafka, Docker, AWS EC2), here's what to actually use and what to skip:

| Layer | Choice | Why |
|---|---|---|
| **Backend** | **FastAPI (Python)** | You already know it (used in Seekr). Fastest to write validation rules, an eligibility rule engine, and mock external APIs. Auto-generated Swagger docs double as your API documentation for judges. |
| **Frontend** | **React** (not Flutter) | You're deploying on Vercel, which is built around React/Next.js — near-zero deploy friction. Flutter is for mobile; a judged demo needs a browser-visible dashboard, fast. |
| **Database** | **PostgreSQL via Supabase** | Relational integrity matters here (family↔member relationships, audit trail, uniqueness constraints for fraud detection). Supabase gives you hosted Postgres + file storage (for certificate uploads) + a ready-made admin table view you can literally use as your "officer verification panel" without building one from scratch — huge time saver in 8 hours. |
| **Auth** | **Plain JWT (FastAPI + python-jose)** | JWT tokens issued directly by the backend after mock e-KYC verification. No third-party auth service — one less dependency, one less dashboard to manage, and the mock OTP flow already simulates real Aadhaar-linked mobile verification. |
| **Deployment** | Frontend → **Vercel**. Backend → **Render or Railway** (free tier, handles a persistent Python process better than serverless for this much stateful logic). DB → **Supabase** (already hosted). | Keeps Vercel for what it's good at; avoids fighting serverless cold-starts for a stateful verification workflow. |
| **Skip for this hackathon** | Spring Boot, Kafka, Flutter | Kafka is for high-throughput streaming — you don't have that problem here, and the setup cost alone would eat 2+ of your 8 hours. Spring Boot is slower to iterate in than FastAPI for a solo/small-team sprint. Add a `Dockerfile` at the end only if time allows — it signals production-readiness to judges cheaply. |

---

## System Flow

1. **Head registers** via Aadhaar number + mock OTP → mock e-KYC service returns verified name/DOB/gender/photo → family record created in `DRAFT` status, head is `VERIFIED`.
2. **Head adds each member** with relationship type + that member's own Aadhaar number → independent e-KYC pull per member (never trust the head's word for someone else's identity).
3. **Automated cross-check**: claimed age/name vs e-KYC data. Mismatch → auto-flag.
4. **Relationship proof**: birth/marriage certificate upload (stored in Supabase Storage) + a duplicate check — is this Aadhaar number already claimed as a dependent in a *different* family? This cross-family check is your core fraud-detection feature.
5. **Confidence tiering**: 🟢 Green (auto-pass) / 🟡 Yellow (flagged for officer review) / 🔴 Red (blocked, duplicate or hard mismatch).
6. **Officer review** (simulate with an admin role in your app, or literally use the Supabase table editor as your "Talati console" for the demo) — only Yellow/Red cases need this. SLA timer starts; if unresolved, status escalates.
7. **Family ID issued** only once every member is Green or officer-approved.
8. **Eligibility dashboard**: rule engine evaluates the verified family record against a `schemes` table (rules stored as data, not hardcoded) → shows Eligible / Not Eligible (with reason) / Already Availing.
9. **One-click apply**: pre-filled application from verified data, written to `applications`.
10. **Amendments** (birth, death, marriage-out, income change, address change): never a silent edit — always a tracked amendment request that re-runs the relevant verification step and logs to the audit trail.

---

## Database Schema (PostgreSQL)

```sql
-- Simulates the national identity registry (mock "Aadhaar" source)
CREATE TABLE citizens_registry (
    citizen_ref     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aadhaar_hash    TEXT UNIQUE NOT NULL,        -- SHA-256 hash, never store raw Aadhaar
    aadhaar_last4   CHAR(4) NOT NULL,             -- only last 4 digits ever displayed
    full_name       TEXT NOT NULL,
    dob             DATE NOT NULL,
    gender          TEXT,
    photo_url       TEXT,
    mobile_number   TEXT
);

CREATE TABLE families (
    family_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    head_citizen_ref UUID REFERENCES citizens_registry(citizen_ref),
    status           TEXT CHECK (status IN ('DRAFT','PENDING_VERIFICATION','VERIFIED','FLAGGED')) DEFAULT 'DRAFT',
    district         TEXT,
    created_at       TIMESTAMPTZ DEFAULT now(),
    verified_at      TIMESTAMPTZ
);

CREATE TABLE family_members (
    member_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id           UUID REFERENCES families(family_id),
    citizen_ref         UUID REFERENCES citizens_registry(citizen_ref),
    relationship_type   TEXT NOT NULL,            -- spouse/child/parent/dependent
    verification_status TEXT CHECK (verification_status IN ('GREEN','YELLOW','RED')) DEFAULT 'YELLOW',
    added_at            TIMESTAMPTZ DEFAULT now(),
    removed_at          TIMESTAMPTZ,               -- soft delete only (death, marriage-out)
    removal_reason      TEXT,
    UNIQUE (citizen_ref, family_id)
);

-- Fraud detection: a citizen claimed as a dependent in more than one active family
CREATE TABLE duplicate_flags (
    flag_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_ref      UUID REFERENCES citizens_registry(citizen_ref),
    family_id_a      UUID REFERENCES families(family_id),
    family_id_b      UUID REFERENCES families(family_id),
    similarity_score NUMERIC,
    status           TEXT CHECK (status IN ('PENDING_REVIEW','RESOLVED')) DEFAULT 'PENDING_REVIEW',
    detected_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
    document_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID REFERENCES family_members(member_id),
    doc_type     TEXT,               -- birth_cert / marriage_cert / death_cert
    file_url     TEXT,
    verified_by  UUID,               -- officer id, nullable until reviewed
    verified_at  TIMESTAMPTZ,
    uploaded_at  TIMESTAMPTZ DEFAULT now()
);

-- Append-only. Enforce with a DB trigger/permission that blocks UPDATE and DELETE.
CREATE TABLE audit_log (
    log_id       BIGSERIAL PRIMARY KEY,
    family_id    UUID REFERENCES families(family_id),
    member_id    UUID,
    field_changed TEXT,
    old_value    TEXT,
    new_value    TEXT,
    changed_by   TEXT,               -- 'citizen' or officer id
    reason       TEXT,
    timestamp    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE amendments (
    amendment_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id      UUID REFERENCES families(family_id),
    member_id      UUID,
    amendment_type TEXT CHECK (amendment_type IN ('ADD','REMOVE','EDIT')),
    payload        JSONB,
    status         TEXT CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
    sla_deadline   TIMESTAMPTZ,
    submitted_at   TIMESTAMPTZ DEFAULT now(),
    resolved_at    TIMESTAMPTZ,
    resolved_by    UUID
);

CREATE TABLE officers (
    officer_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT,
    role        TEXT,                -- Talati / Mamlatdar / District
    jurisdiction TEXT
);

CREATE TABLE schemes (
    scheme_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT,
    department  TEXT,
    eligibility_rules JSONB,         -- e.g. {"max_income": 180000, "category": ["BPL"], "min_members": 1}
    benefit_description TEXT
);

CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id      UUID REFERENCES families(family_id),
    scheme_id      UUID REFERENCES schemes(scheme_id),
    status         TEXT CHECK (status IN ('SUBMITTED','APPROVED','REJECTED')) DEFAULT 'SUBMITTED',
    applied_at     TIMESTAMPTZ DEFAULT now(),
    decided_at     TIMESTAMPTZ,
    UNIQUE (family_id, scheme_id)     -- prevents duplicate applications to the same scheme
);
```

---

## Edge Cases to Handle

| Edge case | Handling |
|---|---|
| Same person claimed by two families | `duplicate_flags` triggered on insert; blocks Family ID issuance until officer resolves |
| Minor shown with independent income | Validation rule at entry: reject unless explicitly flagged as an exception with reason |
| Head of household dies | Amendment marks head as removed; succession rule (e.g. eldest adult member or explicit nomination) reassigns `head_citizen_ref` |
| Adult child marries and moves out | Creates a **new** family record for them (not deletion) — they become head of their own family, old record marks them `removed_at` with reason `marriage-out` |
| Income rises above a scheme threshold after benefit was already granted | Flagged for review, not silently revoked — citizen is notified before any benefit change |
| Officer misses SLA deadline | Scheduled job auto-escalates the amendment/verification to the next level in the hierarchy |
| Citizen has no smartphone/internet | Conceptually: assisted registration via a Common Service Centre (CSC) kiosk — worth one slide even if not built |
| Duplicate application to the same scheme | Blocked by the `UNIQUE (family_id, scheme_id)` constraint |
| Address change crosses district boundary | Triggers jurisdiction reassignment for which officer reviews future amendments |

---

## Security & Transparency

- **Never store raw Aadhaar numbers** — only a SHA-256 hash for matching, plus last 4 digits for display (mirrors the real legal requirement that Aadhaar numbers can't be shown except the last four digits).
- **Append-only audit log** — enforce at the DB level (revoke UPDATE/DELETE on `audit_log`), not just in application code.
- **Role-based access**: citizens see only their own family; officers see only their jurisdiction; nobody can edit the audit trail, including admins.
- **JWT-based sessions** (signed by FastAPI, no external auth provider) + mock OTP login; HTTPS everywhere.
- **Citizen-visible status timeline** for every family and every amendment — this is your transparency differentiator, make sure it's visibly in the demo UI, not just in the DB.
- **Explainable eligibility** — every "not eligible" result shows the exact rule and value that failed, not just a rejection.

---

## Build Priority for 8 Hours

**MVP (must-have, hours 0–6):**
1. Mock citizens_registry + e-KYC endpoint
2. Family/member registration with identity cross-check
3. Green/Yellow/Red tiering + duplicate detection
4. Basic officer approval screen (or use Supabase table editor directly)
5. Eligibility rule engine against 3–4 seeded schemes
6. Citizen dashboard: family status + eligible schemes + apply button

**Stretch (hours 6–8, if time remains):**
- Amendment workflow (add/remove member, income edit)
- SLA countdown + auto-escalation
- Audit trail visible in UI as a timeline
- Dockerfile for extra polish points

---

## What to Show in the Demo/Video

1. Register a family → show instant identity verification (green)
2. Add a member whose Aadhaar is already claimed elsewhere → show the duplicate flag firing live
3. Show the eligibility dashboard populate automatically once verified
4. Apply to a scheme in one click with pre-filled data
5. Make an amendment (e.g. income update) and show it enter a tracked, visible status — not a silent edit
