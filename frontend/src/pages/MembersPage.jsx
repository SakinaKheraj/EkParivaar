import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldAlert, ShieldCheck, AlertTriangle, 
  ArrowLeft, CheckCircle2, Clock, Plus, ExternalLink, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export function MembersPage({ familyId, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Form fields
  const [claimedName, setClaimedName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [relationship, setRelationship] = useState('Son');
  const [dob, setDob] = useState('2004-05-15');

  const currentFamilyId = familyId || localStorage.getItem('ekparivaar_family_id') || 'GJ-01-2026-F001';

  const loadFamily = async () => {
    setLoading(true);
    try {
      const data = await api.getFamilyStatus(currentFamilyId);
      setFamilyData(data);
    } catch (err) {
      console.error('Failed to load family data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [currentFamilyId]);

  const handleAddMember = async (aadhaar, name, rel, birthDate) => {
    setSubmitting(true);
    setAlertInfo(null);
    try {
      const payload = {
        aadhaar_number: aadhaar || aadhaarNumber,
        claimed_name: name || claimedName,
        relationship_to_head: rel || relationship,
        claimed_dob: birthDate || dob,
        attributes: {}
      };

      const res = await api.addMember(currentFamilyId, payload);
      setShowAddModal(false);
      
      if (res.verification_status === 'FLAGGED_DUPLICATE' || res.fraud_flag) {
        setAlertInfo({
          type: 'warning',
          title: 'Cross-Household Duplicate Aadhaar Flagged!',
          message: `Member ${payload.claimed_name} is already registered in another household. Statutory review case #${res.officer_review_id || 'REV-NEW'} has been created with 72-hour SLA.`,
          action: () => onNavigate('officer-queue')
        });
      } else {
        setAlertInfo({
          type: 'success',
          title: 'Family Member Successfully Verified & Chained',
          message: `${payload.claimed_name} verified via e-KYC and sealed into GovLedger block #00${(familyData?.members?.length || 1) + 2}.`
        });
      }

      // Refresh list
      loadFamily();
    } catch (err) {
      setAlertInfo({
        type: 'error',
        title: 'Submission Failed',
        message: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gov-bg)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container">

        {/* Breadcrumb & Navigation */}
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

          <span style={{ fontSize: '0.85rem', color: 'var(--gov-text-muted)' }}>
            Household ID: <strong>{currentFamilyId}</strong>
          </span>
        </div>

        {/* Live Notification Banner */}
        {alertInfo && (
          <div style={{
            backgroundColor: alertInfo.type === 'warning' ? '#fff7ed' : alertInfo.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${alertInfo.type === 'warning' ? '#fed7aa' : alertInfo.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              {alertInfo.type === 'warning' ? (
                <ShieldAlert size={24} color="#c2410c" />
              ) : alertInfo.type === 'error' ? (
                <AlertTriangle size={24} color="#b91c1c" />
              ) : (
                <ShieldCheck size={24} color="#16a34a" />
              )}
              <div>
                <h4 style={{ 
                  margin: '0 0 0.2rem', 
                  fontSize: '0.95rem', 
                  color: alertInfo.type === 'warning' ? '#9a3412' : alertInfo.type === 'error' ? '#991b1b' : '#166534' 
                }}>
                  {alertInfo.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
                  {alertInfo.message}
                </p>
              </div>
            </div>

            {alertInfo.action && (
              <button 
                onClick={alertInfo.action}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Inspect Officer Queue <ExternalLink size={14} />
              </button>
            )}
          </div>
        )}

        {/* Page Title & Add Button */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', color: 'var(--gov-teal-950)', margin: '0 0 0.3rem' }}>
              Household Roster Management
            </h1>
            <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Add and verify dependents, spouses, and children under Gujarat Unified Civic Architecture.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <UserPlus size={16} /> Add Member
            </button>
            <button
              onClick={() => onNavigate('kinship', currentFamilyId)}
              className="btn btn-teal"
            >
              <Users size={16} /> Kinship Conflict Graph
            </button>
          </div>
        </div>

        {/* Demo Fast Injection Bar */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px dashed var(--gov-border)',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gov-teal-850)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive Demo Scenarios (1-Click Test)
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAddMember('123412341002', 'Savitaben Patel', 'Wife', '1976-08-12')}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
            >
              <CheckCircle2 size={14} color="#16a34a" /> Scenario 1: Add Valid Member (Savitaben - Wife)
            </button>

            <button
              onClick={() => handleAddMember('123412344001', 'Pooja Patel', 'Daughter', '2004-03-21')}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
            >
              <AlertTriangle size={14} color="#ea580c" /> Scenario 2: Add Conflicted Aadhaar (Pooja Patel - Duplicate)
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--gov-teal-950)', marginBottom: '1rem' }}>
            Registered Household Members
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--gov-border)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Relationship</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Aadhaar Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Statutory Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Family Head */}
                <tr style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    {familyData?.head?.full_name || 'Ramesh Patel'}
                    <span style={{ fontSize: '0.7rem', color: 'var(--gov-ochre-600)', background: 'var(--gov-ochre-50)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>HEAD</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--gov-text-body)' }}>Primary Anchor</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{familyData?.head?.aadhaar_masked || 'XXXX-XXXX-1001'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-green"><CheckCircle2 size={12} /> VERIFIED</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--gov-text-muted)', fontSize: '0.8rem' }}>Genesis Head</td>
                </tr>

                {/* Additional Members */}
                {(familyData?.members || []).map((m, idx) => (
                  <tr key={m.id || idx} style={{ borderBottom: '1px solid var(--gov-border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.name || m.claimed_name}</td>
                    <td style={{ padding: '1rem' }}>{m.relationship || m.relationship_to_head}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{m.aadhaar_masked || 'XXXX-XXXX-4001'}</td>
                    <td style={{ padding: '1rem' }}>
                      {m.verification_status === 'VERIFIED' ? (
                        <span className="badge badge-green"><CheckCircle2 size={12} /> VERIFIED</span>
                      ) : m.verification_status === 'FLAGGED_DUPLICATE' ? (
                        <span className="badge badge-red"><AlertTriangle size={12} /> FLAGGED DUPLICATE</span>
                      ) : (
                        <span className="badge badge-yellow"><Clock size={12} /> PENDING REVIEW</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {m.verification_status === 'FLAGGED_DUPLICATE' ? (
                        <button
                          onClick={() => onNavigate('officer-queue')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gov-ochre-600)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          Resolve in Review Queue <ExternalLink size={12} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--gov-text-muted)', fontSize: '0.8rem' }}>None Required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Member Manual Form */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '2rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: 'var(--shadow-elevated)'
            }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--gov-teal-950)', margin: '0 0 0.5rem' }}>
                Add Household Member
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-muted)', marginBottom: '1.5rem' }}>
                Enter the member's details. Real-time deduplication will check cross-household registers instantly.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Full Claimed Name
                  </label>
                  <input
                    type="text"
                    value={claimedName}
                    onChange={(e) => setClaimedName(e.target.value)}
                    placeholder="e.g. Pooja Patel"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gov-border)' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    12-Digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123412344001"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--gov-border)' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Relationship to Head
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--gov-border)' }}
                    >
                      <option value="Spouse">Spouse / Wife / Husband</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Parent">Father / Mother</option>
                      <option value="Sibling">Brother / Sister</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--gov-border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? <RefreshCw className="spin" size={16} /> : 'Submit & Check Deduplication'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
