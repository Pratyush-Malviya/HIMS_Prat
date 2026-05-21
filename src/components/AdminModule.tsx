import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  RefreshCw,
  Key,
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
  Image as ImageIcon
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
}

export function AdminModule({
  store,
  currentUser,
  setCurrentUser,
  activeSubTab = "directory",
  setActiveSubTab
}: AdminModuleProps) {
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
    removeCustomRole
  } = store;

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

  const [cmsAlert, setCmsAlert] = useState<string | null>(null);

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
        role: newEmpRole,
        department: newEmpDept,
        permittedModules: newEmpPerms
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
      alert(`Failed to onboard employee: ${err.message || err}`);
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
            { id: "directory", label: "Staff & Onboarding", icon: Users, desc: "Personnel records & RBAC keys" },
            { id: "roles", label: "Custom Role Architect", icon: UserCog, desc: "Modular privileges planner" },
            { id: "logs", label: "Security Audit Trails", icon: ShieldCheck, desc: "Chronological HIPAA log ledger" },
            { id: "diagnostics", label: "System Diagnostics", icon: Cpu, desc: "EHR Collections telemetry & gauges" },
            { id: "landing", label: "Landing Page Editor (CMS)", icon: Sparkles, desc: "Manage SaaS styles, texts & images" }
          ].map((tab) => {
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
          
          {/* Graphical Interface: Diagnostic Gauges & Telemetry Round Metrics! */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Container DB Latency</span>
              
              {/* Custom SVG ring gauge */}
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={25} />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-slate-850">12ms</span>
              </div>
              <span className="text-[9.5px] text-emerald-600 font-semibold uppercase leading-none">Optimal speed</span>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">CPU Threads Buffer</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#6366f1" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={145} />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-slate-850">18.5%</span>
              </div>
              <span className="text-[9.5px] text-indigo-600 font-semibold uppercase leading-none">Cooling: Standard</span>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Secure OAuth Tokens</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#f59e0b" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={120} />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-slate-850">5 Live</span>
              </div>
              <span className="text-[9.5px] text-amber-600 font-semibold uppercase leading-none">Cert: SHA-256 SSL</span>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">FHIR Compliance Level</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#ec4899" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={0} />
                </svg>
                <span className="absolute text-xs font-bold font-mono text-pink-600">FHIR R4</span>
              </div>
              <span className="text-[9.5px] text-pink-500 font-semibold uppercase leading-none">Interoperable</span>
            </div>
          </div>

          {/* Super Admin Panel card overview */}
          <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-md border border-slate-850">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-505/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">Simulated Database Engine</h3>
                  <span className="text-sm font-semibold">Active Firestore Collections Telemetry</span>
                </div>
              </div>
              <span className="text-[9.5px] bg-slate-950 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300 font-mono uppercase font-bold">
                ROOT_SYS_SECURE
              </span>
            </div>

            {/* Simulated Live Database collections sizes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-mono">
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-[10px] text-slate-400 block mb-1">UHID PATIENTS</span>
                <span className="text-lg font-bold text-slate-200">{patients.length} records</span>
              </div>
              
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-[10px] text-slate-400 block mb-1">IPD BED UNITS</span>
                <span className="text-lg font-bold text-slate-200">{beds.filter(b => b.status === "Occupied").length}/{beds.length} occupied</span>
              </div>
              
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-[10px] text-slate-400 block mb-1">SAFETY MEDS STOCK</span>
                <span className="text-lg font-bold text-red-300">{medicines.filter((m) => m.stockCount <= m.safetyStock).length} low items</span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-[10px] text-slate-400 block mb-1">PENDING EXPENSES</span>
                <span className="text-lg font-bold text-amber-300">{billing.filter((v) => v.status === "Unpaid").length} invoices</span>
              </div>
            </div>
          </div>

          {/* Ledger Action Simulator & Restores */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5Col">
                <Wrench className="w-4 h-4 text-emerald-500" />
                Dev-Sim Security Sandbox: Attack block & ledger simulations
              </h3>
              <p className="text-xs text-slate-400">Model real-world clinical security ledger events and inject them directly into the chronological HIPAA complaints log matrix to test alerting and traceability.</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() =>
                  triggerSimulationLog(
                    "HIPAA Breach Shield Active",
                    `Security Shield blocked simulated SSH trace attempt on port 8022 from IP 21.139.11.${Math.floor(Math.random() * 254)}`
                  )
                }
                className="bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-slate-900 hover:text-white px-4 py-2 rounded-xl font-medium transition-all cursor-pointer"
              >
                Inject SSH Port Attack BLOCK Log
              </button>

              <button
                onClick={() =>
                  triggerSimulationLog(
                    "Audit Log Database Backup",
                    "Simulated automated cronjob completed daily incremental snapshot back up of 6 FHIR relational collections"
                  )
                }
                className="bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-slate-900 hover:text-white px-4 py-2 rounded-xl font-medium transition-all cursor-pointer"
              >
                Inject Database Snap Backup Log
              </button>

              <button
                onClick={() =>
                  triggerSimulationLog(
                    "System Factory Reset",
                    "Super admin initiated simulated factory environment restore to base healthcare fixtures successfully"
                  )
                }
                className="bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-slate-900 hover:text-white px-4 py-2 rounded-xl font-medium transition-all cursor-pointer"
              >
                Inject Factory Reset Log
              </button>
            </div>
          </div>

          {/* Database Hard Factory Reset Container */}
          <div className="bg-white border border-red-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide flex items-center gap-1.5 text-red-700">
                <ShieldAlert className="w-4 h-4" /> CLINIC DATABASE FACTORY HARD REFRESH
              </h4>
              <p className="text-xs text-slate-400 max-w-xl">Purge all simulated records and restore the initial default set of HIPAA patients, IPD bed allocations, medicine stock, billing ledger, and role configurations.</p>
            </div>

            <button
               onClick={handleReset}
               className="bg-red-50 text-red-700 hover:bg-red-650 hover:text-white py-2 px-4 border border-red-200 rounded-xl text-xs font-semibold shrink-0 text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Purge & Restore Collections
            </button>
          </div>

        </div>
      )}

      {activeSubTab === "landing" && (
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
