import React, { useState } from "react";
import { Activity, Users, BedDouble, AlertTriangle, FileText, Pill, DollarSign, ArrowRight, Sparkles, RefreshCw, Clipboard } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { generateWardSummary } from "../api";

interface DashboardProps {
  store: HIMSStore;
  setActiveTab: (tab: string) => void;
  setSelectedPatientId: (id: string | null) => void;
}

export function Dashboard({ store, setActiveTab, setSelectedPatientId }: DashboardProps) {
  const { patients, appointments, vitals, beds, admissions, medicines, billing, auditLogs } = store;

  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [wardSummaryReport, setWardSummaryReport] = useState<any>(null);

  const triggerWardSummary = async () => {
    setGeneratingSummary(true);
    setWardSummaryReport(null);
    try {
      // Gather dynamic payload from current store state
      const anomalies = vitals.filter(v => v.isAnomaly).map(v => ({
        patientUHID: patients.find(p => p.id === v.patientId)?.uhid,
        reason: v.anomalyReason,
        values: `HR: ${v.heartRate}, BP: ${v.bloodPressure}, SpO2: ${v.spO2}%`,
        timestamp: v.timestamp
      }));

      const activeAdmits = admissions.filter(a => a.status === "Admitted");
      const recentTransfers = activeAdmits.slice(0, 5).map(adm => ({
        patientName: adm.patientName,
        bed: adm.bedNumber,
        ward: adm.ward,
        admittedBy: adm.admittingDoctor,
        diagnosis: adm.admittingDiagnosis
      }));

      const occupancyMetric = [{
        totalBeds: beds.length,
        occupiedCount: beds.filter(b => b.status === "Occupied").length,
        occupancyPercent: Math.round((beds.filter(b => b.status === "Occupied").length / beds.length) * 100)
      }];

      const summary = await generateWardSummary({
        anomalyEvents: anomalies,
        patientTransfers: recentTransfers,
        bedOccupancyChanges: occupancyMetric
      });

      setWardSummaryReport(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Compute metrics
  const activeAdmissions = admissions.filter((a) => a.status === "Admitted");
  const apptsScheduledToday = appointments.filter((a) => a.status === "Scheduled");
  const criticalVitals = vitals.filter((v) => v.isAnomaly);
  const totalBedsCount = beds.length;
  const occupiedBedsCount = beds.filter((b) => b.status === "Occupied").length;
  const bedOccupancyRate = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;
  
  const lowStockMedicines = medicines.filter((m) => m.stockCount <= m.safetyStock);
  const totalOutstandingBilling = billing
    .filter((b) => b.status === "Unpaid" || b.status === "Pending_TPA")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalPaidBilling = billing
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Department Occupancy details for custom SVG graph
  const wardBreakdown = {
    ICU: { total: beds.filter((b) => b.ward === "ICU").length, occupied: beds.filter((b) => b.ward === "ICU" && b.status === "Occupied").length },
    "General A": { total: beds.filter((b) => b.ward === "General Ward A").length, occupied: beds.filter((b) => b.ward === "General Ward A" && b.status === "Occupied").length },
    "General B": { total: beds.filter((b) => b.ward === "General Ward B").length, occupied: beds.filter((b) => b.ward === "General Ward B" && b.status === "Occupied").length },
    Pediatrics: { total: beds.filter((b) => b.ward === "Pediatrics").length, occupied: beds.filter((b) => b.ward === "Pediatrics" && b.status === "Occupied").length },
    "Emergency": { total: beds.filter((b) => b.ward === "Emergency Area").length, occupied: beds.filter((b) => b.ward === "Emergency Area" && b.status === "Occupied").length }
  };

  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  // Quick navigation helpers
  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab("opd");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / HIMS Welcome */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 relative overflow-hidden" id="dashboard_banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-emerald-400 font-mono text-xs tracking-wider uppercase">Active Session</span>
          <h1 className="text-3xl font-sans font-medium tracking-tight mt-1 text-slate-100">
            HIMS Smart Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-normal leading-relaxed">
            Integrating advanced Google Gemini intelligence with clinical operations. Monitor vital telemetry, analyze patient flows, track pharmaceutical safety stocks, and authorize claims instantly.
          </p>
        </div>
      </div>

      {/* Dedicated AI 24-Hour Ward Summary Report Section */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-4 shadow-sm" id="ai_ward_summary_panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              Automated 24-Hour Ward Summary Co-Pilot
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregates recent patient Transfers, vital signs Telemetry Anomalies, and Bed Occupancy into a clinical operations statement.
            </p>
          </div>
          <div>
            <button
              onClick={triggerWardSummary}
              disabled={generatingSummary}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-850"
              id="btn_trigger_ward_summary"
            >
              {generatingSummary ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Aggregating Ward Logs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate AI Ward Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {generatingSummary && (
          <div className="py-12 border border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center space-y-2.5">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-700 block">AI Agent Synthesizing EHR Telemetry</span>
              <p className="text-[10px] text-slate-400">Consulting Gemini models to construct Operations briefing...</p>
            </div>
          </div>
        )}

        {wardSummaryReport && !generatingSummary && (
          <div className="border border-slate-100/50 rounded-xl bg-slate-50/50 p-5 space-y-5 text-left animate-fadeIn" id="ai_ward_report_container">
            <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-slate-600" />
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">WARD HEALTH REPORT COMPLETE • CLINICAL STATUS LEVEL</span>
              </div>
              <button
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (!printWindow) return;
                  const printingHtml = `
                    <html>
                      <head>
                        <title>Ward Performance briefing - ${new Date().toLocaleDateString()}</title>
                        <style>
                          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                          .hospital { text-transform: uppercase; font-size: 11px; tracking: 1.5px; font-weight: bold; color: #059669; margin-bottom: 4px; }
                          h1 { font-size: 20px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 0; margin-bottom: 24px; }
                          h2 { font-size: 13px; font-family: monospace; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; margin-top: 24px; padding-bottom: 4px; color: #334155; }
                          .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 12px; }
                          p { font-size: 13px; margin: 8px 0; }
                          .bullets { font-size: 13px; margin-left: 20px; }
                          .footer { margin-top: 48px; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between; }
                        </style>
                      </head>
                      <body>
                        <div class="hospital">HIMS Clinical Operations dashboard</div>
                        <h1>Google AI 24-Hour Ward Summary</h1>
                        <div class="meta">
                          <div><strong>REPORT PERIOD:</strong> Last 24 Hours operations</div>
                          <div><strong>TRANSITION STATUS:</strong> REVIEW COMPLETED</div>
                          <div><strong>PRINT TIMESTAMP:</strong> ${new Date().toLocaleString()}</div>
                        </div>
                        <h2>1. CLINICAL EXECUTIVE SUMMARY</h2>
                        <p>${wardSummaryReport.executiveSummary}</p>
                        
                        <h2>2. BED OCCUPANCY & CAPACITY METRICS</h2>
                        <p>${wardSummaryReport.occupancyAnalysis}</p>
                        
                        <h2>3. RECENT TRANSFERS & ADMISSIONS ANALYSIS</h2>
                        <p>${wardSummaryReport.transferInsights}</p>
                        
                        <h2>4. BIOMETRIC ANOMALIES & CLINICAL RISK EVALUATION</h2>
                        <p>${wardSummaryReport.anomalyOverview}</p>
                        
                        <h2>5. KEY RECOMMENDATIONS FOR INCOMING DUTY STAFF</h2>
                        <ul class="bullets">
                          ${(wardSummaryReport.recommendations || []).map((rec: string) => `<li style="margin-bottom:6px;">${rec}</li>`).join("")}
                        </ul>
                        
                        <div class="footer">
                          <div>MEDSECURE COMPLIANCE RECORD • GOOGLE GEMINI POWERED ANALYSIS</div>
                          <div>Chief Medical Officer signature: __________________________</div>
                        </div>
                        <script>
                          window.onload = function() { window.print(); }
                        </script>
                      </body>
                    </html>
                  `;
                  printWindow.document.write(printingHtml);
                  printWindow.document.close();
                }}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-emerald-200/30"
                id="btn_download_dashboard_pdf"
              >
                <span>Export Executive Briefing (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-700 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">Chief Executive Briefing</span>
                  <p className="mt-1 text-slate-800 leading-relaxed font-normal bg-white p-3 border border-slate-100 rounded-lg">{wardSummaryReport.executiveSummary}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">Occupancy & safety Index</span>
                  <p className="mt-1 text-slate-800 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">{wardSummaryReport.occupancyAnalysis}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">Department Transfers highlight</span>
                  <p className="mt-1 text-slate-800 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">{wardSummaryReport.transferInsights}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">Critical Alarms & Bio-Risks</span>
                  <p className="mt-1 text-slate-800 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">{wardSummaryReport.anomalyOverview}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-xl space-y-2 mt-2">
              <h4 className="text-[10px] font-bold font-mono tracking-wider text-emerald-800 uppercase">Recommended Operations directives for transition crew</h4>
              <ul className="text-xs text-slate-750 list-none pl-0 space-y-1.5">
                {(wardSummaryReport.recommendations || []).map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <span className="text-slate-700 leading-tight">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard_kpi_grid">
        {/* Card 1: Critical Telemetry */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono tracking-wide uppercase">Critical Telemetry</span>
            <div className={`p-2 rounded-lg ${criticalVitals.length > 0 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{criticalVitals.length}</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">Active vitals alert flags</span>
              <button
                onClick={() => setActiveTab("ipd")}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                id="btn_telemetry_nav"
              >
                Nurse Ops <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Bed Resource Cap */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono tracking-wide uppercase">Bed Occupancy</span>
            <div className={`p-2 rounded-lg bg-emerald-50 text-emerald-600`}>
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{bedOccupancyRate}%</h2>
              <span className="text-xs text-slate-500 font-mono">({occupiedBedsCount}/{totalBedsCount})</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${bedOccupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: OPD Load */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono tracking-wide uppercase">OPD Caseload</span>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{apptsScheduledToday.length}</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">Scheduled checks today</span>
              <button
                onClick={() => setActiveTab("opd")}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                id="btn_opd_nav"
              >
                Calendar <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stocks */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono tracking-wide uppercase">Pharmacy Alert</span>
            <div className={`p-2 rounded-lg ${lowStockMedicines.length > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{lowStockMedicines.length}</h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">Drugs under safety stock</span>
              <button
                onClick={() => setActiveTab("pharmacy")}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                id="btn_pharmacy_nav"
              >
                Inventory <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graphs & Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_split">
        {/* Occupancy and Revenue Custom Charts */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight font-sans">Active Ward Allocations</h3>
            <p className="text-xs text-slate-400">Simulating bed loading density by key hospital medical departments</p>
          </div>

          {/* Ward Bed SVG Chart */}
          <div className="relative border border-slate-50 rounded-lg p-4 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Occupied Beds
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block"></span> Available Beds
                </div>
              </div>
              {hoveredWard && (
                <div className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm">
                  {hoveredWard}: <span className="font-semibold text-emerald-600">{wardBreakdown[hoveredWard as keyof typeof wardBreakdown].occupied}</span> occupied out of {wardBreakdown[hoveredWard as keyof typeof wardBreakdown].total} beds
                </div>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(wardBreakdown).map(([name, val]) => {
                const pct = val.total > 0 ? (val.occupied / val.total) * 100 : 0;
                return (
                  <div
                    key={name}
                    className="space-y-1"
                    onMouseEnter={() => setHoveredWard(name)}
                    onMouseLeave={() => setHoveredWard(null)}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{name}</span>
                      <span className="font-mono text-slate-400">{val.occupied}/{val.total} beds ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full flex bg-slate-200 h-6 rounded overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300 relative flex items-center pl-2 text-[10px] text-white font-mono"
                        style={{ width: `${Math.max(10, pct)}%` }}
                      >
                        {pct > 15 && `${Math.round(pct)}%`}
                      </div>
                      <div className="flex-1 bg-slate-200"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Sparkline SVG Chart */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Cumulative Revenue Stream</h4>
                <p className="text-xs text-slate-400">Total settled patient collections out of outstanding billing</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-medium text-slate-800">${totalPaidBilling.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400">Collected settled</p>
              </div>
            </div>

            {/* Simulated mini line chart */}
            <div className="h-28 bg-slate-900 rounded-lg p-3 relative flex flex-col justify-end">
              <div className="absolute top-3 left-3 flex gap-4 text-[10px] text-slate-500 font-mono">
                <div><span className="inline-block w-2 h-2 rounded bg-teal-400 mr-1"></span>Paid: ${totalPaidBilling}</div>
                <div><span className="inline-block w-2 h-2 rounded bg-amber-400 mr-1"></span>Outstanding: ${totalOutstandingBilling}</div>
              </div>
              <svg className="w-full h-16 pointer-events-none overflow-visible" viewBox="0 0 500 60">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="15" x2="500" y2="15" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="35" x2="500" y2="35" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="55" x2="500" y2="55" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* Path line */}
                <path
                  d="M 10 50 Q 80 40 150 48 T 290 32 T 400 22 T 490 8"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                />
                <path
                  d="M 10 50 Q 80 40 150 48 T 290 32 T 400 22 T 490 8 L 490 60 L 10 60 Z"
                  fill="url(#chartGrad)"
                />
                <circle cx="490" cy="8" r="4" fill="#0d9488" stroke="#ffffff" strokeWidth="1" />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800">
                <span>05 AM</span>
                <span>08 AM</span>
                <span>11 AM</span>
                <span>02 PM</span>
                <span>05 PM</span>
                <span>Live Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Anomaly Feed & Administrative Log sidebar */}
        <div className="space-y-6">
          {/* Section A: Live Anomaly Alerts */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
              Live Telemetry Guards
            </h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {criticalVitals.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All active patients biometric streams are safe & within clinical baselines.
                </div>
              ) : (
                criticalVitals.map((v) => {
                  const pat = patients.find((p) => p.id === v.patientId);
                  return (
                    <div
                      key={v.id}
                      className="p-3 bg-red-50/50 border border-red-100/50 rounded-lg text-xs space-y-1 cursor-pointer hover:bg-red-50 transition-colors"
                      onClick={() => handleViewPatient(v.patientId)}
                    >
                      <div className="flex justify-between font-medium">
                        <span className="text-red-800">{pat?.name || "Patient"}</span>
                        <span className="text-[10px] text-red-500 font-mono">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 leading-normal">{v.anomalyReason}</p>
                      <div className="flex gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                        <span>HR: {v.heartRate} bpm</span>
                        <span>BP: {v.bloodPressure}</span>
                        <span>SpO2: {v.spO2}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section B: Administrative Trail */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-800">System Activity Trail</h3>
              <button
                onClick={() => setActiveTab("admin")}
                className="text-[10px] text-slate-400 hover:text-emerald-600 font-mono"
              >
                Audits & RBAC
              </button>
            </div>
            <div className="space-y-3 text-xs max-h-[240px] overflow-y-auto pr-1 font-mono">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>{log.user} ({log.role})</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">
                    <span className="text-indigo-600 font-semibold">{log.action}:</span> {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
