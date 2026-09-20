# 🚀 EkParivaar — Deployment Guide
## Deploy Frontend to Vercel + Backend to Render

---

## ⚠️ Prerequisites

- GitHub account with the project pushed to a repository
- [Vercel account](https://vercel.com) (free tier is fine)
- [Render account](https://render.com) (free tier is fine)
- Supabase project already running (you already have this)

---

## PART 1: Deploy Backend to Render

### Step 1 — Create `render.yaml` (or use dashboard)

Create this file at: `backend/render.yaml`
```yaml
services:
  - type: web
    name: ekparivaar-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false   # fill in dashboard
      - key: SUPABASE_ANON_KEY
        sync: false   # fill in dashboard
      - key: JWT_SECRET_KEY
        sync: false   # fill in dashboard
      - key: PYTHON_VERSION
        value: 3.11.0
```

### Step 2 — Push code to GitHub

```bash
cd c:\Users\khera\OneDrive\Desktop\Family360
git init                        # if not already a repo
git add .
git commit -m "Initial commit — EkParivaar"
git remote add origin https://github.com/YOUR_USERNAME/ekparivaar.git
git push -u origin main
```

### Step 3 — Create Web Service on Render

1. Go to [https://render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `ekparivaar-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

### Step 4 — Add Environment Variables on Render

In the Render service dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `JWT_SECRET_KEY` | Any long random string (e.g. `ekparivaar-secret-2026`) |
| `ALLOWED_ORIGINS` | `https://ekparivaar.vercel.app` (add after frontend deploy) |

### Step 5 — Check backend environment variables file

Make sure `backend/app/database.py` (or wherever Supabase is initialized) reads from `os.environ`:
```python
import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
```

### Step 6 — Update CORS in FastAPI for production

In `backend/app/main.py`, update CORS origins to include your Vercel URL:
```python
from fastapi.middleware.cors import CORSMiddleware
import os

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins + ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 7 — Deploy and note your Render URL

After deploy (takes ~3-5 minutes), your backend will be at:
```
https://ekparivaar-api.onrender.com
```
> ⚠️ **Note:** Free Render services sleep after 15 minutes of inactivity. First request after sleep takes ~30s to wake up.

---

## PART 2: Deploy Frontend to Vercel

### Step 1 — Create Vercel config file

Create `frontend/vercel.json` to handle SPA routing (fixes blank page on direct URL access):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 2 — Set the API URL for production

Create `frontend/.env.production`:
```
VITE_API_URL=https://ekparivaar-api.onrender.com
```

> Keep `frontend/.env` (or `.env.local`) for local development:
> ```
> VITE_API_URL=http://localhost:8000
> ```

### Step 3 — Add to `.gitignore` (if needed)

Make sure `.env.local` is ignored but `.env.production` is committed:
```
# .gitignore
.env.local
.env
```

### Step 4 — Deploy to Vercel via Dashboard

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://ekparivaar-api.onrender.com`
5. Click **Deploy**

### Step 5 — (Alternative) Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# From the frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up project? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: ekparivaar-frontend
# - Root directory: ./ (already in frontend/)
# - Build command: npm run build
# - Output directory: dist

# Deploy to production
vercel --prod
```

### Step 6 — Note your Vercel URL

After deploy, your frontend will be at:
```
https://ekparivaar.vercel.app
```
(or whatever name Vercel assigns)

---

## PART 3: Connect Everything

### Step 7 — Update Render ALLOWED_ORIGINS

Go back to Render → Environment Variables → update:
```
ALLOWED_ORIGINS=https://ekparivaar.vercel.app
```
Then click **Save** (Render will redeploy automatically).

### Step 8 — Verify end-to-end

1. Open `https://ekparivaar.vercel.app`
2. Click **Sign in with Aadhaar** → enter `111122223333` + OTP `123456`
3. Dashboard should load with live data from Render backend → Supabase

---

## 📋 Final Deployment Checklist

| Step | Item | Status |
|------|------|--------|
| Backend | `render.yaml` or manual Render config | ☐ |
| Backend | Env vars set on Render (SUPABASE_URL, KEY, JWT_SECRET) | ☐ |
| Backend | CORS updated to include Vercel URL | ☐ |
| Backend | `database.py` reads from `os.environ` | ☐ |
| Frontend | `vercel.json` created for SPA routing | ☐ |
| Frontend | `.env.production` has Render API URL | ☐ |
| Frontend | Deployed to Vercel (Root Dir = `frontend`) | ☐ |
| Post-deploy | Render ALLOWED_ORIGINS updated with Vercel URL | ☐ |
| Verify | Login with demo Aadhaar works end-to-end | ☐ |

---

## 🐛 Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank page on `/dashboard` direct URL | SPA routing not configured | Add `vercel.json` with rewrites |
| `CORS error` in browser | Backend ALLOWED_ORIGINS missing Vercel URL | Update env var on Render |
| `502 Bad Gateway` on first request | Render free tier sleep | Wait 30s, retry |
| `401 Unauthorized` on add-member | Token expired or invalid | Re-login to get fresh JWT |
| Backend not connecting to Supabase | Env vars missing on Render | Check Environment tab in Render dashboard |
| `Cannot GET /families/me` | Root Directory wrong on Render | Set Root Directory to `backend` |

---

## 🌐 Architecture After Deployment

```
[User's Browser]
      │
      ▼ HTTPS
[Vercel CDN] → serves React SPA (static files from dist/)
      │
      ▼ HTTPS REST API calls
[Render Web Service] → FastAPI + Uvicorn
      │
      ▼ Supabase REST
[Supabase Cloud PostgreSQL] → all persistent data
```

Total monthly cost on free tiers: **₹0**
