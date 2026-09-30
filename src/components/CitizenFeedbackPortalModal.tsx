import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  Sparkles
} from 'lucide-react';
import { WasteBin } from '../types';
import { api } from '../services/api';

interface CitizenFeedbackPortalModalProps {
  bin: WasteBin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CitizenFeedbackPortalModal: React.FC<CitizenFeedbackPortalModalProps> = ({
  bin,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('MISMATCH');
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenContact, setCitizenContact] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFeedbackId, setSubmittedFeedbackId] = useState<string | null>(null);

  if (!isOpen || !bin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitCitizenFeedback({
        bin_id: bin.id,
        feedback_type: feedbackType,
        citizen_name: citizenName.trim() || 'CUSAT Campus Member',
        citizen_contact: citizenContact.trim() || 'N/A',
        comments: comments.trim(),
      });
      setSubmittedFeedbackId(res.id);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedFeedbackId(null);
    setComments('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header - Styled like a public mobile web portal */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Public Campus Feedback Portal</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Scanned via Smart Bin QR Code #{bin.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedFeedbackId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">Feedback Ticket Logged</h4>
              <p className="text-xs font-mono text-emerald-400 font-semibold">
                Ticket ID: #{submittedFeedbackId}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1">
                Thank you for keeping CUSAT clean! Your complaint has entered the university sanitation dispatch console in real time.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              Close Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Scanned Bin Identity Banner */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {bin.location_name}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{bin.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Waste Category: <strong className="text-white">{bin.category_label}</strong></span>
                <span>·</span>
                <span>Current Fill: <strong className="text-white font-mono">{bin.fill_level}%</strong></span>
              </div>
            </div>

            {/* Issue Category */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">Issue or Feedback Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'MISMATCH', label: 'Waste Mismatch (Wrong items)' },
                  { id: 'OVERFLOW', label: 'Bin Overflowing' },
                  { id: 'ODOR_SMELL', label: 'Severe Odor / Flies' },
                  { id: 'DAMAGED', label: 'Bin Damaged / Broken Lid' },
                  { id: 'CLEANLINESS', label: 'Litter Around Bin Area' },
                  { id: 'OTHER', label: 'General Feedback / Commend' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFeedbackType(opt.id)}
                    className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                      feedbackType === opt.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Citizen Contact Details (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul K. (SOE Student)"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email / Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. rahul@cusat.ac.in"
                  value={citizenContact}
                  onChange={(e) => setCitizenContact(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Comments Box */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Details / Description</label>
              <textarea
                rows={3}
                required
                placeholder="Describe what you observed (e.g. food packets thrown into blue plastic bin, or lid latch broken)..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !comments.trim()}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit to Campus Dispatch'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
