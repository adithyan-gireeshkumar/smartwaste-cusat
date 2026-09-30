import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  Truck,
  Check,
  Search,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AlertItem, WasteBin } from '../types';
import { api } from '../services/api';

interface AlertsPageProps {
  alerts: AlertItem[];
  bins: WasteBin[];
  onRefresh: () => void;
  onOpenCollectionModal: (bin: WasteBin) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  bins,
  onRefresh,
  onOpenCollectionModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchCat = categoryFilter === 'ALL' || a.type === categoryFilter;
      const matchSearch =
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.bin_id.toLowerCase().includes(search.toLowerCase()) ||
        a.location_name.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
  }, [alerts, statusFilter, categoryFilter, search]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id, 'Dr. Suresh Kumar (SUPER ADMIN)');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error acknowledging alert';
      alert(message);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlertId) return;
    setIsSubmitting(true);
    try {
      await api.resolveAlert(
        resolvingAlertId,
        resolveNotes || 'Sanitation team emptied bin and verified normal telemetry.',
        'Rajeev Nair (SUPERVISOR)'
      );
      setResolvingAlertId(null);
      setResolveNotes('');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error resolving alert';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Campus Alert Command Center</h2>
          <p className="text-xs text-slate-400">
            Real-time automated threshold violation alerts with duplicate suppression and auto-resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('ACKNOWLEDGED')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === 'ACKNOWLEDGED'
                  ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ack'd ({acknowledgedCount})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts by bin, location, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-mono mr-1">Category:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'NEAR_FULL', label: 'Near Full (75%)' },
            { id: 'CRITICAL', label: 'Critical (90%)' },
            { id: 'FULL', label: 'Full (100%)' },
            { id: 'OFFLINE_SENSOR', label: 'Offline' },
            { id: 'WASTE_MISMATCH', label: '⚠️ Mismatch' },
            { id: 'LID_ABNORMALLY_OPEN', label: 'Lid Open' },
            { id: 'DAMAGE_REPORTED', label: 'Damage' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No alerts found</h3>
            <p className="text-xs text-slate-400">
              All campus bins are functioning within configured safe operational parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const associatedBin = bins.find((b) => b.id === alt.bin_id);
            return (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border transition-all ${
                  alt.status === 'RESOLVED'
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-70'
                    : alt.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : alt.severity === 'HIGH'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : 'bg-yellow-950/20 border-yellow-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        alt.status === 'RESOLVED'
                          ? 'bg-slate-800 text-slate-400'
                          : alt.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400'
                          : alt.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          {alt.id}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="font-semibold text-white text-sm">
                          {alt.location_name} ({alt.bin_id})
                        </span>
                        {alt.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {alt.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            alt.status === 'RESOLVED'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                              : alt.status === 'ACKNOWLEDGED'
                              ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          }`}
                        >
                          {alt.status}
                        </span>
                      </div>

                      {alt.details && (
                        <p className="text-xs text-slate-200 font-medium pt-0.5">
                          {alt.details}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>Fill Level: <strong className="text-white font-mono">{alt.fill_level}%</strong></span>
                        <span className="text-slate-600">·</span>
                        <span>Type: {alt.type.replace('_', ' ')}</span>
                        <span className="text-slate-600">·</span>
                        <span>Severity: {alt.severity}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-500">
                          {new Date(alt.created_time).toLocaleString()}
                        </span>
                      </div>

                      {/* Acknowledge / Resolution Audit Trail */}
                      {(alt.acknowledged_by || alt.resolved_by) && (
                        <div className="pt-1 text-[11px] text-slate-400 font-mono space-y-0.5">
                          {alt.acknowledged_by && (
                            <div>✓ Ack'd by {alt.acknowledged_by} ({new Date(alt.acknowledged_time || '').toLocaleTimeString()})</div>
                          )}
                          {alt.resolved_by && (
                            <div className="text-emerald-400">✓ Resolved by {alt.resolved_by} · Note: {alt.resolution_notes}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {alt.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledge(alt.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setResolvingAlertId(alt.id)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    {associatedBin && alt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onOpenCollectionModal(associatedBin)}
                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Fleet</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Dialog Modal */}
      {resolvingAlertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Resolve Alert #{resolvingAlertId}</h3>
            <p className="text-xs text-slate-400">
              Confirming this will mark the alert resolved, reset the bin fill level to normal (&lt;20%), and log the resolution audit trail.
            </p>
            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Resolution Notes</label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Sanitation staff emptied bin and verified compactor mechanism..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingAlertId(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg"
                >
                  {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
