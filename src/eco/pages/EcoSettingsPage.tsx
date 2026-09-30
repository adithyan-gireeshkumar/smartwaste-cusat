import React, { useState } from 'react';
import {
  Settings,
  User,
  Share2,
  MessageSquare,
  Mail,
  Instagram,
  Bell,
  Cpu,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  Save,
  Globe
} from 'lucide-react';
import { useEco } from '../state/EcoContext';

export const EcoSettingsPage: React.FC = () => {
  const { profile, updateAdminProfile, setProfileModalOpen, alerts } = useEco();

  // Profile fields
  const [adminName, setAdminName] = useState(profile.adminName);
  const [groupProjectName, setGroupProjectName] = useState(profile.groupProjectName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [profileImage, setProfileImage] = useState(profile.profileImage);
  const [institution, setInstitution] = useState(profile.institution);

  // Social / Communication links (Requirement 19)
  const [whatsappRecipient, setWhatsappRecipient] = useState('+91 98470 11001');
  const [instagramHandle, setInstagramHandle] = useState('@smartwaste.cusat');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/cusat_official');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);

  // Thresholds
  const [warningThreshold, setWarningThreshold] = useState(50);
  const [collectionRequiredThreshold, setCollectionRequiredThreshold] = useState(75);
  const [urgentThreshold, setUrgentThreshold] = useState(95);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      adminName,
      groupProjectName,
      email,
      phone,
      profileImage,
      institution,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Requirement 19: Send WhatsApp Alert trigger
  const handleTestWhatsApp = () => {
    const text = encodeURIComponent(
      `🌿 *SmartWaste CUSAT Official Dispatch*\n\nHello Team, this is a test alert from ${groupProjectName} (${institution}).\nAdmin: ${adminName}\nSystem Status: 🟢 Online (76 Active Nodes)\n\nKeep CUSAT Green!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Requirement 19: Send Email Alert trigger
  const handleTestEmail = () => {
    const subject = encodeURIComponent(`[SmartWaste CUSAT] System Alert Notification`);
    const body = encodeURIComponent(
      `Dear Campus Sanitation Squad,\n\nThis is an automated dispatch from ${groupProjectName} at ${institution}.\n\nLead Officer: ${adminName}\nEmail: ${email}\nPhone: ${phone}\n\nAll stations are reporting live telemetry on the campus IoT network.\n\nSmartWaste CUSAT System`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Requirement 19: Instagram link
  const handleOpenInstagram = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              System Configuration & Communication Channels
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Admin credentials, project identity, WhatsApp/Email alerts, Instagram social integration, and IoT sensor thresholds.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Configuration saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Profile & Project Name (Requirement 3) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#e2ece3] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#1b4332] text-white flex items-center justify-center">
                  <User className="w-5 h-5 text-[#b7e4c7]" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#143826]">
                    Admin Profile & Project Identity
                  </h3>
                  <p className="text-xs text-[#52796f]">
                    Requirement 3: Editable admin title, team presentation group name, and avatar
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-bold">
                Customizable
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f4f8f3] border border-[#d3e2d5]">
                <img
                  src={profileImage}
                  alt={adminName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#b7e4c7] shadow-xs"
                />
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-[#143826] text-sm block">{adminName}</span>
                  <span className="text-[11px] text-[#2d6a4f] font-mono block">{groupProjectName}</span>
                  <span className="text-[10px] text-[#52796f] block">{institution}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#143826] font-medium mb-1">
                    Admin Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-[#143826] font-medium mb-1">
                    Group / Project Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={groupProjectName}
                    onChange={(e) => setGroupProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#143826] font-medium mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>

                <div>
                  <label className="block text-[#143826] font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#143826] font-medium mb-1">Institution / Campus</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div>
                <label className="block text-[#143826] font-medium mb-1">Profile Avatar Image URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-2xl font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile & Project Name</span>
                </button>
              </div>
            </form>
          </div>

          {/* Fill Level Sensor Thresholds (Requirement 11) */}
          <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-[#e2ece3] pb-3">
              <Cpu className="w-4 h-4 text-[#2d6a4f]" />
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                IoT Sensor Threshold Standards
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#f4f8f3] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-800">Normal Range (0 – 49%)</span>
                  <p className="text-[11px] text-[#52796f]">Standard nominal level, no dispatch needed.</p>
                </div>
                <span className="font-mono font-bold text-emerald-700">🟢 Normal</span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-900">Warning Range (50 – 74%)</span>
                  <p className="text-[11px] text-amber-700">Getting full; placed on monitoring queue.</p>
                </div>
                <span className="font-mono font-bold text-amber-700">🟠 Getting Full</span>
              </div>

              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-orange-900">Collection Required (75 – 94%)</span>
                  <p className="text-[11px] text-orange-700">Automatically creates collection dispatch task.</p>
                </div>
                <span className="font-mono font-bold text-orange-700">🔴 Collection Req</span>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-rose-900">Urgent Critical (95 – 100%)</span>
                  <p className="text-[11px] text-rose-700">Audible alarm, WhatsApp + Email emergency dispatch.</p>
                </div>
                <span className="font-mono font-bold text-rose-700">🚨 Urgent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Communication / Connect (Requirement 19) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="border-b border-[#e2ece3] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#2d6a4f]" />
                <h3 className="text-sm font-serif font-bold text-[#143826]">
                  Connect & Communication Section
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-bold">
                Req. 19
              </span>
            </div>

            <p className="text-xs text-[#52796f]">
              Direct communication channels for urgent bin alarms, campus supervisor email dispatches, and public awareness social media.
            </p>

            {/* 1. WhatsApp Alert (Requirement 19) */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Broadcast</span>
              </div>

              <p className="text-[11px] text-emerald-800">
                Direct WhatsApp alert generation for urgent bin overfills, wrong-waste contamination, and broken locks.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                  Recipient Sanitation Number
                </label>
                <input
                  type="text"
                  value={whatsappRecipient}
                  onChange={(e) => setWhatsappRecipient(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs text-[#143826]"
                />
              </div>

              <button
                onClick={handleTestWhatsApp}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp Alert</span>
              </button>
            </div>

            {/* 2. Email Alert (Requirement 19) */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Email Notifications</span>
              </div>

              <p className="text-[11px] text-blue-800">
                Send formal email alert templates to campus authorities and maintenance engineers.
              </p>

              <button
                onClick={handleTestEmail}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email Alert</span>
              </button>
            </div>

            {/* 3. Instagram Social Media (Requirement 19) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-pink-200 space-y-3">
              <div className="flex items-center gap-2 text-pink-900 font-bold text-xs">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram / Social Media</span>
              </div>

              <p className="text-[11px] text-pink-800">
                Official CUSAT SmartWaste social page link for campus green drives and student awareness campaigns.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-pink-900 mb-1">
                  Social Handle
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-pink-200 rounded-xl text-xs text-[#143826]"
                />
              </div>

              <button
                onClick={handleOpenInstagram}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Open Project Instagram Page</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
