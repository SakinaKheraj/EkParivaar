import httpx
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60)
    print("RUNNING END-TO-END TESTS FOR ALL EKPARIVAAR ENDPOINTS")
    print("=" * 60)
    
    passed = 0
    total = 0
    
    client = httpx.Client(base_url=BASE_URL, timeout=15.0)
    
    def test_case(name, func):
        nonlocal passed, total
        total += 1
        time.sleep(0.15)
        print(f"\n[{total}] Testing: {name}...")
        try:
            func()
            print(f"    [PASSED]")
            passed += 1
        except Exception as e:
            print(f"    [FAILED]: {e}")
            
    # 1. Health & Root
    def test_health():
        r = client.get("/health")
        assert r.status_code == 200, f"Health returned {r.status_code}: {r.text}"
        assert r.json().get("status") == "ok"
    test_case("GET /health", test_health)

    def test_root():
        r = client.get("/")
        assert r.status_code == 200, f"Root returned {r.status_code}: {r.text}"
        assert "EkParivaar" in r.json().get("message", "")
    test_case("GET /", test_root)

    # 2. eKYC Verification
    def test_ekyc_success():
        r = client.post("/ekyc/verify", json={"aadhaar_number": "111122223333", "otp": "123456"})
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data["full_name"] == "Ramesh Patel"
        assert data["aadhaar_last4"] == "3333"
    test_case("POST /ekyc/verify (Success)", test_ekyc_success)

    def test_ekyc_invalid_otp():
        r = client.post("/ekyc/verify", json={"aadhaar_number": "111122223333", "otp": "999999"})
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    test_case("POST /ekyc/verify (Invalid OTP 401)", test_ekyc_invalid_otp)

    # Context variables for chained tests
    family_id = None
    token = None
    member_id_sunita = None
    member_id_priya = None
    officer_token = None

    # 3. Register Head
    def test_register_head():
        nonlocal family_id, token
        r = client.post("/families/register-head", json={
            "aadhaar_number": "111122223333",
            "otp": "123456",
            "district": "Ahmedabad",
            "annual_income": 160000
        })
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "family_id" in data
        assert "access_token" in data
        family_id = data["family_id"]
        token = data["access_token"]
        print(f"    -> Created Family ID: {family_id}")
    test_case("POST /families/register-head", test_register_head)

    # 4. Auth Login
    def test_auth_login():
        r = client.post("/auth/login", json={
            "aadhaar_number": "111122223333",
            "otp": "123456"
        })
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "access_token" in data
        assert family_id in data.get("family_ids", []) or data.get("family_id")
    test_case("POST /auth/login (Re-login head)", test_auth_login)

    # 5. Add Family Members
    def test_add_member_sunita():
        nonlocal member_id_sunita
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"/families/{family_id}/members", json={
            "aadhaar_number": "222233334444",
            "otp": "123456",
            "relationship_to_head": "SPOUSE",
            "attributes": {"occupation": "homemaker"}
        }, headers=headers)
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data["verification_status"] in ("GREEN", "RED")
        member_id_sunita = data["member_id"]
    test_case("POST /families/{id}/members (Sunita - SPOUSE)", test_add_member_sunita)

    def test_add_member_aarav():
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"/families/{family_id}/members", json={
            "aadhaar_number": "333344445555",
            "otp": "123456",
            "relationship_to_head": "SON",
            "attributes": {"student": True}
        }, headers=headers)
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data["verification_status"] in ("GREEN", "RED")
    test_case("POST /families/{id}/members (Aarav - SON)", test_add_member_aarav)

    # 6. Duplicate in same family -> 409
    def test_duplicate_same_family():
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"/families/{family_id}/members", json={
            "aadhaar_number": "222233334444",
            "otp": "123456",
            "relationship_to_head": "SPOUSE"
        }, headers=headers)
        assert r.status_code == 409, f"Expected 409, got {r.status_code}: {r.text}"
    test_case("POST /families/{id}/members (Same member duplicate -> 409)", test_duplicate_same_family)

    # 7. Cross-family duplicate fraud detection
    def test_cross_family_duplicate():
        nonlocal member_id_priya
        # First add Priya to Family 1
        headers1 = {"Authorization": f"Bearer {token}"}
        r1 = client.post(f"/families/{family_id}/members", json={
            "aadhaar_number": "666677778888",
            "otp": "123456",
            "relationship_to_head": "DAUGHTER"
        }, headers=headers1)
        assert r1.status_code in (200, 409)
        
        # Now create Family 2 with Manoj Desai
        r2 = client.post("/families/register-head", json={
            "aadhaar_number": "777788889999",
            "otp": "123456",
            "district": "Surat",
            "annual_income": 200000
        })
        assert r2.status_code == 200
        fam2_id = r2.json()["family_id"]
        fam2_token = r2.json()["access_token"]
        
        # Try adding Priya to Family 2 -> triggers RED fraud flag
        headers2 = {"Authorization": f"Bearer {fam2_token}"}
        r3 = client.post(f"/families/{fam2_id}/members", json={
            "aadhaar_number": "666677778888",
            "otp": "123456",
            "relationship_to_head": "DAUGHTER"
        }, headers=headers2)
        assert r3.status_code == 200
        data3 = r3.json()
        assert data3["verification_status"] == "RED", f"Expected RED, got {data3['verification_status']}"
        assert data3.get("duplicate_flag") is True
        member_id_priya = data3["member_id"]
    test_case("POST /families/{id}/members (Cross-family duplicate -> RED Flag)", test_cross_family_duplicate)

    # 8. Get Family Status
    def test_family_status():
        r = client.get(f"/families/{family_id}/status")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "confidence_tier" in data
        assert "members" in data
        assert len(data["members"]) >= 2
        for m in data["members"]:
            assert "full_name" in m, f"Missing full_name in member: {m}"
    test_case("GET /families/{id}/status", test_family_status)

    # 9. Get Audit Trail
    def test_audit_trail():
        r = client.get(f"/families/{family_id}/audit-trail")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "audit_trail" in data
        assert len(data["audit_trail"]) > 0
    test_case("GET /families/{id}/audit-trail", test_audit_trail)

    # 10. List Schemes
    def test_list_schemes():
        r = client.get("/schemes/")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json().get("schemes", r.json())
        assert len(data) >= 4, f"Expected >=4 schemes, got {len(data)}"
    test_case("GET /schemes/", test_list_schemes)

    # 11. Eligible Schemes
    def test_eligible_schemes():
        r = client.get(f"/schemes/eligible/{family_id}")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "eligible_schemes" in data
        assert "ineligible_schemes" in data
        eligible_names = [s["name"] for s in data["eligible_schemes"]]
        print(f"    -> Eligible Schemes: {eligible_names}")
    test_case("GET /schemes/eligible/{id}", test_eligible_schemes)

    # 12. Apply for Scheme (Pick an eligible scheme)
    def test_apply_scheme():
        elig_res = client.get(f"/schemes/eligible/{family_id}").json()
        eligible = elig_res.get("eligible_schemes", [])
        if not eligible:
            all_s = client.get("/schemes/").json().get("schemes", [])
            scheme_id = all_s[0]["scheme_id"]
        else:
            scheme_id = eligible[0]["scheme_id"]
        
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post("/schemes/apply", json={
            "family_id": family_id,
            "scheme_id": scheme_id
        }, headers=headers)
        assert r.status_code in (200, 409), f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data.get("status") in ("SUBMITTED", "APPLIED") or r.status_code == 409
    test_case("POST /schemes/apply", test_apply_scheme)

    # 13. Officer Login
    def test_officer_login():
        nonlocal officer_token
        r = client.post("/officer/login", json={"name": "Amit Sharma"})
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "access_token" in data
        assert data["officer"]["role"] == "Talati"
        officer_token = data["access_token"]
    test_case("POST /officer/login (Amit Sharma - Talati)", test_officer_login)

    # 14. Officer Pending Reviews
    def test_officer_pending():
        headers = {"Authorization": f"Bearer {officer_token}"}
        r = client.get("/officer/pending-reviews", headers=headers)
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "pending_reviews" in data
        print(f"    -> Found {len(data['pending_reviews'])} pending items for officer")
    test_case("GET /officer/pending-reviews", test_officer_pending)

    # 15. Officer Resolve Review
    def test_officer_resolve():
        if not member_id_priya:
            print("    Skipping: member_id_priya not set")
            return
        headers = {"Authorization": f"Bearer {officer_token}"}
        r = client.post(f"/officer/resolve/{member_id_priya}", json={
            "verification_status": "GREEN",
            "reason": "Physical ration card and local inquiry verified by Talati"
        }, headers=headers)
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data.get("new_status") == "GREEN"
    test_case("POST /officer/resolve/{member_id}", test_officer_resolve)

    # 16. Document Record
    def test_document_record():
        if not member_id_sunita:
            return
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post("/documents/record", json={
            "member_id": member_id_sunita,
            "doc_type": "marriage_cert",
            "file_url": "https://storage.supabase.co/v1/documents/marriage_cert_123.pdf"
        }, headers=headers)
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
    test_case("POST /documents/record", test_document_record)

    # 17. GovLedger Cryptographic Audit Chain Verification
    def test_ledger_verification():
        r = client.get(f"/ledger/verify/{family_id}")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert data.get("is_valid") is True, f"GovLedger chain corrupted: {data}"
        assert data.get("tampered_blocks_count") == 0
        print(f"    -> GovLedger Integrity: {data.get('chain_status')} ({data.get('total_blocks')} blocks verified)")
    test_case("GET /ledger/verify/{id} (GovLedger Hash Chain)", test_ledger_verification)

    # 18. Smart Welfare Maximizer & Entitlement Analytics
    def test_welfare_summary():
        r = client.get(f"/schemes/welfare-summary/{family_id}")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "total_unlocked_annual_value" in data
        assert "actionable_recommendations" in data
        print(f"    -> Unlocked Welfare: Rs. {data.get('total_unlocked_annual_value'):,} / year (Score: {data.get('optimization_score')}%)")
    test_case("GET /schemes/welfare-summary/{id} (Welfare Maximizer)", test_welfare_summary)

    # 19. Kinship & Fraud Conflict Graph
    def test_network_graph():
        r = client.get(f"/families/{family_id}/network-graph")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "nodes" in data
        assert "edges" in data
        print(f"    -> Kinship Graph: {data.get('total_nodes')} nodes, {data.get('total_edges')} edges")
    test_case("GET /families/{id}/network-graph (Kinship Graph)", test_network_graph)

    # 20. Verifiable QR Smart Card Payload
    def test_smart_card():
        r = client.get(f"/families/{family_id}/card-payload")
        assert r.status_code == 200, f"Status: {r.status_code}, Body: {r.text}"
        data = r.json()
        assert "digital_signature" in data
        assert "qr_code_content" in data
        print(f"    -> Smart Card Signature: {data.get('digital_signature')}")
    test_case("GET /families/{id}/card-payload (Digital QR Card)", test_smart_card)

    # 21. Government Security Edge Case: Underage Head Rejection
    def test_underage_head():
        # Aarav Patel is DOB 2010 (15yo minor) -> plaintext 333344445555
        r = client.post("/families/register-head", json={
            "aadhaar_number": "333344445555",
            "otp": "123456",
            "district": "Rajkot",
            "annual_income": 100000
        })
        assert r.status_code == 400, f"Expected 400 for minor head, got {r.status_code}: {r.text}"
    test_case("POST /families/register-head (Underage Head Rejected 400)", test_underage_head)

    # Summary
    print("\n" + "=" * 60)
    print(f"TEST RUN COMPLETE: {passed}/{total} ENDPOINTS PASSED")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
