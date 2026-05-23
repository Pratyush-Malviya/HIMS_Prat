import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Play, 
  Check, 
  RefreshCw, 
  Settings, 
  Database, 
  FileText, 
  Sliders, 
  ListFilter,
  CheckCircle,
  Clock,
  HelpCircle
} from "lucide-react";

interface GlobalDepartment {
  id: string;
  name: string;
  code: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
}

interface ServiceCatalogItem {
  id: string;
  name: string;
  category: "Consultation" | "Bed Rent" | "Imaging" | "Lab Screen";
  defaultPrice: number;
}

const DEFAULT_GLOBAL_DEPARTMENTS: GlobalDepartment[] = [
  { id: "dept-opd", name: "Outpatient Consulting (OPD)", code: "OPD-M", status: "Active", lastUpdated: "2026-05-20" },
  { id: "dept-ipd", name: "Inpatient General Wards", code: "IPD-M", status: "Active", lastUpdated: "2026-05-20" },
  { id: "dept-icu", name: "Intensive Trauma Care Unit (ICU)", code: "ICU-T", status: "Active", lastUpdated: "2026-05-21" },
  { id: "dept-lab", name: "Clinical Pathology Diagnostics", code: "LAB-P", status: "Active", lastUpdated: "2026-05-18" },
  { id: "dept-pharm", name: "Apothecary Drug Depot Dispensatory", code: "PHM-D", status: "Active", lastUpdated: "2024-05-19" },
  { id: "dept-ot", name: "Operating Theatre & Surgeries", code: "OT-SURG", status: "Active", lastUpdated: "2026-05-22" }
];

const DEFAULT_CATALOG_ITEMS: ServiceCatalogItem[] = [
  { id: "srv-consult", name: "Senior Consultant Routine SOP Fee", category: "Consultation", defaultPrice: 500 },
  { id: "srv-icu-bed", name: "SBAR Compliant Intensive Bed Rate / Day", category: "Bed Rent", defaultPrice: 5000 },
  { id: "srv-blood-panel", name: "Symmetric Blood CBC Pathology Panel", category: "Lab Screen", defaultPrice: 2400 },
  { id: "srv-ct-head", name: "High Contrast CT Head Scan RIS Sync", category: "Imaging", defaultPrice: 1500 }
];

