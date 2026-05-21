export interface Patient {
  id: string;
  uhid: string; // Universal Health ID
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  phone: string;
  address: string;
  allergies: string[];
  medicalHistory: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  dateTime: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-Show";
  urgency: "Routine" | "Urgent" | "Emergency";
  notes?: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  timestamp: string;
  heartRate: number; // bpm
  bloodPressure: string; // e.g., "120/80"
  spO2: number; // oxygen sat %
  temperature: number; // °C
  respiratoryRate: number; // breaths per min
  recordedBy: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface Consultation {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorName: string;
  dateTime: string;
  symptoms: string[];
  notes: string;
  diagnosis: string;
  prescriptions: string[];
  recommendedLabs: string[];
  riskLevel: "Low" | "Moderate" | "High";
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  department: string;
  requestDate: string;
  requestedBy: string;
  status: "Requested" | "Sample Collected" | "Processing" | "Completed";
  results?: string; // Text finding or parsed results
  abnormalFlags?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosageForm: string; // e.g., "Tablet", "Injection", "Syrup"
  strength: string; // e.g., "500mg"
  stockCount: number;
  safetyStock: number; // low-stock trigger
  unitPrice: number;
  expiryDate: string;
  location: string; // Pharmacy shelf e.g. "A1-Shelf 3"
}

export interface Bed {
  id: string;
  bedNumber: string;
  ward: "ICU" | "General Ward A" | "General Ward B" | "Pediatrics" | "Emergency Area";
  status: "Available" | "Occupied" | "Maintenance";
  occupiedByPatientId?: string;
  occupiedByPatientName?: string;
  admissionId?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  ward: string;
  admissionDate: string;
  admittingDiagnosis: string;
  admittingDoctor: string;
  vitalsHistory: VitalSign[];
  status: "Admitted" | "Discharged";
  dischargeDate?: string;
  dischargeSummary?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: Array<{
    description: string;
    category: "OPD Consultation" | "Room Rent" | "Laboratory" | "Pharmacy" | "Taxes";
    amount: number;
  }>;
  totalAmount: number;
  insuranceClaimed: number;
  status: "Unpaid" | "Paid" | "Pending_TPA";
  tpaApproved?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: "Physician" | "Nurse" | "Admin" | "Lab Head" | "Pharmacy Boss";
  action: string;
  department: string;
  details: string;
}

export interface NotificationAlert {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  anomalyReason: string;
  assignedNurse: string;
  assignedPhysician: string;
  admissionId?: string;
  read: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string; // e.g. "Physician" | "Nurse" | "Admin" | "Lab Head" | "Pharmacy Boss" or Custom Roles
  department: string;
  permittedModules: string[]; // e.g. ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin"]
}

export interface CustomRole {
  id: string;
  name: string;
  defaultDepartment: string;
  defaultPermittedModules: string[];
}

export interface HIMSStore {
  patients: Patient[];
  appointments: Appointment[];
  vitals: VitalSign[];
  consultations: Consultation[];
  labTests: LabTest[];
  medicines: Medicine[];
  beds: Bed[];
  admissions: Admission[];
  billing: BillingInvoice[];
  auditLogs: AuditLog[];
  notifications: NotificationAlert[];
  employees: Employee[];
  customRoles: CustomRole[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  onboardEmployee: (emp: Employee) => void;
  updateEmployeePermissions: (id: string, permittedModules: string[]) => void;
  removeEmployee: (id: string) => void;
  addCustomRole: (role: CustomRole) => void;
  removeCustomRole: (id: string) => void;
}
