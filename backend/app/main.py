from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, ekyc, families, schemes, officers, documents, ledger

app = FastAPI(title="EkParivaar API - Gujarat Unified Family ID")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ekyc.router)
app.include_router(families.router)
app.include_router(schemes.router)
app.include_router(officers.router)
app.include_router(documents.router)
app.include_router(ledger.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to EkParivaar (Gujarat Unified Family ID) API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
