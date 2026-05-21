import React, { useState } from "react";
import { 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  LogOut,
  Loader2
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface PaymentPageProps {
  currentUserEmail: string;
  adminUid: string;
  adminName: string;
  createdAt: string;
  onPaymentSuccess: (plan: string) => void;
  onSignOut: () => void;
}

export function PaymentPage({ 
  currentUserEmail, 
  adminUid, 
  adminName, 
  createdAt, 
  onPaymentSuccess, 
  onSignOut 
}: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("Core");
  const [cardNumber, setCardNumber] = useState<string>("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState<string>("12/29");
  const [cardCVC, setCardCVC] = useState<string>("899");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // pricing tier options
  const tiers = [
    {
      id: "Outpatient",
      name: "Outpatient Clinic Tier",
      price: 249,
      features: [
        "Up to 50 active outpatient records",
        "Real-time OPD consultations",
        "Standard Pharmacy stock track",
        "Basic medical coding ledgers"
      ]
    },
    {
      id: "Core",
      name: "Multi-Ward EHR Core",
      price: 699,
      recommended: true,
      features: [
        "Unlimited outpatient records",
        "Complete Bed Assignment modules (IPD)",
        "Live Biometric Telemetry Graph",
        "Itemized Pathology & laboratory checks",
        "Gemini AI SBAR Shift Reports"
      ]
    },
    {
      id: "Enterprise",
      name: "Enterprise Healthcare Tier",
      price: 1299,
      features: [
        "Multi-hospital tenant isolation",
        "99.99% active uptime SLAs",
        "HL7 / FHIR EMR direct pipelines",
        "Dedicated clinical support manager",
        "Custom RBAC permission hierarchies"
      ]
    }
  ];

  const activePlanDetails = tiers.find(t => t.id === selectedPlan) || tiers[1];

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Write email to expired_trials first so system permanently logs the completed trial email
      const emailId = currentUserEmail.trim().toLowerCase();
      try {
        await setDoc(doc(db, "expired_trials", emailId), {
          email: currentUserEmail,
          expiredAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Trial logger exception (handled): ", err);
      }

      // 2. Update Admin document inside admins/{adminUid} to set isPaid: true
      const adminDocPath = `admins/${adminUid}`;
      await setDoc(doc(db, "admins", adminUid), {
        uid: adminUid,
        email: currentUserEmail,
        name: adminName,
        role: "Admin",
        createdAt: createdAt || new Date().toISOString(),
        isPaid: true,
        paymentPlan: activePlanDetails.name
      });

      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(activePlanDetails.name);
      }, 1500);

    } catch (err) {
      console.error("Payment registration fault:", err);
      alert("Network exception writing payment status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Dynamic Upper security notification header */}
      <header className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">MediFlow AI</h1>
            <span className="font-mono text-[9px] tracking-widest font-extrabold text-emerald-400 uppercase block mt-0.5">Payment Gateway Gatekeeper</span>
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Banner Column */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-8 text-left">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Trial Concluded (14 Days Expired)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Restore Secure Operations of <span className="text-emerald-400 font-sans">MediFlow AI</span> Workspace
            </h2>

            <p className="text-slate-450 text-sm leading-relaxed">
              Your 14-day free trial has expired for <strong>{currentUserEmail}</strong>. To re-authorize clinician access paths and secure active bed telemetry matrices, choose a plan and checkout below. Absolutely no clinical records or telemetry logs were deleted; system access has simply been temporarily suspended.
            </p>
          </div>

          {/* 3 Tier visual switcher */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Step 1: Choose Your Core Subscription Plan</h3>
            
            <div className="grid grid-cols-1 gap-3.5">
              {tiers.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedPlan(t.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all ${
                    selectedPlan === t.id 
                      ? "bg-slate-950/80 border-emerald-500 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                      : "bg-slate-955/45 border-slate-800 hover:border-slate-700/80 hover:bg-slate-955/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === t.id ? "border-emerald-500" : "border-slate-600"
                    }`}>
                      {selectedPlan === t.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{t.name}</span>
                        {t.recommended && (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold uppercase rounded p-0.5 px-1.5">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-450 mt-1 max-w-sm">
                        {t.features.slice(0, 2).map((feat, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="text-emerald-500">✓</span> {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap font-mono text-emerald-400">
                    <span className="text-lg font-bold">${t.price}</span>
                    <span className="text-[10px] text-slate-400">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Form Column */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <form onSubmit={handleProcessCheckout} className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[9px] font-bold font-mono text-emerald-400 block tracking-widest uppercase">SECURE CHECKOUT TERMINAL</span>
                <h4 className="text-sm font-bold text-slate-150 mt-1">SaaS Deployment Activation</h4>
              </div>

              {/* Active Plan Readout summary */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Selected Plan:</span>
                  <span className="text-white font-bold">{activePlanDetails.name}</span>
                </div>
                <div className="flex justify-between font-mono text-lg font-bold">
                  <span className="text-slate-400">Monthly Sub:</span>
                  <span className="text-emerald-400">${activePlanDetails.price}</span>
                </div>
                <div className="pt-2 text-[9px] font-mono text-slate-500 border-t border-slate-800 leading-relaxed uppercase">
                  ⚡ Recurrence automatically charges every 30 days. No upfront commitments today.
                </div>
              </div>

              {/* simulated payment inputs */}
              <div className="space-y-3 pt-2 text-xs">
                
                <div className="space-y-1.5 text-left">
                  <label className="block font-mono text-[9px] text-slate-450 uppercase tracking-widest">Subscriber Identity</label>
                  <input
                    type="text"
                    value={adminName || "Chief Administrator"}
                    disabled
                    className="w-full bg-slate-900/50 border border-slate-800 text-slate-400 p-2.5 rounded-lg text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block font-mono text-[9px] text-slate-450 uppercase tracking-widest">Card Security Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 pl-9 rounded-lg text-xs outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 text-left">
                    <label className="block font-mono text-[9px] text-slate-450 uppercase tracking-widest">Expiration</label>
                    <input
                      type="text"
                      placeholder="12/29"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-lg text-xs outline-none focus:border-emerald-500 transition-colors text-center"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block font-mono text-[9px] text-slate-450 uppercase tracking-widest">CVC / CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-lg text-xs outline-none focus:border-emerald-500 transition-colors text-center"
                      required
                    />
                  </div>
                </div>

              </div>

            </div>

            <div className="space-y-4 pt-6">
              <div className="p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-start gap-1.5 text-[10px] font-mono text-emerald-400 leading-relaxed">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Simulated secure sandbox gateway is operational. Enter dummy card values to trigger conversion safely.</span>
              </div>

              {success ? (
                <div className="bg-emerald-500 text-slate-950 font-bold p-3 rounded-xl flex items-center justify-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Premium Conversion Success! Redirecting...</span>
                </div>
              ) : (
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Sandbox Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>Convert and Activate {activePlanDetails.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

        </div>

      </main>

      <footer className="py-6 bg-slate-950 text-slate-500 border-t border-slate-800/80 text-center text-[9px] font-mono">
        MediFlow Security Services • ISO-27001 Gateway Protected • Mock Billing Sandbox
      </footer>

    </div>
  );
}
