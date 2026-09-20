import React, { useState } from 'react';
import { 
  Building2, PhoneCall, Globe, User, LogOut, ShieldCheck, 
  ChevronDown, ExternalLink, QrCode, ArrowRight, Lock 
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  currentUser, // citizen object { full_name, citizen_ref, family_id } or null
  currentOfficer, // officer object { name, role, desk } or null
  onOpenCitizenLogin,
  onOpenOfficerLogin,
  onCitizenLogout,
  onOfficerLogout
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isOfficerPortal = currentView.startsWith('officer-') && Boolean(currentOfficer);

  // If in officer views
  if (isOfficerPortal && currentOfficer) {
    return (
      <header style={{ borderBottom: '1px solid var(--gov-border)', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Top Government Strip */}
        <div style={{
          background: 'var(--gov-teal-950)',
          color: '#ffffff',
          padding: '0.4rem 2rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          letterSpacing: '0.04em',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={13} style={{ color: 'var(--gov-gold)' }} />
              GOVERNMENT OF GUJARAT OFFICIAL PORTAL
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ opacity: 0.85, textTransform: 'uppercase' }}>
              TALATI & CIVIC ADMINISTRATION DESK
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#f1f5f9' }}>
              <PhoneCall size={12} style={{ color: 'var(--gov-gold)' }} />
              Official Support: <strong>1800 233 5500</strong>
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <span style={{ fontWeight: 600 }}>ગુજરાતી</span> | English
            </span>
          </div>
        </div>

        {/* Officer Main Bar */}
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              onClick={() => setCurrentView('officer-queue')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--gov-teal-850)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>
                    EkParivaar
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475467',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1'
                  }}>
                    Officer console
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
                  ગુજરાત ફેમિલી આઈડી • સત્તાવાર વહીવટી પોર્ટલ
                </div>
              </div>
            </div>

            {/* Officer Tabs matching Screenshot 2 */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '2rem' }}>
              <button
                onClick={() => setCurrentView('officer-queue')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: (currentView === 'officer-queue' || currentView === 'officer-case') ? '2px solid var(--gov-ochre-600)' : '2px solid transparent',
                  padding: '0.6rem 0.9rem',
                  fontWeight: (currentView === 'officer-queue' || currentView === 'officer-case') ? 700 : 500,
                  color: (currentView === 'officer-queue' || currentView === 'officer-case') ? 'var(--gov-text-title)' : 'var(--gov-text-muted)',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Review queue
              </button>

              <button
                onClick={() => setCurrentView('officer-analytics')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: currentView === 'officer-analytics' ? '2px solid var(--gov-ochre-600)' : '2px solid transparent',
                  padding: '0.6rem 0.9rem',
                  fontWeight: currentView === 'officer-analytics' ? 700 : 500,
                  color: currentView === 'officer-analytics' ? 'var(--gov-text-title)' : 'var(--gov-text-muted)',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                District Analytics
              </button>

              <button
                onClick={() => setCurrentView('officer-escalated')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: currentView === 'officer-escalated' ? '2px solid var(--gov-ochre-600)' : '2px solid transparent',
                  padding: '0.6rem 0.9rem',
                  fontWeight: currentView === 'officer-escalated' ? 700 : 500,
                  color: currentView === 'officer-escalated' ? 'var(--gov-text-title)' : 'var(--gov-text-muted)',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Escalated SLA
              </button>
            </nav>
          </div>

          {/* Officer Profile Badge */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--gov-border)',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--gov-teal-900)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                TM
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                  {currentOfficer.name || 'Talati, Mehsana'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--gov-text-muted)' }}>
                  Zone 04 • Revenue Desk
                </div>
              </div>
              <ChevronDown size={14} color="var(--gov-text-muted)" />
            </div>

            {profileDropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                backgroundColor: '#ffffff',
                border: '1px solid var(--gov-border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                width: '210px',
                padding: '0.5rem',
                zIndex: 200
              }}>
                <button
                  onClick={() => { setProfileDropdownOpen(false); onOfficerLogout(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#b91c1c',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} /> Exit Officer Console
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Citizen & Public Header (Matching Screenshot 1 & Screenshot 5)
  return (
    <header style={{ borderBottom: '1px solid var(--gov-border)', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Government Strip */}
      <div style={{
        background: 'var(--gov-teal-900)',
        color: '#ffffff',
        padding: '0.4rem 2rem',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        letterSpacing: '0.04em',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building2 size={13} style={{ color: 'var(--gov-gold)' }} />
            GOVERNMENT OF GUJARAT OFFICIAL PORTAL
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ opacity: 0.85, textTransform: 'uppercase' }}>
            ZERO-TRUST VERIFIED CIVIC REGISTRY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#f1f5f9' }}>
            <PhoneCall size={12} style={{ color: 'var(--gov-gold)' }} />
            1800 233 5500
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
            <span style={{ fontWeight: 600 }}>ગુજરાતી</span> | English
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <button
            onClick={() => {
              if (currentOfficer) {
                setCurrentView('officer-queue');
              } else {
                onOpenOfficerLogin();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#5eead4',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600
            }}
          >
            <Lock size={11} /> Officer Portal →
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem' }}>
        
        {/* Brand Logo & Emblem */}
        <div 
          onClick={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--gov-ochre-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 5px rgba(185, 56, 21, 0.25)'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gov-text-title)' }}>
                EkParivaar
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-ochre-600)', fontWeight: 600 }}>
                / એક પરિવાર
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gov-text-muted)' }}>
              Unified citizen entitlement and welfare grid
            </div>
          </div>
        </div>

        {/* Dynamic Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!currentUser ? (
            <>
              <button 
                onClick={() => setCurrentView('landing')}
                style={{
                  background: currentView === 'landing' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'landing' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'landing' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  if (currentUser) {
                    setCurrentView('dashboard');
                  } else {
                    onOpenCitizenLogin();
                  }
                }}
                style={{
                  background: (currentView === 'dashboard' || currentView === 'citizen') ? 'var(--gov-teal-50)' : 'transparent',
                  color: (currentView === 'dashboard' || currentView === 'citizen') ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('schemes')}
                style={{
                  background: currentView === 'schemes' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'schemes' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'schemes' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Schemes
              </button>
              <button 
                onClick={onOpenCitizenLogin}
                style={{
                  background: 'transparent',
                  color: 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Track Request
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('faq-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Help
              </button>
            </>
          ) : (
            // Logged-in Citizen Links (Matching Screenshot 5)
            <>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{
                  background: (currentView === 'dashboard' || currentView === 'citizen') ? 'var(--gov-teal-50)' : 'transparent',
                  color: (currentView === 'dashboard' || currentView === 'citizen') ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: (currentView === 'dashboard' || currentView === 'citizen') ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('members')}
                style={{
                  background: currentView === 'members' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'members' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'members' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Family Members
              </button>
              <button 
                onClick={() => setCurrentView('schemes')}
                style={{
                  background: currentView === 'schemes' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'schemes' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'schemes' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Schemes
              </button>
              <button 
                onClick={() => setCurrentView('requests')}
                style={{
                  background: currentView === 'requests' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'requests' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'requests' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Requests
              </button>
              <button 
                onClick={() => setCurrentView('audit')}
                style={{
                  background: currentView === 'audit' ? 'var(--gov-teal-50)' : 'transparent',
                  color: currentView === 'audit' ? 'var(--gov-teal-800)' : 'var(--gov-text-body)',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: currentView === 'audit' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                GovLedger
              </button>
            </>
          )}
        </nav>

        {/* Right CTA / Profile */}
        <div>
          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                onClick={onOpenCitizenLogin}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              >
                Check Status
              </button>
              <button 
                onClick={onOpenCitizenLogin}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                Sign in with Aadhaar →
              </button>
            </div>
          ) : (
            // Citizen Profile Pill (Matching Screenshot 5: RP | Ramesh K. Patel Head of Family)
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '24px',
                  border: '1px solid var(--gov-border)',
                  background: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gov-teal-900)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(currentUser.full_name || 'Citizen')
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-text-title)' }}>
                    {currentUser.full_name || 'Citizen'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gov-text-muted)' }}>
                    {currentUser.is_head ? 'Head of Family' : 'Household Member'}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--gov-text-muted)" />
              </div>

              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--gov-border)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                  width: '240px',
                  padding: '0.65rem',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--gov-border-subtle)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gov-text-muted)', textTransform: 'uppercase' }}>
                      Gujarat EkParivaar ID
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--gov-teal-950)' }}>
                      {currentUser.family_id || 'Assigned Household'}
                    </div>
                  </div>

                  <button
                    onClick={() => { setProfileDropdownOpen(false); setCurrentView('smart-card'); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.6rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--gov-text-body)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <QrCode size={14} /> View Digital Smart Pass
                  </button>

                  <button
                    onClick={() => { setProfileDropdownOpen(false); onCitizenLogout(); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.6rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#b91c1c',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '0.2rem'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
