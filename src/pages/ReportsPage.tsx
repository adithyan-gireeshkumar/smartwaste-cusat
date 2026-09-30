import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Download,
  Layers
} from 'lucide-react';
import { ReportsSummary, WasteBin } from '../types';
import { api } from '../services/api';

interface ReportsPageProps {
  bins: WasteBin[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ bins }) => {
  const [reports, setReports] = useState<ReportsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsSummary();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Bin ID', 'Location', 'Current Fill %', 'Capacity (L)', 'Status', 'Battery %', 'Today Pickups'];
    const rows = bins.map((b) => [
      b.id,
      `"${b.location_name}"`,
      b.fill_level,
      b.capacity_liters,
      b.status,
      b.battery_level,
      b.today_collections,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CUSAT_Waste_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Campus Waste Analytics & Reports</h2>
          <p className="text-xs text-slate-400">
            Performance metrics, volume estimations, and zone utilization trends across CUSAT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            {(['today', '7days', '30days', 'custom'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  timeRange === r ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'today'
                  ? 'Today'
                  : r === '7days'
                  ? 'Last 7 Days'
                  : r === '30days'
                  ? 'Last 30 Days'
                  : 'Custom'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Campus Bin Utilization</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {reports?.utilization_rate_pct ?? 78.4}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Capacity optimized</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Collection Completion Rate</span>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
            {reports?.collection_completion_rate_pct ?? 94.2}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Within SLA threshold</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Response Time</span>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {reports?.average_response_time_minutes ?? 24} mins
          </div>
          <span className="text-[11px] text-slate-500 font-mono">From alert to dispatch</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Estimated Waste Diverted</span>
          <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
            {reports?.total_collected_kg_estimate ?? 1420} kg
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Segregated recyclables</span>
        </div>
      </div>

      {/* Ward / Zone Statistics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Campus Zone & Ward Statistics</h3>
            <p className="text-xs text-slate-400">
              Aggregated fill load and frequency of critical states by campus sectors.
            </p>
          </div>
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Campus Sector / Ward</th>
                <th className="py-2.5 px-3">Active Smart Bins</th>
                <th className="py-2.5 px-3">Average Fill Load</th>
                <th className="py-2.5 px-3">Bins &ge; 75% Full</th>
                <th className="py-2.5 px-3">Relative Load Visualizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reports?.ward_statistics?.map((stat) => (
                <tr key={stat.zone} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{stat.zone}</td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                    {stat.bin_count} units
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums font-semibold text-emerald-400">
                    {stat.average_fill}%
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        stat.high_fill_count > 0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
                      }`}
                    >
                      {stat.high_fill_count} {stat.high_fill_count === 1 ? 'bin' : 'bins'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          stat.average_fill >= 80
                            ? 'bg-rose-500'
                            : stat.average_fill >= 60
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${stat.average_fill}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Full Bins Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Frequently Full High-Traffic Bins</h3>
            <p className="text-xs text-slate-400">
              Campus hotspots that require priority routing and increased pickup cadence.
            </p>
          </div>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bins
            .filter((b) => b.fill_level >= 75)
            .map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{b.location_name}</span>
                  <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                    {b.fill_level}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>ID: {b.id}</span>
                  <span>{b.today_collections} Pickups Today</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${b.fill_level >= 90 ? 'bg-rose-500' : 'bg-amber-400'}`}
                    style={{ width: `${b.fill_level}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
