import React, { useState } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle2, Camera, MapPin, QrCode } from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoBin } from '../types';

interface EcoCitizenFeedbackModalProps {
  bin: EcoBin | null;
  onClose: () => void;
}

export const EcoCitizenFeedbackModal: React.FC<EcoCitizenFeedbackModalProps> = ({ bin, onClose }) => {
  const { submitFeedback } = useEco();

  const [rating, setRating] = useState<number>(4);
  const [complaintType, setComplaintType] = useState<any>('OVERFLOW');
  const [comment, setComment] = useState<string>('');
  const [citizenName, setCitizenName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!bin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const id = submitFeedback({
      binId: bin.id,
      locationName: bin.locationName,
      wasteType: bin.wasteType,
      rating,
      complaintType,
      comment: comment.trim(),
      citizenName: citizenName.trim() || 'Campus Student / Visitor',
      contact: contact.trim() || 'N/A',
      photoUrl: hasPhoto ? '/src/assets/images/smart_waste_bin_1790757905872.jpg' : undefined,
    });

    setSubmittedId(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header - Styled like a public citizen mobile portal */}
        <div className="px-6 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-white flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#b7e4c7]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">Public Campus Citizen Feedback</h3>
              <p className="text-[11px] text-[#52796f]">
                Scanned via Smart Bin QR Code #{bin.id} · {bin.locationName}
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

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-serif font-bold text-[#143826]">Complaint Logged Successfully!</h4>
              <p className="text-xs font-mono text-[#2d6a4f] font-semibold">Reference Ticket ID: #{submittedId}</p>
              <p className="text-xs text-[#52796f] max-w-sm mx-auto pt-1">
                Thank you for contributing to a clean CUSAT campus. Your report has been dispatched to campus operations and will be resolved promptly.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Target Bin Context */}
            <div className="p-3 bg-[#f2f7f1] rounded-2xl border border-[#dbe6dc] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52796f] font-mono block">REPORTING BIN</span>
                <span className="font-bold text-[#143826] text-xs">
                  {bin.locationName} · {bin.wasteLabel} ({bin.id})
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-[#cce0ce]">
                {bin.fillLevel}% Fill
              </span>
            </div>

            {/* Cleanliness Rating (Requirement 16) */}
            <div className="space-y-1.5">
              <label className="block text-[#143826] font-semibold">Station Cleanliness Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                  >
                    <span className={star <= rating ? 'text-amber-500' : 'text-slate-300'}>★</span>
                  </button>
                ))}
                <span className="text-xs text-[#52796f] ml-2 font-medium">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Needs Attention' : 'Critical Issue'}
                </span>
              </div>
            </div>

            {/* Complaint Type */}
            <div className="space-y-1.5">
              <label className="block text-[#143826] font-semibold">What issue did you observe?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'OVERFLOW', label: 'Overflowing' },
                  { id: 'WRONG_WASTE', label: 'Wrong Waste' },
                  { id: 'DAMAGED_BIN', label: 'Damaged Receptacle' },
                  { id: 'ODOR_HYGIENE', label: 'Odor / Flies' },
                  { id: 'LOCATION_ISSUE', label: 'Sidewalk Litter' },
                  { id: 'OTHER', label: 'Other Observation' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setComplaintType(item.id)}
                    className={`p-2 rounded-xl border text-left font-medium transition-all ${
                      complaintType === item.id
                        ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                        : 'bg-white text-[#2d3732] border-[#d3e2d5] hover:border-[#1b4332]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="block text-[#143826] font-semibold">Describe the problem</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Bin lid is stuck open and cups are scattered on the sidewalk near the library entrance."
                className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332]"
              />
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#143826] font-medium mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Student / Visitor"
                  className="w-full px-3 py-1.5 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-[#143826] font-medium mb-1">Phone / Email (Optional)</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="For status updates"
                  className="w-full px-3 py-1.5 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332]"
                />
              </div>
            </div>

            {/* Simulated Photo Upload */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`w-full p-2.5 rounded-xl border border-dashed text-center flex items-center justify-center gap-2 transition-colors ${
                  hasPhoto
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-[#f4f7f2] border-[#cce0ce] text-[#52796f] hover:bg-[#eef5ed]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{hasPhoto ? '✓ Photo Attached (Simulated CUSAT Bin Photo)' : 'Attach Photo of Overflow/Damage'}</span>
              </button>
            </div>

            {/* Submit */}
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
                className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Grievance</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
