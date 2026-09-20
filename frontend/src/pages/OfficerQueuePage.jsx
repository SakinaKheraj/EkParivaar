import React, { useState, useEffect } from 'react';
import { 
  Search, Download, AlertTriangle, Clock, ChevronRight, 
  FileText, ShieldAlert, ArrowUpRight, HelpCircle, CheckCircle2, 
  Hourglass, User, Building2, ExternalLink 
} from 'lucide-react';
import { api } from '../api';

export default function OfficerQueuePage({ onSelectCase, onOpenEscalated }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);

  // Default mock dataset exactly matching Screenshot 2
  const defaultCases = [
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
      familyA: { id: 'GJ-2025-8849-012', head: 'Ramesh K. Patel', taluka: 'Mehsana (Mehsana Rural)', relation: 'Mother', date: '07 Sep 2025 (5 days ago)', doc: 'None uploaded (Consent self-attested only)', roster: '2 verified | 1 review | 1 blocked' },
      familyB: { id: 'GJ-2025-7731-044', head: 'Sunita D. Shah', taluka: 'Mehsana (Kadi Taluka)', relation: 'Mother-in-law', date: '21 Jun 2025 (Active since 3 mos)', doc: 'Birth cert. uploaded (Verified 24 Jun 2025)', roster: 'All 3 verified' }
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
      familyA: { id: 'GJ-01-2026-F001', head: 'Ramesh Patel', taluka: 'Ahmedabad', relation: 'Daughter', date: '14 Sep 2026', doc: 'Ration card copy attached', roster: '2 verified | 1 review' },
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

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingReviews().catch(() => null);
      if (res && res.cases && res.cases.length > 0) {
        setCases(res.cases);
      } else {
        setCases(defaultCases);
      }
    } catch (err) {
      console.error('Error loading pending cases:', err);
      setCases(defaultCases);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    if (activeFilter === 'duplicate' && !c.caseType?.toLowerCase().includes('duplicate')) return false;
    if (activeFilter === 'documents' && !c.caseType?.toLowerCase().includes('certificate')) return false;
    if (activeFilter === 'income' && !c.caseType?.toLowerCase().includes('income')) return false;
    if (activeFilter === 'amendments' && !c.caseType?.toLowerCase().includes('change') && !c.caseType?.toLowerCase().includes('correction')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.familyId?.toLowerCase().includes(q) || c.headOfFamily?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container">

        {/* Breadcrumb matching Screenshot 2 */}
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gov-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          OFFICER CONSOLE / REVIEW QUEUE
        </div>

        {/* Title & Subtitle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
              Review queue
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--gov-text-muted)' }}>
              Cases that need a decision in Mehsana.
            </div>
          </div>

          <div style={{
            backgroundColor: '#e2e8f0',
            color: '#475467',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            Sample data
          </div>
        </div>

        {/* 4 Stat Cards Matching Screenshot 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPEN CASES
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>12</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>active</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DUE TODAY
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>5</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>immediate action</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#fffcfb', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #fecdca', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b42318', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OVERDUE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#b42318' }}>2</span>
              <span style={{ fontSize: '0.82rem', color: '#b42318', fontWeight: 600 }}>breached SLA</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid var(--gov-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RESOLVED THIS WEEK
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-teal-800)' }}>18</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>cleared</span>
            </div>
          </div>

        </div>

        {/* Filter and Search Bar Matching Screenshot 2 */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--gov-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Family ID or name..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--gov-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--gov-border)', backgroundColor: '#ffffff', fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
            <option>Case type: All types</option>
            <option>Duplicate Aadhaar</option>
            <option>Income change</option>
            <option>Certificate checks</option>
          </select>

          <select style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--gov-border)', backgroundColor: '#ffffff', fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
            <option>Priority: All</option>
            <option>High (Breached / Due)</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--gov-border)', backgroundColor: '#ffffff', fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
            <option>Due date: All dates</option>
            <option>Today</option>
            <option>Next 3 days</option>
          </select>

          <button className="btn btn-secondary" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
            <Download size={15} /> Export
          </button>
        </div>

        {/* Filter Pills Matching Screenshot 2 */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All cases (12)' },
            { id: 'documents', label: 'Documents to check (4)' },
            { id: 'duplicate', label: 'Duplicate Aadhaar (2)' },
            { id: 'income', label: 'Income change (3)' },
            { id: 'amendments', label: 'Amendments (3)' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              style={{
                backgroundColor: activeFilter === pill.id ? '#0d3635' : '#ffffff',
                color: activeFilter === pill.id ? '#ffffff' : 'var(--gov-text-body)',
                border: `1px solid ${activeFilter === pill.id ? '#0d3635' : 'var(--gov-border)'}`,
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: activeFilter === pill.id ? 700 : 500,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Case Table Matching Screenshot 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--gov-border)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gov-text-muted)', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>PRIORITY</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>FAMILY ID</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>HEAD OF FAMILY</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>CASE TYPE</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>SUBMITTED</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>TIME LEFT</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>STATUS</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, idx) => (
                <tr
                  key={c.id || idx}
                  onClick={() => onSelectCase(c)}
                  style={{
                    borderBottom: '1px solid var(--gov-border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Priority */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      backgroundColor: c.priority === 'HIGH' ? '#b42318' : c.priority === 'MEDIUM' ? '#f1f5f9' : '#f8fafc',
                      color: c.priority === 'HIGH' ? '#ffffff' : '#475467',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      {c.priority}
                    </span>
                  </td>

                  {/* Family ID */}
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--gov-text-title)' }}>
                    {c.familyId}
                  </td>

                  {/* Head of Family */}
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    {c.headOfFamily}
                  </td>

                  {/* Case Type */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {c.caseType?.includes('Duplicate') ? (
                        <AlertTriangle size={15} color="#b42318" />
                      ) : (
                        <FileText size={15} color="var(--gov-text-muted)" />
                      )}
                      <span>{c.caseType}</span>
                    </div>
                  </td>

                  {/* Submitted */}
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--gov-text-muted)' }}>
                    {c.submitted}
                  </td>

                  {/* Time Left */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: c.isOverdue ? '#b42318' : 'var(--gov-text-muted)', fontWeight: c.isOverdue ? 600 : 400 }}>
                      <Clock size={14} color={c.isOverdue ? '#b42318' : 'var(--gov-text-muted)'} />
                      <span>{c.timeLeft}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {c.status === 'Blocked' ? (
                      <span style={{
                        backgroundColor: '#fef3f2',
                        color: '#b42318',
                        border: '1px solid #fecdca',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <AlertTriangle size={11} /> Blocked
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475467',
                        border: '1px solid #e2e8f0',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <Hourglass size={11} /> Pending
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--gov-text-muted)' }}>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination bar matching Screenshot 2 */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--gov-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--gov-text-muted)'
          }}>
            <div>Showing <strong>1–{filteredCases.length}</strong> of <strong>12</strong> cases</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', opacity: 0.6 }}>Previous</button>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>Next</button>
            </div>
          </div>
        </div>

        {/* Bottom statutory notice matching Screenshot 2 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={15} color="var(--gov-text-muted)" />
            Cases not resolved by their deadline move to the Mamlatdar automatically under the Gujarat Public Services Act.
          </div>

          <button
            onClick={onOpenEscalated}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gov-ochre-600)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.82rem'
            }}
          >
            View Escalated Cases →
          </button>
        </div>

        {/* Official Node strip at the bottom */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
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

export { OfficerQueuePage };
