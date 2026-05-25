import { Patient, Appointment, VitalSign, Bed, Medicine, LabTest, BillingInvoice, AuditLog, Admission, Consultation } from "./types";

export const initialPatients: Patient[] = [
  {
    id: "pat-1",
    uhid: "UHID-2026-6401",
    name: "Aarav Sharma",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    address: "B-402, Shanti Vihar, New Delhi, Delhi",
    allergies: ["Penicillin", "Peanuts"],
    medicalHistory: ["Hypertension (Diagnosed 2021)", "Type 2 Diabetes (Diet controlled)"]
  },
  {
    id: "pat-2",
    uhid: "UHID-2026-9042",
    name: "Meera Patel",
    age: 62,
    gender: "Female",
    bloodGroup: "A-",
    phone: "+91 87654 32109",
    address: "Flat 12, Regency Heights, Mumbai, Maharashtra",
    allergies: ["Sulfa drugs"],
    medicalHistory: ["Hyperlipidemia", "Osteoarthritis of both knees"]
  },
  {
    id: "pat-3",
    uhid: "UHID-2026-1183",
    name: "Rajesh Rao",
    age: 28,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 76543 21098",
    address: "H-42, Sector 15, HSR Layout, Bengaluru, Karnataka",
    allergies: ["None reported"],
    medicalHistory: ["Seasonal asthma"]
  },
  {
    id: "pat-4",
    uhid: "UHID-2026-3024",
    name: "Priya Singh",
    age: 34,
    gender: "Female",
    bloodGroup: "AB+",
    phone: "+91 95432 10987",
    address: "House 89, Gachibowli, Hyderabad, Telangana",
    allergies: ["Aspirin"],
    medicalHistory: ["Maternal Hypothyroidism", "Anemia (Mild)"]
  },
  {
    id: "pat-5",
    uhid: "UHID-2026-7715",
    name: "Kabir Mehta",
    age: 8,
    gender: "Male",
    bloodGroup: "O-",
    phone: "+91 90123 45678",
    address: "Avenue-5, Salt Lake, Kolkata, West Bengal",
    allergies: ["Dust notes", "Dairy (Mild intolerant)"],
    medicalHistory: ["Mild G6PD deficiency"]
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: "appt-1",
    patientId: "pat-1",
    patientName: "Aarav Sharma",
    doctorName: "Dr. Rajesh Kumar",
    department: "Cardiology",
    dateTime: "2026-05-21T09:30:00Z",
    status: "Completed",
    urgency: "Routine",
    notes: "Regular blood pressure check-up and follow-up."
  },
  {
    id: "appt-2",
    patientId: "pat-2",
    patientName: "Meera Patel",
    doctorName: "Dr. Rajesh Kumar",
    department: "Internal Medicine",
    dateTime: "2026-05-22T10:00:00Z",
    status: "Scheduled",
    urgency: "Routine",
    notes: "Discuss lipid profile results and chronic joint pain."
  },
  {
    id: "appt-3",
    patientId: "pat-3",
    patientName: "Rajesh Rao",
    doctorName: "Dr. Ananya Nair",
    department: "Pulmonology",
    dateTime: "2026-05-21T11:15:00Z",
    status: "Completed",
    urgency: "Urgent",
    notes: "Sudden onset of persistent wheezing after dusty warehouse visit."
  },
  {
    id: "appt-4",
    patientId: "pat-4",
    patientName: "Priya Singh",
    doctorName: "Dr. Rohan Verma",
    department: "Gynecology",
    dateTime: "2026-05-23T14:30:00Z",
    status: "Scheduled",
    urgency: "Routine",
    notes: "Anemia status review and routine blood panel update."
  },
  {
    id: "appt-5",
    patientId: "pat-5",
    patientName: "Kabir Mehta",
    doctorName: "Dr. Pooja Sen",
    department: "Pediatrics",
    dateTime: "2026-05-21T16:00:00Z",
    status: "Scheduled",
    urgency: "Routine",
    notes: "School immunization and chest check-up."
  }
];

