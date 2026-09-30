import React, { useState } from 'react';
import { EcoProvider, useEco } from './state/EcoContext';
import { EcoSidebar } from './components/EcoSidebar';
import { EcoHeader } from './components/EcoHeader';
import { EcoDashboardPage } from './pages/EcoDashboardPage';
import { EcoMapPage } from './pages/EcoMapPage';
import { EcoBinsPage } from './pages/EcoBinsPage';
import { EcoAlertsPage } from './pages/EcoAlertsPage';
import { EcoAnalyticsPage } from './pages/EcoAnalyticsPage';
import { EcoCollectionsPage } from './pages/EcoCollectionsPage';
import { EcoUsersPage } from './pages/EcoUsersPage';
import { EcoFeedbackPage } from './pages/EcoFeedbackPage';
import { EcoReportsPage } from './pages/EcoReportsPage';
import { EcoSettingsPage } from './pages/EcoSettingsPage';

// Modals
import { EcoBinModal } from './components/EcoBinModal';
import { EcoLocationModal } from './components/EcoLocationModal';
import { EcoQRModal } from './components/EcoQRModal';
import { EcoCitizenFeedbackModal } from './components/EcoCitizenFeedbackModal';
import { EcoDamageModal } from './components/EcoDamageModal';
import { EcoProfileModal } from './components/EcoProfileModal';
import { EcoSimulatorBar } from './components/EcoSimulatorBar';

interface EcoAppInnerProps {
  onSwitchToClassic: () => void;
}

const EcoAppInner: React.FC<EcoAppInnerProps> = ({ onSwitchToClassic }) => {
  const {
    activeTab,
    selectedBin,
    setSelectedBin,
    selectedLocation,
    setSelectedLocation,
    qrModalBin,
    setQrModalBin,
    feedbackModalBin,
    setFeedbackModalBin,
    damageModalBin,
    setDamageModalBin,
  } = useEco();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#2d3732] flex flex-col font-sans selection:bg-[#b7e4c7] selection:text-[#143826]">
      <div className="flex flex-1 min-h-screen relative overflow-hidden">
        {/* Sidebar (Requirement 2) */}
        <EcoSidebar
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header (Requirement 3, 20) */}
          <EcoHeader
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            onSwitchToClassic={onSwitchToClassic}
          />

          {/* Active Page View */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28">
            {activeTab === 'dashboard' && <EcoDashboardPage />}
            {activeTab === 'map' && <EcoMapPage />}
            {activeTab === 'bins' && <EcoBinsPage />}
            {activeTab === 'alerts' && <EcoAlertsPage />}
            {activeTab === 'analytics' && <EcoAnalyticsPage />}
            {activeTab === 'collections' && <EcoCollectionsPage />}
            {activeTab === 'users' && <EcoUsersPage />}
            {activeTab === 'feedback' && <EcoFeedbackPage />}
            {activeTab === 'reports' && <EcoReportsPage />}
            {activeTab === 'settings' && <EcoSettingsPage />}
          </main>
        </div>
      </div>

      {/* Floating Real-time IoT Telemetry Simulator Bar (Requirement 28) */}
      <EcoSimulatorBar />

      {/* Modals */}
      <EcoBinModal bin={selectedBin} onClose={() => setSelectedBin(null)} />
      <EcoLocationModal location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      <EcoQRModal bin={qrModalBin} onClose={() => setQrModalBin(null)} />
      <EcoCitizenFeedbackModal bin={feedbackModalBin} onClose={() => setFeedbackModalBin(null)} />
      <EcoDamageModal bin={damageModalBin} onClose={() => setDamageModalBin(null)} />
      <EcoProfileModal />
    </div>
  );
};

export const EcoApp: React.FC<{ onSwitchToClassic: () => void }> = ({ onSwitchToClassic }) => {
  return (
    <EcoProvider>
      <EcoAppInner onSwitchToClassic={onSwitchToClassic} />
    </EcoProvider>
  );
};
