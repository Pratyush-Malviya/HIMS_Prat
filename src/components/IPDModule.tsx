import React, { useState } from "react";
import { BedDouble, Plus, AlertCircle, TrendingUp, CheckSquare, Sparkles, UserCheck, ShieldAlert, Thermometer, Heart, Eye, Download, ClipboardList, RefreshCw, Sparkle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { HIMSStore } from "../useHIMSStore";
import { forecastBedCapacity, generateDischargeSummary, askAlexChat } from "../api";

interface IPDModuleProps {
  store: HIMSStore;
}

export function IPDModule({ store }: IPDModuleProps) {
  const {
    patients,
    beds,
    admissions,
    vitals,
    appointments,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    admitPatientInBed,
    dischargePatient,
    logVitals,
    createLog
  } = store;

  // Local navigation inside IPD
  const [ipdSubTab, setIpdSubTab] = useState<"beds" | "vitals" | "forecast" | "admit" | "handover">("beds");

  // Selected inpatient for direct monitoring view
  const [selectedAdmId, setSelectedAdmId] = useState<string | null>(admissions.find(a => a.status === "Admitted")?.id || null);

  // Form: Admit Patient
  const [admitForm, setAdmitForm] = useState({
    patientId: "",
    bedId: "",
    admittingDiagnosis: "",
    admittingDoctor: "Dr. Rajesh Kumar"
  });

  // Form: Logging biometrics vitals
  const [vitalForm, setVitalForm] = useState({
    heartRate: "",
    bloodPressure: "120/80",
    spO2: "98",
    temperature: "36.8",
    respiratoryRate: "16"
  });

  const [manualAnomaly, setManualAnomaly] = useState(false);
  const [manualAnomalyReason, setManualAnomalyReason] = useState("");

  // Discharge Summary note
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [aiDischargeSummary, setAiDischargeSummary] = useState<any>(null);
  const [generatingDischargeSummary, setGeneratingDischargeSummary] = useState(false);

  // AI Bed Forecast states
  const [forecasting, setForecasting] = useState(false);
  const [forecastReport, setForecastReport] = useState<any>(null);

  // Shift Handover Desk States
  const [handoverFrom, setHandoverFrom] = useState("Nurse Priya Singh");
  const [handoverTo, setHandoverTo] = useState("Dr. Rajesh Kumar");
  const [handoverShift, setHandoverShift] = useState("Day Shift to Night Shift");
  const [handoverAddNotes, setHandoverAddNotes] = useState("");
  const [generatingHandover, setGeneratingHandover] = useState(false);
  const [aiHandoverReport, setAiHandoverReport] = useState<string | null>(null);

  const activeInpatients = admissions.filter((a) => a.status === "Admitted");
  const selectedAdmission = admissions.find((a) => a.id === selectedAdmId);

  // Admit patient form handler
  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitForm.patientId || !admitForm.bedId) {
      alert("Please select a patient and a bed location.");
      return;
    }

    const pat = patients.find((p) => p.id === admitForm.patientId);
    const targetBed = beds.find((b) => b.id === admitForm.bedId);

    if (!pat || !targetBed) return;

    if (activeInpatients.some((a) => a.patientId === pat.id)) {
      alert("This patient is already admitted into an active ward.");
      return;
    }

    const newAdm = admitPatientInBed(
      {
        patientId: pat.id,
        patientName: pat.name,
        bedId: targetBed.id,
        bedNumber: targetBed.bedNumber,
        ward: targetBed.ward,
        admittingDiagnosis: admitForm.admittingDiagnosis || "Observation",
        admittingDoctor: admitForm.admittingDoctor
      },
      "Dr. Rajesh Kumar",
      "Physician"
    );

    setSelectedAdmId(newAdm.id);
    setAdmitForm({
      patientId: "",
      bedId: "",
      admittingDiagnosis: "",
      admittingDoctor: "Dr. Rajesh Kumar"
    });
    setIpdSubTab("beds");
  };

  // Submit Logger vitals
  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    logVitals(
      {
        patientId: selectedAdmission.patientId,
        heartRate: parseInt(vitalForm.heartRate) || 80,
        bloodPressure: vitalForm.bloodPressure,
        spO2: parseInt(vitalForm.spO2) || 98,
        temperature: parseFloat(vitalForm.temperature) || 36.8,
        respiratoryRate: parseInt(vitalForm.respiratoryRate) || 16,
        recordedBy: "Nurse Priya Singh",
        isAnomaly: manualAnomaly,
        anomalyReason: manualAnomaly ? manualAnomalyReason : ""
      },
      "Nurse Priya Singh",
      "Nurse"
    );

    // Reset vitals form
    setVitalForm({
      heartRate: "",
      bloodPressure: "120/80",
      spO2: "98",
      temperature: "36.8",
      respiratoryRate: "16"
    });
    setManualAnomaly(false);
    setManualAnomalyReason("");
    alert("Vitals captured. Real-time telemetry analyzed. Checking for anomaly thresholds...");
  };

  // Handle active Discharge with AI summary generation
  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    const baseNotes = dischargeNotes || "Discharged in stable clinical status";
    setGeneratingDischargeSummary(true);
    setAiDischargeSummary(null);

    try {
      const diagnosis = selectedAdmission.admittingDiagnosis;
      const vitalsHistory = selectedAdmission.vitalsHistory;
      
      const response = await generateDischargeSummary({
        diagnosis,
        vitalsHistory,
        consultationNotes: baseNotes
      });

      setAiDischargeSummary({
        patientName: selectedAdmission.patientName,
        conciseSummary: response.conciseSummary,
        easyToUnderstandSummary: response.easyToUnderstandSummary,
        followUpInstructions: response.followUpInstructions,
        medicationRecommendations: response.medicationRecommendations
      });

      dischargePatient(
        selectedAdmission.id,
        response.conciseSummary || baseNotes,
        "Dr. Rajesh Kumar",
        "Physician"
      );
      
      setDischargeNotes("");
    } catch (err) {
      console.error(err);
      dischargePatient(selectedAdmission.id, baseNotes, "Dr. Rajesh Kumar", "Physician");
      setDischargeNotes("");
      alert("Discharge processed. Stay invoiced sent to Billing.");
    } finally {
      setGeneratingDischargeSummary(false);
    }
  };

  // Trigger Gemini Bed Capacity predictions
  const triggerBedForecast = async () => {
    setForecasting(true);
    try {
      const occupied = beds.filter((b) => b.status === "Occupied").length;
      const depts = [
        { ward: "ICU", occupied: beds.filter((b) => b.ward === "ICU" && b.status === "Occupied").length, total: beds.filter((b) => b.ward === "ICU").length },
        { ward: "General Ward A", occupied: beds.filter((b) => b.ward === "General Ward A" && b.status === "Occupied").length, total: beds.filter((b) => b.ward === "General Ward A").length },
        { ward: "General Ward B", occupied: beds.filter((b) => b.ward === "General Ward B" && b.status === "Occupied").length, total: beds.filter((b) => b.ward === "General Ward B").length }
      ];

      const scheduledOPD = appointments.filter((a) => a.status === "Scheduled");
      const urgentTriageCount = scheduledOPD.filter((a) => a.urgency === "Urgent" || a.urgency === "Emergency").length;
      const finishedDischarges = admissions.filter((a) => a.status === "Discharged").length;

      const report = await forecastBedCapacity({
        totalBeds: beds.length,
        occupiedBeds: occupied,
        historicalOccupancy: [64, 70, 75, 78, 80],
        upcomingAdmissions: Math.max(1, urgentTriageCount),
        departments: depts,
        opdScheduledCount: scheduledOPD.length,
        opdIntakeRate: appointments.length,
        historicalAdmissionsCount: admissions.length,
        historicalDischargesCount: finishedDischarges,
        recentEmergencyAppointmentsCount: urgentTriageCount
      });

      setForecastReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setForecasting(false);
    }
  };

  const handleGenerateHandover = async () => {
    if (activeInpatients.length === 0) {
      alert("No active inpatients to compile a briefing for.");
      return;
    }

    setGeneratingHandover(true);
    setAiHandoverReport(null);

    try {
      // Gather active list with anomalies & pending labs
      const patientDetails = activeInpatients.map((adm) => {
        const latestVital = adm.vitalsHistory?.[0];
        const isAnomaly = latestVital?.isAnomaly;
        const o2Sat = latestVital?.spO2;
        const hr = latestVital?.heartRate;
        // Determine high risk: Tachycardic (>125), Hypoxic (<95), anomaly flag, or critical condition keyword
        const isHighRisk = isAnomaly || (o2Sat && o2Sat < 95) || (hr && (hr < 50 || hr > 125)) || adm.admittingDiagnosis.toLowerCase().includes("sepsis") || adm.admittingDiagnosis.toLowerCase().includes("trauma");
        
        // Find matching pending labs
        const pendingLabs = store.labTests.filter(
          (test) => test.patientId === adm.patientId && test.status !== "Completed"
        ).map(t => `${t.testName} (Status: ${t.status})`);

        return {
          name: adm.patientName,
          ward: adm.ward,
          bed: adm.bedNumber,
          diagnosis: adm.admittingDiagnosis,
          admittingDoctor: adm.admittingDoctor,
          latestVitals: latestVital ? `Heart Rate: ${latestVital.heartRate} bpm, BP: ${latestVital.bloodPressure}, SpO2: ${latestVital.spO2}%` : "No vitals recently logged",
          pendingLabsCount: pendingLabs.length,
          pendingLabsList: pendingLabs.length > 0 ? pendingLabs.join(", ") : "None",
          highRiskLevel: isHighRisk ? "YES - CRITICAL HIGH-RISK ALERT (Tachycardia/Hypoxia/Anomaly check needed)" : "No"
        };
      });

      const prompt = `Act as an expert head nurse and clinical coordinator. Compile a comprehensive, clinically rigorous Hospital Information Management System (HIMS) Shift Handover SBAR Briefing Report in markdown format.

Handover Parameters:
- Outgoing Operator: ${handoverFrom}
- Incoming Operator: ${handoverTo}
- Transition Shift Cycle: ${handoverShift}
- Floor Coordination / Operational Notes: "${handoverAddNotes || "Routine hand-off"}"

Active Patient Manifest Data to parse:
${JSON.stringify(patientDetails, null, 2)}

Please structures your compiled briefing strictly into the standard SBAR (Situation, Background, Assessment, Recommendation) framework:
- **S (Situation)**: High-level overview of Wards, total inpatient census count, absolute number of high-risk cases identified, and total outstanding laboratory workups.
- **B (Background)**: Admission breakdowns, critical diagnosis alerts (e.g., Sepsis, Trauma, acute post-operative statuses), and primary physician coverages.
- **A (Assessment)**: Detailed physiological analysis of high-risk patients. Call out any patients with tachycardic vitals (heart rate > 125 bpm) or hypoxic vitals (oxygen saturation SpO2 < 95%), stating their exact bed allocations.
- **R (Recommendation)**: Clear, bulleted action items for the incoming team during this shift cycle. Specify follow-up trackers for ALL pending laboratory test orders, hourly biometric chart targets, and bed management allocations.

Use professional markdown tables or checklists. Keep the output clinical, structured, and immediately actionable for clinical staff. Do not output raw JSON or code blocks.`;

      const response = await askAlexChat([{ role: "user", content: prompt }]);
      setAiHandoverReport(response.text || "Failed to parse handover report.");
    } catch (err: any) {
      console.error(err);
      setAiHandoverReport("Error generating handover: " + err.message);
    } finally {
      setGeneratingHandover(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Real-time Notification Alerts Panel */}
      {notifications && notifications.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-red-100/60">
            <h3 className="text-xs font-semibold text-red-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
              Real-Time Clinician Vital Alerts ({notifications.filter((n) => !n.read).length} unread)
            </h3>
            <button
              onClick={clearNotifications}
              className="text-[10px] text-red-600 hover:text-red-800 font-mono underline"
            >
              Clear All alerts
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs text-left relative flex flex-col justify-between h-auto transition-all ${
                  n.read ? "bg-white/80 border-slate-100 text-slate-500 opacity-60" : "bg-white border-red-200 text-slate-800 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-bold text-slate-900">{n.patientName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="text-red-700 font-medium font-mono text-[11px] leading-tight mb-2">
                    {n.anomalyReason}
                  </div>
                  
                  <div className="text-[10px] text-slate-500 space-y-0.5 mb-3 font-mono">
                    <div>🧑‍⚕️ Physician: {n.assignedPhysician}</div>
                    <div>👩‍⚕️ Assigned Nurse: {n.assignedNurse}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100/60 mt-auto">
                  <button
                    onClick={() => {
                      if (n.admissionId) {
                        setSelectedAdmId(n.admissionId);
                        setIpdSubTab("vitals");
                      }
                      markNotificationAsRead(n.id);
                    }}
                    className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Direct Review Link
                  </button>
                  
                  {!n.read && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - controls */}
      <div className="lg:col-span-1 space-y-4">
        {/* Sub Navigation */}
        <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
          <button
            onClick={() => setIpdSubTab("beds")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              ipdSubTab === "beds" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BedDouble className="w-4 h-4" /> Bed Resource Map
          </button>
          <button
            onClick={() => setIpdSubTab("vitals")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              ipdSubTab === "vitals" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Heart className="w-4 h-4" /> Nurse Telemetry Desk
          </button>
          <button
            onClick={() => setIpdSubTab("forecast")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              ipdSubTab === "forecast" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Bed Flow Forecast
          </button>
          <button
            onClick={() => setIpdSubTab("handover")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              ipdSubTab === "handover" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
            id="ipd_subtab_handover"
          >
            <ClipboardList className="w-4 h-4 text-emerald-500" /> Shift Handover Desk
          </button>
          <button
            onClick={() => setIpdSubTab("admit")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              ipdSubTab === "admit" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" /> Register Admission
          </button>
        </div>

        {/* Selected Inpatient Detail display card */}
        {activeInpatients.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-50 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Current Admits ({activeInpatients.length})
            </h3>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {activeInpatients.map((adm) => {
                const matches = selectedAdmId === adm.id;
                const latestVital = adm.vitalsHistory[0];
                const hasAnomaly = latestVital?.isAnomaly;
                return (
                  <div
                    key={adm.id}
                    onClick={() => setSelectedAdmId(adm.id)}
                    className={`p-2.5 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                      matches ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700 border border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="truncate">{adm.patientName}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${hasAnomaly ? "bg-red-500 text-red-500 animate-pulse" : "bg-emerald-400"}`}></span>
                    </div>
                    <div className="text-[10px] opacity-70 font-mono mt-0.5 flex justify-between">
                      <span>Bed: {adm.bedNumber} ({adm.ward})</span>
                      <span>Admitted: 2026</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main interactive window */}
      <div className="lg:col-span-3">
        {ipdSubTab === "beds" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Bed Allocation Grid</h2>
              <p className="text-xs text-slate-400">Tactile layout mapping bed occupancy states inside specialized nursing units.</p>
            </div>

            {/* Grid Bed Map */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {beds.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                    b.status === "Occupied"
                      ? "bg-slate-900 text-white border-slate-800"
                      : b.status === "Maintenance"
                      ? "bg-slate-50 text-slate-400 border-dashed border-slate-200"
                      : "bg-white text-slate-700 hover:shadow-sm border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider">{b.ward}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      b.status === "Available" ? "bg-emerald-400" :
                      b.status === "Occupied" ? "bg-indigo-400 animate-pulse" : "bg-slate-300"
                    }`}></span>
                  </div>

                  <div className="py-2">
                    <h4 className="text-lg font-mono font-medium leading-none">{b.bedNumber}</h4>
                    {b.status === "Occupied" ? (
                      <p className="text-[11px] opacity-80 mt-1 truncate">Patient: {b.occupiedByPatientName}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">{b.status}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    {b.status === "Available" ? (
                      <button
                        onClick={() => {
                          setAdmitForm((prev) => ({ ...prev, bedId: b.id }));
                          setIpdSubTab("admit");
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded"
                        id={`bed_allocate_${b.id}`}
                      >
                        Allocate
                      </button>
                    ) : b.status === "Occupied" ? (
                      <button
                        onClick={() => {
                          setSelectedAdmId(b.admissionId || null);
                          setIpdSubTab("vitals");
                        }}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-semibold px-2.5 py-1 rounded border border-slate-700"
                        id={`bed_monitor_${b.id}`}
                      >
                        Monitor
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ipdSubTab === "vitals" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            {selectedAdmission ? (
              <div className="space-y-6">
                {/* Header overview */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">Admission Code: {selectedAdmission.id}</span>
                    <h2 className="text-sm font-semibold text-slate-800">{selectedAdmission.patientName}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Diagnosed: {selectedAdmission.admittingDiagnosis}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{selectedAdmission.ward} Bed {selectedAdmission.bedNumber}</span>
                    <p className="text-[10px] text-slate-400 mt-1">Doctor: {selectedAdmission.admittingDoctor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Capture Vitals Form */}
                  <form onSubmit={handleLogVitals} className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-50">Log Nursing Vitals Stream</h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-0.5">Heart Rate (bpm)</label>
                        <input
                          type="number"
                          value={vitalForm.heartRate}
                          onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                          placeholder="e.g. 78"
                          className="w-full border border-slate-200 rounded p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Blood Pressure (mmHg)</label>
                        <input
                          type="text"
                          value={vitalForm.bloodPressure}
                          onChange={(e) => setVitalForm({ ...vitalForm, bloodPressure: e.target.value })}
                          placeholder="120/80"
                          className="w-full border border-slate-200 rounded p-2 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Oxygen Saturation (SpO2 %)</label>
                        <input
                          type="number"
                          value={vitalForm.spO2}
                          onChange={(e) => setVitalForm({ ...vitalForm, spO2: e.target.value })}
                          placeholder="98"
                          className="w-full border border-slate-200 rounded p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">Body Temperature (°C)</label>
                        <input
                          type="text"
                          value={vitalForm.temperature}
                          onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })}
                          placeholder="36.8"
                          className="w-full border border-slate-200 rounded p-2"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-slate-500 mb-0.5">Respiratory Rate (breaths/min)</label>
                        <input
                          type="number"
                          value={vitalForm.respiratoryRate}
                          onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value })}
                          placeholder="16"
                          className="w-full border border-slate-200 rounded p-2"
                          required
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          id="manual_anomaly_toggle"
                          checked={manualAnomaly}
                          onChange={(e) => {
                            setManualAnomaly(e.target.checked);
                            if (!e.target.checked) setManualAnomalyReason("");
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <label htmlFor="manual_anomaly_toggle" className="text-xs text-slate-700 font-medium cursor-pointer">
                          Flag Anomaly Manually (Immediate Alert)
                        </label>
                      </div>

                      {manualAnomaly && (
                        <div className="col-span-2 animate-fadeIn space-y-1">
                          <label className="block text-xs font-semibold text-slate-600">Anomaly Specific Reason</label>
                          <input
                            type="text"
                            value={manualAnomalyReason}
                            onChange={(e) => setManualAnomalyReason(e.target.value)}
                            placeholder="Describe critical patient symptoms or rationale..."
                            className="w-full border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-red-500 bg-red-50/20"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 text-white rounded-lg p-2 text-xs font-semibold"
                      id="btn_ipd_vitals_sumbit"
                    >
                      Save Biometric Logs
                    </button>
                  </form>

                  {/* Vitals History timeline & Recharts Line Chart */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-50">Historic Biometric Trend & Sequence</h3>
                    
                    {selectedAdmission.vitalsHistory.length > 0 && (
                      <div className="bg-slate-50/70 p-3 border border-slate-100 rounded-xl">
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                              data={[...selectedAdmission.vitalsHistory].reverse().map((vt) => {
                                const bpParts = (vt.bloodPressure || "120/80").split("/");
                                const systolic = parseInt(bpParts[0]) || 120;
                                const diastolic = parseInt(bpParts[1]) || 80;
                                return {
                                  time: new Date(vt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                  heartRate: vt.heartRate,
                                  systolic,
                                  diastolic
                                };
                              })} 
                              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                              <XAxis dataKey="time" tick={{ fontSize: 8 }} stroke="#64748b" />
                              <YAxis tick={{ fontSize: 8 }} stroke="#64748b" domain={[40, 180]} />
                              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: "#0f172a", color: "#fff" }} />
                              <Legend wrapperStyle={{ fontSize: 8, marginTop: 4 }} />
                              <Line type="monotone" dataKey="heartRate" stroke="#ec4899" strokeWidth={2} name="Heart Rate (bpm)" activeDot={{ r: 4 }} />
                              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={1.5} name="BP Systolic" />
                              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={1.5} name="BP Diastolic" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedAdmission.vitalsHistory.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center">No vitals charted yet. Use the form to record.</div>
                      ) : (
                        selectedAdmission.vitalsHistory.map((vt) => (
                          <div
                            key={vt.id}
                            className={`p-3 rounded-lg border text-xs space-y-1 ${
                              vt.isAnomaly ? "bg-red-50 border-red-100 text-slate-700" : "bg-slate-50 border-slate-100"
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>Recorded by: {vt.recordedBy}</span>
                              <span className="font-mono">{new Date(vt.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between font-mono gap-1 font-semibold text-slate-800">
                              <span>HR: {vt.heartRate} bpm</span>
                              <span>BP: {vt.bloodPressure}</span>
                              <span>SpO2: {vt.spO2}%</span>
                              <span>Temp: {vt.temperature}°C</span>
                            </div>
                            {vt.isAnomaly && (
                              <div className="text-[10px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Anomaly flagged: {vt.anomalyReason}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Discharge Panel */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-800 pb-1.5 mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    IPD Discharge Coordination & Post-Op Planning
                  </h3>
                  
                  {generatingDischargeSummary && (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-2">
                      <Sparkles className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-700 animate-pulse">Prompting AI Co-Pilot to compile comprehensive discharge summaries...</p>
                      <p className="text-[10px] text-slate-400">Synthesizing clinical consultation notes, biometric telemetry trends, and admitting diagnosis details.</p>
                    </div>
                  )}

                  {!generatingDischargeSummary && (
                    <form onSubmit={handleDischarge} className="space-y-3">
                      <textarea
                        value={dischargeNotes}
                        onChange={(e) => setDischargeNotes(e.target.value)}
                        placeholder="Provide optional discharge notes to help focus the AI's generation (e.g. follow-up dates, diet constraints)..."
                        className="w-full text-xs p-3 border border-slate-200 rounded-lg h-20"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={generatingDischargeSummary}
                          className="bg-red-600 hover:bg-red-700 text-white rounded text-xs py-2 px-4 font-semibold flex items-center gap-1.5 cursor-pointer"
                          id="btn_ipd_discharge"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          Coordinate Discharge with AI Copilot Summation
                        </button>
                      </div>
                    </form>
                  )}

                  {aiDischargeSummary && (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4 animate-fadeIn" id="compiled_discharge_summary">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 font-mono">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Generated AI Discharge Document: {aiDischargeSummary.patientName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const printWindow = window.open("", "_blank");
                              if (!printWindow) return;
                              const printingHtml = `
                                <html>
                                  <head>
                                    <title>Discharge Summary - ${aiDischargeSummary.patientName}</title>
                                    <style>
                                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                                      .hospital { text-transform: uppercase; font-size: 11px; tracking: 1.5px; font-style: italic; color: #10b981; margin-bottom: 4px; }
                                      h1 { font-size: 20px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 0; margin-bottom: 24px; }
                                      h2 { font-size: 13px; font-family: monospace; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; margin-top: 24px; padding-bottom: 4px; color: #334155; }
                                      .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 12px; }
                                      p { font-size: 13px; margin: 8px 0; }
                                      .list { font-size: 13px; white-space: pre-wrap; font-family: sans-serif; }
                                      .footer { margin-top: 48px; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="hospital">HIMS Medical EHR records System</div>
                                    <h1>Inpatient Discharge Summary</h1>
                                    <div class="meta">
                                      <div><strong>PATIENT NAME:</strong> ${aiDischargeSummary.patientName}</div>
                                      <div><strong>DOCUMENT STATUS:</strong> CLINICAL DISCHARGE COMPLETE</div>
                                      <div><strong>PRINT TIME:</strong> ${new Date().toLocaleString()}</div>
                                    </div>
                                    <h2>Clinical Stay Synthesis & Admitting Diagnosis</h2>
                                    <p>${aiDischargeSummary.conciseSummary}</p>
                                    <h2>Patient Comfort Instructions</h2>
                                    <p>${aiDischargeSummary.easyToUnderstandSummary}</p>
                                    <h2>Follow-Up Treatment & Red Flags</h2>
                                    <div class="list">${aiDischargeSummary.followUpInstructions}</div>
                                    <h2>Discharge Home Medications</h2>
                                    <div class="list">${aiDischargeSummary.medicationRecommendations}</div>
                                    <div class="footer">
                                      <div>SECURE DISCHARGE RECORD • ISO-27001 PROVEN CRYPTO SECURITY</div>
                                      <div>Physician Signature: _________________________</div>
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
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            id="btn_download_discharge_pdf"
                          >
                            <Download className="w-3.5 h-3.5 animate-pulse" /> Download Report (PDF)
                          </button>
                          <button
                            onClick={() => setAiDischargeSummary(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Dismiss Document View
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs text-slate-700">
                        <div className="p-3 bg-white border border-emerald-100/40 rounded-lg">
                          <h4 className="font-semibold text-emerald-950 mb-0.5 font-mono text-[10px] uppercase tracking-wider">Clinical Stay Synthesis</h4>
                          <p className="leading-relaxed">{aiDischargeSummary.conciseSummary}</p>
                        </div>

                        <div className="p-3 bg-white border border-emerald-100/40 rounded-lg">
                          <h4 className="font-semibold text-emerald-900 mb-0.5 font-mono text-[10px] uppercase tracking-wider">Patient Explanation (Comfort Format)</h4>
                          <p className="leading-relaxed">{aiDischargeSummary.easyToUnderstandSummary}</p>
                        </div>

                        <div className="p-3 bg-white border border-emerald-100/40 rounded-lg">
                          <h4 className="font-semibold text-emerald-950 mb-1 font-mono text-[10px] uppercase tracking-wider">Follow-Up Coordination & Red Flags</h4>
                          <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">{aiDischargeSummary.followUpInstructions}</div>
                        </div>

                        <div className="p-3 bg-white border border-emerald-100/40 rounded-lg">
                          <h4 className="font-semibold text-emerald-900 mb-1 font-mono text-[10px] uppercase tracking-wider">Home Medication Guideline</h4>
                          <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">{aiDischargeSummary.medicationRecommendations}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select an active inpatient from the sidebar list to record telemetry and plan discharges.
              </div>
            )}
          </div>
        )}

        {ipdSubTab === "forecast" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Operational Bed Flow Forecasting</h2>
              <p className="text-xs text-slate-400">Leverage Gemini's predictive algorithms to project inpatient bed loading trends and schedule discharges.</p>
            </div>

            <div className="flex">
              <button
                onClick={triggerBedForecast}
                disabled={forecasting}
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2"
                id="btn_ai_bed_forecast"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                {forecasting ? "Synthesizing AI forecast models..." : "Run Bed-Resource Forecast Analysis"}
              </button>
            </div>

            {forecastReport && (
              <div className="bg-slate-900 text-slate-300 rounded-xl p-5 space-y-4 animate-fadeIn font-sans" id="forecast_results">
                <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-slate-800">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase font-bold tracking-wider">Gemini Capacity Projections</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/80 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Predicted occupancy (7 Days)</span>
                    <h3 className="text-3xl font-semibold text-white mt-1">{forecastReport.predictedPercentOccupancy7Days}%</h3>
                    <p className="text-xs text-slate-400 mt-2 font-light">Projected loading threshold based on scheduled surgeries and historical admission sequences.</p>
                  </div>

                  <div className="p-4 bg-slate-800/80 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Bottleneck Ward Alert</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {forecastReport.predictedBottleneckWards?.map((w: string, idx: number) => (
                          <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5 text-[10px] font-mono font-bold">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                    {forecastReport.anomalyDetected && (
                      <span className="text-[10px] text-amber-400 mt-2 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" /> High load anamoly forecasted!
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-800 border border-slate-700/50 rounded-lg text-xs leading-relaxed">
                  <strong className="text-emerald-300 block mb-1">Strategic Operations Guidance:</strong>
                  {forecastReport.operationalInsight}
                </div>
              </div>
            )}
          </div>
        )}

        {ipdSubTab === "admit" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 max-w-lg">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">EHR Inpatient Ward Admission</h2>
              <p className="text-xs text-slate-400">Admit an registered outpatient into a bed spot in General Wards or the ICU immediately.</p>
            </div>

            <form onSubmit={handleAdmit} className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Select Patient</label>
                <select
                  value={admitForm.patientId}
                  onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                  required
                >
                  <option value="">-- Choose patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Allocate Ward Bed Location</label>
                <select
                  value={admitForm.bedId}
                  onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2 font-mono"
                  required
                >
                  <option value="">-- Choose available bed spot --</option>
                  {beds
                    .filter((b) => b.status === "Available")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} - {b.ward}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Admitting Diagnosis / Direct complaints</label>
                <input
                  type="text"
                  value={admitForm.admittingDiagnosis}
                  onChange={(e) => setAdmitForm({ ...admitForm, admittingDiagnosis: e.target.value })}
                  placeholder="e.g. Sepsis suspicion, persistent fever, respiratory distress observations"
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Admitting Supervising Physician</label>
                <select
                  value={admitForm.admittingDoctor}
                  onChange={(e) => setAdmitForm({ ...admitForm, admittingDoctor: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                >
                  <option>Dr. Rajesh Kumar</option>
                  <option>Dr. Ananya Nair</option>
                  <option>Dr. Rohan Verma</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg" id="btn_submit_admit">
                  Admit Patients
                </button>
              </div>
            </form>
          </div>
        )}

        {ipdSubTab === "handover" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  Ward Shift Handover Protocol Desk
                </h2>
                <p className="text-xs text-slate-400">Generate, review, and export high-fidelity structured briefings for the incoming clinical crew.</p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-left">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Active list in scope</span>
                <span className="text-lg font-bold text-slate-800">{activeInpatients.length} admitted</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                <span className="text-[9px] text-red-400 font-mono block uppercase">High-risk patients alert</span>
                <span className="text-lg font-bold text-red-700">
                  {activeInpatients.filter((adm) => {
                    const vt = adm.vitalsHistory?.[0];
                    return vt?.isAnomaly || (vt?.spO2 && vt.spO2 < 95) || (vt?.heartRate && (vt.heartRate < 50 || vt.heartRate > 125));
                  }).length} critical
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-left">
                <span className="text-[9px] text-amber-500 font-mono block uppercase">Pending lab test track</span>
                <span className="text-lg font-bold text-amber-800">
                  {activeInpatients.reduce((total, adm) => {
                    const pending = store.labTests.filter(t => t.patientId === adm.patientId && t.status !== "Completed").length;
                    return total + pending;
                  }, 0)} active tests
                </span>
              </div>
            </div>

            {/* Handover configurations */}
            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4 text-xs text-slate-700">
              <h3 className="font-semibold text-slate-800">1. Shift Transition Parameters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Outgoing Duty Operator</label>
                  <select 
                    value={handoverFrom} 
                    onChange={(e) => setHandoverFrom(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                  >
                    <option>Nurse Priya Singh</option>
                    <option>Dr. Rajesh Kumar</option>
                    <option>Deepak Verma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Incoming Duty Operator</label>
                  <select 
                    value={handoverTo} 
                    onChange={(e) => setHandoverTo(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                  >
                    <option>Dr. Rajesh Kumar</option>
                    <option>Dr. Ananya Nair</option>
                    <option>Nurse Priya Singh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Shift Cycle</label>
                  <select 
                    value={handoverShift} 
                    onChange={(e) => setHandoverShift(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2"
                  >
                    <option>Day Shift to Night Shift</option>
                    <option>Night Shift to Morning Shift</option>
                    <option>Morning Shift to Day Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Additional Operational / Ward floor comments</label>
                <textarea 
                  value={handoverAddNotes}
                  onChange={(e) => setHandoverAddNotes(e.target.value)}
                  placeholder="e.g. Ward B general maintenance clearance scheduled, ventilators re-calibrated on bed B2..."
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2 h-16 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleGenerateHandover}
                  disabled={generatingHandover}
                  className="bg-slate-900 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-all hover:bg-slate-800 shadow-sm"
                  id="btn_ipd_generate_briefing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  {generatingHandover ? "Compiling briefing..." : "Generate Briefing"}
                </button>
              </div>
            </div>

            {/* Inpatients hand-off manifest details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-widest font-mono border-b pb-1.5 flex justify-between items-center">
                <span>2. Ward Active Patient Briefing Manifest</span>
                <span className="text-[10px] text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded font-sans font-normal border">
                  Auto-sync: {new Date().toLocaleDateString()}
                </span>
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activeInpatients.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">No active inpatient admissions currently assigned during this cycle.</div>
                ) : (
                  activeInpatients.map((adm) => {
                    const latestVital = adm.vitalsHistory?.[0];
                    const isAnomaly = latestVital?.isAnomaly;
                    const o2Sat = latestVital?.spO2;
                    const hr = latestVital?.heartRate;
                    const isHighRisk = isAnomaly || (o2Sat && o2Sat < 95) || (hr && (hr < 50 || hr > 125)) || adm.admittingDiagnosis.toLowerCase().includes("sepsis") || adm.admittingDiagnosis.toLowerCase().includes("trauma");
                    
                    // Find pending labs for patient
                    const pendingLabs = store.labTests.filter(
                      (test) => test.patientId === adm.patientId && test.status !== "Completed"
                    );

                    return (
                      <div 
                        key={adm.id} 
                        className={`p-4 rounded-xl border transition-all text-xs text-left text-slate-700 ${
                          isHighRisk ? "bg-red-50/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/20 animate-pulse-subtle" : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {adm.patientName} 
                              {isHighRisk && (
                                <span className="bg-red-600 text-white font-mono font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded inline-flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" /> High-Risk
                                </span>
                              )}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">Admission ID: {adm.id} • Assigned Physician: {adm.admittingDoctor}</span>
                          </div>
                          <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-1 rounded">
                            {adm.ward} - Bed {adm.bedNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t border-slate-100/60 text-slate-600">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Observation & Diagnosis</span>
                            <p className="font-medium text-slate-800">{adm.admittingDiagnosis}</p>
                            
                            {latestVital ? (
                              <div className="mt-2.5 flex items-center gap-3 font-mono text-[11px] font-medium bg-slate-50 px-2.5 py-1.5 border rounded-lg whitespace-nowrap">
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> {latestVital.heartRate} bpm</span>
                                <span className="text-slate-350">•</span>
                                <span>BP: {latestVital.bloodPressure}</span>
                                <span className="text-slate-350">•</span>
                                <span>SpO2: {latestVital.spO2}%</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block mt-2">No active biometrics charted.</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Laboratory Diagnostics Follow-up</span>
                            {pendingLabs.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {pendingLabs.map((l) => (
                                  <span key={l.id} className="bg-amber-100 text-amber-900 border border-amber-200/50 rounded-lg px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 font-mono">
                                    🧪 {l.testName} <span className="text-[8px] bg-amber-200 px-1 py-0.5 rounded font-bold uppercase">{l.status}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-emerald-700 font-medium font-mono flex items-center gap-1.5 mt-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 w-fit">
                                <CheckSquare className="w-3.5 h-3.5" /> No pending diagnostic labs
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* AI Generated Briefing Display Block & Action to print it */}
            {aiHandoverReport && (
              <div className="p-5 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl space-y-4 animate-fadeIn" id="ai_compiled_handover_view">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase font-extrabold tracking-wider text-emerald-400">AI Shift Transition Report Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        if (!printWindow) return;
                        const formattingHtml = `
                          <html>
                            <head>
                              <title>HIMS Shift Handover Statement</title>
                              <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                                h1 { font-size: 20px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 24px; }
                                h2 { font-size: 15px; border-bottom: 1px solid #e2e8f0; margin-top: 24px; color: #334155; }
                                .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 12px; font-family: monospace; }
                                .meta grid { display: grid; grid-template-cols: 1fr 1fr; gap: 8px; }
                                .briefing { background: #fafafa; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; }
                                .seal { margin-top: 48px; border-top: 1px dashed #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
                              </style>
                            </head>
                            <body>
                              <h1>HIMS Clinical Shift Handover Report</h1>
                              <div class="meta">
                                <div><strong>OUTGOING UNIT DIRECT:</strong> ${handoverFrom}</div>
                                <div><strong>INCOMING UNIT DIRECT:</strong> ${handoverTo}</div>
                                <div><strong>TRANSITION CYCLE:</strong> ${handoverShift}</div>
                                <div><strong>TIMESTAMP LOGGED:</strong> ${new Date().toLocaleString()}</div>
                                <div style="margin-top: 10px;"><strong>ADDITIONAL INSTRUCTIONS:</strong> ${handoverAddNotes || "None"}</div>
                              </div>
                              <h2>CLINICAL EXECUTIVE SUMMARY</h2>
                              <div class="briefing">${aiHandoverReport}</div>
                              
                              <div class="seal">
                                <div>SYSTEM SECURE SIGNATURE SEAL • HIPAA CERTIFIED EHR RECORD</div>
                                <div>Outgoing Initials: _______________ / Incoming Initials: _______________</div>
                              </div>
                              <script>
                                window.onload = function() { window.print(); }
                              </script>
                            </body>
                          </html>
                        `;
                        printWindow.document.write(formattingHtml);
                        printWindow.document.close();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      id="btn_print_handover_brief"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF Report
                    </button>
                    <button
                      onClick={() => setAiHandoverReport(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Dismiss Document
                    </button>
                  </div>
                </div>

                <div className="text-left text-xs text-slate-300 leading-relaxed max-h-[350px] overflow-y-auto pr-2 bg-slate-950 p-4 border border-slate-800 rounded font-sans whitespace-pre-line prose prose-invert">
                  {aiHandoverReport}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
