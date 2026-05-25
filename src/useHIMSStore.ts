import { useState, useEffect } from "react";
import { Patient, Appointment, VitalSign, Consultation, LabTest, Medicine, Bed, Admission, BillingInvoice, AuditLog, NotificationAlert, Employee, CustomRole, LandingPageConfig, PainPointSlide, FeatureModule, HospitalProfile, SupportTicket, SuperAdminEmployee } from "./types";
import { db } from "./firebase";
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

import {
  initialPatients,
  initialAppointments,
  initialVitals,
  initialBeds,
  initialAdmissions,
  initialLabTests,
  initialMedicines,
  initialBillingInvoices,
  initialConsultations,
  initialAuditLogs
} from "./mockData";

const initialSupportTickets: SupportTicket[] = [
  {
    id: "TKT-3091",
    tenantName: "Metro General Hospital Corp",
    category: "LIS Connection",
    subject: "Blood analyzer machine serial sync packet loss",
    status: "Open",
    priority: "Urgent",
    assignedEngineer: "Alex Thompson (AI Agent)",
    slaMinutesRemaining: 12,
    message: "The Sysmex pathology machine fails to transmit automated CBC outcomes to OPD patient directories. Packets drop at egress point.",
    createdTime: "2026-05-23T11:40:00Z"
  },
  {
    id: "TKT-1082",
    tenantName: "Lotus Kids & Pediatric Clinic",
    category: "Billing",
    subject: "Insurance pre-auth document rejection payload mismatched",
    status: "Assigned",
    priority: "High",
    assignedEngineer: "Sarah Jenkins",
    slaMinutesRemaining: 45,
    message: "HDFC TPA integration returns empty response when validating pediatric orthopedic bundle rates under standard plan presets.",
    createdTime: "2026-05-23T12:15:00Z"
  },
  {
    id: "TKT-4401",
    tenantName: "MaxCare Specialty & Cardiac Unit",
    category: "Access Key Issues",
    subject: "Admitting physician proxy access expired early",
    status: "Resolving",
    priority: "Medium",
    assignedEngineer: "Priya Nair",
    slaMinutesRemaining: 180,
    message: "Chief cardiologist's proxy credential keys deactivated 4 hours before the shift roster ended. Needs security override.",
    createdTime: "2026-05-23T09:00:00Z"
  },
  {
    id: "TKT-9912",
    tenantName: "National Health Base Foundation",
    category: "HIPAA Compliance",
    subject: "Audit logs export failing under custom format rules",
    status: "Closed",
    priority: "Medium",
    assignedEngineer: "Sarah Jenkins",
    slaMinutesRemaining: 0,
    message: "Requesting a clean CSV output in compliance with HIPAA Business Associate review guidelines.",
    createdTime: "2026-05-22T14:30:00Z",
    csatScore: 5
  }
];

const initialSuperAdminEmployees: SuperAdminEmployee[] = [
  {
    id: "sa-emp-1",
    name: "Vikram Malhotra",
    email: "vikram@mediflow.io",
    role: "Support Team Lead",
    department: "Customer Support",
    permittedModules: ["support", "dashboard"],
    createdAt: "2026-01-10T08:00:00Z",
    active: true
  },
  {
    id: "sa-emp-2",
    name: "Sarah Jenkins",
    email: "sarah.j@mediflow.io",
    role: "Senior Security Specialist",
    department: "Infrastructure & Security",
    permittedModules: ["security", "operations", "dashboard"],
    createdAt: "2026-02-15T09:30:00Z",
    active: true
  },
  {
    id: "sa-emp-3",
    name: "Rohan Advani",
    email: "rohan@mediflow.io",
    role: "SaaS Financial Analyst",
    department: "Finance & Sales",
    permittedModules: ["finance", "usage", "dashboard"],
    createdAt: "2026-03-22T10:45:00Z",
    active: true
  }
];

const STORAGE_KEY = "hims_database_state_v1";

const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@mediflow.com",
    phone: "+91 91234 56780",
    role: "Physician",
    department: "OPD Department",
    joiningDate: "2024-03-15",
    salary: 125000,
    shiftPattern: "Morning (08:00 - 16:00)",
    attendanceStatus: "On-Duty",
    commissionPct: 15,
    permittedModules: ["dashboard", "opd", "ipd", "labs"]
  },
  {
    id: "emp-2",
    name: "Nurse Priya Singh",
    email: "priya.singh@mediflow.com",
    phone: "+91 98765 12345",
    role: "Nurse",
    department: "Nursing Station",
    joiningDate: "2024-08-22",
    salary: 45000,
    shiftPattern: "Evening (16:00 - 24:00)",
    attendanceStatus: "On-Duty",
    commissionPct: 0,
    permittedModules: ["dashboard", "ipd"]
  },
  {
    id: "emp-3",
    name: "Admin Amit Joshi",
    email: "amit.joshi@mediflow.com",
    phone: "+91 99887 76655",
    role: "Admin",
    department: "Finance Office",
    joiningDate: "2023-01-10",
    salary: 85000,
    shiftPattern: "Morning (08:00 - 16:00)",
    attendanceStatus: "On-Duty",
    commissionPct: 0,
    permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "hr"]
  },
  {
    id: "emp-4",
    name: "Deepak Verma",
    email: "deepak.verma@mediflow.com",
    phone: "+91 98123 45678",
    role: "Lab Head",
    department: "Laboratory",
    joiningDate: "2024-05-12",
    salary: 62000,
    shiftPattern: "Night (24:00 - 08:00)",
    attendanceStatus: "Off-Duty",
    commissionPct: 5,
    permittedModules: ["dashboard", "labs"]
  },
  {
    id: "emp-5",
    name: "Pharmacy Desk Boss",
    email: "pharmacy.boss@mediflow.com",
    phone: "+91 95432 10987",
    role: "Pharmacy Boss",
    department: "Pharmacy Ward",
    joiningDate: "2024-02-01",
    salary: 58000,
    shiftPattern: "Morning (08:00 - 16:00)",
    attendanceStatus: "On-Duty",
    commissionPct: 2,
    permittedModules: ["dashboard", "pharmacy"]
  }
];

