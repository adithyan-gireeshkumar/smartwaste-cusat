import React, { useState, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Play,
  Check,
  UserCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { CollectionTask, WasteBin } from '../types';
import { api } from '../services/api';

interface CollectionsPageProps {
  collections: CollectionTask[];
  bins: WasteBin[];
  onRefresh: () => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  collections,
  bins,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [activeTaskToComplete, setActiveTaskToComplete] = useState<CollectionTask | null>(null);
  const [newFillLevel, setNewFillLevel] = useState<number>(10);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New task modal
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskBinId, setNewTaskBinId] = useState(bins[0]?.id || '');
  const [newTaskStaff, setNewTaskStaff] = useState('Manoj K.V.');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  const filteredTasks = useMemo(() => {
    return collections.filter((c) => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.bin_id.toLowerCase().includes(search.toLowerCase()) ||
        c.location_name.toLowerCase().includes(search.toLowerCase()) ||
        c.assigned_staff.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [collections, statusFilter, search]);

  const handleStartTask = async (id: string) => {
    try {
      await api.startCollectionTask(id);
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error starting task';
      alert(message);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskToComplete) return;
    setIsSubmitting(true);
    try {
      await api.completeCollectionTask(
        activeTaskToComplete.id,
        newFillLevel,
        completionNotes || 'Bin emptied and sanitized. Compactor tested.'
      );
      setActiveTaskToComplete(null);
      setCompletionNotes('');
      setNewFillLevel(10);
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error completing collection';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskBinId) return;
    setIsSubmitting(true);
    try {
      await api.createCollectionTask({
        bin_id: newTaskBinId,
        assigned_staff: newTaskStaff,
        priority: newTaskPriority,
        notes: 'Dispatched from Collection Management console.',
      });
      setIsNewTaskOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error creating task';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Campus Waste Collection Fleet</h2>
          <p className="text-xs text-slate-400">
            Dispatch, assignment, and completion workflows for CUSAT sanitation staff and electric vehicles.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Collection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by task ID, staff, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'All'
                : st === 'IN_PROGRESS'
                ? 'In Progress'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No collection tasks found</h3>
            <p className="text-xs text-slate-400">
              There are currently no active or queued collection tasks for this filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-blue-400 shrink-0 mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-400">{t.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="font-semibold text-white text-sm">{t.location_name}</span>
                      <span className="text-xs text-slate-400 font-mono">({t.bin_id})</span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          t.status === 'COMPLETED'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : t.status === 'IN_PROGRESS'
                            ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>
                        Staff: <strong className="text-white">{t.assigned_staff}</strong>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span>Supervisor: {t.supervisor}</span>
                      <span className="text-slate-600">·</span>
                      <span>
                        Priority:{' '}
                        <strong
                          className={
                            t.priority === 'URGENT'
                              ? 'text-rose-400 font-bold'
                              : t.priority === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {t.priority}
                        </strong>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span>Initial Fill: <strong className="text-white font-mono">{t.previous_fill_level}%</strong></span>
                      {t.new_fill_level !== null && t.new_fill_level !== undefined && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-emerald-400">
                            Post-Collection: <strong className="font-mono">{t.new_fill_level}%</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {t.notes && <p className="text-[11px] text-slate-400 pt-1">{t.notes}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {t.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStartTask(t.id)}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Route</span>
                    </button>
                  )}

                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setActiveTaskToComplete(t)}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete Collection</span>
                    </button>
                  )}

                  {t.status === 'COMPLETED' && (
                    <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finished ({new Date(t.completed_at || '').toLocaleTimeString()})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Collection Modal */}
      {activeTaskToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Complete Task #{activeTaskToComplete.id}
            </h3>
            <p className="text-xs text-slate-400">
              Record post-emptying telemetry measurement for {activeTaskToComplete.location_name} ({activeTaskToComplete.bin_id}).
            </p>
            <form onSubmit={handleCompleteTask} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>New Empty Fill Level (%):</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    {newFillLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={newFillLevel}
                  onChange={(e) => setNewFillLevel(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Field Notes</label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Cleared all recyclables, compactor cycle verified..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTaskToComplete(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Dispatch Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Dispatch New Collection Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Smart Bin</label>
                <select
                  value={newTaskBinId}
                  onChange={(e) => setNewTaskBinId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {bins.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.location_name} (Fill: {b.fill_level}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Collection Staff</label>
                <select
                  value={newTaskStaff}
                  onChange={(e) => setNewTaskStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="Manoj K.V.">Manoj K.V. (Engineering Route Squad)</option>
                  <option value="Santhosh Babu">Santhosh Babu (Hostels & Commons Squad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="LOW">Low (Routine pickup)</option>
                  <option value="MEDIUM">Medium (Scheduled cycle)</option>
                  <option value="HIGH">High (Near 75% warning)</option>
                  <option value="URGENT">Urgent (Over 90% critical)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold rounded-lg"
                >
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
