import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft, 
  ArrowRight, User, FileText, Check, ShieldCheck, 
  HelpCircle, Scale, ExternalLink, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function OfficerCaseDetailPage({ caseData, onBackToQueue, onDecisionSuccess }) {
  const selectedCase = caseData || {
    id: 'case-1',
    familyId: 'GJ-2025-8849-012',
    headOfFamily: 'Ramesh K. Patel',
    caseType: 'Duplicate Aadhaar',
    flaggedCitizen: { name: 'Meena P. Patel', age: 66, gender: 'Female', aadhaarLast4: '3456', relationship: 'Mother' },
    familyA: { 
      id: 'GJ-2025-8849-012', 
      head: 'Ramesh K. Patel', 
      taluka: 'Mehsana (Mehsana Rural)', 
      relation: 'Mother', 
      date: '07 Sep 2025 (5 days ago)', 
      doc: 'None uploaded (Consent self-attested only)', 
      roster: '2 verified | 1 review | 1 blocked' 
    },
    familyB: { 
      id: 'GJ-2025-7731-044', 
      head: 'Sunita D. Shah', 
      taluka: 'Mehsana (Kadi Taluka)', 
      relation: 'Mother-in-law', 
      date: '21 Jun 2025 (Active since 3 mos)', 
      doc: 'Birth cert. uploaded (Verified 24 Jun 2025)', 
      roster: 'All 3 verified' 
    }
  };

  const isDuplicateCase = selectedCase.caseType?.toLowerCase().includes('duplicate');
  const isBirthCase = selectedCase.caseType?.toLowerCase().includes('birth');
  const isIncomeCase = selectedCase.caseType?.toLowerCase().includes('income');
  const isMarriageCase = selectedCase.caseType?.toLowerCase().includes('marriage');
  const isAddressCase = selectedCase.caseType?.toLowerCase().includes('address');

  const defaultReason = isDuplicateCase
    ? 'Physical ration card and local inquiry verified in person by Talati. Dependent resides with Family A.'
    : isBirthCase
    ? 'Verified Municipal Corporation Form 5 birth certificate with hospital registration seal. Member approved.'
    : isIncomeCase
    ? 'Income certificate verified against Gram Panchayat agricultural survey records. Category confirmed.'
    : isMarriageCase
    ? 'Gujarat Marriage Registrar index matched with sub-registrar volume. Spouse linkage approved.'
    : 'Identity documentation and address proof verified with Gram Sevak inquiry.';

  const [resolutionChoice, setResolutionChoice] = useState(isDuplicateCase ? 'familyA' : 'approve');
  const [reason, setReason] = useState(defaultReason);
  const [notifySms, setNotifySms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleResolveCase = async (actionType = 'resolve') => {
    if (!reason.trim()) {
      setError('A mandatory legal reasoning note is required to seal this adjudication into GovLedger.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const memberId = selectedCase.flaggedCitizen?.id || selectedCase.id || 'mem_01';
      const statusChoice = (resolutionChoice === 'familyA' || resolutionChoice === 'approve') ? 'GREEN' : 'RED';

      // 1. Try backend commit
      try {
        await api.resolveMember(memberId, statusChoice, reason);
      } catch (e) {
        console.warn('Backend call fallback:', e);
      }

      const decisionTitle = isDuplicateCase 
        ? (resolutionChoice === 'familyA' ? 'Approved (Assigned to Primary Family)' : resolutionChoice === 'familyB' ? 'Approved (Assigned to Secondary Family)' : 'Hold (Proof Requested)')
        : (resolutionChoice === 'approve' ? 'Approved & Sealed' : resolutionChoice === 'reject' ? 'Rejected' : 'Action Required / Proof Requested');

      const caseNum = `REQ-2026-09-${Math.floor(1000 + Math.random() * 9000)}`;

      const decisionPayload = {
        caseNumber: caseNum,
        caseId: selectedCase.id,
        caseType: selectedCase.caseType || 'Statutory Verification',
        decision: decisionTitle,
        decidedBy: 'Talati, Mehsana (Desk 04)',
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        subjectName: selectedCase.flaggedCitizen?.name || selectedCase.headOfFamily || 'Resident Citizen',
        familyId: selectedCase.familyId || selectedCase.familyA?.id || 'GJ-2025-8849-012',
        reason: reason
      };

      // 2. Persist adjudication to localStorage so Citizen Dashboard displays it immediately
      try {
        const stored = JSON.parse(localStorage.getItem('ekparivaar_adjudications') || '[]');
        stored.unshift(decisionPayload);
        localStorage.setItem('ekparivaar_adjudications', JSON.stringify(stored));

        // Mark case as resolved so it is deleted from the officer review table
        const resolvedList = JSON.parse(localStorage.getItem('ekparivaar_resolved_cases') || '[]');
        if (selectedCase.id && !resolvedList.includes(selectedCase.id)) {
          resolvedList.push(selectedCase.id);
          localStorage.setItem('ekparivaar_resolved_cases', JSON.stringify(resolvedList));
        }
      } catch (e) {}

      onDecisionSuccess(decisionPayload);
    } catch (err) {
      setError(err.message || 'Adjudication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>

        {/* Top Breadcrumb & Sample pill matching Screenshot 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span onClick={onBackToQueue} style={{ cursor: 'pointer', color: 'var(--gov-teal-850)', fontWeight: 600 }}>Officer console</span>
            <span>/</span>
            <span onClick={onBackToQueue} style={{ cursor: 'pointer', color: 'var(--gov-teal-850)', fontWeight: 600 }}>Review queue</span>
            <span>/</span>
            <span>Case 1</span>
          </div>

          <div style={{
            backgroundColor: '#e2e8f0',
            color: '#475467',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 600
          }}>
            SAMPLE DATA
          </div>
        </div>

        {/* Case Heading & Audit ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: 0 }}>
              {selectedCase.caseType || 'Statutory Verification Case'}
            </h1>
            <span style={{
              backgroundColor: isDuplicateCase ? '#fef3f2' : '#fefce8',
              color: isDuplicateCase ? '#b42318' : '#854d0e',
              border: `1px solid ${isDuplicateCase ? '#fecdca' : '#fef08a'}`,
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}>
              {isDuplicateCase ? 'BLOCKED' : 'UNDER REVIEW'}
            </span>
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '0.5rem' }}>
            AUDIT-ID: GJ-REV-2026-09-{selectedCase.id?.slice(-4) || '8812'}
          </div>
        </div>

        {/* Priority Subtitle */}
        <div style={{ fontSize: '0.82rem', color: isDuplicateCase ? '#b42318' : 'var(--gov-teal-850)', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>• {selectedCase.id?.toUpperCase() || 'CASE-01'} • Priority: {selectedCase.priority || 'HIGH'} • Assigned desk: Talati, Mehsana • Sub-District: Mehsana Rural (Zone 04)</span>
        </div>

        {/* Dynamic Alert Banner */}
        <div style={{
          backgroundColor: isDuplicateCase ? '#fef3f2' : '#f0fdfa',
          border: `1px solid ${isDuplicateCase ? '#fecdca' : '#99f6e4'}`,
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: isDuplicateCase ? '#fee4e2' : '#ccfbf1',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldAlert size={20} color={isDuplicateCase ? '#b42318' : '#0f766e'} />
          </div>

          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isDuplicateCase ? '#b42318' : '#0f766e', marginBottom: '0.2rem' }}>
              {isDuplicateCase 
                ? 'Conflicting dependent claim detected' 
                : isBirthCase
                ? 'Newborn / Minor child birth registration verification'
                : isIncomeCase
                ? 'Annual income tier reclassification review'
                : isMarriageCase
                ? 'Spouse linkage and marriage registrar reconciliation'
                : 'Statutory verification docket pending adjudication'}
            </div>
            <div style={{ fontSize: '0.85rem', color: isDuplicateCase ? '#7a271a' : '#134e4a', lineHeight: 1.5 }}>
              {isDuplicateCase
                ? 'The same Aadhaar is claimed as a dependent in two active families. Family ID cannot be issued for either until this jurisdictional duplicate is formally resolved.'
                : 'Review the uploaded certificates, database registry match scores, and verify accuracy before granting formal GREEN status.'}
            </div>
          </div>
        </div>

        {/* Flagged Subject Citizen Card (Centered) matching Screenshot 3 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--gov-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '640px',
          margin: '0 auto 2rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--gov-teal-900)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            fontSize: '1.2rem',
            fontWeight: 700
          }}>
            MP
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--gov-text-title)', margin: '0 0 0.25rem' }}>
            {selectedCase.flaggedCitizen.name}
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '1rem' }}>
            Age {selectedCase.flaggedCitizen.age} • {selectedCase.flaggedCitizen.gender} • Resident Citizen
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gov-border-subtle)', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 600 }}>
              XXXX XXXX {selectedCase.flaggedCitizen.aadhaarLast4}
            </span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} /> Verified via UIDAI e-KYC
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--gov-border-subtle)', paddingTop: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--gov-teal-850)' }}>↗ MATCH CONFIDENCE</span>
              <span style={{ color: 'var(--gov-teal-850)' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--gov-teal-700)' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', textAlign: 'center' }}>
              Exact Aadhaar identity number match detected across both pending household registries.
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards (2 Columns) matching Screenshot 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Card A: Family A (Current Claim) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>A</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>Family A (Current Claim)</span>
              </div>
              <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>Under review</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Family ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedCase.familyA.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Head of family</span>
                <span style={{ fontWeight: 600 }}>{selectedCase.familyA.head}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>District / Taluka</span>
                <span>{selectedCase.familyA.taluka}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Claimed relationship</span>
                <span style={{ fontWeight: 600 }}>{selectedCase.familyA.relation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Claim submitted</span>
                <span>{selectedCase.familyA.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Supporting documents</span>
                <span style={{ color: '#b42318', fontWeight: 600 }}>{selectedCase.familyA.doc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Family roster (4)</span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  {selectedCase.familyA.roster}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gov-border-subtle)', marginTop: '1.25rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>CLAIM ORIGIN: DIGITAL CITIZEN PORTAL</span>
              <span style={{ color: 'var(--gov-ochre-600)', fontWeight: 600, cursor: 'pointer' }}>Inspect docket ↗</span>
            </div>
          </div>

          {/* Card B: Family B (Existing Record) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>B</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>Family B (Existing Record)</span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Verified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Family ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedCase.familyB.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Head of family</span>
                <span style={{ fontWeight: 600 }}>{selectedCase.familyB.head}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>District / Taluka</span>
                <span>{selectedCase.familyB.taluka}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Claimed relationship</span>
                <span style={{ fontWeight: 600 }}>{selectedCase.familyB.relation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Claim submitted</span>
                <span>{selectedCase.familyB.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Supporting documents</span>
                <span style={{ color: '#047857', fontWeight: 600 }}>{selectedCase.familyB.doc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--gov-text-muted)' }}>Family roster (3)</span>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600 }}>
                  {selectedCase.familyB.roster}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gov-border-subtle)', marginTop: '1.25rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>CLAIM ORIGIN: JAN SEVA KENDRA KADI</span>
              <span style={{ color: 'var(--gov-teal-850)', fontWeight: 600, cursor: 'pointer' }}>View verified certificate 👁</span>
            </div>
          </div>

        </div>

        {/* Statutory Resolution Box matching Screenshot 3 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Scale size={20} color="var(--gov-teal-850)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-text-title)', margin: 0, fontWeight: 700 }}>
              Statutory resolution
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-muted)', marginBottom: '1.5rem' }}>
            {isDuplicateCase 
              ? `Select the legal household assignment for ${selectedCase.flaggedCitizen?.name || 'this citizen'}. This will trigger automated system reconciliations.`
              : `Select official adjudication determination for ${selectedCase.headOfFamily || 'this household'}. This will record your statutory decision in GovLedger.`}
          </p>

          {/* Dynamic Radio Card Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            
            {isDuplicateCase ? (
              <>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'familyA' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'familyA' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="familyA"
                    checked={resolutionChoice === 'familyA'}
                    onChange={() => setResolutionChoice('familyA')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      Keep in Family A ({selectedCase.familyA?.id || 'Primary'})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Transfers member from Family B to Family A. Family B will be automatically notified of member removal and their card status updated.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'familyB' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'familyB' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="familyB"
                    checked={resolutionChoice === 'familyB'}
                    onChange={() => setResolutionChoice('familyB')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      Keep in Family B ({selectedCase.familyB?.id || 'Secondary'})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Rejects claim in Family A. Dependent remains registered with established household record.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'hold' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'hold' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="hold"
                    checked={resolutionChoice === 'hold'}
                    onChange={() => setResolutionChoice('hold')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      Keep in neither, ask both families for proof
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Puts dependent status on administrative hold for both households until physical Talati hearing or field inquiry report is filed.
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'approve' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'approve' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="approve"
                    checked={resolutionChoice === 'approve'}
                    onChange={() => setResolutionChoice('approve')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-teal-900)' }}>
                      ✓ Approve Case & Mark GREEN Verified
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Validates the submitted evidence, seals verified status in Gujarat Civic Database, and issues official smart card update.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'reject' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'reject' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="reject"
                    checked={resolutionChoice === 'reject'}
                    onChange={() => setResolutionChoice('reject')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b91c1c' }}>
                      ✕ Reject Application / Modification
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Denies this claim with statutory reason. Dispatches formal rejection note to the citizen.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: `1px solid ${resolutionChoice === 'hold' ? 'var(--gov-teal-850)' : 'var(--gov-border)'}`,
                  backgroundColor: resolutionChoice === 'hold' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="resolution"
                    value="hold"
                    checked={resolutionChoice === 'hold'}
                    onChange={() => setResolutionChoice('hold')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      ⚠ Request Additional Physical Proof & Sub-Division Attestation
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginTop: '0.15rem' }}>
                      Keeps application under pending review and sends an action-required notice to citizen's dashboard.
                    </div>
                  </div>
                </label>
              </>
            )}

          </div>

          {/* Reasoning Textarea */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>
                Reason or note (required)
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
                Mandatory for State Civic Ledger Entry
              </span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the legal basis for this determination. This note will be recorded permanently in both family records and audit extracts..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--gov-border)',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
              required
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', marginTop: '0.3rem' }}>
              Explain the legal basis for this determination. This note will be recorded permanently in both family records and audit extracts.
            </div>
          </div>

          {/* Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--gov-border-subtle)', marginBottom: '1.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--gov-text-title)' }}>
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
            />
            <span>Notify both families of the outcome via SMS and official postal dispatch.</span>
          </label>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleResolveCase('resolve')}
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {submitting ? <RefreshCw className="spin" size={16} /> : 'Resolve case'}
              </button>

              <button
                onClick={() => handleResolveCase('proof')}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                Request proof from both
              </button>
            </div>

            <button
              onClick={() => alert('Case officially escalated to Mamlatdar (Revenue Circle 04)!')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gov-ochre-600)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Escalate to Mamlatdar →
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', marginTop: '1rem' }}>
            Your decision and note are added to both families' activity logs. They cannot be edited later once sealed.
          </div>
        </div>

        {/* Bottom Node strip matching Screenshot 3 */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
          <div>
            🛡 Official Administrative Portal • Government of Gujarat • All actions are cryptographically logged to the state civic ledger.
          </div>
          <div style={{ fontFamily: 'monospace' }}>
            NODE-ID: GJ-REV-ADM-8821
          </div>
        </div>

      </div>
    </div>
  );
}

export { OfficerCaseDetailPage };
