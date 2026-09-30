import React, { useState } from 'react';
import {
  Trash2,
  Search,
  Filter,
  Layers,
  Thermometer,
  Droplets,
  Battery,
  Lock,
  Unlock,
  AlertTriangle,
  QrCode,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  Table,
  LayoutGrid
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoBin, WasteType, BinStatus } from '../types';

export const EcoBinsPage: React.FC = () => {
  const {
    bins,
    locations,
    setSelectedBin,
    setSelectedLocation,
    setQrModalBin,
    setDamageModalBin,
    markAsCollected,
    searchQuery,
    setSearchQuery
  } = useEco();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | WasteType>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredBins = bins.filter((bin) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = bin.id.toLowerCase().includes(q);
      const matchLoc = bin.locationName.toLowerCase().includes(q);
      const matchCat = bin.wasteLabel.toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchCat) return false;
    }

    // Category
    if (categoryFilter !== 'ALL' && bin.wasteType !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'NORMAL' && bin.status !== 'NORMAL') return false;
    if (statusFilter === 'WARNING' && bin.status !== 'WARNING') return false;
    if (statusFilter === 'URGENT' && bin.status !== 'URGENT' && bin.status !== 'COLLECTION_REQUIRED') return false;
    if (statusFilter === 'DAMAGED' && bin.physicalCondition === 'GOOD') return false;
    if (statusFilter === 'OPEN' && !bin.isOpen) return false;
    if (statusFilter === 'OFFLINE' && bin.isOnline) return false;

    return true;
  });

  const getStreamMeta = (type: WasteType) => {
    switch (type) {
      case 'PLASTIC':
        return { icon: '♻️', label: 'Plastic', bar: 'bg-blue-600', badge: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'PAPER':
        return { icon: '📄', label: 'Paper', bar: 'bg-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'METAL':
        return { icon: '🥫', label: 'Metal', bar: 'bg-slate-600', badge: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'FOOD':
        return { icon: '🍱', label: 'Food Waste', bar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const getStatusBadge = (b: EcoBin) => {
    if (!b.isOnline) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">📡 Offline</span>;
    }
    if (b.fillLevel >= 95) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">🚨 Urgent</span>;
    }
    if (b.fillLevel >= 75) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-300">🔴 Collection Req</span>;
    }
    if (b.fillLevel >= 50) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">🟠 Attention</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Normal</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🗑️</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              All CUSAT Smart Waste Bins ({bins.length} Total)
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Real-time IoT telemetry, fill percentage tracking, wrong-waste identification, and lid sensors across 20 campus stations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Table Toggle */}
          <div className="flex items-center bg-[#f0f6ef] border border-[#d3e2d5] p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-[#1b4332] text-white shadow-xs font-medium' : 'text-[#52796f] hover:text-[#143826]'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-[#1b4332] text-white shadow-xs font-medium' : 'text-[#52796f] hover:text-[#143826]'
              }`}
              title="Data Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Requirement 23) */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#52796f] text-xs font-medium mr-1">Waste Stream:</span>
            {[
              { id: 'ALL', label: 'All Streams (76)' },
              { id: 'PLASTIC', label: '♻️ Plastic' },
              { id: 'PAPER', label: '📄 Paper' },
              { id: 'METAL', label: '🥫 Metal' },
              { id: 'FOOD', label: '🍱 Food Waste' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
                  categoryFilter === c.id
                    ? 'bg-[#1b4332] text-white shadow-2xs font-semibold'
                    : 'bg-[#f0f6ef] text-[#2d3732] hover:bg-[#e4efe3]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Condition / Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#52796f]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-xs text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">All Conditions ({bins.length})</option>
              <option value="NORMAL">🟢 Normal (0-49%)</option>
              <option value="WARNING">🟠 Warning (50-74%)</option>
              <option value="URGENT">🔴 Collection Required (≥75%)</option>
              <option value="DAMAGED">🔧 Damaged / Maintenance</option>
              <option value="OPEN">🔓 Lid Open</option>
              <option value="OFFLINE">📡 Sensor Offline</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#6d9178] font-mono flex items-center justify-between border-t border-[#e2ece3] pt-2">
          <span>
            Showing <strong className="text-[#143826]">{filteredBins.length}</strong> of {bins.length} smart bins
          </span>
          {categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery ? (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[#2d6a4f] hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Grid Card View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBins.map((bin) => {
            const meta = getStreamMeta(bin.wasteType);
            const isFull = bin.fillLevel >= 75;

            return (
              <div
                key={bin.id}
                className="bg-[#fbfdfa] border border-[#dbe6dc] hover:border-[#2d6a4f] rounded-3xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
              >
                {/* Top Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#1b4332] text-white">
                      {bin.id}
                    </span>
                    {getStatusBadge(bin)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{meta.icon}</span>
                      <h3 className="text-xs font-bold text-[#143826] group-hover:text-[#2d6a4f] transition-colors">
                        {bin.wasteLabel}
                      </h3>
                    </div>
                    <div className="text-[11px] text-[#52796f] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#84a98c] shrink-0" />
                      <span className="truncate">{bin.locationName}</span>
                    </div>
                  </div>

                  {/* Visual Fill Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#52796f]">Fill Level</span>
                      <span className="font-bold text-[#143826]">{bin.fillLevel}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#e8efe7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bin.fillLevel >= 95
                            ? 'bg-rose-600'
                            : bin.fillLevel >= 75
                            ? 'bg-orange-500'
                            : bin.fillLevel >= 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(bin.fillLevel, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Anomaly Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bin.wrongWasteDetected && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Wrong Waste
                      </span>
                    )}
                    {bin.isOpen && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        🔓 Lid Open
                      </span>
                    )}
                    {bin.physicalCondition !== 'GOOD' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100 text-stone-800 border border-stone-300">
                        🔧 {bin.physicalCondition}
                      </span>
                    )}
                  </div>

                  {/* Telemetry quick sensors */}
                  <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-[#f4f8f3] text-[10px] font-mono text-[#52796f]">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-[#2d6a4f]" />
                      <span>{bin.temperatureC}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-[#2d6a4f]" />
                      <span>{bin.humidityPct}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-[#2d6a4f]" />
                      <span>{bin.batteryLevel}%</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2 pt-2 border-t border-[#e2ece3]">
                  <div className="flex items-center justify-between text-[10px] text-[#6d9178] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{bin.lastUpdated}</span>
                    </span>
                    <span className={bin.isOnline ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                      {bin.isOnline ? '● LIVE' : '○ OFFLINE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBin(bin)}
                      className="flex-1 py-1.5 px-2 bg-[#1b4332] text-white hover:bg-[#2d6a4f] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setQrModalBin(bin)}
                      className="p-1.5 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-xl transition-colors"
                      title="Print / View Citizen QR Code"
                    >
                      <QrCode className="w-4 h-4 text-[#1b4332]" />
                    </button>

                    <button
                      onClick={() => setDamageModalBin(bin)}
                      className="p-1.5 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-xl transition-colors"
                      title="Report Damage / Maintenance"
                    >
                      <Wrench className="w-4 h-4 text-[#52796f]" />
                    </button>

                    {isFull && (
                      <button
                        onClick={() => markAsCollected(bin.id)}
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-xl transition-colors"
                        title="Mark as Collected (Resets Fill)"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] text-[#52796f] font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bin ID</th>
                  <th className="py-3 px-4">Stream / Waste Type</th>
                  <th className="py-3 px-4">Campus Location</th>
                  <th className="py-3 px-4">Fill Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Security / Lid</th>
                  <th className="py-3 px-4">Physical State</th>
                  <th className="py-3 px-4">Sensors</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3ec]">
                {filteredBins.map((bin) => {
                  const meta = getStreamMeta(bin.wasteType);
                  return (
                    <tr key={bin.id} className="hover:bg-[#f6f9f5] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#143826]">
                        {bin.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#143826]">
                          <span>{meta.icon}</span>
                          <span>{bin.wasteLabel}</span>
                        </span>
                        {bin.wrongWasteDetected && (
                          <div className="text-[10px] font-mono text-amber-700 font-bold">
                            ⚠️ Mismatch!
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#52796f]">
                        <span className="font-medium text-[#143826] block">{bin.locationName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#143826] w-9">{bin.fillLevel}%</span>
                          <div className="w-16 h-2 bg-[#e8efe7] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                bin.fillLevel >= 95
                                  ? 'bg-rose-600'
                                  : bin.fillLevel >= 75
                                  ? 'bg-orange-500'
                                  : bin.fillLevel >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${bin.fillLevel}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(bin)}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {bin.isOpen ? (
                          <span className="text-rose-700 flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5" /> Open
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Closed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                            bin.physicalCondition === 'GOOD'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {bin.physicalCondition}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#52796f]">
                        {bin.temperatureC}°C · {bin.humidityPct}% · {bin.batteryLevel}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBin(bin)}
                            className="px-2.5 py-1 bg-[#1b4332] text-white hover:bg-[#2d6a4f] rounded-lg text-xs font-semibold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setQrModalBin(bin)}
                            className="p-1 bg-[#f0f6ef] hover:bg-[#e2ece3] rounded-lg border border-[#d3e2d5]"
                            title="QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#1b4332]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
