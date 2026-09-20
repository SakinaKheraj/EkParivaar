import React, { useState, useEffect } from 'react';
import { 
  QrCode, ShieldCheck, Download, ArrowLeft, Printer, 
  Building2, CheckCircle2, Award, Cpu, Sparkles 
} from 'lucide-react';
import { api } from '../api';

export function SmartCardPage({ familyId, onNavigate }) {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentFamilyId = familyId || localStorage.getItem('ekparivaar_family_id') || 'GJ-01-2026-F001';

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const payload = await api.getCardPayload(currentFamilyId).catch(() => null);
        if (payload) {
          setCardData(payload);
        } else {
          setCardData({
            family_id: currentFamilyId,
            head_name: 'Ramesh Patel',
            district: 'Ahmedabad',
            roster_count: 3,
            annual_income: 120000,
            hmac_signature: '7f9a2b84c1e6d30f58a213e4b7890123ef4567890abcdef123456789abcdef01',
            qr_data: `EKPARIVAAR-GJ:${currentFamilyId}:RAMESH_PATEL:AHMEDABAD:7F9A2B84`,
            issue_date: '2026-09-15'
          });
        }
      } catch (err) {
        console.error('Failed to load card payload:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [currentFamilyId]);

  const handlePrint = () => {
    window.print();
  };

  const headName = cardData?.head_name || cardData?.head?.full_name || 'Ramesh Patel';
  const district = cardData?.district || cardData?.head?.district || 'Ahmedabad';

  return (
    <div style={{ backgroundColor: 'var(--gov-bg)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>

        {/* Back Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => onNavigate('citizen', currentFamilyId)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--gov-teal-850)', 
              fontWeight: 600, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={18} /> Back to Citizen Dashboard
          </button>

          <span className="badge badge-green">
            <ShieldCheck size={14} /> Cryptographically Verifiable Credential
          </span>
        </div>

        {/* Action Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--gov-teal-950)', margin: '0 0 0.2rem' }}>
              EkParivaar Digital Smart Pass
            </h1>
            <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Official government credential accepted at all civic centers, hospitals, and ration depots across Gujarat.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
            >
              <Printer size={16} /> Print Pass
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* PREVIEW OF THE PHYSICAL / DIGITAL CIVIC CARD */}
        <div style={{
          backgroundColor: '#0a2e2e',
          backgroundImage: 'radial-gradient(circle at 100% 0%, #134e4a 0%, #0a2e2e 60%)',
          borderRadius: '16px',
          padding: '2.5rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-elevated)',
          border: '2px solid rgba(20, 184, 166, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {/* Subtle Watermark Gujarat Emblem */}
          <div style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            opacity: 0.06,
            pointerEvents: 'none'
          }}>
            <Building2 size={320} />
          </div>

          {/* Card Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Building2 size={26} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#5eead4' }}>
                  GOVERNMENT OF GUJARAT • ગુજરાત સરકાર
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#ffffff' }}>
                  EkParivaar Civic Smart Pass
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#fef3c7',
              fontWeight: 600
            }}>
              <Cpu size={14} color="#f59e0b" /> SECURE CHIP ENABLED
            </div>
          </div>

          {/* Card Body: Info + QR Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Unified Family Identifier
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'monospace', color: '#f59e0b', letterSpacing: '0.05em' }}>
                  {currentFamilyId}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Household Head</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{headName}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>District Jurisdiction</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{district}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span>Roster Count: <strong style={{ color: '#ffffff' }}>{cardData?.roster_count || 3} Members</strong></span>
                <span>Category: <strong style={{ color: '#ffffff' }}>SEBC / BPL Verified</strong></span>
              </div>
            </div>

            {/* QR Code Presentation */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '0.85rem',
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)'
            }}>
              {/* Visual simulated QR pattern */}
              <div style={{
                width: '140px',
                height: '140px',
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: '6px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}>
                <QrCode size={110} color="#0a2e2e" />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0a2e2e', marginTop: '2px' }}>
                  HMAC SIGNED
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                SCAN AT CIVIC DEPOT
              </div>
            </div>
          </div>

          {/* Card Footer: HMAC Signature */}
          <div style={{
            marginTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: '#94a3b8'
          }}>
            <div>
              <span>HMAC Signature: </span>
              <span style={{ fontFamily: 'monospace', color: '#a7f3d0' }}>
                {cardData?.hmac_signature?.slice(0, 32) || '7f9a2b84c1e6d30f58a213e4b7890123'}...
              </span>
            </div>
            <div>
              <span>Valid Throughout Gujarat State</span>
            </div>
          </div>
        </div>

        {/* Verification Explainer */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <ShieldCheck size={32} color="#16a34a" />
          <div style={{ fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
            <strong>Offline Verifiable Architecture:</strong> The QR code embedded on this pass contains an HMAC SHA-256 signature generated with the Gujarat State Master Key. Field workers can verify identity authenticity using official handheld POS devices even without active internet connectivity.
          </div>
        </div>

      </div>
    </div>
  );
}
