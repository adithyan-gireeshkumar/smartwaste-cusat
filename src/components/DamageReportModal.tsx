import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { WasteBin, DamageType } from '../types';
import { api } from '../services/api';

interface DamageReportModalProps {
  bin: WasteBin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DamageReportModal: React.FC<DamageReportModalProps> = ({
  bin,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [damageType, setDamageType] = useState<DamageType>('LID_DAMAGED');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Campus Ops Staff');
  const [reporterType, setReporterType] = useState<'STAFF' | 'CITIZEN' | 'ADMIN'>('STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !bin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createDamageReport({
        bin_id: bin.id,
        damage_type: damageType,
        severity,
        description: description.trim(),
        reported_by: reportedBy.trim() || 'Operations Staff',
        reporter_type: reporterType,
      });
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error filing damage report';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const damageOptions: Array<{ type: DamageType; label: string; desc: string }> = [
    { type: 'BROKEN', label: 'Broken Chassis', desc: 'Structural failure on metal/plastic housing' },
    { type: 'CRACKED', label: 'Cracked Body', desc: 'Fissure on receptacle causing leakage' },
    { type: 'OVERFLOWING', label: 'Severe Overflow', desc: 'Compactor blocked or capacity overwhelmed' },
    { type: 'LID_DAMAGED', label: 'Lid Damaged', desc: 'Lid hinge broken or jammed open' },
    { type: 'WHEEL_DAMAGED', label: 'Wheel Damaged', desc: 'Caster wheel broken or detachment' },
    { type: 'FIRE_HEAT', label: 'Fire / Heat Damage', desc: 'Thermal anomaly, charring or smoldering' },
    { type: 'OTHER', label: 'Other Physical Issue', desc: 'Graffiti, sensor bracket loose, or vandalism' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Report Physical Bin Damage</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {bin.location_name} · {bin.category_label} ({bin.id})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Damage Type Selection */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">Select Damage Type</label>
            <div className="grid grid-cols-2 gap-2">
              {damageOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDamageType(opt.type)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    damageType === opt.type
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Severity Rating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="LOW">Low (Cosmetic/Minor)</option>
                <option value="MEDIUM">Medium (Requires Maintenance)</option>
                <option value="HIGH">High (Impacts Operation)</option>
                <option value="CRITICAL">Critical (Urgent Safety Hazard)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Reported By</label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Damage Description & Location</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Right wheel axle damaged during heavy rainfall; lid damper disconnected."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500"
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
              disabled={isSubmitting || !description.trim()}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging...' : 'File Damage Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
