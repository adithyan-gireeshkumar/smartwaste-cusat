import React from 'react';
import { X, MapPin, Layers, AlertTriangle, Clock, Thermometer, Droplets, QrCode, ArrowRight } from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoLocation, EcoBin, WasteType } from '../types';

interface EcoLocationModalProps {
  location: EcoLocation | null;
  onClose: () => void;
}

export const EcoLocationModal: React.FC<EcoLocationModalProps> = ({ location, onClose }) => {
  const { bins, setSelectedBin, setQrModalBin } = useEco();

  if (!location) return null;

  const locationBins = bins.filter((b) => b.locationId === location.id);
  const normalCount = locationBins.filter((b) => b.status === 'NORMAL').length;
  const warningCount = locationBins.filter((b) => b.status === 'WARNING').length;
  const urgentCount = locationBins.filter((b) => b.status === 'URGENT' || b.status === 'COLLECTION_REQUIRED').length;
  const hasWrongWaste = locationBins.some((b) => b.wrongWasteDetected);

  const getStreamMeta = (type: WasteType) => {
    switch (type) {
      case 'PLASTIC':
        return { icon: '♻️', label: 'Plastic', dot: 'bg-blue-600', text: 'text-blue-800', bg: 'bg-blue-50' };
      case 'PAPER':
        return { icon: '📄', label: 'Paper', dot: 'bg-amber-600', text: 'text-amber-800', bg: 'bg-amber-50' };
      case 'METAL':
        return { icon: '🥫', label: 'Metal', dot: 'bg-slate-600', text: 'text-slate-800', bg: 'bg-slate-100' };
      case 'FOOD':
        return { icon: '🍱', label: 'Food Waste', dot: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' };
    }
  };

  const getFillBadge = (fill: number) => {
    if (fill >= 95) return '🔴 Urgent';
    if (fill >= 75) return '🟠 Collection Req';
    if (fill >= 50) return '🟡 Warning';
    return '🟢 Normal';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#143826]/45 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#1b4332] text-white">
                {location.code}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#e2ece3] text-[#143826]">
                {location.zone}
              </span>
              {hasWrongWaste && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                  ⚠️ Contamination Alert
                </span>
              )}
            </div>
            <h2 className="text-lg font-serif font-bold text-[#143826] mt-1.5 flex items-center gap-2">
              <span>🌿 {location.name}</span>
            </h2>
            <p className="text-xs text-[#52796f] mt-0.5">{location.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#52796f] hover:text-[#143826] rounded-xl hover:bg-[#e2ece3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Location Hero Image & Summary Stats (Requirement 24) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 h-44 rounded-2xl overflow-hidden border border-[#d3e2d5] relative shadow-xs">
              <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-medium">📷 CUSAT Campus View</span>
              </div>
            </div>

            <div className="sm:col-span-7 bg-[#f2f7f1] border border-[#d3e2d5] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#143826] uppercase tracking-wider">
                Location Waste Hub Summary
              </h4>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#dbe6dc]">
                  <span className="text-[10px] text-[#52796f] block">Total Bins</span>
                  <strong className="text-base text-[#143826] font-mono font-bold">{locationBins.length}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#dbe6dc]">
                  <span className="text-[10px] text-emerald-700 block">Normal</span>
                  <strong className="text-base text-emerald-800 font-mono font-bold">{normalCount}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#dbe6dc]">
                  <span className="text-[10px] text-amber-700 block">Warning</span>
                  <strong className="text-base text-amber-800 font-mono font-bold">{warningCount}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#dbe6dc]">
                  <span className="text-[10px] text-rose-700 block">Urgent</span>
                  <strong className="text-base text-rose-800 font-mono font-bold">{urgentCount}</strong>
                </div>
              </div>

              <div className="text-[11px] text-[#52796f] space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span>Sensor Health: <strong>100% Online</strong></span>
                  <span>Collection Status: <strong>{urgentCount > 0 ? 'Assigned' : 'Normal'}</strong></span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-[#84a98c]">
                  <Clock className="w-3 h-3" />
                  <span>Last synced: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Bins Breakdown (Requirement 24 layout) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#143826] flex items-center justify-between">
              <span>Segregated Bins Deployed At This Station ({locationBins.length})</span>
              <span className="text-[11px] font-normal text-[#52796f]">Click any bin to view detailed sensors</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {locationBins.map((bin) => {
                const meta = getStreamMeta(bin.wasteType);
                return (
                  <div
                    key={bin.id}
                    onClick={() => {
                      setSelectedBin(bin);
                    }}
                    className="group bg-white p-3.5 rounded-2xl border border-[#dbe6dc] hover:border-[#1b4332] hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#143826] flex items-center gap-1.5">
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                        <span className="font-mono text-xs font-extrabold text-[#143826]">
                          {bin.fillLevel}%
                        </span>
                      </div>

                      {/* Fill Progress Bar */}
                      <div className="w-full bg-[#e2ece3] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            bin.fillLevel >= 95
                              ? 'bg-rose-600'
                              : bin.fillLevel >= 75
                              ? 'bg-amber-500'
                              : 'bg-[#2d6a4f]'
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#52796f] font-mono">
                        <span>{bin.id}</span>
                        <span>{getFillBadge(bin.fillLevel)}</span>
                      </div>

                      {bin.wrongWasteDetected && (
                        <div className="p-1.5 bg-amber-50 border border-amber-300 rounded-lg text-[10px] text-amber-900 font-semibold text-center">
                          ⚠️ Wrong Waste Detected
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#edf3ec] flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQrModalBin(bin);
                        }}
                        className="flex items-center gap-1 text-[#2d6a4f] hover:underline font-mono"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR Code</span>
                      </button>

                      <span className="text-[#1b4332] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#52796f]">
            CUSAT Kalamassery Campus · Coordinates: {location.latitude}, {location.longitude}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold"
          >
            Close Location View
          </button>
        </div>
      </div>
    </div>
  );
};
