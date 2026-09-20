from pydantic import BaseModel
from typing import Optional
from datetime import date


class EkycRequest(BaseModel):
    aadhaar_number: str  # plaintext in the request only; hashed before any DB touch
    otp: str             # for the demo, accept a fixed mock OTP e.g. "123456"


class RegisterHeadRequest(BaseModel):
    aadhaar_number: str
    otp: str
    district: str
    annual_income: int = 0


class AddMemberRequest(BaseModel):
    family_id: Optional[str] = None
    aadhaar_number: str
    otp: Optional[str] = "123456"
    claimed_name: Optional[str] = None
    claimed_dob: Optional[date] = None
    relationship_type: Optional[str] = None
    relationship_to_head: Optional[str] = None  # alias for relationship_type
    attributes: Optional[dict] = None  # e.g. {"is_widow": true, "is_disabled": false, "has_land_holding": false}


class ApplyToSchemeRequest(BaseModel):
    family_id: str
    scheme_id: str


class OfficerLoginRequest(BaseModel):
    name: str  # mock auth: officer logs in by name


class OfficerResolveRequest(BaseModel):
    verification_status: str  # GREEN or RED
    reason: str


class DocumentRecordRequest(BaseModel):
    member_id: str
    doc_type: str   # birth_cert / marriage_cert / death_cert
    file_url: str
