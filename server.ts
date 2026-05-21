import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialized Gemini client helper to prevent startup crashes when key is missing
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your credentials in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// ----------------- AI API ENDPOINTS (PROXIED TO GEMINI) -----------------

// Clinical Assistant Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGemini();

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text || m.content || "" }]
    }));

    const systemInstruction = `You are "Alex", the intelligent clinical co-pilot and administrative advisor integrated into the AI-Powered Hospital Information Management System (HIMS).
You have access to current patient context: ${JSON.stringify(context || {})}.
Your goal is to assist physicians, nurses, and administrators with clinical decisions, medical Q&A, patient risk stratification, diagnosis support, and hospital metrics.
Always respond in clear, professional medical terms with an empathetic yet clinical tone. Include bullet points, risk status, and concrete recommendations where appropriate. Do not mention API keys or underlying models.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI model" });
  }
});

// Clinical note summarizer and discharge summary auto-generation
app.post("/api/gemini/clinical-summary", async (req, res) => {
  try {
    const { note, patientInfo } = req.body;
    if (!note) {
      return res.status(400).json({ error: "Clinical notes raw text is required." });
    }

    const ai = getGemini();
    const prompt = `Perform clinical note summarization and entity extraction.
Raw Clinical Notes:
"${note}"

Patient Demographics:
${JSON.stringify(patientInfo || {})}

Provide a structured medical summary in JSON format conforming to the following fields:
- briefSummary: Short summary of the visit (one paragraph)
- subjective: Symptoms, complaints, history as reported by patient
- objective: Vital signs, physical exams noticed
- assessment: Diagnoses or clinical suspicions
- plan: Medications, tests, lifestyle recommendations, follow-up
- riskLevel: "Low", "Moderate", "High" based on details
- extractedEntities: Array of strings of medical terms, medications, or lab tests found in notes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini clinical summary error:", error);
    res.status(500).json({ error: error.message || "Failed to generate clinical summary" });
  }
});

// Differential diagnosis and treatment recommender
app.post("/api/gemini/diagnosis-suggest", async (req, res) => {
  try {
    const { symptoms, vitals } = req.body;

    const ai = getGemini();
    const prompt = `Act as an expert clinical supervisor and differential diagnosis recommender.
Symptoms Reported: ${JSON.stringify(symptoms || "")}
Vitals: ${JSON.stringify(vitals || {})}

Provide clinical guidelines in JSON format:
- differentials: Array of objects with name (string), likelihood ("High", "Medium", "Low"), and rationale (string)
- recommendedLabs: Array of lab test names to run to rule out or confirm diagnoses
- therapyPlan: Proposed non-binding guidelines for medications, therapy, or dietary advice
- urgentAlerts: Array of serious warning signs or red flags for this presentation (or empty).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini diagnosis-suggest error:", error);
    res.status(500).json({ error: error.message || "Failed to obtain AI diagnosis advice" });
  }
});

// Drug checklist and interaction warnings
app.post("/api/gemini/drug-check", async (req, res) => {
  try {
    const { drugs } = req.body;
    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
      return res.status(400).json({ error: "A list of drug names is required." });
    }

    const ai = getGemini();
    const prompt = `Analyze the following prescription list for drug-drug interactions, contraindications, and clinical warning notes.
Prescription List: ${JSON.stringify(drugs)}

Provide safety alerts in JSON format:
- safeToCombine: Boolean indicating if there are no major adverse interactions
- severeInteractions: Array of objects with severity ("High", "Moderate", "None"), participants (array of 2 drug names), and description (string explaining the reaction)
- advisoryNotes: Array of patient advice points (e.g. "Take with food", "Avoid alcohol", "Monitor serum potassium level")
- alternativesSuggested: Dry clinical suggestions of safer options if severe interaction exists
- conciseSummary: A highly concise clinical summary (2-3 sentences max) highlighting the most critical alerts, toxic drug pairings, and primary safety recommendations for the pharmacist and patient.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Drug-Check Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze drug interactions" });
  }
});

