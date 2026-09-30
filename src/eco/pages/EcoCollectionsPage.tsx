import React, { useState } from 'react';
import {
  Truck,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Trash2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoCollectionTask, CollectionStatus, EcoBin } from '../types';

export const EcoCollectionsPage: React.FC = () => {
  const {
    collections,
    bins,
    users,
    assignCollector,
    markAsCollected,
    createCollectionTask,
    setSelectedBin
  } = useEco();

  const [statusFilter, setStatusFilter] = useState<'ALL' | CollectionStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assignModalTask, setAssignModalTask] = useState<EcoCollectionTask | null>(null);
  const [selectedCollectorName, setSelectedCollectorName] = useState<string>('');
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [newTaskBinId, setNewTaskBinId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  const collectors = users.filter((u) => u.role === 'COLLECTOR' || u.role === 'STAFF');

  const filteredTasks = collections.filter((task) => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusBadge = (status: CollectionStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            🟡 Pending
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
            🔵 Assigned
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-300">
            🟠 In Progress
          </span>
        );
      case 'COLLECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            🟢 Collected
          </span>
        );
    }
  };

  const getPriorityBadge = (p: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">URGENT</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="text-[10px] font-mono font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">LOW</span>;
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignModalTask && selectedCollectorName) {
      assignCollector(assignModalTask.id, selectedCollectorName);
      setAssignModalTask(null);
      setSelectedCollectorName('');
    }
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskBinId) {
      createCollectionTask(newTaskBinId, newTaskPriority, selectedCollectorName || undefined);
      setCreateTaskModalOpen(false);
      setNewTaskBinId('');
      setSelectedCollectorName('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              Campus Waste Collection & Sanitation Dispatch
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Real-time routing for CUSAT sanitation staff, priority queue assignments, and automated bin level resets upon pickup.
          </p>
        </div>

        <button
          onClick={() => setCreateTaskModalOpen(true)}
          className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Pickup</span>
        </button>
      </div>

      {/* Filter Tabs & Options */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#52796f] text-xs font-medium mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All Dispatches' },
              { id: 'PENDING', label: '🟡 Pending' },
              { id: 'ASSIGNED', label: '🔵 Assigned' },
              { id: 'IN_PROGRESS', label: '🟠 In Progress' },
              { id: 'COLLECTED', label: '🟢 Collected' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
                  statusFilter === s.id
                    ? 'bg-[#1b4332] text-white shadow-2xs font-semibold'
                    : 'bg-[#f0f6ef] text-[#2d3732] hover:bg-[#e4efe3]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#52796f]" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-xs text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent (≥95%)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#6d9178] font-mono flex items-center justify-between border-t border-[#e2ece3] pt-2">
          <span>
            Showing <strong>{filteredTasks.length}</strong> collection runs
          </span>
          {statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-[#2d6a4f] hover:underline"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Collections Table (Requirement 18) */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] text-[#52796f] font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Dispatch ID</th>
                <th className="py-3 px-4">Bin & Location</th>
                <th className="py-3 px-4">Waste Stream</th>
                <th className="py-3 px-4">Fill Level</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Collector</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ec]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#52796f]">
                    No collection tasks match the criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const targetBin = bins.find((b) => b.id === task.binId);

                  return (
                    <tr key={task.id} className="hover:bg-[#f6f9f5] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#143826]">
                        {task.id}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#143826] block">{task.binId}</span>
                        <span className="text-[11px] text-[#52796f] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#84a98c]" />
                          <span>{task.locationName}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#143826]">
                          {task.wasteType === 'PLASTIC'
                            ? '♻️ Plastic'
                            : task.wasteType === 'PAPER'
                            ? '📄 Paper'
                            : task.wasteType === 'METAL'
                            ? '🥫 Metal'
                            : '🍱 Food Waste'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            task.fillLevel >= 95
                              ? 'text-rose-700'
                              : task.fillLevel >= 75
                              ? 'text-orange-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {task.fillLevel}%
                        </span>
                      </td>

                      <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>

                      <td className="py-3 px-4">
                        {task.assignedCollector ? (
                          <div className="flex items-center gap-1.5 text-[#143826]">
                            <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
                            <span className="font-medium">{task.assignedCollector}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-mono italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(task.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Collector button */}
                          {task.status !== 'COLLECTED' && (
                            <button
                              onClick={() => {
                                setAssignModalTask(task);
                                setSelectedCollectorName(task.assignedCollector || collectors[0]?.name || '');
                              }}
                              className="px-2.5 py-1 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-lg text-xs font-medium transition-colors"
                            >
                              Assign
                            </button>
                          )}

                          {/* Mark as Collected button (Requirement 18: resets fill level) */}
                          {task.status !== 'COLLECTED' ? (
                            <button
                              onClick={() => markAsCollected(task.binId)}
                              className="px-2.5 py-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                              title="Confirm waste collected (resets bin fill level to low value)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#b7e4c7]" />
                              <span>Mark Collected</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-[#6d9178] flex items-center gap-1">
                              ✓ {task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Collected'}
                            </span>
                          )}
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

      {/* Assign Collector Modal */}
      {assignModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                Assign Sanitation Collector
              </h3>
              <p className="text-xs text-[#52796f] mt-0.5">
                Route assignment for {assignModalTask.binId} at {assignModalTask.locationName}.
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#143826] font-medium mb-1">Select Squad Member</label>
                <select
                  value={selectedCollectorName}
                  onChange={(e) => setSelectedCollectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                >
                  {collectors.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.department} - {c.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalTask(null)}
                  className="px-3 py-1.5 text-[#52796f] hover:text-[#143826]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1b4332] text-white rounded-xl font-semibold"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Dispatch Modal */}
      {createTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                Schedule Manual Collection Task
              </h3>
              <p className="text-xs text-[#52796f] mt-0.5">
                Queue an ad-hoc or urgent pickup for any campus smart bin.
              </p>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#143826] font-medium mb-1">Target Smart Bin</label>
                <select
                  value={newTaskBinId}
                  onChange={(e) => setNewTaskBinId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                >
                  <option value="">Select a Smart Bin...</option>
                  {bins.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.locationName} ({b.wasteLabel}, {b.fillLevel}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#143826] font-medium mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                  >
                    <option value="URGENT">Urgent (Over capacity)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#143826] font-medium mb-1">Assign Staff</label>
                  <select
                    value={selectedCollectorName}
                    onChange={(e) => setSelectedCollectorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                  >
                    <option value="">Auto-route (Queue)</option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(false)}
                  className="px-3 py-1.5 text-[#52796f] hover:text-[#143826]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1b4332] text-white rounded-xl font-semibold"
                >
                  Dispatch Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
