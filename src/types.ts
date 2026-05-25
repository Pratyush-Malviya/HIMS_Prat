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
  category?: string;
  sku?: string;
  supplier?: string;
  costPrice?: number;
  manufacturer?: string;
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
  email: string;
  phone: string;
  role: string; // e.g. "Physician" | "Nurse" | "Admin" | "Lab Head" | "Pharmacy Boss" or Custom Roles
  department: string;
  joiningDate: string;
  salary: number;
  shiftPattern: "Morning (08:00 - 16:00)" | "Evening (16:00 - 24:00)" | "Night (24:00 - 08:00)";
  attendanceStatus: "On-Duty" | "Off-Duty" | "On-Leave";
  commissionPct?: number;
  permittedModules: string[]; // e.g. ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "hr"]
  isOnCall?: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  defaultDepartment: string;
  defaultPermittedModules: string[];
}

export interface HospitalProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string; // Base64 image data or custom path
  taxNumber?: string;
  accreditation?: string;
}

export interface PainPointSlide {
  id: string;
  title: string;
  category: string;
  problemBadge: string;
  problemTitle: string;
  problemDesc: string;
  problemImage: string;
  solutionBadge: string;
  solutionTitle: string;
  solutionDesc: string;
  solutionImage: string;
  metricValue: string;
  metricLabel: string;
  remedyBullets: string[];
}

export interface FeatureModule {
  id: string;
  title: string;
  badge: string;
  desc: string;
  imageUrl: string;
  points: string[];
}

export interface SupportTicket {
  id: string;
  tenantName: string;
  category: "Billing" | "LIS Connection" | "HIPAA Compliance" | "EMR Crash" | "Access Key Issues" | "General Bug" | "Service Offline";
  subject: string;
  status: "Open" | "Assigned" | "Resolving" | "Closed";
  priority: "High" | "Medium" | "Urgent" | "Low";
  assignedEngineer: string;
  slaMinutesRemaining: number;
  message: string;
  createdTime: string;
  csatScore?: number;
  employeeName?: string;
  employeeEmail?: string;
}

export interface SuperAdminEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  permittedModules: string[];
  createdAt: string;
  active: boolean;
}

export interface LandingPageConfig {
  fontFamily: "Inter" | "Space Grotesk" | "Playfair Display" | "JetBrains Mono";
  primaryColor: "emerald" | "indigo" | "teal" | "sky" | "blue" | "violet" | "rose";
  backgroundColorMode: "light" | "slate" | "stone" | "zinc";
  announcementText: string;
  heroHeaderPart1: string;
  heroHeaderPart2: string;
  heroSubheadline: string;
  heroButtonLeftText: string;
  heroButtonRightText: string;
  heroImage: string;
  painPointsSlides: PainPointSlide[];
  featuresList: FeatureModule[];
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
  landingPageConfig: LandingPageConfig;
  hospitalProfile: HospitalProfile;
  supportTickets: SupportTicket[];
  superAdminEmployees: SuperAdminEmployee[];
  updateHospitalProfile: (profile: Partial<HospitalProfile>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  onboardEmployee: (emp: Employee) => void;
  updateEmployeePermissions: (id: string, permittedModules: string[]) => void;
  removeEmployee: (id: string) => void;
  toggleEmployeeOnCall: (id: string) => void;
  addCustomRole: (role: CustomRole) => void;
  removeCustomRole: (id: string) => void;
  updateLandingPageConfig: (config: Partial<LandingPageConfig>) => void;
  raiseSupportTicket: (ticket: Omit<SupportTicket, "id" | "createdTime" | "status" | "assignedEngineer" | "slaMinutesRemaining">) => SupportTicket;
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => void;
  addSuperAdminEmployee: (emp: SuperAdminEmployee) => void;
  removeSuperAdminEmployee: (id: string) => void;
  updateSuperAdminEmployeePermissions: (id: string, permittedModules: string[]) => void;
  createLog: (user: string, role: string, action: string, dept: string, details: string) => AuditLog;
  importBulkData: (type: "patients" | "medicines" | "billing", data: any[]) => void;
}
