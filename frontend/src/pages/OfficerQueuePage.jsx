import React, { useState, useEffect } from 'react';
import { 
  Search, Download, AlertTriangle, Clock, ChevronRight, 
  FileText, ShieldAlert, ArrowUpRight, HelpCircle, CheckCircle2, 
  Hourglass, User, Building2, ExternalLink, Trash2, Check, X, RefreshCw
} from 'lucide-react';
import { api } from '../api';

export function OfficerQueuePage({ currentOfficer, onSelectCase, onOpenEscalated }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const officer = currentOfficer || {
    name: 'Amit Sharma',
    role: 'Talati, Ahmedabad',
    desk: 'Zone 04 • Revenue Desk'
  };

  const isMamlatdar = officer.role?.toLowerCase().includes('mamlatdar');
  const isCollector = officer.role?.toLowerCase().includes('collector');

  // Role-customized dataset
  const getRoleDefaultCases = () => {
    if (isMamlatdar) {
      return [
        {
          id: 'case-esc-1',
          priority: 'HIGH',
          familyId: 'GJ-2025-8849-012',
          headOfFamily: 'Ramesh K. Patel',
          caseType: 'Duplicate Aadhaar (Overdue 72h SLA)',
          submitted: '5 days ago',
          timeLeft: 'Overdue by 24h',
          isOverdue: true,
          status: 'Escalated',
          flaggedCitizen: { name: 'Meena P. Patel', age: 66, gender: 'Female', aadhaarLast4: '3456', relationship: 'Mother' },
          familyA: { id: 'GJ-2025-8849-012', head: 'Ramesh K. Patel', taluka: 'Mehsana (Rural)', relation: 'Mother', date: '07 Sep 2025', doc: 'Self-attestation', roster: '2 verified | 1 review | 1 blocked' },
          familyB: { id: 'GJ-2025-7731-044', head: 'Sunita D. Shah', taluka: 'Kadi Taluka', relation: 'Mother-in-law', date: '21 Jun 2025', doc: 'Birth cert. verified', roster: 'All 3 verified' }
        },
        {
          id: 'case-esc-2',
          priority: 'HIGH',
          familyId: 'GJ-2025-9012-330',
          headOfFamily: 'Kirit P. Modi',
          caseType: 'Inter-Taluka Address Transfer Collision',
          submitted: '4 days ago',
          timeLeft: 'Due today',
          isOverdue: true,
          status: 'Escalated',
          flaggedCitizen: { name: 'Kirit P. Modi', age: 48, gender: 'Male', aadhaarLast4: '8812', relationship: 'Head' },
          familyA: { id: 'GJ-2025-9012-330', head: 'Kirit P. Modi', taluka: 'Ahmedabad (City)', relation: 'Head', date: '10 Sep 2026', doc: 'Electricity bill submitted', roster: '3 verified' },
          familyB: { id: 'GJ-2024-1102-881', head: 'Hasmukh Modi', taluka: 'Gandhinagar', relation: 'Brother', date: '12 Jan 2024', doc: 'Prior family card', roster: '4 verified' }
        },
        {
          id: 'case-esc-3',
          priority: 'MEDIUM',
          familyId: 'GJ-2025-6120-207',
          headOfFamily: 'Mahesh B. Desai',
          caseType: 'Annual Income Tier Reclassification (₹1.8L -> ₹3.5L)',
          submitted: '3 days ago',
          timeLeft: '18h remaining',
          isOverdue: false,
          status: 'Pending',
          flaggedCitizen: { name: 'Mahesh B. Desai', age: 52, gender: 'Male', aadhaarLast4: '9921', relationship: 'Head' }
        }
      ];
    }

    // Default Talati Ward Cases
    return [
      {
        id: 'case-1',
        priority: 'HIGH',
        familyId: 'GJ-2025-8849-012',
        headOfFamily: 'Ramesh K. Patel',
        caseType: 'Duplicate Aadhaar',
        submitted: '5 days ago',
        timeLeft: 'Overdue by 1 day',
        isOverdue: true,
        status: 'Blocked',
        flaggedCitizen: { name: 'Meena P. Patel', age: 66, gender: 'Female', aadhaarLast4: '3456', relationship: 'Mother' },
        familyA: { id: 'GJ-2025-8849-012', head: 'Ramesh K. Patel', taluka: 'Ahmedabad (Zone 04)', relation: 'Mother', date: '07 Sep 2025', doc: 'Consent self-attested', roster: '2 verified | 1 review | 1 blocked' },
        familyB: { id: 'GJ-2025-7731-044', head: 'Sunita D. Shah', taluka: 'Mehsana', relation: 'Mother-in-law', date: '21 Jun 2025', doc: 'Birth cert. verified', roster: 'All 3 verified' }
      },
      {
        id: 'case-2',
        priority: 'HIGH',
        familyId: 'GJ-2025-7731-044',
        headOfFamily: 'Sunita D. Shah',
        caseType: 'Duplicate Aadhaar',
        submitted: '4 days ago',
        timeLeft: 'Due today',
        isOverdue: true,
        status: 'Blocked',
        flaggedCitizen: { name: 'Pooja Patel', age: 22, gender: 'Female', aadhaarLast4: '4001', relationship: 'Daughter' },
        familyA: { id: 'GJ-01-2026-F001', head: 'Ramesh Patel', taluka: 'Ahmedabad', relation: 'Daughter', date: '14 Sep 2026', doc: 'Ration card attached', roster: '2 verified | 1 review' },
        familyB: { id: 'GJ-2025-7731-044', head: 'Sunita D. Shah', taluka: 'Mehsana', relation: 'Daughter-in-law', date: '21 Jun 2025', doc: 'Marriage proof uploaded', roster: '3 verified' }
      },
      {
        id: 'case-3',
        priority: 'MEDIUM',
        familyId: 'GJ-2025-8849-012',
        headOfFamily: 'Ramesh K. Patel',
        caseType: 'Birth certificate check',
        submitted: '3 days ago',
        timeLeft: '2 days left',
        isOverdue: false,
        status: 'Pending'
      },
      {
        id: 'case-4',
        priority: 'MEDIUM',
        familyId: 'GJ-2025-6120-207',
        headOfFamily: 'Mahesh B. Desai',
        caseType: 'Income change',
        submitted: '2 days ago',
        timeLeft: '3 days left',
        isOverdue: false,
        status: 'Pending'
      },
      {
        id: 'case-5',
        priority: 'MEDIUM',
        familyId: 'GJ-2025-5504-119',
        headOfFamily: 'Hina S. Vora',
        caseType: 'Marriage certificate check',
        submitted: '2 days ago',
        timeLeft: '3 days left',
        isOverdue: false,
        status: 'Pending'
      },
      {
        id: 'case-6',
        priority: 'MEDIUM',
        familyId: 'GJ-2025-9012-330',
        headOfFamily: 'Kirit P. Modi',
        caseType: 'Address change (cross-district)',
        submitted: '1 day ago',
        timeLeft: '4 days left',
        isOverdue: false,
        status: 'Pending'
      },
      {
        id: 'case-7',
        priority: 'LOW',
        familyId: 'GJ-2025-4478-081',
        headOfFamily: 'Jayesh T. Rana',
        caseType: 'Name correction',
        submitted: 'today',
        timeLeft: '5 days left',
        isOverdue: false,
        status: 'Pending'
      }
    ];
  };

  const loadPending = async () => {
    setLoading(true);
    const resolvedList = JSON.parse(localStorage.getItem('ekparivaar_resolved_cases') || '[]');

    try {
      const res = await api.getPendingReviews().catch(() => null);
      if (res && (res.flagged_members?.length > 0 || res.duplicate_flags?.length > 0)) {
        const mappedCases = [];

        (res.duplicate_flags || []).forEach((flag, idx) => {
          const cid = flag.flag_id || `flag-${idx}`;
          if (!resolvedList.includes(cid)) {
            mappedCases.push({
              id: cid,
              memberId: flag.flag_id,
              priority: flag.urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
              familyId: flag.family_id_a ? `GJ-${String(flag.family_id_a).slice(0, 8)}` : 'GJ-2026-8849-012',
              headOfFamily: flag.citizen_name || 'Flagged Citizen',
              caseType: 'Duplicate Aadhaar (Cross-Household)',
              submitted: 'Recently',
              timeLeft: `${flag.sla_remaining_hours || 72}h SLA remaining`,
              isOverdue: flag.sla_status === 'BREACHED_ESCALATED',
              status: 'Blocked',
              flaggedCitizen: {
                id: flag.flag_id,
                name: flag.citizen_name || 'Citizen',
                dob: flag.citizen_dob,
                aadhaarLast4: flag.aadhaar_last4 || '••••',
                relationship: 'Dependent'
              },
              familyA: {
                id: flag.family_id_a,
                head: flag.citizen_name,
                taluka: 'Ahmedabad (Urban)',
                relation: 'Claimant A',
                date: 'Recently',
                doc: 'Aadhaar Biometric e-KYC',
                roster: '1 review'
              },
              familyB: {
                id: flag.family_id_b,
                head: 'Secondary Household',
                taluka: 'Ahmedabad (Rural)',
                relation: 'Claimant B',
                date: 'Active Record',
                doc: 'Prior registration',
                roster: '1 conflict'
              }
            });
          }
        });

        (res.flagged_members || []).forEach((m, idx) => {
          const cid = m.member_id || `mem-${idx}`;
          if (!resolvedList.includes(cid) && !mappedCases.some(c => c.flaggedCitizen?.name === m.citizen_name)) {
            mappedCases.push({
              id: cid,
              memberId: m.member_id,
              priority: m.verification_status === 'RED' ? 'HIGH' : 'MEDIUM',
              familyId: m.family_id ? `GJ-${String(m.family_id).slice(0, 8)}` : 'GJ-2026-8849-012',
              headOfFamily: m.citizen_name || 'Applicant',
              caseType: m.verification_status === 'RED' ? 'Duplicate Aadhaar' : 'Identity Mismatch',
              submitted: 'Recently',
              timeLeft: '48h SLA remaining',
              isOverdue: false,
              status: 'Pending',
              flaggedCitizen: {
                id: m.member_id,
                name: m.citizen_name || 'Citizen',
                dob: m.citizen_dob,
                aadhaarLast4: m.aadhaar_last4 || '••••',
                relationship: m.relationship_type || 'Member'
              },
              familyA: {
                id: m.family_id,
                head: m.citizen_name,
                taluka: m.district || 'Ahmedabad',
                relation: m.relationship_type || 'Member',
                date: 'Recently',
                doc: 'Identity Record',
                roster: 'Pending Officer Review'
              },
              familyB: {
                id: 'Prior-Registry',
                head: 'State Database',
                taluka: m.district || 'Ahmedabad',
                relation: 'Prior Verification',
                date: 'Prior Record',
                doc: 'UIDAI Master Record',
                roster: 'Disputed'
              }
            });
          }
        });

        const initialList = mappedCases.length > 0 ? mappedCases : getRoleDefaultCases();
        setCases(initialList.filter(c => !resolvedList.includes(c.id)));
      } else {
        const rawDefaults = getRoleDefaultCases();
        setCases(rawDefaults.filter(c => !resolvedList.includes(c.id)));
      }
    } catch (err) {
      console.error('Error loading pending cases:', err);
      const rawDefaults = getRoleDefaultCases();
      setCases(rawDefaults.filter(c => !resolvedList.includes(c.id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [officer.name, officer.role]);

  const handleQuickResolve = (e, caseItem, decisionType) => {
    e.stopPropagation();

    // 1. Persist resolved case ID so it is deleted permanently from this table
    const resolvedList = JSON.parse(localStorage.getItem('ekparivaar_resolved_cases') || '[]');
    if (!resolvedList.includes(caseItem.id)) {
      resolvedList.push(caseItem.id);
      localStorage.setItem('ekparivaar_resolved_cases', JSON.stringify(resolvedList));
    }

    // 2. Persist adjudication notice for citizen portal
    const adjudications = JSON.parse(localStorage.getItem('ekparivaar_adjudications') || '[]');
    adjudications.unshift({
      caseNumber: `REQ-2026-09-${Math.floor(1000 + Math.random() * 9000)}`,
      caseId: caseItem.id,
      caseType: caseItem.caseType,
      decision: decisionType === 'approve' ? 'Approved & Sealed' : 'Rejected',
      decidedBy: `${officer.name} (${officer.role || 'Officer'})`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      subjectName: caseItem.flaggedCitizen?.name || caseItem.headOfFamily,
      familyId: caseItem.familyId,
      reason: decisionType === 'approve' 
        ? `Statutory verification completed by ${officer.name}. Household record approved on GovLedger.` 
        : `Rejected following document discrepancy inquiry by ${officer.name}.`
    });
    localStorage.setItem('ekparivaar_adjudications', JSON.stringify(adjudications));

    // 3. Delete from active queue state in real time
    setCases(prev => prev.filter(c => c.id !== caseItem.id));
    setToastMessage(`✓ Case #${caseItem.id} (${caseItem.headOfFamily}) was ${decisionType === 'approve' ? 'APPROVED' : 'REJECTED'} and removed from the review queue.`);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const filteredCases = cases.filter(c => {
    if (activeFilter === 'duplicate' && !String(c.caseType || '').toLowerCase().includes('duplicate')) return false;
    if (activeFilter === 'documents' && !String(c.caseType || '').toLowerCase().includes('certificate')) return false;
    if (activeFilter === 'income' && !String(c.caseType || '').toLowerCase().includes('income')) return false;
    if (activeFilter === 'amendments' && !String(c.caseType || '').toLowerCase().includes('change') && !String(c.caseType || '').toLowerCase().includes('correction') && !String(c.caseType || '').toLowerCase().includes('transfer')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return String(c.familyId || '').toLowerCase().includes(q) || String(c.headOfFamily || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container">

        {/* Breadcrumb matching Screenshot 2 */}
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gov-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          OFFICER CONSOLE / {isMamlatdar ? 'SUPERVISORY ESCALATIONS' : isCollector ? 'STATE POLICY OVERSIGHT' : 'WARD REVIEW QUEUE'}
        </div>

        {/* Live Action Toast Banner */}
        {toastMessage && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            color: '#166534',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#16a34a" /> {toastMessage}
            </div>
            <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Title & Subtitle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
              {isMamlatdar ? 'Mamlatdar Escalation Desk' : isCollector ? 'District Collector Queue' : 'Review Queue'}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--gov-text-muted)' }}>
              {isMamlatdar ? 'Sub-Divisional 72h SLA escalations and multi-taluka disputes.' : isCollector ? 'Apex state-level conflict realignments and governance audits.' : 'Local ward verification cases assigned to your revenue desk.'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid #bae6fd'
            }}>
              <Building2 size={14} />
              {officer.role || 'Talati Desk'} • {officer.name}
            </div>

            <button
              onClick={loadPending}
              style={{
                background: '#ffffff',
                border: '1px solid var(--gov-border)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--gov-text-title)'
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Matching Screenshot 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPEN CASES
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>
                {filteredCases.length}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>active in queue</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DUE TODAY
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>
                {filteredCases.filter(c => String(c.timeLeft || '').includes('today')).length || 1}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>immediate action</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#fffcfb', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #fecdca', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b42318', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OVERDUE SLA
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#b42318' }}>
                {filteredCases.filter(c => c.isOverdue).length}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#b42318', fontWeight: 600 }}>breached SLA</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RESOLVED THIS SESSION
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-teal-800)' }}>
                {JSON.parse(localStorage.getItem('ekparivaar_resolved_cases') || '[]').length}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>cleared & sealed</span>
            </div>
          </div>

        </div>

        {/* Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All cases (${cases.length})` },
              { id: 'duplicate', label: 'Duplicate Aadhaar' },
              { id: 'documents', label: 'Certificates' },
              { id: 'income', label: 'Income' },
              { id: 'amendments', label: 'Amendments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  border: activeFilter === tab.id ? '1px solid var(--gov-teal-900)' : '1px solid var(--gov-border)',
                  backgroundColor: activeFilter === tab.id ? 'var(--gov-teal-900)' : '#ffffff',
                  color: activeFilter === tab.id ? '#ffffff' : 'var(--gov-text-body)',
                  fontWeight: activeFilter === tab.id ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={16} color="var(--gov-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search family ID or applicant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid var(--gov-border)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Main Cases Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {filteredCases.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--gov-text-muted)' }}>
              <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--gov-text-title)', margin: '0 0 0.35rem' }}>
                All Assigned Cases Cleared!
              </h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                Zero pending review items in your jurisdiction queue.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--gov-border)', color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.9rem 1.25rem' }}>Priority</th>
                    <th style={{ padding: '0.9rem 1.25rem' }}>Family ID</th>
                    <th style={{ padding: '0.9rem 1.25rem' }}>Applicant Name</th>
                    <th style={{ padding: '0.9rem 1.25rem' }}>Case Type</th>
                    <th style={{ padding: '0.9rem 1.25rem' }}>SLA Timer</th>
                    <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c, idx) => {
                    const isHigh = c.priority === 'HIGH';
                    const isOverdue = c.isOverdue;

                    return (
                      <tr 
                        key={c.id || idx}
                        onClick={() => onSelectCase(c)}
                        style={{
                          borderBottom: '1px solid var(--gov-border-subtle)',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        className="hover-row"
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isHigh ? '#fee2e2' : '#fef3c7',
                            color: isHigh ? '#991b1b' : '#92400e'
                          }}>
                            {c.priority || 'MEDIUM'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--gov-teal-950)' }}>
                          {c.familyId || 'GJ-2025-8849-012'}
                        </td>

                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>
                          {c.headOfFamily || 'Applicant'}
                          {c.flaggedCitizen?.name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', fontWeight: 400 }}>
                              Flagged: {c.flaggedCitizen.name} ({c.flaggedCitizen.relationship || 'Dependent'})
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '1rem 1.25rem', color: 'var(--gov-text-body)' }}>
                          {c.caseType || 'Statutory Verification'}
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: isOverdue ? '#b91c1c' : '#475467'
                          }}>
                            <Clock size={13} /> {c.timeLeft || '48h remaining'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: c.status === 'Blocked' ? '#fef2f2' : '#f0fdf4',
                            color: c.status === 'Blocked' ? '#b91c1c' : '#166534'
                          }}>
                            {c.status || 'Pending'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              title="Quick Approve & Remove"
                              onClick={(e) => handleQuickResolve(e, c, 'approve')}
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#166534',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>

                            <button
                              title="Reject & Remove"
                              onClick={(e) => handleQuickResolve(e, c, 'reject')}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <X size={12} /> Reject
                            </button>

                            <button
                              onClick={() => onSelectCase(c)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--gov-teal-850)',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OfficerQueuePage;
