import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  Trash2,
  MapPin,
  Star,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useEco } from '../state/EcoContext';
import { WasteType } from '../types';

export const EcoAnalyticsPage: React.FC = () => {
  const { bins, locations, alerts, feedback, collections } = useEco();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'SEMESTER'>('7D');

  // 1. Average Fill Level by Category
  const categoryStats = (['PLASTIC', 'PAPER', 'METAL', 'FOOD'] as WasteType[]).map((type) => {
    const catBins = bins.filter((b) => b.wasteType === type);
    const avgFill = Math.round(
      catBins.reduce((acc, curr) => acc + curr.fillLevel, 0) / (catBins.length || 1)
    );
    const label =
      type === 'PLASTIC'
        ? 'Plastic'
        : type === 'PAPER'
        ? 'Paper'
        : type === 'METAL'
        ? 'Metal'
        : 'Food / Organic';
    const color =
      type === 'PLASTIC'
        ? '#2563eb'
        : type === 'PAPER'
        ? '#d97706'
        : type === 'METAL'
        ? '#64748b'
        : '#10b981';
    return { type, label, count: catBins.length, avgFill, color };
  });

  const overallAvgFill = Math.round(
    bins.reduce((acc, curr) => acc + curr.fillLevel, 0) / (bins.length || 1)
  );

  // 2. Waste Category Distribution in Kg / Liters
  const totalLiters = bins.reduce((acc, b) => acc + b.capacityLiters, 0);
  const totalFilledLiters = bins.reduce((acc, b) => acc + Math.round((b.fillLevel / 100) * b.capacityLiters), 0);

  // 3. Daily Collection Count (Mon - Sun)
  const dailyCollections = [
    { day: 'Mon', count: 18, weightKg: 420 },
    { day: 'Tue', count: 24, weightKg: 510 },
    { day: 'Wed', count: 22, weightKg: 480 },
    { day: 'Thu', count: 29, weightKg: 640 },
    { day: 'Fri', count: 35, weightKg: 780 },
    { day: 'Sat', count: 14, weightKg: 310 },
    { day: 'Sun', count: 9, weightKg: 195 },
  ];
  const maxDayCount = Math.max(...dailyCollections.map((d) => d.count));

  // 4. Location-wise Waste Level (Top 7 highest fill stations)
  const locationFillRank = locations
    .map((loc) => {
      const locBins = bins.filter((b) => b.locationId === loc.id);
      const avg = Math.round(
        locBins.reduce((acc, curr) => acc + curr.fillLevel, 0) / (locBins.length || 1)
      );
      const criticalCount = locBins.filter((b) => b.fillLevel >= 75).length;
      return { id: loc.id, name: loc.name, code: loc.code, avg, criticalCount };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 7);

  // 5. Alert Frequency Breakdown
  const alertFrequencyMap: Record<string, number> = {};
  alerts.forEach((alt) => {
    alertFrequencyMap[alt.type] = (alertFrequencyMap[alt.type] || 0) + 1;
  });

  const alertTypesOrdered = [
    { key: 'WRONG_WASTE', label: 'Wrong Waste Mismatch', color: '#d97706' },
    { key: 'OVERFLOW', label: 'Threshold Overflow (≥95%)', color: '#e11d48' },
    { key: 'BIN_OPENED', label: 'Unexpected Bin Open', color: '#f97316' },
    { key: 'BIN_DAMAGED', label: 'Physical Damage Report', color: '#64748b' },
    { key: 'ABNORMAL_TEMP', label: 'Abnormal Temperature', color: '#ea580c' },
    { key: 'SENSOR_OFFLINE', label: 'Sensor Offline / Timeout', color: '#475569' },
  ];

  // 6. Citizen Feedback Ratings Breakdown (5 to 1 Stars)
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = feedback.filter((f) => f.rating === stars).length;
    return { stars, count };
  });
  const totalFeedbackCount = feedback.length || 1;
  const avgRating = (
    feedback.reduce((acc, f) => acc + f.rating, 0) / totalFeedbackCount
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              Campus Waste Telemetry & IoT Analytics
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Holistic trends on segregation compliance, daily collection tonnage, station congestion, and citizen satisfaction ratings.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex bg-[#f0f6ef] border border-[#d3e2d5] p-0.5 rounded-xl text-xs">
          {(['7D', '30D', 'SEMESTER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeRange === r ? 'bg-[#1b4332] text-white shadow-2xs font-semibold' : 'text-[#52796f] hover:text-[#143826]'
              }`}
            >
              {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : 'Current Semester'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-[#52796f] font-medium">Campus Avg Fill Level</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#143826]">{overallAvgFill}%</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center">
              ↓ 4.2% vs last week
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#e8efe7] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#1b4332] rounded-full" style={{ width: `${overallAvgFill}%` }} />
          </div>
        </div>

        <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-[#52796f] font-medium">Total Daily Waste Recovered</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#143826]">3,325 kg</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">149 collections</span>
          </div>
          <span className="text-[10px] text-[#6d9178] block">Across 20 university hubs</span>
        </div>

        <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-[#52796f] font-medium">Citizen Cleanliness Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#143826] flex items-center gap-1">
              <span>{avgRating}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </span>
            <span className="text-[11px] text-[#52796f]">({feedback.length} QR reviews)</span>
          </div>
          <span className="text-[10px] text-[#6d9178] block">92% satisfaction rate</span>
        </div>

        <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-4 shadow-2xs space-y-1">
          <span className="text-xs text-[#52796f] font-medium">Segregation Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#143826]">96.8%</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">Only 3 mismatches</span>
          </div>
          <span className="text-[10px] text-[#6d9178] block">Zero hazardous cross-flow</span>
        </div>
      </div>

      {/* Row 1: Chart 1 (Average Fill by Category) & Chart 2 (Waste Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Average Fill Level by Category */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                1. Average Bin Fill Level by Category
              </h3>
              <p className="text-xs text-[#52796f]">Real-time fill comparison across the 4 waste streams</p>
            </div>
            <span className="text-xs font-mono text-[#1b4332] bg-[#d8f3dc] px-2 py-0.5 rounded-full font-bold">
              4 Streams
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((cat) => (
              <div key={cat.type} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#143826]">{cat.label} ({cat.count} bins)</span>
                  <span className="font-mono font-bold text-[#143826]">{cat.avgFill}%</span>
                </div>
                <div className="h-3 w-full bg-[#e8efe7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.avgFill}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#f2f7f1] rounded-2xl text-[11px] text-[#52796f] flex items-center justify-between">
            <span>Peak capacity stream: <strong>Metal & Plastic</strong></span>
            <span className="font-mono text-[#1b4332]">Target: &lt; 70% threshold</span>
          </div>
        </div>

        {/* Chart 2: Waste Category Distribution */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                2. Campus Waste Category Distribution
              </h3>
              <p className="text-xs text-[#52796f]">Segregated volume composition across CUSAT</p>
            </div>
            <span className="text-xs font-mono text-[#52796f]">{totalFilledLiters} / {totalLiters} L</span>
          </div>

          {/* Stacked bar representation */}
          <div className="h-6 w-full rounded-2xl overflow-hidden flex shadow-inner">
            <div style={{ width: '38%' }} className="bg-blue-600 h-full" title="Plastic: 38%" />
            <div style={{ width: '26%' }} className="bg-amber-600 h-full" title="Paper: 26%" />
            <div style={{ width: '18%' }} className="bg-slate-600 h-full" title="Metal: 18%" />
            <div style={{ width: '18%' }} className="bg-emerald-600 h-full" title="Food: 18%" />
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>♻️ Plastic Waste</span>
              </div>
              <div className="text-[11px] text-blue-700 font-mono mt-0.5">38% · ~1,260 kg/day</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span>📄 Paper Waste</span>
              </div>
              <div className="text-[11px] text-amber-700 font-mono mt-0.5">26% · ~860 kg/day</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                <span>🥫 Metal Waste</span>
              </div>
              <div className="text-[11px] text-slate-700 font-mono mt-0.5">18% · ~600 kg/day</div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>🍱 Organic / Food</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-mono mt-0.5">18% · ~605 kg/day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Chart 3 (Daily Collection Count) & Chart 4 (Location-wise Waste Level) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 3: Daily Collection Count (Mon - Sun) */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                3. Daily Waste Collection Dispatch Count
              </h3>
              <p className="text-xs text-[#52796f]">Completed pickup runs over the past 7 days</p>
            </div>
            <Calendar className="w-4 h-4 text-[#2d6a4f]" />
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-[#e2ece3]">
            {dailyCollections.map((item) => {
              const heightPct = Math.round((item.count / maxDayCount) * 100);
              const isPeak = item.count === maxDayCount;

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-[#143826] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isPeak ? 'bg-[#1b4332]' : 'bg-[#52796f]/70 hover:bg-[#2d6a4f]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${item.day}: ${item.count} dispatches (${item.weightKg} kg)`}
                  />
                  <span className="text-[11px] font-mono text-[#52796f] mt-1">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[#52796f]">
            <span>Peak day: <strong>Friday (35 collections)</strong></span>
            <span>Total weekly collections: <strong>149</strong></span>
          </div>
        </div>

        {/* Chart 4: Location-wise Waste Level */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                4. Location-Wise Waste Congestion Rank
              </h3>
              <p className="text-xs text-[#52796f]">Top campus locations sorted by average fill percentage</p>
            </div>
            <MapPin className="w-4 h-4 text-[#2d6a4f]" />
          </div>

          <div className="space-y-2.5">
            {locationFillRank.map((loc, idx) => (
              <div key={loc.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-[#84a98c] w-4">#{idx + 1}</span>
                  <span className="font-bold text-[#143826] truncate">{loc.name}</span>
                </div>

                <div className="flex items-center gap-2 w-48">
                  <div className="flex-1 h-2 bg-[#e8efe7] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loc.avg >= 75 ? 'bg-orange-500' : loc.avg >= 50 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${loc.avg}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[#143826] w-9 text-right">{loc.avg}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Chart 5 (Alert Frequency) & Chart 6 (Citizen Feedback Ratings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 5: Alert Frequency */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#143826]">
              5. Alert Frequency Breakdown
            </h3>
            <p className="text-xs text-[#52796f]">Incidents logged across the campus network</p>
          </div>

          <div className="space-y-2.5">
            {alertTypesOrdered.map((alt) => {
              const count = alertFrequencyMap[alt.key] || 1;
              const maxAlertCount = Math.max(...Object.values(alertFrequencyMap), 6);
              const widthPct = Math.round((count / maxAlertCount) * 100);

              return (
                <div key={alt.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#143826]">{alt.label}</span>
                    <span className="font-mono font-bold text-[#143826]">{count} events</span>
                  </div>
                  <div className="h-2 w-full bg-[#e8efe7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%`, backgroundColor: alt.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 6: Citizen Feedback Ratings */}
        <div className="lg:col-span-6 bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#143826]">
                6. Citizen Cleanliness Ratings
              </h3>
              <p className="text-xs text-[#52796f]">Distribution of ratings received via Bin QR Code scans</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono text-xs font-bold text-amber-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{avgRating} / 5.0</span>
            </div>
          </div>

          <div className="space-y-2">
            {starCounts.map(({ stars, count }) => {
              const pct = Math.round((count / totalFeedbackCount) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-14 font-mono text-[#143826]">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </div>

                  <div className="flex-1 h-2.5 bg-[#e8efe7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="font-mono text-xs text-[#52796f] w-12 text-right">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#f2f7f1] rounded-2xl text-[11px] text-[#52796f]">
            💬 <strong>Citizen Participation:</strong> 85% of reviews rated bins 4★ or 5★ for rapid collection dispatch and clean station surroundings.
          </div>
        </div>
      </div>
    </div>
  );
};
