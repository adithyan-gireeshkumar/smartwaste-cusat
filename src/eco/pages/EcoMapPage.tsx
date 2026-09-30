import React, { useState } from 'react';
import { MapPin, Layers, Info, Filter, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { EcoCampusMap } from '../components/EcoCampusMap';
import { WasteType } from '../types';

export const EcoMapPage: React.FC = () => {
  const { locations, bins, setSelectedLocation, setSelectedBin, setQrModalBin, metrics } = useEco();
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  const zones = Array.from(new Set(locations.map((l) => l.zone)));

  const filteredLocations = locations.filter((loc) => {
    if (zoneFilter === 'ALL') return true;
    return loc.zone === zoneFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              CUSAT Campus Waste Infrastructure Map
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Geospatial monitoring of all 20 smart waste hubs and {metrics.totalBins} IoT sensory bins across Kalamassery campus.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Attention (50-74%)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Collection Req (75-94%)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical (≥95% / Contaminated)
          </span>
        </div>
      </div>

      {/* Campus Map Container */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-3 sm:p-4 shadow-xs">
        <EcoCampusMap className="h-[620px] w-full rounded-2xl" />
      </div>

      {/* Quick Location Grid */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#143826] flex items-center gap-2">
              <span>📍 Campus Stations Directory</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332]">
                {filteredLocations.length} Locations
              </span>
            </h3>
            <p className="text-xs text-[#52796f]">
              Click any campus location card to inspect station waste streams, fill metrics, and environmental sensors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#52796f]" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-xs text-[#143826] focus:outline-none focus:border-[#2d6a4f]"
            >
              <option value="ALL">All Campus Zones</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredLocations.map((loc) => {
            const locBins = bins.filter((b) => b.locationId === loc.id);
            const highestFill = Math.max(...locBins.map((b) => b.fillLevel), 0);
            const hasIssue = locBins.some((b) => b.wrongWasteDetected || b.physicalCondition !== 'GOOD');

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className="p-3.5 rounded-2xl border border-[#dbe6dc] bg-[#f8faf7] hover:bg-[#edf5ec] hover:border-[#2d6a4f] transition-all cursor-pointer group shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#52796f] font-semibold">{loc.code}</span>
                    <h4 className="text-xs font-bold text-[#143826] group-hover:text-[#2d6a4f] transition-colors">
                      {loc.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      highestFill >= 95 || hasIssue
                        ? 'bg-rose-100 text-rose-800'
                        : highestFill >= 75
                        ? 'bg-orange-100 text-orange-800'
                        : highestFill >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Max {highestFill}%
                  </span>
                </div>

                <div className="text-[11px] text-[#52796f] line-clamp-1">{loc.zone}</div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#dbe6dc]/70">
                  <span className="text-[#6d9178]">{locBins.length} Streams</span>
                  <div className="flex items-center gap-1">
                    {locBins.map((b) => (
                      <span
                        key={b.id}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            b.wasteType === 'PLASTIC'
                              ? '#2563eb'
                              : b.wasteType === 'PAPER'
                              ? '#d97706'
                              : b.wasteType === 'METAL'
                              ? '#475569'
                              : '#10b981',
                        }}
                        title={`${b.wasteLabel}: ${b.fillLevel}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
