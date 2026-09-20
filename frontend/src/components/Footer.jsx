import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--gov-border)', marginTop: '4rem' }}>
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
          {/* Column 1: Authority */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', marginBottom: '0.75rem' }}>
              EkParivaar Authority (ગુજરાત એક પરિવાર)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Department of Science & Technology, Government of Gujarat. Providing secure, consent-based digital identification and direct social security entitlement routing across all 33 districts.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf3', color: '#027a48', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #a6f4c5' }}>
              <ShieldCheck size={14} />
              UIDAI & G-CLOUD CERTIFIED PLATFORM
            </div>
          </div>

          {/* Column 2: Governance */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', marginBottom: '0.75rem' }}>
              Statutory & Governance
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Governed under the Gujarat Digital Citizen Entitlement Act and Digital Personal Data Protection (DPDP) Framework.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gov-text-secondary)', lineHeight: 1.5 }}>
              <strong>Grievance Redressal Officer:</strong> Block 7, Sachivalaya, Gandhinagar<br />
              <strong>Citizen Helpline:</strong> 1800 233 5500 (09:00 AM – 06:00 PM)<br />
              <strong>Direct Support:</strong> support-ekparivaar@gujarat.gov.in
            </p>
          </div>

          {/* Column 3: Zero-Knowledge Security */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', marginBottom: '0.75rem' }}>
              Zero-Knowledge Architecture
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              End-to-end cryptographic GovLedger verification ensuring zero unauthorized disclosure of sensitive demographic data. Plaintext 12-digit Aadhaar numbers are never stored.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--gov-border)' }}>
              <Lock size={14} style={{ color: 'var(--gov-teal-800)' }} />
              ISO 27001 & ISO 27701 COMPLIANT
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div style={{
          borderTop: '1px solid var(--gov-border)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--gov-text-muted)'
        }}>
          <div>
            © 2026 Government of Gujarat. All rights reserved. Only the last 4 digits of Aadhaar are displayed.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Security Audits</span>
            <span style={{ cursor: 'pointer' }}>Hyperlink Policy</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--gov-teal-800)', fontWeight: 600 }}>NODE-ID: GJ-REV-ADM-8821</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
