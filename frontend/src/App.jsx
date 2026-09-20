import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CitizenLoginModal } from './components/CitizenLoginModal';
import { OfficerLoginModal } from './components/OfficerLoginModal';

import { LandingPage } from './pages/LandingPage';
import { OfficerQueuePage } from './pages/OfficerQueuePage';
import { OfficerCaseDetailPage } from './pages/OfficerCaseDetailPage';
import { OfficerDecisionPage } from './pages/OfficerDecisionPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RegisterPage } from './pages/RegisterPage';
import { MembersPage } from './pages/MembersPage';
import { SchemesPage } from './pages/SchemesPage';
import { KinshipGraphPage } from './pages/KinshipGraphPage';
import { GovLedgerAuditPage } from './pages/GovLedgerAuditPage';
import { SmartCardPage } from './pages/SmartCardPage';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState('landing');
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); // Citizen session
  const [currentOfficer, setCurrentOfficer] = useState(null); // Officer session

  // Modals
  const [citizenLoginOpen, setCitizenLoginOpen] = useState(false);
  const [officerLoginOpen, setOfficerLoginOpen] = useState(false);

  // Selected Detail State
  const [activeFamilyId, setActiveFamilyId] = useState('GJ-2026-8849-012');
  const [selectedCase, setSelectedCase] = useState(null);
  const [decisionData, setDecisionData] = useState(null);

  // Check stored auth session on startup
  useEffect(() => {
    const token = localStorage.getItem('ekparivaar_token');
    const userStr = localStorage.getItem('ekparivaar_user');
    const famId = localStorage.getItem('ekparivaar_family_id');

    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser({
          full_name: u.full_name || 'Ramesh K. Patel',
          citizen_ref: u.citizen_ref,
          family_id: famId || 'GJ-2026-8849-012'
        });
        if (famId) setActiveFamilyId(famId);
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
    const citizenRoutes = ['dashboard', 'citizen', 'members', 'requests', 'smart-card'];
    if (citizenRoutes.includes(view) && !currentUser) {
      setCitizenLoginOpen(true);
      return;
    }

    // Guard Officer protected routes
    const officerRoutes = ['officer-queue', 'officer-case', 'officer-decision', 'officer-escalated'];
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCitizenLoginSuccess = (data) => {
    const userObj = {
      full_name: data.full_name || data.head?.full_name || 'Ramesh K. Patel',
      citizen_ref: data.citizen_ref || data.head?.citizen_ref,
      family_id: data.family_id || 'GJ-2026-8849-012'
    };
    setCurrentUser(userObj);
    setActiveFamilyId(userObj.family_id);
    setCurrentView('dashboard');
  };

  const handleOfficerLoginSuccess = (data) => {
    const offObj = data.officer || {
      name: 'Amit Sharma',
      role: 'Talati, Mehsana',
      desk: 'Zone 04 • Revenue Desk'
    };
    setCurrentOfficer(offObj);
    setCurrentView('officer-queue');
  };

  const handleCitizenLogout = () => {
    localStorage.removeItem('ekparivaar_token');
    localStorage.removeItem('ekparivaar_user');
    localStorage.removeItem('ekparivaar_family_id');
    setCurrentUser(null);
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
            onNavigate={handleNavigate}
          />
        )}

        {/* 3. Family Members Roster & Fraud Deduplication */}
        {currentView === 'members' && (
          <MembersPage 
            familyId={activeFamilyId}
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
