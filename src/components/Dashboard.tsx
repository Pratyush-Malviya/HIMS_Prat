import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Users, 
  BedDouble, 
  AlertTriangle, 
  FileText, 
  Pill, 
  DollarSign, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Clipboard, 
  Heart, 
  CheckCircle, 
  Shield, 
  Settings2, 
  Plus, 
  Search, 
  HelpCircle, 
  Thermometer, 
  ChevronRight, 
  Wind,
  Clock,
  MessageSquare,
  Send,
  Star,
  ShieldCheck,
  X,
  User
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HIMSStore } from "../useHIMSStore";
import { generateWardSummary } from "../api";

interface DashboardProps {
  store: HIMSStore;
  setActiveTab: (tab: string) => void;
  setSelectedPatientId: (id: string | null) => void;
  activeSubTab?: string;
  currentUser?: { name: string; role: string };
}

export function Dashboard({ store, setActiveTab, setSelectedPatientId, activeSubTab = "overview", currentUser }: DashboardProps) {
  const { patients, appointments, vitals, beds, admissions, medicines, billing, auditLogs, logVitals, createLog } = store;

  // Real-time animation simulator for telemetry readings
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Staff Support Desk States
  const [ticketSearch, setTicketSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [csatStarHover, setCsatStarHover] = useState<number | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    category: "General Bug" as any,
    subject: "",
    priority: "Medium" as any,
    message: "",
    employeeName: currentUser?.name || "Dr. Rajesh Kumar",
    employeeEmail: "rajesh@metrogeneral.com"
  });

  const [replyMessage, setReplyMessage] = useState("");
  const [ticketChatLogs, setTicketChatLogs] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});

  const handleSendReply = (ticketId: string) => {
    if (!replyMessage.trim()) return;
    const msg = {
      sender: currentUser?.name || "Dr. Rajesh Kumar",
      text: replyMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTicketChatLogs(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), msg]
    }));
    setReplyMessage("");
    
    // Auto simulated response from assigned specialist in 1.2 seconds
    const ticket = store.supportTickets.find(t => t.id === ticketId);
    const assignedEng = ticket?.assignedEngineer || "Sarah Jenkins (Principal)";
    setTimeout(() => {
      const resp = {
        sender: assignedEng,
        text: `Thanks for the follow-up note. I am verifying your report with the central Cloud Run container logs and our clinical databases. Action remains prioritized.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTicketChatLogs(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), resp]
      }));
    }, 1200);
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

  // Generate 7 days revenue trend dynamically using Recharts specifications
  const revenueTrendData = useMemo(() => {
    const data = [];
    const basePaidValues = [12500, 14200, 13800, 15900, 17100, 16500, 18200];
    const baseOustandingValues = [4100, 5200, 3100, 4800, 6100, 3900, 5400];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const paidOnDay = billing
        .filter((b) => b.status === "Paid" && b.date && b.date.startsWith(dateString))
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const outstandingOnDay = billing
        .filter((b) => (b.status === "Unpaid" || b.status === "Pending_TPA") && b.date && b.date.startsWith(dateString))
        .reduce((sum, b) => sum + b.totalAmount, 0);

      data.push({
        date: dateLabel,
        Paid: paidOnDay > 0 ? paidOnDay : basePaidValues[6 - i],
        Outstanding: outstandingOnDay > 0 ? outstandingOnDay : baseOustandingValues[6 - i],
      });
    }
    return data;
  }, [billing]);

  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [wardSummaryReport, setWardSummaryReport] = useState<any>(null);

  const triggerWardSummary = async () => {
    setGeneratingSummary(true);
    setWardSummaryReport(null);
    try {
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

  const wardBreakdown = {
    ICU: { total: beds.filter((b) => b.ward === "ICU").length, occupied: beds.filter((b) => b.ward === "ICU" && b.status === "Occupied").length },
    "General A": { total: beds.filter((b) => b.ward === "General Ward A").length, occupied: beds.filter((b) => b.ward === "General Ward A" && b.status === "Occupied").length },
    "General B": { total: beds.filter((b) => b.ward === "General Ward B").length, occupied: beds.filter((b) => b.ward === "General Ward B" && b.status === "Occupied").length },
    Pediatrics: { total: beds.filter((b) => b.ward === "Pediatrics").length, occupied: beds.filter((b) => b.ward === "Pediatrics" && b.status === "Occupied").length },
    "Emergency": { total: beds.filter((b) => b.ward === "Emergency Area").length, occupied: beds.filter((b) => b.ward === "Emergency Area" && b.status === "Occupied").length }
  };

  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab("opd");
  };

  // --- SubTab 2: Telemetry Feed States ---
  const [telemetrySearch, setTelemetrySearch] = useState("");
  const [telemetryFilter, setTelemetryFilter] = useState<"all" | "anomalies">("all");
  
  // Intake Log Form Form States
  const [selectedInpatientId, setSelectedInpatientId] = useState("");
  const [logHeartRate, setLogHeartRate] = useState(76);
  const [logBloodPressure, setLogBloodPressure] = useState("120/80");
  const [logSpO2, setLogSpO2] = useState(98);
  const [logTemp, setLogTemp] = useState(36.8);
  const [logRespRate, setLogRespRate] = useState(16);
  const [silencedAlarms, setSilencedAlarms] = useState<string[]>([]);

  // Automatically select first inpatient if not set
  useEffect(() => {
    if (activeAdmissions.length > 0 && !selectedInpatientId) {
      setSelectedInpatientId(activeAdmissions[0].patientId);
    }
  }, [activeAdmissions, selectedInpatientId]);

  // Live anomaly analytical tag preview inside intake form
  const computedAnomaly = useMemo(() => {
    let reasons = [];
    if (logHeartRate > 120) reasons.push(`High HR (Tachycardia: ${logHeartRate} bpm)`);
    if (logHeartRate < 50) reasons.push(`Low HR (Bradycardia: ${logHeartRate} bpm)`);
    if (logSpO2 < 93) reasons.push(`Low SpO2 (Hypoxemia: ${logSpO2}%)`);
    if (logTemp > 38.3) reasons.push(`High Temp (Pyrexia: ${logTemp}°C)`);
    if (logRespRate > 24) reasons.push(`High Resp Rate (Tachypnea: ${logRespRate} bpm)`);

    return {
      isAnomaly: reasons.length > 0,
      reason: reasons.join(", ")
    };
  }, [logHeartRate, logSpO2, logTemp, logRespRate]);

  // Handle vitals manual intake submit
  const submitVitalsIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInpatientId) {
      alert("Please select a valid admitted inpatient first.");
      return;
    }

    const patientObj = patients.find(p => p.id === selectedInpatientId);
    logVitals({
      patientId: selectedInpatientId,
      heartRate: logHeartRate,
      bloodPressure: logBloodPressure,
      spO2: logSpO2,
      temperature: logTemp,
      respiratoryRate: logRespRate,
      recordedBy: "Telemetry Coordinator Desk",
      isAnomaly: computedAnomaly.isAnomaly,
      anomalyReason: computedAnomaly.reason
    }, "Telemetry Coordinator", "Nurse");

    createLog(
      "Telemetry Coordinator",
      "Nurse",
      "Manual Telemetry Log Entry",
      "Nurse Station Flow",
      `Logged vital indicators for patient ${patientObj?.name || "Unknown"} (HR: ${logHeartRate}, SpO2: ${logSpO2}%, Temp: ${logTemp}°C). ${computedAnomaly.isAnomaly ? "Automated threshold anomaly tripped: " + computedAnomaly.reason : "All parameters stable."}`
    );

    alert(`Successfully registered telemetry package for Patient ${patientObj?.name || "EHR Patient"}. ${computedAnomaly.isAnomaly ? "⚠️ Warning anomaly alerts logged to control monitors." : "All parameters within baseline."}`);
  };

  // Multi-user/HIMS adopting simulated live readings
  const simulatedActiveAdmissions = useMemo(() => {
    return activeAdmissions.map((adm) => {
      const patient = patients.find(p => p.id === adm.patientId);
      const matchesSearch = patient?.name.toLowerCase().includes(telemetrySearch.toLowerCase()) || 
                            adm.bedNumber.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
                            adm.ward.toLowerCase().includes(telemetrySearch.toLowerCase());
      
      // Get latest vital sign from store
      const baseVital = vitals.find(v => v.patientId === adm.patientId) || {
        heartRate: 75,
        bloodPressure: "120/80",
        spO2: 97,
        temperature: 36.8,
        respiratoryRate: 16,
        isAnomaly: false,
        anomalyReason: "",
        timestamp: new Date().toISOString()
      };

      // Apply dynamic slight ticker fluctuations to make the telemetry active & detailed
      const randomSeed = (ticks + parseInt(adm.id.replace(/\D/g, "") || "0")) % 5 - 2; // -2 to +2
      const simulatedHR = Math.max(45, Math.min(160, baseVital.heartRate + randomSeed));
      const simulatedSpO2 = Math.max(88, Math.min(100, baseVital.spO2 + (randomSeed > 1 ? -1 : 0)));
      
      const isCritical = simulatedHR > 120 || simulatedHR < 50 || simulatedSpO2 < 93 || baseVital.isAnomaly;
      const isSilenced = silencedAlarms.includes(adm.id);

      return {
        ...adm,
        patientName: patient?.name || adm.patientName,
        uhid: patient?.uhid || "UHID-PENDING",
        hr: simulatedHR,
        spo2: simulatedSpO2,
        bp: baseVital.bloodPressure,
        temp: baseVital.temperature,
        rr: baseVital.respiratoryRate,
        isCritical,
        isSilenced,
        originalAnomalyReason: baseVital.anomalyReason || (simulatedHR > 120 ? "Tachycardia Spike" : simulatedSpO2 < 93 ? "Hypoxic Dip" : ""),
        matchesSearch
      };
    });
  }, [activeAdmissions, patients, vitals, ticks, telemetrySearch, silencedAlarms]);

  const filteredSimulatedAdmissions = useMemo(() => {
    return simulatedActiveAdmissions.filter(d => {
      if (!d.matchesSearch) return false;
      if (telemetryFilter === "anomalies" && !d.isCritical) return false;
      return true;
    });
  }, [simulatedActiveAdmissions, telemetryFilter]);

  const toggleSilenceAlarm = (admId: string) => {
    if (silencedAlarms.includes(admId)) {
      setSilencedAlarms(prev => prev.filter(id => id !== admId));
    } else {
      setSilencedAlarms(prev => [...prev, admId]);
      createLog(
        "Telemetry Desk",
        "Clinical Officer",
        "Acknowledge Critical Telemetry Alarm",
        "Live Telemetry",
        `Silence audible vital sign alarm for Admission reference ${admId}. Monitoring continues.`
      );
    }
  };

  // --- RENDERING ROUTE CONDITIONAL ---
  if (activeSubTab === "vitals") {
    // ----------------------------------------------------
    // LIVE TELEMETRY FEED VIEW (Distinct & Extremely Detailed)
    // ----------------------------------------------------
    return (
      <div className="space-y-6 animate-fadeIn text-left">
        {/* Banner with status */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 relative overflow-hidden" id="telemetry_desk_banner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-red-500/25 border border-red-500/20 text-red-300 text-[10px] font-mono font-bold uppercase rounded-full">
                <Heart className="w-3 h-3 text-red-500 animate-ping" /> Real-time Telemetry Pipeline Active
              </span>
              <h1 className="text-2xl font-sans font-medium tracking-tight text-slate-105 text-slate-100">
                EHR Biometric Telemetry & Critical Alarm Station
              </h1>
              <p className="text-slate-405 text-slate-400 text-xs">
                Direct diagnostic feed integrations synced from bedside monitoring hardware in ICU, Emergency, and Step-down units. Tracks ongoing cardiovascular rhythms, respiration ratios, and instant trigger safeguards.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0 font-mono text-center">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl min-w-[120px]">
                <span className="text-[10px] text-slate-500 block">SYSTEM STATUS</span>
                <span className="text-xs font-bold text-emerald-400">● AUDITED</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl min-w-[120px]">
                <span className="text-[10px] text-slate-500 block">ALARM TRIPPED</span>
                <span className={`text-xs font-bold ${criticalVitals.length > 0 ? "text-red-500 animate-pulse" : "text-slate-400"}`}>
                  {criticalVitals.length > 0 ? `[ ${criticalVitals.length} ACTIVE ]` : "NONE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Critical Alarm Standard Threshold Guidelines Box */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-700 rounded-lg shrink-0">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-amber-900 block font-sans">Automated Telemetry Safe Range Guardrails (HIMS Config)</span>
            <p className="text-slate-600 mt-0.5 max-w-4xl">
              Bedside vital logs are verified under strict HIMS safety checks: <strong className="text-slate-800">HR: 50–120 bpm</strong>, <strong className="text-slate-800">SpO2: &gt;93%</strong>, <strong className="text-slate-800">Temp: &lt;38.3 °C (101 °F)</strong>, <strong className="text-slate-800">Respiratory Rate: 12–24/min</strong>. Deviations automatically inject Red-flag Alerts to dashboards and Nurse Station briefing files.
            </p>
          </div>
        </div>

        {/* Main Grid: Left is active patient panels, Right is Recording Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Central Monitor Board */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-xs">
            
            {/* Header filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 font-sans">Current Bedside Feeds Map</h3>
                <p className="text-xs text-slate-400">Dynamic vital records mapping of active ward beds.</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {/* Search */}
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={telemetrySearch}
                    onChange={(e) => setTelemetrySearch(e.target.value)}
                    placeholder="Search bed, name..."
                    className="pl-8 pr-3 py-1.5 w-44 text-xs font-sans rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
                {/* Switcher */}
                <select
                  value={telemetryFilter}
                  onChange={(e: any) => setTelemetryFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-white"
                >
                  <option value="all">All Beds</option>
                  <option value="anomalies">Anomalous Only</option>
                </select>
              </div>
            </div>

            {/* Simulated Live Patient Grid */}
            {filteredSimulatedAdmissions.length === 0 ? (
              <div className="py-24 text-center text-slate-400 text-xs">
                No active bedside telemetry feeds found matching filters. Ensure patients are registered and admitted in IPD.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSimulatedAdmissions.map((adm) => {
                  return (
                    <div 
                      key={adm.id} 
                      className={`relative border rounded-xl overflow-hidden shadow-xs transition-all duration-200 ${
                        adm.isCritical 
                          ? (adm.isSilenced 
                              ? "bg-amber-50/15 border-amber-300" 
                              : "bg-red-50/20 border-red-400 ring-2 ring-red-500/10")
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      {/* Critical alert bar */}
                      {adm.isCritical && (
                        <div className={`py-1 px-3 text-[10px] font-mono font-bold flex justify-between items-center ${
                          adm.isSilenced ? "bg-amber-100 text-amber-800" : "bg-red-500 text-white animate-pulse"
                        }`}>
                          <span className="flex items-center gap-1 uppercase">
                            <AlertTriangle className="w-3 h-3" />
                            {adm.isSilenced ? "Alarm Muted" : "Critical Arryhthmia / Anomaly"}
                          </span>
                          <button 
                            onClick={() => toggleSilenceAlarm(adm.id)} 
                            className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[9px] hover:text-white"
                          >
                            {adm.isSilenced ? "Unmute Alarm" : "Silence Alarm"}
                          </button>
                        </div>
                      )}

                      {/* Card Content body */}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold leading-none ${adm.isCritical ? "text-slate-900" : "text-emerald-400"}`}>
                                {adm.patientName}
                              </span>
                              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                {adm.bedNumber}
                              </span>
                            </div>
                            <span className={`text-[10px] block mt-1 ${adm.isCritical ? "text-slate-500" : "text-slate-400"}`}>
                              {adm.ward} • UHID: {adm.uhid}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[10px] font-mono block ${adm.isCritical ? "text-slate-500" : "text-slate-500"}`}>
                              SAGE CODE: GL-4300
                            </span>
                            {adm.isCritical && (
                              <span className="text-[9px] font-mono text-red-600 block font-bold leading-tight uppercase mt-0.5">
                                {adm.originalAnomalyReason || "Anomaly Alert"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Scrolling EEG Waveform Simulation (SVG) */}
                        <div className="h-10 bg-black/90 border border-slate-800 rounded-lg p-1 overflow-hidden relative flex items-center">
                          <svg className="w-full h-full text-emerald-500 stroke-current opacity-75" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path 
                              d="M 0 10 L 15 10 L 18 10 L 22 2 L 25 18 L 28 10 L 40 10 L 42 10 L 45 4 L 47 16 L 49 10 L 60 10 L 65 10 L 68 2 L 72 18 L 75 10 L 85 10 L 87 6 L 89 14 L 91 10 L 100 10" 
                              fill="none" 
                              strokeWidth="1" 
                              strokeDasharray="100" 
                              strokeDashoffset={ticks * 10 % 100}
                              className="transition-all duration-1000 ease-linear"
                            />
                          </svg>
                          <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500 tracking-wider">LIVE SWEEP 25mm/s</span>
                        </div>

                        {/* Vital Grid Readings */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          {/* Heart rate */}
                          <div className={`p-1.5 rounded-lg border ${
                            adm.hr > 120 || adm.hr < 55 
                              ? "bg-red-500/10 border-red-200 text-red-600 font-bold animate-pulse" 
                              : "bg-slate-900 border-slate-800 text-emerald-400"
                          }`}>
                            <span className="text-[9px] block text-slate-500 uppercase font-sans font-medium">Pulse RATE</span>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <Heart className="w-3 h-3 text-red-500 fill-current animate-ping" />
                              <span className="text-sm font-semibold font-mono">{adm.hr}</span>
                            </div>
                          </div>

                          {/* SpO2 */}
                          <div className={`p-1.5 rounded-lg border ${
                            adm.spo2 < 93 
                              ? "bg-red-500/10 border-red-200 text-red-600 font-bold animate-pulse" 
                              : "bg-slate-900 border-slate-800 text-emerald-400"
                          }`}>
                            <span className="text-[9px] block text-slate-500 uppercase font-sans font-medium">Oxy SpO2</span>
                            <div className="text-sm font-semibold font-mono mt-0.5">
                              {adm.spo2}%
                            </div>
                          </div>

                          {/* BP */}
                          <div className="p-1.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-300">
                            <span className="text-[9px] block text-slate-500 uppercase font-sans font-medium">BP NIBP</span>
                            <div className="text-xs font-semibold font-mono mt-0.5">
                              {adm.bp}
                            </div>
                          </div>
                        </div>

                        {/* Secondary vitals line */}
                        <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                            <span>TEMP: {adm.temp}°C</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Wind className="w-3.5 h-3.5 text-cyan-400" />
                            <span>RESP RATE: {adm.rr} rpm</span>
                          </span>
                        </div>

                        {/* View record trigger */}
                        <div className="pt-2.5 border-t border-slate-100/10 flex justify-end">
                          <button
                            onClick={() => handleViewPatient(adm.patientId)}
                            className={`text-[10px] font-bold flex items-center gap-1 ${
                              adm.isCritical ? "text-slate-800 hover:text-slate-950" : "text-emerald-405 text-emerald-500 hover:text-emerald-400"
                            }`}
                          >
                            <span>Open 360° Charts</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Record Biometrics Intake Form */}
          <div className="space-y-6">
            
            {/* New vitals record form */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">Desk Telemetry Intake Logger</h4>
              </div>

              {activeAdmissions.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  All beds vacant. No active patients are currently inside wards to record biometric logs.
                </div>
              ) : (
                <form onSubmit={submitVitalsIntake} className="space-y-4 text-xs text-slate-700">
                  {/* Selected Admitted Patient */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Select Active Inpatient Ward Patient</label>
                    <select
                      value={selectedInpatientId}
                      onChange={(e) => setSelectedInpatientId(e.target.value)}
                      className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-sans"
                    >
                      {activeAdmissions.map((adm) => {
                        const pat = patients.find(p => p.id === adm.patientId);
                        return (
                          <option key={adm.id} value={adm.patientId}>
                            {pat?.name} ({adm.bedNumber} - {adm.ward})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Heart rate slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="font-bold text-slate-700">Heart Rate (bpm)</span>
                      <span className={`font-mono font-bold ${logHeartRate > 120 || logHeartRate < 50 ? "text-red-500" : "text-emerald-600"}`}>
                        {logHeartRate} Pulse
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={logHeartRate}
                      onChange={(e) => setLogHeartRate(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Oxy SPO2 slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="font-bold text-slate-700">Oxygen Saturation (SpO2 %)</span>
                      <span className={`font-mono font-bold ${logSpO2 < 93 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                        {logSpO2}% Oxygen
                      </span>
                    </div>
                    <input
                      type="range"
                      min="85"
                      max="100"
                      value={logSpO2}
                      onChange={(e) => setLogSpO2(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* BP text entry */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Blood Pressure (Systolic/Diastolic)</label>
                    <input
                      type="text"
                      value={logBloodPressure}
                      onChange={(e) => setLogBloodPressure(e.target.value)}
                      className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      placeholder="e.g. 120/80"
                    />
                  </div>

                  {/* Temp and Resp Rate Dual column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="34"
                        max="43"
                        value={logTemp}
                        onChange={(e) => setLogTemp(parseFloat(e.target.value))}
                        className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">Resp Rate (/min)</label>
                      <input
                        type="number"
                        min="8"
                        max="35"
                        value={logRespRate}
                        onChange={(e) => setLogRespRate(parseInt(e.target.value))}
                        className="w-full text-xs font-mono py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Live Feedback Analyzer Guard */}
                  <div className={`p-3 rounded-lg border text-[11px] ${
                    computedAnomaly.isAnomaly 
                      ? "bg-red-50 border-red-150 text-red-800" 
                      : "bg-emerald-50 border-emerald-150 text-emerald-800"
                  }`}>
                    <strong>Safeguard Status Check:</strong>
                    <div className="mt-1">
                      {computedAnomaly.isAnomaly ? (
                        <span>⚠️ CRITICAL DEVIATION: {computedAnomaly.reason}</span>
                      ) : (
                        <span>✓ HEALTHY RANGE: Biometric indicators within safety limits.</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 font-bold rounded-lg cursor-pointer transition-all text-xs flex justify-center gap-2 items-center"
                    id="btn_submit_manul_vitals"
                  >
                    <span>Record & Update Ward Telemetry</span>
                  </button>
                </form>
              )}
            </div>

            {/* Simulated telemetry audits */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">Recent Alarms Registry</h4>
                <p className="text-xs text-slate-500">Historical trail of biometric threshold alarm flags generated.</p>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                {criticalVitals.slice(0, 4).map((v) => {
                  const patObj = patients.find(p => p.id === v.patientId);
                  return (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 text-slate-700">
                      <div className="p-1 px-1.5 bg-red-100 text-red-700 text-[9px] font-bold rounded shrink-0">
                        ALARM
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono font-bold text-slate-900">
                          <span>{patObj?.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{new Date(v.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans">{v.anomalyReason}</p>
                        <div className="text-[9px] text-slate-400">Recorded by: {v.recordedBy}</div>
                      </div>
                    </div>
                  );
                })}

                {criticalVitals.length === 0 && (
                  <div className="text-center py-6 text-slate-400 font-sans text-xs">
                    Clear history. No alerts registered.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === "support") {
    // Collect tickets for this tenant or general staff workspace
    const hospitalName = store.hospitalProfile?.name || "Metro General Hospital Corp";
    const userTickets = store.supportTickets.filter((t) => {
      const tNameMatch = t.tenantName?.toLowerCase() === hospitalName.toLowerCase();
      const empMatch = t.employeeName && currentUser && t.employeeName.toLowerCase() === currentUser.name.toLowerCase();
      return tNameMatch || empMatch;
    });

    const filteredTickets = userTickets.filter((t) => {
      if (!ticketSearch) return true;
      const search = ticketSearch.toLowerCase();
      return (
        t.subject.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search)
      );
    });

    const selectedTicket = store.supportTickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

    const handleSubmitTicket = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

      const raised = store.raiseSupportTicket({
        tenantName: hospitalName,
        category: newTicket.category,
        subject: newTicket.subject,
        priority: newTicket.priority,
        message: newTicket.message,
        employeeName: newTicket.employeeName,
        employeeEmail: newTicket.employeeEmail,
      });

      if (raised && raised.id) {
        setSelectedTicketId(raised.id);
      }
      
      setNewTicket({
        category: "General Bug",
        subject: "",
        priority: "Medium",
        message: "",
        employeeName: currentUser?.name || "Dr. Rajesh Kumar",
        employeeEmail: "rajesh@metrogeneral.com"
      });
      setShowRaiseTicketModal(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    };

    return (
      <div className="space-y-6 animate-fadeIn text-left">
        {/* Banner with status */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 relative overflow-hidden" id="support_desk_portal_banner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase rounded-full">
                <HelpCircle className="w-3 h-3 text-indigo-400" /> Platinum Technical SLA Support Active
              </span>
              <h1 className="text-2xl font-sans font-medium tracking-tight text-slate-100">
                Hospital Staff Help Desk & Support Portal
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                Direct communication channel to the SaaS core engineering team. Submit issues about EMR systems, Pathology LIS connections, HIPAA compliance parameters, or billing gateways.
              </p>
            </div>

            <button
              onClick={() => setShowRaiseTicketModal(true)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-sans tracking-tight rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              id="btn_raise_incident"
            >
              <Plus className="w-4 h-4" /> Raise Support Incident
            </button>
          </div>
        </div>

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 shadow-sm text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <strong className="font-bold block">Incident Successfully Registered</strong>
              SLA tracking commenced. Designated specialist team alerted.
            </div>
          </div>
        )}

        {/* Splitscreen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Ticket Queue */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Submitted Tickets</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  {userTickets.length} Total
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Ticket List Queue */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filteredTickets.map((t) => {
                  const isActive = selectedTicket?.id === t.id;
                  
                  const priorityColors = {
                    Urgent: "bg-red-50 text-red-650 border-red-200 text-red-600",
                    High: "bg-amber-50 text-amber-650 border-amber-200 text-amber-600",
                    Medium: "bg-indigo-50 text-indigo-650 border-indigo-200 text-indigo-600",
                    Low: "bg-slate-50 text-slate-600 border-slate-200 text-slate-500"
                  };
                  
                  const statusColors = {
                    Open: "bg-slate-100 text-slate-800 border-slate-250 text-slate-600",
                    Assigned: "bg-blue-50 text-blue-850 border-blue-200 text-blue-650",
                    Resolving: "bg-orange-50 text-orange-850 border-orange-200 text-orange-600",
                    Closed: "bg-emerald-50 text-emerald-850 border-emerald-250 text-emerald-600"
                  };

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer ${
                        isActive
                          ? "bg-slate-50 border-slate-300 shadow-sm"
                          : "bg-white hover:bg-slate-50/50 border-slate-150"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {t.subject}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          #{t.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-150">
                          {t.category}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border ${priorityColors[t.priority] || "bg-slate-100 text-slate-750 border-slate-205"}`}>
                          {t.priority}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border ${statusColors[t.status] || "bg-slate-100 text-slate-750 border-slate-205"}`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-100 mt-1">
                        <span className="truncate">By: {t.employeeName || "Hospital Staff"}</span>
                        <span>{t.status === "Closed" ? "Resolved" : `${t.slaMinutesRemaining ?? 45}m SLA`}</span>
                      </div>
                    </button>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12 text-slate-400 font-sans text-xs">
                    No matching support tickets found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Ticket Details & Workspace */}
          <div className="lg:col-span-8">
            {selectedTicket ? (
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col min-h-[480px]">
                {/* Selected Title Bar */}
                <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase">
                        #{selectedTicket.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(selectedTicket.createdTime).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="text-md sm:text-lg font-bold text-slate-900 leading-tight">
                      {selectedTicket.subject}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-200 font-mono font-extrabold uppercase">
                      STATUS: {selectedTicket.status}
                    </span>
                  </div>
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50/50 border-b border-slate-150 p-4 text-xs">
                  <div className="p-2 border-r border-slate-150/40">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase font-bold">Category</span>
                    <strong className="text-slate-700 font-semibold">{selectedTicket.category}</strong>
                  </div>
                  <div className="p-2 border-r border-slate-150/40">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase font-bold">Priority</span>
                    <strong className="text-slate-800 font-semibold">{selectedTicket.priority}</strong>
                  </div>
                  <div className="p-2 border-r border-slate-150/40">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase font-bold">Technical Lead</span>
                    <strong className="text-indigo-600 font-semibold">{selectedTicket.assignedEngineer || "Unassigned Specialist"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase font-bold">SLA Guarantee</span>
                    <strong className="text-slate-800 font-mono font-bold">
                      {selectedTicket.status === "Closed" ? (
                        <span className="text-emerald-600">Satisfied</span>
                      ) : (
                        `${selectedTicket.slaMinutesRemaining ?? 180} mins`
                      )}
                    </strong>
                  </div>
                </div>

                {/* SLA Milestones Live Tracker */}
                <div className="p-5 border-b border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-3">
                    SLA Live Execution Diagnostics
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-slate-800">Registered</span>
                        <span className="text-[9px] text-slate-400">Portal received</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                      {selectedTicket.assignedEngineer ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-indigo-500 animate-pulse shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-800">Dispatched</span>
                        <span className="text-[9px] text-slate-400 truncate block max-w-[110px]">
                          {selectedTicket.assignedEngineer ? "Engineer assigned" : "Routing queues..."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                      {selectedTicket.status === "Resolving" || selectedTicket.status === "Closed" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : selectedTicket.assignedEngineer ? (
                        <Activity className="w-4 h-4 text-amber-550 text-amber-600 animate-pulse shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-800">Diagnosis</span>
                        <span className="text-[9px] text-slate-400">Telemetry scan active</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                      {selectedTicket.status === "Closed" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-800">Resolved</span>
                        <span className="text-[9px] text-slate-400">Gateways validated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication History Scroll */}
                <div className="flex-1 p-6 space-y-4 max-h-[300px] overflow-y-auto bg-slate-50/20">
                  {/* Original message */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-105 text-indigo-600 rounded-lg shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-baseline justify-between text-[10px]">
                        <span className="font-bold text-slate-700">{selectedTicket.employeeName || "Hospital Staff"}</span>
                        <span className="text-slate-400 font-mono">Original Message</span>
                      </div>
                      <div className="p-3.5 bg-white border border-slate-150 rounded-xl text-slate-700 leading-relaxed max-w-[90%] font-normal text-xs">
                        {selectedTicket.message}
                      </div>
                    </div>
                  </div>

                  {/* Simulated reply */}
                  {selectedTicket.assignedEngineer && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-baseline justify-between text-[10px]">
                          <span className="font-bold text-slate-700">{selectedTicket.assignedEngineer}</span>
                          <span className="text-slate-400 font-mono">Lead Engineer</span>
                        </div>
                        <div className="p-3.5 bg-white border border-emerald-100 shadow-sm rounded-xl text-slate-750 leading-relaxed max-w-[90%] font-normal text-xs">
                          {selectedTicket.status === "Closed" ? (
                            <span>
                              Our technical lead has validated this incident. We have recycled the active cache systems on our Cloud Run clusters and verified that the EMR diagnostics handshake completes in &lt;120ms. Please rate this resolution below.
                            </span>
                          ) : (
                            <span>
                              Hello, I have initiated an active telemetry diagnostics log scan on your local database adapters. We are analyzing the request latency and will keep this ticket updated closely. Let us know if you have additional logs to add.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User follow-up chat messages */}
                  {ticketChatLogs[selectedTicket.id]?.map((msg, idx) => {
                    const isStaff = msg.sender !== selectedTicket.assignedEngineer;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${isStaff ? "bg-slate-100 text-slate-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
                          {isStaff ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-baseline justify-between text-[10px]">
                            <span className="font-bold text-slate-700">{msg.sender}</span>
                            <span className="text-slate-400 font-mono">{msg.time}</span>
                          </div>
                          <div className="p-3 bg-white border border-slate-150 rounded-xl text-slate-750 leading-relaxed max-w-[90%] font-normal text-xs">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Input / Star Rating area */}
                <div className="p-4 bg-white border-t border-slate-150 rounded-b-2xl">
                  {selectedTicket.status === "Closed" ? (
                    <div className="text-center p-4 bg-slate-50 border border-dashed border-slate-205 rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold tracking-wide uppercase">
                          Incident Resolved & Closed
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 mt-2 max-w-sm mx-auto">
                          How would you rate the speed and execution of this SLA resolution?
                        </h3>
                      </div>
                      
                      {/* Interactive Stars */}
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const currentScore = selectedTicket.csatScore || 0;
                          const fillGold = csatStarHover !== null ? starValue <= csatStarHover : starValue <= currentScore;
                          return (
                            <button
                              key={starValue}
                              onMouseEnter={() => setCsatStarHover(starValue)}
                              onMouseLeave={() => setCsatStarHover(null)}
                              onClick={() => {
                                store.updateSupportTicket(selectedTicket.id, { csatScore: starValue });
                              }}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                              title={`Rate ${starValue} Stars`}
                            >
                              <Star className={`w-6 h-6 stroke-[2] ${fillGold ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        {selectedTicket.csatScore ? (
                          <span>Thanks for your rating: <strong className="text-amber-500 font-extrabold">{selectedTicket.csatScore}/5 Stars</strong>. Handshake logged.</span>
                        ) : (
                          <span>Hover and select stars to log CSAT performance metrics.</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Provide details or logs directly to the technical team..."
                        className="flex-1 bg-slate-50 border border-slate-150 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendReply(selectedTicket.id);
                        }}
                      />
                      <button
                        onClick={() => handleSendReply(selectedTicket.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg p-2 px-4 text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                      >
                        <span>Send Note</span> <Send className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-400 min-h-[480px] flex flex-col items-center justify-center space-y-4 shadow-sm">
                <HelpCircle className="w-12 h-12 text-slate-205" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Help Desk Workspace Empty</h3>
                  <p className="text-xs max-w-sm font-sans">
                    Submit a support ticket or choose an existing incident on the left queue to check real-time SLA metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Raise Incident modal dialog */}
        {showRaiseTicketModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn text-slate-800">
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span className="font-sans font-medium text-xs font-bold uppercase tracking-wider">Raise Technical incident</span>
                </div>
                <button
                  onClick={() => setShowRaiseTicketModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-450 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitTicket} className="p-6 space-y-4 text-left">
                {/* Subject */}
                <div className="space-y-1 text-xs">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Problem Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide a quick summary of the technical incident..."
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-normal"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Subsystem Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-normal text-xs text-slate-800"
                    >
                      <option value="General Bug">General Bug (Diagnostic UI)</option>
                      <option value="Billing">Billing gateway (TPA checks)</option>
                      <option value="LIS Connection">Pathology LIS Connection</option>
                      <option value="HIPAA Compliance">HIPAA encryption audit</option>
                      <option value="EMR Crash">EMR server failures</option>
                      <option value="Access Key Issues">Access & RBAC credentials</option>
                      <option value="Service Offline">Clinical systems latency</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Severity Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-normal text-xs text-slate-800"
                    >
                      <option value="Low">Low (Inquiry)</option>
                      <option value="Medium">Medium (Operational sluggishness)</option>
                      <option value="High">High (Subsystem block)</option>
                      <option value="Urgent">Urgent (Clinical platform outage)</option>
                    </select>
                  </div>
                </div>

                {/* Reporter Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Reporter Staff member</label>
                    <input
                      type="text"
                      disabled
                      value={newTicket.employeeName}
                      className="w-full bg-slate-100 border border-slate-200 p-2 rounded-lg text-slate-500 cursor-not-allowed font-medium text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Alert Email Address</label>
                    <input
                      type="email"
                      required
                      value={newTicket.employeeEmail}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, employeeEmail: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1 text-xs">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Full Explanation & Logs</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Verify step-by-step commands or actions that triggered the error..."
                    value={newTicket.message}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-slate-55 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-550 focus:border-indigo-500 focus:bg-white text-xs font-normal"
                  />
                </div>

                {/* Modal footer actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setShowRaiseTicketModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm font-sans"
                  >
                    Register Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / HIMS Welcome */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 relative overflow-hidden" id="dashboard_banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl text-left">
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
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 animate-fadeIn">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-700 text-xs text-left">
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

            <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-xl space-y-2 mt-2 text-left">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn" id="dashboard_kpi_grid">
        {/* Card 1: Critical Telemetry */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200 text-left">
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
                onClick={() => {
                  // Direct navigation to the specific vitals subtab inside Operations Hub
                  setActiveTab("dashboard");
                  // Just trigger vitals tab
                }}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                id="btn_telemetry_nav"
              >
                <span>Telemetry View</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Bed Resource Cap */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200 text-left">
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
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200 text-left">
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
        <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-sm transition-all duration-200 text-left">
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
        <div className="bg-white border border-slate-100 rounded-xl p-6 lg:col-span-2 space-y-6 text-left">
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
                    <div className="w-full flex bg-slate-200 h-6 rounded overflow-hidden col-span-3">
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

          {/* Revenue Sparkline Recharts Chart */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Cumulative Revenue Stream</h4>
                <p className="text-xs text-slate-400">Total settled patient collections out of outstanding billing</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-lg font-medium text-slate-800">${totalPaidBilling.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400">Collected settled (Last 7 Days)</p>
              </div>
            </div>

            <div className="h-56 bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-sm relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} 
                    labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ color: "#38bdf8", fontSize: "11px" }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={28} 
                    iconType="circle" 
                    iconSize={6}
                    wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", color: "#94a3b8" }}
                  />
                  <Line 
                    name="Paid" 
                    type="monotone" 
                    dataKey="Paid" 
                    stroke="#14b8a6" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, strokeWidth: 1 }} 
                    activeDot={{ r: 5 }} 
                  />
                  <Line 
                    name="Outstanding" 
                    type="monotone" 
                    dataKey="Outstanding" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={{ r: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Anomaly Feed & Administrative Log sidebar */}
        <div className="space-y-6 text-left">
          {/* Section A: Live Anomaly Alerts */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
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
                        <span className="text-red-800 font-bold">{pat?.name || "Patient"}</span>
                        <span className="text-[10px] text-red-500 font-mono">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-650 leading-normal">{v.anomalyReason}</p>
                      <div className="flex gap-3 text-[10px] text-slate-405 pt-1 font-mono">
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
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-800">System Activity Trail</h3>
              <button
                onClick={() => setActiveTab("admin")}
                className="text-[10px] text-slate-400 hover:text-emerald-600 font-mono"
              >
                Audits & RBAC
              </button>
            </div>
            <div className="space-y-3 text-xs max-h-[240px] overflow-y-auto pr-1 font-mono text-slate-705">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                    <span>{log.user} ({log.role})</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">
                    <span className="text-indigo-650 font-bold">{log.action}:</span> {log.details}
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
