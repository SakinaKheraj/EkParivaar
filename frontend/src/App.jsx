import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CitizenLoginModal } from './components/CitizenLoginModal';
import { OfficerLoginModal } from './components/OfficerLoginModal';
import { api } from './api';

import { LandingPage } from './pages/LandingPage';
import { OfficerQueuePage } from './pages/OfficerQueuePage';
import { OfficerCaseDetailPage } from './pages/OfficerCaseDetailPage';
import { OfficerDecisionPage } from './pages/OfficerDecisionPage';
import { OfficerAnalyticsPage } from './pages/OfficerAnalyticsPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RegisterPage } from './pages/RegisterPage';
import { MembersPage } from './pages/MembersPage';
import { SchemesPage } from './pages/SchemesPage';
import { KinshipGraphPage } from './pages/KinshipGraphPage';
import { GovLedgerAuditPage } from './pages/GovLedgerAuditPage';
import { SmartCardPage } from './pages/SmartCardPage';

const getInitialView = () => {
  try {
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (path === 'dashboard' || path === 'citizen') return 'dashboard';
    if (path === 'requests') return 'requests';
    if (path === 'members') return 'members';
    if (path === 'schemes') return 'schemes';
    if (path === 'smart-card') return 'smart-card';
    if (path === 'graph' || path === 'kinship') return 'kinship';
    if (path === 'audit' || path === 'ledger') return 'audit';
    if (path.startsWith('officer')) return path;
  } catch (e) {}
  return 'landing';
};

