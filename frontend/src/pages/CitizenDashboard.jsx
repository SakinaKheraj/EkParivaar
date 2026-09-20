import React, { useState } from 'react';
import { 
  Check, Clock, FileText, Phone, Mail, ArrowLeft, 
  Printer, AlertCircle, ExternalLink, ShieldCheck, 
  HelpCircle, Eye, ChevronRight 
} from 'lucide-react';

export default function CitizenDashboard({ familyId, currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'roster'

  const user = currentUser || {
    full_name: 'Ramesh K. Patel',
    family_id: familyId || 'GJ-2026-8849-012',
    district: 'Mehsana'
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>

        {/* Top Breadcrumbs matching Screenshot 5 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
            <span style={{ color: 'var(--gov-teal-850)', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Dashboard</span>
            <span>/</span>
            <span style={{ color: 'var(--gov-teal-850)', cursor: 'pointer' }}>Requests</span>
            <span>/</span>
            <span>REQ-2025-0193</span>
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

        {/* Page Title & Status Pill matching Screenshot 5 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: 0 }}>
            Income update
          </h1>
          <span style={{
            backgroundColor: '#fffaeb',
            color: '#b54708',
            border: '1px solid #fedf89',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <Clock size={12} /> Pending
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '2rem' }}>
          Submitted on 12 Sep 2025 at 10:24 AM • Reference ID: <strong>REQ-2025-0193</strong>
        </div>

        {/* 2-Column Layout matching Screenshot 5 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: STATUS TIMELINE (5 MILESTONES) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gov-text-title)', margin: 0 }}>
                Status timeline
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
                5 MILESTONES
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '2rem' }}>
              End-to-end statutory audit log of this grievance request
            </div>

            {/* Vertical Stepper */}
            <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
              
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '12px',
                bottom: '24px',
                width: '2px',
                backgroundColor: '#e2e8f0',
                zIndex: 0
              }} />

              {/* Step 1: Completed */}
              <div style={{ position: 'relative', marginBottom: '2.25rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0d3635',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Check size={16} strokeWidth={2.5} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    Request submitted
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                    12 Sep 2025, 10:24 AM
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '0.5rem' }}>
                  You changed family income from ₹1,60,000 to ₹2,40,000.
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475467',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={12} /> Aadhaar e-KYC Consent Token verified
                </span>
              </div>

              {/* Step 2: Completed */}
              <div style={{ position: 'relative', marginBottom: '2.25rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0d3635',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Check size={16} strokeWidth={2.5} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    Eligibility re-checked
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                    12 Sep 2025, 10:24 AM
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)', marginBottom: '0.5rem' }}>
                  3 schemes were re-evaluated with your new income.
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475467', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                    NFSA Ration Card (Category B)
                  </span>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475467', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                    Mukhyamantri Amrutam
                  </span>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div style={{ position: 'relative', marginBottom: '2.25rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0d3635',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Check size={16} strokeWidth={2.5} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    Sent to Talati for review
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                    12 Sep 2025, 10:30 AM
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>
                  Assigned to Talati, Mehsana.<br />
                  Routing node: Revenue Circle 04 / Sachivalaya Gateway
                </div>
              </div>

              {/* Step 4: Current (In Progress) */}
              <div style={{ position: 'relative', marginBottom: '2.25rem' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fffbeb',
                  border: '2px solid #f59e0b',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Clock size={16} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                      Officer review
                    </span>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      IN PROGRESS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                    Current step • Due in 3 days
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-body)', marginBottom: '0.75rem' }}>
                  Review in progress. Desk officer is verifying supporting income documents.
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--gov-border-subtle)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.75rem',
                  color: 'var(--gov-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <FileText size={14} /> Reviewing Authority: Designated Revenue Officer (Desk 3), Mehsana District Office
                </div>
              </div>

              {/* Step 5: Upcoming */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Check size={16} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gov-text-muted)' }}>
                    Decision
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                    Expected by 17 Sep 2025
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>
                  You'll be notified here and by SMS.
                </div>
              </div>

            </div>

            {/* Alert Yellow Box matching Screenshot 5 */}
            <div style={{
              marginTop: '2.5rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: '#92400e'
            }}>
              <HelpCircle size={16} color="#b45309" />
              <span>Some scheme results may change if this is approved. <strong style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => onNavigate('schemes')}>See affected schemes</strong></span>
            </div>

            {/* Footer Buttons */}
            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                <ArrowLeft size={14} /> Back to requests
              </button>

              <button
                onClick={() => window.print()}
                style={{ background: 'none', border: 'none', color: 'var(--gov-text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Printer size={14} /> Print acknowledgment
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: 3 CARDS MATCHING SCREENSHOT 5 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Card 1: Response Time (Statutory SLA) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--gov-border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RESPONSE TIME
                </span>
                <span style={{
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}>
                  Statutory SLA
                </span>
              </div>

              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--gov-teal-950)', margin: '0.2rem 0' }}>
                3 days left
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginBottom: '0.75rem' }}>
                Day 2 of 5 • Target: <strong>15 Sep 2025</strong>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                <div style={{ width: '40%', height: '100%', backgroundColor: 'var(--gov-teal-800)' }} />
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', lineHeight: 1.5, margin: 0 }}>
                If this isn't reviewed in time, it moves to the Mamlatdar automatically under the Gujarat Public Services Guarantee Act.
              </p>

              <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--gov-teal-850)', fontWeight: 600, cursor: 'pointer' }}>
                Right to Service Guarantee Section 4(1) →
              </div>
            </div>

            {/* Card 2: What Changed (Field Modification) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--gov-border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gov-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  WHAT CHANGED
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
                  Field Modification
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ color: 'var(--gov-text-muted)', borderBottom: '1px solid var(--gov-border-subtle)', textAlign: 'left', fontSize: '0.72rem' }}>
                    <th style={{ paddingBottom: '0.4rem' }}>Field</th>
                    <th style={{ paddingBottom: '0.4rem' }}>Before</th>
                    <th style={{ paddingBottom: '0.4rem', textAlign: 'right' }}>After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ paddingTop: '0.5rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>Family income</td>
                    <td style={{ paddingTop: '0.5rem', textDecoration: 'line-through', color: 'var(--gov-text-muted)' }}>₹1,60,000</td>
                    <td style={{ paddingTop: '0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--gov-text-title)' }}>₹2,40,000</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                Nothing changes on your record until an officer approves this.
              </div>

              {/* PDF Proof Attachment */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--gov-border)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--gov-ochre-600)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gov-text-title)' }}>ITR_V_AY2024-25.pdf</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gov-text-muted)' }}>Income Proof • 842 KB</div>
                  </div>
                </div>
                <Eye size={15} color="var(--gov-text-muted)" style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Card 3: Need Help With This Request? */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid var(--gov-border)',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                Need help with this request?
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Quote reference number <strong>REQ-2025-0193</strong> when calling the Mehsana Civic Service Desk.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gov-text-body)' }}>
                  <Phone size={14} color="var(--gov-teal-850)" />
                  <span>Civic Helpline: <strong>1800 233 5500</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gov-text-body)' }}>
                  <Mail size={14} color="var(--gov-teal-850)" />
                  <span>grievance-familyid@gujarat.gov.in</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export { CitizenDashboard };
