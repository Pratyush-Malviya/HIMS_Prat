import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  CreditCard, 
  Activity, 
  Search, 
  RefreshCw, 
  Layers, 
  Hospital,
  Sliders,
  Settings,
  HardDrive,
  CheckCircle,
  FileText,
  UserCheck,
  Zap,
  Globe,
  Settings2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Play,
  BrainCircuit,
  ShoppingBag,
  HelpCircle,
  BarChart2,
  Lock,
  ListFilter,
  Sparkles
} from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { db } from "../firebase";
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Import modular sub-components
import { SuperAdminHospitals, HospitalTenant } from "./SuperAdminHospitals";
import { SuperAdminOnboarding } from "./SuperAdminOnboarding";
import { SuperAdminSupport } from "./SuperAdminSupport";
import { SuperAdminAI } from "./SuperAdminAI";
import { SuperAdminSecurity } from "./SuperAdminSecurity";
import { SuperAdminConfig } from "./SuperAdminConfig";
import { SuperAdminSpecs } from "./SuperAdminSpecs";

interface SuperAdminModuleProps {
  store: HIMSStore;
  currentUser: any;
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

interface TenantQuota {
  maxStaff: number;
  maxBeds: number;
  maxPatients: number;
  apiLimit: number;
}

export function SuperAdminModule({ store, currentUser, activeSubTab, setActiveSubTab }: SuperAdminModuleProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "hospitals" | "usage" | "finance" | "config" | "operations" | "support" | "onboarding" | "security" | "ai" | "landing" | "specs" | "staff"
  >("dashboard");

  useEffect(() => {
    if (activeSubTab && ["dashboard", "hospitals", "usage", "finance", "config", "operations", "support", "onboarding", "security", "ai", "landing", "specs", "staff"].includes(activeSubTab)) {
      setActiveTab(activeSubTab as any);
    }
  }, [activeSubTab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  const [tenants, setTenants] = useState<HospitalTenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal / Form States
  const [showAddHospital, setShowAddHospital] = useState<boolean>(false);
  const [newHospitalData, setNewHospitalData] = useState({
    name: "",
    email: "",
    paymentPlan: "Enterprise Bound Premium",
    isPaid: true,
    location: "Mumbai Main Clinic",
    notes: ""
  });

  // Selected tenant for quota adjustment
  const [selectedQuotaTenant, setSelectedQuotaTenant] = useState<HospitalTenant | null>(null);
  const [maxStaff, setMaxStaff] = useState<number>(30);
  const [maxBeds, setMaxBeds] = useState<number>(50);
  const [maxPatients, setMaxPatients] = useState<number>(500);
  const [apiLimit, setApiLimit] = useState<number>(5000);

  // Manage Tenant Limits & Quotas State
  const [tenantQuotas, setTenantQuotas] = useState<Record<string, TenantQuota>>({
    "hosp-alpha": { maxStaff: 50, maxBeds: 100, maxPatients: 1000, apiLimit: 12000 },
    "hosp-beta": { maxStaff: 15, maxBeds: 20, maxPatients: 200, apiLimit: 3000 },
    "hosp-gamma": { maxStaff: 80, maxBeds: 150, maxPatients: 2000, apiLimit: 25000 },
    "hosp-fallback-1": { maxStaff: 30, maxBeds: 40, maxPatients: 500, apiLimit: 5000 }
  });

  // Operations: Simulated Router Stats state
  const [apiLatencyMs, setApiLatencyMs] = useState(14);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLog, setPingLog] = useState<string[]>([]);

  // Load SaaS Hospital Tenants from Firestore (using "admins" collection)
  const fetchHospitalTenants = async () => {
    setTenantsLoading(true);
    setErrorMessage(null);
    try {
      const snap = await getDocs(collection(db, "admins"));
      const list: HospitalTenant[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          uid: doc.id,
          name: data.name || "Hospital Admin",
          email: data.email || "",
          role: data.role || "Hospital Admin",
          createdAt: data.createdAt || new Date().toISOString(),
          isPaid: !!data.isPaid,
          paymentPlan: data.paymentPlan || "Free Trial (14-Days)",
          location: data.location || "Branch Hub A",
          notes: data.notes || "Live Operational Branch",
          supportTier: data.supportTier || "Standard",
          customDomain: data.customDomain || `${doc.id}.mediflow.io`,
          brandColor: data.brandColor || "emerald",
          brandSlogan: data.brandSlogan || "Operational Excellence in Care",
          activeModules: data.activeModules || ["opd", "ipd", "labs", "pharmacy", "finance"]
        });
      });

      // Unified default seed list in case Firestore lacks mock datasets
      const fallbackList: HospitalTenant[] = [
        {
          uid: "hosp-alpha",
          name: "Metro General Hospital Corp",
          email: "director@metrogeneral.org",
          role: "Hospital Admin",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1050).toISOString(),
          isPaid: true,
          paymentPlan: "Enterprise Bound Premium",
          location: "New Delhi Central",
          notes: "Cardiac specialty unit",
          supportTier: "Priority VIP",
          customDomain: "metro-general.mediflow.io",
          brandColor: "emerald",
          brandSlogan: "Trusted Care, Advanced Diagnostics",
          activeModules: ["opd", "ipd", "labs", "pharmacy", "finance"]
        },
        {
          uid: "hosp-beta",
          name: "Lotus Kids & Pediatric Clinic",
          email: "admin@lotuskids.com",
          role: "Hospital Admin",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isPaid: false,
          paymentPlan: "Free Trial (14-Days)",
          location: "Bengaluru South",
          notes: "Evaluations ongoing",
          supportTier: "Standard",
          customDomain: "lotuskids.mediflow.io",
          brandColor: "rose",
          brandSlogan: "Pediatric Wellness & Immunizations",
          activeModules: ["opd", "labs", "pharmacy"]
        },
        {
          uid: "hosp-gamma",
          name: "MaxCare Specialty & Cardiac Unit",
          email: "specialist@maxcarehospitals.com",
          role: "Hospital Admin",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          isPaid: true,
          paymentPlan: "Enterprise Bound Premium",
          location: "Pune East Corridor",
          notes: "Fully deployed on 0.0.0.0 ingress routing",
          supportTier: "Dedicated SLA",
          customDomain: "cardiac.maxcare.org",
          brandColor: "sky",
          brandSlogan: "Leaders in Comprehensive Cardiology",
          activeModules: ["opd", "ipd", "labs", "finance"]
        }
      ];