export const initialVitals: VitalSign[] = [
  {
    id: "vital-1",
    patientId: "pat-1",
    timestamp: "2026-05-21T11:00:00Z",
    heartRate: 78,
    bloodPressure: "135/85",
    spO2: 98,
    temperature: 36.8,
    respiratoryRate: 16,
    recordedBy: "Nurse Priya Singh"
  },
  {
    id: "vital-2",
    patientId: "pat-2",
    timestamp: "2026-05-21T10:45:00Z",
    heartRate: 112, // Tachycardia warning!
    bloodPressure: "165/100", // Severe Hypertension!
    spO2: 92, // Mild hypoxia!
    temperature: 38.5, // Fever!
    respiratoryRate: 22,
    recordedBy: "Nurse Priya Singh",
    isAnomaly: true,
    anomalyReason: "Critical: High BP (165/100), Tachycardia & Oxygen Saturation under 94% with Fever alert."
  },
  {
    id: "vital-3",
    patientId: "pat-3",
    timestamp: "2026-05-21T11:15:00Z",
    heartRate: 85,
    bloodPressure: "118/75",
    spO2: 95,
    temperature: 37.0,
    respiratoryRate: 20,
    recordedBy: "Nurse Priya Singh"
  }
];

export const initialBeds: Bed[] = [
  { id: "bed-1", bedNumber: "ICU-101", ward: "ICU", status: "Occupied", occupiedByPatientId: "pat-2", occupiedByPatientName: "Meera Patel", admissionId: "adm-1" },
  { id: "bed-2", bedNumber: "ICU-102", ward: "ICU", status: "Available" },
  { id: "bed-3", bedNumber: "ICU-103", ward: "ICU", status: "Maintenance" },
  { id: "bed-4", bedNumber: "WARD-A-Spot1", ward: "General Ward A", status: "Occupied", occupiedByPatientId: "pat-1", occupiedByPatientName: "Aarav Sharma", admissionId: "adm-2" },
  { id: "bed-5", bedNumber: "WARD-A-Spot2", ward: "General Ward A", status: "Available" },
  { id: "bed-6", bedNumber: "WARD-A-Spot3", ward: "General Ward A", status: "Available" },
  { id: "bed-7", bedNumber: "WARD-B-Spot1", ward: "General Ward B", status: "Available" },
  { id: "bed-8", bedNumber: "PEDS-1", ward: "Pediatrics", status: "Available" },
  { id: "bed-9", bedNumber: "EMR-1", ward: "Emergency Area", status: "Available" }
];

export const initialAdmissions: Admission[] = [
  {
    id: "adm-1",
    patientId: "pat-2",
    patientName: "Meera Patel",
    bedId: "bed-1",
    bedNumber: "ICU-101",
    ward: "ICU",
    admissionDate: "2026-05-21T10:45:00Z",
    admittingDiagnosis: "Hypertensive Crisis paired with high fever and potential early Sepsis symptoms",
    admittingDoctor: "Dr. Rajesh Kumar",
    vitalsHistory: [
      {
        id: "vital-2",
        patientId: "pat-2",
        timestamp: "2026-05-21T10:45:00Z",
        heartRate: 112,
        bloodPressure: "165/100",
        spO2: 92,
        temperature: 38.5,
        respiratoryRate: 22,
        recordedBy: "Nurse Priya Singh",
        isAnomaly: true,
        anomalyReason: "High BP, Tachycardia, and Hypoxia"
      }
    ],
    status: "Admitted"
  },
  {
    id: "adm-2",
    patientId: "pat-1",
    patientName: "Aarav Sharma",
    bedId: "bed-4",
    bedNumber: "WARD-A-Spot1",
    ward: "General Ward A",
    admissionDate: "2026-05-20T14:00:00Z",
    admittingDiagnosis: "Post-procedural Observation following coronary angioplasty",
    admittingDoctor: "Dr. Rajesh Kumar",
    vitalsHistory: [
      {
        id: "vital-1",
        patientId: "pat-1",
        timestamp: "2026-05-21T11:00:00Z",
        heartRate: 78,
        bloodPressure: "135/85",
        spO2: 98,
        temperature: 36.8,
        respiratoryRate: 16,
        recordedBy: "Nurse Priya Singh"
      }
    ],
    status: "Admitted"
  }
];

