from datetime import date
from fastapi import APIRouter, HTTPException, Depends
from app.database import supabase
from app.security import get_current_user
from app.schemas import ApplyToSchemeRequest

router = APIRouter(prefix="/schemes", tags=["schemes"])


def _years_between(d: date, today: date) -> int:
    return today.year - d.year - ((today.month, today.day) < (d.month, d.day))


def _family_snapshot(family_id: str) -> dict:
    """
    Builds the data points the eligibility engine needs using real data
    from the families and family_members tables, with citizen details
    pulled via Supabase foreign-key embedding.
    """
    family = (
        supabase.table("families")
        .select("annual_income")
        .eq("family_id", family_id)
        .execute()
    )
    if not family.data:
        return None

    members = (
        supabase.table("family_members")
        .select("*, citizens_registry(full_name, dob)")
        .eq("family_id", family_id)
        .is_("removed_at", "null")
        .execute()
    )

    # Compute member ages from verified DOBs
    today = date.today()
    ages = []
    for m in members.data:
        citizen = m.get("citizens_registry")
        if citizen and citizen.get("dob"):
            dob = date.fromisoformat(str(citizen["dob"]))
            ages.append(_years_between(dob, today))

    # Aggregate member attributes
    has_widow = any((m.get("attributes") or {}).get("is_widow", False) for m in members.data)
    has_disability = any((m.get("attributes") or {}).get("is_disabled", False) for m in members.data)
    has_land_holding = any((m.get("attributes") or {}).get("has_land_holding", False) for m in members.data)

    return {
        "member_count": len(members.data),
        "all_verified": all(m["verification_status"] == "GREEN" for m in members.data),
        "declared_income": family.data[0].get("annual_income", 0),
        "has_widow": has_widow,
        "has_disability": has_disability,
        "has_land_holding": has_land_holding,
        "member_ages": ages,
    }


def _is_eligible(rules: dict, snapshot: dict) -> tuple[bool, str]:
    """Evaluate one scheme's rules (stored as JSON data) against a family snapshot."""
    if "max_income" in rules and snapshot["declared_income"] > rules["max_income"]:
        return False, f"Household income ₹{snapshot['declared_income']:,} exceeds the ₹{rules['max_income']:,} threshold"
    if rules.get("requires_widow") and not snapshot["has_widow"]:
        return False, "Scheme requires a widow member in the household"
    if rules.get("requires_disability") and not snapshot["has_disability"]:
        return False, "Scheme requires a member with a registered disability"
    if rules.get("requires_land_holding") and not snapshot["has_land_holding"]:
        return False, "Scheme requires a registered land holding"
    if "min_age" in rules or "max_age" in rules:
        min_age = rules.get("min_age", 0)
        max_age = rules.get("max_age", 999)
        qualifying = [a for a in snapshot.get("member_ages", []) if min_age <= a <= max_age]
        if not qualifying:
            return False, f"No family member aged between {min_age} and {max_age}"
    return True, "Meets all checked criteria"


@router.get("/")
def list_schemes():
    """List all available schemes — needed by the frontend to populate the dashboard."""
    schemes = supabase.table("schemes").select("*").execute()
    return {"schemes": schemes.data, "data": schemes.data}


