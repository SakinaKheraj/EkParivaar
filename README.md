# 🏛️ EkParivaar (ગુજરાત એક પરિવાર)
### Verified-at-Source, Transparent-by-Design Unified Household Identity & Welfare Engine for Gujarat

> **EkParivaar** is Gujarat's unified civic architecture assigning every household a single, verified digital identity to streamline welfare scheme delivery, eliminate ghost beneficiaries, and provide citizens with complete transparency through cryptographic GovLedger audit trails.

---

## 🌟 Why EkParivaar? (Solving Real Policy Failures)

Existing state implementations face severe documented failures:
1. **Haryana PPP (Parivar Pehchan Patra)**: Relied on unverified self-declared data with opaque, 6–12 month dispute resolution, causing pensions to be mistakenly cut off.
2. **UP Family ID**: Dependent on legacy, error-prone ration card databases, inheriting decades of ghost entries and excluding non-cardholders.

**EkParivaar Core Differentiators:**
* 🔒 **Verified-at-Source**: Identity and age are verified against trusted identity registries (UIDAI e-KYC simulation); nothing is silently trusted.
* 🛡️ **GovLedger Cryptographic Audit Trail**: Every household addition, edit, or status change is chained using SHA-256 Merkle hashes, making records mathematically tamper-evident.
* 🕸️ **Cross-Household Duplicate Fraud Engine**: Instant cross-family duplicate detection flags multi-claim fraud (🔴 RED Flag) and generates kinship network graphs.
* 🎯 **Smart Welfare Maximizer**: Evaluates household attributes against scheme rules as data, calculating unlocked financial entitlements (e.g. ₹5,25,000/yr) and offering actionable recommendations.
* ⏱️ **72-Hour Citizen SLA & Auto-Escalation**: Unresolved citizen flags automatically escalate (*Talati → Mamlatdar → District Collector*).
* 🪪 **Verifiable Smart Card**: Generates a tamper-proof digital certificate and scannable QR payload with cryptographic HMAC signatures.
* 📊 **District & State Executive Analytics**: Live administrative oversight dashboard for District Collectors and Mamlatdars.

---

## 🏗️ Architecture & Technology Stack

```
[ Frontend: React 18 + Vite + Stitch Civic Design System ]
                        │  (REST API + JWT Bearer Auth)
                        ▼
[ Backend: FastAPI (Python 3.13) + python-jose + Pydantic + Uvicorn ]
   ├── Authentication & e-KYC Router (/auth, /ekyc)
   ├── Household Lifecycle Router (/families)
   │     ├── Self lookup: /families/me
   │     ├── Status & Roster: /families/{id}/status
   │     ├── Kinship Graph: /families/{id}/network-graph
   │     └── Digital Smart Card: /families/{id}/card-payload
   ├── Dynamic Scheme Rule Engine (/schemes)
   │     ├── Catalog: /schemes/
   │     ├── Eligibility: /schemes/eligible/{id}
   │     ├── Welfare Maximizer: /schemes/welfare-summary/{id}
   │     └── 1-Click Apply: /schemes/apply
   ├── GovLedger Cryptographic Verifier (/ledger, /families/{id}/audit-trail)
   └── Officer Work-Queue & Analytics Router (/officer)
         ├── Pending Review & 72h SLA: /officer/pending-reviews
         ├── Resolve / Adjudicate: /officer/resolve/{member_id}
         ├── Case Escalation: /officer/escalate/{flag_id}
         └── Executive Analytics: /officer/analytics
                        │
                        ▼
[ Database & Storage: Supabase (Hosted PostgreSQL) ]
   ├── citizens_registry (Simulated UIDAI Aadhaar Source of Truth)
   ├── families & family_members (Confidence-Tiered Graph)
   ├── duplicate_flags (Cross-Family Fraud Alerts + 72h SLA)
   ├── schemes & applications (Rule-Engine Metadata)
   ├── officers (Role-Based Access: Talati, Mamlatdar, Collector)
   └── audit_log (Append-Only GovLedger SHA-256 Hash Chain)
```

---

## 🚀 Running the Project

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js 18+ and npm

### 1. Start the Backend Server
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate   # Linux/macOS: source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Launch FastAPI on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
* **Health Check**: `http://localhost:8000/health`

### 2. Start the Frontend Server
```bash
cd frontend
# Install dependencies (if not already installed)
npm install

# Start Vite dev server on port 5173
npm run dev -- --host 127.0.0.1 --port 5173
```
* **Web App URL**: `http://localhost:5173`

---

## 📋 Demo Credentials & Accounts

### Citizen Accounts (Aadhaar e-KYC Simulation — OTP: `123456`)
| Name | Aadhaar Number | Role in Household | District | Purpose |
|---|---|---|---|---|
| **Ramesh Patel** | `111122223333` | Household Head | Ahmedabad | Pre-registered Family Head (Income: ₹1,60,000) |
| **Manoj Desai** | `777788889999` | Household Head | Ahmedabad | Pre-registered Family Head (Income: ₹2,40,000) |
| **Sunita Patel** | `222233334444` | Member / Spouse | Ahmedabad | Verified Dependent of Ramesh Patel |
| **Meera Shah** | `444455556666` | Unregistered Citizen | Ahmedabad | Test New Household Registration flow |
| **Aarav Patel** | `333344445555` | Minor (Age 15) | Ahmedabad | Test adding minor child / Education scheme |
| **Priya Joshi** | `666677778888` | Cross-Family | Ahmedabad | Adding to 2nd family triggers **🔴 RED Fraud Flag** |

