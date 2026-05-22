import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
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
  ChevronLeft,
  Building2,
  Lock
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
    parentAdminUid?: string;
    parentAdminCreatedAt?: string;
    parentAdminIsPaid?: boolean;
  }) => void;
  onBackToLanding?: () => void;
}

export function LoginPortal({ initialSignUpMode = false, onLoginSuccess, onBackToLanding }: LoginPortalProps) {
  // roleMode can be "hospital" (both Admins & Staff unified login) or "super" (SaaS Master Platform Owner)
  const [roleMode, setRoleMode] = useState<"hospital" | "super">("hospital");
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with prop triggers
  useEffect(() => {
    if (initialSignUpMode) {
      setRoleMode("hospital");
      setIsSignUpMode(true);
    } else {
      setRoleMode("hospital");
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
      if (roleMode === "hospital") {
        if (isSignUpMode) {
          // --- Hospital Admin Sign Up ---
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

          // Register new Admin
          const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const uid = userCred.user.uid;
          const createdAtISO = new Date().toISOString();
          const adminDocPath = `admins/${uid}`;
          const isSuper = targetEmail === defaultAdminEmail;
          
          try {
            await setDoc(doc(db, "admins", uid), {
              uid,
              email: email.trim(),
              name: name.trim() || (isSuper ? "Super Admin" : "Hospital Chief Admin"),
              role: isSuper ? "Super Admin" : "Hospital Admin",
              createdAt: createdAtISO,
              isPaid: isSuper ? true : false,
              paymentPlan: isSuper ? "SaaS Platform Owner" : "Free Trial (14-Days)"
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, adminDocPath);
          }

          onLoginSuccess({
            uid,
            email: email.trim(),
            role: isSuper ? "Super Admin" : "Hospital Admin",
            name: name.trim() || (isSuper ? "Super Admin" : "Hospital Chief Admin"),
            department: "Finance Office",
            permittedModules: isSuper 
              ? ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"]
              : ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
            isAdmin: true,
            createdAt: createdAtISO,
            isPaid: isSuper ? true : false,
            paymentPlan: isSuper ? "SaaS Platform Owner" : "Free Trial (14-Days)"
          });
        } else {
          // --- Unified Hospital Workspace Login (Admin or Staff) ---
          const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          const uid = userCred.user.uid;

          // 1. Check if exists in admins collection
          let adminDoc;
          try {
            adminDoc = await getDoc(doc(db, "admins", uid));
          } catch (err) {
            console.warn("Auth submit: error checking admin collection:", err);
          }

          if (adminDoc && adminDoc.exists()) {
            const data = adminDoc.data();
            const isSuper = targetEmail === defaultAdminEmail || data.role === "Super Admin";
            onLoginSuccess({
              uid,
              email: data.email,
              role: isSuper ? "Super Admin" : "Hospital Admin",
              name: data.name,
              department: "Finance Office",
              permittedModules: isSuper 
                ? ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"]
                : ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
              isAdmin: true,
              createdAt: data.createdAt || new Date().toISOString(),
              isPaid: isSuper ? true : !!data.isPaid,
              paymentPlan: isSuper ? "SaaS Platform Owner" : (data.paymentPlan || "Free Trial (14-Days)")
            });
            return;
          }

          // 2. See if exists in employees collection
          let employeeDoc;
          try {
            employeeDoc = await getDoc(doc(db, "employees", uid));
          } catch (err) {
            console.warn("Auth submit: error checking employees collection:", err);
          }

          if (employeeDoc && employeeDoc.exists()) {
            const data = employeeDoc.data();
            let parentAdminCreatedAt = data.parentAdminCreatedAt;
            let parentAdminIsPaid = data.parentAdminIsPaid;
            let parentAdminUid = data.adminId;

            if (parentAdminUid) {
              try {
                const pDoc = await getDoc(doc(db, "admins", parentAdminUid));
                if (pDoc.exists()) {
                  const pData = pDoc.data();
                  parentAdminCreatedAt = pData.createdAt;
                  parentAdminIsPaid = pData.isPaid;
                }
              } catch (err) {
                console.warn("Failed retrieving parent admin on workspace login:", err);
              }
            } else {
              try {
                const { getDocs, collection } = await import("firebase/firestore");
                const adminsSnap = await getDocs(collection(db, "admins"));
                if (!adminsSnap.empty) {
                  const admData = adminsSnap.docs[0].data();
                  parentAdminUid = admData.uid;
                  parentAdminCreatedAt = admData.createdAt;
                  parentAdminIsPaid = admData.isPaid;
                }
              } catch (err) {
                console.warn("Fallback admin lookup failed on workspace login:", err);
              }
            }

            onLoginSuccess({
              uid: uid,
              email: data.email,
              role: data.role,
              name: data.name,
              department: data.department,
              permittedModules: data.permittedModules || ["dashboard"],
              isAdmin: false,
              createdAt: new Date().toISOString(),
              isPaid: true,
              paymentPlan: "Enterprise Bound",
              parentAdminUid,
              parentAdminCreatedAt,
              parentAdminIsPaid
            });
            return;
          }

          // Document listed in neither collection
          await signOut(auth);
          setErrorText("Access Denied: This credentials set is valid but matches no registered Hospital Admin or staff listing in MediFlow. Please contact your internal Chief Administrator.");
        }
      } else {
        // --- SaaS Platform Super Admin Desk ---
        if (isSignUpMode) {
          setErrorText("Platform Super Administrator credentials cannot self-register. Please contact systems operations.");
          setIsLoading(false);
          return;
        }

        if (targetEmail !== defaultAdminEmail) {
          setErrorText("Access Denied: Only certified platform super administrators of MediFlow are permitted on this master system gateway.");
          setIsLoading(false);
          return;
        }

        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCred.user.uid;

        let adminDoc = await getDoc(doc(db, "admins", uid));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          onLoginSuccess({
            uid,
            email: data.email,
            role: "Super Admin",
            name: data.name || "SaaS Master Administrator",
            department: "Master Control",
            permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"],
            isAdmin: true,
            createdAt: data.createdAt || new Date().toISOString(),
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
        } else {
          // Auto create a Super Admin entry if missing
          const createdAtISO = new Date().toISOString();
          await setDoc(doc(db, "admins", uid), {
            uid,
            email: email.trim(),
            name: "SaaS Master Administrator",
            role: "Super Admin",
            createdAt: createdAtISO,
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
          onLoginSuccess({
            uid,
            email: email.trim(),
            role: "Super Admin",
            name: "SaaS Master Administrator",
            department: "Master Control",
            permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"],
            isAdmin: true,
            createdAt: createdAtISO,
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
        }
      }
    } catch (err: any) {
      console.error("Authentication fault:", err);
      let descriptiveMsg = err.message || "An unexpected network interruption occurred during secure login.";
      const errorCode = err.code || "";
      
      if (
        errorCode === "auth/invalid-credential" || 
        errorCode === "auth/user-not-found" || 
        errorCode === "auth/wrong-password" ||
        descriptiveMsg.includes("auth/invalid-credential") || 
        descriptiveMsg.includes("auth/user-not-found") || 
        descriptiveMsg.includes("wrong-password")
      ) {
        descriptiveMsg = "Access Denied: The security credentials provided are invalid.";
      } else if (errorCode === "auth/email-already-in-use" || descriptiveMsg.includes("auth/email-already-in-use")) {
        descriptiveMsg = "This email is already registered. Please login instead.";
      } else if (errorCode === "auth/weak-password" || descriptiveMsg.includes("auth/weak-password")) {
        descriptiveMsg = "Security Requirement: Security password must comprise at least 6 characters.";
      } else if (errorCode === "auth/invalid-email" || descriptiveMsg.includes("auth/invalid-email")) {
        descriptiveMsg = "The email address provided is invalid. Please double check.";
      }
      setErrorText(descriptiveMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;
      const uid = user.uid;
      const userEmail = user.email || "";
      const targetEmail = userEmail.trim().toLowerCase();

      // If logging into Super Admin Mode:
      if (roleMode === "super") {
        if (targetEmail !== defaultAdminEmail) {
          await signOut(auth);
          setErrorText("Access Denied: Only certified platform super administrators of MediFlow are permitted on this master system gateway.");
          return;
        }

        let adminDoc = await getDoc(doc(db, "admins", uid));
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          onLoginSuccess({
            uid,
            email: data.email,
            role: "Super Admin",
            name: data.name || user.displayName || "SaaS Master Administrator",
            department: "Master Control",
            permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"],
            isAdmin: true,
            createdAt: data.createdAt || new Date().toISOString(),
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
        } else {
          const createdAtISO = new Date().toISOString();
          await setDoc(doc(db, "admins", uid), {
            uid,
            email: userEmail,
            name: user.displayName || "SaaS Master Administrator",
            role: "Super Admin",
            createdAt: createdAtISO,
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
          onLoginSuccess({
            uid,
            email: userEmail,
            role: "Super Admin",
            name: user.displayName || "SaaS Master Administrator",
            department: "Master Control",
            permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"],
            isAdmin: true,
            createdAt: createdAtISO,
            isPaid: true,
            paymentPlan: "SaaS Platform Owner"
          });
        }
        return;
      }

      // --- Hospital Mode Unified Checks (Check Admin & Employee) ---
      const adminDocPath = `admins/${uid}`;
      const employeeDocPath = `employees/${uid}`;
      
      let adminDoc;
      let employeeDoc;

      try {
        adminDoc = await getDoc(doc(db, "admins", uid));
      } catch (err) {
        console.warn("Google Sign-In: error retrieving admin doc:", err);
      }

      try {
        employeeDoc = await getDoc(doc(db, "employees", uid));
      } catch (err) {
        console.warn("Google Sign-In: error retrieving employee doc:", err);
      }

      // If admin doc exists:
      if (adminDoc && adminDoc.exists()) {
        const data = adminDoc.data();
        const isSuper = targetEmail === defaultAdminEmail || data.role === "Super Admin";
        onLoginSuccess({
          uid,
          email: data.email,
          role: isSuper ? "Super Admin" : "Hospital Admin",
          name: data.name || user.displayName || "Hospital Admin",
          department: "Finance Office",
          permittedModules: isSuper 
            ? ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"]
            : ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
          isAdmin: true,
          createdAt: data.createdAt || new Date().toISOString(),
          isPaid: isSuper ? true : !!data.isPaid,
          paymentPlan: isSuper ? "SaaS Platform Owner" : (data.paymentPlan || "Free Trial (14-Days)")
        });
        return;
      }

      // If employee doc exists:
      if (employeeDoc && employeeDoc.exists()) {
        const data = employeeDoc.data();
        let parentAdminCreatedAt = data.parentAdminCreatedAt;
        let parentAdminIsPaid = data.parentAdminIsPaid;
        let parentAdminUid = data.adminId;

        if (parentAdminUid) {
          try {
            const pDoc = await getDoc(doc(db, "admins", parentAdminUid));
            if (pDoc.exists()) {
              const pData = pDoc.data();
              parentAdminCreatedAt = pData.createdAt;
              parentAdminIsPaid = pData.isPaid;
            }
          } catch (err) {
            console.warn("Google Sign-In: failed retrieving parent admin info:", err);
          }
        } else {
          try {
            const { getDocs, collection } = await import("firebase/firestore");
            const adminsSnap = await getDocs(collection(db, "admins"));
            if (!adminsSnap.empty) {
              const admData = adminsSnap.docs[0].data();
              parentAdminUid = admData.uid;
              parentAdminCreatedAt = admData.createdAt;
              parentAdminIsPaid = admData.isPaid;
            }
          } catch (err) {
            console.warn("Google Sign-In: fallback lookup failed:", err);
          }
        }

        onLoginSuccess({
          uid: uid,
          email: data.email,
          role: data.role,
          name: data.name || user.displayName || "Hospital User",
          department: data.department,
          permittedModules: data.permittedModules || ["dashboard"],
          isAdmin: false,
          createdAt: new Date().toISOString(),
          isPaid: true,
          paymentPlan: "Enterprise Bound",
          parentAdminUid,
          parentAdminCreatedAt,
          parentAdminIsPaid
        });
        return;
      }

      // If document does NOT exist yet:
      if (isSignUpMode) {
        // Sign Up Route (Admin Free Trial)
        const trialDocPath = `expired_trials/${targetEmail}`;
        let trialExDoc;
        try {
          trialExDoc = await getDoc(doc(db, "expired_trials", targetEmail));
        } catch (err) {
          console.warn("Google Sign-In: Check expired trial error:", err);
        }

        if (trialExDoc && trialExDoc.exists()) {
          setIsLoading(false);
          setErrorText("The 14-day free trial has already been completed by this email address. Free trial signups are disabled for this email. Please log in with a registered account.");
          await signOut(auth);
          return;
        }

        const createdAtISO = new Date().toISOString();
        const isSuper = targetEmail === defaultAdminEmail;
        
        try {
          await setDoc(doc(db, "admins", uid), {
            uid,
            email: userEmail,
            name: user.displayName || name.trim() || (isSuper ? "Super Admin" : "Hospital Admin"),
            role: isSuper ? "Super Admin" : "Hospital Admin",
            createdAt: createdAtISO,
            isPaid: isSuper ? true : false,
            paymentPlan: isSuper ? "SaaS Platform Owner" : "Free Trial (14-Days)"
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, adminDocPath);
        }

        onLoginSuccess({
          uid,
          email: userEmail,
          role: isSuper ? "Super Admin" : "Hospital Admin",
          name: user.displayName || name.trim() || (isSuper ? "Super Admin" : "Hospital Admin"),
          department: "Finance Office",
          permittedModules: isSuper 
            ? ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "super_admin"]
            : ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"],
          isAdmin: true,
          createdAt: createdAtISO,
          isPaid: isSuper ? true : false,
          paymentPlan: isSuper ? "SaaS Platform Owner" : "Free Trial (14-Days)"
        });
      } else {
        // Try to log in but account not found
        await signOut(auth);
        setErrorText("Access Denied: You do not have a workspace or employee listing registered under this Google Account inside MediFlow. Please log in with a registered account, or click 'Sign Up for Free Trial' to configure a new workspace.");
      }
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      let descriptiveMsg = err.message || "An unexpected error occurred during Google Authentication.";
      const errorCode = err.code || "";
      if (errorCode === "auth/popup-closed-by-user") {
        descriptiveMsg = "Google Sign-In prompt was closed before completion. Please try again.";
      } else if (errorCode === "auth/cancelled-popup-request") {
        descriptiveMsg = "Sign-in popup request was cancelled. Please try again.";
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
          className="mb-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-955/40 hover:bg-slate-955/80 px-4 py-2 rounded-xl border border-slate-800 cursor-pointer"
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
        className="w-full max-w-sm bg-slate-950/85 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
      >
        
        {/* Decorative corner warning gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Brand visual header */}
        <div className="text-center space-y-2.5 pb-6 border-b border-slate-80/80">
          <div className="mx-auto p-3 bg-emerald-500 text-slate-950 w-fit rounded-xl shadow-lg shadow-emerald-500/10">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>MediFlow AI Portal</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
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
              setRoleMode("hospital");
              setErrorText(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 ${
              roleMode === "hospital"
                ? "bg-slate-950 text-emerald-400 border border-emerald-500/10 shadow-sm font-semibold"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Workspace</span>
          </button>
          
          <button
            type="button"
            disabled={isSignUpMode}
            onClick={() => {
              setRoleMode("super");
              setErrorText(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 ${
              roleMode === "super"
                ? "bg-slate-950 text-indigo-400 border border-indigo-500/10 shadow-sm font-semibold"
                : "text-slate-450 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Super Admin Desk</span>
          </button>
        </div>

        {/* Dynamic Context Notification Banner */}
        <div className="mb-4">
          <div className="p-3 rounded-lg text-xs border bg-slate-900/40 border-slate-800 flex items-start gap-2 text-slate-400 text-left leading-relaxed">
            <ClipboardList className={`w-4 h-4 shrink-0 mt-0.5 ${roleMode === "super" ? "text-indigo-400" : "text-emerald-400"}`} />
            <div>
              {email.trim().toLowerCase() === defaultAdminEmail ? (
                <span>
                  <strong className="text-indigo-400">⚡ PLATFORM SUPER ADMIN AUDIT MODE:</strong> Master Platform Owner authorization bypass active. Explores the entire SaaS landscape.
                </span>
              ) : isSignUpMode ? (
                <span>
                  <strong>14-Day Free Trial Onboarding:</strong> Deploys a trial workspace for your <strong>Hospital / Organization</strong> and all of its clinical staff users.
                </span>
              ) : roleMode === "super" ? (
                <span>
                  <strong>SaaS Platform Master Control:</strong> Log in as SaaS master platform administrator to track global revenue cashflow, patient directories, and medical tenants.
                </span>
              ) : (
                <span>
                  <strong>Unified Hospital Access:</strong> Both hospital admins and clinic staff log in here. The workspace layout opens automatically based on individual permissions.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error handling component */}
        {errorText && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-xs text-left mb-4 flex items-start gap-2 animate-fadeIn font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorText}</span>
              {errorText.includes("already registered") && isSignUpMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(false);
                    setErrorText(null);
                  }}
                  className="block mt-1.5 text-indigo-400 hover:text-indigo-300 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Switch to Login Mode &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-semibold">
          
          {roleMode === "hospital" && isSignUpMode && (
            <div className="space-y-1.5 text-left">
              <label className="block font-mono text-[9px] text-slate-455 uppercase tracking-widest">Administrator Full Name</label>
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
              placeholder={roleMode === "super" ? defaultAdminEmail : "dr.rajesh@metromedic.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-lg text-xs outline-none transition-colors ${
                roleMode === "super" ? "focus:border-indigo-500 border-indigo-500/20" : "focus:border-emerald-500 border-emerald-500/20"
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
                roleMode === "super" ? "focus:border-indigo-500" : "focus:border-emerald-500"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 cursor-pointer disabled:opacity-50 ${
              roleMode === "super" 
                ? "bg-indigo-400 hover:bg-indigo-300 text-slate-950" 
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Gateway...</span>
              </>
            ) : (
              <>
                <span>{isSignUpMode ? "Activate 14-Day Free Trial" : "Secure Clinical Access"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="flex items-center my-4 py-1">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-3 text-[9px] uppercase font-mono text-slate-500 tracking-wider">or continue with</span>
            <div className="flex-1 border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-100 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-slate-800 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.196 2.698 1.24 6.65l4.026 3.115z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.34c-1.07.727-2.43 1.168-4.04 1.168-2.91 0-5.385-1.956-6.26-4.59L1.69 15.023C3.692 19.01 7.82 21.82 12 21.82c2.99 0 5.81-.99 7.91-2.736l-3.87-3.744z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.275c0-.686-.11-1.464-.316-2.13H12v4.46h6.47c-.28 1.488-1.127 2.766-2.43 3.61l3.87 3.743c2.264-2.09 3.58-5.176 3.58-8.683z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.74 11.918a7.03 7.03 0 0 1-.22-1.743c0-.6.082-1.183.22-1.743L1.714 5.317a11.957 11.957 0 0 0-.6 4.858c0 1.704.354 3.33.986 4.815l4.023-3.116z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>
        </form>

        {/* Toggle sign-up mode solely for Admins for bootstrapped trial signup */}
        {roleMode === "hospital" && (
          <div className="mt-5 text-center text-xs border-t border-slate-80/80 pt-4 text-slate-400 font-semibold">
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
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              {isSignUpMode ? "Log In here" : "Sign Up for Free Trial"}
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
