import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Mail,
  Send,
  ExternalLink,
  Flame,
  Droplets,
  Thermometer,
  Wrench,
  Unlock,
  WifiOff,
  Battery,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoAlert, AlertType } from '../types';

export const EcoAlertsPage: React.FC = () => {
  const { alerts, bins, markAlertRead, resolveAlert, setSelectedBin, profile } = useEco();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [selectedAlertForDispatch, setSelectedAlertForDispatch] = useState<EcoAlert | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alt) => {
    if (statusFilter === 'ACTIVE' && alt.isResolved) return false;
    if (statusFilter === 'RESOLVED' && !alt.isResolved) return false;

    if (typeFilter !== 'ALL' && alt.type !== typeFilter) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchTitle = alt.title.toLowerCase().includes(q);
      const matchBin = alt.binId.toLowerCase().includes(q);
      const matchLoc = alt.locationName.toLowerCase().includes(q);
      if (!matchTitle && !matchBin && !matchLoc) return false;
    }

    return true;
  });

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'WRONG_WASTE':
        return '⚠️';
      case 'OVERFLOW':
        return '🚨';
      case 'BIN_DAMAGED':
        return '🔧';
      case 'ABNORMAL_TEMP':
        return '🌡️';
      case 'ABNORMAL_HUMIDITY':
        return '💧';
      case 'BIN_OPENED':
        return '🔓';
      case 'SENSOR_OFFLINE':
        return '📡';
      case 'LOW_BATTERY':
        return '🔋';
      case 'COLLECTION_OVERDUE':
        return '🕐';
      default:
        return '🔔';
    }
  };

  const getSeverityBadge = (sev: 'INFO' | 'WARNING' | 'CRITICAL') => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">WARNING</span>;
      case 'INFO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">INFO</span>;
    }
  };

  // Requirement 19: WhatsApp Alert trigger
  const handleSendWhatsApp = (alt: EcoAlert) => {
    const text = encodeURIComponent(
      `🚨 *CUSAT SMARTWASTE ALERT*\n\n*Station:* ${alt.locationName}\n*Bin ID:* ${alt.binId}\n*Alert:* ${alt.title}\n*Details:* ${alt.description}\n*Severity:* ${alt.severity}\n*Time:* ${new Date(alt.timestamp).toLocaleString()}\n\n_Dispatched via SmartWaste CUSAT IoT Command Centre_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setDispatchSuccess(`WhatsApp notification template generated for ${alt.binId}`);
    setTimeout(() => setDispatchSuccess(null), 3500);
  };

  // Requirement 19: Email Alert trigger
  const handleSendEmail = (alt: EcoAlert) => {
    const subject = encodeURIComponent(`[SmartWaste Alert] ${alt.title} - ${alt.locationName} (${alt.binId})`);
    const body = encodeURIComponent(
      `Dear Sanitation Officer,\n\nA smart waste alert has been flagged on the CUSAT campus network:\n\nLocation: ${alt.locationName}\nBin ID: ${alt.binId}\nCategory: ${alt.wasteType}\nAlert: ${alt.title}\nDescription: ${alt.description}\nTimestamp: ${new Date(alt.timestamp).toLocaleString()}\n\nPlease inspect the station or assign a collector.\n\nRegards,\n${profile.adminName}\n${profile.groupProjectName}\nCUSAT Kalamassery`
    );
    window.open(`mailto:${profile.email}?subject=${subject}&body=${body}`, '_blank');
    setDispatchSuccess(`Email alert drafted for ${alt.binId}`);
    setTimeout(() => setDispatchSuccess(null), 3500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              Smart Alert & Anomaly Dispatch System
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Automated alerts for threshold breaches, wrong waste contamination, abnormal temperature, damaged bins, and offline sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#f0f6ef] border border-[#d3e2d5] p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium ${
                statusFilter === 'ACTIVE' ? 'bg-[#1b4332] text-white shadow-2xs font-semibold' : 'text-[#52796f]'
              }`}
            >
              Active ({alerts.filter((a) => !a.isResolved).length})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1 rounded-lg font-medium ${
                statusFilter === 'RESOLVED' ? 'bg-[#1b4332] text-white shadow-2xs font-semibold' : 'text-[#52796f]'
              }`}
            >
              Resolved ({alerts.filter((a) => a.isResolved).length})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium ${
                statusFilter === 'ALL' ? 'bg-[#1b4332] text-white shadow-2xs font-semibold' : 'text-[#52796f]'
              }`}
            >
              All ({alerts.length})
            </button>
          </div>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <span>✓ {dispatchSuccess}</span>
          <button onClick={() => setDispatchSuccess(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Filter Chips Bar (Requirement 11) */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#52796f] text-xs font-medium mr-1">Alert Category:</span>
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'WRONG_WASTE', label: '⚠️ Wrong Waste' },
            { id: 'OVERFLOW', label: '🚨 Overflow (≥95%)' },
            { id: 'BIN_DAMAGED', label: '🔧 Damaged Bin' },
            { id: 'ABNORMAL_TEMP', label: '🌡️ Abnormal Temp' },
            { id: 'BIN_OPENED', label: '🔓 Bin Opened' },
            { id: 'SENSOR_OFFLINE', label: '📡 Offline Sensor' },
            { id: 'LOW_BATTERY', label: '🔋 Low Battery' },
            { id: 'COLLECTION_OVERDUE', label: '🕐 Overdue' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors font-medium ${
                typeFilter === cat.id
                  ? 'bg-[#1b4332] text-white shadow-2xs font-semibold'
                  : 'bg-[#f0f6ef] text-[#2d3732] hover:bg-[#e4efe3]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#e2ece3] pt-2 text-xs">
          <input
            type="text"
            placeholder="Search by Station name or Bin ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl text-xs w-full max-w-xs focus:outline-none focus:border-[#2d6a4f]"
          />

          <span className="text-[11px] font-mono text-[#6d9178]">
            Showing <strong>{filteredAlerts.length}</strong> alerts
          </span>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-[#143826]">No matching alerts found</h3>
            <p className="text-xs text-[#52796f]">
              All CUSAT smart waste stations match selected filter criteria.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const relatedBin = bins.find((b) => b.id === alt.binId);

            return (
              <div
                key={alt.id}
                className={`bg-[#fbfdfa] border rounded-3xl p-4 sm:p-5 shadow-2xs transition-all space-y-3 ${
                  alt.isResolved
                    ? 'border-[#dbe6dc] opacity-75'
                    : alt.severity === 'CRITICAL'
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-[#cce0ce]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-[#f0f6ef] border border-[#d3e2d5]">
                      {getAlertIcon(alt.type)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#1b4332] text-white">
                          {alt.binId}
                        </span>
                        <span className="font-semibold text-xs text-[#143826]">
                          {alt.locationName}
                        </span>
                        {getSeverityBadge(alt.severity)}
                      </div>
                      <h3 className="text-sm font-bold text-[#143826] mt-0.5">{alt.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#52796f] self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5 text-[#84a98c]" />
                    <span>{new Date(alt.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-[#52796f] bg-[#f8faf7] p-3 rounded-2xl border border-[#e2ece3]">
                  {alt.description}
                </p>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e2ece3]">
                  <div className="flex items-center gap-2">
                    {/* Requirement 19: WhatsApp Alert Button */}
                    <button
                      onClick={() => handleSendWhatsApp(alt)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Send instant WhatsApp message to sanitation squad"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Alert</span>
                    </button>

                    {/* Requirement 19: Email Alert Button */}
                    <button
                      onClick={() => handleSendEmail(alt)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Send formal email report to staff"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email Alert</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {relatedBin && (
                      <button
                        onClick={() => setSelectedBin(relatedBin)}
                        className="px-3 py-1.5 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <span>Inspect Bin</span>
                        <ExternalLink className="w-3 h-3 text-[#52796f]" />
                      </button>
                    )}

                    {!alt.isResolved ? (
                      <button
                        onClick={() => resolveAlert(alt.id, 'Resolved via alerts dashboard')}
                        className="px-3 py-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b7e4c7]" />
                        <span>Resolve Alert</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-700 flex items-center gap-1">
                        ✓ Resolved ({alt.resolvedBy || 'Officer'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
