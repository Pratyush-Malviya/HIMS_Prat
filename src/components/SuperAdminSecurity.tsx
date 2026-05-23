import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Check, 
  Plus, 
  User, 
  FileText,
  AlertCircle
} from "lucide-react";
import { HospitalTenant } from "./SuperAdminHospitals";

interface SuperAdminSecurityProps {
  tenants: HospitalTenant[];
}

interface JITAccessRecord {
  id: string;
  technicianName: string;
  tenantName: string;
  reason: string;
  durationMinutes: number;
  grantedTime: string;
  status: "Active" | "Expired" | "Revoked";
}

const INITIAL_JIT_RECORDS: JITAccessRecord[] = [
  {
    id: "JIT-1901",
    technicianName: "Alex Thompson (Senior Dev)",
    tenantName: "Metro General Hospital Corp",
    reason: "Debugging Sysmex LIS port telemetry drop in pediatric unit",
    durationMinutes: 30,
    grantedTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "Active"
  },
  {
    id: "JIT-0842",
    technicianName: "Priya Nair (Database Admin)",
    tenantName: "Lotus Kids & Pediatric Clinic",
    reason: "Restoring corrupted billing ledger schemas under standard index templates",
    durationMinutes: 60,
    grantedTime: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    status: "Expired"
  }
];

