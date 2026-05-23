import React, { useState } from "react";
import { 
  CheckSquare, 
  Square, 
  Building2, 
  TrendingUp, 
  Users, 
  Activity, 
  HelpCircle,
  Database,
  Briefcase,
  PlayCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { HospitalTenant } from "./SuperAdminHospitals";

interface SuperAdminOnboardingProps {
  tenants: HospitalTenant[];
}

interface OnboardingTask {
  id: string;
  category: "Legal" | "Migration" | "Training" | "Hardware";
  label: string;
  desc: string;
}

const GLOBAL_ONBOARDING_CHECKLIST: OnboardingTask[] = [
  { id: "baa", category: "Legal", label: "Business Associate Agreement (BAA)", desc: "Signed HIPAA Data Protection agreement fully uploaded & archived." },
  { id: "import", category: "Migration", label: "Legacy EHR Data Import", desc: "Patient demography & historical allergy charts integrated from CSV files." },
  { id: "staff", category: "Training", label: "Doctor & Nurse Roster Training", desc: "Core clinical modules walkthrough with certification score check list completed." },
  { id: "lis", category: "Hardware", label: "LIS/PACS Machine Handshake", desc: "Direct IP integration mapped for laboratory blood analyzer and radiology PACS." },
  { id: "domain", category: "Legal", label: "Custom DNS CNAME Active", desc: "Tenant specific entry routed through nginx edge proxy routers." }
];

export function SuperAdminOnboarding({ tenants }: SuperAdminOnboardingProps) {
  // Track onboarding completions in local state reactively per tenant
  const [completedStates, setCompletedStates] = useState<Record<string, string[]>>({
    "hosp-alpha": ["baa", "import", "staff", "domain"], // 80% Go Live
    "hosp-beta": ["baa"], // 20% Go Live
    "hosp-gamma": ["baa", "import", "staff", "lis", "domain"], // 100% Go Live Complete
    "hosp-fallback-1": ["baa", "import"] // 40%
  });

  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.uid || "hosp-alpha");

  const [migrationSLA, setMigrationSLA] = useState<string>("In Progress - On schedule");
  const [isSavingSLA, setIsSavingSLA] = useState(false);

  const activeTenant = tenants.find(t => t.uid === selectedTenantId) || tenants[0];
  const activeCompleted = completedStates[selectedTenantId] || [];

  const handleToggleTask = (taskId: string) => {
    if (!selectedTenantId) return;
    const current = completedStates[selectedTenantId] || [];
    let next: string[];
    if (current.includes(taskId)) {
      next = current.filter(id => id !== taskId);
    } else {
      next = [...current, taskId];
    }
    setCompletedStates(prev => ({
      ...prev,
      [selectedTenantId]: next
    }));
  };

  const computeProgress = (uid: string) => {
    const list = completedStates[uid] || [];
    return Math.round((list.length / GLOBAL_ONBOARDING_CHECKLIST.length) * 100);
  };

  const handleSaveSLA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSLA(true);
    setTimeout(() => setIsSavingSLA(false), 800);
  };

  return (
    <div className="space-y-6" id="onboarding_module_grid">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white border border-slate-150 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Go-Live Deployments</span>
            <span className="text-2xl font-bold font-sans tracking-tight text-emerald-600 block mt-1">
              {tenants.filter(t => computeProgress(t.uid) === 100).length}
            </span>
            <span className="text-slate-400 text-[10px] block mt-0.5">100% Onboardings Finished</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Active Onboarding Queue</span>
            <span className="text-2xl font-bold font-sans tracking-tight text-indigo-600 block mt-1">
              {tenants.filter(t => computeProgress(t.uid) < 100).length}
            </span>
            <span className="text-slate-400 text-[10px] block mt-0.5">Under Implementation</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl flex items-center justify-between shadow-xs border-dashed">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Average Readiness Rate</span>
            <span className="text-2xl font-bold font-sans tracking-tight text-slate-800 block mt-1">
              {tenants.length > 0 ? Math.round(tenants.reduce((sum, t) => sum + computeProgress(t.uid), 0) / tenants.length) : 0}%
            </span>
            <span className="text-slate-400 text-[10px] block mt-0.5">Across All SaaS Tenants</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Selecting Tenant */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs space-y-3">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">SaaS Client Implementation list</h4>
            <p className="text-[10px] text-slate-400">Filter on clients to monitor data migration and staff training checklists.</p>
          </div>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
            {tenants.map(t => {
              const score = computeProgress(t.uid);
              const isSelected = t.uid === selectedTenantId;
              
              return (
                <div 
                  key={t.uid}
                  onClick={() => setSelectedTenantId(t.uid)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-50/50 text-slate-900" 
                      : "border-slate-100 bg-slate-50/20 hover:bg-slate-50/70 text-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs truncate max-w-[170px]">{t.name}</span>
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200">
                      {score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${score === 100 ? "bg-emerald-500" : score > 50 ? "bg-indigo-500" : "bg-amber-500"}`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-mono">
                    <span>Admin: {t.email}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Checklist detailing */}
        <div className="lg:col-span-2 space-y-4">
          {activeTenant ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-5 text-left">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-bold">Onboarding & Migration Board</div>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">{activeTenant.name} Implementation</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">Go-Live Readiness Check:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                    computeProgress(activeTenant.uid) === 100 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {computeProgress(activeTenant.uid) === 100 ? "✓ READY FOR PRODUCTION" : "🚧 IMPLEMENTING PHASE"}
                  </span>
                </div>
              </div>

              {/* Checklist list */}
              <div className="space-y-3 pt-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold select-none">MILISTONES PROGRESS CHECKLIST:</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GLOBAL_ONBOARDING_CHECKLIST.map(task => {
                    const isChecked = activeCompleted.includes(task.id);
                    return (
                      <div 
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer select-none transition-all flex gap-3 items-start text-left ${
                          isChecked 
                            ? "border-emerald-500 bg-emerald-500/5 text-slate-800" 
                            : "border-slate-150 bg-white hover:bg-slate-50/50 text-slate-600"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5 text-emerald-600">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 fill-emerald-100" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="space-y-0.5 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="text-[9px] font-mono px-1 bg-slate-150 uppercase tracking-wider rounded text-slate-500">{task.category}</span>
                            <span>{task.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-normal text-slate-455 text-slate-400 mt-0.5">{task.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Migration SLA Settings */}
              <form onSubmit={handleSaveSLA} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-slate-400 font-extrabold select-none">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Legacy Data Migration Tracker & SLA Notes</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase">Migration SLA Pipeline Status</label>
                    <input
                      type="text"
                      value={migrationSLA}
                      onChange={(e) => setMigrationSLA(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 text-slate-800 rounded-lg outline-none text-xs font-semibold focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSavingSLA}
                      className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                    >
                      {isSavingSLA ? "Updating..." : "Update Pipeline"}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-150 rounded-2xl">
              Select an ongoing onboarding cohort to begin checklist verification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
