import React from 'react';
import { 
  Check, ArrowRight, ArrowLeft, Clock, ShieldCheck, 
  ExternalLink, Building2, HelpCircle 
} from 'lucide-react';

export default function OfficerDecisionPage({ decisionData, onBackToQueue, onOpenNextCase }) {
  const data = decisionData || {
    caseNumber: 'REQ-2025-0188',
    decision: 'Approved',
    decidedBy: 'Talati, Mehsana',
    timestamp: 'Today, 12 Sep 2025 • 11:42 AM',
    subjectName: 'Dhruv R. Patel'
  };

  const escalatedCases = [
    {
      familyId: 'GJ-2025-3310-992',
      headOfFamily: 'Bhavesh N. Trivedi',
      caseType: 'Land holding rectification',
      reason: 'Not resolved within 5 working days',
      timeEscalated: 'Today, 09:15 AM'
    },
    {
      familyId: 'GJ-2025-1108-415',
      headOfFamily: 'Parulben M. Joshi',
      caseType: 'Deceased member removal',
      reason: 'Not resolved within 5 working days',
      timeEscalated: 'Yesterday, 05:30 PM'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>

        {/* 1. DECISION RECORDED CARD (Matching Screenshot 4) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--gov-border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '560px',
          margin: '0 auto 4rem',
          textAlign: 'center'
        }}>
          
          {/* Green Check Circle */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Check size={26} strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0 0 0.5rem' }}>
            Decision recorded
          </h1>

          <p style={{ fontSize: '0.88rem', color: 'var(--gov-text-muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
            Approved: Birth certificate for <strong>{data.subjectName}</strong>. The family has been notified and their status timeline is updated.
          </p>

          {/* Details Table */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid var(--gov-border-subtle)',
            padding: '1rem 1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--gov-border-subtle)' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>Case number</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{data.caseNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid var(--gov-border-subtle)' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>Decision</span>
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Check size={12} /> Approved
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--gov-border-subtle)' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>Decided by</span>
              <span style={{ fontWeight: 600 }}>{data.decidedBy}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>Timestamp</span>
              <span style={{ color: 'var(--gov-text-title)' }}>{data.timestamp}</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={onOpenNextCase || onBackToQueue}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
            >
              Open next case
            </button>

            <button
              onClick={onBackToQueue}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
            >
              Back to queue
            </button>
          </div>

        </div>

        {/* 2. ESCALATED TO MAMLATDAR SECTION (Matching Screenshot 4) */}
        <div style={{ marginBottom: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: 0 }}>
                Escalated to Mamlatdar
              </h2>
              <span style={{
                backgroundColor: '#f1f5f9',
                color: '#475467',
                border: '1px solid #cbd5e1',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                SLA REASSIGNMENTS: 02
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
              <Clock size={14} /> Statutory 5-day cycle rule active
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--gov-text-muted)', marginBottom: '1.5rem' }}>
            Cases that miss their deadline move up automatically and are marked here.
          </div>

          {/* Escalated Table */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.25rem'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--gov-border)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--gov-text-muted)', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>FAMILY ID</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>HEAD OF FAMILY</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>CASE TYPE</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>ESCALATION STATUS</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>REASON</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>TIME ESCALATED</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {escalatedCases.map((esc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {esc.familyId}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      {esc.headOfFamily}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {esc.caseType}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        backgroundColor: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        ↑ Escalated to Mamlatdar
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--gov-text-muted)' }}>
                      {esc.reason}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--gov-text-muted)' }}>
                      {esc.timeEscalated}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <span style={{ color: 'var(--gov-text-title)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        View handover record →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🛡 Under the Gujarat Public Services Guarantee Act, unadjudicated requests are systematically reassigned to supervisory revenue authorities.
          </div>
        </div>

        {/* Bottom Strip matching Screenshot 4 */}
        <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
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

export { OfficerDecisionPage };
