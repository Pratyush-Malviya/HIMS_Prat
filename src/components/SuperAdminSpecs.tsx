import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Search, 
  BookOpen, 
  Activity, 
  Database, 
  Users, 
  ShieldAlert, 
  Workflow, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Menu, 
  ChevronRight,
  TrendingUp,
  MapPin,
  FolderOpen
} from "lucide-react";

interface DocSection {
  title: string;
  category: "Overview" | "Workflows" | "Data Model" | "Integration" | "Security" | "Implementation" | "GTM";
  content: string;
  bulletPoints?: string[];
  codeSnippet?: string;
}

export function SuperAdminSpecs() {
  const [selectedDoc, setSelectedDoc] = useState<
    "part2" | "part3" | "summary" | "roadmap" | "ref"
  >("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Trigger temporary copied feedback hook
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Structured Documents for Real-time Search and Rendering
  const docData = useMemo(() => {
    return {
      summary: {
        title: "Executive Summary & Index",
        description: "High-level overview of the complete multi-departmental MediFlow AI HIMS enterprise platform.",
        stats: { docs: "4 Documents", words: "50,000+ Words", security: "HIPAA Compliant", tech: "REST / HL7 / FHIR" },
        sections: [
          {
            title: "Executive Summary & Strategic Objectives",
            category: "Overview",
            content: "The MediFlow AI HIMS is designed to achieve absolute operational harmony across 19 hospital departments. It utilizes a cloud-native, multi-tenant database approach ensuring high security, real-time vital telemetry streams, and modern clinical decision-making protocols. Dynamic super-admin control permits real-time module toggle depending on hospital budgets and operational constraints.",
            bulletPoints: [
              "Activate/deactivate 20+ clinical and operations modules in real-time.",
              "Enforce strict role-based access control with granular permissions.",
              "Leverage Google Gemini API server-side for automated SBAR clinical handover reports.",
              "Ensure total row-level database isolations supporting multi-tenant enterprise setups."
            ]
          },
          {
            title: "Six-Phase System Implementation Approach",
            category: "Implementation",
            content: "An orderly timeline transitions medical centers from fragmented paper charts to unified clinical screens, ensuring safety checkpoints and robust change management guidelines.",
            bulletPoints: [
              "Phase 1: Database foundation setup, tenant configuration, and administrative control tower launch.",
              "Phase 2: EHR Clinical note templates, CPOE, and active lab/radiology integrations.",
              "Phase 3: High-acuity critical care modules (Emergency Department medical triage, ICU, and Surgery).",
              "Phase 4: Pharmacy automated inventory tracking, dispensing, and barcode verification.",
              "Phase 5: Advanced AI-powered SBAR summaries, analytics, patient portals, and mobile clinics.",
              "Phase 6: Multi-site hospital expansions and advanced clinical decision guidance."
            ]
          }
        ] as DocSection[]
      },
      part2: {
        title: "User Flows, Data Models & Security",
        description: "Technical specification covering DB entity relationships, API communication end-points, and HIPAA compliance controls.",
        stats: { entities: "11 Entities", transit: "TLS 1.3", atRest: "AES-256", rto: "4 Hours RTO" },
        sections: [
          {
            title: "Complete Clinical Workflows by Role",
            category: "Workflows",
            content: "Step-by-step navigation tracks the daily care routines of professionals ensuring zero transcription mishaps.",
            bulletPoints: [
              "Emergency Physician: Reviews ESI color codes, performs swift diagnostic CPOE orders, acts on critical lab values, and dictates notes via AI voice services.",
              "ED Nurse: Undertakes initial triage, records starting vital signs, triggers parallel paperless registration, and performs barcode-verified medication rounds.",
              "ICU Nurse: Titrates vasoactive medication infusion lines, monitors continuous vital streams, updates SBAR shift logs, and manages mechanical ventilator settings.",
              "Cardiologist: Directs cath-lab procedures, interprets ECG tracings, schedules stent implants, and audits pacemakers."
            ]
          },
          {
            title: "Core Data Entities & PostgreSQL Constraints",
            category: "Data Model",
            content: "The system is structured as highly normalized entities with rigid referential integrity protecting the patient audit trail.",
            codeSnippet: `CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  biological_sex VARCHAR(10) CHECK (biological_sex IN ('Male','Female')),
  allergies TEXT[],
  code_status VARCHAR(20) DEFAULT 'Full Code'
);

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  encounter_type VARCHAR(20) CHECK (encounter_type IN ('OPD','IPD','ED','ICU','OR')),
  chief_complaint TEXT,
  admit_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'In Progress'
);`
          },
          {
            title: "API Endpoint Specifications for Hospital Partners",
            category: "Integration",
            content: "External medical appliances and local laboratory analyzers connect via standardized HTTP headers carrying cryptographically signed tokens.",
            bulletPoints: [
              "GET /api/v1/patients/{id}/medications - List patient current medications",
              "POST /api/v1/orders/lab - Place laboratory panel order with priority flag",
              "GET /api/v1/results/{id} - Retrieve patient blood/gas testing final values"
            ],
            codeSnippet: `// Example POST /api/v1/orders/lab
{
  "encounterId": "enc-9273-0",
  "priority": "STAT",
  "panels": ["Troponin_Serial", "CMP"],
  "clinicalIndication": "Acute onset substernal chest pain with diaphoresis"
}`
          },
          {
            title: "HIPAA Security Rule Implementation",
            category: "Security",
            content: "Strict multi-dimensional security layers guard ePHI (electronic Protected Health Information) and log security incidents.",
            bulletPoints: [
              "Access Control: Granular role-to-permission mapping prevents non-clinical users from accessing health notes.",
              "Audit Trial Logging: Log every read, update, or export with immutable logs retained for 7 years.",
              "Inactivity Timeouts: Lock workstations automatically after 15 minutes of idle state.",
              "MFA Enforcement: Mandatory hardware security key or TOTP code during employee login."
            ]
          }
        ] as DocSection[]
      },
      part3: {
        title: "Departmental Modules & Workflows",
        description: "Granular operational details for Emergency, ICU, Surgery, Laboratory, Pharmacy, and Radiology.",
        stats: { departments: "20 Covered", triage: "ESI 1-5 Auto", narcotics: "DEA Compliant", imaging: "PACS Rest API" },
        sections: [
          {
            title: "Emergency Department Module (ED)",
            category: "Workflows",
            content: "The ED requires high-speed triaging and bed status coordination. It contains automated ESI algorithms.",
            bulletPoints: [
              "Fast-Track Triage: Parallel track registration and assessment workflows.",
              "Emergency Severity Index: Automatic alert triggers on score of ESI-1 and ESI-2.",
              "Trauma Incident Protocols: Switches to disaster mode immediately executing START triage.",
              "Real-time Bed Board: Continuous monitoring of patient wait times and door-to-balloon milestones."
            ]
          },
          {
            title: "Intensive Care Unit (ICU) Operations",
            category: "Workflows",
            content: "ICU modules feature dense telemetry overlays, continuous medication infusion calculations, and weaning procedures.",
            bulletPoints: [
              "Vital Telemetry Streaming: Continuous WebSocket telemetry showing heart rate and arterial pressure.",
              "Infusion validation: Dose check against patient weight preventing life-threatening dosage errors.",
              "Ventilation status tracking: Monitor FiO2, PEEP, and tidal volume ensuring ARDS safety.",
              "Severity Prognostication: Auto-calculation of SOFA, APACHE IV, and SAPS III profiles."
            ]
          },
          {
            title: "Surgery & Operating Theatre Tracker",
            category: "Workflows",
            content: "Surgical safety is managed via pre-operative checklists, OR resource monitors, and implant tracking logs.",
            bulletPoints: [
              "WHO Surgical Checklist: Interactive Sign-In, Time-Out, and Sign-Out safety compliance gates.",
              "Implant verification: Capture product barcodes and lot numbers supporting post-surgery product recalls.",
              "PACU discharge triggers: Track recovery progress against standardized clinical exit guidelines."
            ]
          },
          {
            title: "Pharmacy & LIS Laboratory Workflows",
            category: "Integration",
            content: "The LIS auto-accepts analyzer results while Pharmacy manages narcotics with DEA audit ledgers.",
            bulletPoints: [
              "Levey-Jennings charting: Dynamic Quality Control validation for lab biochem analyzers.",
              "FEFO Inventory: First-Expiration-First-Out medication sorting reducing operational waste.",
              "Narcotic audit log: Full transaction trail for Schedule II-V substances with twin witness requirements."
            ]
          }
        ] as DocSection[]
      },
      roadmap: {
        title: "Features & Priority Roadmap",
        description: "Actionable feature categories, implementation tiers, sequencing dependencies, and development timelines.",
        stats: { features: "24 Major", tier1: "Months 1-4", tier2: "Months 5-8", tier3: "Months 9-14" },
        sections: [
          {
            title: "Tier 1: Foundation Features (Months 1-4)",
            category: "Implementation",
            content: "Establish primary SaaS infrastructure, organization managers, and user security models.",
            bulletPoints: [
              "Core Patient Registration Profile builder with fuzzy-match duplicate prevention.",
              "Secure authentication featuring TOTP multi-factor logins.",
              "Super-Admin subscription panel supporting dynamic billing plan changes."
            ]
          },
          {
            title: "Tier 2: Clinical Documentation (Months 5-8)",
            category: "Implementation",
            content: "Provide doctors and nurses with rich digital charting tools and Computerized Physician Order Entry.",
            bulletPoints: [
              "EHR Note templates supporting structured physical examinations and assessment charts.",
              "CPOE medical interaction checking with dynamic kidney/renal drug dose adjustments.",
              "Interfaced lab and radiology diagnostic result grids with abnormal value highlighting."
            ]
          },
          {
            title: "Tier 3: Critical telemetry & Surgery (Months 9-14)",
            category: "Implementation",
            content: "Build specialized telemetry modules and surgery coordination tools.",
            bulletPoints: [
              "WebSocket telemetry streams linking ICU patient monitors with nurse terminals.",
              "WHO Surgical Safety Gate form components showing real-time surgeon credentials.",
              "ICU Vasoactive titration log keeping track of cumulative infusion volumes."
            ]
          }
        ] as DocSection[]
      },
      ref: {
        title: "Quick-Start Reference & Matrix",
        description: "Reading sequences mapped by customer role, and pricing matrix parameters.",
        stats: { roles: "7 Evaluated", segments: "3 Main", market: "$2-3B Size", target: "Mid-Market" },
        sections: [
          {
            title: "Role-Based Reading Frameworks",
            category: "GTM",
            content: "Accelerate evaluation based on stakeholder responsibilities and target workflows.",
            bulletPoints: [
              "Hospital IT Director: Focus on Part 2 (security, architecture, HL7 standards, APIs). Recommended reading: 2 hours.",
              "Chief Nursing Officer: Focus on Part 1 and Part 3 (ED flow, ICU documentation, nursing MAR check).",
              "SaaS PM & Engineer: Focus on Implementable Features Guide, data schemas, and API end-points.",
              "SaaS CEO: Focus on Complete GTM Strategy, Customer Acquisition Economics, and Pricing Matrix."
            ]
          },
          {
            title: "Hospital Customer Segmentation",
            category: "GTM",
            content: "Targets the community hospital ecosystem where traditional software is too complex and expensive.",
            bulletPoints: [
              "Segment A: Mid-Market Community Hospitals (100-500 beds). Primary target, high fragmentation pain.",
              "Segment B: Large Academic Medical Centers (500+ beds). Secondary target, requiring complex PACS.",
              "Segment C: Critical Access & Rural Hospitals (<100 beds). Budget-conscious cloud SaaS targets."
            ]
          }
        ] as DocSection[]
      }
    };
  }, []);

  const selectedDocument = docData[selectedDoc];

  // Search Filter over sections
  const filteredSections = useMemo(() => {
    if (!searchQuery) return selectedDocument.sections;
    const query = searchQuery.toLowerCase();
    return selectedDocument.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.content.toLowerCase().includes(query) ||
        (sec.bulletPoints && sec.bulletPoints.some((b) => b.toLowerCase().includes(query)))
    );
  }, [searchQuery, selectedDocument]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 text-left relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">HIMS Specification Core</span>
              <span className="text-[10px] uppercase tracking-widest bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">V2.0 May 2026</span>
            </div>
            <h2 className="text-xl font-bold mt-3 tracking-tight">SaaS Core Knowledge Hub & GTM Resource Center</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Browse, search, and copy enterprise architectural specifications, user flows, data models, compliance protocols, and GTM blueprints of the MediFlow platform.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <FolderOpen className="text-emerald-400 w-5 h-5 flex-shrink-0" />
            <div className="text-left font-mono">
              <p className="text-[10px] text-slate-400 leading-tight">REPOSITORY LOCATION</p>
              <p className="text-xs text-slate-200 font-bold">/docs/*.md</p>
            </div>
          </div>
        </div>

        {/* Highlight Stats of Selected Doc */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          {Object.entries(selectedDocument.stats).map(([key, val]) => (
            <div key={key} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <p className="text-slate-500 uppercase font-mono text-[9px] tracking-wider mb-1">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-slate-100 font-bold text-sm tracking-tight">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
        {/* Document Selection Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-1">SPECIFICATION VOLUMES</p>
          <div className="space-y-1 bg-white border border-slate-150 rounded-2xl p-3 shadow-sm select-none">
            <button
              onClick={() => { setSelectedDoc("summary"); setSearchQuery(""); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                selectedDoc === "summary"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <BookOpen className={`w-5 h-5 mt-0.5 ${selectedDoc === "summary" ? "text-emerald-400" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Executive Summary</p>
                <p className={`text-[10px] mt-0.5 ${selectedDoc === "summary" ? "text-slate-400" : "text-slate-555 text-slate-500"}`}>Summary & Table Index</p>
              </div>
            </button>

            <button
              onClick={() => { setSelectedDoc("part2"); setSearchQuery(""); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                selectedDoc === "part2"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Database className={`w-5 h-5 mt-0.5 ${selectedDoc === "part2" ? "text-emerald-400" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Part 2 Spec</p>
                <p className={`text-[10px] mt-0.5 ${selectedDoc === "part2" ? "text-slate-400" : "text-slate-555 text-slate-500"}`}>User Flows, DB, security</p>
              </div>
            </button>

            <button
              onClick={() => { setSelectedDoc("part3"); setSearchQuery(""); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                selectedDoc === "part3"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Workflow className={`w-5 h-5 mt-0.5 ${selectedDoc === "part3" ? "text-emerald-400" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Part 3 Spec</p>
                <p className={`text-[10px] mt-0.5 ${selectedDoc === "part3" ? "text-slate-400" : "text-slate-555 text-slate-500"}`}>ED, ICU, Surgery clinicals</p>
              </div>
            </button>

            <button
              onClick={() => { setSelectedDoc("roadmap"); setSearchQuery(""); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                selectedDoc === "roadmap"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <TrendingUp className={`w-5 h-5 mt-0.5 ${selectedDoc === "roadmap" ? "text-emerald-400" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Features Roadmap</p>
                <p className={`text-[10px] mt-0.5 ${selectedDoc === "roadmap" ? "text-slate-400" : "text-slate-555 text-slate-500"}`}>Actionable product tiers</p>
              </div>
            </button>

            <button
              onClick={() => { setSelectedDoc("ref"); setSearchQuery(""); }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                selectedDoc === "ref"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Users className={`w-5 h-5 mt-0.5 ${selectedDoc === "ref" ? "text-emerald-400" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Reference Index</p>
                <p className={`text-[10px] mt-0.5 ${selectedDoc === "ref" ? "text-slate-400" : "text-slate-555 text-slate-500"}`}>Role guide & pricing scale</p>
              </div>
            </button>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-150 space-y-3 text-xs leading-normal">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="text-emerald-500 w-4 h-4 flex-shrink-0" />
              SaaS Strategic Goal
            </h4>
            <p className="text-emerald-800 text-[11px]">
              MediFlow is positioned for 2,000 community hospitals, targeting 5% capture for <strong>$10M+ ARR</strong>. 100% of ePHI parameters adhere strictly to HIPAA criteria.
            </p>
          </div>
        </div>

        {/* Content Viewer Main Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-150 rounded-2xl p-4 shadow-sm">
            {/* Realtime filter input */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search within "${selectedDocument.title}"...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 pl-10 rounded-xl outline-none font-semibold text-xs focus:border-slate-400"
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex-shrink-0 self-center">
              Showing {filteredSections.length} of {selectedDocument.sections.length} sections
            </div>
          </div>

          {/* Render Sections */}
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800">No matching requirements found</h4>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  Try revising your search query or switch to another specification volume on the left sidebar.
                </p>
              </div>
            ) : (
              filteredSections.map((sec, idx) => (
                <div key={idx} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm text-left relative space-y-4">
                  {/* Floating category badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {sec.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">Section {idx + 1}</span>
                    </div>

                    <button 
                      onClick={() => handleCopy(
                        sec.content + (sec.bulletPoints ? "\n" + sec.bulletPoints.join("\n") : ""), 
                        `${selectedDoc}-sec-${idx}`
                      )}
                      className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-50 rounded-lg transition"
                      title="Copy Section contents"
                    >
                      {copiedText === `${selectedDoc}-sec-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{sec.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.content}</p>

                  {/* Render Bullets */}
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="space-y-2.5 pt-2">
                      {sec.bulletPoints.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs font-semibold text-slate-700 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Render Code snippet/schema */}
                  {sec.codeSnippet && (
                    <div className="mt-4 relative">
                      <div className="absolute right-3 top-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        schema
                      </div>
                      <pre className="p-4 bg-slate-950 text-slate-300 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed select-text border border-slate-900">
                        <code>{sec.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
