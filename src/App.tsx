/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CampusMap } from './components/CampusMap';
import { BinDetailDrawer } from './components/BinDetailDrawer';
import { TelemetrySimulatorModal } from './components/TelemetrySimulatorModal';
import { QRCodeModal } from './components/QRCodeModal';
import { CitizenFeedbackPortalModal } from './components/CitizenFeedbackPortalModal';
import { DamageReportModal } from './components/DamageReportModal';

import { DashboardPage } from './pages/DashboardPage';
import { BinsPage } from './pages/BinsPage';
import { AlertsPage } from './pages/AlertsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

import {
  WasteBin,
  LocationItem,
  AlertItem,
  CollectionTask,
  UserAccount,
  OrganizationSettings,
  DashboardSummary,
  DamageReport,
  CitizenFeedback,
} from './types';
import { api } from './services/api';
import { useRealTimeTelemetry } from './hooks/useRealTimeTelemetry';
import { EcoApp } from './eco/EcoApp';

export default function App() {
  const [appEdition, setAppEdition] = useState<'eco' | 'classic'>('eco');
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [bins, setBins] = useState<WasteBin[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [collections, setCollections] = useState<CollectionTask[]>([]);
  const [feedbacks, setFeedbacks] = useState<CitizenFeedback[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [org, setOrg] = useState<OrganizationSettings | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal and Drawer states
  const [selectedBin, setSelectedBin] = useState<WasteBin | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simulatorTargetBinId, setSimulatorTargetBinId] = useState<string | undefined>(undefined);

  // Modals for QR, Feedback Portal, Damage Report
  const [qrModalBin, setQrModalBin] = useState<WasteBin | null>(null);
  const [feedbackModalBin, setFeedbackModalBin] = useState<WasteBin | null>(null);
  const [damageModalBin, setDamageModalBin] = useState<WasteBin | null>(null);

  // Quick collection modal from bin
  const [collectionModalBin, setCollectionModalBin] = useState<WasteBin | null>(null);
  const [collectionStaff, setCollectionStaff] = useState<string>('Manoj K.V.');
  const [collectionPriority, setCollectionPriority] = useState<string>('MEDIUM');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Real-time WebSocket connection
  const { isConnected, recentlyUpdatedBinId } = useRealTimeTelemetry({
    onBinUpdated: ({ bin, alertCreated, summary: newSummary }) => {
      // Instantly update the bins list with the new bin state
      setBins((prev) => prev.map((b) => (b.id === bin.id ? { ...b, ...bin } : b)));

      // Keep selected bin up to date if currently open
      setSelectedBin((curr) => (curr && curr.id === bin.id ? { ...curr, ...bin } : curr));

      if (newSummary) setSummary(newSummary);

      if (alertCreated) {
        setAlerts((prev) => {
          const exists = prev.find((a) => a.id === alertCreated.id);
          if (exists) {
            return prev.map((a) => (a.id === alertCreated.id ? alertCreated : a));
          }
          return [alertCreated, ...prev];
        });
      }
    },
    onAlertUpdated: ({ alert, summary: newSummary }) => {
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? alert : a)));
      if (newSummary) setSummary(newSummary);
    },
    onCollectionUpdated: ({ bin, summary: newSummary }) => {
      if (bin) {
        setBins((prev) => prev.map((b) => (b.id === bin.id ? { ...b, ...bin } : b)));
      }
      if (newSummary) setSummary(newSummary);
      api.getCollections().then(setCollections).catch(console.error);
    },
    onFeedbackUpdated: () => {
      api.getCitizenFeedback().then(setFeedbacks).catch(console.error);
      api.getDashboardSummary().then(setSummary).catch(console.error);
    },
    onDamageUpdated: () => {
      api.getDamageReports().then(setDamageReports).catch(console.error);
      api.getDashboardSummary().then(setSummary).catch(console.error);
    },
    onUsersUpdated: () => {
      api.getUsers().then(setUsers).catch(console.error);
    },
    onSnapshot: ({ bins: newBins, summary: newSummary }) => {
      if (newBins) setBins(newBins);
      if (newSummary) setSummary(newSummary);
    },
  });

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [
        summaryRes,
        binsRes,
        locationsRes,
        alertsRes,
        collectionsRes,
        usersRes,
        orgRes,
        feedbacksRes,
        damageReportsRes,
      ] = await Promise.all([
        api.getDashboardSummary(),
        api.getBins(),
        api.getLocations(),
        api.getAlerts(),
        api.getCollections(),
        api.getUsers(),
        api.getOrganization(),
        api.getCitizenFeedback(),
        api.getDamageReports(),
      ]);

      setSummary(summaryRes);
      setBins(binsRes);
      setLocations(locationsRes);
      setAlerts(alertsRes);
      setCollections(collectionsRes);
      setUsers(usersRes);
      setOrg(orgRes);
      setFeedbacks(feedbacksRes);
      setDamageReports(damageReportsRes);

      // Keep selected bin up to date if currently open
      if (selectedBin) {
        const fresh = binsRes.find((b) => b.id === selectedBin.id);
        if (fresh) setSelectedBin(fresh);
      }
    } catch (err: unknown) {
      console.error('[SmartWaste CUSAT] Data load error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBin]);

  useEffect(() => {
    loadData();
    // Background polling fallback every 60 seconds (WebSocket handles instant real-time pushes)
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleOpenSimulator = (targetBinId?: string) => {
    setSimulatorTargetBinId(targetBinId);
    setIsSimulatorOpen(true);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, 'Dr. Suresh Kumar (SUPER ADMIN)');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickDispatchCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionModalBin) return;
    setIsDispatching(true);
    try {
      await api.createCollectionTask({
        bin_id: collectionModalBin.id,
        assigned_staff: collectionStaff,
        priority: collectionPriority,
        notes: `Urgent pickup dispatched for ${collectionModalBin.location_name}.`,
      });
      setCollectionModalBin(null);
      loadData();
      setCurrentTab('collections');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dispatch failed';
      alert(msg);
    } finally {
      setIsDispatching(false);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const pendingCollectionsCount = collections.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PENDING'
  ).length;
  const pendingFeedbackCount =
    feedbacks.filter((f) => f.status === 'NEW').length +
    damageReports.filter((d) => d.status === 'REPORTED').length;

  if (appEdition === 'eco') {
    return <EcoApp onSwitchToClassic={() => setAppEdition('classic')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        summary={summary}
        org={org}
        onOpenSimulator={() => handleOpenSimulator()}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        activeTab={currentTab}
        isWsConnected={isConnected}
        onSwitchToEco={() => setAppEdition('eco')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'simulator') {
              handleOpenSimulator();
            } else {
              setCurrentTab(tab);
            }
          }}
          activeAlertsCount={activeAlertsCount}
          pendingCollectionsCount={pendingCollectionsCount}
          pendingFeedbackCount={pendingFeedbackCount}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b0f19]">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
              <div>
                <strong>Connection notice:</strong> {error}
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="space-y-3 text-center">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-mono">
                  Connecting to CUSAT Smart Waste Telemetry Engine...
                </p>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <DashboardPage
                  summary={summary}
                  bins={bins}
                  alerts={alerts}
                  collections={collections}
                  onSelectBin={(bin) => setSelectedBin(bin)}
                  onOpenSimulator={(binId) => handleOpenSimulator(binId)}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onOpenQRModal={(bin) => setQrModalBin(bin)}
                  onOpenFeedbackModal={(bin) => setFeedbackModalBin(bin)}
                  recentlyUpdatedBinId={recentlyUpdatedBinId}
                  isWsConnected={isConnected}
                />
              )}

              {currentTab === 'map' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-white">Interactive CUSAT Campus Map</h2>
                      <p className="text-xs text-slate-400">
                        Real-time geospatial monitoring of all 20 IoT smart stations distributed across CUSAT Kalamassery campus.
                      </p>
                    </div>
                  </div>
                  <CampusMap
                    bins={bins}
                    selectedBin={selectedBin}
                    onSelectBin={(bin) => setSelectedBin(bin)}
                    recentlyUpdatedBinId={recentlyUpdatedBinId}
                    isWsConnected={isConnected}
                    className="min-h-[720px]"
                  />
                </div>
              )}

              {currentTab === 'bins' && (
                <BinsPage
                  bins={bins}
                  locations={locations}
                  onSelectBin={(bin) => setSelectedBin(bin)}
                  onOpenSimulatorForBin={(bin) => handleOpenSimulator(bin.id)}
                  onOpenCollectionModal={(bin) => setCollectionModalBin(bin)}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'alerts' && (
                <AlertsPage
                  alerts={alerts}
                  bins={bins}
                  onRefresh={loadData}
                  onOpenCollectionModal={(bin) => setCollectionModalBin(bin)}
                />
              )}

              {currentTab === 'collections' && (
                <CollectionsPage
                  collections={collections}
                  bins={bins}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'feedback' && (
                <FeedbackPage
                  feedbacks={feedbacks}
                  damageReports={damageReports}
                  bins={bins}
                  onRefresh={loadData}
                  onOpenQRModal={(bin) => setQrModalBin(bin)}
                  onOpenFeedbackModal={(bin) => setFeedbackModalBin(bin)}
                  onOpenDamageModal={(bin) => setDamageModalBin(bin)}
                />
              )}

              {currentTab === 'reports' && <ReportsPage bins={bins} />}

              {currentTab === 'team' && <TeamPage users={users} onRefresh={loadData} />}

              {currentTab === 'integrations' && <IntegrationsPage />}

              {currentTab === 'settings' && <SettingsPage org={org} onRefresh={loadData} />}
            </>
          )}
        </main>
      </div>

      {/* GSAP-Animated Bin Detail Drawer */}
      <BinDetailDrawer
        bin={selectedBin}
        onClose={() => setSelectedBin(null)}
        onUpdateSuccess={loadData}
        onOpenCollectionModal={(bin) => {
          setSelectedBin(null);
          setCollectionModalBin(bin);
        }}
        onOpenQRModal={(bin) => setQrModalBin(bin)}
        onOpenFeedbackModal={(bin) => setFeedbackModalBin(bin)}
        onOpenDamageModal={(bin) => setDamageModalBin(bin)}
      />

      {/* Global Telemetry Simulator Modal (Section 20 & 33) */}
      <TelemetrySimulatorModal
        bins={bins}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSuccess={loadData}
        defaultBinId={simulatorTargetBinId}
      />

      {/* Printable Smart Bin QR Code Modal */}
      <QRCodeModal
        bin={qrModalBin}
        isOpen={!!qrModalBin}
        onClose={() => setQrModalBin(null)}
        onOpenFeedbackPortal={(bin) => {
          setQrModalBin(null);
          setFeedbackModalBin(bin);
        }}
      />

      {/* Public Citizen Feedback Portal Modal (Simulates scanning QR code) */}
      <CitizenFeedbackPortalModal
        bin={feedbackModalBin}
        isOpen={!!feedbackModalBin}
        onClose={() => setFeedbackModalBin(null)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Physical Bin Damage Reporting Modal */}
      <DamageReportModal
        bin={damageModalBin}
        isOpen={!!damageModalBin}
        onClose={() => setDamageModalBin(null)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Quick Dispatch Modal from Bin Drawer / Table */}
      {collectionModalBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Dispatch Collection for {collectionModalBin.location_name}
            </h3>
            <p className="text-xs text-slate-400">
              Assign sanitation staff and prioritize pickup for bin {collectionModalBin.id} (Current fill: {collectionModalBin.fill_level}%).
            </p>

            <form onSubmit={handleQuickDispatchCollection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Collection Staff</label>
                <select
                  value={collectionStaff}
                  onChange={(e) => setCollectionStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="Manoj K.V.">Manoj K.V. (Engineering Route Squad)</option>
                  <option value="Santhosh Babu">Santhosh Babu (Hostels & Commons Squad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Priority</label>
                <select
                  value={collectionPriority}
                  onChange={(e) => setCollectionPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="LOW">Low (Routine)</option>
                  <option value="MEDIUM">Medium (Normal)</option>
                  <option value="HIGH">High (Near 75% warning)</option>
                  <option value="URGENT">Urgent (Over 90% critical)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectionModalBin(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg"
                >
                  {isDispatching ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
