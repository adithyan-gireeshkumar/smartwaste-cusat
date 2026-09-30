import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ExternalLink,
  QrCode,
  AlertTriangle,
  UserCheck,
  Send,
  Plus,
  Sparkles,
  MapPin,
  Trash2
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoFeedback, FeedbackStatus } from '../types';

export const EcoFeedbackPage: React.FC = () => {
  const {
    feedback,
    bins,
    updateFeedbackStatus,
    setFeedbackModalBin,
    setQrModalBin,
    setSelectedBin
  } = useEco();

  const [statusFilter, setStatusFilter] = useState<'ALL' | FeedbackStatus>('ALL');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [resolveModalFeedback, setResolveModalFeedback] = useState<EcoFeedback | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [assignedStaffName, setAssignedStaffName] = useState('Sanitation Officer');

  const filteredFeedback = feedback.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (ratingFilter !== 'ALL' && item.rating !== ratingFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchBin = item.binId.toLowerCase().includes(q);
      const matchLoc = item.locationName.toLowerCase().includes(q);
      const matchComment = item.comment.toLowerCase().includes(q);
      if (!matchId && !matchBin && !matchLoc && !matchComment) return false;
    }
    return true;
  });

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            🟡 Pending
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
            🔵 In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            🟢 Resolved
          </span>
        );
    }
  };

  const getComplaintLabel = (type: string) => {
    switch (type) {
      case 'OVERFLOW':
        return '🚨 Bin Overflowing';
      case 'WRONG_WASTE':
        return '⚠️ Contamination / Wrong Waste';
      case 'DAMAGED_BIN':
        return '🔧 Damaged Structure / Broken Lid';
      case 'LOCATION_ISSUE':
        return '📍 Accessibility / Placement';
      case 'CLEANLINESS':
        return '✨ Station Cleanliness & Odor';
      default:
        return '💬 General Suggestion';
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolveModalFeedback) {
      updateFeedbackStatus(
        resolveModalFeedback.id,
        'RESOLVED',
        assignedStaffName,
        resolutionNote || 'Station inspected and cleaned by campus sanitation team.'
      );
      setResolveModalFeedback(null);
      setResolutionNote('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              Citizen Feedback & QR Grievance Portal
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Public feedback submitted by students, faculty, and visitors scanning QR codes across 20 CUSAT smart waste stations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => {
              // Open modal for the first bin as a test demo
              if (bins.length > 0) setFeedbackModalBin(bins[0]);
            }}
            className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Citizen QR Feedback</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#52796f] text-xs font-medium mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All Submissions' },
              { id: 'PENDING', label: '🟡 Pending' },
              { id: 'IN_PROGRESS', label: '🔵 In Progress' },
              { id: 'RESOLVED', label: '🟢 Resolved' },
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

          {/* Star Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#52796f] text-xs font-medium">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-1.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-xs text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">All Ratings (1 - 5 Stars)</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#e2ece3] pt-2 text-xs">
          <input
            type="text"
            placeholder="Search by feedback ID, bin, comment text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl text-xs w-full max-w-xs focus:outline-none focus:border-[#2d6a4f]"
          />

          <span className="text-[11px] font-mono text-[#6d9178]">
            Showing <strong>{filteredFeedback.length}</strong> citizen reviews
          </span>
        </div>
      </div>

      {/* Feedback Feed / Table (Requirement 17) */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <div className="p-12 text-center bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-[#143826]">No feedback records match</h3>
            <p className="text-xs text-[#52796f]">Try selecting a different filter or search term.</p>
          </div>
        ) : (
          filteredFeedback.map((item) => {
            const targetBin = bins.find((b) => b.id === item.binId);

            return (
              <div
                key={item.id}
                className="bg-[#fbfdfa] border border-[#dbe6dc] hover:border-[#2d6a4f] rounded-3xl p-5 shadow-2xs space-y-3 transition-all"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1b4332] text-white">
                      {item.id}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#143826]">
                          {item.binId} · {item.locationName}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <span className="text-[11px] text-[#52796f] font-mono">
                        By {item.citizenName || 'Anonymous Student'} {item.contactInfo ? `(${item.contactInfo})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {/* Star Rating Display */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= item.rating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] font-mono text-[#6d9178] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#84a98c]" />
                      <span>{new Date(item.submittedAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Complaint Category Tag */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#f0f6ef] border border-[#d3e2d5] text-[11px] font-semibold text-[#143826]">
                    {getComplaintLabel(item.complaintType)}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-[#2d3732] bg-[#f8faf7] p-3 rounded-2xl border border-[#e2ece3]">
                  "{item.comment}"
                </p>

                {/* Resolution note if any */}
                {item.resolutionNotes && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-0.5">
                    <span className="font-bold font-mono text-[10px]">Staff Resolution Notes:</span>
                    <p>{item.resolutionNotes}</p>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e2ece3]">
                  <div className="flex items-center gap-2">
                    {targetBin && (
                      <button
                        onClick={() => setSelectedBin(targetBin)}
                        className="px-2.5 py-1 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#1b4332]" />
                        <span>Inspect {targetBin.id}</span>
                      </button>
                    )}

                    {targetBin && (
                      <button
                        onClick={() => setQrModalBin(targetBin)}
                        className="p-1 bg-[#f0f6ef] hover:bg-[#e2ece3] rounded-xl border border-[#d3e2d5]"
                        title="View Station QR Code"
                      >
                        <QrCode className="w-4 h-4 text-[#1b4332]" />
                      </button>
                    )}
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="flex items-center gap-2">
                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => updateFeedbackStatus(item.id, 'IN_PROGRESS', 'Squad Dispatcher')}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Start Progress
                      </button>
                    )}

                    {item.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => setResolveModalFeedback(item)}
                        className="px-3 py-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b7e4c7]" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-700">
                        ✓ Case Closed ({item.assignedTo || 'Officer'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution Notes Modal */}
      {resolveModalFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                Resolve Citizen Feedback {resolveModalFeedback.id}
              </h3>
              <p className="text-xs text-[#52796f] mt-0.5">
                Record remedial action taken at {resolveModalFeedback.locationName}.
              </p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#143826] font-medium mb-1">Assigned Remediation Staff</label>
                <input
                  type="text"
                  value={assignedStaffName}
                  onChange={(e) => setAssignedStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                />
              </div>

              <div>
                <label className="block text-[#143826] font-medium mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Bin cleared of contamination, washed down, and sanitized by morning squad."
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2ece3]">
                <button
                  type="button"
                  onClick={() => setResolveModalFeedback(null)}
                  className="px-3 py-1.5 text-[#52796f] hover:text-[#143826]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1b4332] text-white rounded-xl font-semibold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
