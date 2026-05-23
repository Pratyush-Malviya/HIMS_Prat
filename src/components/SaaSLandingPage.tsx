import React, { useState } from "react";
import { 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  FileText, 
  Lock,
  Database,
  FileSpreadsheet,
  AlertCircle,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Clock,
  Users,
  Shield,
  FileCheck,
  Smartphone,
  Check,
  X,
  Menu
} from "lucide-react";

interface SaaSLandingPageProps {
  onLaunchApp: (role: "Hospital Admin" | "Super Admin") => void;
  onOpenAuth?: (signUp: boolean) => void;
  store?: any;
}

interface PainPointSlide {
  id?: string;
  title: string;
  category: string;
  problemBadge: string;
  problemTitle: string;
  problemDesc: string;
  problemImage: string;
  solutionBadge: string;
  solutionTitle: string;
  solutionDesc: string;
  solutionImage: string;
  metricValue: string;
  metricLabel: string;
  remedyBullets: string[];
}

export function SaaSLandingPage({ onLaunchApp, onOpenAuth, store }: SaaSLandingPageProps) {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  // Pricing Calculator State
  const [bedCapacity, setBedCapacity] = useState<number>(150);
  const [useAIModules, setUseAIModules] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Read Dynamic Landing Page CMS Configuration from our global HMO/EHR Store
  const landingPageConfig = store?.landingPageConfig || {};

  const fontFamily = landingPageConfig.fontFamily || "Space Grotesk";
  const primaryColor = landingPageConfig.primaryColor || "emerald";
  const backgroundColorMode = landingPageConfig.backgroundColorMode || "slate";

  const announcementText = landingPageConfig.announcementText || "HIPAA Certification Assured • AES-256 Symmetric Encryption Vault Built-In • Zero Upfront Setup Fees";
  const heroHeaderPart1 = landingPageConfig.heroHeaderPart1 || "Erase Clinician Exhaustion with a";
  const heroHeaderPart2 = landingPageConfig.heroHeaderPart2 || "Pure-Visual Hospital OS";
  const heroSubheadline = landingPageConfig.heroSubheadline || "The self-explanatory administrative OS for hospitals. Erase paper charts, drug leakage, and bed-sync bottlenecks. View and dispatch real-time operations on a live, highly-secure dashboard.";
  const heroButtonLeftText = landingPageConfig.heroButtonLeftText || "Launch Free Test Sandbox";
  const heroButtonRightText = landingPageConfig.heroButtonRightText || "Review Clinical Pitfalls";
  const heroImage = landingPageConfig.heroImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80";

  // Dynamic CSS utilities mapped from selection
  const fontClass = fontFamily === "Space Grotesk" ? "font-sans tracking-tight"
                  : fontFamily === "Inter" ? "font-sans tracking-normal"
                  : fontFamily === "Playfair Display" ? "font-serif"
                  : "font-mono text-xs";

  const colorClasses = {
    emerald: {
      text: "text-emerald-600",
      textDark: "text-emerald-800",
      bg: "bg-emerald-600",
      hoverBg: "hover:bg-emerald-700",
      bgLight: "bg-emerald-50",
      border: "border-emerald-500",
      badgeText: "text-emerald-400",
      ring: "ring-emerald-500/10",
      shadow: "shadow-emerald-700/10"
    },
    indigo: {
      text: "text-indigo-600",
      textDark: "text-indigo-805 text-indigo-800",
      bg: "bg-indigo-600",
      hoverBg: "hover:bg-indigo-700",
      bgLight: "bg-indigo-50",
      border: "border-indigo-500",
      badgeText: "text-indigo-400",
      ring: "ring-indigo-500/10",
      shadow: "shadow-indigo-700/10"
    },
    teal: {
      text: "text-teal-600",
      textDark: "text-teal-800",
      bg: "bg-teal-600",
      hoverBg: "hover:bg-teal-700",
      bgLight: "bg-teal-50",
      border: "border-teal-500",
      badgeText: "text-teal-400",
      ring: "ring-teal-500/10",
      shadow: "shadow-teal-700/10"
    },
    blue: {
      text: "text-blue-600",
      textDark: "text-blue-800",
      bg: "bg-blue-600",
      hoverBg: "hover:bg-blue-700",
      bgLight: "bg-blue-50",
      border: "border-blue-500",
      badgeText: "text-blue-450",
      ring: "ring-blue-500/10",
      shadow: "shadow-blue-700/10"
    },
    violet: {
      text: "text-violet-600",
      textDark: "text-violet-800",
      bg: "bg-violet-600",
      hoverBg: "hover:bg-violet-700",
      bgLight: "bg-violet-50",
      border: "border-violet-500",
      badgeText: "text-violet-400",
      ring: "ring-violet-505/10",
      shadow: "shadow-violet-700/10"
    },
    rose: {
      text: "text-rose-600",
      textDark: "text-rose-800",
      bg: "bg-rose-600",
      hoverBg: "hover:bg-rose-700",
      bgLight: "bg-rose-50",
      border: "border-rose-500",
      badgeText: "text-rose-400",
      ring: "ring-rose-500/10",
      shadow: "shadow-rose-700/10"
    }
  }[primaryColor] || {
    text: "text-emerald-600",
    textDark: "text-emerald-805 text-emerald-800",
    bg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-700",
    bgLight: "bg-emerald-50",
    border: "border-emerald-500",
    badgeText: "text-emerald-400",
    ring: "ring-emerald-505/10",
    shadow: "shadow-emerald-700/10"
  };

  const bgCanvasClass = backgroundColorMode === "light" ? "bg-white"
                      : backgroundColorMode === "slate" ? "bg-slate-50"
                      : backgroundColorMode === "stone" ? "bg-stone-50"
                      : "bg-zinc-50";

  // Active modular dynamic feature spotlight state 
  const [activeFeatIndex, setActiveFeatIndex] = useState<number>(0);

  // Active static legacy module spotlight tab fallback
  const [activeModuleTab, setActiveModuleTab] = useState<"rbac" | "opd" | "ipd" | "pharmacy" | "compliance">("rbac");

  // Pain Points Carousel Index State
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);

  // Dynamic pricing algorithm
  const baseCost = 299;
  const costPerBed = 1.5;
  const aiSuitePremium = useAIModules ? 150 : 0;
  const totalCalculatedSaaSPrice = baseCost + (bedCapacity * costPerBed) + aiSuitePremium;

  // Static fallback array for Pain Points Slides
  const fallbackPainPointsSlides: PainPointSlide[] = [
    {
      title: "Clinician Burnout & Paper Shift Scribes",
      category: "STAFF RETENTION & TRANSITION ERAS",
      problemBadge: "🔴 PREVALENT CRISIS: DIZZY HANDOFFS",
      problemTitle: "Nurses spend over 4 hours/shift manually writing handover logs",
      problemDesc: "Rushed scribbles get lost. Shifts overlap with chaotic spoken huddles, leading to dangerous medical treatment misunderstandings.",
      problemImage: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=700&q=80",
      solutionBadge: "🟢 THE MEDIFLOW AID: AUTOMATED CLINICAL SBAR SUMMARY",
      solutionTitle: "Generate complete standardized SBAR summaries instantly",
      solutionDesc: "Smart algorithms compile bed telemetry, diagnosis classifications, and active medication logs into a compliant shift briefing draft in 30 seconds.",
      solutionImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=700&q=80",
      metricValue: "98.4%",
      metricLabel: "Transcription Error Reduction Rate",
      remedyBullets: [
        "Cut shift transition planning from 45 min to 30 seconds",
        "Empower clinicians to return to bedside clinical care",
        "Enforce absolute clinical transfer compliance automatically"
      ]
    },
    {
      title: "Blind Intake Sync & Bed Allocation Delays",
      category: "WARD CAPACITY LEAKAGE",
      problemBadge: "🔴 PREVALENT CRISIS: DIAL-A-BED CHAOS",
      problemTitle: "Admissions officers lack live bed metrics on active wards",
      problemDesc: "Nurses endure back-and-forth intercom calls. Outpatients wait in ER entryways while empty beds sit unlogged on other floors.",
      problemImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80",
      solutionBadge: "🟢 THE MEDIFLOW AID: DYNAMIC 1-CLICK BED TRACKING",
      solutionTitle: "Visual bed map tracks occupancy globally in real-time",
      solutionDesc: "Dispatch admissions to general, ICU, or recovery rooms instantly on an interactive live grid. Automatically trigger cleanup dispatches on discharge.",
      solutionImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80",
      metricValue: "+18%",
      metricLabel: "Daily Inpatient Capacity Yield Boost",
      remedyBullets: [
        "Eliminate non-clinical dispatch coordination calls totally",
        "Red-tag alert highlights for direct critical monitoring needs",
        "Audit logs capture discharge timestamps for regulatory review"
      ]
    },
    {
      title: "Prescription Pilferage & Hidden Stock Leakage",
      category: "REVENUE LOSS PREVENTION",
      problemBadge: "🔴 PREVALENT CRISIS: DISPENSARY GAPS",
      problemTitle: "Medication stocks decrease without doctor orders matched",
      problemDesc: "Unit items disperse without e-signature verification. Crucial batches dry out or exceed expiry silently. Invoices fail to reflect true usage.",
      problemImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
      solutionBadge: "🟢 THE MEDIFLOW AID: CLOSED-LOOP RX RECORDING",
      solutionTitle: "Symmetric connection of prescriptions to inventory",
      solutionDesc: "The stock cupboard auto-deducts doses upon pharmacist verification. Safety reorder alerts trigger before base essentials dip below custom thresholds.",
      solutionImage: "https://images.unsplash.com/photo-1587854692152-cbe660db0969?auto=format&fit=crop&w=700&q=80",
      metricValue: "$4.5K",
      metricLabel: "Avg. Month Inventory Leakage Recovered",
      remedyBullets: [
        "Block stale batch utilization with active expiration checkups",
        "E-signatures ensure accountability across clinical shifts",
        "Zero-gap patient invoices compile direct from provider checklists"
      ]
    },
    {
      title: "Insecure Messaging & Heavy HIPAA Audit Fines",
      category: "DATA PROTECTION RISK",
      problemBadge: "🔴 PREVALENT CRISIS: UNENCRYPTED CHATS",
      problemTitle: "Nurses slide PHI records into unsecure phone app chats",
      problemDesc: "Sharing laboratory findings or consult histories across non-compliant messengers creates extreme data leakage vulnerabilities.",
      problemImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=700&q=80",
      solutionBadge: "🟢 THE MEDIFLOW AID: IMMUTABLE AUDIT LEDGER & RBAC",
      solutionTitle: "AES-256 cloud record vault with granular security",
      solutionDesc: "Isolate Protected Health Information (PHI). Lock interfaces down according to precise operational authorization levels. Trace all log readings.",
      solutionImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=700&q=80",
      metricValue: "100%",
      metricLabel: "Audit Trail Readiness Guarantee",
      remedyBullets: [
        "All data protected with AES-256 at-rest & in-transit standards",
        "Signed HIPAA Business Associate Agreement (BAA) support",
        "Track actor identities and view actions with permanent logs"
      ]
    }
  ];

  // Resolve slides dynamically
  const painPointsSlides = landingPageConfig.painPointsSlides && landingPageConfig.painPointsSlides.length > 0
    ? landingPageConfig.painPointsSlides
    : fallbackPainPointsSlides;

  const nextSlide = () => {
    setActiveCarouselIndex((prev) => (prev + 1) % painPointsSlides.length);
  };
  const prevSlide = () => {
    setActiveCarouselIndex((prev) => (prev - 1 + painPointsSlides.length) % painPointsSlides.length);
  };

  // High-value, concise modules summary
  const modulesSummary = {
    rbac: {
      title: "Granular Role-Based Access Control",
      badge: "HIPAA SECURED AT CORE",
      desc: "Stop cross-role data leaks. Pre-configured, compliant permissions align perfectly to standard hospital operations hierarchies.",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      points: [
        "MD Physicians: Write diagnostic SOAP entries, dispatch lab orders, and authorise scripts.",
        "Ward Nurses: Record core telemetry, evaluate bed statuses, and trigger shift handoffs.",
        "Pharmacists: Approve electronic scripts, view inventory logs, and deduct units."
      ],
      infographic: [
        { role: "MD Physician", access: "Full Clinical Consultation", status: "Active Write" },
        { role: "Ward Nurse", access: "Admit & Inpatient Vitals", status: "Ward Access" },
        { role: "Pharmacist", access: "Dispensary stock & e-Rx", status: "Inventory Only" }
      ]
    },
    opd: {
      title: "Seamless Outpatient Consultation Tool",
      badge: "MAXIMIZE CLINIC THROUGHPUT",
      desc: "Erase administrative drag. Draft SOAP records, pull up diagnostic catalogs, and transmit orders from a single elegant interface.",
      imageUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80",
      points: [
        "Smart Form Guide: Speeds up Subjective, Objective, Assessment, and Plan drafting.",
        "ICD-10 Search Integration: Diagnostic accuracy at the point of care.",
        "Direct Lab Sync: Instantly request pathology screens with status alerts."
      ],
      infographic: [
        { step: "1. Vital Ingress", action: "Nurses log real-time telemetry", time: "Instant" },
        { step: "2. Consultation", action: "Physician drafts SOAP orders", time: "3 Mins" },
        { step: "3. Direct Dispatch", action: "Pharmacy & Labs sync automatically", time: "Automated" }
      ]
    },
    ipd: {
      title: "Inpatient Wards & Occupancy Grid",
      badge: "ELIMINATE EMPTY BED OVERHEAD",
      desc: "Live visibility over ICU, Pediatric, and Recovery chambers. Erase coordination noise and control bed turnover smoothly.",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
      points: [
        "Responsive Map Grid: Identify unoccupied, scheduled, and dirty bed units at a glance.",
        "SBAR Transition Tool: Autoconsolidate telemetry for flawless doctor handovers.",
        "Intake Prioritization: Flag urgent needs with visual emergency markers."
      ],
      infographic: [
        { floor: "ICU Ward A", count: "12 beds occupied, 3 open", color_badge: "High Support Area" },
        { floor: "Surgical Suite", count: "18 beds occupied, 4 open", color_badge: "Recovery Room" },
        { floor: "Pediatric Ward", count: "35 beds occupied, 10 open", color_badge: "General Ward" }
      ]
    },
    pharmacy: {
      title: "Closed-Loop Pharmacy Depot Sync",
      badge: "PREVENT CRITICAL DRUG PILFERAGE",
      desc: "Connect your medicine shelves directly to patient checkouts. Keep dosage trails verified and auto-detect stock depletion.",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      points: [
        "Stock Depletion Alerts: Prompt warning thresholds dynamically configured for key medicines.",
        "Dispensing Sanity Engine: Strict automated checks lock out expired batches index-wide.",
        "Real-Time Balancing: Matches prescription fulfillment to bed checkout billing charts automatically."
      ],
      infographic: [
        { item: "Amoxicillin 500mg Capsule", level: "4,120 Units Available", tier: "Healthy Margin" },
        { item: "Insulin Humalog 100 U/mL", level: "28 Vials Available", tier: "Refill Warning" },
        { item: "Paracetamol 500mg Tablet", level: "8,940 Units Available", tier: "Healthy Margin" }
      ]
    },
    compliance: {
      title: "Compliant HIPAA Protective Shield",
      badge: "IMPREGNABLE DATA SECURITY",
      desc: "Architected around strict clinical audit procedures. Enforce modern transport and storage encryption automatically.",
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80",
      points: [
        "Secure Storage standard: Active row-level data segregation ensures bulletproof isolation.",
        "Global Actor Logging: Track exact credential footprints during any database interaction.",
        "Executive Reports: Print audit-ready ledger certificates for licensing regulators."
      ],
      infographic: [
        { framework: "Rest Data Crypto", spec: "Symmetric AES-256 Shield", status: "Active" },
        { framework: "Credential Sync Audit", spec: "Immutable actor ledger tracks", status: "Enabled" },
        { framework: "Network Streams", spec: "High-grade TLS 1.3 Transport", status: "Enforced" }
      ]
    }
  };

  // Check if features list spotlight has custom entries loaded inside CMS
  const spotlightFeaturesList = landingPageConfig.featuresList && landingPageConfig.featuresList.length > 0
    ? landingPageConfig.featuresList
    : null;

  return (
    <div className={`${bgCanvasClass} text-slate-900 min-h-screen ${fontClass} antialiased overflow-x-hidden w-full relative`}>
      {/* 🟢 CLINICAL BAR (HIGH VALUE VALUE-PROPS) */}
      <div className="bg-slate-950 text-slate-300 text-xs sm:text-xs py-3 px-6 font-mono font-medium tracking-wide text-center flex items-center justify-center gap-2 border-b border-slate-905 shadow-sm leading-relaxed">
        <HeartPulse className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
        <span className="uppercase">{announcementText}</span>
      </div>

      {/* NAVIGATION BAR - Sleeker and elegant */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`p-2 sm:p-2.5 ${colorClasses.bg} text-white rounded-xl shadow-xs`}>
            <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-slate-950">MediFlow AI</h1>
            <span className="font-mono text-[8px] sm:text-[9px] tracking-widest font-bold text-slate-400 uppercase block leading-none">Enterprise HIMS Grid</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 tracking-tight">
          <a href="#quick-visual" className={`hover:${colorClasses.text} transition-colors`}>How It Works</a>
          <a href="#pain-carousel" className={`hover:${colorClasses.text} transition-colors`}>Administrative Evaluation</a>
          <a href="#spotlight" className={`hover:${colorClasses.text} transition-colors`}>Core Modules</a>
          <a href="#rbac-section" className={`hover:${colorClasses.text} transition-colors`}>Security Matrix</a>
          <a href="#calculator" className={`hover:${colorClasses.text} transition-colors`}>Subscription Calc</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className="hidden md:block text-slate-650 hover:text-slate-950 text-sm font-medium px-4 py-2 border border-slate-200 hover:border-slate-350 bg-white rounded-xl shadow-xs transition-all active:scale-95"
          >
            Clinical Sign In
          </button>
          
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className={`hidden sm:flex ${colorClasses.bg} ${colorClasses.hoverBg} text-white text-sm font-bold px-5 py-2.5 rounded-xl items-center gap-2 transition-all shadow-md ${colorClasses.shadow} active:scale-95`}
            id="saas_header_launch_app"
          >
            <span>Activate Sandbox</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Sandbox Trigger for mobile - Sleek & compact */}
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className={`sm:hidden ${colorClasses.bg} ${colorClasses.hoverBg} text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-all shadow-xs active:scale-95`}
          >
            <span>Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Hamburger toggle button for responsive layout */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-950 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Dropping Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden sticky top-[69px] z-40 bg-white border-b border-slate-200 shadow-md transition-all">
          <div className="px-5 py-4 space-y-4">
            <nav className="flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
              <a 
                href="#quick-visual" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:${colorClasses.text} transition-colors border-b border-slate-100 block`}
              >
                How It Works
              </a>
              <a 
                href="#pain-carousel" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:${colorClasses.text} transition-colors border-b border-slate-100 block`}
              >
                Administrative Evaluation
              </a>
              <a 
                href="#spotlight" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:${colorClasses.text} transition-colors border-b border-slate-100 block`}
              >
                Core Modules
              </a>
              <a 
                href="#rbac-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:${colorClasses.text} transition-colors border-b border-slate-100 block`}
              >
                Security Matrix
              </a>
              <a 
                href="#calculator" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:${colorClasses.text} transition-colors border-b border-slate-100 block`}
              >
                Subscription Calc
              </a>
            </nav>

            <div className="flex flex-col gap-2 pt-1">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRoleModalOpen(true);
                }}
                className="w-full text-center text-slate-700 hover:text-slate-950 text-xs sm:text-sm font-semibold py-2.5 border border-slate-200 bg-white rounded-xl shadow-xs transition-colors"
              >
                Clinical Sign In
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRoleModalOpen(true);
                }}
                className={`w-full text-center ${colorClasses.bg} ${colorClasses.hoverBg} text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm`}
              >
                <span>Activate Sandbox</span>
                <ArrowRight className="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Majestic glow patterns */}
      <div className="absolute top-24 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 2. HERO HIGHLIGHT ZONE - Highly-polished spacing */}
      <section className="relative px-6 sm:px-12 pt-20 pb-20 max-w-6xl mx-auto text-center space-y-8 animate-fade-in" style={{ fontFamily }}>
        
        {/* Modern Trust Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-full text-xs font-mono font-bold uppercase shadow-xs leading-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>98.4% Transcription Errors Reclaimed • AES-256 Symmetric Encryption</span>
        </div>

        {/* Improved Spacing & Concise Copy */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
            {heroHeaderPart1} <span className={`${colorClasses.text} block sm:inline`}>{heroHeaderPart2}</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            {heroSubheadline}
          </p>
        </div>

        {/* Clean Call To Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className={`w-full sm:w-auto ${colorClasses.bg} ${colorClasses.hoverBg} text-white font-bold text-base px-8 py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg ${colorClasses.shadow} active:scale-98`}
            id="saas_hero_demo_btn"
          >
            <span>{heroButtonLeftText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <a
            href="#pain-carousel"
            className="w-full sm:w-auto text-center text-sm sm:text-base text-slate-700 hover:text-slate-950 font-medium border border-slate-200 hover:border-slate-350 px-8 py-4.5 rounded-2xl transition-all bg-white shadow-xs active:scale-98"
          >
            {heroButtonRightText}
          </a>
        </div>

        {/* REINFORCED PREVIEW CONTEXT: Sleek visual display banner */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="bg-white border-8 border-slate-100/90 rounded-3xl shadow-xl overflow-hidden relative">
            
            {/* Real Hospital Action Banner with simulated UI widgets on top */}
            <div className="aspect-[16/8] w-full bg-slate-100 relative overflow-hidden">
              <img 
                src={heroImage} 
                alt="Hospital medical team coordinating patients with tablets"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-8 text-left">
                <div className="max-w-2xl space-y-2">
                  <span className="font-mono text-[10px] text-emerald-400 font-extrabold tracking-wider uppercase bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded inline-block">
                    SMART WARD INTEGRITY
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Synchronized Clinical Workflows
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Saves administrators thousands of hours in coordinate latency. Busy specialists recognize task queues, vital alarms, and prescription schedules in seconds via neat visual indicators.
                  </p>
                </div>
              </div>

              {/* Float Widget 1: Real-time Vital Track Simulation */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/60 text-left space-y-2 hidden sm:block w-64 transform hover:scale-102 transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 flex-row">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">TELEMETRY GRID</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Bed 102 — John Doe</span>
                    <span className="text-[10px] text-red-600 font-extrabold font-mono uppercase bg-red-50 px-1.5 py-0.5 rounded mt-0.5 block w-max">HR: 114 BPM ALERT</span>
                  </div>
                </div>
              </div>

              {/* Float Widget 2: Security Lock Mockup */}
              <div className="absolute bottom-6 right-6 bg-slate-950/90 backdrop-blur-md p-3 px-4 rounded-xl shadow-lg border border-slate-800 text-left flex items-center gap-3 hidden md:flex">
                <div className="p-2 bg-emerald-950/60 text-emerald-450 text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">HIPAA Ledger Active</span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider">SECURE ROWS (AES-256)</span>
                </div>
              </div>

            </div>

            {/* Simulated Desktop Preview Header Bar to establish Software Identity */}
            <div className="bg-slate-950 px-6 py-4.5 border-t border-slate-900 text-slate-400 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-450 ml-3 text-slate-400 tracking-tight text-[11px]">mediflow-secure-cloud-v2/applet</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-emerald-400 font-bold text-[10px] tracking-wider">
                <span>● REAL-TIME FIRESTORE CLIENT CONNECTED</span>
                <span>AUDIT RECORDING: COMPLETE</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 🟢 THE PUNCHY METHODOLOGY SECTION (HIGH SPACING AND NO LECTURE COPY) */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-24 px-6 sm:px-12" id="quick-visual">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold text-emerald-600 tracking-widest uppercase">Visual Handovers • Zero Lecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Simple Operational Safety In Just Four Steps
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Ditch dense administration rules. Follow these quick visual flags to understand error-free medical transitions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
            
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xs hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-emerald-50/85 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                🩺
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">STEP 1: CONSULT</span>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Diagnose Cleanly</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Doctors file SOAP diaries and prescription lines directly.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xs hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-blue-50/85 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                🏥
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">STEP 2: ALLOCATE</span>
                <h4 className="text-sm font-semibold text-slate-900">Reserve Clear Beds</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Admissions track and allocate ward beds dynamically.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xs hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-amber-50/85 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                💊
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">STEP 3: DECREMENT</span>
                <h4 className="text-sm font-semibold text-slate-900">Lock Inventory</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Warehouse shelves decrement dosages inside dispensary.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xs hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-purple-50/85 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xs">
                🧾
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">STEP 4: SETTLE</span>
                <h4 className="text-sm font-semibold text-slate-900">Audit Ledger Out</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Print invoice lists synced from clinicians seamlessly.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🔴 MODERN CAROUSEL EVALUATION (CRISIS VS REMEDY WITH BIG VALUE DATA) */}
      <section className="bg-slate-950 text-white py-24 px-6 sm:px-12" id="pain-carousel">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 text-emerald-450 text-emerald-450 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Executive Hospital Audit review</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Hospital Pain Points <span className="text-red-500">vs.</span> MediFlow Remedy
              </h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                Hospital operators cannot afford admin friction or data data leaks. Evaluate slide controls below to examine how the Pure-Visual HIMS mitigates clinic losses instantly.
              </p>
            </div>

            {/* Carousel Navigation Controller */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <button 
                onClick={prevSlide}
                className="p-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 transition-all hover:border-slate-700 active:scale-90 cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="font-mono text-xs text-slate-350 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 tracking-wider font-semibold">
                {activeCarouselIndex + 1} / {painPointsSlides.length}
              </span>

              <button 
                onClick={nextSlide}
                className="p-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl border border-slate-800 transition-all hover:border-slate-700 active:scale-90 cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clean Split Showcase Grid Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Top Badge Meta Line */}
            <div className="bg-slate-900/40 px-6 py-4 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-[10px] font-mono tracking-widest text-emerald-450 text-emerald-400 font-black uppercase">
                SPOTLIGHT {activeCarouselIndex + 1} — {painPointsSlides[activeCarouselIndex].category}
              </span>
              <span className="text-sm font-bold text-slate-300">
                {painPointsSlides[activeCarouselIndex].title}
              </span>
            </div>

            {/* Split Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* PROBLEM (4 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 text-left bg-gradient-to-b from-red-950/15 to-transparent">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-red-500 font-extrabold bg-red-950/40 border border-red-900/60 px-2.5 py-1 rounded-md uppercase tracking-wider block w-max">
                    {painPointsSlides[activeCarouselIndex].problemBadge}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {painPointsSlides[activeCarouselIndex].problemTitle}
                  </h3>
                  <p className="text-xs sm:text-xs text-slate-400 leading-relaxed text-slate-300">
                    {painPointsSlides[activeCarouselIndex].problemDesc}
                  </p>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden relative border border-slate-800/80 bg-slate-900">
                  <img 
                    src={painPointsSlides[activeCarouselIndex].problemImage}
                    alt="Clinic paper chaos illustration and stress indicator"
                    className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-red-950/20"></div>
                </div>
              </div>

              {/* SOLUTION & DATA (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 text-left bg-gradient-to-b from-emerald-950/10 to-transparent flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-400 font-extrabold bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                        {painPointsSlides[activeCarouselIndex].solutionBadge}
                      </span>
                      <h3 className="text-lg font-bold text-emerald-400 tracking-tight block mt-1">
                        {painPointsSlides[activeCarouselIndex].solutionTitle}
                      </h3>
                    </div>

                    {/* BIG VALUE DATA CALLOUT */}
                    <div className="bg-emerald-950/60 border border-emerald-900 p-3 rounded-2xl text-center min-w-[120px] shrink-0">
                      <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 leading-none">
                        {painPointsSlides[activeCarouselIndex].metricValue}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase font-semibold leading-tight max-w-[110px] mx-auto">
                        {painPointsSlides[activeCarouselIndex].metricLabel}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-xs text-slate-300 leading-relaxed">
                    {painPointsSlides[activeCarouselIndex].solutionDesc}
                  </p>

                  <div className="aspect-[16/6] w-full rounded-xl overflow-hidden relative border border-emerald-900/50">
                    <img 
                      src={painPointsSlides[activeCarouselIndex].solutionImage}
                      alt="Modern clinician viewing direct ward screens"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Remedy bullets */}
                <div className="space-y-3 pt-4 border-t border-slate-900 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {painPointsSlides[activeCarouselIndex].remedyBullets.map((bullet, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-850/80 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-450 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-300 leading-tight">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Quick action bar */}
            <div className="p-4.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-xs">
              <span className="text-slate-400 leading-relaxed font-mono">
                💡 Want to test these configurations side-by-side with live database updates? Launch our isolated clinical sandbox.
              </span>
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-555 bg-emerald-700 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
              >
                Test Live Sandbox Solutions
              </button>
            </div>

          </div>

          {/* Slider indicator dots */}
          <div className="flex justify-center gap-2">
            {painPointsSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCarouselIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeCarouselIndex === index 
                    ? "bg-emerald-500 w-8" 
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                title={`Access Slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE SPOTLIGHT TABS - MODULAR OS */}
      <section className="bg-white py-24 px-6 sm:px-12 border-y border-slate-200/50" id="spotlight">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-left space-y-2">
            <span className={`font-mono text-xs font-bold tracking-widest ${colorClasses.text} uppercase`}>Interactive Spotlight Dashboard</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hospital Logistics Standardized Under One Clinical OS
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl">
              Inspect operational modules satisfying certified global clinical data audits:
            </p>
          </div>

          {/* Combined Unified Features Data List */}
          {(() => {
            const unifiedFeatures = spotlightFeaturesList || [
              { id: "rbac", title: "🔒 Security & Access Matrix", badge: "HIPAA SECURED AT CORE", desc: "Stop cross-role data leaks. Pre-configured, compliant permissions align perfectly to standard hospital operations hierarchies.", points: modulesSummary.rbac.points, imageUrl: modulesSummary.rbac.imageUrl, roleKey: "rbac" },
              { id: "opd", title: "🩺 Outpatient (OPD) Sync", badge: "MAXIMIZE CLINIC THROUGHPUT", desc: "Erase administrative drag. Draft SOAP records, pull up diagnostic catalogs, and transmit orders from a single elegant interface.", points: modulesSummary.opd.points, imageUrl: modulesSummary.opd.imageUrl, roleKey: "opd" },
              { id: "ipd", title: "🏥 Inpatient Ward Beds", badge: "ELIMINATE EMPTY BED OVERHEAD", desc: "Live visibility over ICU, Pediatric, and Recovery chambers. Erase coordination noise and control bed turnover smoothly.", points: modulesSummary.ipd.points, imageUrl: modulesSummary.ipd.imageUrl, roleKey: "ipd" },
              { id: "pharmacy", title: "💊 Pharmacy Depot Sync", badge: "PREVENT CRITICAL DRUG PILFERAGE", desc: "Connect your medicine shelves directly to patient checkouts. Keep dosage trails verified and auto-detect stock depletion.", points: modulesSummary.pharmacy.points, imageUrl: modulesSummary.pharmacy.imageUrl, roleKey: "pharmacy" },
              { id: "compliance", title: "⚖️ HIPAA Safe Shield", badge: "IMPREGNABLE DATA SECURITY", desc: "Architected around strict clinical audit procedures. Enforce modern transport and storage encryption automatically.", points: modulesSummary.compliance.points, imageUrl: modulesSummary.compliance.imageUrl, roleKey: "compliance" }
            ];

            const currentFeat = unifiedFeatures[activeFeatIndex] || unifiedFeatures[0];
            const displayRoleKey = currentFeat.roleKey || currentFeat.id;

            return (
              <>
                {/* Module Selector Button Row */}
                <div className="flex flex-wrap gap-2.5 pb-3 border-b border-slate-200/60">
                  {unifiedFeatures.map((tab, idx) => (
                    <button
                      key={tab.id || idx}
                      onClick={() => setActiveFeatIndex(idx)}
                      className={`px-4.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer border ${
                        activeFeatIndex === idx
                          ? `${colorClasses.bgLight} ${colorClasses.border} ${colorClasses.textDark} font-bold`
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/70 border-transparent"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>

                {/* Solution Highlight Block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
                  
                  {/* Left: Condensed criteria with high visual spacing */}
                  <div className="md:col-span-7 space-y-6 text-left">
                    <div className="space-y-2.5">
                      <span className={`font-mono text-[10px] font-bold ${colorClasses.textDark} uppercase tracking-widest px-3 py-1 ${colorClasses.bgLight} border border-slate-200 rounded-full inline-block`}>
                        {currentFeat.badge}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight leading-snug">
                        {currentFeat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {currentFeat.desc}
                      </p>
                    </div>

                    {/* High definition contextual imagery */}
                    <div className="rounded-2xl overflow-hidden aspect-[16/7] border border-slate-200 shadow-xs relative bg-slate-100">
                      <img 
                        src={currentFeat.imageUrl}
                        alt={`${currentFeat.title} Action Illustration`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Functional bullets */}
                    <div className="space-y-3.5">
                      <h4 className="text-[10px] font-bold text-slate-450 font-mono uppercase tracking-wider">Functional Features Active:</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {(currentFeat.points || []).map((pt: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-slate-50/85 border border-slate-200/60 p-3.5 rounded-xl shadow-xs">
                            <CheckCircle2 className={`w-4.5 h-4.5 ${colorClasses.text} shrink-0 mt-0.5`} />
                            <span className="leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Simulated Device Panel */}
                  <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between text-left shadow-xs">
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CLINICAL REGISTRY</span>
                          <span className="text-xs font-bold text-slate-800 mt-0.5 block">Audit Mapping Live</span>
                        </div>
                        <span className={`px-2 py-0.5 ${colorClasses.bgLight} ${colorClasses.textDark} font-mono text-[9px] font-bold rounded-md border border-slate-200`}>
                          REAL-TIME
                        </span>
                      </div>

                      {displayRoleKey === "rbac" && (
                        <div className="space-y-2 text-xs">
                          {modulesSummary.rbac.infographic.map((roleInfo, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{roleInfo.role}</span>
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{roleInfo.access}</span>
                              </div>
                              <span className={`text-[10px] font-mono ${colorClasses.textDark} font-bold ${colorClasses.bgLight} border border-slate-100 px-2 py-0.5 rounded-md`}>
                                {roleInfo.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {displayRoleKey === "opd" && (
                        <div className="space-y-2 text-xs">
                          {modulesSummary.opd.infographic.map((step, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{step.step}</span>
                                <span className="text-[10px] text-slate-500 mt-0.5 block">{step.action}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                                {step.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {displayRoleKey === "ipd" && (
                        <div className="space-y-2 text-xs font-mono">
                          {modulesSummary.ipd.infographic.map((ward, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div>
                                <span className="text-slate-800 font-bold text-xs">{ward.floor}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{ward.count}</span>
                              </div>
                              <span className={`text-[9px] ${colorClasses.textDark} font-bold uppercase ${colorClasses.bgLight} border border-slate-150 px-2 py-0.5 rounded-md`}>
                                {ward.color_badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {displayRoleKey === "pharmacy" && (
                        <div className="space-y-2 text-xs font-mono">
                          {modulesSummary.pharmacy.infographic.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div>
                                <span className="text-slate-800 font-bold text-xs">{item.item}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{item.level}</span>
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                item.tier.includes("Warning") ? "text-amber-700 bg-amber-50 border-amber-100" : `${colorClasses.textDark} ${colorClasses.bgLight} border-slate-200`
                              }`}>{item.tier}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {displayRoleKey === "compliance" && (
                        <div className="space-y-2 text-xs">
                          {modulesSummary.compliance.infographic.map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{comp.framework}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5 block">{comp.spec}</span>
                              </div>
                              <span className={`text-[10px] ${colorClasses.bgLight} ${colorClasses.textDark} border border-slate-100 px-2.5 py-0.5 rounded-md font-bold`}>
                                {comp.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!["rbac", "opd", "ipd", "pharmacy", "compliance"].includes(displayRoleKey) && (
                        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs font-sans">
                          <span className="font-bold text-slate-850 block">✨ Fully Operationalized Live Sandbox</span>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            This custom module runs on top of secure database channels dynamically. Real-time updates populate clinical dashboards instantly when launched.
                          </p>
                        </div>
                      )}

                    </div>

                    <div className="pt-4 border-t border-slate-200/80 mt-4 flex flex-col gap-3">
                      <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-mono">
                        ✨ Multi-user updates broadcast seamlessly in dev workspace environments. Create an interactive clinic now to experiment.
                      </p>
                      <button
                        onClick={() => setIsRoleModalOpen(true)}
                        className={`w-full ${colorClasses.bg} ${colorClasses.hoverBg} text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer`}
                      >
                        <span>Evaluate Isolated Live Modules</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* 4. GRANULAR RBAC MATRIX PANEL WITH PRISTINE GRID */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto space-y-10" id="rbac-section">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs font-bold tracking-widest text-emerald-600 uppercase">HIPAA Access Grid Matrix</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Rigid Clinical Role-Based Access Control
          </h2>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Protect Patient Health Information (PHI) under federal frameworks. Trace specific clinician write limitations precisely:
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4.5 font-bold">HIMS Feature Module</th>
                <th className="p-4.5 text-center">Admin (CEO)</th>
                <th className="p-4.5 text-center">Doctor (MD)</th>
                <th className="p-4.5 text-center">Ward Nurse</th>
                <th className="p-4.5 text-center">Lab Tech</th>
                <th className="p-4.5 text-center">Pharmacist</th>
                <th className="p-4.5 text-center">Finance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-slate-600">
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">Clinical Consultation (OPD)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Write SOAP notes & record ICD-10 keys</div>
                </td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write SOAP</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
              </tr>
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">Ward Bed Booking (IPD)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Edit patient bed allocation parameters</div>
                </td>
                <td className="p-4.5 text-center text-xs text-emerald-800 font-mono font-bold">Write Admis</td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write Ward</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
              </tr>
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">Ward Telemetry Feeds</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Configure pulse and temperature alerts</div>
                </td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write Vital</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
              </tr>
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">Lab Pathology Vouchers</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Authorise biochemical values lists</div>
                </td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write Labs</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
              </tr>
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">E-Prescription Dispense</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Approve e-Rx orders and decrement stock</div>
                </td>
                <td className="p-4.5 text-center text-[11px] text-slate-500 font-mono">Read-Only</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write Disp</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
              </tr>
              <tr className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4.5">
                  <div className="font-bold text-slate-950 text-xs sm:text-sm">Billing Ledger Auditing</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Compile invoice lists & print audited logs</div>
                </td>
                <td className="p-4.5 text-center text-xs text-emerald-800 font-mono font-bold">Write Ledger</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-slate-400 font-mono text-xs">-</td>
                <td className="p-4.5 text-center text-xs font-mono font-bold bg-emerald-50/30 text-emerald-800 border-x border-emerald-100/30">Write Bill</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={`p-5 ${colorClasses.bgLight} border border-slate-200 rounded-xl text-left flex gap-3.5 text-xs sm:text-sm shadow-xs`}>
          <ShieldCheck className={`w-5.5 h-5.5 ${colorClasses.text} shrink-0 mt-0.5`} />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">Global Audit Trail Encryption Active</span>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-xs">
              Every consultative write, bed allocation switch, telemetry alert, or pharmacy dispensation triggers an immutable audit log storing practitioner ID and precise timestamps automatically.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CAPABILITIES BENTO SECTION */}
      <section className="bg-slate-50 py-24 px-6 sm:px-12 border-y border-slate-200/50">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-left space-y-2">
            <span className={`font-mono text-xs font-bold tracking-widest ${colorClasses.text} uppercase`}>Interactive Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hospital Logistics Safeguarded By Advanced Core Architecture
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              MediFlow leverages bulletproof technical designs to remove common hospital performance bottlenecks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 */}
            <div className="bg-white border border-slate-250 border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-350 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="p-3 bg-red-50 text-red-605 text-red-605 rounded-xl w-fit">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Ward Vital Telemetry</h3>
                  <p className="text-xs text-slate-550 text-slate-600 leading-relaxed">
                    Erase monitoring lag. Displays real-time feeds and flashes alerts for threshold pulse changes dynamically.
                  </p>
                </div>
              </div>
              <span className={`text-xs ${colorClasses.text} font-bold font-mono tracking-wider mt-5 inline-flex items-center gap-1 cursor-pointer`}>
                Explore Monitors <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white border border-slate-250 border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-350 transition-all shadow-xs">
              <div className="space-y-4">
                <div className={`p-3 ${colorClasses.bgLight} ${colorClasses.text} rounded-xl w-fit`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Gemini SBAR Handovers</h3>
                  <p className="text-xs text-slate-550 text-slate-600 leading-relaxed">
                    Prevent transition communication errors. Generate clinical briefs automatically using localized SBAR schemas.
                  </p>
                </div>
              </div>
              <span className={`text-xs ${colorClasses.text} font-bold font-mono tracking-wider mt-5 inline-flex items-center gap-1 cursor-pointer`}>
                Unlock AI Scribe <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white border border-slate-250 border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-slate-350 transition-all shadow-xs">
              <div className="space-y-4">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl w-fit">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Audited Invoices</h3>
                  <p className="text-xs text-slate-550 text-slate-600 leading-relaxed">
                    Say goodbye to manual audit labor. Produce complete client tables automatically paired to clinician checkouts.
                  </p>
                </div>
              </div>
              <span className={`text-xs ${colorClasses.text} font-bold font-mono tracking-wider mt-5 inline-flex items-center gap-1 cursor-pointer`}>
                View Billing Ledger <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>

          <div className="p-5.5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-xs">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                <ShieldCheck className={`w-5 h-5 ${colorClasses.text}`} />
                Rigid Encryption Standard Guaranteed
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                All data transfers compile automatically inside secure Firestore rules. No outside entity can access database lines.
              </p>
            </div>
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className={`px-5 py-2.5 ${colorClasses.bg} ${colorClasses.hoverBg} text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all self-start sm:self-auto shadow-sm active:scale-95`}
            >
              Start Free Sandbox
            </button>
          </div>
        </div>
      </section>

        <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto space-y-10" id="calculator">
        <div className="text-left space-y-2">
          <span className={`font-mono text-xs font-bold tracking-widest ${colorClasses.text} uppercase`}>Instant Estimation Tool</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Calculate Your Monthly HIMS Subscription
          </h2>
          <p className="text-slate-500 text-sm max-w-xl">
            Drag the sliding controls below to calculate your tailored deployment price instantly. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls (7 cols) */}
          <div className="md:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl space-y-6 text-left shadow-xs">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">1. Hospital Allocation Parameters</span>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Beds Capacity Volume</span>
                <span className={`font-mono ${colorClasses.text} font-extrabold text-xs sm:text-sm px-2.5 py-1 ${colorClasses.bgLight} rounded-lg border border-slate-200`}>
                  {bedCapacity} beds mapped
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="1000" 
                step="10"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                style={{ accentColor: primaryColor === "emerald" ? "#10b981" : primaryColor === "indigo" ? "#4f46e5" : primaryColor === "teal" ? "#0d9488" : primaryColor === "blue" ? "#2563eb" : primaryColor === "violet" ? "#7c3aed" : "#e11d48" }}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>10 beds</span>
                <span>500 beds</span>
                <span>1,000 beds</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="text-left space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">Deploy Google Gemini Deep AI Engine</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Activates automatic SOAP summaries, real-time SBAR handover drafts, and vitals anomaly sensors.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={useAIModules}
                  onChange={(e) => setUseAIModules(e.target.checked)}
                  className="w-5 h-5 cursor-pointer rounded mt-0.5 shrink-0"
                  style={{ accentColor: primaryColor === "emerald" ? "#10b981" : primaryColor === "indigo" ? "#4f46e5" : primaryColor === "teal" ? "#0d9488" : primaryColor === "blue" ? "#2563eb" : primaryColor === "violet" ? "#7c3aed" : "#e11d48" }}
                />
              </div>
            </div>

            <div className="text-slate-500 text-[11px] leading-relaxed font-mono flex items-start gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${colorClasses.text} shrink-0 mt-0.5`} />
              <span>Dev sandbox database assets are separated logically in isolated cloud nodes.</span>
            </div>
          </div>

          {/* Pricing breakdown (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left shadow-md">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className={`text-[9px] font-bold font-mono ${colorClasses.badgeText} block tracking-wider uppercase`}>14-DAY TRIAL BUNDLE INC.</span>
                <h4 className="text-sm font-bold text-white mt-1">Enterprise Subscription</h4>
              </div>

              <div className="space-y-2.5 text-[11px] text-slate-300 font-mono pt-1">
                <div className="flex justify-between">
                  <span>Base system engine</span>
                  <span className="text-white">${baseCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity multipliers</span>
                  <span className="text-white">${(bedCapacity * costPerBed)}</span>
                </div>
                {useAIModules && (
                  <div className={`flex justify-between ${colorClasses.badgeText}`}>
                    <span>Gemini Deep AI Bundle</span>
                    <span className="font-bold">${aiSuitePremium}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800 mt-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Subscription Price</span>
                <div className={`flex items-baseline gap-1 mt-0.5 ${colorClasses.badgeText} font-mono`}>
                  <span className="text-3xl sm:text-4xl font-extrabold">${totalCalculatedSaaSPrice}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
              </div>

              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className={`w-full ${colorClasses.bg} ${colorClasses.hoverBg} text-white text-xs sm:text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm`}
                id="saas_calculator_cta"
              >
                <span>Provision Trial Sandbox</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RIGID COMPLIANCE TRUST MATRIX */}
      <section className="bg-white py-24 px-6 sm:px-12 border-t border-slate-200/50" id="compliance">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-left space-y-2 max-w-xl">
            <span className={`font-mono text-xs font-bold tracking-widest ${colorClasses.text} uppercase`}>Technical Trust Pillars</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Symmetric Cybersecurity & HIPAA Compliance Standards
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We stand behind our code. Inspect the core procedural shields deployed across our medical workspaces:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            
            {/* Column 1 */}
            <div className="p-5.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClasses.bgLight} ${colorClasses.text} rounded-lg`}>
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">1. Flight & Rest Cryptography</h4>
              </div>
              <p className="text-xs sm:text-xs text-slate-600 leading-relaxed">
                All HIPAA sensitive logs, diagnosis values, and pharmacy levels are protected using AES-256 symmetric rules. Transport streams transit recursively within secure TLS 1.3 tunnels.
              </p>
            </div>

            {/* Column 2 */}
            <div className="p-5.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClasses.bgLight} ${colorClasses.text} rounded-lg`}>
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">2. Zero-Leak Patient Isolation</h4>
              </div>
              <p className="text-xs sm:text-xs text-slate-600 leading-relaxed">
                Active clinical database queries utilize row-level security protocols mapped to independent user identities. No cross-tenant metadata leakage is possible.
              </p>
            </div>

            {/* Column 3 */}
            <div className="p-5.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClasses.bgLight} ${colorClasses.text} rounded-lg`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">3. Immutable Audit Trails</h4>
              </div>
              <p className="text-xs sm:text-xs text-slate-600 leading-relaxed">
                Every practitioner checkout entry, medication allotment action, SOAP revision, and SBAR report logs actor identities, network indicators, and timestamp metrics.
              </p>
            </div>

            {/* Column 4 */}
            <div className="p-5.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClasses.bgLight} ${colorClasses.text} rounded-lg`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">4. OWASP Sanitization Guards</h4>
              </div>
              <p className="text-xs sm:text-xs text-slate-600 leading-relaxed">
                All parameters processing through our hospital platform run through strict schemas, completely shutting down classic issues such as SQL injection, data tampering, or cross-site scripting.
              </p>
            </div>

          </div>

          <div className="border-t border-slate-200/80 pt-8 text-center text-xs text-slate-400 font-mono tracking-wider uppercase">
            🛡️ BAA Agreements Ready to sign • Certified HIPAA SECURE CONTAINER STANDARDS
          </div>

        </div>
      </section>

      {/* 8. FOOTER PART */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 sm:px-12 border-t border-slate-900 text-xs sm:text-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-sans">
              <Activity className={`w-5 h-5 ${colorClasses.badgeText}`} />
              <span className="font-extrabold text-sm tracking-tight">MediFlow Clinical Technologies Inc.</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              HIPAA-Compliant Hospital Information Management Systems (HIMS) for modern care.
            </p>
          </div>

          <div className="flex gap-4 text-xs font-medium text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">Security Policy</span>
            <span className="text-slate-800">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">HIPAA Disclaimers</span>
            <span className="text-slate-800">•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sign BAA Contract</span>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center text-[11px] text-slate-550 text-slate-500 pt-8 mt-8 border-t border-slate-900 font-mono leading-relaxed space-y-1.5">
          <div>© 2026 MediFlow Technologies. Optimized for highly responsive sandboxed care.</div>
          <div className="text-slate-400">
            Developed by{" "}
            <a 
              href="https://www.linkedin.com/in/pratyushmalviy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`hover:${colorClasses.text} text-slate-300 font-semibold transition-colors underline decoration-dotted underline-offset-2`}
            >
              Pratyush Malviya
            </a>
          </div>
        </div>
      </footer>

      {/* 🟢 DYNAMIC ROLE SELECTION MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden relative" id="role_selection_modal">
            {/* Top Close Button */}
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4 cursor-pointer" />
            </button>

            {/* Modal Header */}
            <div className="p-8 pb-5 border-b border-rose-100/50 text-center space-y-2 bg-gradient-to-b from-slate-50 to-white">
              <div className="inline-flex py-1 px-3 bg-emerald-50 text-emerald-700 text-[10px] font-sans font-bold uppercase rounded-full">
                CHOOSE ACCESS TYPE
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                How would you like to enter MediFlow?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Choose the dashboard role you want to test out. You can enter as a Hospital Doctor/Staff, or as the System Owner managing subscriptions.
              </p>
            </div>

            {/* Role Cards Double Grid */}
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white">
              {/* Card 1: Hospital Admin */}
              <div className="group border border-slate-200/80 hover:border-emerald-500/30 rounded-2xl p-6 bg-slate-50/50 hover:bg-emerald-50/10 transition-all hover:shadow-lg flex flex-col justify-between text-left space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-750 transition-colors">Hospital Staff Dashboard</h4>
                    <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">For Doctors, Nurses & Staff</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    View patients, consult on outpatient (OPD) queues, allocate ward beds, manage medicine stock, paths laboratory trials, and customer checkout billing.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    onLaunchApp("Hospital Admin");
                  }}
                  className={`w-full py-3 px-4 ${colorClasses.bg} ${colorClasses.hoverBg} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm mt-2`}
                >
                  <span>Open Hospital Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Card 2: Super Admin */}
              <div className="group border border-slate-200/80 hover:border-indigo-500/30 rounded-2xl p-6 bg-slate-50/50 hover:bg-indigo-50/10 transition-all hover:shadow-lg flex flex-col justify-between text-left space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-750 transition-colors">System Owner Panel</h4>
                    <span className="text-[10px] font-semibold text-indigo-650 text-indigo-600 block mt-0.5">For SaaS Platform Admins</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Manage subscribed tenant hospitals, modify website themes/palettes, alter pricing templates, review diagnostic reports, and audit all medical modules.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    onLaunchApp("Super Admin");
                  }}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm mt-2"
                >
                  <span>Open System Owner Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* Real isolated database signin & signup portals */}
            <div className="p-6 bg-slate-900 text-slate-200 border-t border-slate-800 text-center space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-400 block uppercase">SECURE CLOUD DEPLOYMENTS</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Want to test true isolated clinical accounts with a 14-day free trial?</span>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setIsRoleModalOpen(false);
                      if (onOpenAuth) onOpenAuth(true); // Sign up mode
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    Register 14-Day Trial
                  </button>
                  <button
                    onClick={() => {
                      setIsRoleModalOpen(false);
                      if (onOpenAuth) onOpenAuth(false); // Sign in mode
                    }}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    Staff Login
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Banner */}
            <div className="p-4 bg-slate-50 border-t border-slate-100/80 text-center text-[10px] text-slate-400 font-sans flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>🔒 Sandbox Sandbox Environment • No payment details or setup required to test the features</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