export function SuperAdminSecurity({ tenants }: SuperAdminSecurityProps) {
  const [jitRecords, setJitRecords] = useState<JITAccessRecord[]>(INITIAL_JIT_RECORDS);
  const [showAddJIT, setShowAddJIT] = useState(false);

  // New JIT form fields
  const [techName, setTechName] = useState("SaaS Engineer Priya");
  const [targetTenantId, setTargetTenantId] = useState(tenants[0]?.uid || "hosp-alpha");
  const [justification, setJustification] = useState("");
  const [duration, setDuration] = useState(45);

  const handleCreateJIT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;

    const selectedTenantName = tenants.find(t => t.uid === targetTenantId)?.name || "Selected Tenant";

    const record: JITAccessRecord = {
      id: `JIT-${Math.floor(1000 + Math.random() * 9000)}`,
      technicianName: techName,
      tenantName: selectedTenantName,
      reason: justification,
      durationMinutes: duration,
      grantedTime: new Date().toISOString(),
      status: "Active"
    };

    setJitRecords([record, ...jitRecords]);
    setShowAddJIT(false);
    setJustification("");
  };

  const handleRevokeJIT = (id: string) => {
    setJitRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: "Revoked" as const } : rec));
  };

  return (
    <div className="space-y-6" id="super_admin_security_tab">
      
      {/* Top dashboard row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Audit Compliance Check</span>
          <span className="text-2xl font-bold text-emerald-600 block mt-1">Symmetric AES-256</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">HIPAA and SSL Compliant Logs</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-sans">Active JIT Session credentials</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1">
            {jitRecords.filter(t => t.status === "Active").length}
          </span>
          <span className="text-rose-600 text-[10px] font-mono block mt-0.5">⚠️ Self-Expiring Tokens</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Authorized Admin Nodes</span>
          <span className="text-2xl font-bold text-indigo-650 block mt-1">3 Stations</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Strict IP Bound Controls</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Security warnings and Audit procedures */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 space-y-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex gap-2">
              <div className="p-2 bg-rose-500/15 text-rose-400 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-rose-450 text-rose-400">HIPAA Security Protocol (JIT-3)</h4>
                <p className="text-[11px] text-slate-350 leading-relaxed font-normal">
                  Super-Admins do NOT possess persistent master credentials to client hospital databases. Technical support interventions require initiating a <strong>Just-In-Time (JIT) access grant</strong>.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80 font-mono">
              • Access logs are cryptographically sealed.<br />
              • Grants automatically dissolve on timer expiration.<br />
              • Actions are reported in executive regulatory briefs.
            </p>
          </div>

          {/* Table of Active Admin nodes */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Authorized Admin Terminal Handshakes</h4>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 p-2 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-700">Node-HIMS-CY</span>
                </div>
                <span className="text-slate-400">127.0.0.1 (Ingress)</span>
              </div>

               <div className="flex items-center justify-between text-[11px] font-mono bg-slate-50 p-2 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="font-bold text-slate-600">Terminal-Audit-9</span>
                </div>
                <span className="text-slate-400">Offline (IP Masked)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: JIT logs and triggers */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Just-In-Time Technical Access Ledger</h3>
              <p className="text-[10px] text-slate-400">Cryptographically audited temporary technician permission mappings.</p>
            </div>
            
            <button
              onClick={() => setShowAddJIT(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-755 hover:bg-slate-800 text-white font-mono uppercase text-[9px] font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Temporary JIT</span>
            </button>
          </div>

          <div className="space-y-3">
            {jitRecords.map(rec => {
              const minutesElapsed = Math.floor((Date.now() - new Date(rec.grantedTime).getTime()) / (60 * 1000));
              const minutesRemaining = Math.max(0, rec.durationMinutes - minutesElapsed);
              const isWarning = minutesRemaining <= 10;
              
              const isStillActive = rec.status === "Active" && minutesRemaining > 0;

              return (
                <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-slate-655 text-slate-500">{rec.id}</span>
                      <span className="font-bold text-slate-800 text-xs">• Technician: {rec.technicianName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-455 text-slate-400">
                      Target: <strong className="text-slate-600">{rec.tenantName}</strong> | Reason: <span className="italic text-slate-600 font-sans">"{rec.reason}"</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Granted: {new Date(rec.grantedTime).toLocaleString()} ({rec.durationMinutes} min limit)
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start md:self-center">
                    {isStillActive ? (
                      <div className="flex flex-col items-end gap-1 font-mono text-right shrink-0">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-bold border border-emerald-100 uppercase animate-pulse">
                          ACTIVE GRANT
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isWarning ? "text-rose-600" : "text-emerald-600"}`}>
                          <Clock className="w-3 h-3" />
                          {minutesRemaining} min left
                        </span>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                        rec.status === "Revoked" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-100 text-slate-500"
                      }`}>
                        {rec.status === "Revoked" ? "REVOKED EARLY" : "EXPIRED"}
                      </span>
                    )}

                    {isStillActive && (
                      <button
                        onClick={() => handleRevokeJIT(rec.id)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-rose-600 hover:text-rose-700 font-mono text-[9px] font-extrabold uppercase border border-slate-200 rounded cursor-pointer"
                      >
                        Revoke JIT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* JIT Form Popup Modal */}
      {showAddJIT && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl shadow-2xl p-6 text-left relative">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-xs font-mono font-bold text-indigo-505 text-indigo-500 uppercase tracking-wider">SECURE AUDIT CREDENTIAL DISPATCH</h4>
              <p className="text-sm font-bold text-slate-800 mt-0.5">Request Temporary Support Access (SBAR JIT-1)</p>
            </div>

            <form onSubmit={handleCreateJIT} className="space-y-4 pt-4 text-xs font-semibold text-slate-650 text-slate-600">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Assigned Field Technician</label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full font-bold bg-slate-50 border border-slate-200 p-2.5 text-slate-800 rounded-lg outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Target Hospital database Cluster</label>
                <select
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800 outline-none"
                >
                  {tenants.map(t => (
                    <option key={t.uid} value={t.uid}>{t.name} (ID: {t.uid})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-355 uppercase text-slate-400 font-extrabold flex justify-between">
                  <span>JIT Session Duration (SLA Block)</span>
                  <span className="text-indigo-600 font-bold">{duration} minutes limit</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400">Audit Justification (Required HIPAA Rule-3)</label>
                <textarea
                  placeholder="e.g. Debugging pathological packet failure on Router node 3, or auditing billing invoice schemas..."
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 p-2.5 h-16 rounded-lg text-xs font-semibold placeholder-slate-400 outline-none focus:border-slate-400"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-805 text-indigo-700 text-[10px] leading-relaxed font-sans rounded-xl">
                <strong>HIPAA AUDITOR DIRECTIVE:</strong> Generating JIT credentials triggers a permanent cryptographic record entry under master audited controls. Only dispatch under authorized patient support parameters.
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddJIT(false)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-505 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-450 text-slate-950 font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Confirm JIT Credential Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
