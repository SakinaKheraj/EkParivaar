# 🏛️ EkParivaar (ગુજરાત એક પરિવાર)
### Verified-at-Source, Transparent-by-Design Unified Household Identity & Welfare Engine for Gujarat

> **EkParivaar** assigns every Gujarat household a single, verified digital identity to streamline welfare scheme delivery, eliminate ghost beneficiaries, and provide citizens with complete transparency through cryptographic audit trails.

---

## 🌟 Why EkParivaar? (Solving Real Policy Failures)

Existing state implementations face severe documented failures:
1. **Haryana PPP (Parivar Pehchan Patra)**: Relied on unverified self-declared data with opaque, 6–12 month dispute resolution, causing pensions to be mistakenly cut off.
2. **UP Family ID**: Dependent on legacy, error-prone ration card databases, inheriting decades of ghost entries and excluding non-cardholders.

**EkParivaar Core Differentiators:**
* 🔒 **Verified-at-Source**: Identity and age are verified against trusted identity registries (mock UIDAI e-KYC); nothing is silently trusted.
* 🛡️ **GovLedger Cryptographic Audit Trail**: Every household change is chained using SHA-256 Merkle hashes, making records mathematically tamper-evident.
* 🕸️ **Cross-Household Duplicate Fraud Engine**: Instant cross-family duplicate detection flags multi-claim fraud (🔴 RED Flag).
* 🎯 **Smart Welfare Maximizer**: Evaluates household attributes against scheme rules as data, calculating unlocked financial entitlements (e.g. ₹5,25,000/yr) and offering actionable life recommendations.
* ⏱️ **72-Hour Citizen SLA & Auto-Escalation**: Unresolved citizen flags automatically escalate (*Talati → Mamlatdar → District Collector*).
* 🪪 **Verifiable Smart Card**: Generates a tamper-proof digital certificate and scannable QR payload with cryptographic HMAC signatures.

---

## 🏗️ Architecture & Technology Stack

```
[ Frontend: React (Vite) + Government Civic UI Theme ]
                        │  (REST API + JWT)
                        ▼
[ Backend: FastAPI (Python 3.13) + python-jose + Pydantic ]
   ├── e-KYC & Verification Router (/ekyc)
   ├── Household Lifecycle Router (/families)
   ├── Dynamic Scheme Rule Engine (/schemes)
   ├── GovLedger Cryptographic Verifier (/ledger)
   ├── Officer Work-Queue & SLA Router (/officer)
   └── Storage Reference Router (/documents)
                        │
                        ▼
[ Database & Storage: Supabase (Hosted PostgreSQL) ]
   ├── citizens_registry (Mock Aadhaar Holder Source)
   ├── families & family_members (Confidence-Tiered Graph)
   ├── duplicate_flags (Cross-Family Fraud Alerts + 72h SLA)
   ├── schemes & applications (Rule-Engine Metadata)
   ├── audit_log (Append-Only GovLedger SHA-256 Hash Chain)
   └── Supabase Storage (Document Buckets)
```

---

## 🚀 Quickstart & Local Setup

### 1. Database Setup (Supabase)
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard).
2. Run `backend/sql/schema.sql` to initialize tables and indexes.
3. Run `backend/sql/seed.sql` to populate mock citizens, welfare schemes, and test officers.

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment (Python 3.13 recommended)
py -3.13 -m venv venv
.\venv\Scripts\activate   # Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload --port 8000
```
* **Interactive Swagger Docs**: `http://localhost:8000/docs`
* **Root Health Status**: `http://localhost:8000/health`

### 3. Run Automated 24-Point Test Suite
```bash
python test_all_endpoints.py
```

---

## 📋 Mock Demo Data (For Presentations & Testing)

| Role / Flow | Name | Plaintext Aadhaar | OTP | Demo Purpose |
|---|---|---|---|---|
| **Head of Family** | Ramesh Patel | `111122223333` | `123456` | Income: ₹1,60,000 (Ahmedabad) |
| **Spouse** | Sunita Patel | `222233334444` | `123456` | Added with `GREEN` status |
| **Student Child** | Aarav Patel | `333344445555` | `123456` | Age 15 (Unlocks Education Scholarship) |
| **Cross-Family Fraud** | Priya Joshi | `666677778888` | `123456` | Adding to 2nd family triggers **🔴 RED Fraud Flag** |
| **Local Officer** | Amit Sharma | *Login by Name* | — | Talati jurisdiction review |
| **Escalation Officer**| Deepa Trivedi | *Login by Name* | — | Mamlatdar Tier 1 escalation |
| **District Officer** | Rajesh Kumar | *Login by Name* | — | District Collector Tier 2 escalation |

---

## 🔌 Core API Endpoints

### Citizen & Household Lifecycle
* `POST /ekyc/verify` — Simulated UIDAI e-KYC lookup with fixed OTP.
* `POST /families/register-head` — Registers adult head and creates household.
* `POST /auth/login` — Re-authenticates citizen and returns active family IDs.
* `POST /families/{family_id}/members` — Adds member, performs cross-family duplicate fraud detection.
* `GET /families/{family_id}/status` — Returns live confidence tiers (`GREEN` / `YELLOW` / `RED`).
* `GET /families/{family_id}/network-graph` — Interactive Kinship & Conflict node-link graph.
* `GET /families/{family_id}/card-payload` — Cryptographically signed Digital QR Smart Card.

### Welfare Rule Engine & Entitlements
* `GET /schemes/` — Lists all available state welfare schemes.
* `GET /schemes/eligible/{family_id}` — Evaluates scheme rules dynamically against household snapshot.
* `GET /schemes/welfare-summary/{family_id}` — Calculates total unlocked annual aid (₹) & suggestions.
* `POST /schemes/apply` — 1-Click authenticated scheme application.

### Transparency & GovLedger
* `GET /families/{family_id}/audit-trail` — Chronological event log with cryptographic hashes.
* `GET /ledger/verify/{family_id}` — Mathematical validation of GovLedger hash chain.

### Officer Verification & Escalation
* `POST /officer/login` — Officer JWT authentication by credential name.
* `GET /officer/pending-reviews` — Work-queue with 72h SLA countdowns & escalation tiers.
* `POST /officer/resolve/{member_id}` — Approves/Rejects flagged members with logged reason.
