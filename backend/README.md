# EkParivaar (Gujarat Unified Family ID) — Backend Setup

## 1. Supabase (10–15 minutes)
1. Go to supabase.com → New Project (free tier). Wait for it to provision.
2. Project → SQL Editor → New query → paste all of `sql/schema.sql` → Run.
3. New query → paste all of `sql/seed.sql` → Run.
4. Project Settings → API → copy `Project URL` and the `service_role` key (NOT the anon key — the backend needs full access; never expose the service_role key to the frontend).
5. Project → Storage → New bucket → name it `documents` (for birth/marriage certificate uploads, if you get to that stretch goal).

## 2. Backend (local dev)
```bash
cd family-id-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env: paste your SUPABASE_URL and SUPABASE_SERVICE_KEY, set a random JWT_SECRET
uvicorn app.main:app --reload --port 8000
```
Open http://localhost:8000/docs — this is your interactive Swagger UI. Test every endpoint here before your friend wires up the frontend against it.

## 3. Deploy backend (Render, free tier)
1. Push this folder to a GitHub repo.
2. render.com → New → Web Service → connect the repo.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as your `.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`.
6. Deploy → copy the live URL → give it to your friend to set as `VITE_API_URL` (or equivalent) in the Vercel frontend.

## 4. Quick sanity test before demo day
Using the seed data:
```bash
curl -X POST http://localhost:8000/families/register-head \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "111122223333", "otp": "123456", "district": "Ahmedabad"}'
```
You should get back a `family_id` and `access_token`. If this works, your whole pipeline is wired correctly end to end.

See `API_CONTRACT.md` for the full endpoint list your friend should build the frontend against.
