import React, { useState } from 'react';
import {
  MapPin,
  Trash2,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  Droplets,
  Thermometer,
  Wrench,
  QrCode,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoCampusMap } from '../components/EcoCampusMap';
import { EcoLocation, EcoBin, WasteType } from '../types';

export const EcoDashboardPage: React.FC = () => {
  const {
    locations,
    bins,
    alerts,
    collections,
    metrics,
    setSelectedBin,
    setSelectedLocation,
    setQrModalBin,
    setActiveTab,
    markAsCollected
  } = useEco();

  const [hubFilter, setHubFilter] = useState<'ALL' | 'CRITICAL' | 'ACADEMIC'>('ALL');

  const activeAlerts = alerts.filter((a) => !a.isResolved).slice(0, 5);
  const pendingTasks = collections.filter((c) => c.status !== 'COLLECTED').slice(0, 4);

  // Filtered location stations
  const displayedLocations = locations.filter((loc) => {
    if (hubFilter === 'CRITICAL') {
      const locBins = bins.filter((b) => b.locationId === loc.id);
      return locBins.some((b) => b.fillLevel >= 75 || b.wrongWasteDetected || b.physicalCondition !== 'GOOD');
    }
    if (hubFilter === 'ACADEMIC') {
      return loc.zone.toLowerCase().includes('academic') || loc.zone.toLowerCase().includes('engineering');
    }
    return true;
  });

  const getStreamMeta = (type: WasteType) => {
    switch (type) {
      case 'PLASTIC':
        return { icon: '♻️', label: 'Plastic', text: 'text-blue-800', bar: 'bg-blue-600', dot: 'bg-blue-600' };
      case 'PAPER':
        return { icon: '📄', label: 'Paper', text: 'text-amber-800', bar: 'bg-amber-600', dot: 'bg-amber-600' };
      case 'METAL':
        return { icon: '🥫', label: 'Metal', text: 'text-slate-800', bar: 'bg-slate-600', dot: 'bg-slate-600' };
      case 'FOOD':
        return { icon: '🍱', label: 'Food Waste', text: 'text-emerald-800', bar: 'bg-emerald-600', dot: 'bg-emerald-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#1b4332] via-[#24543e] to-[#2d6a4f] text-white p-5 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              CUSAT Smart Waste & Eco-Campus IoT Control
            </h1>
          </div>
          <p className="text-xs text-[#b7e4c7] max-w-xl">
            Real-time telemetry, segregation monitoring, wrong-waste identification, and automated dispatch across 20 Kalamassery campus stations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-[#d8f3dc]">
            ● {metrics.totalBins} Active IoT Nodes
          </span>
        </div>
      </div>

      {/* 8 Main Statistics Nature Cards (Requirement 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Locations */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-[#52796f] font-medium block">Total Locations</span>
          <div className="text-xl font-bold font-mono text-[#143826]">{metrics.totalLocations}</div>
          <span className="text-[10px] text-[#6d9178] block">Across campus</span>
        </div>

        {/* Total Bins */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-[#52796f] font-medium block">Total Bins</span>
          <div className="text-xl font-bold font-mono text-[#143826]">{metrics.totalBins}</div>
          <span className="text-[10px] text-[#6d9178] block">4 Waste streams</span>
        </div>

        {/* Normal Bins */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-emerald-700 font-medium block">🟢 Normal (&lt;50%)</span>
          <div className="text-xl font-bold font-mono text-emerald-800">{metrics.normalBins}</div>
          <span className="text-[10px] text-[#6d9178] block">Low capacity</span>
        </div>

        {/* Collection Required */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-amber-700 font-medium block">🟠 Collection Req</span>
          <div className="text-xl font-bold font-mono text-amber-800">{metrics.collectionRequired}</div>
          <span className="text-[10px] text-[#6d9178] block">75–94% Fill</span>
        </div>

        {/* Urgent Bins */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-rose-700 font-medium block">🔴 Urgent Bins</span>
          <div className="text-xl font-bold font-mono text-rose-800">{metrics.urgentBins}</div>
          <span className="text-[10px] text-[#6d9178] block">&ge;95% Capacity</span>
        </div>

        {/* Damaged Bins */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-purple-700 font-medium block">🔧 Damaged Bins</span>
          <div className="text-xl font-bold font-mono text-purple-800">{metrics.damagedBins}</div>
          <span className="text-[10px] text-[#6d9178] block">Maintenance req</span>
        </div>

        {/* Open Bins */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-yellow-700 font-medium block">🔓 Open Bins</span>
          <div className="text-xl font-bold font-mono text-yellow-800">{metrics.openBins}</div>
          <span className="text-[10px] text-[#6d9178] block">Lid unsecured</span>
        </div>

        {/* Offline Sensors */}
        <div className="p-3.5 bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl space-y-1 shadow-2xs hover:border-[#2d6a4f] transition-all">
          <span className="text-[11px] text-slate-600 font-medium block">📡 Offline Sensors</span>
          <div className="text-xl font-bold font-mono text-slate-700">{metrics.offlineSensors}</div>
          <span className="text-[10px] text-[#6d9178] block">Connection loss</span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Live Alerts / Fleet Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Campus Map */}
        <div className="xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-serif font-bold text-[#143826] flex items-center gap-2">
                <span>CUSAT Campus Waste Stations Map</span>
                <span className="text-xs font-mono text-[#52796f]">· 20 Monitored Points</span>
              </h2>
              <p className="text-xs text-[#52796f]">
                Geospatial distribution across School of Engineering, Library, Cafeteria, and Hostels.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-semibold text-[#1b4332] hover:text-[#2d6a4f] flex items-center gap-1 transition-colors"
            >
              <span>Full Screen View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <EcoCampusMap
            className="h-[460px]"
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onSelectBin={(b) => setSelectedBin(b)}
          />
        </div>

        {/* Right Column: Live Alerts & Fleet Collections */}
        <div className="xl:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Active Alerts Feed */}
          <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2ece3] pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-[#143826]">Critical Campus Alerts</h3>
              </div>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-[11px] text-[#2d6a4f] hover:underline font-semibold"
              >
                View all ({alerts.filter((a) => !a.isResolved).length})
              </button>
            </div>

            <div className="space-y-2.5 max-h-[195px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#52796f]">
                  No active alerts. All campus streams nominal.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => {
                      const target = bins.find((b) => b.id === alt.binId);
                      if (target) setSelectedBin(target);
                    }}
                    className="p-2.5 rounded-xl border border-[#dbe6dc] hover:border-[#1b4332] bg-[#f4f8f3] cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#143826] text-xs truncate">{alt.title}</span>
                      <span className="text-[10px] font-mono text-[#84a98c]">
                        {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52796f] line-clamp-1">{alt.description}</p>
                    <div className="text-[10px] text-[#2d6a4f] font-mono font-medium">
                      {alt.locationName} · {alt.binId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dispatched Fleet Tasks Feed */}
          <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#e2ece3] pb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1b4332]" />
                <h3 className="text-xs font-bold text-[#143826]">Dispatched Collections</h3>
              </div>
              <button
                onClick={() => setActiveTab('collections')}
                className="text-[11px] text-[#2d6a4f] hover:underline font-semibold"
              >
                View all ({collections.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#52796f]">
                  No active collection dispatches in progress.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#143826]">{task.locationName}</div>
                      <div className="text-[11px] text-[#52796f]">
                        {task.assignedCollector} · {task.wasteType}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-amber-700">{task.fillLevel}%</span>
                      <span className="block text-[9px] uppercase font-bold text-[#1b4332]">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Bin Stations Showcase (Requirement 7 & 24) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dbe6dc] pb-2">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#143826] flex items-center gap-2">
              <span>Campus Multi-Bin Stations (3–4 Segregated Streams)</span>
              <span className="text-xs font-mono text-[#1b4332] bg-[#d8f3dc] px-2 py-0.5 rounded-full font-bold">
                20 Locations
              </span>
            </h3>
            <p className="text-xs text-[#52796f]">
              Recycling clusters: ♻️ Plastic · 📄 Paper · 🥫 Metal · 🍱 Food Waste with individual QR codes & fill sensors.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#eef5ed] rounded-xl border border-[#d3e2d5] text-xs">
            <button
              onClick={() => setHubFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                hubFilter === 'ALL' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-[#2d3732] hover:text-[#143826]'
              }`}
            >
              All Hubs
            </button>
            <button
              onClick={() => setHubFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                hubFilter === 'CRITICAL' ? 'bg-rose-700 text-white shadow-xs' : 'text-[#2d3732] hover:text-[#143826]'
              }`}
            >
              Requires Action
            </button>
            <button
              onClick={() => setHubFilter('ACADEMIC')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                hubFilter === 'ACADEMIC' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-[#2d3732] hover:text-[#143826]'
              }`}
            >
              Academic Zone
            </button>
          </div>
        </div>

        {/* Stations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedLocations.slice(0, 9).map((loc) => {
            const locBins = bins.filter((b) => b.locationId === loc.id);
            const hasMismatch = locBins.some((b) => b.wrongWasteDetected);
            const hasUrgent = locBins.some((b) => b.fillLevel >= 90);

            return (
              <div
                key={loc.id}
                className={`bg-[#fcfdfb] border rounded-3xl p-5 space-y-4 transition-all hover:shadow-md ${
                  hasMismatch
                    ? 'border-amber-400 bg-amber-50/30'
                    : hasUrgent
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-[#dbe6dc]'
                }`}
              >
                {/* Station Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#52796f] bg-[#eef5ed] px-2 py-0.5 rounded-md font-bold">
                        {loc.code}
                      </span>
                      <span className="text-[10px] text-[#52796f]">{locBins.length} Bins</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-[#143826] mt-1">
                      🌿 CUSAT — {loc.name}
                    </h4>
                    <span className="text-[11px] text-[#52796f]">{loc.zone}</span>
                  </div>

                  {hasMismatch && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠️ Mismatch
                    </span>
                  )}
                </div>

                {/* 4 Bins Row (Exact prompt format requirement 7) */}
                <div className="grid grid-cols-2 gap-2">
                  {locBins.map((bin) => {
                    const meta = getStreamMeta(bin.wasteType);
                    return (
                      <div
                        key={bin.id}
                        onClick={() => setSelectedBin(bin)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer bg-white ${
                          bin.wrongWasteDetected
                            ? 'border-amber-400 ring-1 ring-amber-300'
                            : 'border-[#dbe6dc] hover:border-[#1b4332]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#143826] flex items-center gap-1">
                            <span>{meta.icon}</span>
                            <span className="truncate">{meta.label}</span>
                          </span>
                          <span className="font-mono font-bold text-[#143826]">{bin.fillLevel}%</span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full bg-[#e2ece3] rounded-full h-1.5 overflow-hidden my-1.5">
                          <div
                            className={`h-full rounded-full ${
                              bin.fillLevel >= 90 ? 'bg-rose-600' : bin.fillLevel >= 75 ? 'bg-amber-500' : 'bg-[#2d6a4f]'
                            }`}
                            style={{ width: `${bin.fillLevel}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#52796f]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQrModalBin(bin);
                            }}
                            className="text-[#2d6a4f] hover:underline font-mono"
                          >
                            QR ▣
                          </button>
                          <span className="font-mono">{bin.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Contextual warning / inspect */}
                <div className="pt-2 border-t border-[#e2ece3] flex items-center justify-between text-[11px]">
                  {hasUrgent ? (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Critical fill reached!</span>
                    </span>
                  ) : hasMismatch ? (
                    <span className="text-amber-800 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Wrong waste detected</span>
                    </span>
                  ) : (
                    <span className="text-[#52796f]">All bins nominal</span>
                  )}

                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className="text-[#1b4332] font-semibold hover:text-[#2d6a4f] flex items-center gap-1"
                  >
                    <span>View Location</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
