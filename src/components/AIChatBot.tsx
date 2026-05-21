import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, User, Brain, AlertTriangle, RefreshCw } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { askAlexChat } from "../api";

interface AIChatBotProps {
  store: HIMSStore;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export function AIChatBot({ store }: AIChatBotProps) {
  const { patients, beds, medicines, vitals, auditLogs } = store;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-msg",
      sender: "bot",
      text: "Hello! I am Alex, your clinical intelligence co-pilot. I am fed with real-time patient charts, ICU bed densities, and pharmacy stock status. How may I assist you with clinical, drug safety, or operational inquiries today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Construct context block to feed Gemini co-pilot
  const getSimulatedContext = () => {
    const criticalAlarms = vitals.filter(v => v.isAnomaly).map(v => {
      const p = patients.find(pat => pat.id === v.patientId);
      return { patientName: p?.name, telemetryAlert: v.anomalyReason, status: "Critical" };
    });

    const activeBeds = beds.map(b => ({ bed: b.bedNumber, ward: b.ward, status: b.status, patient: b.occupiedByPatientName }));
    const undersuppliedDrugs = medicines.filter(m => m.stockCount <= m.safetyStock).map(m => ({ name: m.name, left: m.stockCount, location: m.location }));

    return {
      currentPatientRegistries: patients.map(p => ({ name: p.name, allergies: p.allergies, history: p.medicalHistory, uhid: p.uhid })),
      occupiedWardBeds: activeBeds,
      pharmacyLowStocks: undersuppliedDrugs,
      vitalAnomalyAlarms: criticalAlarms
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const context = getSimulatedContext();
      
      const flowMessages = messages
        .concat(userMsg)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("model" as const),
          content: m.text
        }));

      const reply = await askAlexChat(flowMessages, context);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply.text || "Pardon, I encountered an irregularity in response synthesis. Verify system credentials.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Shortcut suggestions
  const prompts = [
    { label: "Analyze drug interactions", text: "Evaluate safety and drug interactions between Atorvastatin and Clarithromycin." },
    { label: "Flag vital anomalies", text: "Are there any active critical patient alarms I should address on the wards?" },
    { label: "Review ICU beds", text: "How is the ICU bed occupancy right now? Provide optimization recommendations." },
    { label: "Low stock medications", text: "Provide a quick list of pharmaceuticals under safety stocks and their locations." }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-xs">
      {/* Floating Circular Trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-xl flex items-center gap-2 justify-center transition-transform hover:scale-105"
          id="btn_alex_toggle"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-xs pr-1">Alex AI Co-Pilot</span>
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div
          className="w-80 md:w-96 h-[550px] bg-slate-905 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800"
          id="alex_chat_panel"
        >
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Alex AI Co-Pilot</h3>
                <span className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase">Active Clinical Engine</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans leading-relaxed">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${!isBot ? "flex-row-reverse" : ""}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isBot ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-300"}`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`space-y-1 max-w-[75%] ${!isBot ? "text-right" : ""}`}>
                    <div className="flex items-baseline gap-1.5 justify-start flex-wrap">
                      <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-xl text-xs text-left leading-normal whitespace-pre-line ${
                      isBot ? "bg-slate-950 text-slate-300 border border-slate-850" : "bg-emerald-600 text-white"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-950 text-slate-500 rounded-xl font-mono text-[10px]">
                  Analyzing medical pathways...
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Prompt Shortcuts */}
          {messages.length === 1 && (
            <div className="p-3 bg-slate-950 border-t border-slate-850 space-y-1.5">
              <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Standard clinical queries:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {prompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSendMessage(p.text)}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 rounded text-left transition-all leading-snug truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask co-pilot clinical or stock questions..."
              className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-xs text-white border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2.5 shrink-0 transition-all flex items-center justify-center"
              id="btn_send_alex_message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
