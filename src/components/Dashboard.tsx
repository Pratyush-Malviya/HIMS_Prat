import React, { useState } from "react";
import { Activity, Users, BedDouble, AlertTriangle, FileText, Pill, DollarSign, ArrowRight } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";

interface DashboardProps {
  store: HIMSStore;
  setActiveTab: (tab: string) => void;
  setSelectedPatientId: (id: string | null) => void;
}

export function Dashboard({ store, setActiveTab, setSelectedPatientId }: DashboardProps) {
  const { patients, appointments, vitals, beds, admissions, medicines, billing, auditLogs } = store;

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