const initialHospitalProfile: HospitalProfile = {
  name: "MediFlow City General Hospital",
  tagline: "Secured Closed-Loop Inpatient Healthcare Services",
  phone: "+91 98765 43210",
  email: "admin@mediflow-hospital.com",
  address: "704, Wellness Boulevard, Sector 15, HIMS Square, Mumbai, 400051",
  logoUrl: "", 
  taxNumber: "GSTIN-27AAHCM1029C1Z5",
  accreditation: "NABH Accredited (National Accreditation Board for Hospitals)"
};

const initialCustomRoles: CustomRole[] = [
  { id: "role-1", name: "Consulting Specialist", defaultDepartment: "OPD Department", defaultPermittedModules: ["dashboard", "opd", "labs"] },
  { id: "role-2", name: "ICU Charge Nurse", defaultDepartment: "ICU Ward", defaultPermittedModules: ["dashboard", "ipd"] },
  { id: "role-3", name: "Operations Supervisor", defaultDepartment: "Database Admin", defaultPermittedModules: ["dashboard", "admin", "finance"] }
];

const defaultLandingPageConfig: LandingPageConfig = {
  fontFamily: "Space Grotesk",
  primaryColor: "emerald",
  backgroundColorMode: "light",
  announcementText: "HIPAA Certification Assured • AES-256 Symmetric Encryption Vault Built-In • Zero Upfront Setup Fees",
  heroHeaderPart1: "Erase Critical Health Handoff Delays,",
  heroHeaderPart2: "With Secure, Closed-Loop Workstations",
  heroSubheadline: "Automate clinician shift SBAR summaries, track ward bed occupancy in real-time, and block inventory leakage — built strictly to prevent medical errors and protect vital patient records.",
  heroButtonLeftText: "Boot Secure Workstation",
  heroButtonRightText: "Request Guided Demo",
  heroImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  painPointsSlides: [
    {
      id: "slide-1",
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
        "Cut shift transition training from 45 min to 30 seconds",
        "Empower clinicians to return to bedside clinical care",
        "Enforce absolute clinical transfer compliance automatically"
      ]
    },
    {
      id: "slide-2",
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
      id: "slide-3",
      title: "Prescription Pilferage & Hidden Stock Leakage",
      category: "REVENUE LOSS prevention",
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
      id: "slide-4",
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
  ],
  featuresList: [
    {
      id: "feat-1",
      title: "Granular Role-Based Access Control",
      badge: "HIPAA SECURED AT CORE",
      desc: "Stop cross-role data leaks. Pre-configured, compliant permissions align perfectly to standard hospital operations hierarchies.",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      points: [
        "MD Physicians: Write diagnostic SOAP entries, dispatch lab orders, and authorise scripts.",
        "Ward Nurses: Record core telemetry, evaluate bed statuses, and trigger shift handoffs.",
        "Pharmacists: Approve electronic scripts, view inventory logs, and deduct units."
      ]
    },
    {
      id: "feat-2",
      title: "Seamless Outpatient Consultation Tool",
      badge: "MAXIMIZE CLINIC THROUGHPUT",
      desc: "Erase administrative drag. Draft SOAP records, pull up diagnostic catalogs, and transmit orders from a single elegant interface.",
      imageUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80",
      points: [
        "Smart Form Guide: Speeds up Subjective, Objective, Assessment, and Plan drafting.",
        "ICD-10 Search Integration: Diagnostic accuracy at the point of care.",
        "Direct Lab Sync: Instantly request pathology screens with status alerts."
      ]
    },
    {
      id: "feat-3",
      title: "Inpatient Wards & Occupancy Grid",
      badge: "ELIMINATE EMPTY BED OVERHEAD",
      desc: "Live visibility over ICU, Pediatric, and Recovery chambers. Erase coordination noise and control bed turnover smoothly.",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
      points: [
        "Responsive Map Grid: Identify unoccupied, scheduled, and dirty bed units at a glance.",
        "SBAR Transition Tool: Autoconsolidate telemetry for flawless doctor handovers.",
        "Intake Prioritization: Flag urgent needs with visual emergency markers."
      ]
    },
    {
      id: "feat-4",
      title: "Closed-Loop Pharmacy Depot Sync",
      badge: "PREVENT CRITICAL DRUG PILFERAGE",
      desc: "Connect your medicine shelves directly to patient checkouts. Keep dosage trails verified and auto-detect stock depletion.",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      points: [
        "Stock Depletion Alerts: Prompt warning thresholds dynamically configured for key medicines.",
        "Dispensing Sanity Engine: Strict automated checks lock out expired batches index-wide.",
        "Real-Time Balancing: Matches prescription fulfillment to bed checkout billing charts automatically."
      ]
    },
    {
      id: "feat-5",
      title: "Compliant HIPAA Protective Shield",
      badge: "IMPREGNABLE DATA SECURITY",
      desc: "Architected around strict clinical audit procedures. Enforce modern transport and storage encryption automatically.",
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80",
      points: [
        "Secure Storage standard: Active row-level data segregation ensures bulletproof isolation.",
        "Global Actor Logging: Track exact credential footprints during any database interaction.",
        "Executive Reports: Print audit-ready ledger certificates for licensing regulators."
      ]
    }
  ]
};

