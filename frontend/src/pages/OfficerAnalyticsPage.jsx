import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, AlertTriangle, ShieldCheck, 
  TrendingUp, BarChart3, CheckCircle2, Clock, 
  ArrowLeft, RefreshCw, FileText, Award, MapPin, 
  Layers, ArrowUpRight, Search, ShieldAlert
} from 'lucide-react';
import { api } from '../api';

export function OfficerAnalyticsPage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOfficerAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load district analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const familyStats = analytics?.family_stats || {
    total: 0,
    verified: 0,
    flagged: 0,
    pending_verification: 0,
    draft: 0
  };

  const memberStats = analytics?.member_stats || {
    total: 0,
    verified: 0,
    pending_review: 0,
    flagged: 0
  };

  const caseStats = analytics?.case_stats || {
    total_duplicate_flags: 0,
    pending_review: 0,
    resolved: 0,
    overdue: 0,
    escalated: 0
  };

  const appStats = analytics?.application_stats || {
    total: 0,
    submitted: 0,
    approved: 0
  };

  const schemeBreakdown = analytics?.scheme_breakdown || [];
  const districtBreakdown = analytics?.district_breakdown || {};

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container">
        
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gov-text-muted)', fontWeight: 600 }}>
            OFFICER CONSOLE / DISTRICT & STATE ANALYTICS
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchAnalytics}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
            </button>
            <button
              onClick={() => onNavigate('officer-queue')}
              className="btn btn-teal"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              <Layers size={14} /> Review Queue
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)', margin: '0 0 0.25rem' }}>
            Gujarat Entitlement Grid Analytics
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--gov-text-muted)', margin: 0 }}>
            District Collector & Mamlatdar High-Level Governance Console • State Oversight
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            color: '#b91c1c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* Top 4 KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* Card 1: Total Families */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Households Registered
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--gov-teal-50)', color: 'var(--gov-teal-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gov-teal-950)' }}>
              {familyStats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} /> {familyStats.verified} Verified ({familyStats.total ? Math.round((familyStats.verified / familyStats.total) * 100) : 100}%)
            </div>
          </div>

          {/* Card 2: Total Citizens */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Verified Members
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gov-teal-950)' }}>
              {memberStats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '0.4rem' }}>
              {memberStats.verified} Green • {memberStats.pending_review} Pending
            </div>
          </div>

          {/* Card 3: Fraud / Duplicate Flags */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Duplicate Flags
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>
              {caseStats.total_duplicate_flags}
            </div>
            <div style={{ fontSize: '0.75rem', color: caseStats.pending_review > 0 ? '#b91c1c' : '#16a34a', marginTop: '0.4rem', fontWeight: 600 }}>
              {caseStats.pending_review} Pending Review • {caseStats.resolved} Resolved
            </div>
          </div>

          {/* Card 4: Welfare Applications */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Welfare Claims (1-Click)
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gov-teal-950)' }}>
              {appStats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.4rem' }}>
              100% Direct DBT Linked
            </div>
          </div>

        </div>

        {/* 2-Column Section: Schemes Breakdown & District Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Schemes Stats */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} /> Scheme Applications Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {schemeBreakdown.map((s, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--gov-border-subtle)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gov-text-title)' }}>
                      {s.name}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gov-teal-800)' }}>
                      {s.application_count} applications
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                    Department: {s.department}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Breakdown */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} /> District Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(districtBreakdown).map(([dist, count], idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{dist}</span>
                  <span style={{ backgroundColor: 'var(--gov-teal-100)', color: 'var(--gov-teal-900)', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {count} household{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* GovLedger Security Badge */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.8rem', color: '#166534' }}>
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
              <strong>GovLedger Hash Chain Active:</strong> All household additions and resolution events are cryptographically chained with SHA-256 genesis hashes.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
