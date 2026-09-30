import React, { useState } from 'react';
import {
  X,
  Thermometer,
  Droplets,
  Battery,
  Wifi,
  WifiOff,
  AlertTriangle,
  QrCode,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  MessageSquare,
  Lock,
  Unlock,
  Flame,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoBin, WasteType } from '../types';

interface EcoBinModalProps {
  bin: EcoBin | null;
  onClose: () => void;
}

export const EcoBinModal: React.FC<EcoBinModalProps> = ({ bin, onClose }) => {
  const {
    setQrModalBin,
    setDamageModalBin,
    setFeedbackModalBin,
    markAsCollected,
    simulateFillLevel,
    simulateWrongWaste,
    clearWrongWaste,
    simulateLidOpen,
    closeLid,
    simulateOffline
  } = useEco();

  const [simSlider, setSimSlider] = useState<number>(bin ? bin.fillLevel : 50);

  if (!bin) return null;

  const getStreamMeta = (type: WasteType) => {
    switch (type) {
      case 'PLASTIC':
        return {
          icon: '♻️',
          label: 'Plastic Waste',
          themeColor: '#1d3557',
          bgColor: '#e8f0fe',
          barColor: 'bg-blue-600',
        };
      case 'PAPER':
        return {
          icon: '📄',
          label: 'Paper Waste',
          themeColor: '#7f5539',
          bgColor: '#fdf0d5',
          barColor: 'bg-amber-600',
        };
      case 'METAL':
        return {
          icon: '🥫',
          label: 'Metal Waste',
          themeColor: '#495057',
          bgColor: '#e9ecef',
          barColor: 'bg-slate-600',
        };
      case 'FOOD':
        return {
          icon: '🍱',
          label: 'Food / Organic',
          themeColor: '#2d6a4f',
          bgColor: '#d8f3dc',
          barColor: 'bg-emerald-600',
        };
    }
  };

  const meta = getStreamMeta(bin.wasteType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#143826]/45 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#fcfdfb] border border-[#cce0ce] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#1b4332] text-white">
                {bin.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#e2ece3] text-[#143826] flex items-center gap-1">
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                  bin.isOnline
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                ● {bin.isOnline ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <h2 className="text-base font-serif font-bold text-[#143826] mt-1.5 flex items-center gap-1.5">
              <span>{bin.name}</span>
            </h2>
            <div className="text-[11px] text-[#52796f] flex items-center gap-2 mt-0.5">
              <span>{bin.locationName}</span>
              <span>·</span>
              <span className="font-mono">
                Last updated: {new Date(bin.lastUpdated).toLocaleDateString()} at{' '}
                {new Date(bin.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#52796f] hover:text-[#143826] rounded-xl hover:bg-[#e2ece3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Wrong Waste Alert Banner (Requirement 12) */}
          {bin.wrongWasteDetected && bin.wrongWasteDetail && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>⚠️ Wrong Waste Detected!</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
                  {bin.wrongWasteDetail.confidencePct}% AI Match
                </span>
              </div>
              <div className="text-xs space-y-0.5">
                <div>
                  Expected: <strong>{bin.wrongWasteDetail.expected}</strong> · Detected:{' '}
                  <strong className="text-rose-700">{bin.wrongWasteDetail.detected}</strong>
                </div>
                <p className="text-[11px] text-amber-800">
                  Improper waste deposit recorded. Contamination alert active until sorted or collected.
                </p>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => clearWrongWaste(bin.id)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Mark Sorted / Cleared
                </button>
              </div>
            </div>
          )}

          {/* Unexpected Opening Alert Banner (Requirement 13) */}
          {bin.unexpectedOpening && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-rose-600" />
                <span>
                  <strong>🚨 Bin opened unexpectedly!</strong> Lid open outside standard schedule.
                </span>
              </div>
              <button
                onClick={() => closeLid(bin.id)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Lid
              </button>
            </div>
          )}

          {/* Dual Visual Images (Requirement 9: Campus Image + Bin Image) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#143826] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#2d6a4f]" />
                <span>Campus Location</span>
              </span>
              <div className="h-32 rounded-2xl overflow-hidden border border-[#d3e2d5] relative bg-slate-100">
                <img
                  src={bin.locationImage}
                  alt={bin.locationName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs">
                  {bin.locationName}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#143826] flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#2d6a4f]" />
                <span>Smart {bin.wasteLabel} Receptacle</span>
              </span>
              <div className="h-32 rounded-2xl overflow-hidden border border-[#d3e2d5] relative bg-slate-100">
                <img src={bin.binImage} alt={bin.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono">
                  {bin.capacityLiters} Liters
                </span>
              </div>
            </div>
          </div>

          {/* Fill Gauge Card */}
          <div className="p-4 bg-[#f4f8f3] border border-[#d3e2d5] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#143826]">Current Fill Capacity</span>
                <div className="text-[11px] text-[#52796f]">
                  Ultrasonic multi-zone depth measurement
                </div>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-[#143826] tabular-nums">
                  {bin.fillLevel}%
                </span>
              </div>
            </div>

            <div className="w-full bg-[#dbe6dc] rounded-full h-3 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bin.fillLevel >= 95
                    ? 'bg-rose-600'
                    : bin.fillLevel >= 75
                    ? 'bg-amber-500'
                    : 'bg-[#2d6a4f]'
                }`}
                style={{ width: `${bin.fillLevel}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#52796f] font-mono">
              <span>{Math.round((bin.fillLevel / 100) * bin.capacityLiters)}L Occupied</span>
              <span>Total Capacity: {bin.capacityLiters}L</span>
            </div>
          </div>

          {/* Sensor & Telemetry Metrics Grid (Requirement 8 & 15) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* Temperature */}
            <div className="p-3 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#52796f] text-[10px] font-medium">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Temperature</span>
              </div>
              <div className="font-mono font-bold text-[#143826] text-sm tabular-nums">
                {bin.temperatureC}°C
              </div>
              <span className="text-[10px] text-[#2d6a4f] font-semibold">
                {bin.thermalCondition === 'HEAT_WARNING' ? '⚠️ Elevated' : 'Normal'}
              </span>
            </div>

            {/* Humidity */}
            <div className="p-3 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#52796f] text-[10px] font-medium">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Humidity</span>
              </div>
              <div className="font-mono font-bold text-[#143826] text-sm tabular-nums">
                {bin.humidityPct}%
              </div>
              <span className="text-[10px] text-[#52796f]">Atmospheric</span>
            </div>

            {/* Lid Security */}
            <div className="p-3 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[#52796f] text-[10px] font-medium">
                <span className="flex items-center gap-1">
                  {bin.isOpen ? <Unlock className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3 text-[#2d6a4f]" />}
                  <span>Lid State</span>
                </span>
              </div>
              <div className="font-mono font-bold text-[#143826] text-sm">
                {bin.isOpen ? 'OPEN' : 'CLOSED'}
              </div>
              <span className="text-[10px] text-[#52796f]">
                {bin.unexpectedOpening ? '⚠️ Unexpected' : 'Sealed'}
              </span>
            </div>

            {/* Battery / Solar */}
            <div className="p-3 bg-[#f0f6ef] border border-[#d3e2d5] rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#52796f] text-[10px] font-medium">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                <span>Battery</span>
              </div>
              <div className="font-mono font-bold text-[#143826] text-sm tabular-nums">
                {bin.batteryLevel}%
              </div>
              <span className="text-[10px] text-[#2d6a4f]">Solar Assisted</span>
            </div>
          </div>

          {/* Condition & Maintenance Status (Requirement 14) */}
          <div className="p-3.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-[#52796f]">Chassis Physical Condition:</div>
              <div className="text-xs font-bold text-[#143826] flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    bin.physicalCondition === 'GOOD'
                      ? 'bg-emerald-500'
                      : bin.physicalCondition === 'BROKEN'
                      ? 'bg-rose-600 animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
                <span>{bin.physicalCondition.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDamageModalBin(bin)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Report Damage</span>
              </button>

              <button
                onClick={() => setFeedbackModalBin(bin)}
                className="px-3 py-1.5 bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#1b4332] border border-[#b7e4c7] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Citizen Report</span>
              </button>
            </div>
          </div>

          {/* QR Code Decal Trigger Button (Requirement 16) */}
          <div className="p-4 bg-white border border-[#cce0ce] rounded-2xl flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f3ea] border border-[#b7e4c7] flex items-center justify-center text-[#1b4332]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#143826]">Smart Bin QR Decal</h4>
                <p className="text-[11px] text-[#52796f]">
                  Public QR code for campus students & faculty feedback reporting
                </p>
              </div>
            </div>

            <button
              onClick={() => setQrModalBin(bin)}
              className="px-3.5 py-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              View / Print QR
            </button>
          </div>

          {/* Quick IoT Simulation Console */}
          <div className="p-4 bg-[#f0f6ef] border border-[#d3e2d5] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#143826] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>Interactive Hardware Simulation</span>
              </span>
              <span className="text-[10px] font-mono text-[#52796f]">CUSAT Test Harness</span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#52796f]">Adjust Fill Level:</span>
                <span className="font-mono font-bold text-[#143826]">{simSlider}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simSlider}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimSlider(val);
                  simulateFillLevel(bin.id, val);
                }}
                className="w-full accent-[#1b4332] h-2 bg-[#dbe6dc] rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Simulation Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() =>
                  bin.wrongWasteDetected
                    ? clearWrongWaste(bin.id)
                    : simulateWrongWaste(bin.id, 'Food Waste (Organic)')
                }
                className="p-2 bg-white hover:bg-[#e4ede3] border border-[#cce0ce] rounded-xl text-[11px] font-medium text-[#143826] transition-colors"
              >
                {bin.wrongWasteDetected ? 'Clear Mismatch' : 'Simulate Mismatch'}
              </button>

              <button
                onClick={() => (bin.isOpen ? closeLid(bin.id) : simulateLidOpen(bin.id, true))}
                className="p-2 bg-white hover:bg-[#e4ede3] border border-[#cce0ce] rounded-xl text-[11px] font-medium text-[#143826] transition-colors"
              >
                {bin.isOpen ? 'Secure Lid' : 'Simulate Open'}
              </button>

              <button
                onClick={() => simulateOffline(bin.id, bin.isOnline)}
                className="p-2 bg-white hover:bg-[#e4ede3] border border-[#cce0ce] rounded-xl text-[11px] font-medium text-[#143826] transition-colors"
              >
                {bin.isOnline ? 'Go Offline' : 'Go Online'}
              </button>

              <button
                onClick={() => markAsCollected(bin.id, 10)}
                className="p-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-[11px] font-semibold transition-colors shadow-xs"
              >
                Empty / Collect
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#e2ece3] bg-[#f4f8f3] flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-[#52796f]">
            GPS: {bin.latitude}, {bin.longitude}
          </div>

          <button
            onClick={() => {
              markAsCollected(bin.id, 10);
              onClose();
            }}
            className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Mark Collected & Reset Fill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
