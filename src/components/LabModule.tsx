import React, { useState } from "react";
import { Check, ClipboardList, Clock, Sparkles, Brain, FlaskConical, AlertTriangle, Play, BookOpen } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";
import { LabTest } from "../types";
import { summarizeClinicalNotes } from "../api";

interface LabModuleProps {
  store: HIMSStore;
}

export function LabModule({ store }: LabModuleProps) {
  const { labTests, updateLabTest, patients } = store;

  // Selected test for active observation or result posting
  const [selectedTestId, setSelectedTestId] = useState<string | null>(labTests[0]?.id || null);
  const selectedTest = labTests.find((t) => t.id === selectedTestId);

  // Lab posting states
  const [labResultForm, setLabResultForm] = useState({
    resultsText: "",
    isNormal: "Normal" as "Normal" | "Abnormal"
  });

  // Interpretive report states
  const [analysing, setAnalysing] = useState(false);
  const [interpretiveAnalysis, setInterpretiveAnalysis] = useState<any>(null);

  // OCR Simulator
  const [ocrRawText, setOcrRawText] = useState("");
  const [parsingOcr, setParsingOcr] = useState(false);
  const [parsedOcrResponse, setParsedOcrResponse] = useState<any>(null);

  // Post laboratory findings
  const handlePostFindings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    updateLabTest(
      selectedTest.id,
      "Completed",
      labResultForm.resultsText || "Normative parameters.",
      labResultForm.isNormal === "Abnormal",
      "Lab Specialist",
      "Lab Head"
    );

    setLabResultForm({ resultsText: "", isNormal: "Normal" });
    alert("Lab results saved to database. Patient health records updated.");
  };

  // Interpret Blood findings with Gemini
  const handleInterpretResults = async () => {
    if (!selectedTest || !selectedTest.results) {
      alert("Please select a completed lab test that contains diagnostic findings first.");
      return;
    }
    setAnalysing(true);
    setInterpretiveAnalysis(null);

    try {
      const p = patients.find((pat) => pat.id === selectedTest.patientId);
      const report = await summarizeClinicalNotes(
        `Interpret these lab values: ${selectedTest.results}`,
        p
      );
      setInterpretiveAnalysis(report);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalysing(false);
    }
  };

  // OCR parser simulator
  const handleParseOCRText = async () => {
    if (!ocrRawText) {
      alert("Please paste some diagnostic printout text to simulate OCR parsing.");
      return;
    }
    setParsingOcr(true);
    setParsedOcrResponse(null);

    try {
      const res = await summarizeClinicalNotes(ocrRawText, null);
      setParsedOcrResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setParsingOcr(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar lab requests queue */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-500" /> pathology Queue
            </h3>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
              {labTests.length}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {labTests.map((t) => {
              const matched = selectedTestId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTestId(t.id);
                    setInterpretiveAnalysis(null);
                  }}
                  className={`p-2.5 rounded-lg text-xs text-left cursor-pointer border transition-colors ${
                    matched ? "bg-slate-900 text-white border-slate-800" : "hover:bg-slate-50 text-slate-700 bg-white border-slate-100"
                  }`}
                >
                  <div className="flex justify-between font-semibold">
                    <span className="truncate">{t.testName}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.abnormalFlags ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`}></span>
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5 font-mono truncate">{t.patientName}</div>
                  <div className="flex justify-between text-[9px] opacity-60 mt-1">
                    <span>{t.status}</span>
                    <span>21 May</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main pathology workstation content */}
      <div className="lg:col-span-3 space-y-6">
        {selectedTest ? (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-6">
            {/* Header metadata */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Test Reference: {selectedTest.id}</span>
                <h2 className="text-sm font-semibold text-slate-800">{selectedTest.testName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Patient: {selectedTest.patientName} (ID: {selectedTest.patientId})</p>
              </div>
              <div className="text-right text-xs">
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                  selectedTest.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>{selectedTest.status}</span>
                <p className="text-[10px] text-slate-400 mt-1">Physician: {selectedTest.requestedBy}</p>
              </div>
            </div>

            {/* Test Workflows */}
            {selectedTest.status !== "Completed" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collect Sample & Processing buttons */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-50">Procurement Workflow</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateLabTest(selectedTest.id, "Sample Collected", undefined, undefined, "Lab Specialist", "Lab Head")}
                      disabled={selectedTest.status === "Sample Collected" || selectedTest.status === "Processing"}
                      className="bg-slate-100 text-slate-700 rounded-lg p-2.5 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 text-left flex items-center justify-between"
                      id="btn_lab_procure"
                    >
                      <span>1. Draw Patient Bio-Sample</span>
                      <Check className={`w-4 h-4 text-emerald-500 ${selectedTest.status !== "Requested" ? "opacity-100" : "opacity-20"}`} />
                    </button>

                    <button
                      onClick={() => updateLabTest(selectedTest.id, "Processing", undefined, undefined, "Lab Specialist", "Lab Head")}
                      disabled={selectedTest.status === "Requested" || selectedTest.status === "Processing"}
                      className="bg-emerald-50 text-emerald-800 rounded-lg p-2.5 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50 text-left flex items-center justify-between"
                      id="btn_lab_process"
                    >
                      <span>2. Process inside biochemistry slide analyzer</span>
                      <Clock className={`w-4 h-4 text-amber-500 ${selectedTest.status === "Processing" ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Post Result findings */}
                <form onSubmit={handlePostFindings} className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-50">Post Chemistry Findings</h3>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Analyzer Text Output / Lab parameters</label>
                    <textarea
                      value={labResultForm.resultsText}
                      onChange={(e) => setLabResultForm({ ...labResultForm, resultsText: e.target.value })}
                      placeholder="e.g. Total Cholesterol: 245 mg/dL (Abnormal High), HDL: 38 (Low), LDL: 158 (High), Triglycerides: 210. Indicators suggest high risk profile."
                      className="w-full h-24 p-2.5 text-xs border border-slate-200 rounded focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="isNormal"
                          value="Normal"
                          checked={labResultForm.isNormal === "Normal"}
                          onChange={() => setLabResultForm({ ...labResultForm, isNormal: "Normal" })}
                        />
                        Normal Reference
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer text-red-600 font-medium">
                        <input
                          type="radio"
                          name="isNormal"
                          value="Abnormal"
                          checked={labResultForm.isNormal === "Abnormal"}
                          onChange={() => setLabResultForm({ ...labResultForm, isNormal: "Abnormal" })}
                        />
                        Abnormal flags
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-slate-900 text-white rounded hover:bg-slate-800 text-xs py-1.5 px-3.5 font-semibold"
                      id="btn_save_lab_findings"
                    >
                      Publish Results
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Completed Report Display and Interpretation
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <h3 className="text-xs font-bold text-slate-700">Analyzer Diagnostic Printout</h3>
                  <p className="text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-line">{selectedTest.results}</p>
                </div>

                <div className="flex">
                  <button
                    onClick={handleInterpretResults}
                    disabled={analysing}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2"
                    id="btn_interpret_labs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    {analysing ? "Synthesizing interpretive biochem diagnostics..." : "AI Interpret Lab Parameters"}
                  </button>
                </div>

                {interpretiveAnalysis && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3 animate-fadeIn">
                    <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-500 animate-bounce" /> Gemini Diagnostic Interpretation Report
                    </h4>
                    
                    <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                      <div className="bg-white p-3 rounded-lg border border-indigo-100">
                        <strong className="text-indigo-950 block mb-1">Diagnostic Summary:</strong>
                        {interpretiveAnalysis.briefSummary}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-indigo-100">
                          <strong className="text-amber-700 font-semibold block mb-1">Irregularities Detected:</strong>
                          {interpretiveAnalysis.assessment}
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-100">
                          <strong className="text-emerald-800 font-semibold block mb-1">Proposed Care Pathway:</strong>
                          {interpretiveAnalysis.plan}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-400 text-xs">
            Pathological requests will appear in this directory once requested from the Doctor's OPD Desk.
          </div>
        )}

        {/* OCR Page parsing Simulation panel */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-indigo-500" /> Administrative OCR Document Parser (Simulation)
            </h3>
            <p className="text-xs text-slate-400">Copy-paste external health records printouts here. Gemini AI will convert the unstructured notes into a formatted JSON clinical file block.</p>
          </div>

          <div className="space-y-3">
            <textarea
              value={ocrRawText}
              onChange={(e) => setOcrRawText(e.target.value)}
              placeholder="e.g. PATIENT: Priya Singh, AGE: 34y. Lab observations: Hemoglobin counts show 9.5 g/dL indicating moderate anemia. TSH registers 4.2 uIU/mL. Recommended to take oral iron supplement once daily."
              className="w-full h-24 p-3 border border-slate-100 rounded-lg text-xs font-mono"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={handleParseOCRText}
                disabled={parsingOcr}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs py-1.5 px-4 font-semibold flex items-center gap-2"
                id="btn_ocr_parse_submit"
              >
                <Play className="w-3.5 h-3.5" />
                {parsingOcr ? "Extracting parameters..." : "OCR Parse Document"}
              </button>
            </div>

            {parsedOcrResponse && (
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl space-y-3 animate-fadeIn font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                  <span>Structured JSON Block</span>
                  <span className="text-emerald-400">STATUS: Extracted</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">briefSummary:</span>
                    <p className="text-white text-[11px] font-sans">{parsedOcrResponse.briefSummary}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">assessment:</span>
                    <p className="text-white text-[11px] font-sans">{parsedOcrResponse.assessment}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">plan:</span>
                    <p className="text-white text-[11px] font-sans">{parsedOcrResponse.plan}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block font-bold">riskLevel:</span>
                    <p className="text-white text-[11px] font-sans">{parsedOcrResponse.riskLevel}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
