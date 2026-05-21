import React, { useState } from "react";
import { Users, UserPlus, Calendar, Plus, CheckCircle, Clock, Stethoscope, Sparkles, Brain, ShieldAlert, ListFilter } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { Patient, Appointment } from "../types";
import { suggestDiagnosis, summarizeClinicalNotes } from "../api";

interface OPDModuleProps {
  store: HIMSStore;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export function OPDModule({ store, selectedPatientId, setSelectedPatientId }: OPDModuleProps) {
  const {
    patients,
    appointments,
    consultations,
    registerPatient,
    scheduleAppointment,
    updateAppointmentStatus,
    addConsultation,
    requestLabTest,
    billing,
    submitOPDBill
  } = store;

  // Active sub-tab inside OPD
  const [opdSubTab, setOpdSubTab] = useState<"consult" | "queue" | "register">("consult");

  // State: Patient registration
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    bloodGroup: "O+",
    phone: "",
    address: "",
    allergies: "",
    medicalHistory: ""
  });

  // State: Appointment scheduling
  const [newAppt, setNewAppt] = useState({
    patientId: "",
    doctorName: "Dr. Rajesh Kumar",
    department: "Cardiology",
    dateTime: "",
    urgency: "Routine" as "Routine" | "Urgent" | "Emergency",
    notes: ""
  });

  // State: Doctor consultation form
  const [activeConsultation, setActiveConsultation] = useState({
    notesRaw: "",
    symptoms: "",
    diagnosis: "",
    prescriptions: "",
    recommendedLabs: "",
    riskLevel: "Low" as "Low" | "Moderate" | "High"
  });

  // State: AI loading flags
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const filteredPatients = patients.filter((pat) =>
    pat.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    pat.uhid.toLowerCase().includes(patientSearchQuery.toLowerCase())
  );

  const activePatient = patients.find((p) => p.id === (selectedPatientId || appointments[0]?.patientId));

  // Handle patient registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      alert("Name and Phone are required.");
      return;
    }
    const allergiesArr = newPatient.allergies
      ? newPatient.allergies.split(",").map((x) => x.trim())
      : [];
    const historyArr = newPatient.medicalHistory
      ? newPatient.medicalHistory.split(",").map((x) => x.trim())
      : [];

    const reg = registerPatient(
      {
        name: newPatient.name,
        age: parseInt(newPatient.age) || 30,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: newPatient.phone,
        address: newPatient.address,
        allergies: allergiesArr,
        medicalHistory: historyArr
      },
      "Admin Amit Joshi",
      "Admin"
    );

    setSelectedPatientId(reg.id);
    setNewPatient({
      name: "",
      age: "",
      gender: "Male",
      bloodGroup: "O+",
      phone: "",
      address: "",
      allergies: "",
      medicalHistory: ""
    });
    setOpdSubTab("consult");
  };

  // Handle Appointment Scheduled
  const handleScheduleAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientId || !newAppt.dateTime) {
      alert("Please select a patient and scheduled date.");
      return;
    }
    const pat = patients.find((p) => p.id === newAppt.patientId);
    if (!pat) return;

    scheduleAppointment(
      {
        patientId: newAppt.patientId,
        patientName: pat.name,
        doctorName: newAppt.doctorName,
        department: newAppt.department,
        dateTime: newAppt.dateTime,
        urgency: newAppt.urgency,
        notes: newAppt.notes
      },
      "Admin Amit Joshi",
      "Admin"
    );

    setNewAppt({
      patientId: "",
      doctorName: "Dr. Rajesh Kumar",
      department: "Cardiology",
      dateTime: "",
      urgency: "Routine",
      notes: ""
    });
    setOpdSubTab("queue");
  };

  // Trigger Gemini AI visit summarization and treatment assistance
  const triggerAiCopilot = async () => {
    if (!activeConsultation.notesRaw && !activeConsultation.symptoms) {
      alert("Please enter some symptoms or draft raw clinical visit notes first.");
      return;
    }
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      // 1. Summarize notes
      const notesToSummarize = activeConsultation.notesRaw || `Patient reported symptoms: ${activeConsultation.symptoms}`;
      const summary = await summarizeClinicalNotes(notesToSummarize, activePatient);

      // 2. Recommend differentials
      const symptomsList = activeConsultation.symptoms
        ? activeConsultation.symptoms.split(",").map((s) => s.trim())
        : [summary.subjective || "Unspecified complaints"];
      const diagnosisRep = await suggestDiagnosis(symptomsList, null);

      setAiSuggestions({
        summary,
        diagnosisRep
      });

      // Auto fill values into form
      setActiveConsultation((prev) => ({
        ...prev,
        symptoms: summary.subjective || prev.symptoms,
        diagnosis: summary.assessment || diagnosisRep.differentials[0]?.name || prev.diagnosis,
        prescriptions: summary.plan || prev.prescriptions,
        recommendedLabs: diagnosisRep.recommendedLabs.join(", "),
        riskLevel: summary.riskLevel
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit diagnosis consultation
  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      alert("No active patient is currently selected.");
      return;
    }

    const recLabs = activeConsultation.recommendedLabs
      ? activeConsultation.recommendedLabs.split(",").map((l) => l.trim())
      : [];

    addConsultation(
      {
        patientId: activePatient.id,
        doctorName: "Dr. Rajesh Kumar",
        symptoms: activeConsultation.symptoms ? activeConsultation.symptoms.split(",").map((s) => s.trim()) : [],
        notes: activeConsultation.notesRaw,
        diagnosis: activeConsultation.diagnosis || "Undifferentiated complaints",
        prescriptions: activeConsultation.prescriptions ? activeConsultation.prescriptions.split(",").map((p) => p.trim()) : [],
        recommendedLabs: recLabs,
        riskLevel: activeConsultation.riskLevel
      },
      "Dr. Rajesh Kumar",
      "Physician"
    );

    // Auto trigger Lab test requests if any
    recLabs.forEach((labName) => {
      requestLabTest(
        {
          patientId: activePatient.id,
          patientName: activePatient.name,
          testName: labName,
          department: "General Labs",
          requestedBy: "Dr. Rajesh Kumar"
        },
        "Dr. Rajesh Kumar",
        "Physician"
      );
    });

    // Generate basic invoice charges for this consultation
    submitOPDBill(
      {
        patientId: activePatient.id,
        patientName: activePatient.name,
        items: [
          { description: "Physician Consult - Dr. Rajesh Kumar", category: "OPD Consultation" as const, amount: 800 },
          { description: "Administrative Intake Registration", category: "OPD Consultation" as const, amount: 200 }
        ],
        totalAmount: 1000,
        insuranceClaimed: 0,
        status: "Unpaid"
      },
      "Dr. Rajesh Kumar",
      "Physician"
    );

    // Update appointment status to Completed if we had one scheduled
    const relatedAppt = appointments.find((a) => a.patientId === activePatient.id && a.status === "Scheduled");
    if (relatedAppt) {
      updateAppointmentStatus(relatedAppt.id, "Completed", "Dr. Rajesh Kumar", "Physician");
    }

    // Reset Form
    setActiveConsultation({
      notesRaw: "",
      symptoms: "",
      diagnosis: "",
      prescriptions: "",
      recommendedLabs: "",
      riskLevel: "Low"
    });
    setAiSuggestions(null);
    alert(`Consultation finalized and saved to EHR. Requested ${recLabs.length} lab panels and created OPD consultation invoice.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Patient Select and tab navigation */}
      <div className="lg:col-span-1 space-y-4">
        {/* Module Nav Links */}
        <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
          <button
            onClick={() => setOpdSubTab("consult")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              opdSubTab === "consult" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Consultation Desk
          </button>
          <button
            onClick={() => setOpdSubTab("queue")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              opdSubTab === "queue" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Calendar className="w-4 h-4" /> Appointments Queue
          </button>
          <button
            onClick={() => setOpdSubTab("register")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              opdSubTab === "register" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register New UHID
          </button>
        </div>

        {/* Patient Selection list */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50 border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 tracking-tight font-sans">Active Patients</h3>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{patients.length} total</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by candidate name or UHID..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-sans"
              id="inp_patient_search"
            />
          </div>

          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="text-[10px] text-slate-400 py-6 text-center">No matching patients.</div>
            ) : (
              filteredPatients.map((pat) => {
                const matchesActive = selectedPatientId === pat.id || (!selectedPatientId && appointments[0]?.patientId === pat.id);
                return (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPatientId(pat.id)}
                    className={`p-2.5 rounded-lg text-left cursor-pointer transition-colors ${
                      matchesActive ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-medium text-xs truncate">{pat.name}</div>
                    <div className="flex justify-between text-[10px] opacity-70 mt-0.5 font-mono">
                      <span>{pat.uhid}</span>
                      <span>{pat.gender}, {pat.age}y</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main OPD content window */}
      <div className="lg:col-span-3">
        {opdSubTab === "consult" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            {/* Context bar */}
            {activePatient ? (
              <div className="p-4 bg-slate-50 rounded-lg flex flex-wrap justify-between items-center gap-4 border border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">{activePatient.uhid}</span>
                    <h2 className="text-sm font-semibold text-slate-800">{activePatient.name}</h2>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded">{activePatient.gender}, {activePatient.age}y</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Allergies: <span className="text-red-600 font-medium">{activePatient.allergies.join(", ") || "None"}</span>
                  </p>
                </div>
                <div className="text-xs text-slate-500 max-w-xs truncate font-mono">
                  History: {activePatient.medicalHistory.join(", ") || "None recorded"}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Please register or select a patient to start clinical examination.
              </div>
            )}

            {activePatient && (
              <form onSubmit={handleSaveConsultation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Input raw notes & AI triggering */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">Clinician raw consult dictation / Free notes</label>
                    <textarea
                      value={activeConsultation.notesRaw}
                      onChange={(e) => setActiveConsultation({ ...activeConsultation, notesRaw: e.target.value })}
                      placeholder="e.g. Patient Aarav presents with borderline blood pressure complaints. Experiences minor dyspnea on walking high slopes. Prescribing amlodipine and request a basic chemistry test."
                      className="w-full h-44 text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={triggerAiCopilot}
                        disabled={aiLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-lg p-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        id="btn_ai_copilot"
                      >
                        {aiLoading ? (
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4 animate-spin" /> Querying Clinical co-pilot...</span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> AI Co-pilot Assist
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Parsed EHR structures */}
                  <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1"><Brain className="w-3.5 h-3.5 text-indigo-500" /> Structure Summary</span>
                      {activeConsultation.riskLevel && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold leading-none ${
                          activeConsultation.riskLevel === "High" ? "bg-red-100 text-red-700" :
                          activeConsultation.riskLevel === "Moderate" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          Risk: {activeConsultation.riskLevel}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Symptoms (Subjective)</label>
                        <input
                          type="text"
                          value={activeConsultation.symptoms}
                          onChange={(e) => setActiveConsultation({ ...activeConsultation, symptoms: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Chest tightness, Dyspnea"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Primary Assessment / Diagnosis</label>
                        <input
                          type="text"
                          value={activeConsultation.diagnosis}
                          onChange={(e) => setActiveConsultation({ ...activeConsultation, diagnosis: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Essential Hypertension"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Prescriptions (Therapy Plan)</label>
                        <input
                          type="text"
                          value={activeConsultation.prescriptions}
                          onChange={(e) => setActiveConsultation({ ...activeConsultation, prescriptions: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                          placeholder="e.g. Amlodipine 5mg QD"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Recommended Labs (ruled out protocols)</label>
                        <input
                          type="text"
                          value={activeConsultation.recommendedLabs}
                          onChange={(e) => setActiveConsultation({ ...activeConsultation, recommendedLabs: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs"
                          placeholder="e.g. Lipid Profile, Complete Blood Count"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* co-pilot Differential Diagnoses details if available */}
                {aiSuggestions?.diagnosisRep && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5 animate-fadeIn">
                    <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <Brain className="w-4 h-4 text-indigo-500" /> co-pilot Differential Diagnoses Guidelines
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {aiSuggestions.diagnosisRep.differentials?.map((d: any, index: number) => (
                        <div key={index} className="p-2.5 bg-white rounded-lg border border-indigo-100">
                          <div className="flex justify-between font-semibold leading-none">
                            <span className="text-slate-800">{d.name}</span>
                            <span className={`text-[10px] font-mono ${
                              d.likelihood === "High" ? "text-red-600" : "text-slate-500"
                            }`}>{d.likelihood} Likelihood</span>
                          </div>
                          <p className="text-slate-500 mt-1 text-[11px] leading-snug">{d.rationale}</p>
                        </div>
                      ))}
                    </div>
                    {aiSuggestions.diagnosisRep.urgentAlerts?.length > 0 && (
                      <div className="p-2.5 bg-red-100/50 border border-red-200 text-red-800 text-[11px] rounded-lg flex items-start gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-red-900">Urgent Indicators:</strong> {aiSuggestions.diagnosisRep.urgentAlerts.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Finalize button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-lg font-semibold flex items-center gap-1"
                    id="btn_submit_consultation"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Save & Finalize Consultation
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {opdSubTab === "queue" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Active OPD Queue</h2>
                <p className="text-xs text-slate-400">Incoming queue list checking into active consulting physicians</p>
              </div>

              {/* Quick Book Button */}
              <button
                onClick={() => {
                  const pId = activePatient?.id || patients[0]?.id;
                  if (pId) {
                    setNewAppt((prev) => ({ ...prev, patientId: pId }));
                  }
                }}
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-200 flex items-center gap-1"
                id="btn_appt_trigger"
              >
                <Plus className="w-3.5 h-3.5" /> Book Appt
              </button>
            </div>

            {/* Book Appointment Modal inline */}
            {newAppt.patientId && (
              <form onSubmit={handleScheduleAppt} className="p-4 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-100">
                <div className="md:col-span-3 pb-1 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Quick Book Appointment</span>
                  <button type="button" onClick={() => setNewAppt({ ...newAppt, patientId: "" })} className="text-[10px] text-slate-400">Cancel</button>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Doctor Name</label>
                  <select
                    value={newAppt.doctorName}
                    onChange={(e) => setNewAppt({ ...newAppt, doctorName: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5"
                  >
                    <option>Dr. Rajesh Kumar</option>
                    <option>Dr. Ananya Nair</option>
                    <option>Dr. Rohan Verma</option>
                    <option>Dr. Pooja Sen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Department</label>
                  <select
                    value={newAppt.department}
                    onChange={(e) => setNewAppt({ ...newAppt, department: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5"
                  >
                    <option>Cardiology</option>
                    <option>Internal Medicine</option>
                    <option>Pulmonology</option>
                    <option>Gynecology</option>
                    <option>Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Date Time</label>
                  <input
                    type="datetime-local"
                    value={newAppt.dateTime}
                    onChange={(e) => setNewAppt({ ...newAppt, dateTime: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Urgency</label>
                  <select
                    value={newAppt.urgency}
                    onChange={(e) => setNewAppt({ ...newAppt, urgency: e.target.value as any })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5"
                  >
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-1">Reason / Intake Notes</label>
                  <input
                    type="text"
                    value={newAppt.notes}
                    onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                    placeholder="Brief description of complaints"
                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end pt-1">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded font-semibold" id="btn_submit_appt">
                    Schedule Appt
                  </button>
                </div>
              </form>
            )}

            {/* Active Appts listing */}
            <div className="overflow-x-auto rounded-lg border border-slate-50">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor / Clinic</th>
                    <th className="p-3">Urgency</th>
                    <th className="p-3">Date Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-semibold">{appt.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {appt.patientId}</div>
                      </td>
                      <td className="p-3">
                        <div>{appt.doctorName}</div>
                        <div className="text-[10px] text-slate-400">{appt.department}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          appt.urgency === "Emergency" ? "bg-red-100 text-red-700" :
                          appt.urgency === "Urgent" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{appt.urgency}</span>
                      </td>
                      <td className="p-3 font-mono">{new Date(appt.dateTime).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 ${
                          appt.status === "Scheduled" ? "text-amber-500" :
                          appt.status === "Completed" ? "text-emerald-500" :
                          "text-slate-400"
                        }`}>
                          {appt.status === "Scheduled" ? <Clock className="w-3.0 h-3.0" /> : <CheckCircle className="w-3.0 h-3.0" />}
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {appt.status === "Scheduled" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPatientId(appt.patientId);
                                setOpdSubTab("consult");
                              }}
                              className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded"
                              id={`queue_consult_${appt.id}`}
                            >
                              Examine
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, "No-Show", "Admin Amit Joshi", "Admin")}
                              className="bg-slate-100 text-slate-400 hover:text-red-500 text-[10px] px-2 py-1 rounded border border-slate-200"
                              id={`queue_noshow_${appt.id}`}
                            >
                              No-Show
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {opdSubTab === "register" && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 max-w-xl">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">UHID Patient Registration</h2>
              <p className="text-xs text-slate-400">Add a new baseline EHR record block and assign a Universal Health ID instantly.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">FullName</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                    placeholder="Enter patient full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">Phone Contact</label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">Age (years)</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                    placeholder="45"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Residential Address</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                  placeholder="Street and City coordinates"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Allergies (comma separated)</label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500 font-mono"
                  placeholder="Penicillin, Sulfa drugs, Shellfish"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">Medical History (comma separated)</label>
                <input
                  type="text"
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:border-emerald-500"
                  placeholder="Hypertension, Asthma, Diabetes"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg"
                  id="btn_submit_patient_reg"
                >
                  Generate EMR File & UHID
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
