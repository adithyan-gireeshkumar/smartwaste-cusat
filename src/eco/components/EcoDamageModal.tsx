import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Send } from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoBin, PhysicalCondition } from '../types';

interface EcoDamageModalProps {
  bin: EcoBin | null;
  onClose: () => void;
}

export const EcoDamageModal: React.FC<EcoDamageModalProps> = ({ bin, onClose }) => {
  const { reportDamage } = useEco();

  const [condition, setCondition] = useState<PhysicalCondition>('MINOR_DAMAGE');
  const [description, setDescription] = useState('');

  if (!bin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportDamage(bin.id, condition, description.trim() || undefined);
    onClose();
  };

  const damageOptions: Array<{ type: PhysicalCondition; label: string; desc: string }> = [
    { type: 'GOOD', label: 'Good (Nominal)', desc: 'Chassis, wheels, and sensors in good working order' },
    { type: 'MINOR_DAMAGE', label: 'Minor Damage', desc: 'Dent on casing, hinge loose, or light scratches' },
    { type: 'MAJOR_DAMAGE', label: 'Major Damage', desc: 'Crack on receptacle, broken wheel, or compaction jam' },
    { type: 'BROKEN', label: 'Broken / Unusable', desc: 'Structural failure, fire/heat damage, or severe hazard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">Report Bin Physical Damage</h3>
              <p className="text-[11px] text-[#52796f]">
                {bin.locationName} · {bin.wasteLabel} ({bin.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#52796f] hover:text-[#143826] rounded-lg hover:bg-[#e2ece3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[#143826] font-semibold">Select Condition Level</label>
            <div className="space-y-2">
              {damageOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setCondition(opt.type)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    condition === opt.type
                      ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs'
                      : 'bg-white border-[#d3e2d5] text-[#2d3732] hover:border-[#143826]'
                  }`}
                >
                  <div className="font-semibold text-xs">{opt.label}</div>
                  <div className="text-[11px] text-[#52796f] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[#143826] font-semibold">Inspection Notes / Problem Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Right caster wheel fractured during storm. Bin tipping sideways."
              className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#e2ece3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f6ef] text-[#2d3732] rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
