import React, { useState } from 'react';
import { Building2, ArrowRight, RefreshCw, X, AlertCircle, Lock, Shield } from 'lucide-react';
import { api } from '../api';

export function OfficerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [officerName, setOfficerName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    if (!officerName.trim()) {
      setError('Please enter your designated officer name.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.officerLogin(officerName.trim());
      onLoginSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Officer authorization failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(6, 30, 30, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid var(--gov-border)'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#061e1e',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={20} color="#5eead4" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                Departmental Officer Login
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Talati & Civic Administration Desk • Mehsana Zone
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#b91c1c',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534' }}>
            <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Authorised government personnel only. All adjudications are cryptographically hashed and logged to Gujarat GovLedger.
          </div>

          <form onSubmit={handleOfficerLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.35rem' }}>
                Officer Full Name / Cadre ID
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Amit Sharma or Rajesh Kumar"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gov-border)',
                  fontSize: '0.92rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.35rem' }}>
                Departmental Security PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gov-border)',
                  fontSize: '1.2rem',
                  letterSpacing: '0.3em'
                }}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Default administrative test PIN: <strong>1234</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-teal"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={16} /> Authenticating Official Desk...
                </>
              ) : (
                <>
                  Enter Officer Console <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
            Gujarat Public Services Guarantee Act • Sachivalaya Security Audit
          </div>
        </div>
      </div>
    </div>
  );
}
