import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, Image, Check, Sparkles } from 'lucide-react';
import { useEco } from '../state/EcoContext';

export const EcoProfileModal: React.FC = () => {
  const { profile, updateAdminProfile, profileModalOpen, setProfileModalOpen } = useEco();

  const [adminName, setAdminName] = useState(profile.adminName);
  const [groupProjectName, setGroupProjectName] = useState(profile.groupProjectName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [profileImage, setProfileImage] = useState(profile.profileImage);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profileModalOpen) {
      setAdminName(profile.adminName);
      setGroupProjectName(profile.groupProjectName);
      setEmail(profile.email);
      setPhone(profile.phone);
      setProfileImage(profile.profileImage);
      setSavedSuccess(false);
    }
  }, [profileModalOpen, profile]);

  if (!profileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      adminName: adminName.trim() || 'Admin Officer',
      groupProjectName: groupProjectName.trim() || 'SmartWaste CUSAT',
      email: email.trim(),
      phone: phone.trim(),
      profileImage: profileImage.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setProfileModalOpen(false);
    }, 900);
  };

  const AVATAR_PRESETS = [
    { label: 'Dr. Suresh', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
    { label: 'Anjali M.', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80' },
    { label: 'Rajeev N.', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
    { label: 'Campus Officer', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#143826]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332] text-white flex items-center justify-center">
              <User className="w-4 h-4 text-[#b7e4c7]" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">Edit Admin Profile & Group</h3>
              <p className="text-[11px] text-[#52796f]">Customize leadership name and presentation group name</p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-1.5 text-[#52796f] hover:text-[#143826] rounded-lg hover:bg-[#e2ece3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-2 text-xs font-medium">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Profile & Project Name updated successfully!</span>
            </div>
          )}

          {/* Avatar Selector Preview */}
          <div className="flex items-center gap-4 p-3 bg-[#f2f7f1] rounded-2xl border border-[#dbe6dc]">
            <img
              src={profileImage}
              alt={adminName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#2d6a4f]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = AVATAR_PRESETS[0].url;
              }}
            />
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#143826] block">Choose Avatar Preset:</span>
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileImage(p.url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                      profileImage === p.url ? 'border-[#1b4332] scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group / Project Name (Requirement 3: "The user must be able to change the group/project name") */}
          <div className="space-y-1">
            <label className="block text-[#143826] font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Group / Project Name</span>
            </label>
            <input
              type="text"
              required
              value={groupProjectName}
              onChange={(e) => setGroupProjectName(e.target.value)}
              placeholder="e.g. Team EcoSort CUSAT · Batch 2026"
              className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]"
            />
            <p className="text-[10px] text-[#6d9178]">
              Displayed across project presentation header, sidebar, reports, and citizen portal.
            </p>
          </div>

          {/* Admin Name */}
          <div className="space-y-1">
            <label className="block text-[#143826] font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Administrator Name</span>
            </label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="e.g. Dr. Suresh Kumar"
              className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[#143826] font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Official CUSAT Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="suresh.campus@cusat.ac.in"
              className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-[#143826] font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Contact Phone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98470 11001"
              className="w-full px-3 py-2 bg-white border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2ece3]">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="px-4 py-2 bg-[#f0f6ef] hover:bg-[#e4ede3] text-[#2d3732] rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
