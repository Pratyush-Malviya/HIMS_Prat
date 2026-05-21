import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc
} from "firebase/firestore";
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from "../firebase";
import { 
  Activity, 
  Sparkles, 
  User, 
  Key, 
  ShieldAlert, 
  ArrowRight,
  ClipboardList,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { motion } from "motion/react";

interface LoginPortalProps {
  initialSignUpMode?: boolean;
  onLoginSuccess: (userData: {
    uid: string;
    email: string;
    role: "Admin" | string;
    name: string;
    department: string;
    permittedModules: string[];
    isAdmin: boolean;
    createdAt: string;
    isPaid: boolean;
    paymentPlan: string;
  }) => void;
  onBackToLanding?: () => void;
}

export function LoginPortal({ initialSignUpMode = false, onLoginSuccess, onBackToLanding }: LoginPortalProps) {
  const [roleMode, setRoleMode] = useState<"admin" | "employee">("employee");
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with prop triggers
  useEffect(() => {
    if (initialSignUpMode) {
      setRoleMode("admin");
      setIsSignUpMode(true);
    } else {
      setRoleMode("employee");
      setIsSignUpMode(false);
    }
  }, [initialSignUpMode]);

  const defaultAdminEmail = "malviya.pratyush26@gmail.com";

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      if (roleMode === "admin") {
        if (isSignUpMode) {
          // 1. --- Expired Trial Lookup prior to creation ---
          // Prevent free trial abuse if email has completed active trials once already.
          const trialDocPath = `expired_trials/${targetEmail}`;
          let trialExDoc;
          try {
            trialExDoc = await getDoc(doc(db, "expired_trials", targetEmail));
          } catch (err) {
            console.warn("Pre-signup trial checking exception: ", err);
          }

          if (trialExDoc && trialExDoc.exists()) {
            setIsLoading(false);
            setErrorText("The 14-day free trial has already been completed by this email address. Free trial signups are disabled for this email. Please proceed to the Login Terminal instead.");
            return;
          }

          // 2. --- Admin Self Registration (Bootstrapped Admin Creation) ---
          const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const uid = userCred.user.uid;

          // Create admin with 7 fields required by firestore.rules
          const createdAtISO = new Date().toISOString();
          const adminDocPath = `admins/${uid}`;
          
          try {
            await setDoc(doc(db, "admins", uid), {
              uid,
              email: email.trim(),
              name: name.trim() || "Hospital Chief Admin",
              role: "Admin",
              createdAt: createdAtISO,
              isPaid: false,
              paymentPlan: "Free Trial (14-Days)"
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, adminDocPath);
          }

          onLoginSuccess({
            uid,
            email: email.trim(),
            role: "Admin",
            name: name.trim() || "Hospital Chief Admin",
            department: "Finance Office",
            permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
            isAdmin: true,
            createdAt: createdAtISO,
            isPaid: false,
            paymentPlan: "Free Trial (14-Days)"
          });
        } else {
          // --- Admin Login ---
          const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          const uid = userCred.user.uid;

          // Check if admin doc exists
          const adminDocPath = `admins/${uid}`;
          let adminDoc;
          try {
            adminDoc = await getDoc(doc(db, "admins", uid));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, adminDocPath);
          }

          if (adminDoc && adminDoc.exists()) {
            const data = adminDoc.data();
            onLoginSuccess({
              uid,
              email: data.email,
              role: "Admin",
              name: data.name,
              department: "Finance Office",
              permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
              isAdmin: true,
              createdAt: data.createdAt || new Date().toISOString(),
              isPaid: !!data.isPaid,
              paymentPlan: data.paymentPlan || "Free Trial (14-Days)"
            });
          } else {
            // Document not found in Admin collection
            await signOut(auth);
            setErrorText("Security Alert: Although your authentication is valid, you are not listed in the Admin Security Directory. If you are an Employee, please select the Employee Portal.");
          }
        }
      } else {
        // --- Employee Portal Login ---
        if (isSignUpMode) {
          setErrorText("Staff accounts cannot self-register. Please contact the Hospital Chief Web Administrator to set up your clinical credentials.");
          setIsLoading(false);
          return;
        }

        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCred.user.uid;

        // Fetch employee's department and permitted modules from Firestore
        const employeeDocPath = `employees/${uid}`;
        let employeeDoc;
        try {
          employeeDoc = await getDoc(doc(db, "employees", uid));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, employeeDocPath);
        }

        if (employeeDoc && employeeDoc.exists()) {
          const data = employeeDoc.data();
          onLoginSuccess({
            uid: uid,
            email: data.email,
            role: data.role,
            name: data.name,
            department: data.department,
            permittedModules: data.permittedModules || ["dashboard"],
            isAdmin: false,
            createdAt: new Date().toISOString(),
            isPaid: true, // Employee is treated as bypass/paid as they do not own the workspace subscription
            paymentPlan: "Enterprise Bound"
          });
        } else {
          // Is this user actually an Admin trying to log into employee terminal?
          const adminDocPath = `admins/${uid}`;
          let adminCheck;
          try {
            adminCheck = await getDoc(doc(db, "admins", uid));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, adminDocPath);
          }

          if (adminCheck && adminCheck.exists()) {
            const data = adminCheck.data();
            onLoginSuccess({
              uid,
              email: data.email,
              role: "Admin",
              name: data.name,
              department: "Finance Office",
              permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
              isAdmin: true,
              createdAt: data.createdAt || new Date().toISOString(),
              isPaid: !!data.isPaid,
              paymentPlan: data.paymentPlan || "Free Trial (14-Days)"
            });
          } else {
            await signOut(auth);
            setErrorText("Credentials verified, but your account is not registered in the Hospital HR Employee database. Please contact the administrator.");
          }
        }
      }
    } catch (err: any) {
      console.error("Authentication fault:", err);
      let descriptiveMsg = err.message || "An unexpected network interruption occurred during secure login.";
      if (descriptiveMsg.includes("auth/invalid-credential") || descriptiveMsg.includes("auth/user-not-found") || descriptiveMsg.includes("wrong-password")) {
        descriptiveMsg = "Access Denied: The security credentials provided are invalid.";
      } else if (descriptiveMsg.includes("auth/email-already-in-use")) {
        descriptiveMsg = "This email is already registered. Please login instead.";
      } else if (descriptiveMsg.includes("auth/weak-password")) {
        descriptiveMsg = "Security Requirement: Security password must comprise at least 6 characters.";
      }
      setErrorText(descriptiveMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Banner Navigation back to Marketing Website */}
      {onBackToLanding && (
        <button 
          onClick={onBackToLanding}
          className="mb-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-950/40 hover:bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Marketing Website</span>
        </button>
      )}

      {/* Visual background rings/glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
      >
        
        {/* Decorative corner warning gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Brand visual header */}
        <div className="text-center space-y-2.5 pb-6 border-b border-slate-800/80">
          <div className="mx-auto p-3 bg-emerald-500 text-slate-950 w-fit rounded-xl shadow-lg shadow-emerald-500/10">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>MediFlow AI Portal</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
              {isSignUpMode ? "14-Day Free Trial Onboarding" : "HIPAA Clinician Login Terminal"}
            </p>
          </div>
        </div>

        {/* ROLE SELECTION HEADER TABS */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800/80 rounded-xl my-6">
          <button
            type="button"
            disabled={isSignUpMode}
            onClick={() => {
              setRoleMode("employee");
              setErrorText(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 ${
              roleMode === "employee"
                ? "bg-slate-955 text-emerald-400 border border-emerald-500/10 shadow-sm"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Employee Terminal</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setRoleMode("admin");
              setErrorText(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              roleMode === "admin"
                ? "bg-slate-955 text-indigo-400 border border-indigo-500/10 shadow-sm"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Admin Desk</span>
          </button>
        </div>

        {/* Dynamic Context Notification Banner */}
        <div className="mb-4">
          <div className="p-3 rounded-lg text-xs border bg-slate-900/40 border-slate-800 flex items-start gap-2 text-slate-400 text-left">
            <ClipboardList className={`w-4 h-4 shrink-0 mt-0.5 ${roleMode === "admin" ? "text-indigo-400" : "text-emerald-400"}`} />
            <div className="leading-relaxed">
              {isSignUpMode ? (
                <span>
                  <strong>Free Trial Registration:</strong> Get instant 14-days free access. No credit card requested. Direct billing begins only if you decide to activate a paid membership later.
                </span>
              ) : roleMode === "admin" ? (
                <span>
                  <strong>Chief Administrator Entry:</strong> Log in using your secure supervisor credentials to manage beds, patient diagnostics, and staff permissions.
                </span>
              ) : (
                <span>
                  <strong>Clinical & Operational Access:</strong> Log in using clinical details issued to you by the chief administrator. Self-registration is disabled for staff.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error handling component */}
        {errorText && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-xs text-left mb-4 flex items-start gap-2 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
          
          {roleMode === "admin" && isSignUpMode && (
            <div className="space-y-1.5 text-left">
              <label className="block font-mono text-[9px] text-slate-450 uppercase tracking-widest">Administrator Full Name</label>
              <input
                type="text"
                placeholder="Hospital Chief Administrator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-colors"
                required
              />
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="block font-mono text-[9px] text-slate-455 uppercase tracking-widest">Security Email Account</label>
            <input
              type="email"
              placeholder={roleMode === "admin" ? defaultAdminEmail : "nurse.priya@hims.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-colors ${
                roleMode === "admin" ? "focus:border-indigo-500" : "focus:border-emerald-500"
              }`}
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block font-mono text-[9px] text-slate-455 uppercase tracking-widest">Access Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-colors ${
                roleMode === "admin" ? "focus:border-indigo-500" : "focus:border-emerald-500"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 cursor-pointer disabled:opacity-50 ${
              roleMode === "admin" 
                ? "bg-indigo-400 hover:bg-indigo-300 text-slate-950" 
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Security Gateway...</span>
              </>
            ) : (
              <>
                <span>{isSignUpMode ? "Activate 14-Day Free Trial" : "Secure Clinical Access"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle sign-up mode solely for Admins for bootstrapped trial signup */}
        {roleMode === "admin" && (
          <div className="mt-5 text-center text-xs border-t border-slate-800/80 pt-4 text-slate-400">
            <span>
              {isSignUpMode 
                ? "Already have an account?" 
                : "Ready to deploy your medical group active workspace?"}{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setErrorText(null);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              {isSignUpMode ? "Log In here" : "Sign Up for Free Trial"}
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
