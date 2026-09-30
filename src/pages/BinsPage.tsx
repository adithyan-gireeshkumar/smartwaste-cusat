import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Search,
  Filter,
  Plus,
  Battery,
  AlertCircle,
  ExternalLink,
  Cpu,
  Truck,
  ArrowUpDown,
  MapPin
} from 'lucide-react';
import { WasteBin, LocationItem } from '../types';
import { api } from '../services/api';

interface BinsPageProps {
  bins: WasteBin[];
  locations: LocationItem[];
  onSelectBin: (bin: WasteBin) => void;
  onOpenSimulatorForBin: (bin: WasteBin) => void;
  onOpenCollectionModal: (bin: WasteBin) => void;
  onRefresh: () => void;
}

export const BinsPage: React.FC<BinsPageProps> = ({
  bins,
  locations,
  onSelectBin,
  onOpenSimulatorForBin,
  onOpenCollectionModal,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'fill_level' | 'id' | 'location'>('fill_level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinLocationId, setNewBinLocationId] = useState(locations[0]?.id || '');
  const [newBinCapacity, setNewBinCapacity] = useState('240');
  const [isCreating, setIsCreating] = useState(false);

  const zones = useMemo(() => {
    const set = new Set<string>();
    bins.forEach((b) => {
      if (b.ward) set.add(b.ward);
    });
    return Array.from(set);
  }, [bins]);

  const filteredBins = useMemo(() => {
    return bins
      .filter((b) => {
        const matchesSearch =
          b.id.toLowerCase().includes(search.toLowerCase()) ||
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.location_name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
        const matchesZone = zoneFilter === 'ALL' || b.ward === zoneFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesZone;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'fill_level') diff = a.fill_level - b.fill_level;
        if (sortBy === 'id') diff = a.id.localeCompare(b.id);
        if (sortBy === 'location') diff = a.location_name.localeCompare(b.location_name);
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [bins, search, statusFilter, categoryFilter, zoneFilter, sortBy, sortOrder]);

  const handleCreateBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinLocationId) return;
    setIsCreating(true);
    try {
      await api.createBin({
        name: newBinName || `Campus Bin ${bins.length + 1}`,
        location_id: newBinLocationId,
        capacity_liters: Number(newBinCapacity) || 240,
      });
      setIsAddModalOpen(false);
      setNewBinName('');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error adding bin';
      alert(message);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleSort = (field: 'fill_level' | 'id' | 'location') => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Smart Waste Bins Directory</h2>
          <p className="text-xs text-slate-400">
            Monitoring 20 autonomous solar & IoT compactor bins across CUSAT Kochi campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Smart Bin</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name or landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Waste Types</option>
            <option value="PLASTIC">🟦 Plastic</option>
            <option value="PAPER">📄 Paper</option>
            <option value="METAL">⚙️ Metal</option>
            <option value="ORGANIC">🍃 Food/Organic</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">Normal (&lt;75%)</option>
            <option value="WARNING">Near Full (75-89%)</option>
            <option value="CRITICAL">Critical (90-99%)</option>
            <option value="FULL">Full (100%)</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Campus Zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-1.5">
                    <span>Bin ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Waste Category</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('location')}>
                  <div className="flex items-center gap-1.5">
                    <span>Location & Campus Ward</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('fill_level')}>
                  <div className="flex items-center gap-1.5">
                    <span>Fill Level</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status & Health</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Last Update</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBins.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No smart bins found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBins.map((bin) => {
                  return (
                    <tr
                      key={bin.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectBin(bin)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        {bin.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {bin.category === 'PLASTIC'
                              ? '🟦'
                              : bin.category === 'PAPER'
                              ? '📄'
                              : bin.category === 'METAL'
                              ? '⚙️'
                              : '🍃'}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {bin.category_label || bin.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{bin.location_name}</div>
                        <div className="text-[11px] text-slate-400">{bin.ward}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white tabular-nums w-8">
                            {bin.fill_level}%
                          </span>
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                bin.fill_level >= 90
                                  ? 'bg-rose-500'
                                  : bin.fill_level >= 75
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${bin.fill_level}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              bin.status === 'FULL'
                                ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                : bin.status === 'CRITICAL'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                : bin.status === 'WARNING'
                                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            }`}
                          >
                            {bin.status}
                          </span>
                          {bin.mismatch_detected && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ⚠️ Mismatch
                            </span>
                          )}
                          {bin.lid_status === 'ABNORMALLY_OPEN' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              Lid Open
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Battery className="w-3.5 h-3.5 text-slate-400" />
                          <span>{bin.battery_level}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">
                        {bin.device_status}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(bin.last_updated).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenSimulatorForBin(bin)}
                            title="Simulate telemetry reading"
                            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenCollectionModal(bin)}
                            title="Create collection task"
                            className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectBin(bin)}
                            title="Open detail panel"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Bin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Add New Smart Waste Bin</h3>
            <form onSubmit={handleCreateBin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bin Identifier / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Science Quad Bin #2"
                  value={newBinName}
                  onChange={(e) => setNewBinName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Campus Location</label>
                <select
                  value={newBinLocationId}
                  onChange={(e) => setNewBinLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Capacity (Liters)</label>
                <select
                  value={newBinCapacity}
                  onChange={(e) => setNewBinCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="120">120 Liters (Compact)</option>
                  <option value="240">240 Liters (Standard)</option>
                  <option value="360">360 Liters (High Volume)</option>
                  <option value="660">660 Liters (Dumpster)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg"
                >
                  {isCreating ? 'Provisioning...' : 'Provision Bin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