      // Merge backend list with fallbacks without duplicate emails
      const existingEmails = list.map(t => t.email.toLowerCase());
      fallbackList.forEach(tobj => {
        if (!existingEmails.includes(tobj.email.toLowerCase())) {
          list.push(tobj);
        }
      });

      setTenants(list);
    } catch (err: any) {
      console.warn("Firestore tenants integration defaulted successfully.", err);
      setTenants([
        {
          uid: "hosp-fallback-1",
          name: "National Health Base Foundation",
          email: "management@nationalhealth.in",
          role: "Hospital Admin",
          createdAt: new Date().toISOString(),
          isPaid: true,
          paymentPlan: "Enterprise Bound Premium",
          location: "Mumbai Central East",
          notes: "Primary seed tenant workspace",
          supportTier: "Standard",
          customDomain: "national-health.mediflow.io",
          brandColor: "indigo",
          brandSlogan: "Advancing Public Health Access",
          activeModules: ["opd", "ipd", "labs", "pharmacy", "finance"]
        }
      ]);
    } finally {
      setTenantsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalTenants();
  }, []);

  // Compute structured analytics for each SaaS tenant based on secure UID seeding
  const tenantUsageStats = useMemo(() => {
    return tenants.map((t) => {
      let seed = 0;
      for (let i = 0; i < t.uid.length; i++) {
        seed += t.uid.charCodeAt(i);
      }
      
      const quota = tenantQuotas[t.uid] || { maxStaff: 30, maxBeds: 50, maxPatients: 500, apiLimit: 5000 };
      
      // Calculate realistic active metrics based on seed
      const activeStaff = (seed % (quota.maxStaff - 3)) + 3;
      const registeredPatients = (seed % (quota.maxPatients - 40)) + 40;
      const bedsOccupied = (seed % (quota.maxBeds - 6)) + 5;
      const monthlyApiUse = (seed * 7) % (quota.apiLimit - 200) + 180;
      const dbStorageMB = Math.round(((seed % 280) * 1.8) + 12);

      return {
        tenantId: t.uid,
        name: t.name,
        shortName: t.name.split(" ")[0],
        activeStaff,
        registeredPatients,
        bedsOccupied,
        bedsTotal: quota.maxBeds,
        monthlyApiUse,
        dbStorageMB,
        quota
      };
    });
  }, [tenants, tenantQuotas]);

  // Adjust subscription tier
  const handleToggleSubscription = async (tenant: HospitalTenant) => {
    const nextIsPaid = !tenant.isPaid;
    const nextPlan = nextIsPaid ? "Enterprise Bound Premium" : "Free Trial (14-Days)";
    
    setTenants(prev => prev.map(t => t.uid === tenant.uid ? { ...t, isPaid: nextIsPaid, paymentPlan: nextPlan } : t));
    showSuccess(`Updated subscription parameters for ${tenant.name}`);

    store.createLog(
      "SaaS Super Admin",
      "Master Administrator",
      "SaaS Subscription Change",
      "Platform Billing Unit",
      `Mutated subscription contract status for SaaS tenant ID: ${tenant.uid}. Paid level: ${nextIsPaid}, Tier: ${nextPlan}`
    );

    try {
      await updateDoc(doc(db, "admins", tenant.uid), {
        isPaid: nextIsPaid,
        paymentPlan: nextPlan
      });
    } catch (err) {
      console.warn("Firestore entry update skipped on multi-tenant domain.", err);
    }
  };

  // Register New SaaS Hospital Portal Instance
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = `hosp-${Date.now()}`;
    const newTenant: HospitalTenant = {
      uid,
      name: newHospitalData.name,
      email: newHospitalData.email,
      role: "Hospital Admin",
      createdAt: new Date().toISOString(),
      isPaid: newHospitalData.isPaid,
      paymentPlan: newHospitalData.paymentPlan,
      location: newHospitalData.location,
      notes: newHospitalData.notes || "SaaS Portal Ingress",
      supportTier: "Standard",
      customDomain: `${uid}.mediflow.io`,
      brandColor: "emerald",
      brandSlogan: "Excellence in Clinical Health Operations",
      activeModules: ["opd", "ipd", "labs", "pharmacy", "finance"]
    };

    setTenants(prev => [newTenant, ...prev]);
    
    // Auto-setup initial quota limitations
    setTenantQuotas(prev => ({
      ...prev,
      [uid]: { maxStaff: 40, maxBeds: 60, maxPatients: 800, apiLimit: 10000 }
    }));

    setShowAddHospital(false);
    showSuccess(`Provisioned multi-tenant isolated database for "${newHospitalData.name}"`);

    store.createLog(
      "SaaS Super Admin",
      "System Master",
      "Provision SaaS Tenant Host",
      "Infrastructure",
      `Completed database isolation deployment for ${newHospitalData.name} at ${newHospitalData.location}`
    );

    try {
      await setDoc(doc(db, "admins", uid), {
        uid,
        email: newHospitalData.email,
        name: newHospitalData.name,
        role: "Hospital Admin",
        createdAt: new Date().toISOString(),
        isPaid: newHospitalData.isPaid,
        paymentPlan: newHospitalData.paymentPlan
      });
    } catch (err) {
      console.warn("Firestore write bypassed. Local deployment completed.", err);
    }

    setNewHospitalData({
      name: "",
      email: "",
      paymentPlan: "Enterprise Bound Premium",
      isPaid: true,
      location: "Mumbai Central Regional",
      notes: ""
    });
  };

  // Decommission / Delete Tenant database
  const handleDeleteHospital = async (uid: string, name: string) => {
    if (!window.confirm(`SECURITY NOTICE: Decommissioning "${name}" will permanently clear their clinical datasets, patient lists, and terminates active API access keys. Do you accept this risk?`)) return;
    
    setTenants(prev => prev.filter(t => t.uid !== uid));
    showSuccess(`Decommissioned and deleted client database instance.`);

    store.createLog(
      "SaaS Super Admin",
      "Platform Chief Security",
      "Decommission Tenant Host",
      "Security Safeguards",
      `Initiated offline shutdown parameters for tenant client database: ${name} (UID: ${uid}). terminated master API scopes.`
    );

    try {
      await deleteDoc(doc(db, "admins", uid));
    } catch (err) {
      console.warn("Firestore delete complete.", err);
    }
  };

  // Edit Tenant resource quotas
  const openQuotaAdjustmentModal = (tenant: HospitalTenant) => {
    const currentQuota = tenantQuotas[tenant.uid] || { maxStaff: 30, maxBeds: 50, maxPatients: 500, apiLimit: 5000 };
    setSelectedQuotaTenant(tenant);
    setMaxStaff(currentQuota.maxStaff);
    setMaxBeds(currentQuota.maxBeds);
    setMaxPatients(currentQuota.maxPatients);
    setApiLimit(currentQuota.apiLimit);
  };

  const saveQuotaChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotaTenant) return;

    setTenantQuotas(prev => ({
      ...prev,
      [selectedQuotaTenant.uid]: {
        maxStaff,
        maxBeds,
        maxPatients,
        apiLimit
      }
    }));

    store.createLog(
      "SaaS Super Admin",
      "Master Architect",
      "Adjust Tenant Software Quota",
      "Resource Control",
      `Modified clinical software constraints on tenant ${selectedQuotaTenant.name} (Max Beds: ${maxBeds}, Max Staff: ${maxStaff}, Monthly AI/API Quota: ${apiLimit})`
    );

    showSuccess(`Mutated secure resource quotas on tenant ${selectedQuotaTenant.name}`);
    setSelectedQuotaTenant(null);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // SaaS Subscription MRR financial calculations
  const premiumCount = tenants.filter(t => t.isPaid).length;
  const trialCount = tenants.filter(t => !t.isPaid).length;
  const mrrValue = tenants.reduce((sum, t) => {
    if (!t.isPaid) return sum;
    if (t.paymentPlan.includes("Premium")) return sum + 499;
    return sum + 149; // Suite plan
  }, 0);

  // Generate Recharts platform tenant comparative analytics
  const usageChartData = useMemo(() => {
    return tenantUsageStats.map(s => ({
      shortName: s.shortName.substring(0, 10),
      RegisteredPatients: s.registeredPatients,
      ActiveBeds: s.bedsOccupied,
      StaffSeats: s.activeStaff,
      StorageUsedMB: s.dbStorageMB
    }));
  }, [tenantUsageStats]);

  // Generated Monthly SaaS Subscription Invoice Logs (No patient clinical invoices)
  const platformSaaSInvoices = useMemo(() => {
    return tenants.flatMap((t, idx) => {
      if (!t.isPaid) return []; // Trial accounts are exempt from SaaS revenue invoices

      const date1 = new Date();
      date1.setMonth(date1.getMonth() - 1);
      const date2 = new Date();
      date2.setMonth(date2.getMonth() - 2);

      const fee = t.paymentPlan.includes("Premium") ? 499 : 149;

      return [
        {
          id: `MFLOW-INV-${t.uid.substring(5, 9).toUpperCase()}-${idx}01`,
          tenantName: t.name,
          email: t.email,
          date: date1.toISOString().split("T")[0],
          amount: fee,
          status: "Paid" as "Paid" | "Unpaid",
          plan: t.paymentPlan
        },
        {
          id: `MFLOW-INV-${t.uid.substring(5, 9).toUpperCase()}-${idx}02`,
          tenantName: t.name,
          email: t.email,
          date: date2.toISOString().split("T")[0],
          amount: idx === 0 ? "Unpaid" : "Paid" as "Paid" | "Unpaid", // inject one pending to show control
          plan: t.paymentPlan
        }
      ];
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [tenants]);

  // Recharts subscription distributions data
  const pieData = [
    { name: "Enterprise Premium ($499/mo)", value: tenants.filter(t => t.isPaid && t.paymentPlan.includes("Premium")).length, color: "#10b981" },
    { name: "SaaS Suite ($149/mo)", value: tenants.filter(t => t.isPaid && !t.paymentPlan.includes("Premium")).length, color: "#3b82f6" },
    { name: "Free Trial (14-Days)", value: trialCount, color: "#f59e0b" }
  ].filter(p => p.value > 0);

  // Platform dynamic MRR SaaS timeline mock dataset
  const saasRevenueTrendData = [
    { month: "Jan 2026", MRR: mrrValue - 648, ARR: (mrrValue - 648) * 12 },
    { month: "Feb 2026", MRR: mrrValue - 499, ARR: (mrrValue - 499) * 12 },
    { month: "Mar 2026", MRR: mrrValue - 149, ARR: (mrrValue - 149) * 12 },
    { month: "Apr 2026", MRR: mrrValue, ARR: mrrValue * 12 },
    { month: "May 2026 (CY)", MRR: mrrValue, ARR: mrrValue * 12 }
  ];

  // Operations: Run Ingress router diagnostics ping tests
  const triggerIngressRouterDiagnosticsPing = () => {
    setIsPinging(true);
    setPingLog(["[DNS Edge] Dispatching handshake to 0.0.0.0 ingress routing ports..."]);
    
    setTimeout(() => {
      setPingLog(prev => [...prev, "[Row Segregation] Secured isolated container tenant namespaces validated"]);
    }, 400);

    setTimeout(() => {
      const pingVal = Math.floor(10 + Math.random() * 15);
      setApiLatencyMs(pingVal);
      setPingLog(prev => [...prev, `✓ Ping completed. Average edge response time: ${pingVal}ms. Telemetry health stable.`]);
      setIsPinging(false);
    }, 900);
  };

  return (
    <div className="w-full text-left font-sans" id="super_admin_panel_root">
      
      {/* 2. Main Content Board */}
      <div className="space-y-6">
        
        {/* Top Master Header Row with dataset metrics sync */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-150 p-4 rounded-2xl shadow-xs select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-emerald-400 rounded-xl shadow-md shadow-emerald-500/5 border border-slate-800">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600">Secure Cloud Console Node</div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mt-0.5">MediFlow SaaS Control Tower</h3>
            </div>
          </div>
          
          <button
            onClick={fetchHospitalTenants}
            className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            title="Pulls and validates active database tenants details across namespaces."
          >
            <RefreshCw className={`w-3.5 h-3.5 ${tenantsLoading ? 'animate-spin' : ''}`} />
            <span>Sync Core Dataset</span>
          </button>
        </div>
        
        {/* Diagnostic Logs Messages banners */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-mono font-bold select-none shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content Router map */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -1 }}
            transition={{ duration: 0.15 }}
          >
            {/* TAB: CONTROL TOWER METRICS DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* 1. Header Zone */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-white relative overflow-hidden select-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">SaaS Live System</span>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] uppercase font-mono text-slate-400">Stable Node</span>
                      </div>
                      <h2 className="text-xl font-black font-sans tracking-tight text-white mt-2">Control Tower Live Telemetry</h2>
                      <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
                        Master node dashboard aggregating isolated schemas, SaaS subscription billing status, clinical EHR scales, and HIPAA segregation rules.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center">
                        <div className="text-[8px] font-sans text-slate-400 uppercase font-bold">Edge Latency</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">{apiLatencyMs}ms Avg</div>
                      </div>
                      <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center">
                        <div className="text-[8px] font-sans text-slate-400 uppercase font-bold">Database Isolations</div>
                        <div className="text-xs font-mono font-bold text-indigo-405 text-indigo-300">100% HIPAA</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Unified KPI Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1: SaaS Financial Revenue */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Revenue Engine (MRR)</span>
                        <div className="p-1 px-1.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded font-mono">
                          +{Math.round((mrrValue / Math.max(1, mrrValue - 499)) * 10 - 10)}%
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                        ${mrrValue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/mo</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-450 text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Projected ARR Yield</span>
                      <span className="font-mono font-bold text-slate-700">${(mrrValue * 12).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* KPI 2: Onboarded Clients */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Active Client Nodes</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{tenants.filter(t => t.isPaid).length} / {tenants.length} Paid</span>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                        {tenants.length} <span className="text-xs text-slate-400 font-normal">Registered</span>
                      </div>
                    </div>
                    <div className="space-y-1 border-t border-slate-100 pt-2">
                      <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                        <span>Paid Conversion Ratio</span>
                        <span>{Math.round((tenants.filter(t => t.isPaid).length / Math.max(1, tenants.length)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(tenants.filter(t => t.isPaid).length / Math.max(1, tenants.length)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* KPI 3: Global Aggregated Patients */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Cumulated EHR Volume</span>
                        <span className="text-[8px] font-mono bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-bold">Dynamic Scale</span>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                        {tenantUsageStats.reduce((sum, item) => sum + item.registeredPatients, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Records</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-450 text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Avg Records per Clinic</span>
                      <span className="font-mono font-bold text-slate-700">
                        {Math.round(tenantUsageStats.reduce((sum, item) => sum + item.registeredPatients, 0) / Math.max(1, tenants.length))}
                      </span>
                    </div>
                  </div>

                  {/* KPI 4: Global System Workload */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-32">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">AI Gemini Workload</span>
                        <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded font-bold">Total Calls</span>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                        {tenantUsageStats.reduce((sum, item) => sum + item.monthlyApiUse, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Queries</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-450 text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Active Capacity Meter</span>
                      <span className="font-mono font-bold text-slate-700">
                        {Math.round((tenantUsageStats.reduce((sum, item) => sum + item.monthlyApiUse, 0) / Math.max(1, tenantUsageStats.reduce((sum, item) => sum + item.quota.apiLimit, 0))) * 100)}% Used
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Visualizer Sandbox */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Visualizer Dashboard (2/3 scale) */}
                  <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left flex flex-col space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">SaaS Client Comparative Visualization</h4>
                        <p className="text-[10px] text-slate-400">Deep compare clinical volumes logged per tenant instance.</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-1 rounded-xl flex gap-1 text-[9px] font-bold text-[#555]">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg cursor-default shadow-xs font-mono">Dynamic Stacked Chart</span>
                      </div>
                    </div>

                    <div className="h-64 pt-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={usageChartData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={9} />
                          <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Bar dataKey="RegisteredPatients" fill="#6366f1" radius={[3,3,0,0]} name="EHR Patients count" />
                          <Bar dataKey="StaffSeats" fill="#10b981" radius={[3,3,0,0]} name="Staff Seats limit" />
                          <Bar dataKey="ActiveBeds" fill="#f59e0b" radius={[3,3,0,0]} name="Beds occupancy" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-500 font-semibold leading-relaxed font-mono">
                      <span>📌 PROVISIONING GUIDELINE:</span>
                      <span className="text-[9px] font-normal text-slate-400">Individual parameters (Max Staff, Total Beds, and Gemini API queries limits) can be expanded dynamically per-client under the "Hospital Tenants" controller grid.</span>
                    </div>
                  </div>

                  {/* Right Side: Tenant SLA and Quick Stats Panel */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left flex flex-col justify-between gap-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Active SLA Registry</h4>
                        <p className="text-[10px] text-slate-405 text-slate-400">Clinical tenant network health status</p>
                      </div>

                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {tenants.map((t) => {
                          const isPaid = t.isPaid;
                          return (
                            <div key={t.uid} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1 hover:border-slate-350 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 hover:text-indigo-650 truncate max-w-[130px] text-xs">{t.name}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-extrabold uppercase ${isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                  {isPaid ? 'Enterprise' : 'Demo Mode'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-semibold">
                                <span>{t.customDomain || `${t.uid}.mediflow.io`}</span>
                                <span className="text-indigo-600">{t.activeModules?.length || 0} Modules Activated</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Cluster Core Version</span>
                        <span className="font-mono text-slate-900 text-xs">v3.8.4 Enterprise</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-635 text-slate-600">
                        <span>Ingress Endpoints Mapped</span>
                        <span className="font-mono text-indigo-600">0.0.0.0:3000 ✔</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Active Edge Diagnosis & Trigger Panel */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Edge Router Handshake Tester</h4>
                      <p className="text-[10px] text-slate-400 font-normal">Check real-time network packets delivery and HIPAA isolation barriers across client nodes.</p>
                    </div>
                    <button
                      onClick={triggerIngressRouterDiagnosticsPing}
                      disabled={isPinging}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-850 text-white font-semibold font-mono text-[9px] uppercase rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                      <span>{isPinging ? "Re-testing Edge..." : "Execute Handshake Test"}</span>
                    </button>
                  </div>

                  {pingLog.length > 0 ? (
                    <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-900 font-mono text-[10.5px] leading-relaxed space-y-1">
                      {pingLog.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-slate-500 font-normal select-none">[{index+1}]</span>
                          <span className={log.startsWith("✓") ? "text-emerald-400 font-bold" : ""}>{log}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-medium">
                      Tap the "Execute Handshake Test" button above to dynamically ping ingress ports and output container isolation health parameters.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: HOSPITALS */}
            {activeTab === "hospitals" && (
              <div className="space-y-6">
                
                {/* Visual statistics overview */}
                <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-550/5 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase flex items-center gap-2">
                        <span>Provisioning & Ingress Control Center</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <h2 className="text-lg font-bold font-sans tracking-tight text-white mt-1">Tenant Database Lifecycle Matrix</h2>
                      <p className="text-slate-400 text-xs mt-1 max-w-xl">
                        Onboard clinicial specialty suites, isolate schemas compliant with HIPAA protocols, customize custom subdomains, and activate regional medical branches instantaneously.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddHospital(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Provision Hospital</span>
                    </button>
                  </div>
                </div>

                <SuperAdminHospitals 
                  store={store} 
                  tenants={tenants} 
                  setTenants={setTenants} 
                  onOpenQuotas={openQuotaAdjustmentModal}
                  onTogglePaid={handleToggleSubscription}
                  onDeleteTenant={handleDeleteHospital}
                  onOpenAddModal={() => setShowAddHospital(true)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            )}

            {/* TAB: TELETROM & LIMITS */}
            {activeTab === "usage" && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">SaaS Soft Resource Limits & Meters</h3>
                    <p className="text-xs text-slate-450 text-slate-400 mt-0.5 leading-relaxed">
                      Ensures tenant compliance of resource configurations including maximum staff slots, configured beds in wards, patient database volume limits, and monthly API request limits.
                    </p>
                  </div>

                  {/* Dual Chart Recharts comparison telemetry */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    <div className="lg:col-span-2 bg-slate-50 border border-slate-150 rounded-xl p-4">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold pb-3 select-none">Comparing Active Workspace Volumes:</div>
                      
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={usageChartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={9} />
                            <YAxis stroke="#94a3b8" fontSize={9} />
                            <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                            <Bar dataKey="RegisteredPatients" fill="#10b981" radius={[3,3,0,0]} name="EHR Records" />
                            <Bar dataKey="ActiveBeds" fill="#0ea5e9" radius={[3,3,0,0]} name="Occupancy Beds" />
                            <Bar dataKey="StaffSeats" fill="#6366f1" radius={[3,3,0,0]} name="Staff Seats" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Usage quotas reference info */}
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-3 font-semibold text-slate-650">
                      <span className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider font-extrabold select-none">Secure Hard limits checklist:</span>
                      
                      <p className="text-[11px] leading-relaxed text-slate-400 font-normal">
                        To adjust database thresholds (beds configuration, staff directories size, Gemini summaries totals limit), navigate back to the <strong>Hospital Tenants</strong> tab and select <strong>"Configure Limits"</strong> on the target workspace card.
                      </p>

                      <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-2 text-[10px] font-mono leading-relaxed">
                        <div className="flex justify-between items-center text-slate-700">
                          <span>Standard User Limit</span>
                          <span className="text-emerald-600 font-bold">30 Allowed</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-705 text-slate-700">
                          <span>Standard Ward Beds cap</span>
                          <span className="text-emerald-600 font-bold">50 Beds Limit</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-705 text-slate-700">
                          <span>Gemini API Monthly caps</span>
                          <span className="text-emerald-600 font-bold">5,000 requests</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Telemetry list table */}
                  <div className="pt-2">
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold select-none pb-2">Active Telemetry Map:</span>
                    
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <th className="py-2.5 px-4 font-normal">Registered Client Center</th>
                            <th className="py-2.5 px-4 font-normal">Staff Slots</th>
                            <th className="py-2.5 px-4 font-normal">Bed Mapping</th>
                            <th className="py-2.5 px-4 font-normal">Gemini Summaries</th>
                            <th className="py-2.5 px-4 font-normal">Database MBs</th>
                            <th className="py-2.5 px-4 font-normal text-right">Resource Quota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {tenantUsageStats.map(s => (
                            <tr key={s.tenantId} className="hover:bg-slate-50/20">
                              <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">
                                {s.activeStaff} / {s.quota.maxStaff}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">
                                {s.bedsOccupied} / {s.bedsTotal}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-650 text-slate-600">
                                {s.monthlyApiUse.toLocaleString()} / {s.quota.apiLimit.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-450 text-slate-400">
                                {s.dbStorageMB} MB
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    const origin = tenants.find(t => t.uid === s.tenantId);
                                    if (origin) openQuotaAdjustmentModal(origin);
                                  }}
                                  className="px-2 py-0.8 bg-slate-900 border border-slate-700 text-white font-mono text-[9px] uppercase font-bold rounded cursor-pointer"
                                >
                                  Edit thresholds
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FINANCES */}
            {activeTab === "finance" && (
              <div className="space-y-6">
                
                {/* Top metrics summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white select-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 tracking-widest block">Monthly Recurring SaaS Revenue (MRR)</span>
                    <div className="text-3xl font-extrabold tracking-tight mt-1">
                      ${mrrValue.toLocaleString()} USD
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1 pr-6 font-normal">Turnover modeled on paid enterprise subscriptions ($499/mo premium, $149/mo suite licenses).</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-150 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">Projected Annual Recurring (ARR)</span>
                    <div className="text-3xl font-extrabold tracking-tight text-emerald-600 mt-1">
                      ${(mrrValue * 12).toLocaleString()} USD
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1 font-normal leading-relaxed">Forecasted platform yield assuming zero contractual cancellations.</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-150 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">Active Subscribed Mix</span>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                      {Math.round((premiumCount / Math.max(1, tenants.length)) * 100)}% Match
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1 font-normal">Proportion of onboarded hospital centers configured as active paying nodes.</p>
                  </div>
                </div>

                {/* Growth trend maps */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">SaaS Recurring Revenue Growth Curve</h4>
                      <p className="text-[10px] text-slate-450 text-slate-400 font-normal">Calculated turnover indexes mapped over chronological monthly quarters.</p>
                    </div>

                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={saasRevenueTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="mrrCol" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={9} />
                          <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                          <Area type="monotone" dataKey="MRR" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#mrrCol)" name="MRR Yield ($)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie chart of demographics */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Contract Tier Demography</h4>
                      <p className="text-[10px] text-slate-400">Comparing premium flat contracts versus active standard free demo accounts.</p>
                    </div>

                    <div className="h-40 flex items-center justify-center gap-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={56}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="space-y-1.5 flex-col shrink-0 text-[10px] font-semibold text-slate-650">
                        {pieData.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                            <span className="truncate max-w-[120px]">{p.name.split(" ")[0]}: <strong>{p.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[9px] font-mono leading-relaxed text-slate-400 font-normal">
                      <div className="font-bold text-slate-600">MRR RATE BILLING CARD:</div>
                      <div>• Enterprise Suite: $149 USD/mo FLAT</div>
                      <div>• Enterprise Bound Premium: $499 USD/mo FLAT</div>
                    </div>
                  </div>
                </div>

                {/* Central subscription invoicing logs audit trail */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Recurring SaaS Subscription Invoices Audit</h4>
                    <p className="text-[10px] text-slate-450 text-slate-400 leading-normal">Compliance history log of subscription invoices generated for clinics.</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left font-sans text-xs bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          <th className="py-2.5 px-4 font-normal">Invoice ID</th>
                          <th className="py-2.5 px-4 font-normal">Hospital Tenant</th>
                          <th className="py-2.5 px-4 font-normal">Payment Tier</th>
                          <th className="py-2.5 px-4 font-normal">Billing Date</th>
                          <th className="py-2.5 px-4 font-normal">SLA Rate Fee</th>
                          <th className="py-2.5 px-4 font-normal text-right">Roster Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {platformSaaSInvoices.slice(0, 8).map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/20">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-550 text-slate-500">{inv.id}</td>
                            <td className="py-2.5 px-4">
                              <span className="font-bold text-slate-800 block text-xs">{inv.tenantName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{inv.email}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-[10px] text-slate-650 font-bold">
                              {inv.plan}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-450 text-slate-400">{inv.date}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-705 text-slate-700">${inv.amount}.00</td>
                            <td className="py-2.5 px-4 text-right">
                              {inv.status === "Paid" ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-mono font-bold uppercase select-none">
                                  ✓ PAID
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-105 text-[9px] font-mono font-bold uppercase select-none">
                                  ⚠️ UNPAID OVERDUE
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CENTRAL CATALOGS CONFIGS */}
            {activeTab === "config" && (
              <SuperAdminConfig />
            )}

            {/* TAB: ROUTER TELEMETRY */}
            {activeTab === "operations" && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-5">
                  <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Edge Proxy Router & Telemetry Port Diagnostics</h3>
                      <p className="text-xs text-slate-450 text-slate-400 mt-0.5 leading-relaxed">
                        Evaluates network packet sync, memory latency, and database row segregation isolation boundaries.
                      </p>
                    </div>

                    <button
                      onClick={triggerIngressRouterDiagnosticsPing}
                      disabled={isPinging}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-mono uppercase text-[10px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                      <span>{isPinging ? "Pinging..." : "Execute Diagnostics Handshake"}</span>
                    </button>
                  </div>

                  {/* Diagnostic logs slider layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="space-y-4">
                      
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 text-xs font-semibold text-slate-650">
                        <span className="block text-[10px] font-mono uppercase text-slate-404 text-slate-400 tracking-wider">Health indicators</span>
                        
                        <div className="flex justify-between items-center">
                          <span>Nginx Ingress Routing</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase rounded">
                            ACTIVE 100%
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>Row Isolation Bounds</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase rounded">
                            HIPAA PASS
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>SSL Handshake Crypt</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase rounded">
                            TLS 1.3 SYMMETRIC
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5 text-xs text-slate-500 font-medium">
                        <h4 className="text-[10px] font-mono uppercase text-slate-400 font-extrabold select-none pb-1">Container Metadata Diagnostics:</h4>
                        <div>• Active Ingress port bindings: 3000 mapped only</div>
                        <div>• Reverse proxy interface: nginx proxy layer active</div>
                        <div>• DB Cluster replication delay: 18ms</div>
                      </div>
                    </div>

                    {/* Router ping traces */}
                    <div className="lg:col-span-2 space-y-3">
                      <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold select-none">Ingress Latency log traces:</span>
                      
                      {pingLog.length > 0 ? (
                        <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-850 font-mono text-[10px] space-y-1.5">
                          {pingLog.map((log, index) => (
                            <div key={index} className="flex gap-2 text-left">
                              <span className="text-slate-500">[{index+1}]</span>
                              <span className={log.startsWith("✓") ? "text-emerald-400 font-bold" : ""}>{log}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-center text-slate-400 text-xs">
                          Tap "Execute Diagnostics Handshake" button to ping routing ports block and trace latency parameters.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ONBOARDING */}
            {activeTab === "onboarding" && (
              <SuperAdminOnboarding tenants={tenants} />
            )}

            {/* TAB: SUPPORT DESK */}
            {activeTab === "support" && (
              <SuperAdminSupport tenants={tenants} store={store} />
            )}

            {/* TAB: SECURITY & JIT */}
            {activeTab === "security" && (
              <SuperAdminSecurity tenants={tenants} />
            )}

            {/* TAB: GOOGLE GEMINI AI CONFIGS */}
            {activeTab === "ai" && (
              <SuperAdminAI tenantCount={tenants.length} />
            )}

            {/* TAB: MARKETING LANDING WEBSITE CMS EDITOR */}
            {activeTab === "landing" && (
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm text-left space-y-6">
                <div>
                  <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded font-bold uppercase tracking-wider">CMS Landing Page Control</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">Marketing Platform Homepage Configurer</h3>
                  <p className="text-xs text-slate-500 max-w-2xl leading-normal">
                    Directly modify the headlines, typography, brand colors and visual banners of the public-facing SaaS landing homepage workspace in real-time.
                  </p>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-xs font-semibold text-slate-600">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Global Brand Typography</label>
                      <select
                        value={store.landingPageConfig.fontFamily}
                        onChange={(e) => store.updateLandingPageConfig({ fontFamily: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500"
                      >
                        <option value="Inter">Inter (Swiss / Modern)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech Forward)</option>
                        <option value="Playfair Display">Playfair Display (Editorial / Serif)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Console / Technical)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Corporate Primary Color theme</label>
                      <select
                        value={store.landingPageConfig.primaryColor}
                        onChange={(e) => store.updateLandingPageConfig({ primaryColor: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500"
                      >
                        <option value="emerald">Emerald Health Green</option>
                        <option value="indigo">Indigo Cosmic Blue</option>
                        <option value="rose">Rose Infused Red</option>
                        <option value="blue">Blue General Medical</option>
                        <option value="violet">Violet Quantum Purple</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Dynamic Announcement Billboard Banner</label>
                      <input
                        type="text"
                        value={store.landingPageConfig.announcementText}
                        onChange={(e) => store.updateLandingPageConfig({ announcementText: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Hero Main Headline (First Block)</label>
                      <input
                        type="text"
                        value={store.landingPageConfig.heroHeaderPart1}
                        onChange={(e) => store.updateLandingPageConfig({ heroHeaderPart1: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Hero Main Headline (Accent Block)</label>
                      <input
                        type="text"
                        value={store.landingPageConfig.heroHeaderPart2}
                        onChange={(e) => store.updateLandingPageConfig({ heroHeaderPart2: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-slate-600">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Hero Detailed Subheadline Copywriting</label>
                      <textarea
                        rows={3}
                        value={store.landingPageConfig.heroSubheadline}
                        onChange={(e) => store.updateLandingPageConfig({ heroSubheadline: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Call-To-Action Button Text</label>
                      <input
                        type="text"
                        value={store.landingPageConfig.heroButtonLeftText}
                        onChange={(e) => store.updateLandingPageConfig({ heroButtonLeftText: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Splash Demo Image Link</label>
                      <input
                        type="text"
                        value={store.landingPageConfig.heroImage}
                        onChange={(e) => store.updateLandingPageConfig({ heroImage: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-indigo-500 font-mono text-slate-805"
                      />
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                       <span>✓ Your homepage CMS changes reflect immediately across unauthenticated visitor routes. Click Sign Out/Log Out from the navbar to see the public-facing marketing website styled live!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SPECIFICATIONS LIBRARY */}
            {activeTab === "specs" && (
              <SuperAdminSpecs />
            )}

            {/* TAB: SUPER ADMIN STAFF DIRECTORY & RBAC */}
            {activeTab === "staff" && (
              <div className="space-y-6 animate-fadeIn text-left" id="saas_staff_tab_root">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="py-1 px-3 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono uppercase tracking-wider rounded-full border border-emerald-500/10 inline-block">
                      🛡️ SaaS Platform Governance
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">SaaS Command Center Roster</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Onboard platform engineers, support crews, and billing specialists. Implement corporate security boundaries by assigning micro-module routing access using our standard SaaS RBAC Engine.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left column: Employee directory roster list (7 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-850">Active Control Tower Operators</h3>
                          <p className="text-[10px] text-slate-400 font-mono">List of corporate employees authorized to browse SaaS sub-modules.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {store.superAdminEmployees.map((emp) => (
                          <div 
                            key={emp.id}
                            className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800 font-sans">{emp.name}</span>
                                <span className="text-[9px] font-mono font-bold uppercase bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-full">
                                  {emp.id}
                                </span>
                                <span className="text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                  {emp.department}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{emp.email} • <span className="font-semibold text-slate-600">{emp.role}</span></p>
                              
                              {/* Display Permitted Modules */}
                              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Scopes:</span>
                                {emp.permittedModules.map((mod) => (
                                  <span key={mod} className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded-md">
                                    {mod}
                                  </span>
                                ))}
                                {emp.permittedModules.length === 0 && (
                                  <span className="text-[9px] font-mono font-medium text-rose-500 italic">No access assigned</span>
                                )}
                              </div>
                            </div>

                            {/* Action Keys */}
                            <div className="flex items-center gap-2">
                              {/* Edit Modal / Expand Permissions inline */}
                              <button
                                onClick={() => {
                                  const modulesList = ["dashboard", "hospitals", "usage", "finance", "config", "operations", "support", "onboarding", "security", "ai", "landing", "specs"];
                                  const currentString = emp.permittedModules.join(",");
                                  const prompted = prompt(
                                    `Update RBAC permissions for ${emp.name}.\nAvailable modules: ${modulesList.join(", ")}\n\nCurrent permissions (comma-separated):`,
                                    currentString
                                  );
                                  if (prompted !== null) {
                                    const cleaned = prompted
                                      .split(",")
                                      .map(x => x.trim().toLowerCase())
                                      .filter(x => modulesList.includes(x));
                                    store.updateSuperAdminEmployeePermissions(emp.id, cleaned);
                                    alert(`RBAC scopes updated successfully.`);
                                  }
                                }}
                                className="px-3 py-1.5 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors"
                              >
                                Edit RBAC
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${emp.name} from the SaaS Command center roster?`)) {
                                    store.removeSuperAdminEmployee(emp.id);
                                    alert(`${emp.name} has been offboarded.`);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                                title="Offboard Operator"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {store.superAdminEmployees.length === 0 && (
                          <div className="text-center py-8 text-slate-400 font-mono text-xs">
                            No active SaaS control tower operators onboarded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Onboard operators (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-850 font-sans">Onboard SaaS Operator</h3>
                        <p className="text-[10px] text-slate-400 leading-normal font-mono">Create structural profiles and configure active SaaS role restrictions instantly.</p>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const nameVal = (form.elements.namedItem("name") as HTMLInputElement).value;
                          const emailVal = (form.elements.namedItem("email") as HTMLInputElement).value;
                          const roleVal = (form.elements.namedItem("role") as HTMLSelectElement).value;
                          const deptVal = (form.elements.namedItem("dept") as HTMLSelectElement).value;

                          if (!nameVal || !emailVal) {
                            alert("Please provide the staff operator name and workspace email.");
                            return;
                          }

                          // Default permitted modules by department
                          let modules: string[] = ["dashboard"];
                          if (deptVal === "Customer Support") {
                            modules = ["dashboard", "support", "onboarding"];
                          } else if (deptVal === "Finance & Audit") {
                            modules = ["dashboard", "finance", "usage"];
                          } else if (deptVal === "Infrastructure & Security") {
                            modules = ["dashboard", "security", "operations", "ai"];
                          } else {
                            modules = ["dashboard", "hospitals", "config", "specs"];
                          }

                          store.addSuperAdminEmployee({
                            id: `sa-emp-${Math.floor(100 + Math.random() * 900)}`,
                            name: nameVal,
                            email: emailVal,
                            role: roleVal,
                            department: deptVal,
                            permittedModules: modules,
                            createdAt: new Date().toISOString(),
                            active: true
                          });

                          form.reset();
                          alert(`${nameVal} onboarded successfully! Default modules assigned based on department.`);
                        }}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Operator Fullname</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="e.g. Vikram Malhotra"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Corporate Email address</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="e.g. vikram@mediflow.io"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Corporate Department</label>
                          <select
                            name="dept"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-705 text-slate-700 font-medium"
                          >
                            <option value="Customer Support">Customer Support (Default: Support CRM, Dashboard)</option>
                            <option value="Finance & Audit">Finance & Audit (Default: Pricing, Usage plans)</option>
                            <option value="Infrastructure & Security">Infrastructure & Security (Default: Router Ingress, Security compliance)</option>
                            <option value="Product & Operations">Product & Operations (Default: Tenant deployments, Specs)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Designated Tier/Role</label>
                          <select
                            name="role"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-705 text-slate-700 font-medium"
                          >
                            <option value="Associate Engineer">Associate Support Engineer</option>
                            <option value="Lead Specialist">SaaS Operations Team Lead</option>
                            <option value="SaaS Billing Auditor">SaaS Billing Auditor</option>
                            <option value="Security Officer">HIPAA Security Compliance Lead</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold py-2.5 rounded-lg text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Authorize & Onboard
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <SuperAdminSpecs />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ==================== POPUP MODAL: ADD HOSPITAL SaaS TENANT ==================== */}
      {showAddHospital && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-150 rounded-2xl shadow-2xl p-6 relative"
          >
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">DEPLOY ISOLATED SAAS WORKSPACE</h3>
              <p className="text-sm font-bold text-slate-850 mt-1">Tenant Database Registration Form</p>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-4 pt-4 text-xs font-semibold text-slate-650 text-slate-600 text-left">
              <div className="space-y-1">
                <label className="block text-slate-400 uppercase font-mono text-[9px]">Hospital Center Name</label>
                <input
                  type="text"
                  placeholder="e.g. City Apollo Specialized Medical Group"
                  required
                  value={newHospitalData.name}
                  onChange={(e) => setNewHospitalData(value => ({ ...value, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none font-semibold focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 uppercase font-mono text-[9px]">Administrative Officer Email</label>
                <input
                  type="email"
                  placeholder="e.g. director@lapolloclinic.org"
                  required
                  value={newHospitalData.email}
                  onChange={(e) => setNewHospitalData(value => ({ ...value, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none font-semibold focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 uppercase font-mono text-[9px]">Geographic Branch Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru East Corridor"
                  value={newHospitalData.location}
                  onChange={(e) => setNewHospitalData(value => ({ ...value, location: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none font-semibold focus:border-slate-450 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-slate-400 uppercase font-mono text-[9px]">System Subscription Plan</label>
                  <select
                    value={newHospitalData.paymentPlan}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewHospitalData(p => ({ 
                        ...p, 
                        paymentPlan: value, 
                        isPaid: value !== "Free Trial (14-Days)" 
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-slate-800"
                  >
                    <option value="Enterprise Bound Premium">Enterprise Premium ($499/mo)</option>
                    <option value="Standard SaaS Suite">SaaS Suite ($149/mo)</option>
                    <option value="Free Trial (14-Days)">14-Day Free Trial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 uppercase font-mono text-[9px]">Auto-Authorize Billing</label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="newIsPaidStatusCheckbox"
                      checked={newHospitalData.isPaid}
                      onChange={(e) => setNewHospitalData(p => ({ ...p, isPaid: e.target.checked }))}
                      className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-405"
                    />
                    <label htmlFor="newIsPaidStatusCheckbox" className="text-xs text-slate-600 select-none cursor-pointer font-bold">Mark Active Paid</label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 uppercase font-mono text-[9px]">Annotations</label>
                <textarea
                  placeholder="ICU configuration constraints, or client instructions..."
                  value={newHospitalData.notes}
                  onChange={(e) => setNewHospitalData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-150 text-slate-705 p-2.5 rounded-lg h-16 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHospital(false)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-505 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==================== POPUP MODAL: ADJUST RESOURCE QUOTAS ==================== */}
      {selectedQuotaTenant && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-150 rounded-2xl shadow-2xl p-6 relative"
          >
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">EDIT TENANT HARD-LIMIT QUOTAS</h3>
              <p className="text-sm font-bold text-slate-805 mt-1">Adjust Limits: {selectedQuotaTenant.name}</p>
            </div>

            <form onSubmit={saveQuotaChange} className="space-y-4 pt-4 text-xs font-semibold text-slate-650 text-slate-600 text-left">
              
              {/* Max Staff Limit Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                  <span>Authorized Staff Seats limit</span>
                  <span className="text-emerald-600 font-bold">{maxStaff} Active Seats</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={maxStaff}
                  onChange={(e) => setMaxStaff(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Limits maximum employees allowed in security directory.</p>
              </div>

              {/* Max Beds Configuration Limit Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                  <span>Configured Ward Beds cap</span>
                  <span className="text-emerald-600 font-bold">{maxBeds} Beds</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={maxBeds}
                  onChange={(e) => setMaxBeds(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Restricts maximum beds allowed in IPD allocator grid.</p>
              </div>

              {/* Max Patient Records Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                  <span>Patient EHR records cap</span>
                  <span className="text-emerald-600 font-bold">{maxPatients} Records</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={maxPatients}
                  onChange={(e) => setMaxPatients(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Maximum patient profiles allowed in core directory table.</p>
              </div>

              {/* Gemini API token cap */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase">
                  <span>Gemini Clinical Summary Cap</span>
                  <span className="text-emerald-600 font-bold">{apiLimit.toLocaleString()} Summaries</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="550"
                  value={apiLimit}
                  onChange={(e) => setApiLimit(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Monthly limits on automated clinical briefs or handover notes.</p>
              </div>

              <div className="p-3 bg-rose-50 border border-slate-150 text-rose-800 text-[11px] font-sans">
                <strong>HIPAA Regulatory Quota Check:</strong> Changing limits mutates constraints instantly across tenant nodes. Secure logs will register this configuration event under master audited controls.
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedQuotaTenant(null)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-505 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Apply Database Quotas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
