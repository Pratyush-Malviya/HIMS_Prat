import React, { useState } from "react";
import { 
  Building2, 
  Hospital, 
  Search, 
  Plus, 
  Trash2, 
  Globe, 
  Settings2, 
  Sliders, 
  FileText,
  Clock,
  ShieldCheck,
  Check,
  Building,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { HIMSStore } from "../useHIMSStore";

export interface HospitalTenant {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isPaid: boolean;
  paymentPlan: string;
  notes?: string;
  location?: string;
  subBranches?: string[];
  supportTier?: "Standard" | "Priority VIP" | "Dedicated SLA";
  customDomain?: string;
  brandColor?: string;
  brandSlogan?: string;
  activeModules?: string[];
}

interface SuperAdminHospitalsProps {
  store: HIMSStore;
  tenants: HospitalTenant[];
  setTenants: React.Dispatch<React.SetStateAction<HospitalTenant[]>>;
  onOpenQuotas: (tenant: HospitalTenant) => void;
  onTogglePaid: (tenant: HospitalTenant) => void;
  onDeleteTenant: (uid: string, name: string) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function SuperAdminHospitals({
  store,
  tenants,
  setTenants,
  onOpenQuotas,
  onTogglePaid,
  onDeleteTenant,
  onOpenAddModal,
  searchQuery,
  setSearchQuery
}: SuperAdminHospitalsProps) {
  const [selectedTenant, setSelectedTenant] = useState<HospitalTenant | null>(null);
  
  // White Label / Custom Configuration form state
  const [customDomain, setCustomDomain] = useState("");
  const [brandColor, setBrandColor] = useState("emerald");
  const [brandSlogan, setBrandSlogan] = useState("");
  const [supportTier, setSupportTier] = useState<"Standard" | "Priority VIP" | "Dedicated SLA">("Standard");
  const [activeModules, setActiveModules] = useState<string[]>(["opd", "ipd", "labs", "pharmacy", "finance"]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter tenants
  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTenant = (tenant: HospitalTenant) => {
    setSelectedTenant(tenant);
    setCustomDomain(tenant.customDomain || `${tenant.uid}.mediflow.io`);
    setBrandColor(tenant.brandColor || "emerald");
    setBrandSlogan(tenant.brandSlogan || "Excellence in Patient Operations");
    setSupportTier(tenant.supportTier || "Standard");
    setActiveModules(tenant.activeModules || ["opd", "ipd", "labs", "pharmacy", "finance"]);
    setSaveSuccess(false);
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setTenants(prev => prev.map(t => {
      if (t.uid === selectedTenant.uid) {
        return {
          ...t,
          customDomain,
          brandColor,
          brandSlogan,
          supportTier,
          activeModules
        };
      }
      return t;
    }));

    store.createLog(
      "SaaS Super Admin",
      "Executive Ops Manager",
      "Configure Tenant Custom Slogan & Modules",
      "Branding Desk",
      `Upgraded whitelist metrics on tenant ${selectedTenant.name} (Custom domain: ${customDomain}, SLA Tier: ${supportTier}, Enabled Modules: ${activeModules.join(", ")})`
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleModule = (modId: string) => {
    if (activeModules.includes(modId)) {
      setActiveModules(activeModules.filter(m => m !== modId));
    } else {
      setActiveModules([...activeModules, modId]);
    }
  };

  return (
    <div className="space-y-6" id="super_admin_tenants_tab_root">
      
      {/* Search and List Split Configuration */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: List of clinical tenants */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Multi-Tenant Global Workspaces</h4>
                <p className="text-[11px] text-slate-400 font-normal">SaaS Client nodes registered across cloud clusters.</p>
              </div>
              
              <div className="relative max-w-xs w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-xs rounded-xl outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {filtered.map(tenant => {
                const isSelected = selectedTenant?.uid === tenant.uid;
                const modulesCount = tenant.activeModules ? tenant.activeModules.length : 5;
                const domainStr = tenant.customDomain || `${tenant.uid}.mediflow.io`;

                return (
                  <div 
                    key={tenant.uid}
                    onClick={() => handleSelectTenant(tenant)}
                    className={`p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none ${
                      isSelected ? "bg-slate-50 border-l-4 border-emerald-500" : "hover:bg-slate-50/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Hospital className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800 text-xs">{tenant.name}</span>
                        {tenant.isPaid ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-mono font-bold uppercase border border-emerald-100">
                            PAID SYSTEM
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[8px] font-mono font-bold uppercase border border-amber-100">
                            DEMO TRIAL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>Admin: {tenant.email}</span>
                        <span>•</span>
                        <span>ID: {tenant.uid}</span>
                        <span>•</span>
                        <span className="text-slate-450 text-slate-400">DNS: {domainStr}</span>
                      </div>
                      <div className="flex gap-2 items-center text-[9px] font-medium text-slate-400">
                        <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-600">Tier: {tenant.supportTier || "Standard"}</span>
                        <span>•</span>
                        <span>{modulesCount} Activated Modules</span>
                        <span>•</span>
                        <span>Location: {tenant.location || "Mumbai Hub"}</span>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex gap-1 self-start md:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuotas(tenant);
                        }}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[9px] font-mono font-bold"
                        title="Adjust CPU and ward beds quotas"
                      >
                        Adjust Quotas
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePaid(tenant);
                        }}
                        className={`px-2.5 py-1 rounded border text-[9px] font-mono font-bold ${
                          tenant.isPaid 
                            ? "bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {tenant.isPaid ? "Downgrade" : "Authorize Paid"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTenant(tenant.uid, tenant.name);
                        }}
                        className="p-1 rounded bg-red-50 text-red-500 border border-red-150 hover:bg-red-100"
                        title="Permanently erase tenant database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No SaaS nodes matching reference search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: White label controls & Custom Module Activates */}
        <div className="space-y-4">
          {selectedTenant ? (
            <form onSubmit={handleSaveConfigs} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4 text-xs font-semibold text-slate-650 text-slate-600">
              <div className="pb-3 border-b border-slate-100">
                <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-bold">White-Label Customization</div>
                <h4 className="text-sm font-bold text-slate-800 mt-0.5">{selectedTenant.name} Settings</h4>
              </div>

              {/* Success Banner */}
              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[10px] font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Branding and domain settings published to proxy router successfully!</span>
                </div>
              )}

              {/* Custom Domain Input */}
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Isolated Host Domain / Ingress Route</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-400 text-[10px] font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-r-lg outline-none text-xs focus:border-slate-400"
                    placeholder="e.g. apollo-clinic.mimsops.in"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-normal">Configures custom DNS mapping without compromising cross-tenant secure isolation boundaries.</p>
              </div>

              {/* Brand Slogan */}
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Custom Corporate Slogan</label>
                <input
                  type="text"
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-850 rounded-lg outline-none text-slate-800 focus:border-slate-400"
                  placeholder="e.g. Advancing Clinical Outcomes Together"
                />
              </div>

              {/* Grid 2-column: Colors & support Tier */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Brand Color Accent</label>
                  <select
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-slate-800 outline-none"
                  >
                    <option value="emerald">Emerald Teal (Default)</option>
                    <option value="indigo">Royal Indigo</option>
                    <option value="rose">Pediatric Crimson Rose</option>
                    <option value="sky">Cardiology Sky Blue</option>
                    <option value="violet">Oncology Violet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">SLA Support Level</label>
                  <select
                     value={supportTier}
                     onChange={(e) => setSupportTier(e.target.value as any)}
                     className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-slate-800 outline-none"
                  >
                    <option value="Standard">Standard (99.0% SLA)</option>
                    <option value="Priority VIP">Priority VIP (99.9% SLA)</option>
                    <option value="Dedicated SLA">Dedicated SLA (99.99%)</option>
                  </select>
                </div>
              </div>

              {/* Department/Module activations checkbox */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Module Access toggles (PRD Plan Scope)</label>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2 text-slate-700">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="checkbox" 
                        id="opdMod" 
                        checked={activeModules.includes("opd")} 
                        onChange={() => toggleModule("opd")}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <label htmlFor="opdMod" className="cursor-pointer select-none">OPD Consultation & Token queues</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="checkbox" 
                        id="ipdMod" 
                        checked={activeModules.includes("ipd")} 
                        onChange={() => toggleModule("ipd")}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <label htmlFor="ipdMod" className="cursor-pointer select-none">IPD Ward & Occupancy metrics</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="checkbox" 
                        id="labsMod" 
                        checked={activeModules.includes("labs")} 
                        onChange={() => toggleModule("labs")}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <label htmlFor="labsMod" className="cursor-pointer select-none">Pathology Lab Information</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="checkbox" 
                        id="pharmacyMod" 
                        checked={activeModules.includes("pharmacy")} 
                        onChange={() => toggleModule("pharmacy")}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <label htmlFor="pharmacyMod" className="cursor-pointer select-none">Pharmacy Drug Depot Inventory</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="checkbox" 
                        id="financeMod" 
                        checked={activeModules.includes("finance")} 
                        onChange={() => toggleModule("finance")}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded"
                      />
                      <label htmlFor="financeMod" className="cursor-pointer select-none">Revenue cycle & Custom Billing</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase font-bold py-2 rounded-xl border border-slate-700 cursor-pointer shadow-sm transition-all"
                >
                  Save White-Label parameters
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-405 text-xs flex flex-col items-center justify-center gap-2 select-none text-slate-400">
              <Settings2 className="w-8 h-8 text-slate-300 stroke-[1.5]" />
              <div>
                <p className="font-bold text-slate-500">No Branch Tenant Selected</p>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5 leading-relaxed max-w-[200px]">Click any workspace hospital card inside the leftmost directory to modify custom white-label setups or toggle active modules.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
