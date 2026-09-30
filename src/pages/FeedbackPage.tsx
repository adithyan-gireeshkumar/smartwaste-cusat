import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Wrench,
  QrCode,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Plus,
  Send,
  Trash2,
  MapPin,
  Tag
} from 'lucide-react';
import { CitizenFeedback, DamageReport, WasteBin, WasteCategory, DamageType } from '../types';
import { api } from '../services/api';

interface FeedbackPageProps {
  feedbacks: CitizenFeedback[];
  damageReports: DamageReport[];
  bins: WasteBin[];
  onRefresh: () => void;
  onOpenQRModal: (bin: WasteBin) => void;
  onOpenFeedbackModal: (bin: WasteBin) => void;
  onOpenDamageModal: (bin: WasteBin) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  feedbacks,
  damageReports,
  bins,
  onRefresh,
  onOpenQRModal,
  onOpenFeedbackModal,
  onOpenDamageModal,
}) => {
  const [activeTab, setActiveTab] = useState<'FEEDBACK' | 'DAMAGE'>('FEEDBACK');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals for resolving / assigning
  const [assigningFeedback, setAssigningFeedback] = useState<CitizenFeedback | null>(null);
  const [assignStaffName, setAssignStaffName] = useState('Manoj K.V.');

  const [resolvingFeedback, setResolvingFeedback] = useState<CitizenFeedback | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [assigningDamage, setAssigningDamage] = useState<DamageReport | null>(null);
  const [resolvingDamage, setResolvingDamage] = useState<DamageReport | null>(null);
  const [damageNotes, setDamageNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchSearch =
        item.bin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citizen_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [feedbacks, searchQuery, statusFilter]);

  // Filtered damage reports
  const filteredDamages = useMemo(() => {
    return damageReports.filter((item) => {
      const matchSearch =
        item.bin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.damage_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [damageReports, searchQuery, statusFilter]);

  // Actions
  const handleAssignFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningFeedback) return;
    setIsSubmitting(true);
    try {
      await api.updateCitizenFeedback(assigningFeedback.id, {
        assigned_to: assignStaffName,
        status: 'ASSIGNED',
      });
      setAssigningFeedback(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error assigning feedback';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingFeedback) return;
    setIsSubmitting(true);
    try {
      await api.updateCitizenFeedback(resolvingFeedback.id, {
        status: 'RESOLVED',
        resolution_notes: resolutionNotes || 'Cleaned and sanitized area as reported.',
      });
      setResolvingFeedback(null);
      setResolutionNotes('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resolving feedback';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDamage) return;
    setIsSubmitting(true);
    try {
      await api.updateDamageReport(assigningDamage.id, {
        assigned_staff: assignStaffName,
        status: 'IN_REPAIR',
      });
      setAssigningDamage(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error assigning damage repair';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDamage) return;
    setIsSubmitting(true);
    try {
      await api.updateDamageReport(resolvingDamage.id, {
        status: 'RESOLVED',
        resolution_notes: damageNotes || 'Replaced parts and verified structural integrity.',
      });
      setResolvingDamage(null);
      setDamageNotes('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resolving damage';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Citizen QR Feedback & Bin Damage Center</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              QR Decals Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Public campus feedback submitted by students & visitors via bin QR codes, and maintenance work orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {bins.length > 0 && (
            <button
              onClick={() => onOpenFeedbackModal(bins[0])}
              className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Test Public QR Feedback</span>
            </button>
          )}
          {bins.length > 0 && (
            <button
              onClick={() => onOpenDamageModal(bins[0])}
              className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Report Bin Damage</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('FEEDBACK');
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'FEEDBACK'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Citizen QR Feedback ({feedbacks.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('DAMAGE');
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'DAMAGE'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Damage Reports ({damageReports.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by bin, location, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-slate-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {activeTab === 'FEEDBACK' ? (
              <>
                <option value="NEW">New (Unassigned)</option>
                <option value="ASSIGNED">Assigned to Staff</option>
                <option value="RESOLVED">Resolved</option>
              </>
            ) : (
              <>
                <option value="REPORTED">Reported</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="RESOLVED">Resolved</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* FEEDBACK TAB CONTENT */}
      {activeTab === 'FEEDBACK' && (
        <div className="space-y-3">
          {filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">No citizen feedback records found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Students and visitors can scan the QR code affixed to any smart bin to report issues, overflow, or waste mismatch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {fb.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          fb.status === 'NEW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : fb.status === 'ASSIGNED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{fb.location_name}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Target Bin: <span className="text-slate-300 font-semibold">{fb.bin_id}</span> ({fb.category})
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-amber-400">{fb.feedback_type.replace('_', ' ')}</span>
                        <span>{new Date(fb.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 text-xs italic">"{fb.comments}"</p>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Reported by: <span className="text-slate-400">{fb.citizen_name}</span> ({fb.citizen_contact})
                      </div>
                    </div>

                    {fb.assigned_to && (
                      <div className="text-[11px] text-blue-400 flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assigned to: {fb.assigned_to}</span>
                      </div>
                    )}

                    {fb.resolution_notes && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved: {fb.resolution_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {fb.status === 'NEW' && (
                      <button
                        onClick={() => setAssigningFeedback(fb)}
                        className="flex-1 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-xs font-medium transition-colors"
                      >
                        Assign Staff
                      </button>
                    )}
                    {fb.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setResolvingFeedback(fb)}
                        className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {fb.status === 'RESOLVED' && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Clean
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DAMAGE TAB CONTENT */}
      {activeTab === 'DAMAGE' && (
        <div className="space-y-3">
          {filteredDamages.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">No damage reports on file</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All CUSAT smart bins, sensors, lids, compactor chassis, and wheels are currently nominal and intact.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDamages.map((dmg) => (
                <div
                  key={dmg.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {dmg.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          dmg.status === 'REPORTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : dmg.status === 'IN_REPAIR'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {dmg.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{dmg.damage_type.replace('_', ' ')}</span>
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Location: <span className="text-slate-300">{dmg.location_name}</span> ({dmg.bin_id})
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-rose-400">Severity: {dmg.severity}</span>
                        <span>{new Date(dmg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-200 text-xs">{dmg.description}</p>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Filer: {dmg.reported_by} ({dmg.reporter_type})
                      </div>
                    </div>

                    {dmg.assigned_staff && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assigned Tech: {dmg.assigned_staff}</span>
                      </div>
                    )}

                    {dmg.resolution_notes && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Work complete: {dmg.resolution_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {dmg.status === 'REPORTED' && (
                      <button
                        onClick={() => setAssigningDamage(dmg)}
                        className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium transition-colors"
                      >
                        Dispatch Tech
                      </button>
                    )}
                    {dmg.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setResolvingDamage(dmg)}
                        className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                      >
                        Sign-off Repair
                      </button>
                    )}
                    {dmg.status === 'RESOLVED' && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Chassis Intact
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ASSIGN FEEDBACK MODAL */}
      {assigningFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Assign Sanitation Squad</h3>
            <p className="text-xs text-slate-400">
              Assign campus sanitation staff to address complaint #{assigningFeedback.id} at {assigningFeedback.location_name}.
            </p>
            <form onSubmit={handleAssignFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Staff Member</label>
                <select
                  value={assignStaffName}
                  onChange={(e) => setAssignStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="Manoj K.V.">Manoj K.V. (Engineering Route Squad)</option>
                  <option value="Santhosh Babu">Santhosh Babu (Hostel & Commons Squad)</option>
                  <option value="Rajeev Nair">Rajeev Nair (Supervisor Fleet)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningFeedback(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE FEEDBACK MODAL */}
      {resolvingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Resolve Citizen Grievance</h3>
            <p className="text-xs text-slate-400">
              Provide inspection or resolution summary for complaint #{resolvingFeedback.id}.
            </p>
            <form onSubmit={handleResolveFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Resolution Summary / Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Empty compactor bin, cleared litter from sidewalk, sprayed disinfectant."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingFeedback(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded"
                >
                  Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN DAMAGE MODAL */}
      {assigningDamage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Dispatch Repair Technician</h3>
            <p className="text-xs text-slate-400">
              Dispatch maintenance crew for {assigningDamage.damage_type} at {assigningDamage.location_name}.
            </p>
            <form onSubmit={handleAssignDamage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Technician / Crew</label>
                <select
                  value={assignStaffName}
                  onChange={(e) => setAssignStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="Rajeev Nair">Rajeev Nair (Lead Workshop Technician)</option>
                  <option value="Manoj K.V.">Manoj K.V. (Chassis & Wheel Welder)</option>
                  <option value="Santhosh Babu">Santhosh Babu (Lid & Compactor Specialist)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningDamage(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE DAMAGE MODAL */}
      {resolvingDamage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-semibold text-white">Sign-off Damage Repair</h3>
            <p className="text-xs text-slate-400">
              Verify completion of physical repair on bin {resolvingDamage.bin_id}.
            </p>
            <form onSubmit={handleResolveDamage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Repair Notes</label>
                <textarea
                  rows={3}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="e.g. Installed new hydraulic lid hinge and tested optical sensors."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingDamage(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded"
                >
                  Mark Repaired & Intact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