def _calculate_eligibility(family_id: str):
    snapshot = _family_snapshot(family_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Family not found")

    all_schemes = supabase.table("schemes").select("*").execute().data

    results = []
    eligible_schemes = []
    ineligible_schemes = []
    
    for scheme in all_schemes:
        eligible, reason = _is_eligible(scheme.get("eligibility_rules") or {}, snapshot)
        item = {
            "scheme_id": scheme["scheme_id"],
            "name": scheme["name"],
            "department": scheme["department"],
            "benefit_description": scheme.get("benefit_description"),
            "eligible": eligible,
            "reason": reason,
        }
        results.append(item)
        if eligible:
            eligible_schemes.append(item)
        else:
            ineligible_schemes.append(item)

    return {
        "family_id": family_id,
        "all_verified": snapshot["all_verified"],
        "results": results,
        "eligible_schemes": eligible_schemes,
        "ineligible_schemes": ineligible_schemes,
    }


@router.get("/eligibility/{family_id}")
def get_eligibility(family_id: str):
    return _calculate_eligibility(family_id)


@router.get("/eligible/{family_id}")
def get_eligible_alias(family_id: str):
    return _calculate_eligibility(family_id)


@router.get("/welfare-summary/{family_id}")
def get_welfare_summary(family_id: str):
    """
    Smart Welfare Maximizer & Entitlement Analytics Engine:
    Calculates total annual monetary entitlement unlocked, department allocations,
    and generates actionable suggestions to unlock unclaimed welfare benefits.
    """
    eligibility_data = _calculate_eligibility(family_id)
    snapshot = _family_snapshot(family_id)
    
    # Financial valuation dictionary per scheme
    SCHEME_VALUATIONS = {
        "Ayushman-style Health Cover": 500000,
        "Education Scholarship": 25000,
        "Widow Pension Scheme": 18000,
        "Agriculture Input Subsidy": 20000,
        "Disability Pension": 15000,
    }

    total_unlocked_value = 0
    department_breakdown = {}
    
    for item in eligibility_data["eligible_schemes"]:
        s_name = item["name"]
        dept = item["department"]
        val = SCHEME_VALUATIONS.get(s_name, 10000)
        total_unlocked_value += val
        department_breakdown[dept] = department_breakdown.get(dept, 0) + val

    # Actionable optimization recommendations
    recommendations = []
    
    if not snapshot.get("has_land_holding") and snapshot.get("declared_income", 0) <= 200000:
        recommendations.append({
            "scheme_name": "Agriculture Input Subsidy",
            "potential_unlock_amount": 20000,
            "action_required": "Link agricultural land parcel records to unlock annual seed & fertilizer subsidy.",
            "impact_tag": "FARMER_SUPPORT"
        })
        
    eligible_names = [s["name"] for s in eligibility_data["eligible_schemes"]]
    if "Education Scholarship" not in eligible_names:
        children_ages = [a for a in snapshot.get("member_ages", []) if 6 <= a <= 25]
        if children_ages and snapshot.get("declared_income", 0) <= 250000:
            recommendations.append({
                "scheme_name": "Education Scholarship",
                "potential_unlock_amount": 25000 * len(children_ages),
                "action_required": f"Upload student enrollment certificate for {len(children_ages)} eligible student(s) in household.",
                "impact_tag": "YOUTH_EDUCATION"
            })

    return {
        "family_id": family_id,
        "total_unlocked_annual_value": total_unlocked_value,
        "formatted_unlocked_value": f"₹{total_unlocked_value:,}",
        "eligible_schemes_count": len(eligibility_data["eligible_schemes"]),
        "ineligible_schemes_count": len(eligibility_data["ineligible_schemes"]),
        "department_breakdown": department_breakdown,
        "actionable_recommendations": recommendations,
        "optimization_score": min(100, int((len(eligibility_data["eligible_schemes"]) / max(1, len(eligibility_data["results"]))) * 100) + 35),
    }


@router.post("/apply")
def apply_to_scheme(payload: ApplyToSchemeRequest, user=Depends(get_current_user)):
    snapshot = _family_snapshot(payload.family_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Family not found")

    scheme = (
        supabase.table("schemes")
        .select("*")
        .eq("scheme_id", payload.scheme_id)
        .execute()
        .data
    )
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    eligible, reason = _is_eligible(scheme[0].get("eligibility_rules") or {}, snapshot)
    if not eligible:
        raise HTTPException(status_code=403, detail=f"Not eligible: {reason}")

    # Pre-check for existing application instead of catching all exceptions
    existing = (
        supabase.table("applications")
        .select("application_id, status")
        .eq("family_id", payload.family_id)
        .eq("scheme_id", payload.scheme_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Already applied to this scheme")

    application = (
        supabase.table("applications")
        .insert({"family_id": payload.family_id, "scheme_id": payload.scheme_id, "status": "SUBMITTED"})
        .execute()
    )

    app_data = application.data[0] if application.data else {}
    return {
        "status": "SUBMITTED",
        "application_id": app_data.get("application_id"),
        "family_id": payload.family_id,
        "scheme_id": payload.scheme_id,
        "scheme_name": scheme[0]["name"],
    }
