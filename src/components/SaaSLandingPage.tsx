import React, { useState } from "react";
import { 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Heart, 
  CheckCircle2, 
  FileText, 
  Lock,
  Database,
  Users,
  Layers,
  FileSpreadsheet,
  Stethoscope,
  Clipboard,
  Search,
  Check,
  AlertCircle
} from "lucide-react";

interface SaaSLandingPageProps {
  onLaunchApp: (signUpMode?: boolean) => void;
}

export function SaaSLandingPage({ onLaunchApp }: SaaSLandingPageProps) {
  // Pricing Calculator State
  const [bedCapacity, setBedCapacity] = useState<number>(150);
  const [useAIModules, setUseAIModules] = useState<boolean>(true);

  // Active module spotlight tab
  const [activeModuleTab, setActiveModuleTab] = useState<"opd" | "ipd" | "rbac" | "compliance" | "pharmacy">("rbac");

  // Compute calculated pricing
  const baseCost = 299;
  const costPerBed = 1.5;
  const aiSuitePremium = useAIModules ? 150 : 0;
  const totalCalculatedSaaSPrice = baseCost + (bedCapacity * costPerBed) + aiSuitePremium;

  // Custom detailed data for Hospital buyer evaluation
  const modulesSummary = {
    rbac: {
      title: "Granular Role-Based Access Control (RBAC)",
      badge: "HIPAA SECURE AT CORE",
      desc: "Hospitals handling Protected Health Information (PHI) require watertight authentication structures. Our enterprise RBAC engine implements rigid permission partitions mapped perfectly directly to staff job descriptions.",
      points: [
        "Chief Administrators: Global logs, custom employee provisioning, financial auditing, and master configuration access.",
        "Physicians / Doctors: Create Outpatient (OPD) consultations, order Computerized Physician Order Entries (CPOE), write clinical diagnoses, and review biometric feeds.",
        "Nurses: Inpatient (IPD) ward chart entries, vital signs telemetry tracking, medication administration logs, and active bed allocations.",
        "Laboratory Technicians: Access pending test orders, fill out pathology panels, input biochemical result variables, and transmit status signals.",
        "Pharmacists: Read validated electronic prescriptions (e-Rx), handle medical dispatch workflows, adjust stock thresholds, and query active supply lines.",
        "Finance Officers: Audit patient bills, process TPA insurance certifications, render itemized invoices, and configure service rate pricing catalogs."
      ],
      infographic: [
        { role: "Admin", access: "Full Control + Audit Logs", level: "Global Level" },
        { role: "Doctor", access: "Prescriptions, OPD, CPOE, Labs", level: "Clinical Write" },
        { role: "Nurse", access: "IPD Bed Charts, Vitals, Shift SBAR", level: "Ward Operations" },
        { role: "Pharmacist", access: "Meds inventory, e-Rx verification", level: "Inventory Local" }
      ]
    },
    opd: {
      title: "Smart Outpatient Department (OPD) Suite",
      badge: "CLINICAL EFFICIENCY",
      desc: "Decrease patient wait times and optimize consultation flow. Write clinical records, log vitals, prescribe medications, and order laboratory workups from a single integrated consultation interface.",
      points: [
        "Structured SOAP Notes Engine: Standard clinical format supporting Subjective, Objective, Assessment, and Plan notes structures.",
        "ICD-10 Diagnostic Search: Fast, intelligent auto-suggest indexing millions of international medical code classifications instantly.",
        "Integrated e-Prescribing (e-Rx): Dynamically sends pharmacy directives to the dispensary, avoiding human handwritten translation errors.",
        "Live Lab Pipeline: Order pathology examinations directly within the patient context and receive real-time notifications when the test returns."
      ],
      infographic: [
        { step: "1. Triage Intake", action: "Log baseline metrics & vital signs", speed: "Instant" },
        { step: "2. Consultation", action: "Write SOAP notes & assign ICD-10 diagnostics", speed: "Efficient" },
        { step: "3. Order Entry", action: "Directly trigger LIS tests & Pharmacy e-Rx", speed: "Automated" }
      ]
    },
    ipd: {
      title: "Inpatient (IPD) Ward & Bed Management Core",
      badge: "BED CAPACITY OPTIMIZATION",
      desc: "Manage ward operations, floor bedding, and acute telemetry workflows without spreadsheet friction. Maintain full status visibility of general, semi-private, ICU, and surgical backup rooms.",
      points: [
        "Real-Time Bed Allocation Matrix: Move, admit, discharge, and transfer patients between critical wards with automated state tracking.",
        "Continuous Telemetry Guards: Standardized vital sign charts displaying heart rate, oxygen levels, respiration, and continuous body temperature streams.",
        "Intelligent Alerts System: Instant visual signals indicating biometric threshold violations like acute oxygen drops or heart fluctuations.",
        "Bed Capacity Forecasting: Historical occupancy metrics and data tools modeling upcoming discharge timelines and upcoming admission backlogs."
      ],
      infographic: [
        { floor: "ICU A Wards", total: "15 Beds", occupancy: "93.3% Occupied" },
        { floor: "Gen Pediatrics", total: "45 Beds", occupancy: "60.0% Occupied" },
        { floor: "Surgical Recovery", total: "20 Beds", occupancy: "15.0% Occupied" }
      ]
    },
    pharmacy: {
      title: "Closed-Loop Pharmacy & Supply Chain Automation",
      badge: "INVENTORY DRUG SAFEGUARDS",
      desc: "Reduce overhead cost spills and protect prescription cycles. MediFlow's stock manager links patient clinical orders directly to the central medical dispensary inventory levels.",
      points: [
        "Real-Time Stock Depletion: Automatic deduction of medication units as clinical prescriptions are approved and handed over.",
        "Threshold Refill Notifications: Warns procurement supervisors instantly when critical drugs (e.g., insulin, antibiotics, analgesics) reach minimal reserve heights.",
        "Batch and Expiry Logging: Tracks drug production batch numbers and expiry stamps to prevent dispensing outdated supplies.",
        "Dispensary Audits: Generate comprehensive reports reconciling medication purchases with active clinical dispense orders for ultimate oversight."
      ],
      infographic: [
        { supply: "Paracetamol 500mg", status: "In Stock (3,400 Units)", alarm: "Healthy" },
        { supply: "Insulin Regular Glargine", status: "Low Stock (45 Units)", alarm: "Refill Triggered" },
        { supply: "Amoxicillin 250mg Susp", status: "Standard (890 Units)", alarm: "Healthy" }
      ]
    },
    compliance: {
      title: "HIPAA, HL7 & FHIR Clinical Integration Suite",
      badge: "ENTERPRISE PROTOCOLS",
      desc: "MediFlow AI replaces non-compliant communication channels with modern, encrypted standards matching national digital health requirements.",
      points: [
        "Strict 256-Bit Cryptography: Fully encrypts patient Protected Health Information (PHI) both while traveling and resting in Cloud Databases.",
        "HL7 / FHIR Format Support: Designed under unified payload frameworks for safe export and sync into external health networks (EMR/EHR).",
        "Clinical Immutable Audit Trail: Records every single access, read, edit, or discharge action with precise timestamps, IP details, and employee accounts.",
        "BAA Signature Ready: MediFlow Technologies stands behind our software, signing business associate agreements with security guarantees."
      ],
      infographic: [
        { protocol: "Database Encryption", spec: "AES-256 Cloud Standard", compliance: "Certified" },
        { protocol: "Audit Logging", spec: "Immutable Firestore ledgers", compliance: "Mandatory" },
        { protocol: "Interoperability", spec: "HL7 XML & FHIR JSON payloads", compliance: "Standard" }
      ]
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. TOP MARKETING NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-955/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-slate-955 rounded-lg">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="font-mono text-[9px] tracking-widest font-extrabold text-emerald-400 uppercase block leading-none">Enterprise HIMS SaaS</span>
            <h1 className="text-sm font-bold tracking-tight text-white block">MediFlow AI</h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#spotlight" className="hover:text-emerald-400 transition-colors">HIMS Modules</a>
          <a href="#rbac-section" className="hover:text-emerald-400 transition-colors">RBAC Matrix</a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">AI & Telemetry Core</a>
          <a href="#compliance" className="hover:text-emerald-400 transition-colors">HIPAA Trust</a>
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">ROI Calculator</a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing Tiers</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onLaunchApp(false)}
            className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/20 active:scale-95 transition-all cursor-pointer"
          >
            Clinical Login
          </button>
          
          <button 
            onClick={() => onLaunchApp(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-955 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
            id="saas_header_launch_app"
          >
            <span>Activate Free Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Visual Background Glows */}
      <div className="absolute top-16 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-48 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 2. HERO HIGHLIGHT ZONE WITH CLINICAL ACCREDITATION */}
      <section className="relative px-4 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Unified EMR, LIS, Pharmacy, & SBAR Reporting</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          The HIPAA-Compliant HIMS Built for <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Complex Healthcare Workflows</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto font-normal leading-relaxed">
          MediFlow AI is an elite, cloud-native Hospital Information Management System (HIMS). It consolidates critical inpatient charts, outpatient triage metrics, electronic prescribing (e-Rx), automated LIS reporting pipelines, and Gemini SBAR handovers into a secure, RBAC-protected clinical operation.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button 
            onClick={() => onLaunchApp(true)}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/15"
            id="saas_hero_demo_btn"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Launch Free Sandbox (14-Day Trial)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="#spotlight"
            className="w-full sm:w-auto text-center text-xs sm:text-sm text-slate-350 hover:text-white border border-slate-700 hover:border-slate-600 px-6 py-3.5 rounded-xl transition-all cursor-pointer bg-slate-950/40"
          >
            Explore HIMS Modules
          </a>
        </div>

        {/* Minimal Hero Stats Subunit */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-16 text-left">
          <div className="bg-slate-955/50 border border-slate-800/80 p-4 rounded-xl">
            <span className="font-mono text-emerald-400 text-lg font-bold block">HIPAA & HL7</span>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider mt-0.5">National Security Level</span>
          </div>
          <div className="bg-slate-955/50 border border-slate-800/80 p-4 rounded-xl">
            <span className="font-mono text-emerald-400 text-lg font-bold block">Granular RBAC</span>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider mt-0.5">Strict Privacy Partitions</span>
          </div>
          <div className="bg-slate-955/50 border border-slate-800/80 p-4 rounded-xl">
            <span className="font-mono text-emerald-400 text-lg font-bold block">&lt; 150ms Telemetry</span>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider mt-0.5">Vital Signs Alarm Monitor</span>
          </div>
          <div className="bg-slate-955/50 border border-slate-800/80 p-4 rounded-xl">
            <span className="font-mono text-emerald-400 text-lg font-bold block">100% Data Export</span>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider mt-0.5">FHIR JSON Interoperability</span>
          </div>
        </div>
      </section>

      {/* NEW INTERACTIVE HIMS SPOTLIGHT TABS - High SEO value */}
      <section className="bg-slate-950 py-24 px-4 sm:px-8 border-y border-slate-800/60" id="spotlight">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-left space-y-3 max-w-2xl">
            <span className="font-mono text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">Interactive Spotlight</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Hospital Operations Standardized Under One Clinical OS
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Evaluating healthcare information architectures? Choose a module below to inspect the detailed security guidelines, workflow automations, and clinical requirements satisfying ISO health specifications.
            </p>
          </div>

          {/* Module Selector Buttons Toggles */}
          <div className="flex flex-wrap gap-2.5 pb-2 border-b border-slate-800">
            <button
              onClick={() => setActiveModuleTab("rbac")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeModuleTab === "rbac"
                  ? "bg-slate-900 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔒 Security & RBAC
            </button>
            <button
              onClick={() => setActiveModuleTab("opd")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeModuleTab === "opd"
                  ? "bg-slate-900 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🩺 Outpatient (OPD)
            </button>
            <button
              onClick={() => setActiveModuleTab("ipd")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeModuleTab === "ipd"
                  ? "bg-slate-900 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏥 Inpatient Wards (IPD)
            </button>
            <button
              onClick={() => setActiveModuleTab("pharmacy")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeModuleTab === "pharmacy"
                  ? "bg-slate-900 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💊 Closed-Loop Pharmacy
            </button>
            <button
              onClick={() => setActiveModuleTab("compliance")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeModuleTab === "compliance"
                  ? "bg-slate-900 border border-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚖️ HIPAA & Compliance
            </button>
          </div>

          {/* Active Module Panel Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Left Column: Description & Specs */}
            <div className="md:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-full inline-block">
                  {modulesSummary[activeModuleTab].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {modulesSummary[activeModuleTab].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {modulesSummary[activeModuleTab].desc}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Key Functional Requirements Met:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {modulesSummary[activeModuleTab].points.map((pt, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-slate-100 bg-slate-900 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>{pt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Infographic Representing Hospital System Variables */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono text-slate-450 uppercase block">Active Blueprint Mapping</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">Operational Control Demonstration</span>
                </div>

                {activeModuleTab === "rbac" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-mono">Simulated RBAC Access Level Enforcement Matrix:</p>
                    <div className="space-y-2 text-xs">
                      {modulesSummary.rbac.infographic.map((roleInfo, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                          <div>
                            <span className="font-semibold text-slate-200 block">{roleInfo.role}</span>
                            <span className="text-[9.5px] text-slate-450 font-mono">{roleInfo.access}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                            {roleInfo.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModuleTab === "opd" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-mono font-bold uppercase">Average OPD Patient Consult Pipeline:</p>
                    <div className="space-y-2 text-xs">
                      {modulesSummary.opd.infographic.map((step, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                          <div>
                            <span className="font-semibold text-slate-200 block">{step.step}</span>
                            <span className="text-[10px] text-slate-400">{step.action}</span>
                          </div>
                          <span className="text-[10px] font-mono text-teal-400 font-bold">
                            {step.speed}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModuleTab === "ipd" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-mono font-bold uppercase">Dynamic Bed Ward Analytics Allocation:</p>
                    <div className="space-y-2 text-xs font-mono">
                      {modulesSummary.ipd.infographic.map((ward, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                          <span className="text-slate-200 font-semibold">{ward.floor}</span>
                          <div className="text-right">
                            <span className="text-slate-300 text-[11px] block">{ward.total}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">{ward.occupancy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModuleTab === "pharmacy" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-mono font-bold uppercase">Dispensing Inventory Depot Control Panel:</p>
                    <div className="space-y-2 text-xs font-mono">
                      {modulesSummary.pharmacy.infographic.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                          <span className="text-slate-200 font-semibold text-[11px]">{item.supply}</span>
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px] block">{item.status}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${
                              item.alarm.includes("Refill") ? "text-amber-400 bg-amber-400/5 border border-amber-400/10" : "text-emerald-400 bg-emerald-500/5"
                            }`}>{item.alarm}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModuleTab === "compliance" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-400 font-mono font-bold uppercase">Government Security Safeguards Specifications Checked:</p>
                    <div className="space-y-2 text-xs">
                      {modulesSummary.compliance.infographic.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg font-mono">
                          <div>
                            <span className="font-semibold text-slate-100 block text-[10.5px]">{comp.protocol}</span>
                            <span className="text-[9px] text-slate-500">{comp.spec}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                            {comp.compliance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="pt-6 border-t border-slate-800/60 mt-6 flex flex-col gap-3">
                <p className="text-[10px] text-slate-450 leading-relaxed font-mono">
                  ✨ Real DB updates synchronize across active wards instantly. Start your 14-days free trial to explore this sandbox demo.
                </p>
                <button
                  onClick={() => onLaunchApp(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Evaluate Module live in Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* NEW SECTION: EXPLICIT ROLE-BASED ACCESS CONTROL (RBAC) COMPARISON MATRIX */}
      <section className="bg-slate-900 py-24 px-4 sm:px-8 border-b border-slate-850" id="rbac-section">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase">Interactive Matrix</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Rigid Role-Based Access Control (RBAC) Safeguards
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Hospital operators must enforce absolute boundaries to protect sensitive Patient Health Information (PHI) under strict HIPAA, SOC2, and EU privacy rules. Here is a definitive overview of our platform permissions.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60 backdrop-blur-md">
            <table className="w-full text-left text-xs min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-4 font-bold">HIMS Feature Module</th>
                  <th className="p-4 text-center">Adm. (Director)</th>
                  <th className="p-4 text-center">Physician (MD)</th>
                  <th className="p-4 text-center">Nursing Staff</th>
                  <th className="p-4 text-center">Lab Tech</th>
                  <th className="p-4 text-center">Pharmacist</th>
                  <th className="p-4 text-center">Finance Office</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Clinical SOAP Consults (OPD)</div>
                    <div className="text-[10px] text-slate-500">Record assessment history, diagnostics & medical plans.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                </tr>
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Ward Bed Allocations (IPD)</div>
                    <div className="text-[10px] text-slate-500">Admit, discharge, locate beds, & review ward sheets.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Full Write</td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                </tr>
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Live Biometric Telemetry</div>
                    <div className="text-[10px] text-slate-500">Continuous heart rate, blood oxygen levels & alarm panels.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                </tr>
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Laboratory Information Sys. (LIS)</div>
                    <div className="text-[10px] text-slate-500">Order panels, record biochemical results, & verify labs.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Read-Only</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                </tr>
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Prescriptions Inventory (Pharmacy)</div>
                    <div className="text-[10px] text-slate-500">Track drug supply shelves, dispense e-Rx, & alert low stock.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                </tr>
                <tr className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    <div className="font-sans font-semibold text-[12px] text-white">Itemized Billing Ledger & TPA</div>
                    <div className="text-[10px] text-slate-500">Render ICD-Coded invoices, process insurance, print audits.</div>
                  </td>
                  <td className="p-4 text-center text-emerald-400 font-mono font-bold">Full Write</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-slate-500 font-mono">No Access</td>
                  <td className="p-4 text-center text-emerald-500 font-mono font-bold font-semibold bg-emerald-500/5">Full Write</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-left flex gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Audit-Log Enforcement Triggered Globally</span>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Every single file lookup, prescription validation, diagnostic addition or session verification registers a non-deletable audit ledger object in Firestore schemas. Hospital compliance officers can export complete SOC2 audit worksheets in standard XLSX/CSV anytime.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE FEATURES BENTO SECTION */}
      <section className="bg-slate-950 py-24 px-4 sm:px-8 border-y border-slate-800/65" id="features">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase">Interactive Telemetry & AI Handover Models</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Clinical Quality Fused with Intelligent System Automation
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              We leverage direct cloud container endpoints alongside deep text-generative models to solve classic hospital information blind spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-700/80 transition-all">
              <div className="space-y-3.5">
                <div className="p-3 bg-red-400/10 text-red-400 rounded-xl w-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Live Biometrics Guard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitors active vitals streams and flags biometric anomalies instantly. Tracks heart rate excursions or oxygen desaturations in real time.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono tracking-wider mt-6 inline-flex items-center gap-1">
                Active Guardian Core <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Bento 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-700/80 transition-all">
              <div className="space-y-3.5">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Gemini Shift Handovers</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesizes high-risk patient criteria, pending laboratory follow-ups, and bed allocation into robust SBAR (Situation, Background, Assessment, Recommendation) Shift Briefings in seconds.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono tracking-wider mt-6 inline-flex items-center gap-1">
                AI Handover Desk <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Bento 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-700/80 transition-all">
              <div className="space-y-3.5">
                <div className="p-3 bg-teal-500/10 text-teal-300 rounded-xl w-fit">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Coded Invoice Ledger</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Maintains itemized patient invoicing structures, handles TPA insurance cover, and offers single-click, printable HIPAA-compliant invoices.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono tracking-wider mt-6 inline-flex items-center gap-1">
                Print Ledger Support <ArrowRight className="w-3 h-3" />
              </span>
            </div>

          </div>

          {/* Micro Row for Advanced Security features */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-left md:items-center gap-4 text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Strict HIPAA Compliance & Coded Auditing Logs
              </h4>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Every action is audit-trailed, matching legal regulations. Robust Custom Role-Based Access Control (RBAC) allows administrators to build modular permissions for nurses, physicians, laboratory techs, and financial audit officers.
              </p>
            </div>
            <button 
              onClick={() => onLaunchApp(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold whitespace-nowrap self-start md:self-auto cursor-pointer animate-pulse"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC SAAS SUBSCRIPTION PRICING CALCULATOR */}
      <section className="py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-12" id="calculator">
        <div className="text-center space-y-3">
          <span className="font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase font-semibold">Interactive Calculator</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Estimate Your Monthly Subscription Plan
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Drag the sliders below to compute real-time hosting premiums based on bed volume and diagnostic modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-4">
          <div className="md:col-span-7 bg-slate-955 border border-slate-800/80 p-6 rounded-2xl space-y-6 text-left">
            <h3 className="font-semibold text-sm text-slate-200">1. Adjust Infrastructure Parameters</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium font-sans">Hospital / Clinic Bed Capacity</span>
                <span className="font-mono text-emerald-400 font-bold">{bedCapacity} active beds</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="1000" 
                step="10"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
              />
              <div className="flex justify-between text-[9px] text-slate-550 font-mono">
                <span>10 beds</span>
                <span>500 beds</span>
                <span>1000 beds</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left space-y-0.5 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-200 block">Deploy Google Gemini Deep AI Engine</span>
                  <p className="text-[10px] text-slate-400">Enables vital signs alarm synthesis and automated SBAR shift handovers.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={useAIModules}
                  onChange={(e) => setUseAIModules(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-slate-500 text-[10px] leading-relaxed font-mono flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Hosting runs exclusively on encrypted Google Cloud Platform (GCP) containers inside HIPAA-safe environments. Full database isolation is guaranteed.</span>
            </div>
          </div>

          {/* Pricing readout column */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-2xl flex flex-col justify-between text-left relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-800">
                <span className="text-[9px] font-bold font-mono text-emerald-400 block tracking-widest uppercase">14-DAY FREE TRIAL BUNDLE</span>
                <h4 className="text-lg font-bold text-slate-100 mt-1">MediFlow AI SaaS Tier</h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-350 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="font-sans">Base core system engine</span>
                  <span className="text-white">${baseCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">SaaS beds scale ({bedCapacity} beds)</span>
                  <span className="text-white">${(bedCapacity * costPerBed)}</span>
                </div>
                {useAIModules && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="font-sans">Google Gemini AI integration</span>
                    <span className="font-bold">${aiSuitePremium}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="pb-3 pt-3 border-t border-slate-800/85">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Subscription Premium</span>
                <div className="flex items-baseline gap-1 mt-1 text-emerald-400 font-mono">
                  <span className="text-3xl sm:text-4xl font-extrabold">${totalCalculatedSaaSPrice}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <span className="text-[9.5px] text-amber-400 font-mono mt-1.5 block">⚡ Trial Period runs for 14 Days – No Credit Card Required</span>
              </div>

              <button 
                onClick={() => onLaunchApp(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                id="saas_calculator_cta"
              >
                <span>Deploy SaaS Sandbox Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING MATRIX PLANS */}
      <section className="bg-slate-955 py-24 px-4 sm:px-8 border-t border-slate-850" id="pricing">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase font-bold">Standard Tiers</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Pre-Packaged Hospital Subscription Plans
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Transparent, scalable monthly tiers. Every account gets full 14-day free trial features. Absolutely no credit card details requested today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Plan 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block mb-1">14-Day Free Trial Available</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Outpatient Clinic Tier</h3>
                  <p className="text-xs text-slate-400 mt-1">Best suited for private practices, nursing clinics, and local health checks.</p>
                </div>
                <div className="flex items-baseline font-mono text-emerald-400 pt-2">
                  <span className="text-3xl font-extrabold text-white">$249</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Up to 50 Outpatient records</li>
                  <li className="flex items-center gap-2">✓ Real-time OPD consultations</li>
                  <li className="flex items-center gap-2">✓ Standard Pharmacy stock track</li>
                  <li className="text-slate-550">✗ No active Ward IPD bedding</li>
                  <li className="text-slate-550">✗ No automated Gemini diagnostics</li>
                </ul>
              </div>
              <button 
                onClick={() => onLaunchApp(true)}
                className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-semibold py-2.5 cursor-pointer transition-colors"
              >
                Start Free Trial
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-between text-left relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/50 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-slate-950 font-mono text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                RECOMMENDED CORE
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block mb-1">14-Day Free Trial Available</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Multi-Ward EHR Core</h3>
                  <p className="text-xs text-slate-400 mt-1">Excellent for mid-size inpatient surgical centers and district medical groups.</p>
                </div>
                <div className="flex items-baseline font-mono text-emerald-400 pt-2">
                  <span className="text-3xl font-extrabold text-white">$699</span>
                  <span className="text-xs text-slate-355">/ month</span>
                </div>
                <ul className="text-xs text-slate-305 space-y-2 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Unlimited OPD Outpatients</li>
                  <li className="flex items-center gap-2">✓ Complete Bed Allocations (IPD)</li>
                  <li className="flex items-center gap-2 text-emerald-400 font-semibold">✓ Live Biometric Telemetry Graph</li>
                  <li className="flex items-center gap-2">✓ Itemized Pathology & pharmacy</li>
                  <li className="flex items-center gap-2 font-semibold text-emerald-400">✓ Gemini 24-Hour Ward Reports</li>
                </ul>
              </div>
              <button 
                onClick={() => onLaunchApp(true)}
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold py-2.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
              >
                Start Free Trial
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider block mb-1">14-Day Free Trial Available</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Enterprise Healthcare</h3>
                  <p className="text-xs text-slate-400 mt-1">Engineered for ultimate scale. Supports large medical centers or municipal health networks.</p>
                </div>
                <div className="flex items-baseline font-mono text-emerald-400 pt-2">
                  <span className="text-3xl font-extrabold text-white">$1299</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Multi-hospital tenant isolation</li>
                  <li className="flex items-center gap-2">✓ 99.99% uptime SLAs with dedicated cluster</li>
                  <li className="flex items-center gap-2">✓ Custom HL7 / FHIR EMR synchronization</li>
                  <li className="flex items-center gap-2">✓ Dedicated clinical support manager</li>
                  <li className="flex items-center gap-2">✓ Custom RBAC permission schemas</li>
                </ul>
              </div>
              <button 
                onClick={() => onLaunchApp(true)}
                className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2.5 border border-slate-700 cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. COMPLIANCE & TRUST SEAL ACCENTS */}
      <section className="py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-8" id="compliance">
        <div className="border border-slate-800 bg-slate-950/60 rounded-2xl p-6 sm:p-10 text-left flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase block">Federal Security standard Compliant</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              SaaS Infrastructure Crafted to Guard Sensitive PHI Data
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              MediFlow AI satisfies all state-level legal criteria for the transfer and security of Protected Health Information (PHI). We sign Business Associate Agreements (BAA) with all clinical groups, with 256-bit encryption on databases both in transit and at rest.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 justify-center text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-905 border border-slate-800 p-2 px-3 rounded-lg text-slate-302">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> HIPAA LEVEL COMPLIANT
            </div>
            <div className="flex items-center gap-1.5 bg-slate-905 border border-slate-800 p-2 px-3 rounded-lg text-slate-302">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> HL7 / FHIR INTERFACE
            </div>
            <div className="flex items-center gap-1.5 bg-slate-905 border border-slate-800 p-2 px-3 rounded-lg text-slate-302">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SOC2 SPECIFICATION PASSED
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 bg-slate-950 text-slate-500 border-t border-slate-800 text-center text-[10px] font-mono select-none">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-bold font-sans">MediFlow AI</span>
          </div>
          <div>Hospital Information Management Systems SaaS Platform • Live Demo Sandbox</div>
          <div>© {new Date().getFullYear()} MediFlow Technologies. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
}