export default function App() {
  // Navigation & View State (synced with URL)
  const [currentView, setCurrentView] = useState(getInitialView);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // Citizen session
  const [currentOfficer, setCurrentOfficer] = useState(null); // Officer session

  // Modals
  const [citizenLoginOpen, setCitizenLoginOpen] = useState(false);
  const [officerLoginOpen, setOfficerLoginOpen] = useState(false);

  // Selected Detail State
  const [activeFamilyId, setActiveFamilyId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [decisionData, setDecisionData] = useState(null);

  // Sync browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check stored auth session on startup
  useEffect(() => {
    const token = localStorage.getItem('ekparivaar_token');
    const userStr = localStorage.getItem('ekparivaar_user');
    const famId = localStorage.getItem('ekparivaar_family_id');

    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser({
          full_name: u.full_name || 'Ramesh Patel',
          citizen_ref: u.citizen_ref,
          family_id: famId
        });
        if (famId) setActiveFamilyId(famId);

        // Refresh self profile from DB to ensure token is valid
        api.getMyFamily().then(fam => {
          if (fam.family_id) {
            setActiveFamilyId(fam.family_id);
            localStorage.setItem('ekparivaar_family_id', fam.family_id);
            setCurrentUser(prev => ({
              ...prev,
              full_name: fam.full_name || prev?.full_name,
              family_id: fam.family_id,
              is_head: fam.is_head
            }));
          }
        }).catch(() => {
          // If token is expired or invalid, reset session cleanly
          localStorage.removeItem('ekparivaar_token');
          localStorage.removeItem('ekparivaar_user');
          localStorage.removeItem('ekparivaar_family_id');
          setCurrentUser(null);
          setActiveFamilyId(null);
        });
      } catch (e) {}
    }

    const offToken = localStorage.getItem('ekparivaar_officer_token');
    const offStr = localStorage.getItem('ekparivaar_officer');
    if (offToken && offStr) {
      try {
        const o = JSON.parse(offStr);
        setCurrentOfficer(o);
      } catch (e) {}
    }
  }, []);

  const handleNavigate = (view, payload = null) => {
    // Guard Citizen protected routes
    const citizenRoutes = ['dashboard', 'citizen', 'members', 'requests', 'smart-card', 'graph', 'kinship', 'audit', 'ledger'];
    if (citizenRoutes.includes(view) && !currentUser) {
      setCitizenLoginOpen(true);
    }

    // Guard Officer protected routes
    const officerRoutes = ['officer-queue', 'officer-case', 'officer-decision', 'officer-escalated', 'officer-analytics'];
    if (officerRoutes.includes(view) && !currentOfficer) {
      setOfficerLoginOpen(true);
      return;
    }

    if (payload && typeof payload === 'string' && (payload.startsWith('GJ-') || payload.includes('-'))) {
      setActiveFamilyId(payload);
    } else if (payload && typeof payload === 'object') {
      if (view === 'officer-case') setSelectedCase(payload);
      if (view === 'officer-decision') setDecisionData(payload);
    }

    setCurrentView(view);
    try {
      window.history.pushState({}, '', view === 'landing' ? '/' : `/${view}`);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCitizenLoginSuccess = async (data) => {
    let familyId = data.family_id || data.familyId || localStorage.getItem('ekparivaar_family_id');
    let fullName = data.full_name || data.head?.full_name || 'Ramesh Patel';
    let citizenRef = data.citizen_ref || data.head?.citizen_ref;
    let isHead = false;

    // Query DB for user's authoritative family linkage
    try {
      const myFam = await api.getMyFamily();
      if (myFam.family_id) {
        familyId = myFam.family_id;
        localStorage.setItem('ekparivaar_family_id', myFam.family_id);
      }
      if (myFam.full_name) fullName = myFam.full_name;
      if (myFam.citizen_ref) citizenRef = myFam.citizen_ref;
      isHead = myFam.is_head;
    } catch (err) {
      console.warn('Family lookup fallback:', err);
    }

    const userObj = {
      full_name: fullName,
      citizen_ref: citizenRef,
      family_id: familyId,
      is_head: isHead
    };

    setCurrentUser(userObj);
    if (familyId) setActiveFamilyId(familyId);
    setCurrentView('dashboard');
    try {
      window.history.pushState({}, '', '/dashboard');
    } catch (e) {}
  };

  const handleOfficerLoginSuccess = (data) => {
    const offObj = data.officer || {
      name: 'Amit Sharma',
      role: 'Talati, Ahmedabad',
      desk: 'Zone 04 • Revenue Desk'
    };
    setCurrentOfficer(offObj);
    
    // Route Collector and Mamlatdar to analytics, Talati to queue
    if (offObj.role?.toLowerCase().includes('collector') || offObj.role?.toLowerCase().includes('mamlatdar')) {
      setCurrentView('officer-analytics');
    } else {
      setCurrentView('officer-queue');
    }
  };

  const handleCitizenLogout = () => {
    localStorage.removeItem('ekparivaar_token');
    localStorage.removeItem('ekparivaar_user');
    localStorage.removeItem('ekparivaar_family_id');
    setCurrentUser(null);
    setActiveFamilyId(null);
    setCurrentView('landing');
  };

  const handleOfficerLogout = () => {
    localStorage.removeItem('ekparivaar_officer_token');
    localStorage.removeItem('ekparivaar_officer');
    setCurrentOfficer(null);
    setCurrentView('landing');
  };

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem);
    setCurrentView('officer-case');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDecisionRecorded = (decision) => {
    setDecisionData(decision);
    setCurrentView('officer-decision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      
      {/* Official Government Navbar matching Screenshots 1, 2, and 5 */}
      <Navbar 
        currentView={currentView}
        setCurrentView={handleNavigate}
        currentUser={currentUser}
        currentOfficer={currentOfficer}
        onOpenCitizenLogin={() => setCitizenLoginOpen(true)}
        onOpenOfficerLogin={() => setOfficerLoginOpen(true)}
        onCitizenLogout={handleCitizenLogout}
        onOfficerLogout={handleOfficerLogout}
      />

      {/* Main Dynamic View Content */}
      <main style={{ flex: 1 }}>
        {/* 1. Unauthenticated Public Landing Page (Screenshot 1) */}
        {currentView === 'landing' && (
          <LandingPage 
            onOpenLogin={() => setCitizenLoginOpen(true)}
            onOpenSchemes={() => setCurrentView('schemes')}
            onTrackClick={() => {
              if (currentUser) setCurrentView('dashboard');
              else setCitizenLoginOpen(true);
            }}
          />
        )}

        {/* 2. Citizen Dashboard / 5-Milestone Tracking (Screenshot 5) */}
        {(currentView === 'dashboard' || currentView === 'citizen' || currentView === 'requests') && (
          <CitizenDashboard 
            familyId={activeFamilyId}
            currentUser={currentUser}
            currentView={currentView}
            onNavigate={handleNavigate}
          />
        )}

        {/* 3. Family Members Roster & Fraud Deduplication */}
        {currentView === 'members' && (
          <MembersPage 
            familyId={activeFamilyId}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {/* 4. Smart Welfare Maximizer */}
        {currentView === 'schemes' && (
          <SchemesPage 
            familyId={activeFamilyId}
            onNavigate={handleNavigate}
          />
        )}

        {/* 5. Verifiable QR Smart Pass */}
        {currentView === 'smart-card' && (
          <SmartCardPage 
            familyId={activeFamilyId}
            onNavigate={handleNavigate}
          />
        )}

        {/* 6. Kinship & Activity Graph */}
        {(currentView === 'graph' || currentView === 'kinship') && (
          <KinshipGraphPage 
            familyId={activeFamilyId}
            onNavigate={handleNavigate}
          />
        )}

        {/* 7. GovLedger Blockchain Audit Explorer */}
        {(currentView === 'audit' || currentView === 'ledger') && (
          <GovLedgerAuditPage 
            familyId={activeFamilyId}
            onNavigate={handleNavigate}
          />
        )}

        {/* 8. Officer Review Queue (Screenshot 2) */}
        {currentView === 'officer-queue' && (
          <OfficerQueuePage 
            currentOfficer={currentOfficer}
            onSelectCase={handleSelectCase}
            onOpenEscalated={() => setCurrentView('officer-escalated')}
          />
        )}

        {/* 9. Officer Escalated Cases to Mamlatdar (Screenshot 4 bottom) */}
        {currentView === 'officer-escalated' && (
          <OfficerDecisionPage 
            decisionData={null}
            onBackToQueue={() => setCurrentView('officer-queue')}
            onOpenNextCase={() => setCurrentView('officer-queue')}
          />
        )}

        {/* 10. Officer Case Detail / Duplicate Aadhaar Side-by-Side (Screenshot 3) */}
        {currentView === 'officer-case' && (
          <OfficerCaseDetailPage 
            caseData={selectedCase}
            onBackToQueue={() => setCurrentView('officer-queue')}
            onDecisionSuccess={handleDecisionRecorded}
          />
        )}

        {/* 11. Officer Decision Confirmation (Screenshot 4) */}
        {currentView === 'officer-decision' && (
          <OfficerDecisionPage 
            decisionData={decisionData}
            onBackToQueue={() => setCurrentView('officer-queue')}
            onOpenNextCase={() => setCurrentView('officer-queue')}
          />
        )}

        {/* 12. Officer District & State Analytics (District Collector / Mamlatdar) */}
        {currentView === 'officer-analytics' && (
          <OfficerAnalyticsPage 
            onNavigate={handleNavigate}
          />
        )}

        {/* 13. Household Registration Wizard */}
        {currentView === 'register' && (
          <RegisterPage 
            onNavigate={handleNavigate}
            onRegistrationSuccess={(res) => handleCitizenLoginSuccess(res)}
          />
        )}
      </main>

      {/* Official Government Footer matching Screenshots */}
      <Footer onNavigate={handleNavigate} />

      {/* Authentication Modals */}
      <CitizenLoginModal 
        isOpen={citizenLoginOpen}
        onClose={() => setCitizenLoginOpen(false)}
        onLoginSuccess={handleCitizenLoginSuccess}
      />

      <OfficerLoginModal 
        isOpen={officerLoginOpen}
        onClose={() => setOfficerLoginOpen(false)}
        onLoginSuccess={handleOfficerLoginSuccess}
      />

    </div>
  );
}
