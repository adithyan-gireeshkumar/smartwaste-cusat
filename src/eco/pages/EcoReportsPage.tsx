import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  BarChart2,
  Trash2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { useEco } from '../state/EcoContext';

type ReportType =
  | 'DAILY_WASTE'
  | 'WEEKLY_WASTE'
  | 'COLLECTION_LOG'
  | 'DAMAGED_BINS'
  | 'CITIZEN_FEEDBACK';

export const EcoReportsPage: React.FC = () => {
  const { bins, locations, collections, alerts, feedback, profile } = useEco();

  const [activeReport, setActiveReport] = useState<ReportType>('DAILY_WASTE');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('30 Sep 2026, 02:15 PM');

  const damagedBins = bins.filter((b) => b.physicalCondition !== 'GOOD');
  const urgentBins = bins.filter((b) => b.fillLevel >= 75);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedAt(
        new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 600);
  };

  // Requirement 22: Export Downloadable CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `CUSAT_SmartWaste_${activeReport}_${selectedDate}.csv`;

    if (activeReport === 'DAILY_WASTE' || activeReport === 'WEEKLY_WASTE') {
      csvContent += 'Bin ID,Station Name,Waste Category,Fill Level (%),Lid Status,Online,Physical Condition,Last Updated\n';
      bins.forEach((b) => {
        csvContent += `"${b.id}","${b.locationName}","${b.wasteLabel}",${b.fillLevel},"${b.isOpen ? 'Open' : 'Closed'}","${b.isOnline ? 'Online' : 'Offline'}","${b.physicalCondition}","${b.lastUpdated}"\n`;
      });
    } else if (activeReport === 'COLLECTION_LOG') {
      csvContent += 'Task ID,Bin ID,Station Name,Waste Stream,Fill Level (%),Priority,Assigned Collector,Status,Collected At\n';
      collections.forEach((c) => {
        csvContent += `"${c.id}","${c.binId}","${c.locationName}","${c.wasteType}",${c.fillLevel},"${c.priority}","${c.assignedCollector || 'None'}","${c.status}","${c.collectedAt || 'N/A'}"\n`;
      });
    } else if (activeReport === 'DAMAGED_BINS') {
      csvContent += 'Bin ID,Station Name,Category,Physical Condition,Battery (%),Temperature (C),Report\n';
      damagedBins.forEach((b) => {
        csvContent += `"${b.id}","${b.locationName}","${b.wasteLabel}","${b.physicalCondition}",${b.batteryLevel},${b.temperatureC},"Requires Structural Servicing"\n`;
      });
    } else if (activeReport === 'CITIZEN_FEEDBACK') {
      csvContent += 'Feedback ID,Bin ID,Station Name,Rating,Complaint Type,Comment,Submitted At,Status,Staff Notes\n';
      feedback.forEach((f) => {
        csvContent += `"${f.id}","${f.binId}","${f.locationName}",${f.rating},"${f.complaintType}","${f.comment.replace(/"/g, '""')}","${f.submittedAt}","${f.status}","${(f.resolutionNotes || '').replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfdfa] border border-[#dbe6dc] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h1 className="text-base font-serif font-bold text-[#143826]">
              CUSAT Campus Sanitation & Audit Reports
            </h1>
          </div>
          <p className="text-xs text-[#52796f] mt-0.5">
            Formal reports on daily segregated tonnage, maintenance compliance, collection efficiency, and civic feedback ratings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#b7e4c7]" />
            <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-[#1b4332]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="p-2 bg-[#f0f6ef] hover:bg-[#e2ece3] text-[#143826] border border-[#d3e2d5] rounded-2xl text-xs font-medium transition-colors"
            title="Print / PDF View"
          >
            <Printer className="w-4 h-4 text-[#52796f]" />
          </button>
        </div>
      </div>

      {/* Report Types Tabs (Requirement 22) */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'DAILY_WASTE', label: '📅 Daily Waste Report' },
            { id: 'WEEKLY_WASTE', label: '📊 Weekly Audit Report' },
            { id: 'COLLECTION_LOG', label: '📦 Collection Run Log' },
            { id: 'DAMAGED_BINS', label: '🔧 Damaged Bins Audit' },
            { id: 'CITIZEN_FEEDBACK', label: '💬 Citizen Feedback Summary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`px-3.5 py-2 rounded-xl transition-all font-medium ${
                activeReport === tab.id
                  ? 'bg-[#1b4332] text-white shadow-2xs font-semibold'
                  : 'bg-[#f0f6ef] text-[#2d3732] hover:bg-[#e4efe3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-[#52796f]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 bg-[#f4f8f3] border border-[#d3e2d5] rounded-xl text-xs text-[#143826]"
          />
        </div>
      </div>

      {/* Generated Report View Container */}
      <div className="bg-[#fbfdfa] border border-[#dbe6dc] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Printable Official Header */}
        <div className="border-b border-[#e2ece3] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#143826]">
                  {profile.institution}
                </h2>
                <h3 className="text-xs font-semibold text-[#52796f]">
                  Smart Waste Management Network · {profile.groupProjectName}
                </h3>
              </div>
            </div>
            <div className="mt-3 text-xs text-[#2d3732] font-semibold">
              Document: {activeReport.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="text-right text-xs font-mono text-[#52796f] space-y-0.5">
            <div>Audit Date: <strong>{selectedDate}</strong></div>
            <div>Generated: <strong>{generatedAt}</strong></div>
            <div>Lead Officer: <strong>{profile.adminName}</strong></div>
          </div>
        </div>

        {/* 1. Daily Waste Report View */}
        {activeReport === 'DAILY_WASTE' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Active Stations</span>
                <div className="text-xl font-bold font-mono text-[#143826]">20</div>
              </div>
              <div className="p-3 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Monitored Bins</span>
                <div className="text-xl font-bold font-mono text-[#143826]">{bins.length}</div>
              </div>
              <div className="p-3 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Pickups Today</span>
                <div className="text-xl font-bold font-mono text-[#143826]">28 Completed</div>
              </div>
              <div className="p-3 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Total Waste Recycled</span>
                <div className="text-xl font-bold font-mono text-[#143826]">1,280 kg</div>
              </div>
            </div>

            <h4 className="text-xs font-bold text-[#143826] uppercase tracking-wider pt-2">
              High-Congestion Smart Stations Requiring Attention
            </h4>

            <div className="border border-[#dbe6dc] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] font-mono text-[11px] text-[#52796f]">
                  <tr>
                    <th className="py-2.5 px-4">Bin ID</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Fill Level</th>
                    <th className="py-2.5 px-4">Security</th>
                    <th className="py-2.5 px-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ec]">
                  {urgentBins.slice(0, 8).map((b) => (
                    <tr key={b.id} className="hover:bg-[#f6f9f5]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#143826]">{b.id}</td>
                      <td className="py-2.5 px-4 text-[#143826]">{b.locationName}</td>
                      <td className="py-2.5 px-4">{b.wasteLabel}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-orange-700">{b.fillLevel}%</td>
                      <td className="py-2.5 px-4">{b.isOpen ? '🔓 Lid Open' : '🔒 Closed'}</td>
                      <td className="py-2.5 px-4 text-[#2d6a4f] font-medium">Assign Collector squad immediately</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Weekly Waste Report View */}
        {activeReport === 'WEEKLY_WASTE' && (
          <div className="space-y-4 text-xs">
            <p className="text-[#52796f]">
              Consolidated 7-day campus audit indicating total kilograms diverted from Kalamassery landfill, segregation compliance score, and squad SLA fulfillment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Total Weekly Recovered</span>
                <div className="text-xl font-bold font-mono text-[#143826]">8,940 kg</div>
                <span className="text-[10px] text-emerald-700">↑ 12% vs prior week</span>
              </div>
              <div className="p-4 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Average Pickup SLA</span>
                <div className="text-xl font-bold font-mono text-[#143826]">18.4 mins</div>
                <span className="text-[10px] text-emerald-700">Faster than campus benchmark</span>
              </div>
              <div className="p-4 bg-[#f2f7f1] rounded-2xl space-y-1">
                <span className="text-[11px] text-[#52796f]">Cross-Contamination Rate</span>
                <div className="text-xl font-bold font-mono text-[#143826]">3.2%</div>
                <span className="text-[10px] text-emerald-700">96.8% correct segregation</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#dbe6dc] space-y-2">
              <h4 className="font-bold text-[#143826]">Audit Summary & Dean Recommendation:</h4>
              <p className="text-[#52796f] leading-relaxed">
                The campus IoT smart waste deployment has reduced station overflows to zero across prime academic areas including Old SOE, New SOE, Central Library, and Seminar Complex. The smart wrong-waste camera detection has alerted supervisors to food waste in plastic streams at Central Cafeteria, allowing targeted educational signage.
              </p>
            </div>
          </div>
        )}

        {/* 3. Collection Log */}
        {activeReport === 'COLLECTION_LOG' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#143826] uppercase tracking-wider">
              Recent Sanitation Pickup Operations
            </h4>
            <div className="border border-[#dbe6dc] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] font-mono text-[11px] text-[#52796f]">
                  <tr>
                    <th className="py-2.5 px-4">Task</th>
                    <th className="py-2.5 px-4">Bin ID</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Stream</th>
                    <th className="py-2.5 px-4">Assigned Collector</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ec]">
                  {collections.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f6f9f5]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#143826]">{c.id}</td>
                      <td className="py-2.5 px-4 font-mono">{c.binId}</td>
                      <td className="py-2.5 px-4 text-[#143826]">{c.locationName}</td>
                      <td className="py-2.5 px-4">{c.wasteType}</td>
                      <td className="py-2.5 px-4">{c.assignedCollector || 'Pending Squad'}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Damaged Bins Report */}
        {activeReport === 'DAMAGED_BINS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#143826] uppercase tracking-wider">
                Physical Maintenance & Sensor Repair Required ({damagedBins.length} Units)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                Maintenance Required
              </span>
            </div>

            <div className="border border-[#dbe6dc] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] font-mono text-[11px] text-[#52796f]">
                  <tr>
                    <th className="py-2.5 px-4">Bin ID</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Stream</th>
                    <th className="py-2.5 px-4">Structural Condition</th>
                    <th className="py-2.5 px-4">Hardware Telemetry</th>
                    <th className="py-2.5 px-4">Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ec]">
                  {damagedBins.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f6f9f5]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#143826]">{b.id}</td>
                      <td className="py-2.5 px-4 text-[#143826]">{b.locationName}</td>
                      <td className="py-2.5 px-4">{b.wasteLabel}</td>
                      <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">{b.physicalCondition}</td>
                      <td className="py-2.5 px-4 font-mono text-[#52796f]">{b.temperatureC}°C · {b.batteryLevel}% Bat</td>
                      <td className="py-2.5 px-4 text-[#2d6a4f] font-semibold">Repair lid hinge / replace ultrasonic sensor</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Citizen Feedback Report */}
        {activeReport === 'CITIZEN_FEEDBACK' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#143826] uppercase tracking-wider">
              Civic Feedback & QR Grievance Log
            </h4>
            <div className="border border-[#dbe6dc] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f2f7f1] border-b border-[#dbe6dc] font-mono text-[11px] text-[#52796f]">
                  <tr>
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Bin & Station</th>
                    <th className="py-2.5 px-4">Rating</th>
                    <th className="py-2.5 px-4">Complaint Category</th>
                    <th className="py-2.5 px-4">Citizen Feedback</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3ec]">
                  {feedback.map((f) => (
                    <tr key={f.id} className="hover:bg-[#f6f9f5]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#143826]">{f.id}</td>
                      <td className="py-2.5 px-4 text-[#143826]">{f.locationName} ({f.binId})</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-700">{f.rating} ★</td>
                      <td className="py-2.5 px-4">{f.complaintType}</td>
                      <td className="py-2.5 px-4 text-[#52796f] max-w-xs truncate">{f.comment}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] font-bold">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Signature Footer */}
        <div className="pt-6 border-t border-[#e2ece3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#52796f]">
          <div>
            <div className="font-semibold text-[#143826]">CUSAT Zero-Waste Smart Infrastructure Mission</div>
            <div className="text-[11px]">Approved for academic review and municipal environmental compliance.</div>
          </div>

          <div className="text-right">
            <div className="font-mono font-bold text-[#143826]">{profile.adminName}</div>
            <div className="text-[11px]">Campus Sanitation & Environmental Officer</div>
          </div>
        </div>
      </div>
    </div>
  );
};
