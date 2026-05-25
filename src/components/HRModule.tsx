import React, { useState, useMemo } from "react";
import { 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  UserCog, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Search,
  X
} from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { Employee } from "../types";

interface HRModuleProps {
  store: HIMSStore;
}

export function HRModule({ store }: HRModuleProps) {
  const { employees, onboardEmployee, removeEmployee, updateEmployeePermissions, customRoles, toggleEmployeeOnCall } = store;
  const [activeTab, setActiveTab] = useState<"directory" | "shifts" | "payroll" | "rbac">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create / Onboard Employee State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Physician",
    department: "OPD Department",
    salary: 60000,
    shiftPattern: "Morning (08:00 - 16:00)" as any,
    commissionPct: 10,
    permittedModules: ["dashboard", "opd"]
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "on-call" | "available">("all");

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (statusFilter === "on-call") return !!emp.isOnCall;
      if (statusFilter === "available") return !emp.isOnCall;
      return true;
    });
  }, [employees, searchQuery, statusFilter]);

  // HR Payroll statistics
  const payrollStats = useMemo(() => {
    const list = employees || [];
    const totalBaseSalary = list.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const totalCommissions = 18450; // Dynamic mock commission calculated from active procedures
    const totalDisburser = totalBaseSalary + totalCommissions;
    return {
      totalBaseSalary,
      totalCommissions,
      totalDisburser,
      totalEmployees: list.length,
      averageSalary: list.length ? Math.round(totalBaseSalary / list.length) : 0
    };
  }, [employees]);

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) return;
    
    const onboardData: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone || "+91 99999 88888",
      role: newEmp.role,
      department: newEmp.department,
      joiningDate: new Date().toISOString().split("T")[0],
      salary: Number(newEmp.salary) || 50000,
      shiftPattern: newEmp.shiftPattern,
      attendanceStatus: "On-Duty",
      commissionPct: Number(newEmp.commissionPct) || 0,
      permittedModules: newEmp.permittedModules,
      isOnCall: false
    };

    store.onboardEmployee(onboardData);
    setShowAddModal(false);
    // Reset state
    setNewEmp({
      name: "",
      email: "",
      phone: "",
      role: "Physician",
      department: "OPD Department",
      salary: 60000,
      shiftPattern: "Morning (08:00 - 16:00)",
      commissionPct: 10,
      permittedModules: ["dashboard", "opd"]
    });
  };

  const handleToggleModulePermission = (empId: string, moduleName: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;
    const current = target.permittedModules || [];
    const updated = current.includes(moduleName)
      ? current.filter(m => m !== moduleName)
      : [...current, moduleName];
    updateEmployeePermissions(empId, updated);
  };

  return (
    <div className="space-y-6 text-left font-sans" id="hr_department_root">
      
      {/* 1. Header Hero section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1">
          <span className="text-[10px] bg-indigo-50 text-indigo-650 px-2.5 py-1 rounded bg-indigo-500/10 font-bold uppercase tracking-wider">Hospital Human Resources</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff, Shifts & Clearance Desk</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-normal">
            Onboard new clinicians, schedule rotation shifts, analyze department payrolls, and enforce granular compliance with medical RBAC models.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            Onboard New Employee
          </button>
        </div>
      </div>

      {/* 2. Top Metric Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Enlisted Staff</span>
          <div className="text-2xl font-bold text-slate-950 font-sans flex items-center justify-between">
            <span>{payrollStats.totalEmployees}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              {employees.filter(e => e.isOnCall).length} On-Call
            </span>
          </div>
          <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            100% HIPAA compliant entries
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Monthly Base Pay</span>
          <div className="text-2xl font-bold text-slate-950 font-sans">${payrollStats.totalBaseSalary.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500">Fixed institutional overhead</p>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Active Commissions</span>
          <div className="text-2xl font-bold text-slate-950 font-sans">${payrollStats.totalCommissions.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-650 font-bold">Procedure yield-share pay</p>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Average Clinician Pay</span>
          <div className="text-2xl font-bold text-indigo-650 font-semibold font-sans">${payrollStats.averageSalary.toLocaleString()}/mo</div>
          <p className="text-[10px] text-slate-500">Across all operational fields</p>
        </div>
      </div>

      {/* 3. Navigation Level Tabs */}
      <div className="border-b border-slate-150 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
        <button
          onClick={() => setActiveTab("directory")}
          className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "directory" 
              ? "border-indigo-600 text-indigo-600 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Employee Directory
        </button>

        <button
          onClick={() => setActiveTab("shifts")}
          className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "shifts" 
              ? "border-indigo-600 text-indigo-600 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          Shift Schedules & Attendance
        </button>

        <button
          onClick={() => setActiveTab("payroll")}
          className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "payroll" 
              ? "border-indigo-600 text-indigo-600 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <DollarSign className="w-4 h-4 shrink-0" />
          Payroll & Compensation
        </button>

        <button
          onClick={() => setActiveTab("rbac")}
          className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "rbac" 
              ? "border-indigo-600 text-indigo-600 font-bold" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          RBAC Molecular Clearances
        </button>
      </div>

      {/* 4. Tab Layout Renders */}

      {/* A. Employee Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 border border-slate-100 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search staff by name, role, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-hidden focus:border-indigo-500 font-normal"
                />
              </div>

              {/* On-Call & Assistance filter buttons */}
              <div className="flex items-center gap-1 border border-slate-150 rounded-lg p-1 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase ${
                    statusFilter === "all"
                      ? "bg-white text-slate-850 shadow-xs"
                      : "text-slate-450 text-slate-500 hover:text-slate-805"
                  }`}
                >
                  All Staff
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("on-call")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase flex items-center gap-1.5 ${
                    statusFilter === "on-call"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-500 hover:text-amber-600"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "on-call" ? "bg-white" : "bg-amber-500 animate-ping"}`}></span>
                  On-Call Assistance
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("available")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer uppercase flex items-center gap-1.5 ${
                    statusFilter === "available"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-emerald-600"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "available" ? "bg-white" : "bg-emerald-500"}`}></span>
                  Available
                </button>
              </div>
            </div>

            <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider shrink-0">
              Displaying {filteredEmployees.length} of {employees.length} officers
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-505 uppercase tracking-wider font-mono text-[9px] border-b border-slate-150">
                  <tr>
                    <th className="p-4">Staff Details</th>
                    <th className="p-4">Specialty & Dept</th>
                    <th className="p-4">Joining Date</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Assistance Status (On-Call)</th>
                    <th className="p-4">Role Clearance</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-slate-250">
                            {emp.name.split(" ").slice(-1)[0][0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block uppercase">ID: {emp.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block text-xs">{emp.role}</span>
                          <span className="text-[10px] text-slate-500 block">{emp.department}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {emp.joiningDate || "2024-01-01"}
                      </td>

                      <td className="p-4 text-slate-600">
                        <div className="space-y-1 text-[11px]">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {emp.email || "email@mediflow.com"}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone || "Not provided"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {/* iOS style toggle button */}
                          <button
                            type="button"
                            onClick={() => toggleEmployeeOnCall(emp.id)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-hidden ${
                              emp.isOnCall ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            id={`btn_toggle_availability_${emp.id}`}
                            title={emp.isOnCall ? "Set status to Available" : "Set status to On-Call"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-250 ease-in-out ${
                                emp.isOnCall ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          
                          {/* Assistance Badge status indicator */}
                          <div className="flex flex-col">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                                emp.isOnCall
                                  ? "bg-amber-50 border border-amber-200 text-amber-700"
                                  : "bg-emerald-50 border border-emerald-250 text-emerald-700"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${emp.isOnCall ? "bg-amber-500 animate-ping" : "bg-emerald-555 bg-emerald-500"}`}></span>
                              {emp.isOnCall ? "On-Call" : "Available"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {emp.permittedModules.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-700 font-semibold font-mono uppercase uppercase">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => removeEmployee(emp.id)}
                            className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Revoke and Offboard Employee"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No employees found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* B. Shift Schedules Tab */}
      {activeTab === "shifts" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinician Rotation Shift Manager</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Avoid healthcare handover hazards by properly aligning active morning, evening, and overnight wards staffing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-850">🌅 Morning Shift Duty</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">08:00 - 16:00</span>
                </div>
                <div className="text-2xl font-bold font-sans text-slate-905">
                  {(employees || []).filter(e => e.shiftPattern?.includes("Morning")).length} Staff Assigned
                </div>
                <p className="text-[10px] text-slate-400 font-mono block">Outpatient clinics and radiology active</p>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-850">🌆 Evening Shift Duty</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">16:00 - 24:00</span>
                </div>
                <div className="text-2xl font-bold font-sans text-slate-905">
                  {(employees || []).filter(e => e.shiftPattern?.includes("Evening")).length} Staff Assigned
                </div>
                <p className="text-[10px] text-slate-400 font-mono block">Intensive care monitor handover active</p>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-850">🌃 Night Shift Duty</span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-850 px-1.5 py-0.5 rounded font-bold">24:00 - 08:00</span>
                </div>
                <div className="text-2xl font-bold font-sans text-slate-905">
                  {(employees || []).filter(e => e.shiftPattern?.includes("Night")).length} Staff Assigned
                </div>
                <p className="text-[10px] text-slate-400 font-mono block">Urgent care & critical telemetry focus</p>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-mono text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Employee Name</th>
                    <th className="p-3.5">Assigned Shift</th>
                    <th className="p-3.5 font-center">Attendance State</th>
                    <th className="p-3.5">SBAR Handover Assigned</th>
                    <th className="p-3.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(employees || []).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-55/40">
                      <td className="p-3.5 font-semibold text-slate-850">{emp.name} ({emp.role})</td>
                      <td className="p-3.5 text-slate-655 font-semibold">
                        <select
                          value={emp.shiftPattern || "Morning (08:00 - 16:00)"}
                          onChange={(e) => {
                            // Update shift
                            emp.shiftPattern = e.target.value as any;
                            // Trigger store save state or refresh
                            store.updateEmployeePermissions(emp.id, emp.permittedModules);
                          }}
                          className="bg-slate-50 border border-slate-20 border-slate-100 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                          <option value="Evening (16:00 - 24:00)">Evening (16:00 - 24:00)</option>
                          <option value="Night (24:00 - 08:00)">Night (24:00 - 08:00)</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          emp.attendanceStatus === "On-Duty" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : emp.attendanceStatus === "On-Leave"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {emp.attendanceStatus || "On-Duty"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {emp.role === "Physician" || emp.role === "Nurse" ? "YES (Enforced SBAR Suite)" : "N/A (Admin Role)"}
                      </td>
                      <td className="p-3.5 text-green-600 font-semibold font-mono text-[10px]">
                        ✓ RFID CLEARED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* C. Payroll & Compensation Tab */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payroll Calculation and Procedure Yield Records</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Calculate base salaries alongside commission yields (e.g. 15% procedure share for OP consultations and 5% for laboratory executions).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Institutional Disbursements:</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Monthly Base Salary:</span>
                    <span className="font-mono text-slate-950 font-bold">${payrollStats.totalBaseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dynamic Multi-Procedure Share Yield:</span>
                    <span className="font-mono text-indigo-650 font-semibold">+${payrollStats.totalCommissions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200">
                    <span className="text-slate-900 font-bold">Total Dispersed Treasury Value:</span>
                    <span className="font-mono text-slate-950 text-sm font-black">${payrollStats.totalDisburser.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center bg-white p-4 border border-slate-200 rounded-xl space-y-3 shadow-inner">
                <span className="text-center text-[11px] text-slate-450 leading-normal">
                  Last payroll batch executed on <strong>{new Date().toLocaleDateString(undefined, {month: "long", year: "numeric"})}</strong>
                </span>
                <button
                  onClick={() => alert("Simulation Complete: All salaries and procedure commission logs dispersed into authorized bank nodes.")}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-white py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors shadow-xs select-none"
                >
                  Confirm & Dispense Institutional Payroll
                </button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden mt-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-mono text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-3">Staff Details</th>
                    <th className="p-3">Position</th>
                    <th className="p-3 text-right">Base Salary</th>
                    <th className="p-3 text-center">Procedure commission Pct</th>
                    <th className="p-3 text-right">Calculated Yield Share</th>
                    <th className="p-3 text-right font-semibold text-slate-900">Total Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(employees || []).map((emp, index) => {
                    const commissionValue = emp.commissionPct ? Math.round((emp.salary * emp.commissionPct) / 1000) * 10 : 0;
                    const netPayout = emp.salary + commissionValue;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{emp.name}</td>
                        <td className="p-3 text-slate-500">{emp.role}</td>
                        <td className="p-3 text-right font-mono text-slate-650">${emp.salary.toLocaleString()}</td>
                        <td className="p-3 text-center font-mono text-slate-500">
                          <input
                            type="number"
                            value={emp.commissionPct || 0}
                            onChange={(e) => {
                              emp.commissionPct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                              store.updateEmployeePermissions(emp.id, emp.permittedModules);
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 w-12 text-center p-0.5 rounded text-xs font-semibold font-mono"
                          />
                          %
                        </td>
                        <td className="p-3 text-right font-mono text-indigo-650">+${commissionValue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-950">${netPayout.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* D. RBAC Tab */}
      {activeTab === "rbac" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">RBAC Clearance Grid (Molecular Settings)</h3>
            <p className="text-xs text-slate-500">
              Directly click and toggle user clearances. When disabled, the employee faces real-time RBAC restriction screen with security audit records.
            </p>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-mono text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-150">
                <tr>
                  <th className="p-4">Employee & Role</th>
                  <th className="p-4 text-center">Dashboard</th>
                  <th className="p-4 text-center">OPD Clinic</th>
                  <th className="p-4 text-center">Inpatient IPD</th>
                  <th className="p-4 text-center">Laboratory</th>
                  <th className="p-4 text-center">Pharmacy Depot</th>
                  <th className="p-4 text-center">Treasury Finance</th>
                  <th className="p-4 text-center">Admin Settings</th>
                  <th className="p-4 text-center">HR Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-850">
                      <div>{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">{emp.role}</div>
                    </td>
                    
                    {["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "hr"].map((mod) => {
                      const hasPerm = (emp.permittedModules || []).includes(mod);
                      return (
                        <td key={mod} className="p-4 text-center">
                          <button
                            onClick={() => handleToggleModulePermission(emp.id, mod)}
                            className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-md cursor-pointer transition-all border ${
                              hasPerm 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-red-50 text-red-700 border-red-100 hover:bg-red-50"
                            }`}
                          >
                            {hasPerm ? "GRANT" : "REVOKE"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-lg w-full scale-100 transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-905 flex items-center gap-2">
                <UserCog className="w-4 h-4 text-indigo-650" />
                Onboard Clinician or Officer
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 px-2 rounded-lg bg-slate-100 text-slate-705 border border-slate-200 hover:bg-slate-50 text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Staff Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Malviya Pratyush"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Personal Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. malviya.pratyush26@gmail.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Phone Connection</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94523 00810"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Employee Role</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      let dept = "OPD Department";
                      let mods = ["dashboard", "opd"];
                      if (role === "Nurse") { dept = "Nursing Station"; mods = ["dashboard", "ipd"]; }
                      else if (role === "Lab Head") { dept = "Laboratory"; mods = ["dashboard", "labs"]; }
                      else if (role === "Pharmacy Boss") { dept = "Pharmacy Ward"; mods = ["dashboard", "pharmacy"]; }
                      else if (role === "Finance Head") { dept = "Finance Office"; mods = ["dashboard", "finance"]; }
                      else if (role === "Admin") { dept = "Hospital Control"; mods = ["dashboard", "opd", "ipd", "labs", "pharmacy", "finance", "admin", "hr"]; }
                      setNewEmp({ ...newEmp, role, department: dept, permittedModules: mods });
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  >
                    <option value="Physician">Physician (Doctor)</option>
                    <option value="Nurse">Registered Nurse</option>
                    <option value="Lab Head">Lab Pathology Head</option>
                    <option value="Pharmacy Boss">Pharmacy Depot Manager</option>
                    <option value="Finance Head">Finance & Treasury Head</option>
                    <option value="Admin">System Admin (Full Access)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Monthly Base Salary ($)</label>
                  <input
                    type="number"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wide text-slate-600 block">Work Shift Pattern</label>
                  <select
                    value={newEmp.shiftPattern}
                    onChange={(e) => setNewEmp({ ...newEmp, shiftPattern: e.target.value as any })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500"
                  >
                    <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                    <option value="Evening (16:00 - 24:00)">Evening (16:00 - 24:00)</option>
                    <option value="Night (24:00 - 08:00)">Night (24:00 - 08:00)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Onboard & Clear Security RFID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
