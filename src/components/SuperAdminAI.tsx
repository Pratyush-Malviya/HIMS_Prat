import React, { useState, useMemo } from "react";
import { 
  BrainCircuit, 
  Settings, 
  TrendingUp, 
  Activity, 
  HelpCircle,
  Cpu,
  Sliders,
  DollarSign,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

interface SuperAdminAIProps {
  tenantCount: number;
}

interface AIMicroFeature {
  id: string;
  name: string;
  category: "Clinical Scribe" | "Operational" | "Billing" | "Inventory";
  desc: string;
  enabledGlobal: boolean;
}

interface AIHandoverReview {
  id: string;
  tenantName: string;
  summaryType: string;
  inputTextSample: string;
  aiOutputDraft: string;
  confidenceScore: number;
  reviewed: boolean;
  accuracyApproved?: boolean;
}

const GLOBAL_AI_FEATURES: AIMicroFeature[] = [
  { id: "scribe", name: "AI Clinician SOAP Medical Scribe", category: "Clinical Scribe", desc: "Automate transcription of clinician-patient dialogs into compliant structured SOAP clinical drafts.", enabledGlobal: true },
  { id: "readmit", name: "IPD Readmission Deterioration Risk Predictor", category: "Operational", desc: "Monitors daily vitals anomalies to alert ward nurses about prospective 30-day readmission indices.", enabledGlobal: true },
  { id: "claim", name: "TPA Claim Rejection Forecasting Matrix", category: "Billing", desc: "Inspects clinical diagnosis codes and insurance package layouts to predict denial probabilities.", enabledGlobal: true },
  { id: "demand", name: "Pharmacy Inventory Demand Forecaster", category: "Inventory", desc: "Calculates seasonal drug consumption triggers to auto-reorder essential medicine batches.", enabledGlobal: false }
];

const INITIAL_REVIEWS: AIHandoverReview[] = [
  {
    id: "REV-201",
    tenantName: "Metro General Hospital Corp",
    summaryType: "Cardiology SBAR Handover",
    inputTextSample: "Systolic bp 152 in recovery post-op. Heart rate stable 82. Normal rhythm. Urinalysis negative.",
    aiOutputDraft: "SBAR BRIEF: Patient admitted post-op. Vitals: BP 152/80 mmHg (Elevated Systolic), HR 82 bpm (Stable). Clinical Recommendation: Monitor fluid intake. Routine cardiology review.",
    confidenceScore: 94,
    reviewed: false
  },
  {
    id: "REV-202",
    tenantName: "Lotus Kids Clinic",
    summaryType: "Pediatric SOAP Assessment",
    inputTextSample: "Fever 101.4 dry cough active chest sounds. Tonsils healthy. Pediatric syrup paracetamol ordered.",
    aiOutputDraft: "SOAP DRAFT: Subjective: Active fever and persistent dry cough. Objective: Temp 101.4 F, clear lungs. Assessment: Rhinovirus pediatric upper respiratory index. Plan: Syrup paracetamol.",
    confidenceScore: 89,
    reviewed: false
  }
];

export function SuperAdminAI({ tenantCount }: SuperAdminAIProps) {
  const [aiFeatures, setAiFeatures] = useState<AIMicroFeature[]>(GLOBAL_AI_FEATURES);
  const [reviewedData, setReviewedData] = useState<AIHandoverReview[]>(INITIAL_REVIEWS);
  const [modelType, setModelType] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">("gemini-2.5-flash");
  
  const [activeReviewId, setActiveReviewId] = useState<string>("REV-201");
  const [tokenCostCoefficient, setTokenCostCoefficient] = useState<number>(0.075); // $0.075 per 1k summaries

  const activeReview = useMemo(() => {
    return reviewedData.find(r => r.id === activeReviewId) || reviewedData[0];
  }, [reviewedData, activeReviewId]);

  const toggleFeature = (id: string) => {
    setAiFeatures(prev => prev.map(f => f.id === id ? { ...f, enabledGlobal: !f.enabledGlobal } : f));
  };

  const handleAuditReview = (id: string, isApproved: boolean) => {
    setReviewedData(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          reviewed: true,
          accuracyApproved: isApproved
        };
      }
      return r;
    }));
  };

  // Recharts interactive token datasets
  const aiTokenUsageLogs = [
    { day: "May 18", PromptTokens: 142000, CompletionTokens: 88000, CostUSD: 17.2 },
    { day: "May 19", PromptTokens: 195000, CompletionTokens: 124000, CostUSD: 23.92 },
    { day: "May 20", PromptTokens: 240000, CompletionTokens: 151000, CostUSD: 29.32 },
    { day: "May 21", PromptTokens: 310000, CompletionTokens: 198000, CostUSD: 38.10 },
    { day: "May 22", PromptTokens: 290000, CompletionTokens: 185000, CostUSD: 35.62 },
    { day: "May 23 (CY)", PromptTokens: 320000, CompletionTokens: 210000, CostUSD: 39.75 }
  ];

  const aggregateTokens = useMemo(() => {
    const totalPrompts = aiTokenUsageLogs.reduce((sum, item) => sum + item.PromptTokens, 0);
    const totalCompletions = aiTokenUsageLogs.reduce((sum, item) => sum + item.CompletionTokens, 0);
    return {
      prompts: totalPrompts.toLocaleString(),
      completions: totalCompletions.toLocaleString(),
      combined: (totalPrompts + totalCompletions).toLocaleString(),
      cost: aiTokenUsageLogs.reduce((sum, item) => sum + item.CostUSD, 0).toFixed(2)
    };
  }, []);

  return (
    <div className="space-y-6" id="super_admin_ai_orchestra_tab">
      
      {/* Top row analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Model Core Orchestrator</span>
          <span className="text-sm font-bold text-slate-800 block mt-1">
            {modelType === "gemini-2.5-flash" ? "Google Gemini 2.5 Flash" : "Google Gemini 2.5 Pro"}
          </span>
          <span className="text-emerald-500 text-[9px] font-mono font-bold block mt-0.5">● SERVER-SIDE REST COMPLIANT</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Combined AI Queries</span>
          <span className="text-2xl font-bold text-indigo-650 block mt-1">{aggregateTokens.combined}</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Prompt & Completion Tokens</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Compute Cost Accumulate</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">${aggregateTokens.cost}</span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Monthly Resource Spend</span>
        </div>

        <div className="p-4 bg-white border border-slate-150 rounded-xl text-left shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">AI Feature Status (Active)</span>
          <span className="text-2xl font-bold text-emerald-600 block mt-1">
            {aiFeatures.filter(x => x.enabledGlobal).length} / {aiFeatures.length}
          </span>
          <span className="text-slate-400 text-[10px] block mt-0.5">Global Microservices Mounted</span>
        </div>
      </div>

      {/* Main Orchestration & Telemetry Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Controls */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section: Global Orchestration Configs */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">AI Model Configurations & Core Settings</h4>
              <p className="text-[11px] text-slate-400">Manage deep learning model assignments and billing coefficients across client nodes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-605">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold select-none">
                  <span>Parent LLM Core Engine</span>
                  <span className="text-emerald-500 font-bold">Secure SSL Grounded</span>
                </div>
                
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value as any)}
                  className="w-full bg-slate-55 bg-slate-50 border border-slate-200 text-slate-805 text-slate-800 font-bold p-2.5 rounded-xl outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Affordable, Low Latency Walkthroughs)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Clinical Decision, Complex SOAP Diagnosing)</option>
                </select>
                <p className="text-[10px] text-slate-400 font-normal leading-normal">
                  Pro models increase token costs by 4.2x but provide high clinical accuracy checks.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] uppercase text-slate-400 font-extrabold">
                  <span>SaaS Billing Token Coefficient</span>
                  <span className="text-blue-600 font-extrabold">${tokenCostCoefficient} per 1K summaries</span>
                </div>
                <input
                  type="range"
                  min="0.010"
                  max="0.250"
                  step="0.005"
                  value={tokenCostCoefficient}
                  onChange={(e) => setTokenCostCoefficient(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <p className="text-[10px] text-slate-400 font-normal">Controls pricing calculated in "Usage & Telemetry" billing meters.</p>
              </div>
            </div>

            {/* Micro Feature Toggles list */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-450 text-slate-400 font-extrabold">Active AI SaaS Microservices:</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiFeatures.map(feat => (
                  <div key={feat.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        id={`ai-toggle-${feat.id}`}
                        checked={feat.enabledGlobal}
                        onChange={() => toggleFeature(feat.id)}
                        className="w-4 h-4 text-emerald-500 rounded accent-emerald-500 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <label htmlFor={`ai-toggle-${feat.id}`} className="block font-bold text-slate-800 cursor-pointer select-none">
                        {feat.name}
                      </label>
                      <p className="text-[10px] font-normal leading-relaxed text-slate-450 text-slate-400">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt analytics graph */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-3">
            <div>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Model Token Consumptions & Cost Trends</h5>
              <p className="text-[10px] text-slate-450 text-slate-400">Sliding-window token usage patterns across all hospital active databases.</p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aiTokenUsageLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                  <Area type="monotone" dataKey="PromptTokens" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" name="Prompt Usage" />
                  <Area type="monotone" dataKey="CompletionTokens" stroke="#6366f1" strokeWidth={2} fillOpacity={0} name="Completion Usage" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: Human-in-the-loop review queues */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Humans-In-The-Loop Validation</h4>
            <p className="text-[10px] text-slate-400 font-normal">Audit recent clinical briefs to prevent EMR hallucinations and retrain algorithms.</p>
          </div>

          {/* Review List tracker */}
          <div className="space-y-1.5">
            {reviewedData.map(rev => {
              const isActive = rev.id === activeReviewId;
              return (
                <div 
                  key={rev.id}
                  onClick={() => setActiveReviewId(rev.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isActive 
                      ? "border-emerald-500 bg-emerald-500/5 text-slate-800" 
                      : "border-slate-100 bg-slate-50/10 hover:bg-slate-50/30 text-slate-500"
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="font-bold text-slate-700">{rev.summaryType}</span>
                    <span className="text-slate-400 italic">Score: {rev.confidenceScore}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{rev.tenantName}</span>
                    {rev.reviewed ? (
                      <span className={`text-[8px] font-bold font-mono uppercase px-1 rounded ${
                        rev.accuracyApproved ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {rev.accuracyApproved ? "Approved" : "Rejected"}
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono bg-indigo-100 text-indigo-705 px-1 rounded text-indigo-800 font-bold uppercase animate-pulse">
                        PENDING AUDIT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Review detailed Panel */}
          {activeReview ? (
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-xs">
              
              <div className="pb-2 border-b border-slate-200">
                <div className="text-[9px] font-mono text-indigo-501 font-bold text-indigo-500 uppercase">Clinician Transcript Sample Input:</div>
                <blockquote className="text-[10px] text-slate-500 italic mt-1 font-mono leading-relaxed truncate hover:text-clip">
                  "{activeReview.inputTextSample}"
                </blockquote>
              </div>

              <div>
                <div className="text-[9px] font-mono text-emerald-601 font-bold text-emerald-600 uppercase">Gemini Output Brief Suggestion:</div>
                <p className="text-[10px] text-slate-700 font-normal leading-relaxed mt-1 bg-white p-2 border border-slate-150 rounded-lg">
                  {activeReview.aiOutputDraft}
                </p>
              </div>

              {activeReview.reviewed ? (
                <div className={`p-2 rounded text-[10px] font-mono font-bold uppercase text-center ${
                  activeReview.accuracyApproved ? "bg-emerald-50 text-emerald-705 text-emerald-600" : "bg-rose-50 text-rose-650"
                }`}>
                  {activeReview.accuracyApproved ? "✓ Marked Clean - Integrated to EHR" : "⚠️ Reported - Sent to developer huddle"}
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[9px] font-mono text-slate-400 uppercase font-extrabold select-none">Review Accuracy Compliance:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAuditReview(activeReview.id, true)}
                      className="py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-mono text-[9px] font-extrabold uppercase cursor-pointer text-center"
                    >
                      Classify Clean
                    </button>
                    <button
                      onClick={() => handleAuditReview(activeReview.id, false)}
                      className="py-1.5 rounded-lg bg-red-50 text-red-650 hover:bg-red-100 text-red-600 border border-red-200 font-mono text-[9px] font-extrabold uppercase cursor-pointer text-center"
                    >
                      Report Hallucinate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
