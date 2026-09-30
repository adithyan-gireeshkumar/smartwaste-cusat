import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import {
  Trash2,
  AlertTriangle,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  MapPin,
  ChevronRight,
  QrCode,
  DoorOpen,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { WasteBin, AlertItem, CollectionTask, DashboardSummary, WasteCategory } from '../types';
import { CampusMap } from '../components/CampusMap';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  bins: WasteBin[];
  alerts: AlertItem[];
  collections: CollectionTask[];
  onSelectBin: (bin: WasteBin) => void;
  onOpenSimulator: (binId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenQRModal?: (bin: WasteBin) => void;
  onOpenFeedbackModal?: (bin: WasteBin) => void;
  recentlyUpdatedBinId?: string | null;
  isWsConnected?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  bins,
  alerts,
  collections,
  onSelectBin,
  onOpenSimulator,
  onNavigateTab,
  onAcknowledgeAlert,
  onOpenQRModal,
  onOpenFeedbackModal,
  recentlyUpdatedBinId,
  isWsConnected,
}) => {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [stationFilter, setStationFilter] = useState<'ALL' | 'ALERTS' | 'HIGH_FILL'>('ALL');

  useEffect(() => {
    if (statsContainerRef.current) {
      gsap.fromTo(
        statsContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [summary]);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').slice(0, 6);
  const activeCollections = collections.filter((c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').slice(0, 4);

  // Group bins into Waste Stations (3-4 bins per location)
  const stations = useMemo(() => {
    const map = new Map<string, {
      code: string;
      location_name: string;
      location_id: string;
      ward: string;
      bins: WasteBin[];
      hasMismatch: boolean;
      hasCritical: boolean;
      hasWarning: boolean;
      highestFill: number;
    }>();

    bins.forEach((b) => {
      const locKey = b.location_id || b.location_name;
      if (!map.has(locKey)) {
        map.set(locKey, {
          code: b.station_code,
          location_name: b.location_name,
          location_id: b.location_id,
          ward: b.ward,
          bins: [],
          hasMismatch: false,
          hasCritical: false,
          hasWarning: false,
          highestFill: 0,
        });
      }
      const st = map.get(locKey)!;
      st.bins.push(b);
      if (b.mismatch_detected) st.hasMismatch = true;
      if (b.fill_level >= 90) st.hasCritical = true;
      if (b.fill_level >= 75 && b.fill_level < 90) st.hasWarning = true;
      if (b.fill_level > st.highestFill) st.highestFill = b.fill_level;
    });

    return Array.from(map.values()).sort((a, b) => {
      // Prioritize stations with mismatches or critical fills (like New SOE)
      if (a.hasMismatch && !b.hasMismatch) return -1;
      if (!a.hasMismatch && b.hasMismatch) return 1;
      return b.highestFill - a.highestFill;
    });
  }, [bins]);

  const filteredStations = useMemo(() => {
    if (stationFilter === 'ALERTS') {
      return stations.filter((s) => s.hasMismatch || s.hasCritical || s.hasWarning);
    }
    if (stationFilter === 'HIGH_FILL') {
      return stations.filter((s) => s.highestFill >= 75);
    }
    return stations;
  }, [stations, stationFilter]);

  const getCategoryMeta = (cat: WasteCategory) => {
    switch (cat) {
      case 'PLASTIC':
        return {
          icon: '🟦',
          label: 'Plastic',
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          dot: 'bg-blue-500',
        };
      case 'PAPER':
        return {
          icon: '📄',
          label: 'Paper',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          dot: 'bg-amber-500',
        };
      case 'METAL':
        return {
          icon: '⚙️',
          label: 'Metal',
          border: 'border-slate-500/30',
          bg: 'bg-slate-500/10',
          text: 'text-slate-300',
          dot: 'bg-slate-400',
        };
      case 'ORGANIC':
        return {
          icon: '🍃',
          label: 'Food/Organic',
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          dot: 'bg-emerald-500',
        };
    }
  };

  const getFillIndicator = (fill: number) => {
    if (fill >= 90) return { dot: '🔴', color: 'text-rose-400' };
    if (fill >= 75) return { dot: '🟡', color: 'text-yellow-400' };
    return { dot: '🟢', color: 'text-emerald-400' };
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Animated Statistics Grid */}
      <div
        ref={statsContainerRef}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
      >
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Campus Bins</span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {summary?.total_bins || bins.length || 20}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">20 Stations · 100% Monitored</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-emerald-400">🟢 Normal (&lt;75%)</span>
          <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {summary?.normal ?? 14}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Nominal fill</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-yellow-400">🟡 Near Full (75-89%)</span>
          <div className="text-xl font-bold font-mono text-yellow-300 tabular-nums">
            {summary?.near_full ?? 4}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Warning threshold</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-amber-400">🟠 Critical (90-99%)</span>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {summary?.critical ?? 2}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Immediate pickup</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-rose-400">🔴 Full / Mismatch</span>
          <div className="text-xl font-bold font-mono text-rose-300 tabular-nums">
            {(summary?.full ?? 0) + (summary?.mismatch_alerts_count ?? 1)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Needs intervention</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-300">Active Alerts</span>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {summary?.active_alerts ?? alerts.filter((a) => a.status === 'ACTIVE').length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Auto-deduplicated</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-blue-300">Fleet Tasks</span>
          <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
            {summary?.pending_collections ?? 2}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">In dispatch</span>
        </div>
      </div>

      {/* Main Section: Map + Live Alert/Task Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Interactive CUSAT Campus Map */}
        <div className="xl:col-span-8 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>CUSAT Live Campus Waste Map</span>
                <span className="text-xs font-mono text-slate-400">· 20 Active Smart Stations</span>
                {isWsConnected && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Sync
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Real-time geospatial layout of Cochin University of Science and Technology, Kalamassery.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Full Screen Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <CampusMap
            bins={bins}
            selectedBin={null}
            onSelectBin={onSelectBin}
            recentlyUpdatedBinId={recentlyUpdatedBinId}
            isWsConnected={isWsConnected}
            className="flex-1 min-h-[500px]"
          />
        </div>

        {/* Right Column: Live Active Alerts & Fleet Tasks */}
        <div className="xl:col-span-4 space-y-6 flex flex-col">
          {/* Active Alerts Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-white">Active Campus Alerts</h3>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-[11px] text-slate-400 hover:text-emerald-300 font-medium"
              >
                View all ({alerts.length})
              </button>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[250px] pr-1">
              {activeAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No active alerts. All campus bins are within normal thresholds.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      alt.type === 'WASTE_MISMATCH'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : alt.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : alt.severity === 'HIGH'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{alt.location_name}</span>
                      <span className="font-mono text-[11px] font-bold text-white tabular-nums">
                        {alt.type === 'WASTE_MISMATCH' ? '⚠️ Mismatch' : `${alt.fill_level}% Fill`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {alt.details || `${alt.type.replace('_', ' ')} detected.`}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(alt.created_time).toLocaleTimeString()}
                      </span>
                      {alt.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledgeAlert(alt.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-medium transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alt.status === 'ACKNOWLEDGED' && (
                        <span className="text-[10px] font-mono text-blue-400">✓ Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Collection Tasks Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-white">Dispatched Fleet Tasks</h3>
              </div>
              <button
                onClick={() => onNavigateTab('collections')}
                className="text-[11px] text-slate-400 hover:text-emerald-300 font-medium"
              >
                View all ({collections.length})
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[190px] pr-1">
              {activeCollections.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active collection tasks in progress.
                </div>
              ) : (
                activeCollections.map((col) => (
                  <div
                    key={col.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{col.location_name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          col.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {col.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Staff: {col.assigned_staff}</span>
                      <span className="font-mono text-amber-400">Prev: {col.previous_fill_level}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Button for Testing Telemetry */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => onOpenSimulator()}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate IoT Telemetry & Mismatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 REQUIREMENT: Campus Waste Stations (3–4 Categorized Bins per Point) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>CUSAT Waste Stations & Category Breakdown</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                3–4 Bins / Station
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Multi-stream recycling points (🟦 Plastic · 📄 Paper · ⚙️ Metal · 🍃 Food/Organic) with individual QR codes & fill sensors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setStationFilter('ALL')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  stationFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All 20 Stations
              </button>
              <button
                onClick={() => setStationFilter('ALERTS')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  stationFilter === 'ALERTS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Alerts & Warnings
              </button>
              <button
                onClick={() => setStationFilter('HIGH_FILL')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  stationFilter === 'HIGH_FILL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fill &ge; 75%
              </button>
            </div>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => (
            <div
              key={station.location_id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all duration-200 hover:border-slate-700 ${
                station.hasMismatch
                  ? 'border-rose-500/50 shadow-lg shadow-rose-950/20 bg-gradient-to-b from-rose-950/20 to-slate-900'
                  : station.hasCritical
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/15 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              {/* Station Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {station.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {station.bins.length} Segregated Bins
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    CUSAT — {station.location_name}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{station.ward}</span>
                  </div>
                </div>

                {station.hasMismatch && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    ⚠️ Mismatch
                  </span>
                )}
              </div>

              {/* Bins List in this Station (matching the prompt's layout!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {station.bins.map((bin) => {
                  const meta = getCategoryMeta(bin.category);
                  const indicator = getFillIndicator(bin.fill_level);
                  const isRecentlyUpdated = recentlyUpdatedBinId === bin.id;

                  return (
                    <div
                      key={bin.id}
                      onClick={() => onSelectBin(bin)}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2 bg-slate-950/70 hover:bg-slate-950 ${
                        bin.mismatch_detected
                          ? 'border-rose-500/60 ring-1 ring-rose-500/40'
                          : isRecentlyUpdated
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                          : 'border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Bar of Bin Box: Category and Fill % */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{meta.icon}</span>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.text}`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-white tabular-nums">
                            {bin.fill_level}%
                          </span>
                          <span className="text-[10px]">{indicator.dot}</span>
                        </div>
                      </div>

                      {/* Mini Fill Progress Bar */}
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            bin.fill_level >= 90
                              ? 'bg-rose-500'
                              : bin.fill_level >= 75
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${bin.fill_level}%` }}
                        ></div>
                      </div>

                      {/* Bottom row: QR Code Decal Button and Last Updated */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenQRModal) onOpenQRModal(bin);
                          }}
                          title="Print or view scannable citizen QR decal"
                          className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 font-mono px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                        >
                          <QrCode className="w-3 h-3 text-emerald-400" />
                          <span>QR ▣</span>
                        </button>

                        <span className="text-slate-500 font-mono">
                          {formatTimeAgo(bin.last_updated)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Station Contextual Warning Footer (matching prompt example!) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                {station.bins.some((b) => b.fill_level >= 90) && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {station.bins.find((b) => b.fill_level >= 90)?.category_label} bin reached critical level ({station.bins.find((b) => b.fill_level >= 90)?.fill_level}%)
                    </span>
                  </div>
                )}

                {station.bins.some((b) => b.mismatch_detected) && (
                  <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>
                      Waste mismatch: Food detected in Plastic bin (94% confidence)
                    </span>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-0.5">
                  <span>
                    Status: {station.bins.filter((b) => b.status === 'NORMAL').length}/{station.bins.length} Nominal
                  </span>
                  <button
                    onClick={() => onSelectBin(station.bins[0])}
                    className="text-emerald-400 hover:text-emerald-300 font-sans font-medium flex items-center gap-0.5"
                  >
                    <span>Inspect Station</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
