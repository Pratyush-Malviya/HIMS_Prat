import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  RefreshCw,
  Key,
  Cloud,
  UserCheck,
  ListFilter,
  Play,
  Database,
  ToggleLeft,
  Wrench,
  Activity,
  Cpu,
  ShieldCheck,
  UserCog,
  Trash2,
  Plus,
  Users,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  ListCollapse,
  Server,
  Sparkles,
  Palette,
  FileText,
  Check,
  Edit2,
  Image as ImageIcon,
  CreditCard,
  AlertTriangle,
  Calendar,
  Loader2,
  Receipt,
  X,
  Building2
} from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { getSecondaryAuth, db, handleFirestoreError, OperationType } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";


interface AdminModuleProps {
  store: HIMSStore;
  currentUser: { name: string; role: string };
  setCurrentUser?: (user: { name: string; role: string }) => void;
  activeSubTab?: string;
  setActiveSubTab?: (sub: string) => void;
  adminUid?: string;
  adminCreatedAt?: string;
  adminIsPaid?: boolean;
  adminPaymentPlan?: string;
  onSubscriptionChange?: (isPaid: boolean, planName: string) => void;
}

export function AdminModule({
  store,
  currentUser,
  setCurrentUser,
  activeSubTab = "directory",
  setActiveSubTab,
  adminUid = "",
  adminCreatedAt = "",
  adminIsPaid = false,
  adminPaymentPlan = "Free Trial (14-Days)",
  onSubscriptionChange
}: AdminModuleProps) {
  const getTrialDetails = () => {
    if (adminIsPaid) {
      return { elapsedDays: 0, daysRemaining: 14, isTrialExpired: false };
    }
    const createdDate = new Date(adminCreatedAt || new Date());
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - createdDate.getTime();
    const elapsedDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, 14 - elapsedDays);
    const isTrialExpired = elapsedDays >= 14;
    return { elapsedDays, daysRemaining, isTrialExpired };
  };

  const { elapsedDays, daysRemaining, isTrialExpired } = getTrialDetails();

  const {
    auditLogs,
    purgeResetDB,
    patients,
    beds,
    medicines,
    billing,
    createLog,
    employees,
    onboardEmployee,
    updateEmployeePermissions,
    removeEmployee,
    customRoles,
    addCustomRole,
    removeCustomRole,
    syncFirestoreData,
    hospitalProfile,
    updateHospitalProfile
  } = store;

  // Dynamic temporary states for Hospital Profile Editing
  const [profileName, setProfileName] = useState(hospitalProfile?.name || "");
  const [profileTagline, setProfileTagline] = useState(hospitalProfile?.tagline || "");
  const [profilePhone, setProfilePhone] = useState(hospitalProfile?.phone || "");
  const [profileEmail, setProfileEmail] = useState(hospitalProfile?.email || "");
  const [profileAddress, setProfileAddress] = useState(hospitalProfile?.address || "");
  const [profileLogoUrl, setProfileLogoUrl] = useState(hospitalProfile?.logoUrl || "");
  const [profileTax, setProfileTax] = useState(hospitalProfile?.taxNumber || "");
  const [profileAccreditation, setProfileAccreditation] = useState(hospitalProfile?.accreditation || "");
  const [profileAlert, setProfileAlert] = useState("");

  useEffect(() => {
    if (hospitalProfile) {
      setProfileName(hospitalProfile.name || "");
      setProfileTagline(hospitalProfile.tagline || "");
      setProfilePhone(hospitalProfile.phone || "");
      setProfileEmail(hospitalProfile.email || "");
      setProfileAddress(hospitalProfile.address || "");
      setProfileLogoUrl(hospitalProfile.logoUrl || "");
      setProfileTax(hospitalProfile.taxNumber || "");
      setProfileAccreditation(hospitalProfile.accreditation || "");
    }
  }, [hospitalProfile]);

  // Dynamic temporary states for Landing Page CMS Edit
  const { landingPageConfig, updateLandingPageConfig } = store;

  // Primary CMS fields state bindings
  const [fontFamily, setFontFamily] = useState(landingPageConfig.fontFamily);
  const [primaryColor, setPrimaryColor] = useState(landingPageConfig.primaryColor);
  const [backgroundColorMode, setBackgroundColorMode] = useState(landingPageConfig.backgroundColorMode);
  
  const [announcementText, setAnnouncementText] = useState(landingPageConfig.announcementText);
  const [heroHeaderPart1, setHeroHeaderPart1] = useState(landingPageConfig.heroHeaderPart1);
  const [heroHeaderPart2, setHeroHeaderPart2] = useState(landingPageConfig.heroHeaderPart2);
  const [heroSubheadline, setHeroSubheadline] = useState(landingPageConfig.heroSubheadline);
  const [heroButtonLeftText, setHeroButtonLeftText] = useState(landingPageConfig.heroButtonLeftText);
  const [heroButtonRightText, setHeroButtonRightText] = useState(landingPageConfig.heroButtonRightText);
  const [heroImage, setHeroImage] = useState(landingPageConfig.heroImage);

  // Sync states if store changes
  useEffect(() => {
    setFontFamily(landingPageConfig.fontFamily);
    setPrimaryColor(landingPageConfig.primaryColor);
    setBackgroundColorMode(landingPageConfig.backgroundColorMode);
    setAnnouncementText(landingPageConfig.announcementText);
    setHeroHeaderPart1(landingPageConfig.heroHeaderPart1);
    setHeroHeaderPart2(landingPageConfig.heroHeaderPart2);
    setHeroSubheadline(landingPageConfig.heroSubheadline);
    setHeroButtonLeftText(landingPageConfig.heroButtonLeftText);
    setHeroButtonRightText(landingPageConfig.heroButtonRightText);
    setHeroImage(landingPageConfig.heroImage);
  }, [landingPageConfig]);

  // Collapsible panels indicator flags
  const [showAddSlidePanel, setShowAddSlidePanel] = useState(false);
  const [showAddFeaturePanel, setShowAddFeaturePanel] = useState(false);

  // States for interactive billing tab
  const [billingPlan, setBillingPlan] = useState<string>("Core");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [billingBeds, setBillingBeds] = useState<number>(150);
  const [billingClinicians, setBillingClinicians] = useState<number>(35);
  const [billingGemini, setBillingGemini] = useState<boolean>(true);
  const [billingFHIR, setBillingFHIR] = useState<boolean>(false);
  const [checkoutCard, setCheckoutCard] = useState<string>("4242 4242 4242 4242");
  const [checkoutExpiry, setCheckoutExpiry] = useState<string>("12/29");
  const [checkoutCVC, setCheckoutCVC] = useState<string>("899");
  const [checkoutName, setCheckoutName] = useState<string>("Chief Medical Admin");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState<boolean>(false);
  const [billingStep, setBillingStep] = useState<number>(-1); // -1: standby, 0-3: processing, 4: invoice modal
  const [selectedInvoiceReceipt, setSelectedInvoiceReceipt] = useState<any>(null);

  // Form states for creating/editing slide
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState("");
  const [slideCategory, setSlideCategory] = useState("");
  const [slideProblemBadge, setSlideProblemBadge] = useState("");
  const [slideProblemTitle, setSlideProblemTitle] = useState("");
  const [slideProblemDesc, setSlideProblemDesc] = useState("");
  const [slideProblemImage, setSlideProblemImage] = useState("");
  const [slideSolutionBadge, setSlideSolutionBadge] = useState("");
  const [slideSolutionTitle, setSlideSolutionTitle] = useState("");
  const [slideSolutionDesc, setSlideSolutionDesc] = useState("");
  const [slideSolutionImage, setSlideSolutionImage] = useState("");
  const [slideMetricValue, setSlideMetricValue] = useState("");
  const [slideMetricLabel, setSlideMetricLabel] = useState("");
  const [slideBullet1, setSlideBullet1] = useState("");
  const [slideBullet2, setSlideBullet2] = useState("");
  const [slideBullet3, setSlideBullet3] = useState("");

  // Form states for creating/editing features
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [featTitle, setFeatTitle] = useState("");
  const [featBadge, setFeatBadge] = useState("");
  const [featDesc, setFeatDesc] = useState("");
  const [featImageUrl, setFeatImageUrl] = useState("");
  const [featPoint1, setFeatPoint1] = useState("");
  const [featPoint2, setFeatPoint2] = useState("");
  const [featPoint3, setFeatPoint3] = useState("");

  // Onboarding RBAC state
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPassword, setNewEmpPassword] = useState("");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [newEmpRole, setNewEmpRole] = useState("Physician");
  const [newEmpDept, setNewEmpDept] = useState("OPD Department");
  const [newEmpPerms, setNewEmpPerms] = useState<string[]>(["dashboard"]);

  // Custom Roles Architect States
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRoleDept, setCustomRoleDept] = useState("OPD Department");
  const [customRolePerms, setCustomRolePerms] = useState<string[]>(["dashboard"]);

  // Cloud Sync & Non-Technical Preferences States
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Synced 2 mins ago");
  const [autoSaveDischarge, setAutoSaveDischarge] = useState(true);
  const [pharmacyThreshold, setPharmacyThreshold] = useState(10);
  const [preferredCurrency, setPreferredCurrency] = useState("₹ INR");
  const [enableSMSNotifications, setEnableSMSNotifications] = useState(true);

  const [cmsAlert, setCmsAlert] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (syncFirestoreData) {
        await syncFirestoreData();
      }
      
      const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
      const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
      if (createLog) {
        createLog(
          userName, 
          userRole, 
          "Forced Database Sync", 
          "Cloud Storage Sync", 
          "Manually triggered cloud dataset sync of patients, beds, pharmacy stock, and access staff directory."
        );
      }
      
      const now = new Date();
      setLastSyncedTime(`Synced at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
      setCmsAlert("Success! Local database synchronized with Cloud Firestore database.");
    } catch (e) {
      console.warn("Manual data sync error: ", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveBrand = () => {
    updateLandingPageConfig({
      fontFamily,
      primaryColor,
      backgroundColorMode
    });
    const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
    const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
    createLog(userName, userRole, "Landing Page Styled", "Main Branding Systems", `Updated typography system font to "${fontFamily}" and theme colors to "${primaryColor}".`);
    setCmsAlert("Branding style settings saved to EHR system database successfully!");
  };

  const handleSaveHero = () => {
    updateLandingPageConfig({
      announcementText,
      heroHeaderPart1,
      heroHeaderPart2,
      heroSubheadline,
      heroButtonLeftText,
      heroButtonRightText,
      heroImage
    });
    const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
    const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
    createLog(userName, userRole, "Landing Hero Content Saved", "Main Branding Systems", `Modified SaaS landing page core headlines and button elements.`);
    setCmsAlert("Hero section typography and CTAs written successfully!");
  };

  const handleCreateOrUpdateSlide = () => {
    if (!slideTitle.trim()) {
      setCmsAlert("Slide title is required.");
      return;
    }
    const remedyBullets = [slideBullet1, slideBullet2, slideBullet3].filter(b => b.trim() !== "");
    const slidePayload = {
      title: slideTitle,
      category: slideCategory || "HOSPITAL EFFICIENCY",
      problemBadge: slideProblemBadge || "🔴 DETECTED GAPS",
      problemTitle: slideProblemTitle || "Unresolved Operational Gaps",
      problemDesc: slideProblemDesc || "Clinicians face high drag and manual scribing overhead.",
      problemImage: slideProblemImage || "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=700&q=80",
      solutionBadge: slideSolutionBadge || "🟢 INTEGRATED AID",
      solutionTitle: slideSolutionTitle || "Dynamic EHR Assisted Workflow",
      solutionDesc: slideSolutionDesc || "Our platform streamlines shift logs and bed telemetry instantly.",
      solutionImage: slideSolutionImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=700&q=80",
      metricValue: slideMetricValue || "100%",
      metricLabel: slideMetricLabel || "Verification Rate Boost",
      remedyBullets: remedyBullets.length ? remedyBullets : ["Eliminate transcription bottleneck", "Automate compliance tracking", "Optimize clinicians shift workflow"]
    };

    const currentSlides = landingPageConfig.painPointsSlides || [];

    if (editingSlideId) {
      const updatedSlides = currentSlides.map(s => s.id === editingSlideId ? { ...s, ...slidePayload } : s);
      updateLandingPageConfig({ painPointsSlides: updatedSlides });
      const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
      const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
      createLog(userName, userRole, "Pain Point Slide Modified", "Landing Page Carousel", `Updated slide database ID [${editingSlideId}] "${slideTitle}".`);
      setCmsAlert(`Carousel slide "${slideTitle}" updated!`);
      setEditingSlideId(null);
    } else {
      const newId = `slide-${Date.now()}`;
      const nextSlides = [...currentSlides, { ...slidePayload, id: newId }];
      updateLandingPageConfig({ painPointsSlides: nextSlides });
      const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
      const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
      createLog(userName, userRole, "Pain Point Slide Created", "Landing Page Carousel", `Provisioned new slide element: "${slideTitle}" dynamically.`);
      setCmsAlert(`New carousel slide "${slideTitle}" loaded into database!`);
    }

    setSlideTitle("");
    setSlideCategory("");
    setSlideProblemBadge("");
    setSlideProblemTitle("");
    setSlideProblemDesc("");
    setSlideProblemImage("");
    setSlideSolutionBadge("");
    setSlideSolutionTitle("");
    setSlideSolutionDesc("");
    setSlideSolutionImage("");
    setSlideMetricValue("");
    setSlideMetricLabel("");
    setSlideBullet1("");
    setSlideBullet2("");
    setSlideBullet3("");
    setShowAddSlidePanel(false);
  };

  const handleEditSlideClick = (slide: any) => {
    setEditingSlideId(slide.id);
    setSlideTitle(slide.title);
    setSlideCategory(slide.category || "");
    setSlideProblemBadge(slide.problemBadge || "");
    setSlideProblemTitle(slide.problemTitle || "");
    setSlideProblemDesc(slide.problemDesc || "");
    setSlideProblemImage(slide.problemImage || "");
    setSlideSolutionBadge(slide.solutionBadge || "");
    setSlideSolutionTitle(slide.solutionTitle || "");
    setSlideSolutionDesc(slide.solutionDesc || "");
    setSlideSolutionImage(slide.solutionImage || "");
    setSlideMetricValue(slide.metricValue || "");
    setSlideMetricLabel(slide.metricLabel || "");
    setSlideBullet1(slide.remedyBullets?.[0] || "");
    setSlideBullet2(slide.remedyBullets?.[1] || "");
    setSlideBullet3(slide.remedyBullets?.[2] || "");
    setShowAddSlidePanel(true);
  };

  const handleDeleteSlideClick = (id: string, title: string) => {
    const currentSlides = landingPageConfig.painPointsSlides || [];
    const updated = currentSlides.filter(s => s.id !== id);
    updateLandingPageConfig({ painPointsSlides: updated });
    const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
    const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
    createLog(userName, userRole, "Pain Point Slide Deleted", "Landing Page Carousel", `Purged slide database ID [${id}] "${title}".`);
    setCmsAlert(`Permanently deleted slide "${title}"`);
    if (editingSlideId === id) {
      setEditingSlideId(null);
      // clear fields
      setSlideTitle("");
    }
  };

  const handleCreateOrUpdateFeature = () => {
    if (!featTitle.trim()) {
      setCmsAlert("Feature title is required.");
      return;
    }
    const points = [featPoint1, featPoint2, featPoint3].filter(p => p.trim() !== "");
    const featurePayload = {
      title: featTitle,
      badge: featBadge || "CORE EHR ADVANTAGE",
      desc: featDesc || "Streamlined operations to protect patient safety and control inventory workflow.",
      imageUrl: featImageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
      points: points.length ? points : ["Standard compliance guidelines enforcement", "Visual live logs reporting dashboard", "Closed-loop system accountability tracking"]
    };

    const currentFeatures = landingPageConfig.featuresList || [];

    if (editingFeatureId) {
      const updatedFeatures = currentFeatures.map(f => f.id === editingFeatureId ? { ...f, ...featurePayload } : f);
      updateLandingPageConfig({ featuresList: updatedFeatures });
      const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
      const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
      createLog(userName, userRole, "Feature Spotlight Updated", "Landing Page CMS", `Edited feature component "${featTitle}".`);
      setCmsAlert(`Feature spotlight "${featTitle}" updated successfully!`);
      setEditingFeatureId(null);
    } else {
      const newId = `feat-${Date.now()}`;
      const nextFeatures = [...currentFeatures, { ...featurePayload, id: newId }];
      updateLandingPageConfig({ featuresList: nextFeatures });
      const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
      const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
      createLog(userName, userRole, "Feature Spotlight Provisioned", "Landing Page CMS", `Created a new modular spotlight node: "${featTitle}".`);
      setCmsAlert(`New spotlight module "${featTitle}" created!`);
    }

    setFeatTitle("");
    setFeatBadge("");
    setFeatDesc("");
    setFeatImageUrl("");
    setFeatPoint1("");
    setFeatPoint2("");
    setFeatPoint3("");
    setShowAddFeaturePanel(false);
  };

  const handleEditFeatureClick = (feat: any) => {
    setEditingFeatureId(feat.id);
    setFeatTitle(feat.title);
    setFeatBadge(feat.badge || "");
    setFeatDesc(feat.desc || "");
    setFeatImageUrl(feat.imageUrl || "");
    setFeatPoint1(feat.points?.[0] || "");
    setFeatPoint2(feat.points?.[1] || "");
    setFeatPoint3(feat.points?.[2] || "");
    setShowAddFeaturePanel(true);
  };

  const handleDeleteFeatureClick = (id: string, title: string) => {
    const currentFeatures = landingPageConfig.featuresList || [];
    const updated = currentFeatures.filter(f => f.id !== id);
    updateLandingPageConfig({ featuresList: updated });
    const userRole = localStorage.getItem("hims_current_user_role") || "Executive Admin";
    const userName = localStorage.getItem("hims_current_user_name") || "Administrator";
    createLog(userName, userRole, "Feature Spotlight Deleted", "Landing Page CMS", `Deleted spotlight node "${title}".`);
    setCmsAlert(`Feature "${title}" deleted from spotlight list.`);
    if (editingFeatureId === id) {
      setEditingFeatureId(null);
      setFeatTitle("");
    }
  };

  // Audit filter states
  const [targetDept, setTargetDept] = useState("All");
  const [targetRole, setTargetRole] = useState("All");
  const [targetAction, setTargetAction] = useState("All");
  const [actionKeyword, setActionKeyword] = useState("");

  const depts = ["All", "OPD Department", "Nursing Station", "ICU Ward", "Emergency - IPD", "Laboratory", "Pharmacy Ward", "Finance Office"];
  const roles = ["All", "Physician", "Nurse", "Admin", "Lab Head", "Pharmacy Boss", ...customRoles.map((r) => r.name)];
  const actions = [
    "All",
    "Admit Patient",
    "Register Patient",
    "Discharge Patient",
    "Create Appointment",
    "Update Appointment",
    "Log Vitals",
    "Vital Anomaly Flagged",
    "Log Consultation",
    "Admit Inpatient",
    "Discharge Inpatient",
    "Request Lab Test",
    "Update Pharmacy Stock",
    "Generate Invoice",
    "Approve Insurance TPA",
    "Invoice Direct Payment",
    "System Factory Reset"
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const deptMatch = targetDept === "All" || log.department.toLowerCase().includes(targetDept.split(" ")[0].toLowerCase());
    const roleMatch = targetRole === "All" || log.role === targetRole;
    const actionSelectMatch = targetAction === "All" || log.action === targetAction;
    const actionKeywordMatch = !actionKeyword || log.action.toLowerCase().includes(actionKeyword.toLowerCase());
    return deptMatch && roleMatch && actionSelectMatch && actionKeywordMatch;
  });

  const handleToggleModuleForNew = (moduleId: string) => {
    if (newEmpPerms.includes(moduleId)) {
      setNewEmpPerms(newEmpPerms.filter((p) => p !== moduleId));
    } else {
      setNewEmpPerms([...newEmpPerms, moduleId]);
    }
  };

  const handleRoleChange = (roleName: string) => {
    setNewEmpRole(roleName);
    const matchedCustom = customRoles.find((r) => r.name === roleName);
    if (matchedCustom) {
      setNewEmpDept(matchedCustom.defaultDepartment);
      setNewEmpPerms(matchedCustom.defaultPermittedModules);
    } else {
      if (roleName === "Physician") {
        setNewEmpDept("OPD Department");
        setNewEmpPerms(["dashboard", "opd", "ipd"]);
      } else if (roleName === "Nurse") {
        setNewEmpDept("Nursing Station");
        setNewEmpPerms(["dashboard", "ipd"]);
      } else if (roleName === "Admin") {
        setNewEmpDept("Finance Office");
        setNewEmpPerms(["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"]);
      } else if (roleName === "Lab Head") {
        setNewEmpDept("Laboratory");
        setNewEmpPerms(["dashboard", "labs"]);
      } else if (roleName === "Pharmacy Boss") {
        setNewEmpDept("Pharmacy Ward");
        setNewEmpPerms(["dashboard", "pharmacy"]);
      }
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) {
      alert("Please enter employee name.");
      return;
    }
    if (!newEmpEmail.trim() || !newEmpPassword.trim()) {
      alert("Please provide valid login email and security password credentials.");
      return;
    }
    if (newEmpPassword.length < 6) {
      alert("Security requirement: Password must consist of at least 6 characters.");
      return;
    }

    setIsOnboarding(true);

    const { secondaryAuth, cleanup } = getSecondaryAuth();
    try {
      // 1. Create the Auth credential
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newEmpEmail.trim(), newEmpPassword);
      const uid = userCred.user.uid;
      
      const newEmp = {
        id: uid, // Use actual uid as Id so they can retrieve it on login!
        name: newEmpName.trim(),
        email: newEmpEmail.trim(),
        phone: "+91 99999 88888",
        role: newEmpRole,
        department: newEmpDept,
        joiningDate: new Date().toISOString().split("T")[0],
        salary: 80000,
        shiftPattern: "Morning (08:00 - 16:00)" as const,
        attendanceStatus: "On-Duty" as const,
        permittedModules: newEmpPerms,
        adminId: adminUid,
        parentAdminCreatedAt: adminCreatedAt || new Date().toISOString(),
        parentAdminIsPaid: adminIsPaid
      };

      // 2. Write to `/employees/{uid}` Firestore doc
      await setDoc(doc(db, "employees", uid), newEmp);

      // 3. Update store (local list for display)
      onboardEmployee(newEmp);

      alert(`Success: "${newEmpName.trim()}" onboarded securely and HIMS security tokens deployed.`);
      
      // Reset inputs
      setNewEmpName("");
      setNewEmpEmail("");
      setNewEmpPassword("");
      handleRoleChange(newEmpRole);
    } catch (err: any) {
      console.error("Failed to onboard employee to Firebase:", err);
      let errMsg = err.message || String(err);
      const errCode = err.code || "";
      
      if (errCode === "auth/email-already-in-use" || errMsg.includes("auth/email-already-in-use")) {
        errMsg = "This email is already registered. Staff accounts must have a unique email address.";
      } else if (errCode === "auth/weak-password" || errMsg.includes("auth/weak-password")) {
        errMsg = "Password is too weak. Security rules require passwords to contain at least 6 characters.";
      } else if (errCode === "auth/invalid-email" || errMsg.includes("auth/invalid-email")) {
        errMsg = "The email address provided is invalid. Please double-check the formatting.";
      }
      alert(`Failed to onboard employee: ${errMsg}`);
    } finally {
      setIsOnboarding(false);
      await cleanup();
    }
  };

  const handleToggleModuleForCustom = (moduleId: string) => {
    if (customRolePerms.includes(moduleId)) {
      setCustomRolePerms(customRolePerms.filter((p) => p !== moduleId));
    } else {
      setCustomRolePerms([...customRolePerms, moduleId]);
    }
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName.trim()) {
      alert("Please enter a custom role name.");
      return;
    }
    const alreadyExists = customRoles.some(
      (r) => r.name.toLowerCase() === customRoleName.trim().toLowerCase()
    );
    const inPreset = ["all", "physician", "nurse", "admin", "lab head", "pharmacy boss"].includes(
      customRoleName.trim().toLowerCase()
    );
    if (alreadyExists || inPreset) {
      alert(`The role archetype "${customRoleName}" already exists! Please choose a unique name.`);
      return;
    }

    addCustomRole({
      id: `role-${Date.now()}`,
      name: customRoleName.trim(),
      defaultDepartment: customRoleDept,
      defaultPermittedModules: customRolePerms
    });

    setCustomRoleName("");
    setCustomRolePerms(["dashboard"]);
    alert(`Success: "${customRoleName}" clinical role defined in database schema.`);
  };

  const handleReset = () => {
    if (window.confirm("Restore entire HIMS simulated Firestore database to factory presets? All custom logs and changes will be cleared.")) {
      purgeResetDB();
      alert("HIMS relational schema collections restored to base healthcare fixtures successfully.");
    }
  };

  const handleSwitchUser = (name: string, role: string) => {
    if (setCurrentUser) {
      setCurrentUser({ name, role });
      alert(`Context changed: Swapped to operator "${name}" (${role})`);
    } else {
      alert(`Informational: Swapping simulators is disabled while secure Multi-User Auth is operational. To sign in as "${name}" (${role}), please register them in the Onboarding tab and log in with their secure credentials.`);
    }
  };

  const triggerSimulationLog = (actionName: string, desc: string) => {
    createLog(currentUser.name, currentUser.role, actionName, "Database Admin", desc);
    alert(`[Sandbox Alert] Custom transaction securely written to security ledger: ${actionName}`);
  };

  // Helper inside Admin tabs
  const localSetTab = (id: string) => {
    if (setActiveSubTab) {
      setActiveSubTab(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-tab Header matching Left-sidebar options */}
      <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-wrap gap-1 shadow-sm items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {[
            { id: "profile", label: "Branding & Profile", icon: Building2, desc: "Configure hospital name, logo and letterheads" },
            { id: "directory", label: "Staff Directory", icon: Users, desc: "Personnel records & screen accesses" },
            { id: "roles", label: "Access & Roles", icon: UserCog, desc: "Manage permissions and roles" },
            { id: "logs", label: "Activity History", icon: ShieldCheck, desc: "Log history of actions" },
            { id: "diagnostics", label: "Settings & Cloud Sync", icon: Cpu, desc: "Cloud backup, manual sync & preferences" },
            { id: "billing", label: "SaaS Plan & Invoices", icon: CreditCard, desc: "Manage hospital subscription plans & trials" },
            { id: "landing", label: "Landing Page website CMS", icon: Sparkles, desc: "Manage marketing website style and text" }
          ].filter((tab) => tab.id !== "landing" || currentUser?.role === "Super Admin").map((tab) => {
            const isSelected = activeSubTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => localSetTab(tab.id)}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-500 hover:text-slate-950 hover:bg-slate-50 border-transparent"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-500 uppercase">
          RBAC POLICY ENG: ACTIVE
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVESUBTAB SELECTED IN SIDEBAR OR TOP SELECTOR */}
      
      {/* TAB A: STAFF DIRECTORY & LIVE CONTEXT CONTROLLER */}
      {activeSubTab === "directory" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Section 1: Immediate Swapper Context */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-500" />
                Quick-Swap Simulated Identity Context
              </h3>
              <p className="text-xs text-slate-400">Click any hospital staff operator profile below to instantly simulate their view and test automatic RBAC lock modules restrict on-the-fly.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {employees.map((emp) => {
                const isActive = currentUser.name === emp.name;
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleSwitchUser(emp.name, emp.role)}
                    className={`p-3 rounded-xl text-left border flex flex-col justify-between transition-all select-none cursor-pointer hover:scale-102 ${
                      isActive
                        ? "bg-slate-900 border-slate-800 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold truncate leading-none mb-1">{emp.name}</div>
                      <div className="text-[10px] font-mono opacity-80 mb-1">{emp.role}</div>
                    </div>
                    <div className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-slate-200/50 text-slate-600 self-start truncate max-w-full">
                      {emp.department}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graphical Interface: Credentials Coverage status LED alignment matrix! */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                HIMS Security access matrix (Dynamic Credentials Map)
              </h3>
              <p className="text-xs text-slate-400">Heat map visualization tracking system permissions coverage. Live green LEDs signify active authorization, padlocks indicate restricted views.</p>
            </div>
            
            <div className="border border-slate-50 rounded-xl p-4 bg-slate-50/50">
              <div className="flex gap-4 mb-4 text-[10.5px] text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                  Authorized Modules Access
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-slate-300 rounded-full inline-block"></span>
                  Restricted (LOCKED)
                </div>
              </div>

              <div className="space-y-3">
                {employees.map((emp) => {
                  const allowedCodes = [
                    { id: "dashboard", label: "GEN" },
                    { id: "opd", label: "OPD" },
                    { id: "ipd", label: "IPD" },
                    { id: "labs", label: "LAB" },
                    { id: "pharmacy", label: "RX" },
                    { id: "finance", label: "FIN" },
                    { id: "admin", label: "ADM" }
                  ];

                  return (
                    <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-100 rounded-lg gap-3">
                      <div>
                        <span className="font-semibold text-slate-800 text-xs">{emp.name}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Role: <strong className="text-slate-600">{emp.role}</strong> ({emp.department})</div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {allowedCodes.map((code) => {
                          const permitted = emp.permittedModules.includes(code.id);
                          return (
                            <button
                              key={code.id}
                              onClick={() => {
                                const updated = permitted
                                  ? emp.permittedModules.filter((m) => m !== code.id)
                                  : [...emp.permittedModules, code.id];
                                updateEmployeePermissions(emp.id, updated);
                              }}
                              className={`px-2 py-1 font-mono text-[9px] font-bold uppercase rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
                                permitted
                                  ? "bg-slate-900 text-emerald-400 border-slate-900 hover:bg-slate-850"
                                  : "bg-slate-50 text-slate-350 border-slate-200 hover:bg-slate-100"
                              }`}
                              title={`Toggle ${emp.name} ${code.id} permission`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${permitted ? "bg-emerald-400" : "bg-slate-300"}`}></span>
                              <span>{code.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Onboard Section Split */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Secure Staff Onboarding form</h3>
              <p className="text-xs text-slate-400">Onboard fresh clinic practitioners, clinical experts or administrative workers instantly into security registries.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form card */}
              <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Employee Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sarah Connor"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-indigo-500"
                      required
                      disabled={isOnboarding}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Login Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. sarah.connor@hospital.com"
                      value={newEmpEmail}
                      onChange={(e) => setNewEmpEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-indigo-500"
                      required
                      disabled={isOnboarding}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Initial Password (min 6 chars)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newEmpPassword}
                      onChange={(e) => setNewEmpPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-indigo-500"
                      required
                      disabled={isOnboarding}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Hospital Base Ward</label>
                    <select
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none"
                      disabled={isOnboarding}
                    >
                      <option value="OPD Department">OPD Department</option>
                      <option value="Nursing Station">Nursing Station</option>
                      <option value="ICU Ward">ICU Ward</option>
                      <option value="Emergency - IPD">Emergency - IPD</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Pharmacy Ward">Pharmacy Ward</option>
                      <option value="Finance Office">Finance Office</option>
                      <option value="Database Admin">Database Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Credential Role Title</label>
                    <select
                      value={newEmpRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none font-semibold text-slate-700"
                      disabled={isOnboarding}
                    >
                      <optgroup label="Core Clinician Roles">
                        <option value="Physician">Physician</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Admin">Admin</option>
                        <option value="Lab Head">Lab Head</option>
                        <option value="Pharmacy Boss">Pharmacy Boss</option>
                      </optgroup>
                      {customRoles.length > 0 && (
                        <optgroup label="Custom Configured Roles">
                          {customRoles.map((role) => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1.5">Configure Direct Module Permissions</label>
                    <div className="space-y-1.5 bg-white p-2.5 border border-slate-100 rounded-lg max-h-[160px] overflow-y-auto">
                      {[
                        { id: "dashboard", label: "Operations Dashboard" },
                        { id: "opd", label: "Outpatient Desk (OPD)" },
                        { id: "ipd", label: "Inpatient Rooms (IPD)" },
                        { id: "labs", label: "Pathology Diagnostics" },
                        { id: "pharmacy", label: "Pharmacy Stock Hub" },
                        { id: "finance", label: "Finance & Claim Audits" },
                        { id: "admin", label: "Executive Admin panel" }
                      ].map((mod) => (
                        <label key={mod.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newEmpPerms.includes(mod.id)}
                            onChange={() => handleToggleModuleForNew(mod.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                            disabled={isOnboarding}
                          />
                          <span className="text-[11px] text-slate-600">{mod.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isOnboarding}
                    className="w-full bg-slate-900 border border-slate-800 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isOnboarding ? (
                      <span>Deploying Secure Keys...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-400" /> Onboard Staff Account
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Staff directory status and revoke table */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">Active HR Registry Listings ({employees.length} staff)</h4>
                
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-b border-light">
                      <tr>
                        <th className="px-3 py-2.5">Staff details</th>
                        <th className="px-3 py-2.5 text-center">Department</th>
                        <th className="px-3 py-2.5 text-right font-mono">Decommission Key</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-3">
                            <span className="font-semibold text-slate-800 block text-xs">{emp.name}</span>
                            <span className="text-[9.5px] font-mono text-indigo-600 font-bold uppercase">{emp.role}</span>
                          </td>
                          <td className="px-3 py-3 text-center text-slate-500 text-[11px] font-medium font-mono">
                            {emp.department}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently revoke security tokens and delete HR directory record for ${emp.name}?`)) {
                                  removeEmployee(emp.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-semibold hover:underline font-mono text-[10px]"
                            >
                              REVOKE
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
        </div>
      )}

      {/* TAB B: CUSTOM ROLES ARCHITECT */}
      {activeSubTab === "roles" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 animate-fadeIn">
                <UserCog className="w-4.5 h-4.5 text-indigo-600" />
                Forge Custom Role Archetypes (Clinic Policy Modeler)
              </h3>
              <p className="text-xs text-slate-400">Create tailored clinical and operational role categories matching specialty workflows (e.g. Lead Pediatrician, Claims Intern). These dynamically sync during staff onboarding processes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form creation card */}
              <div className="lg:col-span-1 bg-indigo-50/40 border border-indigo-100/40 rounded-xl p-4 space-y-3.5">
                <span className="text-xs font-bold text-indigo-950 uppercase font-mono tracking-wider block border-b border-indigo-100 pb-2">Create Clinic Archetype</span>
                
                <form onSubmit={handleCreateCustomRole} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">Unique Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Radiologist, TPA Auditor"
                      value={customRoleName}
                      onChange={(e) => setCustomRoleName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">Base Department Binding</label>
                    <select
                      value={customRoleDept}
                      onChange={(e) => setCustomRoleDept(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="OPD Department">OPD Department</option>
                      <option value="Nursing Station">Nursing Station</option>
                      <option value="ICU Ward">ICU Ward</option>
                      <option value="Emergency - IPD">Emergency - IPD</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Pharmacy Ward">Pharmacy Ward</option>
                      <option value="Finance Office">Finance Office</option>
                      <option value="Database Admin">Database Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-1.5">Allowed Module Credentials</label>
                    <div className="space-y-1.5 bg-white p-2.5 border border-slate-100 rounded-lg max-h-[160px] overflow-y-auto">
                      {[
                        { id: "dashboard", label: "Dashboard (Overview)" },
                        { id: "opd", label: "Outpatient (OPD)" },
                        { id: "ipd", label: "Inpatient (IPD)" },
                        { id: "labs", label: "Pathology Lab" },
                        { id: "pharmacy", label: "Pharmacy Hub" },
                        { id: "finance", label: "Finance & Claims" },
                        { id: "admin", label: "Admin & Operations" }
                      ].map((mod) => (
                        <label key={mod.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customRolePerms.includes(mod.id)}
                            onChange={() => handleToggleModuleForCustom(mod.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className="text-[11px] text-slate-600">{mod.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Forge Role Archetype
                  </button>
                </form>
              </div>

              {/* Archetypes grid list */}
              <div className="lg:col-span-2 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Configured Custom Roles Database</h4>
                
                {customRoles.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                    No custom clinical archetypes constructed yet. Model a dynamic archetype on the left.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customRoles.map((role) => {
                      const activeStaffCount = employees.filter((e) => e.role === role.name).length;
                      return (
                        <div key={role.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:bg-slate-50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-slate-850 text-xs">{role.name}</h4>
                                <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-200/50 px-1.5 py-0.5 rounded leading-none block mt-1">
                                  {role.defaultDepartment}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  if (activeStaffCount > 0) {
                                    alert(`Failed: Cannot decommission archetype "${role.name}" because it is currently configured on ${activeStaffCount} staff accounts. Shift staff roles first.`);
                                    return;
                                  }
                                  if (window.confirm(`Decommission and remove clinic role archetype "${role.name}"?`)) {
                                    removeCustomRole(role.id);
                                  }
                                }}
                                className="text-slate-300 hover:text-red-500 p-1 rounded transition-all cursor-pointer"
                                title="Decommission Archetype"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-2">
                              {role.defaultPermittedModules.map((m) => (
                                <span key={m} className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100/30 text-[9px] text-indigo-600 font-mono font-bold uppercase">
                                  {m.slice(0, 3)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Assigned:</span>
                            <span className={`font-semibold px-2 py-0.5 rounded ${activeStaffCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                              {activeStaffCount} accounts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: SECURITY AUDIT TRAILS */}
      {activeSubTab === "logs" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
          
          {/* Audit filter side controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <ListFilter className="w-4 h-4" /> Filter Security Trail
              </h3>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Clinic Department</label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white focus:outline-none"
                  >
                    {depts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">RBAC User Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Action Category Filter</label>
                  <select
                    value={targetAction}
                    onChange={(e) => setTargetAction(e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white focus:outline-none"
                  >
                    {actions.map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 col-span-2">Free text Keyword search</label>
                  <input
                    type="text"
                    placeholder="e.g. Register, Vital, Invoice"
                    value={actionKeyword}
                    onChange={(e) => setActionKeyword(e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary card */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide block">Ledger statistics</span>
              <div className="flex justify-between font-mono">
                <span>TOTAL TRANSACTIONS:</span>
                <span className="font-semibold text-slate-800">{auditLogs.length}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>FILTER MATCHED:</span>
                <span className="font-semibold text-indigo-600">{filteredLogs.length}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            
            {/* Graphical Interface: Peak operations timeline Sparkline! */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Security Ledger Insertion Frequency trend</h4>
                <p className="text-[10px] text-slate-400">Chronological trend of operational audits registered across clinic departments (last 24-hours visualization)</p>
              </div>

              {/* Custom SVG line trend */}
              <div className="h-28 bg-slate-900 rounded-xl p-3 relative flex flex-col justify-end overflow-hidden">
                <div className="absolute top-3 left-4 flex gap-4 text-[9px] text-slate-400 font-mono">
                  <span>SECURE HASH: SHA3_512</span>
                  <span>CIPHER: CRYPTO-STELLAR GRD</span>
                </div>
                
                <svg className="w-full h-16 pointer-events-none overflow-visible" viewBox="0 0 600 65">
                  <defs>
                    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid gridlines */}
                  <line x1="0" y1="10" x2="600" y2="10" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="35" x2="600" y2="35" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Flow curve line */}
                  <path
                    d="M 10 50 Q 110 42 210 52 T 410 25 T 510 32 T 590 12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  
                  <path
                    d="M 10 50 Q 110 42 210 52 T 410 25 T 510 32 T 590 12 L 590 65 L 10 65 Z"
                    fill="url(#glowGrad)"
                  />
                  
                  <circle cx="590" cy="12" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                </svg>

                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800">
                  <span>Audit T-12h</span>
                  <span>Audit T-8h</span>
                  <span>Audit T-4h</span>
                  <span>Audit Realtime Feed</span>
                </div>
              </div>
            </div>

            {/* Audit Logs list ledger */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">HIPAA Compliant Security Audit Trails</h3>
                  <p className="text-xs text-slate-400">Unmodifiable list of hospital clinical record updates, patient registration, vitals logs and billing events.</p>
                </div>
                <span className="text-[9.5px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500 font-bold border border-slate-200">FEDERAL AUDIT REGISTRY v2</span>
              </div>

              <div className="space-y-3 text-xs max-h-[440px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="text-xs text-slate-400 py-12 text-center">No transactions match these filter parameters.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-lg flex items-start gap-3 transition-colors">
                      <div className="p-1 px-2 rounded bg-slate-900 text-emerald-400 font-mono text-[9px] uppercase font-bold shrink-0 mt-0.5">
                        {log.role}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Operator: <strong className="text-slate-600">{log.user}</strong> (Dept: {log.department})</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 leading-snug">
                          <strong className="text-teal-700 font-semibold">{log.action}:</strong> {log.details}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: SYSTEM DIAGNOSTICS & SANDBOX */}
      {activeSubTab === "diagnostics" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Cloud Sync & Manual Sync Section */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1.5 flex-1 w-full md:w-auto">
                <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase rounded-full">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" /> Cloud Sync Active
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Hospital Cloud Data Sync</h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Your hospital files are safely backed up in the secure cloud database automatically. If other doctors or staff made edits elsewhere, you can trigger a manual sync to merge all directories instantly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="text-left sm:text-right space-y-0.5">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 justify-start sm:justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Connected & Synced</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{lastSyncedTime}</p>
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`py-3.5 px-6 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer active:scale-95 ${
                    isSyncing
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-slate-400" : "text-white"}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                </button>
              </div>
            </div>

            {/* General Preferences Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-950 font-sans">Hospital Preference Settings</h4>
                <p className="text-xs text-slate-400">Configure parameters for automated workflows below.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {/* Preference 1 */}
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id="pref_autosave"
                    checked={autoSaveDischarge}
                    onChange={(e) => setAutoSaveDischarge(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="pref_autosave" className="space-y-1 block cursor-pointer">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Auto-Save Drafts on Patient Discharge</span>
                    <p className="text-[11px] text-slate-450 text-slate-500 leading-relaxed">
                      Saves billing history automatically into archives when any patient ward bed allocation is freed.
                    </p>
                  </label>
                </div>

                {/* Preference 2 */}
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id="pref_sms"
                    checked={enableSMSNotifications}
                    onChange={(e) => setEnableSMSNotifications(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="pref_sms" className="space-y-1 block cursor-pointer">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Enable Low Stock Security SMS Alerts</span>
                    <p className="text-[11px] text-slate-450 text-slate-500 leading-relaxed">
                      Sends an alert notice directly to supervisors when medicine inventory falls beneath safety stock levels.
                    </p>
                  </label>
                </div>

                {/* Preference 3 */}
                <div className="space-y-1.5 flex flex-col justify-start">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">Low Pharmacy Stock Warning Threshold</label>
                  <p className="text-[11px] text-slate-500 max-w-sm">Mark pharmacy drugs in red logs when storage stock levels fall below this count.</p>
                  <select
                    value={pharmacyThreshold}
                    onChange={(e) => setPharmacyThreshold(Number(e.target.value))}
                    className="w-full max-w-xs text-xs py-2 px-3 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-750"
                  >
                    <option value="5">5 items minimum warning limit</option>
                    <option value="10">10 items minimum warning limit (Recommended)</option>
                    <option value="20">20 items minimum warning limit</option>
                    <option value="50">50 items minimum warning limit</option>
                  </select>
                </div>

                {/* Preference 4 */}
                <div className="space-y-1.5 flex flex-col justify-start">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">Preferred System Currency Symbol</label>
                  <p className="text-[11px] text-slate-500 max-w-sm">Sets primary currency markers displayed inside invoices, payments, and estimates tabs.</p>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="w-full max-w-xs text-xs py-2 px-3 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-750"
                  >
                    <option value="₹ INR">₹ INR (Indian Rupee)</option>
                    <option value="$ USD">$ USD (United States Dollar)</option>
                    <option value="€ EUR">€ EUR (Euro Currency)</option>
                    <option value="£ GBP">£ GBP (British Pound Sterling)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Simplified Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-start text-left space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">Registered Patients</span>
              <span className="text-lg font-extrabold text-slate-900">{patients.length} Active Files</span>
              <p className="text-[11px] text-slate-500 leading-normal">Registered medical index profiles inside local repository</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-start text-left space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">Bed Allocations</span>
              <span className="text-lg font-extrabold text-slate-900">
                {beds.filter((b) => b.status === "Occupied").length} / {beds.length} occupied
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">Active beds in general wards and special cabins</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-start text-left space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">Low Stock Meds</span>
              <span className="text-lg font-extrabold text-red-600 border-none inline-block">
                {medicines.filter((m: any) => m.stockCount <= pharmacyThreshold).length} drug items
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">Medicine stock levels lower than safety warning limit ({pharmacyThreshold})</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-start text-left space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">Pending Bills</span>
              <span className="text-lg font-extrabold text-slate-900">
                {billing.filter((v: any) => v.status === "Unpaid").length} invoices
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">Invoices waiting to be settled by clinical clients</p>
            </div>
          </div>

          {/* Database Hard Factory Reset Container */}
          <div className="bg-white border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-700 flex items-center gap-1.5 font-sans">
                <ShieldAlert className="w-5 h-5 text-red-600" /> Start Over & Reload Demo Data
              </h4>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Want to clear your testing patients, medicines, and logs to start fresh? Reload the initial simple preloaded medical files catalog below.
              </p>
            </div>

            <button
               onClick={handleReset}
               className="bg-red-50 text-red-700 hover:bg-red-700 hover:text-white py-3 px-5 border border-red-200 rounded-xl text-xs font-bold shrink-0 text-center flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 cursor-pointer" /> Wipe and Reload Sample Data
            </button>
          </div>

        </div>
      )}

      {activeSubTab === "billing" && (
        <div className="space-y-6 text-slate-800">
          
          {/* Header Description */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="max-w-2xl text-left space-y-2">
              <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase">Hospital Tenancy Operations</span>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">MediFlow AI Workspace Subscription & Billing Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure your organization's subscription parameters, scale your clinicians capacity on-the-fly, fast-foward trials for verification, or checkout securely to unlock persistent multi-user licenses.
              </p>
            </div>
          </div>

          {/* Core Configuration States Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Status overview list (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Workspace Plan Overview</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                    adminIsPaid 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  }`}>
                    {adminIsPaid ? "🏆 Premium Subscription Active" : "⚡ 14-Day Free Trial Standby"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">Subscription Tier:</span>
                    <strong className="text-slate-900 block text-xs">{adminPaymentPlan || (adminIsPaid ? "Enterprise EHR" : "Free Trial Sandbox")}</strong>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">Workspace Tenants:</span>
                    <strong className="text-slate-900 block text-xs">Isolated Database Node</strong>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider">Remaining Cycle:</span>
                    <strong className="text-slate-900 block text-xs">
                      {adminIsPaid ? "Renews in 28 Days" : `${daysRemaining} Days remaining`}
                    </strong>
                  </div>

                </div>

                {/* Simulated 14-days Free Trial Slider Progress */}
                {!adminIsPaid && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                      <span className="flex items-center gap-1.5 font-mono uppercase tracking-wide text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Trial Progression Matrix: Day {elapsedDays + 1} of 14
                      </span>
                      <span>({daysRemaining} days left)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((14 - daysRemaining) / 14) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2 justify-between items-center text-[11px] leading-relaxed text-slate-500 pt-1.5">
                      <span>Fast-forwarding shifting dates into physical lockouts facilitates testing payment flows easily.</span>
                      
                      <button
                        onClick={async () => {
                          const conf = window.confirm("Shift HIMS registration timestamp back 15 days ago? This triggers auto redirection blockages.");
                          if (!conf) return;
                          
                          // Shift database timestamp back to test payment locking
                          const fifteenDaysAgo = new Date();
                          fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
                          const fifteenDaysAgoISO = fifteenDaysAgo.toISOString();
                          
                          try {
                            await setDoc(doc(db, "admins", adminUid), {
                              uid: adminUid,
                              email: currentUser.role === "Super Admin" ? "malviya.pratyush26@gmail.com" : "hospital-admin@mediflow.com",
                              name: currentUser.name,
                              role: "Hospital Admin",
                              createdAt: fifteenDaysAgoISO,
                              isPaid: false,
                              paymentPlan: "Free Trial (14-Days)"
                            });
                          } catch (err) {
                            console.warn("DB timestamp shifting error (handled):", err);
                          }

                          if (onSubscriptionChange) {
                            onSubscriptionChange(false, "Free Trial (14-Days)");
                          }
                          alert("Database adjusted: Systems adjusted to 15 days ago. Workspace locked on sandbox checkout terminal.");
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[9px] font-bold px-3 py-1.5 rounded hover:shadow transition-all uppercase whitespace-nowrap"
                        title="Shifts creation timestamp 15 days into past to test payment blocking redirections."
                      >
                        ⏩ Force Expire Trial
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel or Change active subscription simulation if paid */}
                {adminIsPaid && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono uppercase tracking-wide text-[10px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Paid Subscription Active
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      You have full system access permissions active today! You can scale your clinical capacity elements instantly, or click the button below to simulate standard subscription cancellation and test unpaid redirects.
                    </p>
                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 mt-2">
                      <button
                        onClick={async () => {
                          const conf = window.confirm("Are you sure you want to cancel the premium subscription simulation? This revokes paid status.");
                          if (!conf) return;
                          try {
                            await setDoc(doc(db, "admins", adminUid), {
                              uid: adminUid,
                              role: "Hospital Admin",
                              createdAt: adminCreatedAt || new Date().toISOString(),
                              isPaid: false,
                              paymentPlan: "Free Trial (14-Days)"
                            });
                            if (onSubscriptionChange) {
                              onSubscriptionChange(false, "Free Trial (14-Days)");
                            }
                            alert("Subscription cancelled. Workspace downgraded back to free trial.");
                          } catch (err) {
                            console.warn("Subscription downgrade error (handled):", err);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors uppercase cursor-pointer"
                      >
                        ✗ Downgrade Subscription (Cancel)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Interactive Parameter Sliders for live checkout calculations */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">In-App Live Subscription Quoting Tool</h4>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded leading-none uppercase">Parameters Slider</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Bed counts */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">A: Ward Occupancy Slots</span>
                      <span className="font-mono text-emerald-600 font-bold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {billingBeds} Beds Volume
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      step="5"
                      value={billingBeds}
                      onChange={(e) => setBillingBeds(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                    />
                    <div className="flex justify-between text-[8px] text-slate-450 font-mono uppercase">
                      <span>10 beds</span>
                      <span>500 beds</span>
                      <span>1,000 beds max</span>
                    </div>
                  </div>

                  {/* Clinicians staff seats */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">B: Registered Clinician Seals</span>
                      <span className="font-mono text-emerald-600 font-bold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {billingClinicians} Staff Seals
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="300" 
                      step="5"
                      value={billingClinicians}
                      onChange={(e) => setBillingClinicians(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                    />
                    <div className="flex justify-between text-[8px] text-slate-450 font-mono uppercase">
                      <span>5 spots</span>
                      <span>150 spots</span>
                      <span>300 spots max</span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  
                  <div 
                    onClick={() => setBillingGemini(!billingGemini)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors text-xs ${
                      billingGemini 
                        ? "bg-emerald-50/20 border-emerald-500/30" 
                        : "bg-slate-50/30 border-slate-150 hover:border-slate-200"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={billingGemini}
                      onChange={() => {}}
                      className="rounded text-emerald-600 mt-1 shrink-0 accent-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Deploy Google Gemini SBAR Diagnostics</span>
                      <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5">SOAP notes Summarization, vitals warning alerts (+ $150.00/mo)</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setBillingFHIR(!billingFHIR)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors text-xs ${
                      billingFHIR 
                        ? "bg-emerald-50/20 border-emerald-500/30" 
                        : "bg-slate-50/30 border-slate-150 hover:border-slate-200"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={billingFHIR}
                      onChange={() => {}}
                      className="rounded text-emerald-600 mt-1 shrink-0 accent-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Deploy HL7 and FHIR gateway pipeline</span>
                      <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5">Secure external Pathology LIMS and PACS routing (+ $99.00/mo)</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Historic Invoices Ledger container */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center pb-2.5">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">HIMS SaaS Invoices Registry</h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-600">Settle check: Consolidated</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[10px] font-mono uppercase">
                        <th className="p-2.5">Invoice ID</th>
                        <th className="p-2.5">Billing Date</th>
                        <th className="p-2.5">Provisioned Configuration</th>
                        <th className="p-2.5 text-right">Sum paid</th>
                        <th className="p-2.5 text-center">Receipts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      
                      {/* Row 1 */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-2.5 font-mono text-[11px] font-extrabold text-slate-800">INV-2026-SAAS-9621</td>
                        <td className="p-2.5">{new Date().toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"})}</td>
                        <td className="p-2.5 p-2 truncate max-w-[170px]">{adminPaymentPlan || "Multi-Ward EHR Core"} Deployment</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-950">${adminIsPaid ? "699.00" : "0.00 (Trial)"}</td>
                        <td className="p-2.5 text-center">
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceReceipt({
                                id: "INV-2026-SAAS-9621",
                                date: new Date().toLocaleDateString(),
                                plan: adminPaymentPlan || "Multi-Ward EHR Core",
                                amount: adminIsPaid ? 699.00 : 0.00,
                                isTrial: !adminIsPaid,
                                name: currentUser.name,
                                email: currentUser.role === "Super Admin" ? "malviya.pratyush26@gmail.com" : "hospital-admin@mediflow.com"
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                            title="Print / View Receipt"
                          >
                            <FileText className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-slate-50/60 transition-colors text-slate-450">
                        <td className="p-2.5 font-mono text-[11px]">INV-2026-SAAS-4011</td>
                        <td className="p-2.5">
                          {(() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 30);
                            return d.toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"});
                          })()}
                        </td>
                        <td className="p-2.5 truncate max-w-[170px]">HIMS Trial Registration Land</td>
                        <td className="p-2.5 text-right font-mono">$0.00</td>
                        <td className="p-2.5 text-center">
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceReceipt({
                                id: "INV-2026-SAAS-4011",
                                date: (() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() - 30);
                                  return d.toLocaleDateString();
                                })(),
                                plan: "14-Day Free Trial Standby",
                                amount: 0.00,
                                isTrial: true,
                                name: currentUser.name,
                                email: currentUser.role === "Super Admin" ? "malviya.pratyush26@gmail.com" : "hospital-admin@mediflow.com"
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                            title="Print / View Receipt"
                          >
                            <FileText className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

              </div>

            </div>

            {/* SECURE PAYMENT PORTLET MODULE (5 cols) */}
            <div className="lg:col-span-5 text-left flex flex-col justify-between">
              
              <div className="bg-slate-950 text-slate-200 border border-slate-900 rounded-3xl p-5 shadow-lg flex flex-col justify-between h-full space-y-4">
                
                <div className="space-y-3">
                  <div className="pb-2 hover:border-slate-900 border-b border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest font-black text-rose-450 text-emerald-400 block uppercase">Checkout Console</span>
                      <strong className="text-xs font-bold text-white block">Upgrade Clinical Subscription</strong>
                    </div>
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Pricing breakdown summary */}
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-2.5 font-mono text-[11px] text-slate-405 text-slate-400">
                    <div className="flex justify-between">
                      <span>Standard Base Fee:</span>
                      <span className="text-white">${billingPlan === "Outpatient" ? "249.00" : billingPlan === "Core" ? "699.00" : "1299.00"}/mo</span>
                    </div>

                    {billingBeds > 100 && (
                      <div className="flex justify-between">
                        <span>Extra capacity beds:</span>
                        <span className="text-white">${(Math.max(0, billingBeds - 100) * 1.5).toFixed(2)}/mo</span>
                      </div>
                    )}

                    {billingClinicians > 20 && (
                      <div className="flex justify-between">
                        <span>Extra clinicians seals:</span>
                        <span className="text-white">${(Math.max(0, billingClinicians - 20) * 5).toFixed(2)}/mo</span>
                      </div>
                    )}

                    {billingGemini && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Gemini SBAR AI Engine:</span>
                        <span>$150.00/mo</span>
                      </div>
                    )}

                    {billingFHIR && (
                      <div className="flex justify-between">
                        <span>HL7 / FHIR EMR sync:</span>
                        <span className="text-white">$99.00/mo</span>
                      </div>
                    )}

                    {billingCycle === "annual" && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Annual Savings (-20%):</span>
                        <span>-20% Applied</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-2 border-t border-slate-800 text-xs font-bold text-white flex justify-between items-center">
                      <span>ESTIMATED DOCK PRICE:</span>
                      <span className="text-emerald-405 text-emerald-450 text-emerald-400 text-sm">
                        ${(() => {
                          const base = billingPlan === "Outpatient" ? 249 : billingPlan === "Core" ? 699 : 1299;
                          const bedsCost = Math.max(0, billingBeds - 100) * 1.5;
                          const staffCost = Math.max(0, billingClinicians - 20) * 5;
                          const ai = billingGemini ? 150 : 0;
                          const fhir = billingFHIR ? 99 : 0;
                          let running = base + bedsCost + staffCost + ai + fhir;
                          if (billingCycle === "annual") running *= 0.8;
                          return running.toFixed(2);
                        })()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Pricing Plan Selector Toggle */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono tracking-wide text-slate-400 uppercase">Select Subscriptions Tier</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl text-center">
                      {["Outpatient", "Core", "Enterprise"].map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setBillingPlan(plan)}
                          className={`py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                            billingPlan === plan ? "bg-slate-800 text-white" : "text-slate-450 text-slate-400 hover:text-white"
                          }`}
                        >
                          {plan}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing cycle toggle */}
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono tracking-wide text-slate-400 uppercase">Billing recurrence cycle</label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl text-center">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          billingCycle === "monthly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Billed Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("annual")}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          billingCycle === "annual" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>Annual (-20%)</span>
                      </button>
                    </div>
                  </div>

                  {/* Visa simulated autofills */}
                  <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-slate-400">Card Sandbox:</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button"
                        onClick={() => { setCheckoutCard("4242 4242 4242 4242"); setCheckoutCVC("899"); }}
                        className="bg-emerald-950/40 text-emerald-450 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-900/50 hover:bg-emerald-900/60 cursor-pointer"
                      >
                        Visa Success
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setCheckoutCard("4002 0140 0000 9999"); setCheckoutCVC("202"); }}
                        className="bg-red-950/20 text-red-400 px-2 py-0.5 rounded font-bold border border-red-900/45 hover:bg-red-900/50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  {/* Checkout parameters options inputs */}
                  <div className="space-y-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="Credit Card security number"
                      value={checkoutCard}
                      onChange={(e) => setCheckoutCard(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 p-2 rounded-xl text-center font-mono outline-none text-white text-xs focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="12/29 Expiry" 
                        value={checkoutExpiry}
                        onChange={(e) => setCheckoutExpiry(e.target.value)}
                        className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-center font-mono outline-none text-white text-xs text-center"
                      />
                      <input 
                        type="password" 
                        placeholder="Security CVV" 
                        maxLength={4}
                        value={checkoutCVC}
                        onChange={(e) => setCheckoutCVC(e.target.value)}
                        className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-center font-mono outline-none text-white text-xs text-center"
                      />
                    </div>
                  </div>

                </div>

                {/* Submitting button */}
                <div className="pt-2">
                  
                  {checkoutError && (
                    <div className="p-2 border border-red-900/50 bg-red-950/30 text-rose-400 rounded-lg text-[10px] items-start gap-1 flex leading-relaxed mb-2 uppercase">
                      <span>✗ {checkoutError}</span>
                    </div>
                  )}

                  {isCheckoutProcessing ? (
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1 font-mono text-[9px] leading-relaxed uppercase text-left">
                      <div className="flex gap-2 items-center text-white">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Verifying credit token hashes...</span>
                      </div>
                    </div>
                  ) : checkoutSuccess ? (
                    <div className="bg-emerald-500 text-slate-950 font-bold p-3 rounded-xl block text-center font-mono text-[11px] leading-none">
                      ✓ Workspace Lease Activated
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        setIsCheckoutProcessing(true);
                        setCheckoutError(null);
                        await new Promise(res => setTimeout(res, 1200));
                        
                        try {
                          if (checkoutCard.replaceAll(" ", "") === "4002014000009999") {
                            throw new Error("Transacting Refused: Insufficient credit limit allocation in selected checkout budget.");
                          }

                          // Save to expired trials and update admins
                          const finalPlanName = `${billingPlan} (${billingCycle === "annual" ? "Annual" : "Monthly"})`;
                          try {
                            await setDoc(doc(db, "admins", adminUid), {
                              uid: adminUid,
                              role: "Hospital Admin",
                              createdAt: adminCreatedAt || new Date().toISOString(),
                              isPaid: true,
                              paymentPlan: finalPlanName,
                              bedsCountAllocated: billingBeds,
                              cliniciansCountAllocated: billingClinicians,
                              deployGeminiAI: billingGemini,
                              deployHL7FHIR: billingFHIR
                            });
                          } catch (err) {
                            console.warn("DB subscription checking exception:", err);
                          }

                          setCheckoutSuccess(true);
                          if (onSubscriptionChange) {
                            onSubscriptionChange(true, finalPlanName);
                          }
                          setTimeout(() => {
                            setCheckoutSuccess(false);
                          }, 2000);

                        } catch (err: any) {
                          setCheckoutError(err.message || "Card processed failure. Please check inputs.");
                        } finally {
                          setIsCheckoutProcessing(false);
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wide text-xs py-3 rounded-xl transition-all shadow active:scale-95 text-center cursor-pointer"
                    >
                      Process SaaS Subscription
                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* SIMULATED RECEIPT PDF POPUP PORTAL OVERLAY */}
          {selectedInvoiceReceipt && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
              <div className="bg-white border rounded-3xl p-6 max-w-xl w-full text-slate-800 space-y-5 shadow-2xl relative text-left">
                
                {/* Close modal */}
                <button 
                  onClick={() => setSelectedInvoiceReceipt(null)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-full border border-slate-150 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center pb-2 border-b border-slate-100 space-y-1">
                  <div className="inline-flex p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Hospital Workspace License Receipt</h4>
                  <span className="font-mono text-[9px] text-slate-500 uppercase">ISO-27001 SECURED DISPATCH</span>
                </div>

                <div className="bg-slate-50 p-4.5 rounded-2xl border space-y-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-205 pb-2.5">
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase block font-semibold">TRIAL CLIENT IDENTITY:</span>
                      <strong className="text-slate-800 block">{selectedInvoiceReceipt.name}</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{selectedInvoiceReceipt.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-450 uppercase block font-semibold">VOUCHER INVOICE NO:</span>
                      <strong className="text-emerald-600 block">{selectedInvoiceReceipt.id}</strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{selectedInvoiceReceipt.date}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold border-b pb-1.5">
                      <span>PLAN PARAMETER DETAILS</span>
                      <span>SUM STATUS</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{selectedInvoiceReceipt.plan} Core Deployment Lease</span>
                      <span>${selectedInvoiceReceipt.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>+ Active HIMS Workspace Client Databases Sync</span>
                      <span>INCLUDED</span>
                    </div>
                    {selectedInvoiceReceipt.isTrial && (
                      <div className="flex justify-between text-amber-600 font-bold">
                        <span>• Zero Initial Activation Sandbox Fee</span>
                        <span>-$0.00</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 border-t pt-2 text-sm">
                      <span>TOTAL BILLED TRANSACTION:</span>
                      <span>${selectedInvoiceReceipt.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 p-2 rounded text-[10px] text-slate-500 text-center leading-relaxed">
                    SaaS subscription charges accrue in automated recurring cycles every 30 days. No manual billing disputes pending.
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer text-center"
                  >
                    Print Voucher / Receipt
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceReceipt(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer text-center"
                  >
                    Dismiss View
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {activeSubTab === "profile" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-205 px-2.5 py-1 rounded font-bold uppercase tracking-wider">Hospital Branding Suite</span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Facility Identity & Invoice Header Config</h3>
              <p className="text-xs text-slate-500 max-w-2xl leading-normal">
                Manage your hospital's public profile, email records, and corporate branding. The selected logo and header details will reflect dynamically on every consultation prescription, pathology laboratory sheet, and patient checkout invoice automatically.
              </p>
            </div>

            {profileAlert && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{profileAlert}</span>
                </div>
                <button 
                  onClick={() => setProfileAlert("")}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Entry Column */}
              <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Hospital Legal Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 font-semibold"
                      placeholder="e.g. Wellness General Hospital"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Corporate Motto / Tagline</label>
                    <input
                      type="text"
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                      placeholder="e.g. Caring with absolute precision"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Public Contact Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 font-mono"
                      placeholder="+91 99999 88888"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Administrative Email</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 font-mono"
                      placeholder="billing@wellness.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Tax/GSTIN Registration Number</label>
                    <input
                      type="text"
                      value={profileTax}
                      onChange={(e) => setProfileTax(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 font-mono"
                      placeholder="GSTIN-27AAHCM1029C1Z5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Health Board Accreditation</label>
                    <input
                      type="text"
                      value={profileAccreditation}
                      onChange={(e) => setProfileAccreditation(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                      placeholder="NABH Certified / JCI Gold Seal"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-500">Full Postal Address</label>
                  <textarea
                    rows={2}
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                    placeholder="704, Wellness Boulevard, Sector 15, HIMS Square, Mumbai, 400051"
                  />
                </div>

                {/* Logo Selection Section */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Hospital Logo Branding</label>
                    <span className="text-[10px] text-slate-450 block">Select a pre-designed premium healthcare badge or upload your own file.</span>
                  </div>

                  {/* Built-in Medical Icon Badges presets */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "red_cross", name: "Red Cross Shield", color: "text-red-650 bg-red-50 border-red-200", render: () => (
                        <div className="w-5 h-5 flex items-center justify-center bg-red-600 text-white rounded font-black text-xs leading-none">+</div>
                      )},
                      { id: "emerald_leaf", name: "Emerald Bio Leaf", color: "text-emerald-700 bg-emerald-50 border-emerald-250", render: () => (
                        <div className="w-5 h-5 flex items-center justify-center bg-emerald-650 text-white rounded-full font-bold text-[10px]">☘</div>
                      )},
                      { id: "blue_heart", name: "Care Heart", color: "text-sky-700 bg-sky-50 border-sky-200", render: () => (
                        <div className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white rounded font-bold text-[9px]">♥</div>
                      )},
                      { id: "preset:default_cross", name: "Golden Caduceus", color: "text-amber-800 bg-amber-50 border-amber-200", render: () => (
                        <div className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded font-bold text-[9px]">🏥</div>
                      )}
                    ].map((p) => {
                      const isSelected = profileLogoUrl === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProfileLogoUrl(p.id)}
                          className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-500" 
                              : "bg-white text-slate-650 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {p.render()}
                          <span className="text-[9px] font-semibold break-all leading-snug">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual File Base64 Uploader */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Or upload custom image:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 500 * 1024) {
                            alert("Logo limit exceeded. Please upload an image under 500KB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setProfileLogoUrl(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateHospitalProfile({
                        name: profileName,
                        tagline: profileTagline,
                        phone: profilePhone,
                        email: profileEmail,
                        address: profileAddress,
                        logoUrl: profileLogoUrl,
                        taxNumber: profileTax,
                        accreditation: profileAccreditation
                      });
                      setProfileAlert("Branding metrics successfully updated and synchronized across all healthcare departments.");
                      setTimeout(() => setProfileAlert(""), 4000);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer text-center"
                  >
                    Save & Secure Corporate Identity
                  </button>
                </div>
              </div>

              {/* Dynamic Live Document Header Mockup Column */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between relative shadow-inner">
                <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 font-bold bg-white px-2 py-0.5 rounded border border-slate-100">
                  REAL-TIME DOCUMENT HEADER PREVIEW
                </div>

                <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4 flex-1">
                  
                  {/* Simulated Official Document Letterhead Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-950 pb-4">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                        {profileLogoUrl === "red_cross" ? (
                          <div className="w-6 h-6 bg-red-650 text-white flex items-center justify-center rounded font-extrabold text-sm">+</div>
                        ) : profileLogoUrl === "emerald_leaf" ? (
                          <div className="text-emerald-700 font-black text-xl">☘</div>
                        ) : profileLogoUrl === "blue_heart" ? (
                          <div className="text-sky-505 font-black text-xl text-indigo-650">♥</div>
                        ) : profileLogoUrl && profileLogoUrl.startsWith("data:") ? (
                          <img src={profileLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-xl">🏥</div>
                        )}
                      </div>
                      
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-950 font-sans tracking-tight">{profileName || "MediFlow City General Hospital"}</h4>
                        <p className="text-[10px] text-slate-550 font-medium italic -mt-0.5">{profileTagline || "Secured Closed-Loop Inpatient Healthcare Services"}</p>
                      </div>
                    </div>

                    <div className="text-right text-[9px] text-slate-500 font-mono space-y-0.5 max-w-[170px]">
                      <div className="font-semibold text-slate-800">DOCUMENT ORIGIN</div>
                      <div>{profilePhone || "+91 98765 43210"}</div>
                      <div>{profileEmail || "admin@mediflow-hospital.com"}</div>
                    </div>
                  </div>

                  {/* Simulated Body Content */}
                  <div className="space-y-3 pt-2 text-left">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-mono">PATIENT IDENTIFIER</span>
                        <span className="text-xs font-bold text-slate-800">MALVIYA PRATYUSH (Age: 26)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-mono">RECEIPT ID / DATA</span>
                        <span className="text-xs font-semibold text-slate-700 font-mono">INV-2026-00438</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs border-b border-dashed border-slate-200 pb-1 text-slate-500 font-mono">
                        <span>OPD Consulation (Dr. Kumar)</span>
                        <span>$150.00</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-dashed border-slate-200 pb-1 text-slate-550 font-mono">
                        <span>Laboratory CBC Pathology Panel</span>
                        <span>$85.00</span>
                      </div>
                      <div className="flex justify-between text-xs pb-1 font-mono text-slate-900 font-bold">
                        <span>Institutional Grand Total:</span>
                        <span>$235.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Official Footer */}
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[8.5px] text-slate-400 font-mono mt-8">
                    <div className="space-y-0.5 text-left max-w-[200px]">
                      <div>{profileAddress || "704, Wellness Boulevard, Sector 15, HIMS Square, Mumbai, 400051"}</div>
                      {profileTax && <div className="font-semibold text-slate-600">Tax ID: {profileTax}</div>}
                    </div>
                    <div className="text-right max-w-[120px]">
                      <div className="text-indigo-650 font-bold font-sans">{profileAccreditation || "NABH ACCREDITED"}</div>
                      <div className="font-semibold text-slate-500 uppercase tracking-widest mt-1">OFFICIAL SEAL</div>
                    </div>
                  </div>

                </div>

                <div className="text-[10px] text-slate-400 font-mono italic leading-normal text-center mt-3">
                  Check out how your updated corporate logo renders with crystal clarity on invoices, lab receipts and medication prescriptions instantly.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "landing" && currentUser?.role === "Super Admin" && (
        <div className="space-y-6">
          {/* CMS Success Alert Notification Box */}
          {cmsAlert && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-medium">{cmsAlert}</span>
              </div>
              <button 
                onClick={() => setCmsAlert(null)} 
                className="text-slate-400 hover:text-slate-705 bg-white hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200 transition-all font-mono text-[9px] font-bold"
              >
                DISMISS
              </button>
            </div>
          )}

          {/* Intro description card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-505/20 text-emerald-300 border border-emerald-500/30 font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> CMS Database Gateway Connected
              </div>
              <h2 className="text-2xl font-bold tracking-tight">SaaS Dynamic Landing Page Customizer</h2>
              <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                Execute design changes instantly. Choose primary color palettes, override site-wide font families, rewrite patient care pain points carousels, and manage core feature spotlight modules dynamically. Changes auto-propagate to SaaS view!
              </p>
            </div>
            <div className="absolute right-0 bottom-0 top-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent w-96 pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Identity & Theme Customization (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* BRANDING PANEL */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Palette className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-sm text-slate-800">Visual Brand & Identity</h3>
                </div>

                {/* Typography Select */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600">Site Typography System</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Space Grotesk", label: "Tech Grotesk" },
                      { id: "Inter", label: "Modern Sans" },
                      { id: "Playfair Display", label: "Classic Serif" },
                      { id: "JetBrains Mono", label: "Mono Accent" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id as any)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          fontFamily === f.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-[11px] font-bold">{f.label}</div>
                        <div className="text-[9px] opacity-75 truncate" style={{ fontFamily: f.id }}>
                          HIMS Telemetry
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Colors Select */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600">Primary Accent Palette</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                      { id: "indigo", label: "Indigo", color: "bg-indigo-500" },
                      { id: "teal", label: "Teal", color: "bg-teal-500" },
                      { id: "blue", label: "Blue", color: "bg-blue-500" },
                      { id: "violet", label: "Violet", color: "bg-violet-500" },
                      { id: "rose", label: "Rose", color: "bg-rose-500" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPrimaryColor(c.id as any)}
                        className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          primaryColor === c.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                        <span className="text-[10px]">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600">Default Outer Canvas</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "light", label: "White", bg: "bg-white border-slate-300" },
                      { id: "slate", label: "Slate", bg: "bg-slate-50 border-slate-200" },
                      { id: "stone", label: "Stone", bg: "bg-stone-50 border-stone-200" },
                      { id: "zinc", label: "Zinc", bg: "bg-zinc-50 border-zinc-200" }
                    ].map((bgPreset) => (
                      <button
                        key={bgPreset.id}
                        type="button"
                        onClick={() => setBackgroundColorMode(bgPreset.id as any)}
                        className={`p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          backgroundColorMode === bgPreset.id
                            ? "border-slate-800 bg-slate-100 ring-2 ring-slate-800/10"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-md border ${bgPreset.bg}`} />
                        <span className="text-[9px] font-semibold mt-1 text-slate-600">{bgPreset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveBrand}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Style Blueprint
                  </button>
                </div>
              </div>

              {/* IMAGE ASSETS LIBRARY PRESETS */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-sm text-slate-800">Hospital Image Presets</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Click copy to clipboard on any clinical photo to use it inside your custom cards:
                </p>
                <div className="space-y-2">
                  {[
                    { title: "Smart Nurse Ward Handoff", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
                    { title: "Doctor Consultation Room", url: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=800&q=80" },
                    { title: "Clinical Ward Beds Map", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80" },
                    { title: "HIMS Pharmaceutical Storage", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80" },
                    { title: "AES Secure Server Room", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" }
                  ].map((img, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50 border border-slate-150">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700 truncate">{img.title}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.url);
                            setCmsAlert(`Copied URL for "${img.title}"`);
                          }}
                          className="text-[9px] text-blue-600 hover:text-blue-800 font-mono underline"
                        >
                          COPY LINK
                        </button>
                      </div>
                      <span className="text-[8px] text-slate-400 select-all truncate bg-white p-1 rounded border border-slate-100 font-mono">
                        {img.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Section Copy & Slide CRUD (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* HERO & HEADER SETTINGS PANEL */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-sm text-slate-800">Landing Page Hero & CTA Headers</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    LIVE PREVIEWABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Announcement Bar */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Announcement Top Ticker Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                    />
                  </div>

                  {/* Header parts */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Hero Main Title (Part 1 - Pain Killer)</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850 font-semibold"
                      value={heroHeaderPart1}
                      onChange={(e) => setHeroHeaderPart1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Hero Main Title (Part 2 - Security Focus)</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850 font-semibold"
                      value={heroHeaderPart2}
                      onChange={(e) => setHeroHeaderPart2(e.target.value)}
                    />
                  </div>

                  {/* Subheadline description */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Hero Subheadline Text Block</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850 leading-relaxed"
                      value={heroSubheadline}
                      onChange={(e) => setHeroSubheadline(e.target.value)}
                    />
                  </div>

                  {/* Primary & Secondary button CTA texts */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Launcher Button Left CTA Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850"
                      value={heroButtonLeftText}
                      onChange={(e) => setHeroButtonLeftText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Guided Demo Button Right CTA Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850"
                      value={heroButtonRightText}
                      onChange={(e) => setHeroButtonRightText(e.target.value)}
                    />
                  </div>

                  {/* Hero Artwork Image URL */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Hero Image Banner Artwork URL</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850 font-mono"
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">Main Banner Preview:</span>
                      {heroImage && (
                        <img 
                          src={heroImage} 
                          alt="Hero artwork preview" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-10 object-cover rounded-md border border-slate-200 shadow-xs" 
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveHero}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Save Hero Headlines
                  </button>
                </div>
              </div>

              {/* PAIN POINTS CAROUSEL MANAGER (CRUD: Add, Edit, Update, Delete) */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-sm text-slate-800">Hospital Pain Points Carousel Editor</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSlideId(null);
                      setSlideTitle("");
                      setSlideCategory("");
                      setSlideProblemBadge("");
                      setSlideProblemTitle("");
                      setSlideProblemDesc("");
                      setSlideProblemImage("");
                      setSlideSolutionBadge("");
                      setSlideSolutionTitle("");
                      setSlideSolutionDesc("");
                      setSlideSolutionImage("");
                      setSlideMetricValue("");
                      setSlideMetricLabel("");
                      setSlideBullet1("");
                      setSlideBullet2("");
                      setSlideBullet3("");
                      setShowAddSlidePanel(!showAddSlidePanel);
                    }}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-1.5 px-3.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {showAddSlidePanel ? "Cancel Form" : <><Plus className="w-3.5 h-3.5" /> Deploy Custom Slide</>}
                  </button>
                </div>

                {/* SLIDE DEPLOYMENT FORM */}
                {showAddSlidePanel && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                        {editingSlideId ? `Editing Slide (System ID: ${editingSlideId})` : "Configure Brand New Hospital Pain Point Slide"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Slide Button Navigation Label</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          value={slideTitle}
                          onChange={(e) => setSlideTitle(e.target.value)}
                          placeholder="e.g., Clinician Burnout & Paper Scribbles"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Domain Category (Uppercase Badge)</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          value={slideCategory}
                          onChange={(e) => setSlideCategory(e.target.value)}
                          placeholder="e.g., RETENTION & CAPACITY PLANNERS"
                        />
                      </div>

                      {/* Problem details */}
                      <div className="space-y-2.5 p-3 rounded bg-red-52/50 border border-red-100 bg-red-50/50">
                        <div className="text-[10px] font-bold text-red-700 uppercase">1. Hospital Deficit (Problem Area)</div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Problem Alert Status Badge</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-800"
                            value={slideProblemBadge}
                            onChange={(e) => setSlideProblemBadge(e.target.value)}
                            placeholder="e.g., 🔴 PREVALENT CRISIS: DIZZY HANDOFFS"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Problem Big Title</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-800"
                            value={slideProblemTitle}
                            onChange={(e) => setSlideProblemTitle(e.target.value)}
                            placeholder="e.g., Nurses spend over 4 hours shift handover logs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Problem Detailed Paragraph Description</label>
                          <textarea
                            rows={2}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-00"
                            value={slideProblemDesc}
                            onChange={(e) => setSlideProblemDesc(e.target.value)}
                            placeholder="e.g., Rushed scribbles get lost. Shifts overlap with spoken logs."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Problem Photo Banner URL</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-mono text-slate-800"
                            value={slideProblemImage}
                            onChange={(e) => setSlideProblemImage(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Solution details */}
                      <div className="space-y-2.5 p-3 rounded bg-emerald-52/50 border border-emerald-100 bg-emerald-50/50">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">2. EHR Remedy (EHR Action)</div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Solution Success Status Badge</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-800"
                            value={slideSolutionBadge}
                            onChange={(e) => setSlideSolutionBadge(e.target.value)}
                            placeholder="e.g., 🟢 THE AID: AUTOMATED CLINICAL SBAR SUMMARY"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Solution Big Title</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-800"
                            value={slideSolutionTitle}
                            onChange={(e) => setSlideSolutionTitle(e.target.value)}
                            placeholder="e.g., Generate complete standardized SBAR summaries instantly"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Solution Detailed Paragraph Description</label>
                          <textarea
                            rows={2}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-800"
                            value={slideSolutionDesc}
                            onChange={(e) => setSlideSolutionDesc(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Solution Photo Banner URL</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-mono text-slate-800"
                            value={slideSolutionImage}
                            onChange={(e) => setSlideSolutionImage(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Key Metrics and Bullet Points */}
                      <div className="md:col-span-2 space-y-3 p-3 rounded bg-blue-50/30 border border-blue-100">
                        <div className="text-[10px] font-bold text-blue-700 uppercase">3. High Impact Diagnostics & Remedies</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Metric Highlight Value (Big Text)</label>
                            <input
                              type="text"
                              className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-bold"
                              value={slideMetricValue}
                              onChange={(e) => setSlideMetricValue(e.target.value)}
                              placeholder="e.g., 98.4% or +18%"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Metric Description Label</label>
                            <input
                              type="text"
                              className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                              value={slideMetricLabel}
                              onChange={(e) => setSlideMetricLabel(e.target.value)}
                              placeholder="e.g., Transcription Error Reduction"
                            />
                          </div>
                        </div>

                        {/* Remedy bullets */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-600 block">Verification Bullet Remedies (Max 3)</label>
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                            value={slideBullet1}
                            onChange={(e) => setSlideBullet1(e.target.value)}
                            placeholder="Bullet 1"
                          />
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                            value={slideBullet2}
                            onChange={(e) => setSlideBullet2(e.target.value)}
                            placeholder="Bullet 2"
                          />
                          <input
                            type="text"
                            className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                            value={slideBullet3}
                            onChange={(e) => setSlideBullet3(e.target.value)}
                            placeholder="Bullet 3"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="pt-2 flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddSlidePanel(false)}
                        className="bg-white hover:bg-slate-105 text-slate-600 py-1.5 px-3 rounded-lg border border-slate-200 font-semibold"
                      >
                        Abandon
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateOrUpdateSlide}
                        className="bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {editingSlideId ? "Update Slide" : "Load Slide"}
                      </button>
                    </div>
                  </div>
                )}

                {/* CURRENT SLIDES DIRECTORY */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Active Carousel Deck</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(landingPageConfig.painPointsSlides || []).map((slide, sIdx) => {
                      return (
                        <div key={slide.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                                SLIDE #{sIdx + 1}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-505 text-indigo-500">
                                {slide.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-850 truncate">{slide.title}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{slide.problemTitle}</p>
                            <div className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded inline-flex font-bold">
                              {slide.metricValue} — {slide.metricLabel}
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                            <button
                              onClick={() => handleEditSlideClick(slide)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlideClick(slide.id, slide.title)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SPOTLIGHT MODULE SUMMARY DETAILS (CRUD: Add, Edit, Update, Delete) */}
              <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-sm text-slate-800">Spotlight Clinical Module Summaries</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFeatureId(null);
                      setFeatTitle("");
                      setFeatBadge("");
                      setFeatDesc("");
                      setFeatImageUrl("");
                      setFeatPoint1("");
                      setFeatPoint2("");
                      setFeatPoint3("");
                      setShowAddFeaturePanel(!showAddFeaturePanel);
                    }}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-1.5 px-3.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {showAddFeaturePanel ? "Cancel Form" : <><Plus className="w-3.5 h-3.5" /> Deploy Custom Feature</>}
                  </button>
                </div>

                {/* FEATURE DEPLOYMENT FORM */}
                {showAddFeaturePanel && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                        {editingFeatureId ? `Editing Spotlight (System ID: ${editingFeatureId})` : "Configure Brand New Clinical Module Summary"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Feature Highlight/Module Title</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          value={featTitle}
                          onChange={(e) => setFeatTitle(e.target.value)}
                          placeholder="e.g., Closed-Loop Pharmacy Depot Sync"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Spotlight Category Badge</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          value={featBadge}
                          onChange={(e) => setFeatBadge(e.target.value)}
                          placeholder="e.g., HIPAA SECURED AT CORE"
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Brief Feature Narrative Summary</label>
                        <textarea
                          rows={2}
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          value={featDesc}
                          onChange={(e) => setFeatDesc(e.target.value)}
                          placeholder="e.g., Keep dosage trails verified and prevent drug pilferage securely."
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-605 text-slate-600">Clinical Module Artwork URL</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-mono text-slate-800"
                          value={featImageUrl}
                          onChange={(e) => setFeatImageUrl(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 p-3 bg-slate-100 rounded border border-slate-200 space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 block">Custom Dynamic Bullet Achievements (Max 3)</label>
                        <input
                          type="text"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                          value={featPoint1}
                          onChange={(e) => setFeatPoint1(e.target.value)}
                          placeholder="Bullet 1: e.g. Smart Form Guide: Speeds up diagnostic SOAP drafting."
                        />
                        <input
                          type="text"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                          value={featPoint2}
                          onChange={(e) => setFeatPoint2(e.target.value)}
                          placeholder="Bullet 2"
                        />
                        <input
                          type="text"
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                          value={featPoint3}
                          onChange={(e) => setFeatPoint3(e.target.value)}
                          placeholder="Bullet 3"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setShowAddFeaturePanel(false)}
                        className="bg-white hover:bg-slate-105 text-slate-600 py-1.5 px-3 rounded-lg border border-slate-200"
                      >
                        Abandon
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateOrUpdateFeature}
                        className="bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {editingFeatureId ? "Update Spotlight" : "Load Spotlight"}
                      </button>
                    </div>
                  </div>
                )}

                {/* FEATURE LIST DIRECTORY */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Active Spotlight Features</div>
                  <div className="space-y-3">
                    {(landingPageConfig.featuresList || []).map((feat, fIdx) => (
                      <div key={feat.id} className="p-4 border border-slate-150 rounded-xl bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 text-left w-full min-w-0">
                          {feat.imageUrl && (
                            <img 
                              src={feat.imageUrl} 
                              alt={feat.title} 
                              referrerPolicy="no-referrer"
                              className="w-20 h-16 object-cover rounded-lg border border-slate-100 shrink-0 shadow-xs" 
                            />
                          )}
                          <div className="space-y-1.5 min-w-0 truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">#{fIdx + 1}</span>
                              <span className="text-[9px] uppercase font-mono font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md truncate">{feat.badge}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-850 truncate">{feat.title}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{feat.desc}</p>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-150 justify-between items-center text-xs font-bold">
                          <button
                            onClick={() => handleEditFeatureClick(feat)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Copy
                          </button>
                          <button
                            onClick={() => handleDeleteFeatureClick(feat.id, feat.title)}
                            className="text-red-650 hover:text-red-800 flex items-center gap-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Purge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