export function SuperAdminConfig() {
  const [departments, setDepartments] = useState<GlobalDepartment[]>(DEFAULT_GLOBAL_DEPARTMENTS);
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>(DEFAULT_CATALOG_ITEMS);

  // Schema deployment version control state
  const [activeSchemaVersion, setActiveSchemaVersion] = useState("v1.45-HIPAA");
  const [isDeployingSchema, setIsDeployingSchema] = useState(false);
  const [deployTimeline, setDeployTimeline] = useState<string[]>([]);
  const [deployStep, setDeployStep] = useState(0);

  // Forms state
  const [newDeptName, setNewDeptName] = useState("");
  const [newSrvName, setNewSrvName] = useState("");
  const [newSrvCat, setNewSrvCat] = useState<ServiceCatalogItem["category"]>("Consultation");
  const [newSrvPrice, setNewSrvPrice] = useState(100);

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const code = `DEPT-${newDeptName.substring(0, 4).toUpperCase()}`;
    const item: GlobalDepartment = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      code,
      status: "Active",
      lastUpdated: new Date().toISOString().split("T")[0]
    };

    setDepartments([...departments, item]);
    setNewDeptName("");
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;

    const item: ServiceCatalogItem = {
      id: `srv-${Date.now()}`,
      name: newSrvName,
      category: newSrvCat,
      defaultPrice: newSrvPrice
    };

    setCatalogItems([...catalogItems, item]);
    setNewSrvName("");
    setNewSrvPrice(100);
  };

  const handleDeleteDept = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const handleDeleteService = (id: string) => {
    setCatalogItems(prev => prev.filter(s => s.id !== id));
  };

  // central trigger method that simulates rolling update across active tenant nodes
  const dispatchCentralSchemaDeployment = () => {
    setIsDeployingSchema(true);
    setDeployStep(1);
    setDeployTimeline(["[TCP Ingress] Initializing secure OAuth handshakes..."]);

    setTimeout(() => {
      setDeployStep(2);
      setDeployTimeline(prev => [...prev, "[Nginx Edge] Checking cross-tenant isolated databases..."]);
    }, 1000);

    setTimeout(() => {
      setDeployStep(3);
      setDeployTimeline(prev => [...prev, "[Row Isolation] Cascading schema v1.45-HIPAA to active nodes..."]);
    }, 2000);

    setTimeout(() => {
      setDeployStep(4);
      setDeployTimeline(prev => [...prev, "✓ Rolled out successfully to all clinics!"]);
      setActiveSchemaVersion("v1.45-HIPAA");
    }, 3200);
  };

  const handleCloseDeploy = () => {
    setIsDeployingSchema(false);
    setDeployStep(0);
    setDeployTimeline([]);
  };

  return (
    <div className="space-y-6" id="super_admin_config_tab">
      
      {/* Top statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Global Departments</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1">{departments.length} Units</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Pre-Seeded Corporate Masters</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Default Rate Catalog</span>
          <span className="text-2xl font-bold text-indigo-650 block mt-1">{catalogItems.length} Mapped Tariffs</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Billing Presets Configured</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left text-white">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Core Master Schema</span>
              <span className="text-xl font-bold text-emerald-450 block mt-1 text-emerald-400">{activeSchemaVersion}</span>
            </div>
            
            <button
              onClick={dispatchCentralSchemaDeployment}
              disabled={isDeployingSchema}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono uppercase text-[9px] font-bold cursor-pointer transition-all"
            >
              Cascade Updates
            </button>
          </div>
          <span className="text-slate-405 text-[9px] block mt-1 text-slate-400">Pushes database updates safely across isolated nodes without downtime.</span>
        </div>
      </div>

      {/* Deploy Progress Slider Panel */}
      {isDeployingSchema && (
        <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-850 border-slate-800 space-y-3 text-left">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">Cascading updates globally...</span>
            </div>
            
            {deployStep === 4 && (
              <button 
                onClick={handleCloseDeploy}
                className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear diagnostics log
              </button>
            )}
          </div>

          <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-350">
            {deployTimeline.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-slate-500">[{idx+1}]</span>
                <span className={item.startsWith("✓") ? "text-emerald-400 font-bold" : ""}>{item}</span>
              </div>
            ))}
          </div>

          {/* Sizing Progress Meter */}
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500" 
              style={{ width: `${(deployStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Split catalogs inputs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Column: departments list & creation */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Central Corporate Specialties Setup</h4>
            <p className="text-[11px] text-slate-400">Pre-seeded department categories available in HIMS setup wizards.</p>
          </div>

          {/* Add Dept Form inline */}
          <form onSubmit={handleAddDept} className="flex gap-2 text-xs font-semibold">
            <input
              type="text"
              required
              placeholder="Enter specialty name e.g. Neonatology, ICU Unit..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-150 p-2 text-slate-800 rounded-xl outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono uppercase text-[10px] font-bold rounded-xl cursor-pointer"
            >
              Add specialty
            </button>
          </form>

          {/* Specialties list */}
          <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto">
            {departments.map((dept, idx) => {
              const isDefault = ["dept-opd", "dept-ipd", "dept-icu", "dept-lab", "dept-pharm", "dept-ot"].includes(dept.id);
              
              return (
                <div key={dept.id} className="py-2.5 flex items-center justify-between text-xs gap-3 font-semibold">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="font-mono text-[9px] bg-slate-100 px-1 rounded text-slate-500">{dept.code}</span>
                      <span>{dept.name}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">Status: {dept.status} | Sync Date: {dept.lastUpdated}</div>
                  </div>

                  {!isDefault ? (
                    <button
                      onClick={() => handleDeleteDept(dept.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-150 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded select-none">
                      LOCK SEED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Service Catalog Pricing configs */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Central Rate Catalog presets</h4>
            <p className="text-[11px] text-slate-400 font-normal">SLA baseline default tariff mapping assigned during registration.</p>
          </div>

          {/* Add service inline */}
          <form onSubmit={handleAddService} className="space-y-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-650 text-slate-600">
            <div className="text-[9px] font-mono text-slate-400 uppercase font-extrabold">Register New Tariff Schema Item:</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Tariff item name e.g. Urine Panel..."
                value={newSrvName}
                onChange={(e) => setNewSrvName(e.target.value)}
                className="w-full bg-white border border-slate-200 p-2 text-slate-800 rounded-lg outline-none text-xs focus:border-slate-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newSrvCat}
                  onChange={(e) => setNewSrvCat(e.target.value as any)}
                  className="bg-white border border-slate-200 p-1.5 rounded-lg outline-none text-slate-850 text-xs"
                >
                  <option value="Consultation">OPD Doc</option>
                  <option value="Bed Rent">IPD Bed</option>
                  <option value="Imaging">Radiology</option>
                  <option value="Lab Screen">Pathology</option>
                </select>
                <div className="flex">
                  <span className="inline-flex items-center px-1.5 border border-r-0 border-slate-200 bg-slate-100 text-slate-400 rounded-l text-[10px] font-mono">$</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(parseInt(e.target.value) || 10)}
                    className="flex-1 px-1.5 bg-white border border-slate-200 rounded-r text-slate-850 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono uppercase text-[9px] font-bold rounded-lg cursor-pointer"
              >
                Register tariff entry
              </button>
            </div>
          </form>

          {/* Tariffs List */}
          <div className="divide-y divide-slate-100 max-h-[190px] overflow-y-auto">
            {catalogItems.map(item => {
              const isSeedLock = ["srv-consult", "srv-icu-bed", "srv-blood-panel", "srv-ct-head"].includes(item.id);
              
              return (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs font-semibold gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-805 text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{item.category}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-705 text-slate-700 font-bold">${item.defaultPrice.toLocaleString()} USD</span>
                    {!isSeedLock ? (
                      <button
                        onClick={() => handleDeleteService(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[8px] font-mono text-slate-400 px-1 bg-slate-50 border border-slate-100 rounded">
                        SEED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