export function useHIMSStore() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [billing, setBilling] = useState<BillingInvoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [landingPageConfig, setLandingPageConfig] = useState<LandingPageConfig>(defaultLandingPageConfig);
  const [hospitalProfile, setHospitalProfile] = useState<HospitalProfile>(initialHospitalProfile);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [superAdminEmployees, setSuperAdminEmployees] = useState<SuperAdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load state
  useEffect(() => {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        setPatients(parsed.patients || []);
        setAppointments(parsed.appointments || []);
        setVitals(parsed.vitals || []);
        setConsultations(parsed.consultations || []);
        setLabTests(parsed.labTests || []);
        setMedicines(parsed.medicines || []);
        setBeds(parsed.beds || []);
        setAdmissions(parsed.admissions || []);
        setBilling(parsed.billing || []);
        setAuditLogs(parsed.auditLogs || []);
        setNotifications(parsed.notifications || []);
        setEmployees(parsed.employees || initialEmployees);
        setCustomRoles(parsed.customRoles || initialCustomRoles);
        setLandingPageConfig(parsed.landingPageConfig || defaultLandingPageConfig);
        setHospitalProfile(parsed.hospitalProfile || initialHospitalProfile);
        setSupportTickets(parsed.supportTickets || initialSupportTickets);
        setSuperAdminEmployees(parsed.superAdminEmployees || initialSuperAdminEmployees);
      } else {
        // Load defaults
        setPatients(initialPatients);
        setAppointments(initialAppointments);
        setVitals(initialVitals);
        setConsultations(initialConsultations);
        setLabTests(initialLabTests);
        setMedicines(initialMedicines);
        setBeds(initialBeds);
        setAdmissions(initialAdmissions);
        setBilling(initialBillingInvoices);
        setAuditLogs(initialAuditLogs);
        setNotifications([]);
        setEmployees(initialEmployees);
        setCustomRoles(initialCustomRoles);
        setLandingPageConfig(defaultLandingPageConfig);
        setHospitalProfile(initialHospitalProfile);
        setSupportTickets(initialSupportTickets);
        setSuperAdminEmployees(initialSuperAdminEmployees);
 
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            patients: initialPatients,
            appointments: initialAppointments,
            vitals: initialVitals,
            consultations: initialConsultations,
            labTests: initialLabTests,
            medicines: initialMedicines,
            beds: initialBeds,
            admissions: initialAdmissions,
            billing: initialBillingInvoices,
            auditLogs: initialAuditLogs,
            notifications: [],
            employees: initialEmployees,
            customRoles: initialCustomRoles,
            landingPageConfig: defaultLandingPageConfig,
            hospitalProfile: initialHospitalProfile,
            supportTickets: initialSupportTickets,
            superAdminEmployees: initialSuperAdminEmployees
          })
        );
      }
    } catch (e) {
      console.error("Local storage sync error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save changes helper
  const saveState = (updated: {
    patients?: Patient[];
    appointments?: Appointment[];
    vitals?: VitalSign[];
    consultations?: Consultation[];
    labTests?: LabTest[];
    medicines?: Medicine[];
    beds?: Bed[];
    admissions?: Admission[];
    billing?: BillingInvoice[];
    auditLogs?: AuditLog[];
    notifications?: NotificationAlert[];
    employees?: Employee[];
    customRoles?: CustomRole[];
    landingPageConfig?: LandingPageConfig;
    hospitalProfile?: HospitalProfile;
    supportTickets?: SupportTicket[];
    superAdminEmployees?: SuperAdminEmployee[];
  }) => {
    const currentState = {
      patients: updated.patients ?? patients,
      appointments: updated.appointments ?? appointments,
      vitals: updated.vitals ?? vitals,
      consultations: updated.consultations ?? consultations,
      labTests: updated.labTests ?? labTests,
      medicines: updated.medicines ?? medicines,
      beds: updated.beds ?? beds,
      admissions: updated.admissions ?? admissions,
      billing: updated.billing ?? billing,
      auditLogs: updated.auditLogs ?? auditLogs,
      notifications: updated.notifications ?? notifications,
      employees: updated.employees ?? employees,
      customRoles: updated.customRoles ?? customRoles,
      landingPageConfig: updated.landingPageConfig ?? landingPageConfig,
      hospitalProfile: updated.hospitalProfile ?? hospitalProfile,
      supportTickets: updated.supportTickets ?? supportTickets,
      superAdminEmployees: updated.superAdminEmployees ?? superAdminEmployees
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    if (updated.patients) setPatients(updated.patients);
    if (updated.appointments) setAppointments(updated.appointments);
    if (updated.vitals) setVitals(updated.vitals);
    if (updated.consultations) setConsultations(updated.consultations);
    if (updated.labTests) setLabTests(updated.labTests);
    if (updated.medicines) setMedicines(updated.medicines);
    if (updated.beds) setBeds(updated.beds);
    if (updated.admissions) setAdmissions(updated.admissions);
    if (updated.billing) setBilling(updated.billing);
    if (updated.auditLogs) setAuditLogs(updated.auditLogs);
    if (updated.notifications) setNotifications(updated.notifications);
    if (updated.employees) setEmployees(updated.employees);
    if (updated.customRoles) setCustomRoles(updated.customRoles);
    if (updated.landingPageConfig) setLandingPageConfig(updated.landingPageConfig);
    if (updated.hospitalProfile) setHospitalProfile(updated.hospitalProfile);
    if (updated.supportTickets) setSupportTickets(updated.supportTickets);
    if (updated.superAdminEmployees) setSuperAdminEmployees(updated.superAdminEmployees);
  };

  const updateHospitalProfile = (profileUpdates: Partial<HospitalProfile>) => {
    const nextProfile = { ...hospitalProfile, ...profileUpdates };
    saveState({ hospitalProfile: nextProfile });
  };

  const updateLandingPageConfig = (configUpdates: Partial<LandingPageConfig>) => {
    const nextConfig = { ...landingPageConfig, ...configUpdates };
    saveState({ landingPageConfig: nextConfig });
  };

  const createLog = (user: string, role: string, action: string, dept: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      role: role as any,
      action,
      department: dept,
      details
    };
    const newLogs = [log, ...auditLogs];
    saveState({ auditLogs: newLogs });
    return log;
  };

  // 1. Patient Mutations
  const registerPatient = (patient: Omit<Patient, "id" | "uhid">, user: string, role: string) => {
    const nextId = `pat-${patients.length + 1}`;
    const nextUhid = `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPatient: Patient = {
      ...patient,
      id: nextId,
      uhid: nextUhid
    };
    const updated = [...patients, fullPatient];
    saveState({ patients: updated });
    createLog(user, role, "Register Patient", "OPD Department", `Registered new patient: ${fullPatient.name} with ID ${fullPatient.uhid}`);
    return fullPatient;
  };

  // 2. Appointment Mutations
  const scheduleAppointment = (appt: Omit<Appointment, "id" | "status">, user: string, role: string) => {
    const nextId = `appt-${Date.now()}`;
    const fullAppt: Appointment = {
      ...appt,
      id: nextId,
      status: "Scheduled"
    };
    const updated = [...appointments, fullAppt];
    saveState({ appointments: updated });
    createLog(user, role, "Create Appointment", "OPD Scheduled", `Booked appointment for ${appt.patientName} with ${appt.doctorName} on ${new Date(appt.dateTime).toLocaleString()}`);
    return fullAppt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"], user: string, role: string) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    const target = appointments.find((a) => a.id === id);
    saveState({ appointments: updated });
    if (target) {
      createLog(user, role, "Update Appointment", "OPD Operations", `Changed appointment of ${target.patientName} status to ${status}`);
    }
  };

  // 3. Vitals & Nursing Stations
  const logVitals = (vital: Omit<VitalSign, "id" | "timestamp">, user: string, role: string) => {
    const id = `vital-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Basic heuristic anomaly checking
    const bps = vital.bloodPressure.split("/");
    const systolic = parseInt(bps[0]) || 120;
    const diastolic = parseInt(bps[1]) || 80;
    const isHighBP = systolic > 140 || diastolic > 90;
    const isRapidHeart = vital.heartRate > 100;
    const isLowSpO2 = vital.spO2 < 94;

    let isAnomaly = vital.isAnomaly || false;
    let anomalyReason = vital.anomalyReason || "";

    if (!isAnomaly && (isHighBP || isRapidHeart || isLowSpO2)) {
      isAnomaly = true;
      const issues = [];
      if (isHighBP) issues.push(`High BP (${sysdocCheck(systolic)}/${diastCheck(diastolic)})`);
      if (isRapidHeart) issues.push(`Tachycardia (${vital.heartRate} bpm)`);
      if (isLowSpO2) issues.push(`Low SpO2 (${vital.spO2}%)`);
      anomalyReason = `Critical Trend: ${issues.join(", ")}`;
    } else if (isAnomaly && !anomalyReason) {
      anomalyReason = "Manual Clint-Side Anomaly Override Flagged";
    }

    const fullVital: VitalSign = {
      ...vital,
      id,
      timestamp,
      isAnomaly,
      anomalyReason
    };

    const updated = [fullVital, ...vitals];

    // Also update any active inpatient admission's vitals list if admitted
    const updatedAdmissions = admissions.map((adm) => {
      if (adm.patientId === vital.patientId && adm.status === "Admitted") {
        return {
          ...adm,
          vitalsHistory: [fullVital, ...adm.vitalsHistory]
        };
      }
      return adm;
    });

    const targetPatient = patients.find((p) => p.id === vital.patientId);
    const activeAdm = admissions.find((adm) => adm.patientId === vital.patientId && adm.status === "Admitted");
    
    let updatedNotifications = notifications;
    if (isAnomaly) {
      const newNotification: NotificationAlert = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        patientId: vital.patientId,
        patientName: targetPatient?.name || "Patient",
        anomalyReason,
        assignedNurse: "Nurse Priya Singh",
        assignedPhysician: activeAdm?.admittingDoctor || "Dr. Rajesh Kumar",
        admissionId: activeAdm?.id || "",
        read: false
      };
      updatedNotifications = [newNotification, ...notifications];
    }

    saveState({
      vitals: updated,
      admissions: updatedAdmissions,
      notifications: updatedNotifications
    });

    createLog(
      user,
      role,
      isAnomaly ? "Vital Anomaly Flagged" : "Log Vitals",
      "Nursing Station",
      `Observed vital signs for ${targetPatient?.name || "Patient"}. ${isAnomaly ? "ALERT: " + anomalyReason : "Values normal"}`
    );

    return fullVital;
  };

  function sysdocCheck(val: number) { return val; }
  function diastCheck(val: number) { return val; }

  // 4. Consultations & Clinic Decisions
  const addConsultation = (cons: Omit<Consultation, "id" | "dateTime">, user: string, role: string) => {
    const id = `cons-${Date.now()}`;
    const dateTime = new Date().toISOString();
    const fullCons: Consultation = {
      ...cons,
      id,
      dateTime
    };
    const updated = [...consultations, fullCons];
    saveState({ consultations: updated });

    const p = patients.find((pat) => pat.id === cons.patientId);
    createLog(user, role, "Log Consultation", "Physician Ward", `Consultation and diagnosis saved for patient ${p?.name || "Patient"}: ${cons.diagnosis}`);
    return fullCons;
  };

  // 5. Inpatients & Bed Operations
  const admitPatientInBed = (
    admissionInput: Omit<Admission, "id" | "admissionDate" | "vitalsHistory" | "status">,
    user: string,
    role: string
  ) => {
    const id = `adm-${Date.now()}`;
    const admissionDate = new Date().toISOString();

    // Get current vitals for patient if any
    const patientVitals = vitals.filter((v) => v.patientId === admissionInput.patientId);

    const fullAdmission: Admission = {
      ...admissionInput,
      id,
      admissionDate,
      vitalsHistory: patientVitals.slice(0, 5),
      status: "Admitted"
    };

    // Update Bed Status to Occupied
    const updatedBeds = beds.map((b) =>
      b.id === admissionInput.bedId
        ? {
            ...b,
            status: "Occupied" as const,
            occupiedByPatientId: admissionInput.patientId,
            occupiedByPatientName: admissionInput.patientName,
            admissionId: id
          }
        : b
    );

    const updatedAdmissions = [...admissions, fullAdmission];
    saveState({
      admissions: updatedAdmissions,
      beds: updatedBeds
    });

    createLog(user, role, "Admit Inpatient", "Admissions Gate", `Admitted patient ${admissionInput.patientName} to ${admissionInput.ward} Bed ${admissionInput.bedNumber}`);
    return fullAdmission;
  };

  const dischargePatient = (admissionId: string, summary: string, user: string, role: string) => {
    const adm = admissions.find((a) => a.id === admissionId);
    if (!adm) return;

    const updatedAdmissions = admissions.map((a) =>
      a.id === admissionId
        ? {
            ...a,
            status: "Discharged" as const,
            dischargeDate: new Date().toISOString(),
            dischargeSummary: summary
          }
        : a
    );

    // Free Bed
    const updatedBeds = beds.map((b) =>
      b.id === adm.bedId
        ? {
            ...b,
            status: "Available" as const,
            occupiedByPatientId: undefined,
            occupiedByPatientName: undefined,
            admissionId: undefined
          }
        : b
    );

    // Auto generate a billing invoice block for inpatient stay
    const daysStayed = Math.max(1, Math.ceil((Date.now() - new Date(adm.admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
    const roomRentAmount = daysStayed * (adm.ward === "ICU" ? 5000 : 2000);

    const nextInvoiceId = `bil-${Date.now()}`;
    const invoiceNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const billItems = [
      { description: `IPD Stay Room Rent (${daysStayed} Day/s) Ward: ${adm.ward}`, category: "Room Rent" as const, amount: roomRentAmount },
      { description: "IPD Physician Routine Care Visits", category: "OPD Consultation" as const, amount: 2500 }
    ];

    const totalAmount = roomRentAmount + 2500;

    const newInvoice: BillingInvoice = {
      id: nextInvoiceId,
      invoiceNumber: invoiceNum,
      patientId: adm.patientId,
      patientName: adm.patientName,
      date: new Date().toISOString(),
      items: billItems,
      totalAmount,
      insuranceClaimed: Math.min(totalAmount, adm.ward === "ICU" ? 5000 : 2000),
      status: "Pending_TPA"
    };

    saveState({
      admissions: updatedAdmissions,
      beds: updatedBeds,
      billing: [...billing, newInvoice]
    });

    createLog(user, role, "Discharge Inpatient", "IPD Ward", `Discharged patient ${adm.patientName}. Generated final billing invoice ${newInvoice.invoiceNumber}`);
  };

  // 6. Pathology Laboratory
  const requestLabTest = (test: Omit<LabTest, "id" | "requestDate" | "status">, user: string, role: string) => {
    const id = `lab-${Date.now()}`;
    const requestDate = new Date().toISOString();
    const fullTest: LabTest = {
      ...test,
      id,
      requestDate,
      status: "Requested"
    };
    const updated = [...labTests, fullTest];
    saveState({ labTests: updated });

    createLog(user, role, "Request Lab Test", "Laboratory", `Ordered lab test: ${test.testName} for patient ${test.patientName}`);
    return fullTest;
  };

  const updateLabTest = (
    id: string,
    status: LabTest["status"],
    results?: string,
    abnormalFlags?: boolean,
    user?: string,
    role?: string
  ) => {
    const target = labTests.find((t) => t.id === id);
    if (!target) return;

    const isNowCompleted = status === "Completed" && target.status !== "Completed";
    const updated = labTests.map((t) => (t.id === id ? { ...t, status, results, abnormalFlags } : t));

    let updatedBilling = billing;
    if (isNowCompleted) {
      const testNameLower = target.testName.toLowerCase();
      let charge = 500;
      if (testNameLower.includes("lipid") || testNameLower.includes("hba1c")) {
        charge = 1200;
      } else if (testNameLower.includes("cbc") || testNameLower.includes("culture") || testNameLower.includes("blood")) {
        charge = 2400;
      } else if (testNameLower.includes("spiro") || testNameLower.includes("ige")) {
        charge = 1500;
      } else if (testNameLower.includes("urine") || testNameLower.includes("analys")) {
        charge = 350;
      } else if (testNameLower.includes("serum") || testNameLower.includes("biochem")) {
        charge = 600;
      }

      const invoiceId = `bil-${Date.now()}`;
      const invoiceNumber = `INV-2026-L${Math.floor(100 + Math.random() * 900)}`;
      const newInvoice: BillingInvoice = {
        id: invoiceId,
        invoiceNumber,
        patientId: target.patientId,
        patientName: target.patientName,
        date: new Date().toISOString(),
        items: [
          {
            description: `Lab Test: ${target.testName} (Completed)`,
            category: "Laboratory",
            amount: charge
          }
        ],
        totalAmount: charge,
        insuranceClaimed: 0,
        status: "Unpaid"
      };
      updatedBilling = [...billing, newInvoice];
    }

    saveState({
      labTests: updated,
      billing: updatedBilling
    });

    if (target) {
      createLog(
        user || "Lab Tech",
        (role as any) || "Lab Head",
        `Lab Status: ${status}`,
        "Laboratory",
        `Updated Lab request ${target.testName} for ${target.patientName} to status ${status}.${
          isNowCompleted ? ` Generated draft lab invoice ${updatedBilling[updatedBilling.length - 1]?.invoiceNumber || ""} matching charges of $${updatedBilling[updatedBilling.length - 1]?.totalAmount || 0}.` : ""
        }`
      );
    }
  };

  // 7. Pharmacy Inventory
  const addMedicineInventory = (medicine: Omit<Medicine, "id">, user: string, role: string) => {
    const id = `med-${Date.now()}`;
    const fullMedicine = { ...medicine, id };
    const updated = [...medicines, fullMedicine];
    saveState({ medicines: updated });
    createLog(user, role, "Add Medicine", "Pharmacy Stock", `Added medicine: ${medicine.name} (${medicine.strength}) count: ${medicine.stockCount}`);
    return fullMedicine;
  };

  const updateMedicineStock = (id: string, countChange: number, user: string, role: string) => {
    const updated = medicines.map((m) => {
      if (m.id === id) {
        const newCount = Math.max(0, m.stockCount + countChange);
        return { ...m, stockCount: newCount };
      }
      return m;
    });
    const target = medicines.find((m) => m.id === id);
    saveState({ medicines: updated });

    if (target) {
      const direction = countChange >= 0 ? "Increased" : "Despatched/Reduced";
      createLog(
        user,
        role,
        "Update Pharmacy Stock",
        "Pharmacy Ward",
        `${direction} stock for ${target.name} ${target.strength} by ${Math.abs(countChange)} units.`
      );
    }
  };

  // 8. Finance & Billing
  const submitOPDBill = (invoice: Omit<BillingInvoice, "id" | "date" | "invoiceNumber">, user: string, role: string) => {
    const id = `bil-${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullBill: BillingInvoice = {
      ...invoice,
      id,
      invoiceNumber,
      date: new Date().toISOString()
    };
    const updated = [...billing, fullBill];
    saveState({ billing: updated });

    createLog(user, role, "Generate Invoice", "Finance Office", `Created invoice ${invoiceNumber} for ${invoice.patientName}. Total: $${invoice.totalAmount}`);
    return fullBill;
  };

  const approveInsuranceTPA = (id: string, user: string, role: string) => {
    const updated = billing.map((b) => (b.id === id ? { ...b, tpaApproved: true, status: "Paid" as const } : b));
    const target = billing.find((b) => b.id === id);
    saveState({ billing: updated });

    if (target) {
      createLog(user, role, "Approve Insurance TPA", "Finance TPA", `Insurance Pre-auth cleared for ${target.patientName} Invoice ${target.invoiceNumber}`);
    }
  };

  const payInvoiceDirect = (id: string, user: string, role: string) => {
    const updated = billing.map((b) => (b.id === id ? { ...b, status: "Paid" as const } : b));
    const target = billing.find((b) => b.id === id);
    saveState({ billing: updated });

    if (target) {
      createLog(user, role, "Invoice Direct Payment", "Finance Office", `Settled payment directly for ${target.patientName} Invoice ${target.invoiceNumber}`);
    }
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveState({ notifications: updated });
  };

  const clearNotifications = () => {
    saveState({ notifications: [] });
  };

  const syncFirestoreData = async () => {
    try {
      const empSnap = await getDocs(collection(db, "employees"));
      const fetchedEmps: Employee[] = [];
      empSnap.forEach((doc) => {
        fetchedEmps.push({ id: doc.id, ...doc.data() } as Employee);
      });
      if (fetchedEmps.length > 0) {
        setEmployees(fetchedEmps);
      }

      const roleSnap = await getDocs(collection(db, "custom_roles"));
      const fetchedRoles: CustomRole[] = [];
      roleSnap.forEach((doc) => {
        fetchedRoles.push({ id: doc.id, ...doc.data() } as CustomRole);
      });
      if (fetchedRoles.length > 0) {
        setCustomRoles(fetchedRoles);
      }
    } catch (err) {
      console.warn("Firestore data sync notice (requires full authorization context):", err);
    }
  };

  const onboardEmployee = async (emp: Employee) => {
    const updated = [...employees, emp];
    saveState({ employees: updated });
    createLog("Admin Amit Joshi", "Admin", "Onboard Employee", "Human Resources", `Onboarded new employee ${emp.name} under role ${emp.role} (Dept: ${emp.department}) with custom RBAC access permissions.`);
    
    try {
      await setDoc(doc(db, "employees", emp.id), emp);
    } catch (err) {
      console.warn("Firestore persist warning on onboarding:", err);
    }
  };

  const updateEmployeePermissions = async (id: string, permittedModules: string[]) => {
    const updated = employees.map((emp) => emp.id === id ? { ...emp, permittedModules } : emp);
    saveState({ employees: updated });
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      createLog("Admin Amit Joshi", "Admin", "Update Access Controls", "Human Resources", `Modified RBAC permissions for employee ${emp.name} (${emp.role}) to access: [${permittedModules.join(", ")}].`);
    }

    try {
      await updateDoc(doc(db, "employees", id), { permittedModules });
    } catch (err) {
      console.warn("Firestore persist warning on permission update:", err);
    }
  };

  const removeEmployee = async (id: string) => {
    const emp = employees.find((e) => e.id === id);
    const updated = employees.filter((emp) => emp.id !== id);
    saveState({ employees: updated });
    if (emp) {
      createLog("Admin Amit Joshi", "Admin", "Offboard Employee", "Human Resources", `Offboarded clinical/operational staff client ${emp.name} and permanently revoked HIMS environment access credentials.`);
    }

    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (err) {
      console.warn("Firestore persist warning on employee removal:", err);
    }
  };

  const toggleEmployeeOnCall = async (id: string) => {
    const emp = employees.find((e) => e.id === id);
    const nextOnCall = emp ? !emp.isOnCall : true;
    const updated = employees.map((e) => e.id === id ? { ...e, isOnCall: nextOnCall } : e);
    saveState({ employees: updated });
    
    if (emp) {
      const nextStateText = nextOnCall ? "On-Call" : "Available";
      createLog("Admin Amit Joshi", "Admin", "Toggle Staff On-Call Status", "Human Resources", `Updated ${emp.name} (${emp.role}) availability status to: ${nextStateText}.`);
    }

    try {
      await updateDoc(doc(db, "employees", id), { isOnCall: nextOnCall });
    } catch (err) {
      console.warn("Firestore persist warning on on-call toggle:", err);
    }
  };

  const addCustomRole = async (role: CustomRole) => {
    const updated = [...customRoles, role];
    saveState({ customRoles: updated });
    createLog("Admin Amit Joshi", "Admin", "Create Custom Role", "Human Resources", `Configured new custom RBAC role archetype: "${role.name}" with default modules [${role.defaultPermittedModules.join(", ")}].`);
    
    try {
      await setDoc(doc(db, "custom_roles", role.id), role);
    } catch (err) {
      console.warn("Firestore persist warning on custom role creation:", err);
    }
  };

  const removeCustomRole = async (id: string) => {
    const target = customRoles.find((r) => r.id === id);
    const updated = customRoles.filter((r) => r.id !== id);
    saveState({ customRoles: updated });
    if (target) {
      createLog("Admin Amit Joshi", "Admin", "Delete Custom Role", "Human Resources", `Successfully decommissioned custom role archetype: "${target.name}".`);
    }

    try {
      await deleteDoc(doc(db, "custom_roles", id));
    } catch (err) {
      console.warn("Firestore persist warning on custom role deletion:", err);
    }
  };

  const purgeResetDB = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPatients(initialPatients);
    setAppointments(initialAppointments);
    setVitals(initialVitals);
    setConsultations(initialConsultations);
    setLabTests(initialLabTests);
    setMedicines(initialMedicines);
    setBeds(initialBeds);
    setAdmissions(initialAdmissions);
    setBilling(initialBillingInvoices);
    setAuditLogs(initialAuditLogs);
    setNotifications([]);
    setEmployees(initialEmployees);
    setCustomRoles(initialCustomRoles);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        patients: initialPatients,
        appointments: initialAppointments,
        vitals: initialVitals,
        consultations: initialConsultations,
        labTests: initialLabTests,
        medicines: initialMedicines,
        beds: initialBeds,
        admissions: initialAdmissions,
        billing: initialBillingInvoices,
        auditLogs: initialAuditLogs,
        notifications: [],
        employees: initialEmployees,
        customRoles: initialCustomRoles
      })
    );

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "System Admin",
      role: "Admin",
      action: "System Factory Reset",
      department: "Database Admin",
      details: "Restored all database tables to default baseline requirements. Purged all temporary records."
    };
    setAuditLogs([log]);
  };

  const raiseSupportTicket = (tPayload: Omit<SupportTicket, "id" | "createdTime" | "status" | "assignedEngineer" | "slaMinutesRemaining">) => {
    const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      ...tPayload,
      id: newId,
      status: "Open",
      assignedEngineer: "Alex Thompson (AI Agent)",
      slaMinutesRemaining: 180,
      createdTime: new Date().toISOString()
    };
    const updated = [newTicket, ...supportTickets];
    saveState({ supportTickets: updated });
    
    createLog(
      tPayload.employeeName || "Hospital Admin",
      "Hospital Member",
      "Raise Support Ticket",
      "Support Desk Interface",
      `Employee raised a ticket: [${newId}] ${tPayload.subject} under Category: ${tPayload.category}.`
    );
    return newTicket;
  };

  const updateSupportTicket = (id: string, updates: Partial<SupportTicket>) => {
    const updated = supportTickets.map(t => t.id === id ? { ...t, ...updates } : t);
    saveState({ supportTickets: updated });
    createLog(
      "SaaS Super Admin",
      "System Master",
      "Update Support Ticket",
      "Support CRM Desk",
      `Modified support ticket parameters for ${id} (Status: ${updates.status || 'No status change'}).`
    );
  };

  const addSuperAdminEmployee = (emp: SuperAdminEmployee) => {
    const updated = [emp, ...superAdminEmployees];
    saveState({ superAdminEmployees: updated });
    createLog(
      "SaaS Super Admin",
      "Super Admin",
      "Onboard Super Staff",
      "Platform Admin Panel",
      `Onboarded SaaS team employee: ${emp.name} (${emp.role}) inside ${emp.department} department.`
    );
  };

  const removeSuperAdminEmployee = (id: string) => {
    const emp = superAdminEmployees.find(e => e.id === id);
    const updated = superAdminEmployees.filter(e => e.id !== id);
    saveState({ superAdminEmployees: updated });
    if (emp) {
      createLog(
        "SaaS Super Admin",
        "Super Admin",
        "Offboard Super Staff",
        "Platform Admin Panel",
        `Offboarded SaaS employee ${emp.name} (${emp.role}) and revoked SaaS portal tools access.`
      );
    }
  };

  const updateSuperAdminEmployeePermissions = (id: string, permittedModules: string[]) => {
    const updated = superAdminEmployees.map(e => e.id === id ? { ...e, permittedModules } : e);
    saveState({ superAdminEmployees: updated });
    const emp = superAdminEmployees.find(e => e.id === id);
    if (emp) {
      createLog(
        "SaaS Super Admin",
        "Super Admin",
        "Update Super Staff Permissions",
        "Platform Admin Panel",
        `Mutated Super Admin RBAC scopes for ${emp.name} to permitted subtabs: [${permittedModules.join(", ")}].`
      );
    }
  };

  const importBulkData = (type: "patients" | "medicines" | "billing", data: any[]) => {
    if (type === "patients") {
      const updated = [...patients, ...data];
      saveState({ patients: updated });
      createLog("SaaS Data Migrator", "Admin", `Bulk Migrate Excel Patients`, "Database Admin Desk", `Successfully appended ${data.length} patient records from Excel Sheet.`);
    } else if (type === "medicines") {
      const updated = [...medicines, ...data];
      saveState({ medicines: updated });
      createLog("SaaS Data Migrator", "Admin", `Bulk Migrate Excel Medicines`, "Database Admin Desk", `Successfully appended ${data.length} medicine stock details from Excel Sheet.`);
    } else if (type === "billing") {
      const updated = [...billing, ...data];
      saveState({ billing: updated });
      createLog("SaaS Data Migrator", "Admin", `Bulk Migrate Excel Invoices`, "Database Admin Desk", `Successfully appended ${data.length} billing files from Excel Sheet.`);
    }
  };

  return {
    patients,
    appointments,
    vitals,
    consultations,
    labTests,
    medicines,
    beds,
    admissions,
    billing,
    auditLogs,
    notifications,
    loading,
    registerPatient,
    scheduleAppointment,
    updateAppointmentStatus,
    logVitals,
    addConsultation,
    admitPatientInBed,
    dischargePatient,
    requestLabTest,
    updateLabTest,
    addMedicineInventory,
    updateMedicineStock,
    submitOPDBill,
    approveInsuranceTPA,
    payInvoiceDirect,
    createLog,
    purgeResetDB,
    markNotificationAsRead,
    clearNotifications,
    employees,
    onboardEmployee,
    updateEmployeePermissions,
    removeEmployee,
    toggleEmployeeOnCall,
    customRoles,
    addCustomRole,
    removeCustomRole,
    syncFirestoreData,
    landingPageConfig,
    updateLandingPageConfig,
    hospitalProfile,
    updateHospitalProfile,
    supportTickets,
    superAdminEmployees,
    raiseSupportTicket,
    updateSupportTicket,
    addSuperAdminEmployee,
    removeSuperAdminEmployee,
    updateSuperAdminEmployeePermissions,
    importBulkData
  };
}
export type HIMSStore = ReturnType<typeof useHIMSStore>;