// AI Discharge Summary Generator
app.post("/api/gemini/discharge-summary", async (req, res) => {
  try {
    const { diagnosis, vitalsHistory, consultationNotes } = req.body;

    const ai = getGemini();
    const prompt = `Act as an expert clinical supervisor. Generate a comprehensive discharge summary for a patient who was admitted for:
Admitting Diagnosis: ${diagnosis || "Unknown / Routine"}
Recorded Vitals History: ${JSON.stringify(vitalsHistory || [])}
Consultation / Clinician Notes: ${JSON.stringify(consultationNotes || [])}

Provide standard discharge clinical guidelines in JSON format:
- conciseSummary: A professional summary of the patient's stay (2-3 sentences)
- easyToUnderstandSummary: A simple, patient-friendly summary explaining their condition, stay, and recovery in comforting, readable language.
- followUpInstructions: Bullet-point recommendations of when they need to see a physician, urgent symptoms to watch out for, and rest requirements.
- medicationRecommendations: Dosage, schedule, and safety notes for any medications they should take at home.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini discharge-summary error:", error);
    res.status(500).json({ error: error.message || "Failed to generate discharge summary" });
  }
});

// AI Pharmacy Reorder Advisor
app.post("/api/gemini/reorder-advice", async (req, res) => {
  try {
    const { lowStockItems } = req.body;

    const ai = getGemini();
    const prompt = `Act as an expert pharmaceutical supply-chain manager and inventory optimizer. 
We have the following low stock drugs in our hospital dispensary:
${JSON.stringify(lowStockItems)}

For each drug, analyze stock levels, assume standard consumption rates (e.g. 50-200 units/day) and safety buffer ranges, and generate optimal reorder suggestions:
Provide advice in JSON format:
- items: Array of objects with:
  - id: (string) drug ID
  - name: (string) drug name
  - currentStock: (number) current count
  - suggestedQuantity: (number) optimal reorder amount (e.g., 500, 1000, 2000 units)
  - reasoning: (string) explanation combining safety stock reasons and historical consumption cycles
  - supplier: (string) preferred supplier name (e.g., "Apex Pharma Logistics", "Novartis Bulk Distrib", "Global Care Meds")`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini reorder-advice error:", error);
    res.status(500).json({ error: error.message || "Failed to generate reorder advice" });
  }
});

// Bed flow and occupancy forecasting
app.post("/api/gemini/bed-forecast", async (req, res) => {
  try {
    const {
      totalBeds,
      occupiedBeds,
      historicalOccupancy,
      upcomingAdmissions,
      departments,
      opdScheduledCount,
      opdIntakeRate,
      historicalAdmissionsCount,
      historicalDischargesCount,
      recentEmergencyAppointmentsCount
    } = req.body;

    const ai = getGemini();
    const prompt = `Perform hospital operational analytics and bed capacity forecasting.
Hospital Bed Status:
- Total beds: ${totalBeds}
- Currently occupied: ${occupiedBeds}
- Pending scheduled admissions: ${upcomingAdmissions}
- Current Department Status: ${JSON.stringify(departments)}
- Historical trend sequence (weekly occupancy percent): ${JSON.stringify(historicalOccupancy)}

Real-time OPD Data Integrated:
- Scheduled OPD appointments pending: ${opdScheduledCount || 0}
- Current OPD intake rate (Total Scheduled Appointments): ${opdIntakeRate || 0}
- Emergency/Urgent OPD triage cases: ${recentEmergencyAppointmentsCount || 0}

Historical Admission & Discharge Patterns:
- Total admissions on record: ${historicalAdmissionsCount || 0}
- Completed patient discharges: ${historicalDischargesCount || 0}

Based on these clinical metrics (particularly factoring in potential bed demand from immediate OPD scheduled caseload, urgent triage admissions, and historical discharge patterns), please estimate short-term (24-48 hours) bed demand.

Generate a predictive bed capacity assessment in JSON format with fields:
- predictedPercentOccupancy7Days: Number representing projected occupancy rate in 7 days (e.g. 82)
- predictedBottleneckWards: Array of ward names at highest risk of running out of space under this load (e.g. ["ICU", "General Ward A"])
- operationalInsight: Strategic recommendation to optimize discharge flow, coordinate with EMTs, manage high load pressure, and manage the specific OPD incoming volume or discharge rate
- anomalyDetected: Boolean (whether current surge or incoming load is highly unusual or exceeds safety margins).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Bed Forecast Error:", error);
    res.status(500).json({ error: error.message || "Failed to project bed metrics" });
  }
});

// AI 24-Hour Ward Summary Report Generator
app.post("/api/gemini/ward-summary", async (req, res) => {
  try {
    const { anomalyEvents, patientTransfers, bedOccupancyChanges } = req.body;

    const ai = getGemini();
    const prompt = `Act as an expert Chief Medical Officer and hospital operations director. Generate a structured 24-hour ward summary report.
Contextual Data from last 24-hours:
- Anomaly Events logged: ${JSON.stringify(anomalyEvents || [])}
- Patient Transfers & Admission changes: ${JSON.stringify(patientTransfers || [])}
- Bed Occupancy & Capacity changes: ${JSON.stringify(bedOccupancyChanges || [])}

Provide standard clinical and operations dashboard sections in JSON format:
- executiveSummary: A professional clinical-grade summary of the last 24 hours on the ward (2-3 sentences).
- occupancyAnalysis: Synthesized overview of bed occupancy changes, bottlenecks, or safety ratios (2 sentences).
- transferInsights: Highlights of critical patient transfers between departments (e.g. general ward to ICU) and workflow efficiency.
- anomalyOverview: Detailed assessment of recorded vital/biometric anomalies and risk management.
- recommendations: 3-4 bullet joint staff guidelines or workflow optimizations for the incoming clinical crew or floor supervisor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Ward Summary Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate ward summary report" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), keyPresent: !!process.env.GEMINI_API_KEY });
});

// ----------------- VITE DEVELOPMENT OR PRODUCTION SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Started HIMS Express + Vite Dev Middlewares.");
  } else {
    // Production Mode with Compiled Assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving HIMS production build assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI-Powered HIMS running active on port ${PORT}`);
  });
}

startServer();
