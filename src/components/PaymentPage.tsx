import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  LogOut,
  Loader2,
  Calendar,
  Layers,
  Percent,
  Check,
  AlertTriangle,
  Receipt,
  Download,
  Info
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface PaymentPageProps {
  currentUserEmail: string;
  adminUid: string;
  adminName: string;
  createdAt: string;
  onPaymentSuccess: (plan: string) => void;
  onSignOut: () => void;
  isEmployee?: boolean;
}

export function PaymentPage({ 
  currentUserEmail, 
  adminUid, 
  adminName, 
  createdAt, 
  onPaymentSuccess, 
  onSignOut,
  isEmployee = false
}: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("Core");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("annual");
  
  // Custom interactive parameters
  const [bedsCount, setBedsCount] = useState<number>(150);
  const [cliniciansCount, setCliniciansCount] = useState<number>(35);
  const [deployGeminiAI, setDeployGeminiAI] = useState<boolean>(true);
  const [deployHL7FHIR, setDeployHL7FHIR] = useState<boolean>(false);
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState<string>("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState<string>("12/29");
  const [cardCVC, setCardCVC] = useState<string>("899");
  const [cardholderName, setCardholderName] = useState<string>(adminName || "Chief Administrator");
  
  // States of process
  const [checkoutStep, setCheckoutStep] = useState<number>(-1); // -1 = standby, 0-4 = processing milestones, 5 = receipt state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // pricing tier configurations
  const tiers = [
    {
      id: "Outpatient",
      name: "Outpatient Clinic Tier",
      monthlyPrice: 249,
      bedLimit: 50,
      staffLimit: 15,
      features: [
        "Up to 50 active outpatient records",
        "Real-time OPD consultations desk",
        "Standard Pharmacy stock track",
        "Basic medical coding ledgers",
        "Encrypted HIPAA vault records"
      ]
    },
    {
      id: "Core",
      name: "Multi-Ward EHR Core",
      monthlyPrice: 699,
      bedLimit: 300,
      staffLimit: 60,
      recommended: true,
      features: [
        "Unlimited outpatient records",
        "Complete Bed Assignment modules (IPD)",
        "Live Biometric Telemetry Graph",
        "Itemized Pathology & laboratory checks",
        "Gemini AI SBAR Shift Reports",
        "99.9% operational uptime SLA"
      ]
    },
    {
      id: "Enterprise",
      name: "Enterprise Healthcare Tier",
      monthlyPrice: 1299,
      bedLimit: 1000,
      staffLimit: 250,
      features: [
        "Multi-hospital tenant isolation",
        "99.99% active uptime SLAs",
        "HL7 / FHIR EMR direct pipelines",
        "Dedicated clinical support manager",
        "Custom RBAC permission hierarchies",
        "Full database recovery replication"
      ]
    }
  ];

  const activePlanDetails = tiers.find(t => t.id === selectedPlan) || tiers[1];

  // Price calculations based on parameters
  const getCalculatedPriceBreakdown = () => {
    const basePrice = activePlanDetails.monthlyPrice;
    
    // extra beds cost
    const allowedBeds = activePlanDetails.bedLimit;
    const extraBeds = Math.max(0, bedsCount - allowedBeds);
    const extraBedsCost = extraBeds * 1.5; // $1.5 per bed
    
    // extra clinicians cost
    const allowedClinicians = activePlanDetails.staffLimit;
    const extraClinicians = Math.max(0, cliniciansCount - allowedClinicians);
    const extraCliniciansCost = extraClinicians * 5.0; // $5 per clinician
    
    // deep AI integrations
    const aiCost = deployGeminiAI ? 150 : 0;
    const fhirCost = deployHL7FHIR ? 99 : 0;
    
    const monthlyTotalBeforeDiscount = basePrice + extraBedsCost + extraCliniciansCost + aiCost + fhirCost;
    
    let subtotal = monthlyTotalBeforeDiscount;
    let discount = 0;
    
    if (billingInterval === "annual") {
      discount = monthlyTotalBeforeDiscount * 0.20; // 20% discount
      subtotal = monthlyTotalBeforeDiscount - discount;
    }
    
    const totalAmount = subtotal;
    
    return {
      basePrice,
      extraBeds,
      extraBedsCost,
      extraClinicians,
      extraCliniciansCost,
      aiCost,
      fhirCost,
      subtotalBeforeDiscount: monthlyTotalBeforeDiscount,
      discount,
      totalAmount,
      intervalLabel: billingInterval === "annual" ? "annual billing (yrly)" : "monthly billing"
    };
  };

  const cost = getCalculatedPriceBreakdown();

  const handleAutofillCard = (type: "success" | "decline") => {
    if (type === "success") {
      setCardNumber("4242 4242 4242 4242");
      setCardExpiry("12/29");
      setCardCVC("899");
      setErrorMessage(null);
    } else {
      setCardNumber("4002 0140 0000 9999");
      setCardExpiry("04/27");
      setCardCVC("202");
      setErrorMessage(null);
    }
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);
    setCheckoutStep(0);
    setProcessingLogs([]);

    const logMilestones = [
      "🔄 Phase 1/4: Authenticating clinical subscriber identity with Stripe sandbox...",
      "💳 Phase 2/4: Transmitting encrypted security token hash keys cleanly...",
      "🔒 Phase 3/4: Syncing hospital workspace lease boundaries inside HIPAA database router...",
      "🔑 Phase 4/4: Registering active tenant production tokens inside admins collection..."
    ];

    // Trigger sequential loading milestones for a gorgeous realistic SaaS experience
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    try {
      // Step 1
      setProcessingLogs(prev => [...prev, logMilestones[0]]);
      await delay(700);
      
      // Card decline simulation trigger
      if (cardNumber.replaceAll(" ", "") === "4002014000009999") {
        throw new Error("DECLINED: Insufficient Hospital Credit Allowance. Insufficient funds in current bank budget allocation ledger (Error Code: Stripe_Declined_4022).");
      }
      
      setCheckoutStep(1);
      // Step 2
      setProcessingLogs(prev => [...prev, logMilestones[1]]);
      await delay(800);
      setCheckoutStep(2);

      // Step 3
      setProcessingLogs(prev => [...prev, logMilestones[2]]);
      await delay(700);
      setCheckoutStep(3);

      // Save email permanently to expired_trials so they cannot abuse the 14-day free trial on signup
      const emailId = currentUserEmail.trim().toLowerCase();
      try {
        await setDoc(doc(db, "expired_trials", emailId), {
          email: currentUserEmail,
          expiredAt: new Date().toISOString(),
          purchasedPlan: activePlanDetails.name,
          paymentInterval: billingInterval,
          amountSpent: cost.totalAmount.toFixed(2),
          billingBedsAllocated: bedsCount
        });
      } catch (err) {
        console.warn("Trial logger database update warning:", err);
      }

      // 4. Update Admin document inside admins/{adminUid} to set isPaid: true
      await setDoc(doc(db, "admins", adminUid), {
        uid: adminUid,
        email: currentUserEmail,
        name: adminName,
        role: "Hospital Admin",
        createdAt: createdAt || new Date().toISOString(),
        isPaid: true,
        paymentPlan: `${activePlanDetails.name} (${billingInterval === "annual" ? "Annual" : "Monthly"})`,
        bedsCountAllocated: bedsCount,
        cliniciansCountAllocated: cliniciansCount,
        deployGeminiAI,
        deployHL7FHIR
      });

      // Step 4
      setProcessingLogs(prev => [...prev, logMilestones[3]]);
      await delay(600);
      setCheckoutStep(4);
      
      setSuccess(true);
      await delay(600);
      setCheckoutStep(5); // Show customized receipts block!

    } catch (err: any) {
      console.error("Payment registration fault:", err);
      setErrorMessage(err.message || "Simulated payment transaction refused by card provider. Please try the visa standard test card.");
      setIsProcessing(false);
      setCheckoutStep(-1);
    }
  };

  const handleApplyCompletedActivation = () => {
    onPaymentSuccess(`${activePlanDetails.name} (${billingInterval === "annual" ? "Annual" : "Monthly"})`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans print:bg-white print:text-black">
      
      {/* 🔴 Upper gateway header */}
      <header className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">MediFlow AI</h1>
            <span className="font-mono text-[9px] tracking-widest font-extrabold text-emerald-400 uppercase block mt-0.5">SaaS Payment Service Gateway</span>
          </div>
        </div>

        <button 
          onClick={onSignOut}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Account / Log Out</span>
        </button>
      </header>

      {/* 🟢 STEP 5: BEAUTIFUL COMPLETED RECEIPT SCREEN */}
      {checkoutStep === 5 ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center">
          <div className="w-full max-w-xl bg-slate-950/80 border border-emerald-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:text-black print:shadow-none print:p-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none print:hidden"></div>
            
            <div className="flex flex-col items-center text-center space-y-3 print:space-y-1">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 print:hidden text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">Gateway status: settled</span>
              <h2 className="text-2xl font-black text-white tracking-tight print:text-black">Production Tenancy Activated</h2>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed print:text-slate-600">
                Hospital Workspace updated securely. Standard 14-Day Free Trial converted to an active enterprise subscription successfully.
              </p>
            </div>

            {/* Simulated PDF Receipt */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-mono print:bg-white print:border print:border-slate-300 print:text-black">
              <div className="flex justify-between border-b border-rose-900/10 border-slate-800/80 pb-2.5">
                <div className="text-left">
                  <span className="text-slate-450 text-[10px] uppercase block font-semibold">ISSUE TO:</span>
                  <strong className="text-white text-xs block print:text-black">{adminName}</strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">{currentUserEmail}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-450 text-[10px] uppercase block font-semibold">RECEIPT INVOICE:</span>
                  <strong className="text-emerald-400 text-xs block">INV-2026-SAAS-{Math.floor(1000 + Math.random() * 9000)}</strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-850 border-slate-800/40 pb-1.5 font-bold">
                  <span>ITEMIZED DESCRIPTION</span>
                  <span>TOTALS</span>
                </div>
                
                <div className="flex justify-between text-slate-300 print:text-slate-700">
                  <span>{activePlanDetails.name} Subscription ({billingInterval === "annual" ? "Annual" : "Monthly"})</span>
                  <span>${cost.basePrice.toFixed(2)}/mo</span>
                </div>

                {cost.extraBeds > 0 && (
                  <div className="flex justify-between text-slate-350 print:text-slate-700">
                    <span>+ Extra Bed Capacity Allocation ({cost.extraBeds} beds)</span>
                    <span>${cost.extraBedsCost.toFixed(2)}/mo</span>
                  </div>
                )}

                {cost.extraClinicians > 0 && (
                  <div className="flex justify-between text-slate-350 print:text-slate-700">
                    <span>+ Extra Clinician Seat Capacity ({cost.extraClinicians} seats)</span>
                    <span>${cost.extraCliniciansCost.toFixed(2)}/mo</span>
                  </div>
                )}

                {deployGeminiAI && (
                  <div className="flex justify-between text-emerald-400">
                    <span>+ Google Gemini SBAR Diagnostics Suite</span>
                    <span>$150.00/mo</span>
                  </div>
                )}

                {deployHL7FHIR && (
                  <div className="flex justify-between text-slate-350 print:text-slate-700">
                    <span>+ HL7 and FHIR API Direct Gateway Pipelines</span>
                    <span>$99.00/mo</span>
                  </div>
                )}

                {billingInterval === "annual" && (
                  <div className="flex justify-between text-emerald-450 text-emerald-500 font-bold border-t border-slate-800 border-slate-800/40 pt-1.5">
                    <span>- Annual Signup Incentive (20% Savings applied)</span>
                    <span>-${cost.discount.toFixed(2)}/mo</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-sm text-white pt-2.5 border-t border-slate-800 print:text-black">
                  <span>TOTAL MONTHLY SUB CHARGED:</span>
                  <span className="text-emerald-400 font-mono text-base">${cost.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-slate-950 p-2.5 rounded text-[10px] text-slate-500 text-center leading-relaxed font-mono mt-2 print:border">
                ISO-27001 Gateway Secured • HIPAA Business BAA Executed Instantly • Billing recurrences run automatically every 30 days unless canceled in Settings.
              </div>
            </div>

            <div className="flex gap-3 print:hidden">
              <button 
                onClick={handlePrintReceipt}
                className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white hover:border-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Print / Download Quote PDF</span>
              </button>

              <button 
                onClick={handleApplyCompletedActivation}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-500/10"
              >
                <span>Launch Active Workstation</span>
                <ArrowRight className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch print:hidden">
          
          {/* LEFT COLUMN: INTERACTIVE CALCULATOR AND CHOICES (7 cols) */}
          <section className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-mono font-bold uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>14-Day Free Trial Concluded</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Unlock Secure Operations of <span className="text-emerald-400">MediFlow AI</span> Workspace
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Your 14-day free trial has expired for <strong>{currentUserEmail}</strong>. To re-authorize clinician access paths, manage live occupancy grids, and access electronic pharmacy stocks, select a tier below and checkout to deploy your production license. No clinical records were deleted; workspace features are simply temporarily restricted.
              </p>
            </div>

            {/* Toggle Billing interval */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-450 text-emerald-400 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Flexible Subscription Billing</span>
                  <span className="text-[10px] text-slate-450 block text-slate-400">Switch interval for major rewards</span>
                </div>
              </div>

              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                <button 
                  type="button"
                  onClick={() => { setBillingInterval("monthly"); setErrorMessage(null); }}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    billingInterval === "monthly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Monthly billing
                </button>
                <button 
                  type="button"
                  onClick={() => { setBillingInterval("annual"); setErrorMessage(null); }}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingInterval === "annual" ? "bg-emerald-500 text-slate-950" : "text-emerald-400 hover:text-white"
                  }`}
                >
                  <span>Annual Billing (yrly)</span>
                  <span className="bg-emerald-900/35 text-[8px] font-mono font-black border border-emerald-400/20 text-emerald-400 px-1 py-0.5 rounded uppercase leading-none">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Tier Subscription switcher */}
            <div className="space-y-3 pt-2">
              <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Step 1: Choose Your Core Subscription Plan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {tiers.map((t) => {
                  const isActive = selectedPlan === t.id;
                  const discountedMonthly = billingInterval === "annual" ? t.monthlyPrice * 0.8 : t.monthlyPrice;
                  
                  return (
                    <div 
                      key={t.id}
                      onClick={() => { setSelectedPlan(t.id); setErrorMessage(null); }}
                      className={`p-4 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all relative ${
                        isActive 
                          ? "bg-slate-950/90 border-emerald-500 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                          : "bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-950/60"
                      }`}
                    >
                      {t.recommended && (
                        <span className="absolute -top-2 right-4 bg-emerald-535 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[8px] font-mono font-bold uppercase rounded-full shadow-md">
                          RECOMMENDED
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isActive ? "border-emerald-500" : "border-slate-600"
                          }`}>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          </div>
                          <span className="text-xs font-bold text-slate-100">{t.name}</span>
                        </div>

                        <div className="font-mono text-emerald-400 pt-1">
                          <span className="text-xl font-bold">${discountedMonthly.toFixed(0)}</span>
                          <span className="text-[10px] text-slate-400">/mo</span>
                          {billingInterval === "annual" && (
                            <span className="text-[9px] text-slate-500 block line-through leading-none opacity-60">
                              was ${t.monthlyPrice}/mo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900 mt-4 text-[10px] text-slate-400 space-y-1">
                        <span className="block font-semibold text-slate-350">Specs included:</span>
                        <span>• Up to {t.bedLimit} Beds</span>
                        <span>• Up to {t.staffLimit} Clinician Seals</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Interactive Parameter Slide Customizer */}
            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Step 2: Customize Hospital Configuration (Saves Money!)</h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded leading-none uppercase">Live Estimate</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-xs">
                
                {/* Bed Capacity slide */}
                <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold uppercase font-mono tracking-wider text-[9px]">A: WARD BED SLOTS</span>
                    <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                      {bedsCount} Beds Occupancy
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    step="5"
                    value={bedsCount}
                    onChange={(e) => setBedsCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase">
                    <span>min: 10 beds</span>
                    <span>Standard: {activePlanDetails.bedLimit} slots included</span>
                    <span>max: 1000</span>
                  </div>
                </div>

                {/* Clinicians seat slide */}
                <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold uppercase font-mono tracking-wider text-[9px]">B: CLINICIAN SEAT LICENSES</span>
                    <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                      {cliniciansCount} Doctor/Nurse Seals
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="300" 
                    step="5"
                    value={cliniciansCount}
                    onChange={(e) => setCliniciansCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase">
                    <span>min: 5 seats</span>
                    <span>Standard: {activePlanDetails.staffLimit} included</span>
                    <span>max: 300</span>
                  </div>
                </div>

              </div>

              {/* Advanced checkouts add-on options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                
                <div 
                  onClick={() => setDeployGeminiAI(!deployGeminiAI)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    deployGeminiAI 
                      ? "bg-slate-900/80 border-emerald-500/50" 
                      : "bg-slate-900/30 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={deployGeminiAI}
                    onChange={() => {}}
                    className="rounded text-emerald-500 mt-1 shrink-0 accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Deploy Google Gemini Deep AI Suite</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">SBAR shift summarizer, live vital diagnostics (+ $150.00/mo)</p>
                  </div>
                </div>

                <div 
                  onClick={() => setDeployHL7FHIR(!deployHL7FHIR)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    deployHL7FHIR 
                      ? "bg-slate-900/80 border-emerald-500/50" 
                      : "bg-slate-900/30 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={deployHL7FHIR}
                    onChange={() => {}}
                    className="rounded text-emerald-500 mt-1 shrink-0 accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">HL7 / FHIR EMR direct pipeline integration</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Secure external laboratory integrations (+ $99.00/mo)</p>
                  </div>
                </div>

              </div>

            </div>

          </section>

          {/* RIGHT COLUMN: SECURE PAYMENT GATEWAY CARD PORTLET (5 cols) */}
          <section className="lg:col-span-5 bg-slate-950/80 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <form onSubmit={handleProcessCheckout} className="space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold font-mono text-emerald-400 block tracking-widest uppercase">SECURE PAYMENT TERMINAL</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">Authorize Subscription Deployment</h4>
                  </div>
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>

                {/* Live Checkout summary card */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Plan selection:</span>
                    <span className="text-white font-bold">{activePlanDetails.name}</span>
                  </div>

                  <div className="space-y-1.5 text-slate-400 font-mono text-[11px] border-y border-slate-800/80 py-2.5">
                    <div className="flex justify-between">
                      <span>Base Subscription Fee:</span>
                      <span className="text-white">${cost.basePrice.toFixed(2)}/mo</span>
                    </div>

                    {cost.extraBeds > 0 && (
                      <div className="flex justify-between">
                        <span>Beds capacity delta multipliers:</span>
                        <span className="text-white">${cost.extraBedsCost.toFixed(2)}/mo</span>
                      </div>
                    )}

                    {cost.extraClinicians > 0 && (
                      <div className="flex justify-between">
                        <span>Staff allowance multiplier:</span>
                        <span className="text-white">${cost.extraCliniciansCost.toFixed(2)}/mo</span>
                      </div>
                    )}

                    {deployGeminiAI && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Gemini SBAR diagnostics suite:</span>
                        <span className="font-bold">$150.00/mo</span>
                      </div>
                    )}

                    {deployHL7FHIR && (
                      <div className="flex justify-between">
                        <span>HL7 / FHIR Gateway:</span>
                        <span className="text-white">$99.00/mo</span>
                      </div>
                    )}

                    {billingInterval === "annual" && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Annual incentive (-20%):</span>
                        <span>-${cost.discount.toFixed(2)}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between font-mono text-lg font-bold items-center">
                    <span className="text-slate-300">Charged Amount:</span>
                    <div className="text-right">
                      <span className="text-emerald-400 block">${cost.totalAmount.toFixed(2)}<strong className="text-xs text-slate-450 text-slate-400">/mo</strong></span>
                      <span className="text-[8px] text-slate-500 block uppercase tracking-wide leading-none font-semibold">
                        {billingInterval === "annual" ? "Billed annually ($" + (cost.totalAmount * 12).toFixed(0) + "/yr)" : "Billed monthly"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VISA Sandbox clickable autofill templates */}
                <div className="p-3 bg-slate-900/60 border border-slate-800/85 rounded-xl space-y-2">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Sandbox Simulator Controls (No Real Expense)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => handleAutofillCard("success")}
                      className="bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-900/60 p-2 rounded-lg text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-emerald-400 block">✓ Autofill Test Card</span>
                      <span className="text-[8px] text-slate-400 group-hover:text-slate-350 block mt-0.5">Visa Simulates Success</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAutofillCard("decline")}
                      className="bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 p-2 rounded-lg text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-rose-400 block">✗ Autofill Decline Card</span>
                      <span className="text-[8px] text-slate-400 group-hover:text-slate-350 block mt-0.5">Visa Simulates Refusal</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Payment Inputs elements */}
                <div className="space-y-3 pt-1 text-xs">
                  
                  <div className="space-y-1 text-left">
                    <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Subscriber Identity Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Hospital chief administrator"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Secure Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 pl-9 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-slate-550 absolute left-3 top-3 text-slate-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1 text-left">
                      <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Expiration</label>
                      <input
                        type="text"
                        placeholder="12/29"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors text-center"
                        required
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">CVC / Security CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 transition-colors text-center"
                        required
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Progress milestones and error handling */}
              <div className="space-y-3.5 pt-4">
                
                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-rose-450 text-red-400 rounded-xl flex items-start gap-2.5 text-xs leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Milestone progress visual log */}
                {isProcessing && processingLogs.length > 0 && (
                  <div className="p-3 bg-slate-900 border border-slate-800 text-slate-350 rounded-xl space-y-1.5 font-mono text-[9px] leading-relaxed uppercase">
                    {processingLogs.map((logMsg, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        {checkoutStep > i ? (
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        ) : checkoutStep === i ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <span className="text-slate-600 shrink-0">•</span>
                        )}
                        <span className={checkoutStep === i ? "text-white font-bold animate-pulse" : checkoutStep > i ? "text-slate-400" : "text-slate-500"}>
                          {logMsg}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isEmployee ? (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-250 flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-amber-450 text-amber-400">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>HOSPITAL WORKSPACE SUSPENDED</span>
                    </div>
                    <span className="leading-relaxed">
                      The 14-day free trial limit for this Hospital/Organization has concluded. Please contact your Hospital Administrator (<strong>{adminName || "Chief Administrator"}</strong>) to complete subscription checkout to restore active bed monitoring and secure SOAP clinical record access.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex items-start gap-2 text-[10px] font-mono text-emerald-400 leading-relaxed">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-450" />
                      <span>Secure checkout sandbox gateway is active. Choose visa autofill models above or input details. no actual financial costs are levied.</span>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/10 active:scale-95 text-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Deploying Active HIMS Tenancy Lease...</span>
                        </>
                      ) : (
                        <>
                          <span>Convert Trial and Deploy Active Lease</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>

          </section>

        </main>
      )}

      <footer className="py-6 bg-slate-950 text-slate-500 border-t border-slate-800/80 text-center text-[9px] font-mono print:hidden">
        MediFlow Security Services • ISO-27001 Gateway Protected • Mock Billing Sandbox
      </footer>

    </div>
  );
}