### Officer Accounts (Role-Based Administration — PIN: `1234`)
| Officer Name | Cadre / Role | Jurisdiction | Landing View |
|---|---|---|---|
| **Amit Sharma** | Talati (Village / Ward Officer) | Ahmedabad Zone 04 Desk | Officer Review Queue |
| **Deepa Trivedi** | Mamlatdar (Supervisory Officer) | Ahmedabad Sub-Division | District Analytics / Escalations |
| **Rajesh Kumar** | District Collector (Apex State) | Gujarat State Apex | State Entitlement Grid Analytics |

---

## 🧪 Comprehensive End-to-End Testing Guide

### Flow 1: Citizen Login & Household Status
1. Navigate to `http://localhost:5173`.
2. Click **"Sign in with Aadhaar →"**.
3. Type Aadhaar number **`111122223333`** (Ramesh Patel) and OTP **`123456`**, then press Enter or click **"Sign In to Citizen Portal"**.
4. The system securely authenticates the citizen, establishes the session, and loads the **Citizen Dashboard** with live family roster, unlocked welfare aid, and GovLedger event summary.

### Flow 2: Head vs Member Role Restrictions (Edge Case Testing)
* **As Head of Household (Ramesh Patel — Aadhaar `111122223333`)**:
  - Head can add new members by clicking **"Add New Member"** in the Family Members roster.
  - Adding a valid member (e.g., `Sunita Patel`, Aadhaar `222233334444`) marks them `GREEN (Verified)` and appends a block to GovLedger.
  - Adding a duplicate member already in another household (e.g., `Priya Joshi`, Aadhaar `666677778888`) triggers an immediate **🔴 RED Flag** duplicate detection and routes a case to the Officer Review Queue under 72-hour SLA.
* **As Household Member / Dependent (Sunita Patel — Aadhaar `222233334444`)**:
  - When logged in, navigate to **"Family Members"**:
  - The UI displays a clear **"🔒 Read-Only Dependent View"** notification informing the user that only the Head of Household has legal authority to add or modify family members.
  - The **"Add New Member"** button is disabled with `(Head Only)`.
  - Backend statutory checks enforce this constraint with `403 Forbidden` if bypassed.

### Flow 3: Kinship Conflict Graph (Head-Anchored Single Tree)
1. In the citizen portal, click **"Family Members"** → **"Kinship Conflict Graph"** (or visit `kinship`).
2. The interactive graph renders with the **Head of Household** (`Ramesh Patel`) as the single primary root anchor at the top center.
3. All verified dependents (`SPOUSE / WIFE`, `CHILD / SON`, `PARENT / MOTHER`) branch directly from the Head node.
4. Flagged dual-residence collision bridges connect to conflicting households on the periphery with red hazard indicators.

### Flow 4: Requests & Claims Tracking Console
1. Click the **"Requests"** tab in the citizen navbar.
2. View active welfare claims (`APPL-2026-PMJAY-081`, `APPL-2026-NLY-044`) and household modification requests with real-time status and GovLedger block linkages.
3. If an officer has adjudicated a case, the **"Official Officer Adjudications & Direct Notes"** notice renders directly at the top with the officer's name, timestamp, determination, and custom remarks.

### Flow 5: Smart Welfare Maximizer & 1-Click Application
1. Click **"Schemes"** in the navbar.
2. View the total unlocked welfare entitlements (e.g. ₹5,25,000/yr).
3. Eligible schemes (evaluated against real household income and demographic attributes) can be claimed with **"1-Click Apply"**.
4. Applications are tied to the household ID and sealed into GovLedger.

### Flow 6: GovLedger Cryptographic Audit Explorer
1. Click **"GovLedger"** in the navbar.
2. Every household event displays as a structured cryptographic block with **PREVIOUS HASH**, **BLOCK SHA-256**, **Actor**, and timestamp.
3. Click **"Verify Cryptographic Proofs"**: the system traverses the SHA-256 Merkle chain and validates that zero database records have been modified post-facto.

### Flow 7: Officer Review Queue, Case Resolution & Citizen Feedback Loop
1. Click **"Officer Portal →"** in the top navigation bar.
2. Login as **Amit Sharma** (PIN: `1234`).
3. The **Review Queue** displays incoming cases (*Duplicate Aadhaar, Birth Certificate Attestation, Income Assessment, Marriage Linkage, Address Transfer*) with 72-hour statutory SLA timers.
4. Click on any case to open the **Case Detail View**.
5. Select a determination (*Approve / Reject / Request Proof*), enter an official note (e.g., *"Physical verification complete. Verified primary residence in Ahmedabad."*), and submit.
6. The decision is committed to GovLedger. When the citizen logs in, they see the officer's exact determination and notes in their dashboard.

### Flow 8: District Collector & Mamlatdar High-Level Analytics
1. Sign in as **Rajesh Kumar** (District Collector) or **Deepa Trivedi** (Mamlatdar) with PIN `1234`.
2. Lands directly on the **Gujarat Entitlement Grid Analytics Dashboard**.
3. View real-time district statistics: Total Households, Member Verification Tiers, Fraud Alerts, Scheme Distribution, and SLA Performance without network errors.

---

## 🛡️ Edge Cases Handled

1. **Role-Based Authorization**: Dependents cannot modify or add household members; restricted exclusively to the Head of Household.
2. **Cross-Household Duplicate Detection**: Real-time cross-family checks flag duplicate Aadhaar entries as `RED` tier under 72h SLA.
3. **Anti-IDOR Protection**: Citizen endpoints verify JWT claims directly from the cryptographically signed token.
4. **Adult Head Rule Enforcement**: Heads of household must be at least 18 years old; minors cannot register as family heads.
5. **GovLedger Cryptographic Tamper-Evidence**: SHA-256 parent-child block linkages guarantee immutability for all civic lifecycle events.
6. **Officer-to-Citizen Feedback Loop**: Officer determinations with custom remarks are immediately visible to citizens in their dashboard and requests console.
