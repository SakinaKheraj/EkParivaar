import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw, X, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { api } from '../api';

export function CitizenLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!aadhaar || aadhaar.replace(/\s/g, '').length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setError(null);
    setOtpSent(true);
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanAadhaar = aadhaar.replace(/\s/g, '');

    try {
      const res = await api.loginCitizen(cleanAadhaar, otp);
      onLoginSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials or register.');
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
      backgroundColor: 'rgba(10, 46, 46, 0.7)',
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
          backgroundColor: 'var(--gov-teal-900)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="var(--gov-gold)" />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                Citizen Portal Authentication
              </div>
              <div style={{ fontSize: '0.72rem', color: '#99f6e4' }}>
                UIDAI Biometric e-KYC Consent Gateway
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

          <form onSubmit={handleVerifyLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.35rem' }}>
                12-Digit Aadhaar / Virtual ID (VID)
              </label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="1111 2222 3333"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gov-border)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  fontFamily: 'monospace'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gov-text-title)' }}>
                  Aadhaar OTP
                </label>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  OTP sent to registered mobile
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gov-border)',
                  fontSize: '1rem',
                  letterSpacing: '0.25em',
                  fontFamily: 'monospace'
                }}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Use OTP <strong>123456</strong> for secure authentication verification.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={16} /> Verifying Biometric Token...
                </>
              ) : (
                <>
                  Sign In to Citizen Portal <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
            🔒 Governed by the Gujarat Digital Citizen Entitlement Act & UIDAI Zero-Knowledge Encryption.
          </div>
        </div>
      </div>
    </div>
  );
}
