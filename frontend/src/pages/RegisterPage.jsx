import React, { useState } from 'react';
import { 
  ShieldCheck, KeyRound, User, MapPin, IndianRupee, ArrowRight, 
  CheckCircle2, Sparkles, Building2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export function RegisterPage({ onRegistrationSuccess, onNavigate }) {
  const [step, setStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('123456');
  const [district, setDistrict] = useState('Ahmedabad');
  const [annualIncome, setAnnualIncome] = useState(120000);
  const [socialCategory, setSocialCategory] = useState('SEBC');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ekycResult, setEkycResult] = useState(null);
  const [createdFamily, setCreatedFamily] = useState(null);

  const handleVerifyEkyc = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber || aadhaarNumber.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyEkyc(aadhaarNumber, otp);
      setEkycResult(res);
      setStep(2);
    } catch (err) {
      setError(err.message || 'e-KYC verification failed. Use sample Aadhaar 111122223333.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterHousehold = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        aadhaar_number: aadhaarNumber,
        otp: otp,
        district: district,
        annual_income: Number(annualIncome),
        attributes: { social_category: socialCategory }
      };
      const res = await api.registerHead(payload);
      setCreatedFamily(res);
      setStep(3);
      if (onRegistrationSuccess) {
        onRegistrationSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gov-bg)', minHeight: '85vh', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Wizard Progress Indicator */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {[
            { num: 1, label: '1. UIDAI e-KYC' },
            { num: 2, label: '2. Household Profile' },
            { num: 3, label: '3. GovLedger Genesis' },
          ].map((item) => (
            <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step === item.num ? 'var(--gov-ochre-600)' : step > item.num ? '#16a34a' : '#e2e8f0',
                color: step >= item.num ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {step > item.num ? <CheckCircle2 size={18} /> : item.num}
              </div>
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: step === item.num ? 700 : 500,
                color: step === item.num ? 'var(--gov-teal-950)' : 'var(--gov-text-muted)'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Card Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* STEP 1: e-KYC */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                  <ShieldCheck size={13} /> Zero-Knowledge Biometric Gateway
                </span>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--gov-teal-950)', margin: '0.2rem 0' }}>
                  Register Household Head
                </h1>
                <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.9rem' }}>
                  Authenticate the primary adult head via UIDAI e-KYC. This anchors the household on Gujarat GovLedger.
                </p>
              </div>

              <form onSubmit={handleVerifyEkyc}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                    12-Digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 123412341001"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gov-border)',
                      fontSize: '1rem',
                      letterSpacing: '0.05em'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                    Simulation OTP (Default: 123456)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gov-border)',
                      fontSize: '1rem',
                      letterSpacing: '0.2em'
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                >
                  {loading ? <RefreshCw className="spin" size={18} /> : <>Verify Biometric e-KYC <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Household Profile */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={13} /> UIDAI Identity Verified: {ekycResult?.full_name}
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--gov-teal-950)', margin: '0.2rem 0' }}>
                  Complete Household Profile
                </h2>
                <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.85rem' }}>
                  This information determines dynamic entitlement scoring under Gujarat Welfare Maximizer rules.
                </p>
              </div>

              <form onSubmit={handleRegisterHousehold}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                      District (Gujarat)
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--gov-border)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Kutch', 'Mehsana'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                      Annual Household Income (₹)
                    </label>
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--gov-border)',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gov-text-title)', marginBottom: '0.4rem' }}>
                    Social Category
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gov-border)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="General">General</option>
                    <option value="SEBC">SEBC (Socially & Educationally Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.85rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '0.85rem' }}
                  >
                    {loading ? <RefreshCw className="spin" size={18} /> : <>Anchor Household on GovLedger <Sparkles size={18} /></>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Created Confirmation */}
          {step === 3 && createdFamily && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.15)'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>
                Genesis Block Chained Successfully
              </span>

              <h2 style={{ fontSize: '1.75rem', color: 'var(--gov-teal-950)', margin: '0.3rem 0' }}>
                Household ID: {createdFamily.family_id}
              </h2>
              <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.9rem', maxWidth: '540px', margin: '0.5rem auto 1.75rem' }}>
                Your unified Gujarat household identity has been immutably registered on GovLedger with SHA-256 block anchor.
              </p>

              <div style={{
                backgroundColor: '#0a2e2e',
                borderRadius: '8px',
                padding: '1.25rem',
                color: '#ffffff',
                textAlign: 'left',
                marginBottom: '2rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: '#5eead4', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  GovLedger Genesis Signature
                </div>
                <div style={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>
                  {createdFamily.genesis_block_hash || '0000a4b7f92c13e8d251bc89a2441098ef1a7b312ccb9487b32ef81977aa1e09'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('citizen', createdFamily.family_id)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Go to Citizen Dashboard <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onNavigate('members', createdFamily.family_id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Add Family Members
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