export const initialLabTests: LabTest[] = [
  {
    id: "lab-1",
    patientId: "pat-1",
    patientName: "Aarav Sharma",
    testName: "Lipid Profile & HbA1c",
    department: "Biochemistry",
    requestDate: "2026-05-21T09:40:00Z",
    requestedBy: "Dr. Rajesh Kumar",
    status: "Completed",
    results: "Cholesterol: 215 mg/dL (Borderline High), Triglycerides: 185 mg/dL (High), HDL: 42 mg/dL (Low), LDL: 136 mg/dL (High). HbA1c: 6.4% (Pre-diabetic target).",
    abnormalFlags: true
  },
  {
    id: "lab-2",
    patientId: "pat-2",
    patientName: "Meera Patel",
    testName: "Complete Blood Count & Blood Culture",
    department: "Hematology & Microbiology",
    requestDate: "2026-05-21T10:50:00Z",
    requestedBy: "Dr. Rajesh Kumar",
    status: "Sample Collected"
  },
  {
    id: "lab-3",
    patientId: "pat-3",
    patientName: "Rajesh Rao",
    testName: "Spirometry & Serum IgE",
    department: "Immunology",
    requestDate: "2026-05-21T11:20:00Z",
    requestedBy: "Dr. Ananya Nair",
    status: "Completed",
    results: "FEV1/FVC ratio is 68% (Indicative of mild obstructive airway disease). Serum IgE: 320 IU/mL (Extremely elevated, suggestive of atopic asthma).",
    abnormalFlags: true
  }
];

export const initialMedicines: Medicine[] = [
  { id: "med-1", name: "Amlodipine", dosageForm: "Tablet", strength: "5mg", stockCount: 1200, safetyStock: 200, unitPrice: 3.5, expiryDate: "2028-09-30", location: "Shelf A-1", category: "Cardiology", sku: "RX-AML-005", supplier: "Global Pharma Corp", costPrice: 1.20, manufacturer: "Pfizer" },
  { id: "med-2", name: "Metformin", dosageForm: "Tablet", strength: "500mg", stockCount: 2500, safetyStock: 300, unitPrice: 2.1, expiryDate: "2027-12-15", location: "Shelf B-3", category: "Endocrinology", sku: "RX-MET-500", supplier: "MediSource Distribution", costPrice: 0.70, manufacturer: "Sandoz" },
  { id: "med-3", name: "Amoxicillin", dosageForm: "Capsule", strength: "500mg", stockCount: 85, safetyStock: 150, unitPrice: 8.0, expiryDate: "2026-11-20", location: "Shelf C-1", category: "Anti-Infective", sku: "RX-AMX-500", supplier: "Apex Biologicals", costPrice: 3.10, manufacturer: "Teva" }, // Low Stock!
  { id: "med-4", name: "Atorvastatin", dosageForm: "Tablet", strength: "20mg", stockCount: 1400, safetyStock: 250, unitPrice: 4.8, expiryDate: "2028-03-22", location: "Shelf A-4", category: "Cardiology", sku: "RX-ATR-020", supplier: "Global Pharma Corp", costPrice: 1.80, manufacturer: "Merck" },
  { id: "med-5", name: "Salbutamol Inhaler", dosageForm: "Inhaler", strength: "100mcg", stockCount: 22, safetyStock: 50, unitPrice: 15.0, expiryDate: "2027-08-10", location: "Inhalers Drawer", category: "Respiratory", sku: "RX-SAL-100", supplier: "Oceanic Med Supply", costPrice: 6.50, manufacturer: "GlaxoSmithKline" }, // Low Stock!
  { id: "med-6", name: "Insulin Glargine Pen", dosageForm: "Injection", strength: "100 U/mL", stockCount: 45, safetyStock: 10, unitPrice: 38.0, expiryDate: "2026-10-05", location: "Fridge Row #2", category: "Endocrinology", sku: "RX-INS-100", supplier: "MediSource Distribution", costPrice: 19.50, manufacturer: "Sanofi" },
  { id: "med-7", name: "Clarithromycin", dosageForm: "Tablet", strength: "250mg", stockCount: 300, safetyStock: 100, unitPrice: 12.0, expiryDate: "2026-06-10", location: "Shelf C-2", category: "Anti-Infective", sku: "RX-CLA-250", supplier: "Apex Biologicals", costPrice: 4.00, manufacturer: "Abbott" }, // Expiring soon
  { id: "med-8", name: "Erythromycin", dosageForm: "Tablet", strength: "5000mg", stockCount: 150, safetyStock: 50, unitPrice: 9.5, expiryDate: "2026-05-10", location: "Shelf C-3", category: "Anti-Infective", sku: "RX-ERY-500", supplier: "Apex Biologicals", costPrice: 3.20, manufacturer: "Abbott" } // Already expired
];

