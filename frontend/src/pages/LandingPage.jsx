import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, QrCode, ArrowRight, FileText, Search, 
  UserCheck, HelpCircle, Phone, Sparkles, ChevronDown, ChevronUp, 
  Lock, Check, Building2, MapPin, ExternalLink, RefreshCw 
} from 'lucide-react';

export default function LandingPage({ onOpenLogin, onOpenSchemes, onTrackClick }) {
  const [faqOpen, setFaqOpen] = useState({ 0: true, 1: false, 2: false });
  const [talukaSearch, setTalukaSearch] = useState('');
  const [talukaResult, setTalukaResult] = useState(null);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleTalukaSearch = (e) => {
    e.preventDefault();
    if (talukaSearch.trim()) {
      setTalukaResult(`32 Jan Seva Kendras and Gram Panchayats active in ${talukaSearch}. Average wait time: 8 mins.`);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* 1. HERO SECTION (Screenshot 1) */}
      <section style={{ textAlign: 'center', paddingTop: '3.5rem', paddingBottom: '3rem' }} className="container">
        
        {/* Phase Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#fef3f2',
          color: 'var(--gov-ochre-700)',
          padding: '4px 14px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          border: '1px solid #fee4e2',
          marginBottom: '1.5rem',
          letterSpacing: '0.04em'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gov-ochre-600)', display: 'inline-block' }} />
          PHASE 04: CIVIC DATA GRID 2.0 • શૂન્ય-વિશ્વાસ ડિજિટલ રજિસ્ટ્રી
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          fontFamily: 'var(--font-serif)',
          color: 'var(--gov-text-title)',
          lineHeight: 1.15,
          maxWidth: '860px',
          margin: '0 auto 1.25rem',
          letterSpacing: '-0.02em'
        }}>
          One family. One verified ID.<br />
          <span style={{ fontStyle: 'italic', color: 'var(--gov-ochre-600)', fontWeight: 600 }}>
            Every Gujarat scheme you qualify for.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--gov-text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Register your household once. Experience real-time biometric trust, zero-document scheme matching, and instant direct benefit disbursements across 33 districts.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button
            onClick={onOpenLogin}
            className="btn btn-primary"
            style={{ fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(185, 56, 21, 0.25)' }}
          >
            લોગિન કરો (Sign in with Aadhaar) <ArrowRight size={16} />
          </button>

          <button
            onClick={onOpenLogin}
            className="btn btn-secondary"
            style={{ fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: '8px' }}
          >
            સ્ટેટસ ચકાસો (Check Status)
          </button>
        </div>

        {/* 2. FLOATING CITIZEN SMART PASS (Directly matching Mockup in Screenshot 1) */}
        <div style={{
          backgroundColor: '#061e1e',
          backgroundImage: 'radial-gradient(circle at 100% 0%, #10433f 0%, #061e1e 70%)',
          borderRadius: '20px',
          padding: '2.5rem',
          color: '#ffffff',
          boxShadow: '0 25px 60px -15px rgba(6, 30, 30, 0.35)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          maxWidth: '920px',
          margin: '0 auto',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Watermark Emblem */}
          <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.05, pointerEvents: 'none' }}>
            <Building2 size={340} />
          </div>

          {/* Pass Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span>
              <div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#5eead4', fontWeight: 700, textTransform: 'uppercase' }}>
                  GOVERNMENT OF GUJARAT • ગુજરાત સરકાર
                </span>
                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Citizen Smart Pass
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>FAMILY ID • MEHSANA ZONE</div>
              <div style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>
                GJ-2026-8849-012
              </div>
            </div>
          </div>

          {/* Pass 3-Column Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 180px', gap: '2rem', alignItems: 'center' }}>
            
            {/* Col 1: Head Profile */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#0d3635',
                  border: '2px solid #5eead4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#ffffff'
                }}>
                  RP
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>HOUSEHOLD HEAD</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Ramesh K. Patel</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Age 52 • Mehsana Rural, GJ</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: '#5eead4',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'inline-block'
              }}>
                SEBC/OBC • BPL Tier-1 Verified
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  REGISTERED ROSTER (5)
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['PP', 'SP', 'KP'].map((init, i) => (
                    <div key={i} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#ffffff', fontWeight: 600 }}>
                      {init}
                    </div>
                  ))}
                  <div style={{ padding: '2px 6px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.08)', fontSize: '0.68rem', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                    +2 MORE
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Schemes In Status */}
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                AUTOMATICALLY UNLOCKED WELFARE (₹5,20,000 TOTAL)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>MAA Amrutam Healthcare</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>₹5,00,000 Annual Family Shield</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#065f46', color: '#a7f3d0', padding: '2px 8px', borderRadius: '4px' }}>
                    Auto-Approved
                  </span>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Saraswati Vidya Grant</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Higher Secondary Scholarship</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#9a3412', color: '#fed7aa', padding: '2px 8px', borderRadius: '4px' }}>
                    Ready to Apply
                  </span>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Kisan Sahay SAMRUDDHI</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Direct quarterly crop weather</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#1e3a8a', color: '#bfdbfe', padding: '2px 8px', borderRadius: '4px' }}>
                    Active (Direct DBT)
                  </span>
                </div>
              </div>
            </div>

            {/* Col 3: QR Block & Verification */}
            <div style={{ textAlign: 'center', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'inline-block',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                marginBottom: '0.5rem'
              }}>
                <QrCode size={110} color="#061e1e" />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Scan to verify on blockchain
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5eead4', marginTop: '0.25rem' }}>
                764 adm. units
              </div>
            </div>

          </div>

          {/* Pass Bottom Strip */}
          <div style={{
            marginTop: '1.75rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}>
            <div>
              Living Civic Record: Auto-updated against civil registers and land records
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
              <span>SECURE CHIP</span> • <span>256-BIT</span> • <span>TAMPER-PROOF</span> • <span>VERIFIED STATE ID</span>
            </div>
          </div>

        </div>

      </section>

      {/* 3. HOW GUJARAT FAMILY ID WORKS (Screenshot 1) */}
      <section style={{ backgroundColor: '#fafbfc', padding: '5rem 0', borderTop: '1px solid var(--gov-border-subtle)', borderBottom: '1px solid var(--gov-border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ffffff',
            border: '1px solid var(--gov-border)',
            padding: '3px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--gov-text-muted)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}>
            સરળ 5-પગલાંની પ્રક્રિયા
          </div>

          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0 0 0.5rem' }}>
            How Gujarat Family ID Works
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--gov-text-muted)', maxWidth: '580px', margin: '0 auto 3.5rem' }}>
            From a seamless mobile OTP authentication to instant direct welfare access.
          </p>

          {/* 5 Numbered Diamond Steps in a row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              { num: '01', title: 'Verify Mobile', desc: 'Sign in using your Aadhaar-registered mobile number with high-security multi-factor OTP.' },
              { num: '02', title: 'Add Members', desc: 'Add each family member. Details auto-retrieved from civil registries without retyping.' },
              { num: '03', title: 'Instant Verify', desc: 'Zero paper or testifiers. Verified against Ration Card, Jan Aadhaar, and land records.' },
              { num: '04', title: 'Get Family ID', desc: 'Download your official QR-verified citizen pass directly to DigiLocker and Apple/Google Wallet.' },
              { num: '05', title: 'Apply in 1-Click', desc: 'Access pre-sanctioned government welfare programs and direct funds directly to your bank account.' }
            ].map((st, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                {/* Diamond Box */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 1.25rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ transform: 'rotate(-45deg)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--gov-ochre-600)' }}>
                    {st.num}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-ochre-600)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  પગલું {st.num}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. UNIFIED CITIZEN GRID: ALL SERVICES IN SYNC (Screenshot 1: 2x2 Grid) */}
      <section style={{ padding: '5rem 0' }} className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gov-ochre-600)', fontWeight: 700, textTransform: 'uppercase' }}>
              તમામ ડિજિટલ સેવાઓ એકસાથે
            </div>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0.2rem 0 0' }}>
              Unified Citizen Grid: All Services in Sync
            </h2>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--gov-text-muted)' }}>
            Currently interconnected with 43+ active Gujarat Welfare Schemes
          </div>
        </div>

        {/* 2x2 Services Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.75rem' }}>
          
          {/* Card 1: See What You Qualify For */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
                  See What You Qualify For
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
                  તમારા પરિવાર માટે લાયક યોજનાઓ
                </div>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                AI Recommendation Active
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gov-border-subtle)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>HEALTH GRANT</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gov-text-title)', margin: '0.2rem 0' }}>₹50,000</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', lineHeight: 1.4 }}>Mukhyamantri Amrutam Healthcare free diagnostics & treatment</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>100% Eligible</span>
                  <span style={{ color: 'var(--gov-ochre-600)', fontWeight: 600, cursor: 'pointer' }} onClick={onOpenLogin}>Apply ›</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gov-border-subtle)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>SCHOLARSHIP</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gov-text-title)', margin: '0.2rem 0' }}>₹18,000</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', lineHeight: 1.4 }}>Saraswati Technical Grant annual assistance for polytechnic & engineering</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: '#475467' }}>Member: Chirag P.</span>
                  <span style={{ color: 'var(--gov-ochre-600)', fontWeight: 600, cursor: 'pointer' }} onClick={onOpenLogin}>Apply ›</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gov-border-subtle)' }}>
              <span style={{ color: 'var(--gov-text-muted)' }}>Showing 2 of 12 matched regional welfare programs</span>
              <button 
                onClick={onOpenSchemes}
                style={{ background: 'none', border: 'none', color: 'var(--gov-ochre-600)', fontWeight: 600, cursor: 'pointer' }}
              >
                સંપૂર્ણ યોજના યાદી જુઓ (View All) →
              </button>
            </div>
          </div>

          {/* Card 2: Track Every Request */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
                  Track Every Request
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
                  તમારી દરેક અરજીનું સ્ટેટસ અહીં જુઓ
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--gov-text-muted)', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                APP-GJ-2025-0193
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--gov-border-subtle)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                  Claim Type: <span style={{ fontWeight: 500 }}>Statutory District Housing Subsidized Grant</span>
                </span>
                <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>Stage 4 of 5: Final Sanction</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginBottom: '0.85rem' }}>
                <div>SUBMITTED<br /><strong style={{ color: 'var(--gov-text-title)' }}>Sep 07</strong></div>
                <div>AADHAAR REF<br /><strong style={{ color: 'var(--gov-text-title)' }}>3456</strong></div>
                <div>DESK OFFICER<br /><strong style={{ color: 'var(--gov-text-title)' }}>Talati (Desk 04)</strong></div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span>Current Desk: <strong>Mamlatdar Revenue Office, Mehsana</strong></span>
                <span style={{ color: '#c2410c', fontWeight: 600 }}>SLA: 3 Days</span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onTrackClick ? onTrackClick() : onOpenLogin(); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter Reference or Family Number..."
                style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gov-border)', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                ચકાસો (Track)
              </button>
            </form>
          </div>

          {/* Card 3: Update Without Worry */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
              Update Without Worry
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)', marginBottom: '1.25rem' }}>
              સરળતાથી સુધારો કરો, ભૂલો વિના
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-body)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Household composition changes naturally. Update your family record without bureaucratic runaround through our verified single-touch lifecycle buttons:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {['New Birth', 'Marriage', 'Relocation'].map((act, i) => (
                <button
                  key={i}
                  onClick={onOpenLogin}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--gov-border)',
                    borderRadius: '8px',
                    padding: '0.85rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>+</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>{act}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gov-text-muted)' }}>Add to roster</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#166534' }}>
              <CheckCircle2 size={14} color="#16a34a" /> All updates auto-sync across ration and revenue databases.
            </div>
          </div>

          {/* Card 4: Claim-Click & Apply */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-text-title)', margin: '0 0 0.2rem' }}>
                  Claim-Click & Apply
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
                  એક જ ક્લિકમાં સીધો લાભ મેળવો
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>Instant • Nov 21, 2025</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gov-border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#047857', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={13} /> Pre-Populated Application Payload
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--gov-text-muted)' }}>HOUSEHOLD HEAD</span>
                  <div style={{ fontWeight: 700, color: 'var(--gov-text-title)' }}>Ramesh K. Patel</div>
                </div>
                <div>
                  <span style={{ color: 'var(--gov-text-muted)' }}>ANNUAL INCOME</span>
                  <div style={{ fontWeight: 700, color: 'var(--gov-text-title)' }}>₹2,40,000 (Verified)</div>
                </div>
                <div>
                  <span style={{ color: 'var(--gov-text-muted)' }}>DBT ACCOUNT</span>
                  <div style={{ fontWeight: 700, color: 'var(--gov-text-title)' }}>SBI **** 4002</div>
                </div>
              </div>
              <div style={{ marginTop: '0.65rem', fontSize: '0.7rem', color: '#166534', fontWeight: 600 }}>
                3 Agricultural Documents Pre-Attached
              </div>
            </div>

            <button
              onClick={onOpenLogin}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              ૧-ક્લિક સીધા લાભમાં મોકલો (Submit 1-Click) →
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--gov-text-muted)', marginTop: '0.5rem' }}>
              No physical form or paper submission required.
            </div>
          </div>

        </div>
      </section>

      {/* 5. SUPPORT BANNER CARDS (Screenshot 1: Help Close to Home + Helpline) */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.75rem' }}>
          
          {/* Card Left: Dark Teal "Help Close to Home" */}
          <div style={{
            backgroundColor: '#0d3635',
            borderRadius: '16px',
            color: '#ffffff',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: '#5eead4',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                ઘર નજીક સહાય સેવા કેન્દ્રો
              </div>

              <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', color: '#ffffff', margin: '0 0 0.5rem' }}>
                Help Close to Home
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#ccfbf1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We are everywhere in digital Gujarat! Every Village Computer Entrepreneur (VCE), Gram Panchayat, and CSC in Gujarat is certified to assist your family without charge.
              </p>

              <form onSubmit={handleTalukaSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={talukaSearch}
                  onChange={(e) => setTalukaSearch(e.target.value)}
                  placeholder="તમારો તાલુકો અથવા ગામ લખો (e.g. Mehsana)"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem' }}
                >
                  શોધો (Search)
                </button>
              </form>

              {talukaResult && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: '#5eead4' }}>
                  {talukaResult}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#99f6e4', marginTop: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} /> Standardized Rates Only</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Check size={14} /> Free Biometric Scans</span>
            </div>
          </div>

          {/* Card Right: Terracotta "ગુજરાતી સભ્ય સેવા હેલ્પલાઇન" */}
          <div style={{
            backgroundColor: 'var(--gov-ochre-600)',
            borderRadius: '16px',
            color: '#ffffff',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fed7aa', fontWeight: 700, marginBottom: '0.5rem' }}>
                1800 233 5500 • STATE HELPLINE
              </div>

              <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: '#ffffff', margin: '0 0 0.5rem' }}>
                ગુજરાતી સભ્ય સેવા હેલ્પલાઇન
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#fee4e2', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Direct conversational support in pure Gujarati and English. Our civic experts guide you through registration, grievance redressal, and tracking.
              </p>

              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  TOLL-FREE HELPLINE
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em', margin: '0.2rem 0' }}>
                  1800 233 5500
                </div>
                <div style={{ fontSize: '0.78rem', color: '#fee4e2' }}>
                  Mon–Sat, 8:00 AM to 8:00 PM
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open('https://wa.me/', '_blank')}
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--gov-ochre-700)',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Phone size={16} /> વ્હોટ્સએપ સહાય મેળવો (WhatsApp Help)
            </button>
          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION (Screenshot 1) */}
      <section id="faq-section" className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gov-ochre-600)', fontWeight: 700, textTransform: 'uppercase' }}>
            વારંવાર પૂછાતા પ્રશ્નો
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0.2rem 0 0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gov-text-muted)' }}>
            Everything you need to know about Gujarat Family ID digital identity.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            {
              q: 'Who can register as the head of the family?',
              a: 'Any adult citizen (aged 18 or above) who holds a valid Gujarat residential address and Aadhaar card may be designated as the family head. Usually, this is the primary ration card anchor or earning adult.'
            },
            {
              q: 'Is my Aadhaar number stored securely?',
              a: 'Yes. The platform operates on a zero-knowledge architecture. Actual 12-digit Aadhaar numbers are never stored in plaintext format. They are vaulted through UIDAI-certified tokenization engines with SHA-256 encryption. Only the masked last 4 digits are rendered on host passes.'
            },
            {
              q: 'Do we need to submit physical paper documents at government offices?',
              a: 'No. The entire verification pipeline uses automatic registry cross-matching against Jan Aadhaar, Ration Card, Revenue Land Records, and Civil Registry. Field visits only happen in rare duplicate dispute scenarios.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--gov-border)',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  padding: '1.15rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  color: 'var(--gov-text-title)'
                }}
              >
                <span>{item.q}</span>
                {faqOpen[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {faqOpen[idx] && (
                <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.85rem', color: 'var(--gov-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--gov-border-subtle)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export { LandingPage };
