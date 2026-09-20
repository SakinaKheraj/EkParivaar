const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getHeaders(token = null) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('ekparivaar_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export const api = {
  // 1. Health
  async health() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // 2. e-KYC
  async verifyEkyc(aadhaarNumber, otp = '123456') {
    const res = await fetch(`${BASE_URL}/ekyc/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar_number: aadhaarNumber, otp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Identity verification failed');
    }
    return res.json();
  },

  // 3. Register Head
  async registerHead(payload) {
    const res = await fetch(`${BASE_URL}/families/register-head`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('ekparivaar_token', data.access_token);
      localStorage.setItem('ekparivaar_family_id', data.family_id);
      localStorage.setItem('ekparivaar_user', JSON.stringify(data.head));
    }
    return data;
  },

  // 4. Citizen Re-login
  async loginCitizen(aadhaarNumber, otp = '123456') {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar_number: aadhaarNumber, otp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('ekparivaar_token', data.access_token);
      if (data.family_id) localStorage.setItem('ekparivaar_family_id', data.family_id);
      localStorage.setItem('ekparivaar_user', JSON.stringify({ full_name: data.full_name, citizen_ref: data.citizen_ref }));
    }
    return data;
  },

  // 5. Add Family Member
  async addMember(familyId, memberPayload) {
    const res = await fetch(`${BASE_URL}/families/${familyId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberPayload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add member' }));
      throw new Error(err.detail || 'Failed to add member');
    }
    return res.json();
  },

  // 6. Get Family Status
  async getFamilyStatus(familyId) {
    const res = await fetch(`${BASE_URL}/families/${familyId}/status`);
    if (!res.ok) throw new Error('Failed to load family status');
    return res.json();
  },

  // 7. Get Audit Trail
  async getAuditTrail(familyId) {
    const res = await fetch(`${BASE_URL}/families/${familyId}/audit-trail`);
    if (!res.ok) throw new Error('Failed to load audit trail');
    return res.json();
  },

  // 8. Schemes & Dynamic Eligibility
  async getSchemes() {
    const res = await fetch(`${BASE_URL}/schemes/`);
    if (!res.ok) throw new Error('Failed to load schemes');
    const data = await res.json();
    return data.schemes || data;
  },

  async getEligibleSchemes(familyId) {
    const res = await fetch(`${BASE_URL}/schemes/eligible/${familyId}`);
    if (!res.ok) throw new Error('Failed to compute scheme eligibility');
    return res.json();
  },

  // 9. Smart Welfare Maximizer
  async getWelfareSummary(familyId) {
    const res = await fetch(`${BASE_URL}/schemes/welfare-summary/${familyId}`);
    if (!res.ok) throw new Error('Failed to load welfare entitlement summary');
    return res.json();
  },

  // 10. 1-Click Apply
  async applyScheme(familyId, schemeId) {
    const res = await fetch(`${BASE_URL}/schemes/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ family_id: familyId, scheme_id: schemeId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit application' }));
      throw new Error(err.detail || 'Application submission failed');
    }
    return res.json();
  },

  // 11. Kinship & Fraud Graph
  async getNetworkGraph(familyId) {
    const res = await fetch(`${BASE_URL}/families/${familyId}/network-graph`);
    if (!res.ok) throw new Error('Failed to load network graph');
    return res.json();
  },

  // 12. Verifiable Smart Card Payload
  async getCardPayload(familyId) {
    const res = await fetch(`${BASE_URL}/families/${familyId}/card-payload`);
    if (!res.ok) throw new Error('Failed to load smart card payload');
    return res.json();
  },

  // 13. GovLedger Cryptographic Verification
  async verifyGovLedger(familyId) {
    const res = await fetch(`${BASE_URL}/ledger/verify/${familyId}`);
    if (!res.ok) throw new Error('Failed to verify GovLedger chain');
    return res.json();
  },

  // 14. Officer Authentication
  async officerLogin(name = 'Amit Sharma') {
    const res = await fetch(`${BASE_URL}/officer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Officer authentication failed' }));
      throw new Error(err.detail || 'Officer authentication failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('ekparivaar_officer_token', data.access_token);
      localStorage.setItem('ekparivaar_officer', JSON.stringify(data.officer));
    }
    return data;
  },

  // 15. Officer Pending Reviews & 72h SLA
  async getPendingReviews() {
    const officerToken = localStorage.getItem('ekparivaar_officer_token');
    const res = await fetch(`${BASE_URL}/officer/pending-reviews`, {
      headers: getHeaders(officerToken),
    });
    if (!res.ok) throw new Error('Failed to load officer review queue');
    return res.json();
  },

  // 16. Officer Resolve Member
  async resolveMember(memberId, verificationStatus, reason) {
    const officerToken = localStorage.getItem('ekparivaar_officer_token');
    const res = await fetch(`${BASE_URL}/officer/resolve/${memberId}`, {
      method: 'POST',
      headers: getHeaders(officerToken),
      body: JSON.stringify({
        verification_status: verificationStatus,
        reason: reason,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Resolution failed' }));
      throw new Error(err.detail || 'Failed to record decision');
    }
    return res.json();
  },
};
