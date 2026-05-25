import React, { useState, useMemo } from "react";
import { 
  HelpCircle, 
  HelpCircle as TicketIcon, 
  Clock, 
  User, 
  AlertTriangle, 
  MessageSquare, 
  Sparkles, 
  Check, 
  CornerDownRight,
  TrendingUp,
  Sliders,
  Tag,
  AlertCircle
} from "lucide-react";
import { HospitalTenant } from "./SuperAdminHospitals";
import { HIMSStore, SupportTicket } from "../types";

interface SuperAdminSupportProps {
  tenants: HospitalTenant[];
  store: HIMSStore;
}

export function SuperAdminSupport({ tenants, store }: SuperAdminSupportProps) {
  const tickets = store.supportTickets;
  const [selectedTicketId, setSelectedTicketId] = useState<string>("TKT-3091");
  const [replyMessage, setReplyMessage] = useState("");
  const [engineerFilter, setEngineerFilter] = useState("All");

  const [tStatus, setTStatus] = useState<SupportTicket["status"]>("Open");
  const [tPriority, setTPriority] = useState<SupportTicket["priority"]>("Urgent");
  const [tEngineer, setTEngineer] = useState("Alex Thompson (AI Agent)");

  const selectTicket = useMemo(() => {
    const t = tickets.find(x => x.id === selectedTicketId);
    if (t) {
      return t;
    }
    return tickets[0];
  }, [tickets, selectedTicketId]);

  const filteredTickets = useMemo(() => {
    if (engineerFilter === "All") return tickets;
    return tickets.filter(t => t.assignedEngineer === engineerFilter);
  }, [tickets, engineerFilter]);

  // Support success metrics
  const csatAvg = useMemo(() => {
    const rated = tickets.filter(t => t.csatScore !== undefined);
    if (!rated.length) return 4.8;
    return (rated.reduce((sum, t) => sum + (t.csatScore || 0), 0) / rated.length).toFixed(1);
  }, [tickets]);

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectTicket) return;

    store.updateSupportTicket(selectTicket.id, {
      status: tStatus,
      priority: tPriority,
      assignedEngineer: tEngineer
    });

    if (replyMessage.trim()) {
      store.createLog(
        "SaaS Super Admin",
        "Support Engineer",
        "Ticket Response Audit",
        "Support Desk System",
        `Replied to ticket ${selectTicket.id}: "${replyMessage}"`
      );
    }

    setReplyMessage("");
  };

  const handleResolveTicketDirect = (id: string) => {
    store.updateSupportTicket(id, {
      status: "Closed",
      csatScore: 5,
      slaMinutesRemaining: 0
    });
  };

  return (
    <div className="space-y-6" id="super_admin_support_tab_root">
      
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Tickets</span>
          <span className="text-2xl font-bold text-slate-800 block mt-1">
            {tickets.filter(t => t.status !== "Closed").length}
          </span>
          <span className="text-amber-600 text-[10px] font-mono block mt-0.5 animate-pulse">● SLA Counters Active</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">SLA Breached / Warning</span>
          <span className="text-2xl font-bold text-rose-600 block mt-1">
            {tickets.filter(t => t.status !== "Closed" && t.slaMinutesRemaining <= 15).length}
          </span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Critical Attention Needed</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Customer CSAT Rating</span>
          <span className="text-2xl font-bold text-emerald-600 block mt-1">
            {csatAvg} <span className="text-slate-400 text-xs">/ 5.0</span>
          </span>
          <span className="text-emerald-500 text-[10px] block mt-0.5">★★★★★ Support Score</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Average Responsetime</span>
          <span className="text-2xl font-bold text-indigo-600 block mt-1">
            14.2 min
          </span>
          <span className="text-slate-400 text-[10px] block mt-0.5">SLA Target &lt; 30 min</span>
        </div>
      </div>

      {/* Main Ticket Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Ticket feed */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Unified Support Desk Queues</h4>
              <p className="text-[10px] text-slate-400 font-normal">Cross-tenant complaints and machine failures.</p>
            </div>
            
            <select
              value={engineerFilter}
              onChange={(e) => setEngineerFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium outline-none text-slate-700"
            >
              <option value="All">All Engineers</option>
              <option value="Alex Thompson (AI Agent)">Alex Thompson (AI Agent)</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Priya Nair">Priya Nair</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto">
            {filteredTickets.map(t => {
              const isSelected = t.id === selectedTicketId;
              const isWarning = t.slaMinutesRemaining > 0 && t.slaMinutesRemaining <= 15;
              
              return (
                <div 
                  key={t.id}
                  onClick={() => {
                    setSelectedTicketId(t.id);
                    setTStatus(t.status);
                    setTPriority(t.priority);
                    setTEngineer(t.assignedEngineer);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? "border-slate-800 bg-slate-50" 
                      : "border-slate-100 bg-slate-50/10 hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-mono text-[10px] font-bold text-slate-550 text-slate-500">
                      {t.id} <span className="font-sans font-normal text-slate-400">• {t.tenantName.split(" ")[0]}</span>
                    </div>
                    
                    {t.status === "Closed" ? (
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[8px] font-bold font-mono">
                        RESOLVED
                      </span>
                    ) : (
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                        t.priority === "Urgent" 
                          ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {t.priority}
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-slate-800 text-xs mt-1 truncate">{t.subject}</h5>
                  <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">{t.message}</p>

                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2.5">
                    <span className="text-slate-500">Assignee: {t.assignedEngineer}</span>
                    {t.status !== "Closed" && (
                      <span className={`flex items-center gap-1 font-bold ${isWarning ? "text-rose-600" : "text-emerald-600"}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {t.slaMinutesRemaining} min left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Action controls */}
        <div className="lg:col-span-2 space-y-4">
          {selectTicket ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-5 text-left">
              
              {/* Ticket heading block */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 font-bold">
                    <span>{selectTicket.id}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] uppercase font-bold">{selectTicket.category}</span>
                    <span>•</span>
                    <span>{selectTicket.tenantName}</span>
                  </div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm mt-1">{selectTicket.subject}</h3>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleResolveTicketDirect(selectTicket.id)}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-mono uppercase text-[9px] font-bold rounded-lg cursor-pointer"
                  >
                    Resolve ticket direct
                  </button>
                </div>
              </div>

              {/* Patient/Physician Query Message Box */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-205 bg-slate-200 text-slate-700 flex items-center justify-center font-bold font-mono text-[10px]">
                      H
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Hospital Admin Representative</div>
                      <div className="text-[9px] text-slate-400 font-mono">EHR Portal Operator</div>
                    </div>
                  </div>
                  
                  <div className="text-[9px] text-slate-400 font-mono">
                    {new Date(selectTicket.createdTime).toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-normal leading-relaxed">{selectTicket.message}</p>
              </div>

              {/* Reply / Escalation Form */}
              <form onSubmit={handleUpdateTicket} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400 font-extrabold">Dispatch SLA Response message / Notes</label>
                  <textarea
                    placeholder="Enter technician diagnostic advice, LIS network routing updates, or support feedback loop parameters..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg h-20 text-xs font-semibold placeholder-slate-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-650">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400 font-extrabold">Queue Assignment State</label>
                    <select
                      value={tStatus}
                      onChange={(e) => setTStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                    >
                      <option value="Open">Open Queue (Unresolved)</option>
                      <option value="Assigned">Assigned Active</option>
                      <option value="Resolving">Actively Resolving</option>
                      <option value="Closed">Closed Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-405 uppercase text-slate-400 font-extrabold">Priority Urgency Indicator</label>
                    <select
                      value={tPriority}
                      onChange={(e) => setTPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
                    >
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Escalation</option>
                      <option value="Urgent">Urgent Blockout</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-455 uppercase text-slate-400 font-extrabold">Technical Specialist</label>
                    <select
                      value={tEngineer}
                      onChange={(e) => setTEngineer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800 animate-pulse border-emerald-500/30"
                    >
                      <option value="Alex Thompson (AI Agent)">Alex Thompson (AI Agent)</option>
                      <option value="Sarah Jenkins">Sarah Jenkins (Principal)</option>
                      <option value="Priya Nair">Priya Nair (Senior LIS Support)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase font-bold text-xs rounded-xl border border-slate-705 cursor-pointer flex items-center gap-2"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Push SLA Ticket Update Event</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-150 rounded-2xl">
              Tick any support incident on the left sidebar list to inspect diagnostics logs and manage compliance actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
