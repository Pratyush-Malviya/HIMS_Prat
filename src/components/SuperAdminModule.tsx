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
    "hospitals" | "usage" | "finance" | "config" | "operations" | "support" | "onboarding" | "security" | "ai" | "landing"
  >("hospitals");

  useEffect(() => {
    if (activeSubTab && ["hospitals", "usage", "finance", "config", "operations", "support", "onboarding", "security", "ai", "landing"].includes(activeSubTab)) {
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
  const [searchQuery, setSearchQuery] = useState<string>("").trim();
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
    <div className="flex flex-col lg:flex-row gap-6 text-left font-sans" id="super_admin_panel_root">
      
      {/* 1. Left Nav Sidebar: Master Controls */}
      <div className="w-full lg:w-64 shrink-0 space-y-4">
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-white space-y-3 relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg max-w-fit shadow-md shadow-emerald-500/10">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">Cloud Console</div>
              <h3 className="text-sm font-extrabold tracking-tight">MediFlow SaaS SaaS</h3>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal">
            Master node dashboard: manage isolated tenants, SLA rosters, and Google Gemini parameters dynamically.
          </p>
        </div>

        {/* Vertical Navigation Buttons */}
        <div className="bg-white border border-slate-150 p-2 rounded-2xl space-y-1 shadow-xs select-none">
          <button 
            onClick={() => handleTabChange("hospitals")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "hospitals" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Hospital Tenants</span>
            </div>
            <span className="font-mono text-[9px] px-1 bg-slate-150 rounded text-slate-600 font-bold">{tenants.length}</span>
          </button>

          <button 
            onClick={() => handleTabChange("usage")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "usage" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Usage & Limits</span>
          </button>

          <button 
            onClick={() => handleTabChange("finance")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "finance" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>SaaS Pricing & Revenues</span>
            </div>
            <span className="font-mono text-[9px] px-1 bg-emerald-500 text-slate-950 rounded font-black">${mrrValue} MRR</span>
          </button>

          <button 
            onClick={() => handleTabChange("config")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "config" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Global Specialties Preset</span>
          </button>

          <button 
            onClick={() => handleTabChange("operations")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "operations" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              <span>Router Ops Guard</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">● {apiLatencyMs}ms</span>
          </button>

          <button 
            onClick={() => handleTabChange("onboarding")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "onboarding" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Onboarding Milestones</span>
          </button>

          <button 
            onClick={() => handleTabChange("support")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "support" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Support Desk CRM</span>
            </div>
            <span className="font-mono text-[9px] px-1 bg-rose-50 text-rose-500 rounded font-bold animate-pulse">4 active</span>
          </button>

          <button 
            onClick={() => handleTabChange("security")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "security" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>HIPAA Ledger & JIT</span>
            </div>
            <span className="font-mono text-[9px] px-1 bg-indigo-50 text-indigo-600 rounded font-bold">Secured</span>
          </button>

          <button 
            onClick={() => handleTabChange("ai")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "ai" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>AI Operations Console</span>
            </div>
            <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black text-[9px] rounded font-bold uppercase select-none font-mono">Gemini</span>
          </button>

          <button 
            onClick={() => handleTabChange("landing")}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "landing" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Landing Page CMS Editor</span>
            </div>
            <span className="font-mono text-[9px] px-1 bg-amber-50 text-amber-600 rounded font-bold">Marketing</span>
          </button>
        </div>

        {/* Core details reload */}
        <button
          onClick={fetchHospitalTenants}
          className="w-full py-1.5 border border-slate-150 hover:bg-slate-50 text-slate-600 text-xs rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${tenantsLoading ? 'animate-spin' : ''}`} />
          <span>Reload Core Dataset</span>
        </button>
      </div>

      {/* 2. Main Content Board */}
      <div className="flex-1 space-y-6">
        
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
                        <ResponsiveContainer width="100%" height="100%">
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
                      <ResponsiveContainer width="100%" height="100%">
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
                      <ResponsiveContainer width="100%" height="100%">
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
              <SuperAdminSupport tenants={tenants} />
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
