import React, { useState, useEffect } from 'react';
import { 
  Check, Clock, FileText, Phone, Mail, ArrowLeft, ArrowRight,
  Printer, AlertCircle, ExternalLink, ShieldCheck, 
  HelpCircle, Eye, ChevronRight, RefreshCw, Users, Award, 
  QrCode, Building2, UserPlus, Layers, CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { api } from '../api';

export function CitizenDashboard({ familyId, currentUser, currentView = 'dashboard', onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [welfareData, setWelfareData] = useState(null);
  const [adjudications, setAdjudications] = useState([]);
  const [activeTab, setActiveTab] = useState(currentView === 'requests' ? 'requests' : 'overview');

  useEffect(() => {
    if (currentView === 'requests') {
      setActiveTab('requests');
    } else if (currentView === 'dashboard' || currentView === 'citizen') {
      setActiveTab('overview');
    }
  }, [currentView]);

  const activeFamId = familyId || currentUser?.family_id || localStorage.getItem('ekparivaar_family_id');

  const loadDashboardData = async () => {
    try {
      const storedAdj = JSON.parse(localStorage.getItem('ekparivaar_adjudications') || '[]');
      if (Array.isArray(storedAdj)) setAdjudications(storedAdj);
    } catch (e) {}

    if (!activeFamId) return;
    setLoading(true);
    try {
      const [famStatus, audit, welfare] = await Promise.all([
        api.getFamilyStatus(activeFamId).catch(() => null),
        api.getAuditTrail(activeFamId).catch(() => null),
        api.getWelfareSummary(activeFamId).catch(() => null)
      ]);
      if (famStatus) setFamilyData(famStatus);
      if (audit && (audit.entries || audit.audit_trail)) {
        setAuditLogs(audit.entries || audit.audit_trail || []);
      }
      if (welfare) setWelfareData(welfare);
    } catch (err) {
      console.error('Error loading citizen dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeFamId]);

  const user = currentUser || {
    full_name: 'Ramesh Patel',
    family_id: activeFamId || 'GJ-01-2026-F001',
    district: 'Ahmedabad'
  };

  const members = Array.isArray(familyData?.members) ? familyData.members : [];
  const status = familyData?.overall_status || 'VERIFIED';
  const unlockedAid = welfareData?.total_unlocked_annual_value 
    ? `₹${Number(welfareData.total_unlocked_annual_value).toLocaleString('en-IN')}` 
    : '₹5,25,000';

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* Top Breadcrumb & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
            <span style={{ color: 'var(--gov-teal-850)', fontWeight: 600 }}>Citizen Portal</span>
            <span>/</span>
            <span>Household Dashboard</span>
          </div>

          <button
            onClick={loadDashboardData}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gov-teal-800)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
        </div>

        {/* Header Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--gov-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: 0 }}>
                Welcome, {user.full_name || 'Ramesh Patel'}
              </h1>
              {status === 'VERIFIED' ? (
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} /> VERIFIED HOUSEHOLD
                </span>
              ) : status === 'FLAGGED' ? (
                <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={13} /> UNDER STATUTORY REVIEW
                </span>
              ) : (
                <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> PENDING VERIFICATION
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--gov-text-muted)' }}>
              Gujarat EkParivaar ID: <strong style={{ fontFamily: 'monospace', color: 'var(--gov-teal-950)' }}>{activeFamId || 'GJ-2026-8849-012'}</strong> • Jurisdiction: <strong>Ahmedabad Sub-Division</strong>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('smart-card')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
            >
              <QrCode size={16} /> Digital Smart Pass
            </button>
            <button
              onClick={() => onNavigate('schemes')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
            >
              <Award size={16} /> Claim Welfare Aid <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation: Overview vs Statutory Requests */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gov-border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? 'var(--gov-teal-850)' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : 'var(--gov-text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.25rem',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Household Overview
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              background: activeTab === 'requests' ? 'var(--gov-teal-850)' : 'transparent',
              color: activeTab === 'requests' ? '#ffffff' : 'var(--gov-text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1.25rem',
              fontWeight: activeTab === 'requests' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={15} /> Statutory Requests & Claims
            {adjudications.length > 0 && (
              <span style={{ background: '#0d9488', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px' }}>
                {adjudications.length}
              </span>
            )}
          </button>
        </div>

        {/* REQUESTS TAB CONTENT */}
        {activeTab === 'requests' && (
          <div style={{ marginBottom: '2rem' }}>
            {/* Officer Decisions & Statutory Notices */}
            {adjudications.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #0d9488',
                padding: '1.5rem 1.75rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px -4px rgba(13, 148, 136, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--gov-teal-950)', margin: 0, fontWeight: 700 }}>
                        Official Officer Adjudications & Direct Notes
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                        Official determinations signed by revenue officer and committed to Gujarat GovLedger
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    <ShieldCheck size={13} style={{ marginRight: '4px' }} /> GovLedger Sealed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {adjudications.map((adj, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gov-teal-950)' }}>
                          Case #{adj.caseNumber || 'REQ-2026-09-01'} • {adj.caseType || 'Statutory Review'}
                        </div>
                        <span style={{
                          backgroundColor: String(adj.decision || '').toLowerCase().includes('reject') ? '#fee2e2' : '#dcfce7',
                          color: String(adj.decision || '').toLowerCase().includes('reject') ? '#991b1b' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {adj.decision || 'Approved'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#134e4a', lineHeight: 1.5, marginBottom: '0.6rem', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e6fffa' }}>
                        "{adj.reason || 'Verified and updated in registry.'}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                        <span>Adjudicating Officer: <strong>{adj.decidedBy || 'Talati, Revenue Desk'}</strong></span>
                        <span style={{ fontFamily: 'monospace' }}>{adj.timestamp || 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Entitlement Requests Table */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--gov-border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', margin: 0 }}>
                  Active Scheme Applications & Roster Updates
                </h3>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <Award size={14} /> Apply for New Welfare Aid
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--gov-border)', color: 'var(--gov-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Application Ref</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Scheme / Request</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Beneficiary</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Estimated Value</th>
                      <th style={{ padding: '0.85rem 1rem' }}>SLA / Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--gov-teal-950)' }}>
                        APPL-2026-PMJAY-081
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        Ayushman Bharat Gujarat (PMJAY-MA)
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gov-text-body)' }}>
                        All Household Members
                      </td>
                      <td style={{ padding: '1rem', color: '#166534', fontWeight: 700 }}>
                        ₹10,00,000 / year
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> ACTIVE / DIRECT ROUTED
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onNavigate('audit')}
                          style={{ background: 'none', border: 'none', color: 'var(--gov-teal-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          GovLedger Block #1 →
                        </button>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--gov-teal-950)' }}>
                        APPL-2026-NLY-044
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        Namo Lakshmi Yojana (Girls Secondary Edu)
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gov-text-body)' }}>
                        Dependent Student
                      </td>
                      <td style={{ padding: '1rem', color: '#166534', fontWeight: 700 }}>
                        ₹50,000 (Direct DBT)
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> ENTITLED & LINKED
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onNavigate('audit')}
                          style={{ background: 'none', border: 'none', color: 'var(--gov-teal-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          GovLedger Block #2 →
                        </button>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--gov-teal-950)' }}>
                        REQ-2026-ROSTER-01
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        Household Member Registration & e-KYC
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gov-text-body)' }}>
                        {user.full_name || 'Ramesh Patel'}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gov-text-muted)' }}>
                        Civic Identity Grid
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> ZERO-TRUST VERIFIED
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onNavigate('audit')}
                          style={{ background: 'none', border: 'none', color: 'var(--gov-teal-800)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          Genesis Block →
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === 'overview' && (
          <>
            {/* Officer Decisions & Statutory Notices on Overview */}
            {adjudications.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #0d9488',
                padding: '1.5rem 1.75rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px -4px rgba(13, 148, 136, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--gov-teal-950)', margin: 0, fontWeight: 700 }}>
                        Official Officer Adjudication & Statutory Notice
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                        Official determinations signed by revenue officer and committed to Gujarat GovLedger
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    <ShieldCheck size={13} style={{ marginRight: '4px' }} /> GovLedger Sealed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {adjudications.slice(0, 2).map((adj, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '10px', padding: '1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gov-teal-950)' }}>
                          Case #{adj.caseNumber || 'REQ-2026-09-01'} • {adj.caseType || 'Statutory Review'}
                        </div>
                        <span style={{
                          backgroundColor: String(adj.decision || '').toLowerCase().includes('reject') ? '#fee2e2' : '#dcfce7',
                          color: String(adj.decision || '').toLowerCase().includes('reject') ? '#991b1b' : '#166534',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {adj.decision || 'Approved'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#134e4a', lineHeight: 1.5, marginBottom: '0.6rem', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e6fffa' }}>
                        "{adj.reason || 'Determination processed and recorded.'}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                        <span>Adjudicating Authority: <strong>{adj.decidedBy || 'Talati, Mehsana (Desk 04)'}</strong></span>
                        <span style={{ fontFamily: 'monospace' }}>{adj.timestamp || 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 Overview Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              
              {/* Card 1: Family Roster */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--gov-border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Family Roster
                  </span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--gov-teal-50)', color: 'var(--gov-teal-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gov-teal-950)' }}>
                  {members.length || 1} Member{members.length > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => onNavigate('members')}
                  style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--gov-ochre-600)', fontWeight: 600, fontSize: '0.8rem', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Manage & Add Dependents →
                </button>
              </div>

              {/* Card 2: Welfare Entitlements */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--gov-border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Unlocked Welfare Aid
                  </span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309' }}>
                  {unlockedAid}
                </div>
                <button
                  onClick={() => onNavigate('schemes')}
                  style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--gov-ochre-600)', fontWeight: 600, fontSize: '0.8rem', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {welfareData?.eligible_schemes_count || 3} Eligible Schemes →
                </button>
              </div>

              {/* Card 3: Kinship Network */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--gov-border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Kinship Deduplication
                  </span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gov-teal-950)' }}>
                  Zero Collisions
                </div>
                <button
                  onClick={() => onNavigate('kinship')}
                  style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--gov-teal-850)', fontWeight: 600, fontSize: '0.8rem', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Open Kinship Graph →
                </button>
              </div>

              {/* Card 4: GovLedger Security */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--gov-border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    GovLedger Blockchain
                  </span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--gov-teal-900)', color: '#5eead4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#166534' }}>
                  SHA-256 Chained
                </div>
                <button
                  onClick={() => onNavigate('audit')}
                  style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--gov-teal-850)', fontWeight: 600, fontSize: '0.8rem', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Verify Audit Explorer →
                </button>
              </div>

            </div>

            {/* 2-Column Split: Members Roster & GovLedger Activity Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.75rem', alignItems: 'flex-start' }}>
              
              {/* LEFT: Live Members Roster */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--gov-border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--gov-teal-950)', margin: '0 0 0.2rem' }}>
                      Household Members ({members.length})
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gov-text-muted)' }}>
                      Verified family members tied to this household ID
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('members')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <UserPlus size={14} /> Add Member
                  </button>
                </div>

                {members.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gov-text-muted)', fontSize: '0.85rem' }}>
                    No members recorded yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--gov-border)', color: 'var(--gov-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.65rem 0.5rem' }}>Name</th>
                          <th style={{ padding: '0.65rem 0.5rem' }}>Relation</th>
                          <th style={{ padding: '0.65rem 0.5rem' }}>Aadhaar</th>
                          <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m, idx) => (
                          <tr key={m.member_id || idx} style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                            <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>
                              {m.full_name || 'Citizen'}
                              {m.relationship_type === 'head' && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--gov-ochre-600)', background: 'var(--gov-ochre-50)', padding: '2px 5px', borderRadius: '4px', marginLeft: '5px', fontWeight: 700 }}>
                                  HEAD
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', color: 'var(--gov-text-body)', textTransform: 'capitalize' }}>
                              {m.relationship_type || 'Member'}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', color: 'var(--gov-text-muted)' }}>
                              {m.aadhaar_last4 ? `•••• ${m.aadhaar_last4}` : '•••• ••••'}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              {m.verification_status === 'GREEN' ? (
                                <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                  VERIFIED
                                </span>
                              ) : m.verification_status === 'RED' ? (
                                <span className="badge badge-red" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                  FLAGGED
                                </span>
                              ) : (
                                <span className="badge badge-yellow" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                  PENDING
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RIGHT: GovLedger Statutory Audit Log */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--gov-border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', margin: '0 0 0.2rem' }}>
                      GovLedger Event Log
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                      Statutory cryptographic hash chain
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('audit')}
                    style={{ background: 'none', border: 'none', color: 'var(--gov-teal-800)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Full Explorer →
                  </button>
                </div>

                {auditLogs.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--gov-text-muted)', fontSize: '0.8rem' }}>
                    <ShieldCheck size={28} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Genesis record confirmed. Household registered on Gujarat civic grid.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div 
                        key={log.log_id || idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid var(--gov-border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--gov-teal-900)' }}>
                            {log.field_changed ? String(log.field_changed).replace(/_/g, ' ').toUpperCase() : 'HOUSEHOLD EVENT'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--gov-text-muted)', fontFamily: 'monospace' }}>
                            Block #{log.log_id || idx + 1}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--gov-text-body)', marginBottom: '0.35rem' }}>
                          {log.new_value || log.reason || 'Verified on Gujarat GovLedger'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--gov-text-muted)' }}>
                          <span>By: {log.changed_by ? (String(log.changed_by).length > 12 ? String(log.changed_by).slice(0, 10) + '...' : String(log.changed_by)) : 'Authorized Authority'}</span>
                          <span style={{ fontFamily: 'monospace' }}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recently'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CitizenDashboard;
