import { useState, useEffect } from "react";
import { Patient, Appointment, VitalSign, Consultation, LabTest, Medicine, Bed, Admission, BillingInvoice, AuditLog, NotificationAlert, Employee, CustomRole } from "./types";
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

const STORAGE_KEY = "hims_database_state_v1";

const initialEmployees: Employee[] = [
  { id: "emp-1", name: "Dr. Rajesh Kumar", role: "Physician", department: "OPD Department", permittedModules: ["dashboard", "opd", "ipd"] },
  { id: "emp-2", name: "Nurse Priya Singh", role: "Nurse", department: "Nursing Station", permittedModules: ["dashboard", "ipd"] },
  { id: "emp-3", name: "Admin Amit Joshi", role: "Admin", department: "Finance Office", permittedModules: ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"] },
  { id: "emp-4", name: "Deepak Verma", role: "Lab Head", department: "Laboratory", permittedModules: ["dashboard", "labs"] },
  { id: "emp-5", name: "Pharmacy Desk Boss", role: "Pharmacy Boss", department: "Pharmacy Ward", permittedModules: ["dashboard", "pharmacy"] }
];

const initialCustomRoles: CustomRole[] = [
  { id: "role-1", name: "Consulting Specialist", defaultDepartment: "OPD Department", defaultPermittedModules: ["dashboard", "opd", "labs"] },
  { id: "role-2", name: "ICU Charge Nurse", defaultDepartment: "ICU Ward", defaultPermittedModules: ["dashboard", "ipd"] },
  { id: "role-3", name: "Operations Supervisor", defaultDepartment: "Database Admin", defaultPermittedModules: ["dashboard", "admin", "finance"] }
];

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
      customRoles: updated.customRoles ?? customRoles
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
    customRoles,
    addCustomRole,
    removeCustomRole,
    syncFirestoreData
  };
}
export type HIMSStore = ReturnType<typeof useHIMSStore>;
