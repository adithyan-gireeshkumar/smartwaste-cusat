import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Unlock, WifiOff, Thermometer, Truck, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useEco } from '../state/EcoContext';

export const EcoSimulatorBar: React.FC = () => {
  const {
    bins,
    simulateFillLevel,
    simulateWrongWaste,
    simulateLidOpen,
    simulateOffline,
    simulateAbnormalTemp,
    drainBin,
    lastSimulationEvent
  } = useEco();

  const [expanded, setExpanded] = useState(false);
  const [targetBinId, setTargetBinId] = useState(bins[0]?.id || 'BIN-001');

  const currentBin = bins.find((b) => b.id === targetBinId) || bins[0];

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-full px-2">
      <div className="bg-[#fcfdfb]/95 backdrop-blur-md border border-[#cce0ce] rounded-2xl shadow-xl overflow-hidden text-xs">
        {/* Toggle header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 bg-[#f2f7f1] hover:bg-[#eaf3e9] flex items-center justify-between text-[#143826] font-semibold transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#1b4332] text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif">IoT Telemetry & Anomaly Simulator</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#52796f] font-mono text-[10px]">
            <span>{expanded ? 'Hide' : 'Expand'}</span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Simulator controls */}
        {expanded && (
          <div className="p-4 space-y-3 bg-white">
            {lastSimulationEvent && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 font-mono">
                {lastSimulationEvent}
              </div>
            )}

            {/* Target Bin selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#143826] block">Select Campus Bin to Test:</label>
              <select
                value={targetBinId}
                onChange={(e) => setTargetBinId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#f0f6ef] border border-[#cce0ce] rounded-xl text-xs text-[#1f2923] focus:outline-none"
              >
                {bins.slice(0, 25).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.locationName} · {b.wasteLabel} ({b.fillLevel}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => simulateWrongWaste(currentBin.id, 'Food Waste (Organic)')}
                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-left text-amber-900 transition-colors"
              >
                <div className="font-bold">⚠️ Wrong Waste</div>
                <div className="text-[10px] text-amber-700">Simulate food in plastic</div>
              </button>

              <button
                onClick={() => simulateLidOpen(currentBin.id, true)}
                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-left text-rose-900 transition-colors"
              >
                <div className="font-bold">🔓 Open Lid</div>
                <div className="text-[10px] text-rose-700">Simulate unexpected opening</div>
              </button>

              <button
                onClick={() => simulateFillLevel(currentBin.id, 96)}
                className="p-2 bg-red-50 hover:bg-red-100 border border-red-300 rounded-xl text-left text-red-900 transition-colors"
              >
                <div className="font-bold">🚨 Surge to 96%</div>
                <div className="text-[10px] text-red-700">Trigger urgent pickup</div>
              </button>

              <button
                onClick={() => drainBin(currentBin.id)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-left text-emerald-900 transition-colors"
              >
                <div className="font-bold">♻️ Collect & Reset</div>
                <div className="text-[10px] text-emerald-700">Reset to 10% fill</div>
              </button>

              <button
                onClick={() => simulateAbnormalTemp(currentBin.id, 43.5)}
                className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-xl text-left text-orange-900 transition-colors"
              >
                <div className="font-bold">🌡️ High Temp 43°C</div>
                <div className="text-[10px] text-orange-700">Simulate heat anomaly</div>
              </button>

              <button
                onClick={() => simulateOffline(currentBin.id, currentBin.isOnline)}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-left text-slate-800 transition-colors"
              >
                <div className="font-bold">{currentBin.isOnline ? '📡 Cut Sensor' : '📡 Restore Sensor'}</div>
                <div className="text-[10px] text-slate-600">Toggle offline status</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
