import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Users,
  BedDouble,
  FlaskConical,
  Pill,
  DollarSign,
  ShieldCheck,
  Stethoscope,
  Heart,
  FileSpreadsheet,
  Settings,
  FlameKindling,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Lock,
  Unlock,
  Cpu,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

import { useHIMSStore } from "./useHIMSStore";
import { Dashboard } from "./components/Dashboard";
import { OPDModule } from "./components/OPDModule";
import { IPDModule } from "./components/IPDModule";
import { LabModule } from "./components/LabModule";
import { PharmacyModule } from "./components/PharmacyModule";
import { FinanceBillingModule } from "./components/FinanceBillingModule";
import { AdminModule } from "./components/AdminModule";
import { AIChatBot } from "./components/AIChatBot";
import { SaaSLandingPage } from "./components/SaaSLandingPage";
import { LoginPortal } from "./components/LoginPortal";
import { PaymentPage } from "./components/PaymentPage";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  const store = useHIMSStore();
  const { loading, employees, customRoles } = store;

  // Real-time Firebase Auth states
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    uid: string;
    email: string;
    role: string;
    name: string;
    department: string;
    permittedModules: string[];
    isAdmin: boolean;
    createdAt?: string;
    isPaid?: boolean;
    paymentPlan?: string;
  } | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active viewMode ("saas" vs "app")
  const [viewMode, setViewMode] = useState<"saas" | "app">("saas");
  const [initialSignUp, setInitialSignUp] = useState<boolean>(false);

  // Active primary tab and subtab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");

  // Mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Expanded/Collapsed menu groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard_group: true,
    patient_care_group: true,
    medical_depts_group: true,
    finance_group: true,
    admin_group: true
  });

  // Selected Patient for global context routing
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Check if employee
          const empDoc = await getDoc(doc(db, "employees", firebaseUser.uid));
          if (empDoc.exists()) {
            const data = empDoc.data();
            setAuthenticatedUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: data.role,
              name: data.name,
              department: data.department,
              permittedModules: data.permittedModules || ["dashboard"],
              isAdmin: false
            });
            await store.syncFirestoreData();
          } else {
            // 2. Check if admin
            const admDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
            if (admDoc.exists()) {
              const data = admDoc.data();
              setAuthenticatedUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                role: "Admin",
                name: data.name,
                department: "Finance Office",
                permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
                isAdmin: true,
                createdAt: data.createdAt || new Date().toISOString(),
                isPaid: !!data.isPaid,
                paymentPlan: data.paymentPlan || "Free Trial (14-Days)"
              });
              await store.syncFirestoreData();
            } else {
              // Sign out if found in neither directory
              await signOut(auth);
              setAuthenticatedUser(null);
            }
          }
        } catch (e) {
          console.error("Authentication setup error on mount: ", e);
        }
      } else {
        setAuthenticatedUser(null);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Map active session user and role
  const currentUser = authenticatedUser ? {
    name: authenticatedUser.name,
    role: authenticatedUser.role
  } : {
    name: "Dr. Rajesh Kumar",
    role: "Physician"
  };

  // Find current active employee details for live RBAC checking
  const activeEmployee = authenticatedUser ? {
    id: authenticatedUser.uid,
    name: authenticatedUser.name,
    role: authenticatedUser.role,
    department: authenticatedUser.department,
    permittedModules: authenticatedUser.permittedModules
  } : {
    id: "default",
    name: "Guest",
    role: "Physician",
    department: "General OPD",
    permittedModules: ["dashboard"]
  };

  // Calculate trial information
  const getTrialDaysInfo = () => {
    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return { elapsedDays: 0, daysRemaining: 14, isTrialExpired: false };
    }
    if (authenticatedUser.isPaid) {
      return { elapsedDays: 0, daysRemaining: 14, isTrialExpired: false };
    }
    const createdDate = new Date(authenticatedUser.createdAt || new Date());
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - createdDate.getTime();
    const elapsedDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, 14 - elapsedDays);
    const isTrialExpired = elapsedDays >= 14;
    return { elapsedDays, daysRemaining, isTrialExpired };
  };

  const { elapsedDays, daysRemaining, isTrialExpired } = getTrialDaysInfo();

  const handleSimulateTrialExpiration = async () => {
    if (!authenticatedUser) return;
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const fifteenDaysAgoISO = fifteenDaysAgo.toISOString();
    
    try {
      if (authenticatedUser.isAdmin) {
        await setDoc(doc(db, "admins", authenticatedUser.uid), {
          uid: authenticatedUser.uid,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          role: "Admin",
          createdAt: fifteenDaysAgoISO,
          isPaid: false,
          paymentPlan: "Free Trial (14-Days)"
        });
        
        // Save email immediately into expired_trials
        await setDoc(doc(db, "expired_trials", authenticatedUser.email.trim().toLowerCase()), {
          email: authenticatedUser.email,
          expiredAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Failed persisting simulation date:", err);
    }

    setAuthenticatedUser(prev => prev ? {
      ...prev,
      createdAt: fifteenDaysAgoISO,
      isPaid: false
    } : null);

    alert("Simulation complete: System date shifted to 15 days ago. Your email has been registered as expired, and you are locked on the premium payment redirection terminal.");
  };

  // Auto-record expired trial emails to prevent future trial reuse
  useEffect(() => {
    if (authenticatedUser?.isAdmin && isTrialExpired && authenticatedUser?.email) {
      const emailId = authenticatedUser.email.trim().toLowerCase();
      const persistExpiredEmail = async () => {
        try {
          await setDoc(doc(db, "expired_trials", emailId), {
            email: authenticatedUser.email,
            expiredAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn("Auto-saving expired trial email to DB log (handled):", err);
        }
      };
      persistExpiredEmail();
    }
  }, [authenticatedUser, isTrialExpired]);

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <Activity className="w-12 h-12 text-emerald-500 animate-pulse mb-3" />
        <p className="text-sm font-semibold font-mono text-emerald-400 animate-pulse uppercase tracking-wider">Verifying Security Access Gateway...</p>
      </div>
    );
  }

  // Intercept viewMode to show public SaaS Product Tour & pricing page
  if (viewMode === "saas") {
    return (
      <SaaSLandingPage 
        store={store}
        onLaunchApp={(signUpMode) => {
          setViewMode("app");
          setInitialSignUp(!!signUpMode);
        }} 
      />
    );
  }

  // Enforce credentials login before hospital systems access
  if (!authenticatedUser) {
    return (
      <LoginPortal 
        initialSignUpMode={initialSignUp}
        onLoginSuccess={async (usr) => {
          setAuthenticatedUser(usr);
          await store.syncFirestoreData();
        }} 
        onBackToLanding={() => {
          setViewMode("saas");
          setInitialSignUp(false);
        }}
      />
    );
  }

  // Force redirection to payment page if trial is exhausted
  if (isTrialExpired) {
    return (
      <PaymentPage 
        currentUserEmail={authenticatedUser.email}
        adminUid={authenticatedUser.uid}
        adminName={authenticatedUser.name}
        createdAt={authenticatedUser.createdAt || new Date().toISOString()}
        onPaymentSuccess={async (planName) => {
          setAuthenticatedUser(prev => prev ? {
            ...prev,
            isPaid: true,
            paymentPlan: planName
          } : null);
          await store.syncFirestoreData();
        }}
        onSignOut={async () => {
          await signOut(auth);
          setAuthenticatedUser(null);
          setViewMode("saas");
          setInitialSignUp(false);
        }}
      />
    );
  }


  // Define sidebar navigation structure with items and subitems
  const sidebarNavigation = [
    {
      id: "dashboard_group",
      title: "Operations Hub",
      icon: Activity,
      subItems: [
        { id: "dashboard", subId: "overview", label: "Operations Overview", icon: Activity, desc: "Main metrics dashboard" },
        { id: "dashboard", subId: "vitals", label: "Live Telemetry Feed", icon: Heart, desc: "Vital sign anomaly logs" }
      ]
    },
    {
      id: "patient_care_group",
      title: "Patient Services",
      icon: Users,
      subItems: [
        { id: "opd", subId: "consultations", label: "Outpatient (OPD)", icon: Stethoscope, desc: "OPD clinic consult desk" },
        { id: "ipd", subId: "beds", label: "Inpatient Wards (IPD)", icon: BedDouble, desc: "Ward Bed Allocator Grid" }
      ]
    },
    {
      id: "medical_depts_group",
      title: "Medical Departments",
      icon: FlaskConical,
      subItems: [
        { id: "labs", subId: "tests", label: "Pathology Laboratory", icon: FlaskConical, desc: "Diagnostic lab test listings" },
        { id: "pharmacy", subId: "inventory", label: "Pharmacy Stock", icon: Pill, desc: "Dispensary Drug safety levels" }
      ]
    },
    {
      id: "finance_group",
      title: "Treasury & Finance",
      icon: DollarSign,
      subItems: [
        { id: "finance", subId: "invoices", label: "Billing & Invoices", icon: DollarSign, desc: "Itemized bills log registry" },
        { id: "finance", subId: "insurance", label: "Insurance Claims", icon: FileSpreadsheet, desc: "TPA Claims authorizations" }
      ]
    },
    {
      id: "admin_group",
      title: "Security & Operations",
      icon: Settings,
      subItems: [
        { id: "admin", subId: "directory", label: "HR Staff Directory", icon: Users, desc: "Personnel records registry" },
        { id: "admin", subId: "roles", label: "Custom RBAC Architect", icon: ShieldCheck, desc: "Design clinical custom roles" },
        { id: "admin", subId: "logs", label: "Security Audit Trails", icon: FileSpreadsheet, desc: "HIPAA complaint log audit" },
        { id: "admin", subId: "diagnostics", label: "System Diagnostics", icon: Cpu, desc: "Database gauges & sandbox" },
        { id: "admin", subId: "landing", label: "Landing Page Editor (CMS)", icon: Sparkles, desc: "Manage SaaS styles, texts & images" }
      ]
    }
  ];

  const hasAccessToActiveTab = activeEmployee.permittedModules.includes(activeTab);

  // Group expander toggle helper
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Submenu selection director
  const selectSubMenu = (primaryId: string, secondaryId: string) => {
    setActiveTab(primaryId);
    setActiveSubTab(secondaryId);
    setMobileSidebarOpen(false); // Close on mobile navigation click
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-emerald-100 selection:text-emerald-950 text-slate-800">
      
      {/* 1. SIDEBAR COLUMN FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-76 bg-slate-900 text-white shrink-0 border-r border-slate-800 sticky top-0 h-screen select-none z-30">
        
        {/* Brand Banner */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-lg shadow-inner">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-mono text-[9px] tracking-widest font-extrabold text-emerald-400 uppercase block leading-none">Clinical Suite</span>
            <h1 className="text-sm font-bold font-sans tracking-tight text-white mt-0.5">AI-Powered HIMS</h1>
          </div>
        </div>

        {/* Dynamic SaaS Mode Toggle Trigger */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 text-left">
          <button
            onClick={() => setViewMode("saas")}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-white border border-emerald-500/25 p-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-all"
            id="sidebar_btn_saas_tour"
          >
            <span className="flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              SaaS Marketing Site
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic User Profile Context inside Sidebar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider">
            <span>SECURE WORKSTATION ID</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-2.5">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white truncate">{authenticatedUser.name}</div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-indigo-550/15 text-indigo-400 font-bold uppercase text-[8px]">
                  {authenticatedUser.role}
                </span>
                <span className="truncate">{authenticatedUser.department}</span>
              </div>
            </div>

            {/* Simulated 14-days Free Trial Tracking widget inside active Admin workspace */}
            {authenticatedUser.isAdmin && (
              <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] space-y-1.5 text-left">
                <div className="font-mono text-[9px] text-amber-400 font-semibold tracking-wider uppercase">
                  {authenticatedUser.isPaid ? "🏆 SUBSCRIPTION: ACTIVE" : `⚡ 14-DAY FREE TRIAL`}
                </div>
                <div className="text-[10px] text-slate-300">
                  {authenticatedUser.isPaid ? (
                    <span>Plan: <strong className="text-emerald-400">{authenticatedUser.paymentPlan || "Enterprise EHR"}</strong></span>
                  ) : (
                    <span>Day <strong className="text-emerald-400">{elapsedDays + 1}</strong> of 14 remaining (<strong className="text-emerald-400">{daysRemaining} days left</strong>)</span>
                  )}
                </div>
                {!authenticatedUser.isPaid && (
                  <button
                    onClick={handleSimulateTrialExpiration}
                    className="w-full mt-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded hover:shadow-md transition-all uppercase text-center"
                    title="Shifts creation timestamp 15 days into past to review automatic redirection & payment features."
                  >
                    ⏩ Fast-Forward 14 Days
                  </button>
                )}
              </div>
            )}

            <button
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to revoke your session and log out?");
                if (!confirmed) return;
                await signOut(auth);
                setAuthenticatedUser(null);
                setViewMode("saas");
                setInitialSignUp(false);
              }}
              className="w-full text-center py-1.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/20 text-slate-400 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all"
            >
              REVOKE SESSION (LOGOUT)
            </button>
          </div>
        </div>

        {/* Grouped Sidebar Menus content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" id="sidebar_main_menu">
          {sidebarNavigation.map((group) => {
            const isGroupExpanded = expandedGroups[group.id];
            const GroupIcon = group.icon;
            
            // Check if any sub-item inside this group has permission locked
            const parsedSubItems = group.subItems.map(sub => {
              const isPermitted = activeEmployee.permittedModules.includes(sub.id);
              const isActive = activeTab === sub.id && activeSubTab === sub.subId;
              return { ...sub, isPermitted, isActive };
            });

            return (
              <div key={group.id} className="space-y-1">
                {/* Header title click expands/collapses group */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-white uppercase font-mono tracking-wider py-1.5 px-1 rounded-md hover:bg-slate-800/30 transition-all select-none"
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{group.title}</span>
                  </div>
                  {isGroupExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {/* Sub-Items dropdown render */}
                <AnimatePresence initial={false}>
                  {isGroupExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-2.5 space-y-1 pt-1"
                    >
                      {parsedSubItems.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={sub.subId}
                            onClick={() => selectSubMenu(sub.id, sub.subId)}
                            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-normal transition-all flex items-center justify-between border ${
                              sub.isActive
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold shadow-sm"
                                : "text-slate-350 hover:text-white border-transparent hover:bg-slate-800/60"
                            }`}
                            id={`sidebar_btn_${sub.id}_${sub.subId}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <SubIcon className={`w-3.5 h-3.5 shrink-0 ${sub.isActive ? "text-slate-950" : (sub.isPermitted ? "text-slate-500" : "text-red-500")}`} />
                              <span className="truncate">{sub.label}</span>
                            </div>

                            {/* Access status Lock tag */}
                            {!sub.isPermitted ? (
                              <span className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 uppercase tracking-wide">
                                LOCK
                              </span>
                            ) : sub.isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>
                            ) : null}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Sticky footer telemetry status display inside Left Sidebar */}
        <div className="p-4 bg-slate-950 text-slate-400 border-t border-slate-800 text-[10px] font-mono space-y-1 select-none">
          <div className="flex justify-between">
            <span>SYSTEM CONTEXT:</span>
            <span className="text-emerald-400 font-bold uppercase">SECURE</span>
          </div>
          <div className="flex justify-between">
            <span>COMPLIANCE INDEX:</span>
            <span className="text-amber-400">HIPAA APPROVED</span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & DRAWER SIDEBAR */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden min-h-screen">
        
        {/* Mobile top header bar */}
        <header className="lg:hidden bg-slate-900 text-white h-16 px-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              id="mobile_hamburger_trigger"
            >
              <Menu className="w-5 h-5 text-slate-200" />
            </button>
            <div className="flex items-center gap-1.5 select-none">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold tracking-tight">Clinical Suite HIMS</span>
            </div>
          </div>

          <div className="bg-slate-950 text-slate-350 text-[10px] uppercase font-mono px-2 py-1.5 border border-slate-800 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {currentUser.role}
          </div>
        </header>

        {/* Mobile slide-over sidebar drawer drawer overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Dimmed Background Backdrop */}
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 0.5, backdropFilter: "blur(4px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              />

              {/* Slider drawer panel */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-80 max-w-sm bg-slate-900 text-white z-50 lg:hidden flex flex-col shadow-2xl"
              >
                 {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg">
                      <Activity className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-mono text-[8px] tracking-widest font-extrabold text-emerald-400 uppercase block leading-none">Clinical Suite</span>
                      <h1 className="text-xs font-bold font-sans tracking-tight text-white mt-0.5">AI-Powered HIMS</h1>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Mobile SaaS Switch Button */}
                <div className="p-4 bg-slate-950/30 border-b border-slate-800 text-left">
                  <button
                    onClick={() => {
                      setViewMode("saas");
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 p-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      SaaS Marketing Portal
                    </span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>

                {/* Dynamic User Profile Context inside Mobile Drawer */}
                <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider">
                    <span>SECURE WORKSTATION ID</span>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-2.5">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white truncate">{authenticatedUser.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-normal">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-550/15 text-indigo-400 font-bold uppercase text-[8px] shrink-0 font-sans">
                          {authenticatedUser.role}
                        </span>
                        <span className="truncate">{authenticatedUser.department}</span>
                      </div>
                    </div>

                    {/* Simulated 14-days Free Trial Tracking widget inside active Admin workspace (m) */}
                    {authenticatedUser.isAdmin && (
                      <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] space-y-1.5 text-left">
                        <div className="font-mono text-[9px] text-amber-400 font-semibold tracking-wider uppercase">
                          {authenticatedUser.isPaid ? "🏆 SUBSCRIPTION: ACTIVE" : `⚡ 14-DAY FREE TRIAL`}
                        </div>
                        <div className="text-[10px] text-slate-355">
                          {authenticatedUser.isPaid ? (
                            <span>Plan: <strong className="text-emerald-400">{authenticatedUser.paymentPlan || "Enterprise EHR"}</strong></span>
                          ) : (
                            <span>Day <strong className="text-emerald-400">{elapsedDays + 1}</strong> of 14 remaining (<strong className="text-emerald-400">{daysRemaining} days left</strong>)</span>
                          )}
                        </div>
                        {!authenticatedUser.isPaid && (
                          <button
                            onClick={handleSimulateTrialExpiration}
                            className="w-full mt-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold rounded hover:shadow-md transition-all uppercase text-center"
                            title="Shifts creation timestamp 15 days into past to review automatic redirection & payment features."
                          >
                            ⏩ Fast-Forward 14 Days
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        const confirmed = window.confirm("Are you sure you want to revoke your session and log out?");
                        if (!confirmed) return;
                        await signOut(auth);
                        setAuthenticatedUser(null);
                        setMobileSidebarOpen(false);
                        setViewMode("saas");
                        setInitialSignUp(false);
                      }}
                      className="w-full text-center py-1.5 bg-slate-850 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/20 text-slate-400 text-[10px] font-mono font-bold rounded-lg cursor-pointer transition-all"
                    >
                      REVOKE SESSION (LOGOUT)
                    </button>
                  </div>
                </div>

                {/* Grouped Lists navigation */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {sidebarNavigation.map((group) => {
                    const isGroupExpanded = expandedGroups[group.id];
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.id} className="space-y-1">
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-400 hover:text-white uppercase font-mono tracking-wider py-1 select-none"
                        >
                          <div className="flex items-center gap-1.5">
                            <GroupIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{group.title}</span>
                          </div>
                          {isGroupExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>

                        {isGroupExpanded && (
                          <div className="pl-2 space-y-1 pt-1">
                            {group.subItems.map((sub) => {
                              const SubIcon = sub.icon;
                              const isPermitted = activeEmployee.permittedModules.includes(sub.id);
                              const isActive = activeTab === sub.id && activeSubTab === sub.subId;
                              return (
                                <button
                                  key={sub.subId}
                                  onClick={() => selectSubMenu(sub.id, sub.subId)}
                                  className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all flex items-center justify-between border ${
                                    isActive
                                      ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
                                      : "text-slate-350 hover:text-white border-transparent hover:bg-slate-800/60"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-950" : (isPermitted ? "text-slate-500" : "text-red-500")}`} />
                                    <span className="truncate">{sub.label}</span>
                                  </div>

                                  {!isPermitted && (
                                    <span className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 py-0.5 rounded font-mono font-bold shrink-0">
                                      LOCK
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-950 text-slate-400 border-t border-slate-800 text-[9px] font-mono space-y-0.5 mt-auto">
                  <div>HIMS AUTH CONTEXT STATUS: ONLINE</div>
                  <div>SECURE ENCRYPTION PROTOCOL: SHA-256</div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 3. CORE EHR WORKSPACE CONTENT WRAPPER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Top Info Banner for OPD/IPD redirection focus feedback */}
          {selectedPatientId && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-indigo-950 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-indigo-500" />
                   <span>
                     Currently highlighting patient EHR profile: <strong>{(store.patients.find(p => p.id === selectedPatientId))?.name}</strong> • UHID Reference: <strong>{selectedPatientId}</strong>
                   </span>
                </div>
                <button 
                  onClick={() => setSelectedPatientId(null)} 
                  className="font-mono text-[10px] bg-indigo-100 hover:bg-slate-200/50 hover:text-slate-950 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  Clear Selection Focus
                </button>
             </div>
          )}

          {/* Tab windows wrapper with Animate presence transition */}
          <main className="min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}_${activeSubTab}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {!hasAccessToActiveTab ? (
                  <div className="bg-white border border-red-100 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm my-12 animate-fadeIn animate-duration-150">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <ShieldCheck className="w-6 h-6 stroke-2 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Access Restricted by RBAC Policy</h3>
                      <p className="text-xs text-slate-500">
                        Your active session profile (<strong className="text-slate-700">{currentUser.name}</strong>, Role: <strong className="text-indigo-650 font-bold">{currentUser.role}</strong>) does not have authorization to view the <strong className="font-semibold text-slate-700">{sidebarNavigation.flatMap(g => g.subItems).find(n => n.id === activeTab)?.label}</strong> module.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-left text-xs font-mono text-slate-500 max-w-sm mx-auto space-y-1">
                      <div>POLICY_ID: HIMS-SEC-{activeTab.toUpperCase()}-02</div>
                      <div>DEPARTMENT: {activeEmployee.department}</div>
                      <div>AUTHORIZED_MODULES: [{activeEmployee.permittedModules.join(", ")}]</div>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={() => selectSubMenu("dashboard", "overview")}
                        className="px-4 py-1.5 bg-slate-950 text-white font-semibold text-xs rounded hover:bg-slate-850 cursor-pointer transition-colors"
                      >
                        Return to Operations Dashboard
                      </button>
                      {activeEmployee.permittedModules.includes("admin") && (
                        <button
                          onClick={() => selectSubMenu("admin", "roles")}
                          className="px-4 py-1.5 border border-slate-200 text-slate-705 hover:bg-slate-50 text-xs font-semibold rounded cursor-pointer transition-colors"
                        >
                          Configure Roles Settings
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {activeTab === "dashboard" && (
                      <Dashboard store={store} setActiveTab={setActiveTab} setSelectedPatientId={setSelectedPatientId} />
                    )}
                    {activeTab === "opd" && (
                      <OPDModule store={store} selectedPatientId={selectedPatientId} setSelectedPatientId={setSelectedPatientId} />
                    )}
                    {activeTab === "ipd" && (
                      <IPDModule store={store} />
                    )}
                    {activeTab === "labs" && (
                      <LabModule store={store} />
                    )}
                    {activeTab === "pharmacy" && (
                      <PharmacyModule store={store} />
                    )}
                    {activeTab === "finance" && (
                      <FinanceBillingModule store={store} />
                    )}
                    {activeTab === "admin" && (
                      <AdminModule 
                        store={store} 
                        currentUser={currentUser} 
                        activeSubTab={activeSubTab}
                        setActiveSubTab={setActiveSubTab}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        {/* Floating System-Wide Alex co-pilot Chat */}
        <AIChatBot store={store} />

        {/* Dynamic Footnote */}
        <footer className="py-6 mt-12 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono select-none">
          <div>AI-Powered Hospital Information Management System (HIMS) • Version 1.2.0</div>
          <div className="mt-1">ISO 27001 Certified • HIPAA Compliance Assured • GCP Cloud Architecture</div>
        </footer>
      </div>
    </div>
  </div>
  );
}