export const initialBillingInvoices: BillingInvoice[] = [
  {
    id: "bil-1",
    invoiceNumber: "INV-2026-081",
    patientId: "pat-1",
    patientName: "Aarav Sharma",
    date: "2026-05-21T10:00:00Z",
    items: [
      { description: "OPD Consultation - Cardiology", category: "OPD Consultation", amount: 800 },
      { description: "Lab Test - Lipid & HbA1c Panel", category: "Laboratory", amount: 1200 },
      { description: "Pharmacy - Amlodipine 30 Days Pack", category: "Pharmacy", amount: 105 }
    ],
    totalAmount: 2105,
    insuranceClaimed: 0,
    status: "Paid"
  },
  {
    id: "bil-2",
    invoiceNumber: "INV-2026-082",
    patientId: "pat-2",
    patientName: "Meera Patel",
    date: "2026-05-21T11:00:00Z",
    items: [
      { description: "Emergency Intake & ICU Bed Admission Dep.", category: "Room Rent", amount: 5000 },
      { description: "Hematology & Microbiology Cultures Charge", category: "Laboratory", amount: 2400 },
      { description: "Consultation Charge - Critical Care Intake", category: "OPD Consultation", amount: 1500 }
    ],
    totalAmount: 8900,
    insuranceClaimed: 7000,
    status: "Pending_TPA",
    tpaApproved: false
  }
];

export const initialConsultations: Consultation[] = [
  {
    id: "cons-1",
    appointmentId: "appt-1",
    patientId: "pat-1",
    doctorName: "Dr. Rajesh Kumar",
    dateTime: "2026-05-21T09:45:00Z",
    symptoms: ["Mild chest fullness on climbing high stairs", "Slight fatigue in mornings"],
    notes: "Patient presents for regular monthly blood pressure monitoring. BP is slightly elevated but currently within borderline margins (135/85). Reviewed blood tests.",
    diagnosis: "Essential Hypertension - Stable but needs diet monitoring and continuation of daily Amlodipine.",
    prescriptions: ["Amlodipine 5mg once daily", "Avoid high sodium intake"],
    recommendedLabs: ["Lipid Profile & HbA1c in 3 months"],
    riskLevel: "Low"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-05-21T09:00:00Z",
    user: "Dr. Rajesh Kumar",
    role: "Physician",
    action: "OPD Patient Intake",
    department: "OPD Department",
    details: "Initiated clinical file consultation for Aarav Sharma (UHID-2026-6401)."
  },
  {
    id: "log-2",
    timestamp: "2026-05-21T10:45:00Z",
    user: "Nurse Priya Singh",
    role: "Nurse",
    action: "Emergency Vitals Log",
    department: "Emergency - IPD",
    details: "Recorded critical vital signs check for Meera Patel. Tachycardia & active hypoxic reading of 92% detected."
  },
  {
    id: "log-3",
    timestamp: "2026-05-21T10:50:00Z",
    user: "Dr. Rajesh Kumar",
    role: "Physician",
    action: "Bed Allocation Approved",
    department: "ICU Ward",
    details: "Dispatched immediate admission for Meera Patel to ICU Bed ICU-101."
  },
  {
    id: "log-4",
    timestamp: "2026-05-21T11:00:00Z",
    user: "Admin Amit Joshi",
    role: "Admin",
    action: "Invoice Billing Generation",
    department: "Finance",
    details: "Created TPA-Invoiced Pre-Auth query for ICU Admission (ID: INV-2026-082)."
  }
];
