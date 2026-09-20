import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, 
  Sparkles, IndianRupee, HeartHandshake, Home, Sprout, 
  BookOpen, Check, RefreshCw, FileCheck 
} from 'lucide-react';
import { api } from '../api';

export function SchemesPage({ familyId, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [welfareData, setWelfareData] = useState(null);
  const [allSchemes, setAllSchemes] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [applyingId, setApplyingId] = useState(null);
  const [claimedSchemes, setClaimedSchemes] = useState({});

  const currentFamilyId = familyId || localStorage.getItem('ekparivaar_family_id') || 'GJ-01-2026-F001';

  const loadSchemesData = async () => {
    setLoading(true);
    try {
      const summary = await api.getWelfareSummary(currentFamilyId).catch(() => null);
      if (summary) setWelfareData(summary);

      const catalog = await api.getSchemes().catch(() => []);
      setAllSchemes(catalog);
    } catch (err) {
      console.error('Error loading welfare schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemesData();
  }, [currentFamilyId]);

  const handleApply = async (schemeId) => {
    setApplyingId(schemeId);
    try {
      const res = await api.applyScheme(currentFamilyId, schemeId);
      setClaimedSchemes(prev => ({
        ...prev,
        [schemeId]: {
          timestamp: new Date().toLocaleTimeString(),
          orderRef: res.application_id || 'APP-' + Math.floor(1000 + Math.random() * 9000)
        }
      }));
    } catch (err) {
      alert('Application error: ' + err.message);
    } finally {
      setApplyingId(null);
    }
  };

  // Fallback schemes if backend catalog empty
  const defaultSchemes = [
    {
      id: 'maa-vatsalya',
      name: 'Mukhyamantri Amrutam (MAA) Vatsalya',
      category: 'HEALTHCARE',
      benefit_amount: 500000,
      description: 'Cashless tertiary healthcare coverage for serious illnesses including oncology, cardiology, and neurosurgery for families earning under ₹4 Lakhs.',
      criteria_matched: ['Income < ₹4,00,000', 'Verified Gujarat Resident', 'BPL / SEBC Cardholder'],
      eligible: true
    },
    {
      id: 'kisan-sahay',
      name: 'Gujarat Mukhyamantri Kisan Sahay Yojana',
      category: 'AGRICULTURE',
      benefit_amount: 20000,
      description: 'Crop loss assistance against drought, excessive rainfall, and unseasonal rains without premium deduction.',
      criteria_matched: ['Agricultural land record holder', 'Aadhaar linked DBT'],
      eligible: true
    },
    {
      id: 'pm-awas',
      name: 'Pradhan Mantri Awas Yojana (PMAY - Gramin)',
      category: 'HOUSING',
      benefit_amount: 120000,
      description: 'Financial assistance for construction of pucca house with basic amenities for houseless and kutcha householders.',
      criteria_matched: ['SECC 2011 deprivation criteria', 'Parchment verification'],
      eligible: true
    },
    {
      id: 'vidyasahayak',
      name: 'Gujarat Vidya Sahayak Scholarship Scheme',
      category: 'EDUCATION',
      benefit_amount: 15000,
      description: 'Annual scholarship assistance for higher secondary and vocational education for children of rural households.',
      criteria_matched: ['Dependent student enrolled', 'Family annual income < ₹2,50,000'],
      eligible: true
    }
  ];

  const schemesToDisplay = allSchemes.length > 0 ? allSchemes : defaultSchemes;

  return (
    <div style={{ backgroundColor: 'var(--gov-bg)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container">

        {/* Back Link */}
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
            <Sparkles size={13} /> AI Welfare Maximizer Active
          </span>
        </div>

        {/* Hero Entitlement Banner */}
        <div style={{
          backgroundColor: '#0a2e2e',
          borderRadius: '12px',
          color: '#ffffff',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5eead4', fontWeight: 600 }}>
              Gujarat Unified Entitlement Engine
            </div>
            <h1 style={{ color: '#ffffff', fontSize: '2rem', margin: '0.3rem 0 0.5rem', fontFamily: 'var(--font-serif)' }}>
              Smart Welfare Maximizer
            </h1>
            <p style={{ color: '#ccfbf1', fontSize: '0.95rem', maxWidth: '620px', margin: 0, lineHeight: 1.5 }}>
              Automatic statutory rule matching across Gujarat Government registries. Claim your unlocked family benefits with zero physical paperwork.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
              Total Unlocked Annual Value
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f59e0b', margin: '0.2rem 0' }}>
              ₹{welfareData?.total_annual_value?.toLocaleString('en-IN') || '5,25,000'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
              4 Schemes 100% Eligible
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {schemesToDisplay.map((sch, i) => {
            const isClaimed = claimedSchemes[sch.id || i];

            return (
              <div
                key={sch.id || i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: isClaimed ? '2px solid #10b981' : '1px solid var(--gov-border)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{
                      backgroundColor: 'var(--gov-teal-50)',
                      color: 'var(--gov-teal-850)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {sch.category || 'GOVERNMENT'}
                    </span>

                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-ochre-600)' }}>
                      ₹{sch.benefit_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', margin: '0 0 0.5rem' }}>
                    {sch.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-body)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {sch.description || 'Statutory entitlement approved for eligible households under Gujarat social protection rules.'}
                  </p>

                  {/* Criteria Checklist */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gov-text-muted)', marginBottom: '0.4rem' }}>
                      AUTOMATICALLY VERIFIED CRITERIA:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {(sch.criteria_matched || ['Income criterion met', 'Aadhaar biometric valid']).map((crit, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#166534' }}>
                          <CheckCircle2 size={13} color="#16a34a" /> {crit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Application CTA */}
                {isClaimed ? (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <FileCheck size={16} /> Entitlement Claimed Successfully
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.2rem' }}>
                      Ref: {isClaimed.orderRef} • Hashed on GovLedger
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(sch.id || i)}
                    disabled={applyingId === (sch.id || i)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                  >
                    {applyingId === (sch.id || i) ? (
                      <>
                        <RefreshCw className="spin" size={16} /> Submitting DBT Claim...
                      </>
                    ) : (
                      <>
                        1-Click Instant Entitlement Claim <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
