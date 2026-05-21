import React, { useState } from "react";
import { Pill, AlertTriangle, Search, CheckCircle, Sparkles, Brain, PlusCircle, ShieldAlert, Crosshair } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { checkDrugInteractions, fetchReorderAdvice } from "../api";

interface PharmacyModuleProps {
  store: HIMSStore;
}

export function PharmacyModule({ store }: PharmacyModuleProps) {
  const { medicines, updateMedicineStock, addMedicineInventory } = store;

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Form: Adding new medicine formulations
  const [newMed, setNewMed] = useState({
    name: "",
    dosageForm: "Tablet",
    strength: "",
    stockCount: "",
    safetyStock: "200",
    unitPrice: "",
    expiryDate: "",
    location: ""
  });

  // Drug Interaction Form
  const [interactDrugsText, setInteractDrugsText] = useState("");
  const [evaluatingSafety, setEvaluatingSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<any>(null);

  // Supply Chain state
  const [analyzingLowStock, setAnalyzingLowStock] = useState(false);
  const [reorderAdviceList, setReorderAdviceList] = useState<any[] | null>(null);

  // Trigger AI Low Stock reorder recommendation
  const handleGetReorderAdvice = async () => {
    if (lowStocks.length === 0) {
      alert("No low stock items to analyze!");
      return;
    }
    setAnalyzingLowStock(true);
    setReorderAdviceList(null);
    try {
      const response = await fetchReorderAdvice(lowStocks);
      setReorderAdviceList(response.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingLowStock(false);
    }
  };

  const filteredMeds = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStocks = medicines.filter((m) => m.stockCount <= m.safetyStock);

  // Add new medicine inventory Formulation
  const handleAddNewMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.strength || !newMed.stockCount) {
      alert("Name, strength, and opening stocks count are required.");
      return;
    }

    addMedicineInventory(
      {
        name: newMed.name,
        dosageForm: newMed.dosageForm,
        strength: newMed.strength,
        stockCount: parseInt(newMed.stockCount) || 100,
        safetyStock: parseInt(newMed.safetyStock) || 100,
        unitPrice: parseFloat(newMed.unitPrice) || 5.0,
        expiryDate: newMed.expiryDate || "2027-12-31",
        location: newMed.location || "General Shelf A"
      },
      "Pharmacy Supervisor",
      "Pharmacy Boss"
    );

    setNewMed({
      name: "",
      dosageForm: "Tablet",
      strength: "",
      stockCount: "",
      safetyStock: "200",
      unitPrice: "",
      expiryDate: "",
      location: ""
    });
    alert("New drug formulation added to pharmacy dispensary registry.");
  };

  // Run Drug interaction check with Gemini
  const handleCheckChemicalInterations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactDrugsText) {
      alert("Please designate a comma-separated list of active ingredients.");
      return;
    }
    setEvaluatingSafety(true);
    setSafetyReport(null);

    const drugList = interactDrugsText.split(",").map((d) => d.trim());
    try {
      const rep = await checkDrugInteractions(drugList);
      setSafetyReport(rep);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingSafety(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Alerts & addition forms */}
      <div className="lg:col-span-1 space-y-4">
        {/* Section A: Low stock triggers */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Dispensary Alerts
          </h3>
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
            {lowStocks.length === 0 ? (
              <div className="text-[10px] text-slate-400 py-4 text-center">Safety margins intact.</div>
            ) : (
              lowStocks.map((m) => (
                <div key={m.id} className="p-2 bg-amber-50 border border-amber-100/50 rounded text-xs">
                  <div className="font-semibold text-amber-800">{m.name} {m.strength}</div>
                  <div className="flex justify-between text-[10px] text-amber-600 font-mono mt-0.5">
                    <span>Stock: {m.stockCount} units</span>
                    <span>Safety: {m.safetyStock}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {lowStocks.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={handleGetReorderAdvice}
                disabled={analyzingLowStock}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                {analyzingLowStock ? "Analyzing..." : "AI Reorder Advice"}
              </button>
            </div>
          )}
        </div>

        {reorderAdviceList && reorderAdviceList.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
              <h4 className="text-[11px] font-bold text-emerald-800 uppercase font-mono flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                AI Supply Reorders
              </h4>
              <button onClick={() => setReorderAdviceList(null)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold">
                Dismiss
              </button>
            </div>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {reorderAdviceList.map((adv, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-emerald-100/50 rounded-lg text-xs space-y-1 text-left">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{adv.name}</span>
                    <span className="text-emerald-700 font-mono">+{adv.suggestedQuantity} qty</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">🏢 Partner: {adv.supplier}</div>
                  <p className="text-[10px] text-slate-600 leading-normal bg-slate-50 p-1.5 rounded font-sans">{adv.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section B: Formulation Register Form */}
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-800 pb-2 mb-3 border-b border-slate-100 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-emerald-500" /> New Formulation
          </h3>
          <form onSubmit={handleAddNewMed} className="space-y-2.5 text-xs text-slate-700">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Drug Name</label>
              <input
                type="text"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                placeholder="e.g. Lipitor, Amoxicillin"
                className="w-full text-xs p-1.5 border border-slate-200 rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Strength</label>
                <input
                  type="text"
                  value={newMed.strength}
                  onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                  placeholder="500mg"
                  className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Dispensary Form</label>
                <select
                  value={newMed.dosageForm}
                  onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded"
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Injection</option>
                  <option>Syrup</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Opening stock</label>
                <input
                  type="number"
                  value={newMed.stockCount}
                  onChange={(e) => setNewMed({ ...newMed, stockCount: e.target.value })}
                  placeholder="1000"
                  className="w-full text-xs p-1.5 border border-slate-200 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Shelf Location</label>
                <input
                  type="text"
                  value={newMed.location}
                  onChange={(e) => setNewMed({ ...newMed, location: e.target.value })}
                  placeholder="Row B"
                  className="w-full text-xs p-1.5 border border-slate-200 rounded"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white rounded text-xs py-2 font-semibold">
              Add Formulation
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Inventory database & interact checks */}
      <div className="lg:col-span-3 space-y-6">
        {/* Pharmacy Catalog */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-50 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Pharmacy Formulary Directory</h2>
              <p className="text-xs text-slate-400">Total formulary cards active inside dispensary compartments</p>
            </div>

            {/* Catalog search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search drug by name or row shelf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-60 focus:outline-none focus:border-emerald-500"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase">
                <tr>
                  <th className="p-3">Generic Name / Strength</th>
                  <th className="p-3">Dispensary Form</th>
                  <th className="p-3">Stock count</th>
                  <th className="p-3">Storage shelf</th>
                  <th className="p-3">Expiries</th>
                  <th className="p-3 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMeds.map((med) => {
                  const underLimit = med.stockCount <= med.safetyStock;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold">
                        <div>{med.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{med.strength}</div>
                      </td>
                      <td className="p-3">{med.dosageForm}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${underLimit ? "text-amber-600 font-bold" : "text-slate-800"}`}>
                          {med.stockCount}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono">Limit: {med.safetyStock}</p>
                      </td>
                      <td className="p-3 font-mono">{med.location}</td>
                      <td className="p-3 text-[10px] text-slate-500 font-mono">{med.expiryDate}</td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => updateMedicineStock(med.id, 100, "Pharmacy Operator", "Pharmacy Boss")}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-100"
                          id={`rx_stock_plus_${med.id}`}
                        >
                          +100
                        </button>
                        <button
                          onClick={() => updateMedicineStock(med.id, -50, "Pharmacy Operator", "Pharmacy Boss")}
                          disabled={med.stockCount < 50}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-100 disabled:opacity-30"
                          id={`rx_stock_minus_${med.id}`}
                        >
                          -50
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drug Safety Interaction Panel */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-500" /> Gemini Drug-Drug Interaction Safety Safeguards
            </h3>
            <p className="text-xs text-slate-400">Evaluate dynamic multi-prescription toxicity safety concerns before dispensing medication lists.</p>
          </div>

          <form onSubmit={handleCheckChemicalInterations} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="block text-[10px] text-slate-400 mb-1.5 font-mono">Delineate active components (comma separated)</label>
                <input
                  type="text"
                  value={interactDrugsText}
                  onChange={(e) => setInteractDrugsText(e.target.value)}
                  placeholder="e.g. Atorvastatin, Amlodipine, Sildenafil, Clarithromycin"
                  className="w-full text-xs p-2.5 border border-slate-100 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={evaluatingSafety}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg p-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                id="btn_drug_interaction_submit"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                {evaluatingSafety ? "Evaluating safety..." : "Check Safety Profile"}
              </button>
            </div>
          </form>

          {safetyReport && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3 animate-fadeIn text-xs text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-indigo-100/50">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-500" /> co-pilot Pharmacy interaction Report
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold leading-none ${
                  safetyReport.safeToCombine ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  {safetyReport.safeToCombine ? "CLEARED: COMBINATIONS COMMENSURATE" : "CRITICAL ALERT: REACTION RISKS"}
                </span>
              </div>

              {safetyReport.conciseSummary && (
                <div className="p-3.5 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 border border-indigo-100 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-955">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    AI Clinical Safety Summary
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {safetyReport.conciseSummary}
                  </p>
                </div>
              )}

              {safetyReport.severeInteractions?.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Toxicity Alert Grid</span>
                  {safetyReport.severeInteractions.map((int: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-red-100/40 border border-red-200/50 rounded flex gap-2">
                      <Crosshair className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-900 leading-snug">
                          {int.participants?.join(" ↔ ")} ({int.severity} Severity)
                        </strong>
                        <p className="text-slate-600 font-light mt-0.5 leading-snug">{int.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Patient Advisory Directions</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    {safetyReport.advisoryNotes?.map((note: string, i: number) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-100 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Safety Clinical Subsititutes</span>
                  <p className="text-slate-600 font-light leading-relaxed text-[11px]">{safetyReport.alternativesSuggested}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
