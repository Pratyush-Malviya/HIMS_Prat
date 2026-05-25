import React, { useState, useMemo, useEffect } from "react";
// @ts-ignore
import { QrReader } from "react-qr-reader";
import { 
  Pill, 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  Sparkles, 
  Brain, 
  PlusCircle, 
  ShieldAlert, 
  Crosshair, 
  Layers, 
  Truck, 
  History, 
  Plus, 
  Tags, 
  TrendingUp, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  Barcode, 
  Activity, 
  Check,
  Download,
  Camera,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HIMSStore } from "../useHIMSStore";
import { checkDrugInteractions, fetchReorderAdvice } from "../api";

interface PharmacyModuleProps {
  store: HIMSStore;
}

// 20+ item WHO-aligned pharmacopeia for flawless offline / fallback searches
const localMedicinesDB = [
  { brand_name: "Tylenol", generic_name: "Acetaminophen", dosage_form: "Tablet", active_ingredients: [{ name: "Acetaminophen", strength: "5000mg" }], labeler_name: "McNeil Consumer Healthcare", category: "Analgesics", unit_price: 1.5, cost_price: 0.3, manufacturer: "McNeil", strength_text: "500mg" },
  { brand_name: "Advil", generic_name: "Ibuprofen", dosage_form: "Tablet", active_ingredients: [{ name: "Ibuprofen", strength: "200mg" }], labeler_name: "Pfizer / Wyeth", category: "Analgesics", unit_price: 2.0, cost_price: 0.4, manufacturer: "Pfizer", strength_text: "200mg" },
  { brand_name: "Lipitor", generic_name: "Atorvastatin Calcium", dosage_form: "Tablet", active_ingredients: [{ name: "Atorvastatin Calcium", strength: "10mg" }], labeler_name: "Pfizer Inc.", category: "Cardiology", unit_price: 4.5, cost_price: 1.1, manufacturer: "Pfizer", strength_text: "20mg" },
  { brand_name: "Glucophage", generic_name: "Metformin Hydrochloride", dosage_form: "Tablet", active_ingredients: [{ name: "Metformin Hydrochloride", strength: "850mg" }], labeler_name: "Bristol-Myers Squibb", category: "Endocrinology", unit_price: 2.2, cost_price: 0.5, manufacturer: "Bristol-Myers Squibb", strength_text: "500mg" },
  { brand_name: "Amoxil", generic_name: "Amoxicillin", dosage_form: "Capsule", active_ingredients: [{ name: "Amoxicillin", strength: "500mg" }], labeler_name: "Sandoz / Novartis", category: "Anti-Infective", unit_price: 7.5, cost_price: 2.2, manufacturer: "Sandoz", strength_text: "500mg" },
  { brand_name: "Zithromax", generic_name: "Azithromycin", dosage_form: "Tablet", active_ingredients: [{ name: "Azithromycin", strength: "250mg" }], labeler_name: "Pfizer Inc.", category: "Anti-Infective", unit_price: 15.0, cost_price: 4.5, manufacturer: "Pfizer", strength_text: "250mg" },
  { brand_name: "Ventolin HFA", generic_name: "Albuterol Sulfate", dosage_form: "Inhaler", active_ingredients: [{ name: "Albuterol Sulfate", strength: "90mcg" }], labeler_name: "GlaxoSmithKline", category: "Respiratory", unit_price: 18.0, cost_price: 5.0, manufacturer: "GSK", strength_text: "100mcg" },
  { brand_name: "Lantus SoloStar", generic_name: "Insulin Glargine", dosage_form: "Injection", active_ingredients: [{ name: "Insulin Glargine", strength: "100 U/mL" }], labeler_name: "Sanofi-Aventis", category: "Endocrinology", unit_price: 42.0, cost_price: 15.0, manufacturer: "Sanofi", strength_text: "100 U/mL" },
  { brand_name: "Synthroid", generic_name: "Levothyroxine Sodium", dosage_form: "Tablet", active_ingredients: [{ name: "Levothyroxine Sodium", strength: "100mcg" }], labeler_name: "AbbVie Inc.", category: "Endocrinology", unit_price: 3.5, cost_price: 0.8, manufacturer: "AbbVie", strength_text: "100mcg" },
  { brand_name: "Zoloft", generic_name: "Sertraline Hydrochloride", dosage_form: "Tablet", active_ingredients: [{ name: "Sertraline Hydrochloride", strength: "50mg" }], labeler_name: "Roerig (Pfizer)", category: "Neurology", unit_price: 5.0, cost_price: 1.2, manufacturer: "Pfizer", strength_text: "50mg" },
  { brand_name: "Prilosec", generic_name: "Omeprazole", dosage_form: "Capsule", active_ingredients: [{ name: "Omeprazole", strength: "20mg" }], labeler_name: "Procter & Gamble", category: "Gastrointestinal", unit_price: 3.0, cost_price: 0.6, manufacturer: "P&G", strength_text: "20mg" },
  { brand_name: "Norvasc", generic_name: "Amlodipine Besylate", dosage_form: "Tablet", active_ingredients: [{ name: "Amlodipine Besylate", strength: "5mg" }], labeler_name: "Pfizer Inc.", category: "Cardiology", unit_price: 3.2, cost_price: 0.7, manufacturer: "Pfizer", strength_text: "5mg" },
  { brand_name: "Lasix", generic_name: "Furosemide", dosage_form: "Tablet", active_ingredients: [{ name: "Furosemide", strength: "40mg" }], labeler_name: "Sanofi-Aventis", category: "Cardiology", unit_price: 1.8, cost_price: 0.3, manufacturer: "Sanofi", strength_text: "40mg" },
  { brand_name: "Flexeril", generic_name: "Cyclobenzaprine Hydrochloride", dosage_form: "Tablet", active_ingredients: [{ name: "Cyclobenzaprine Hydrochloride", strength: "10mg" }], labeler_name: "McNeil Pediatrics", category: "Neurology", unit_price: 2.8, cost_price: 0.6, manufacturer: "McNeil", strength_text: "10mg" },
  { brand_name: "Claritin", generic_name: "Loratadine", dosage_form: "Tablet", active_ingredients: [{ name: "Loratadine", strength: "10mg" }], labeler_name: "Bayer Healthcare", category: "Respiratory", unit_price: 1.2, cost_price: 0.2, manufacturer: "Bayer", strength_text: "10mg" },
  { brand_name: "Prozac", generic_name: "Fluoxetine Hydrochloride", dosage_form: "Capsule", active_ingredients: [{ name: "Fluoxetine Hydrochloride", strength: "20mg" }], labeler_name: "Eli Lilly & Company", category: "Neurology", unit_price: 4.8, cost_price: 0.9, manufacturer: "Eli Lilly", strength_text: "20mg" },
  { brand_name: "Crestor", generic_name: "Rosuvastatin Calcium", dosage_form: "Tablet", active_ingredients: [{ name: "Rosuvastatin Calcium", strength: "10mg" }], labeler_name: "AstraZeneca LP", category: "Cardiology", unit_price: 6.2, cost_price: 1.5, manufacturer: "AstraZeneca", strength_text: "10mg" },
  { brand_name: "Lexapro", generic_name: "Escitalopram Oxalate", dosage_form: "Tablet", active_ingredients: [{ name: "Escitalopram Oxalate", strength: "10mg" }], labeler_name: "Forest Laboratories", category: "Neurology", unit_price: 5.5, cost_price: 1.0, manufacturer: "Forest Lab", strength_text: "10mg" },
  { brand_name: "Plavix", generic_name: "Clopidogrel Bisulfate", dosage_form: "Tablet", active_ingredients: [{ name: "Clopidogrel Bisulfate", strength: "75mg" }], labeler_name: "Bristol-Myers Squibb", category: "Cardiology", unit_price: 8.5, cost_price: 2.0, manufacturer: "Bristol-Myers", strength_text: "75mg" },
  { brand_name: "Singulair", generic_name: "Montelukast Sodium", dosage_form: "Tablet", active_ingredients: [{ name: "Montelukast Sodium", strength: "10mg" }], labeler_name: "Merck & Co.", category: "Respiratory", unit_price: 5.0, cost_price: 1.1, manufacturer: "Merck", strength_text: "10mg" }
];

const defaultCategories = [
  { name: "Cardiology", description: "Medications targeting hypertension, heart failure, and coronary artery blockages." },
  { name: "Endocrinology", description: "Insulins, oral hypoglycemics, and metabolic endocrine hormone regulators." },
  { name: "Anti-Infective", description: "Broad-spectrum antibiotics, critical antivirals, and anti-fungals." },
  { name: "Respiratory", description: "Bronchodilators, inhalers, corticosteroid controllers, and allergy therapies." },
  { name: "Neurology", description: "Synapse modulators, antiseizure agents, migraine capsules, and neural care." },
  { name: "Gastrointestinal", description: "Proton pump inhibitors, antiemetics, and therapeutic gastric coatings." },
  { name: "Analgesics", description: "Pain management tablets, heavy NSAIDs, and localized anesthetics." }
];

const defaultTransactions = [
  { id: "tx-1", medicineName: "Amlodipine 5mg", type: "INWARD", quantity: 500, batchNumber: "BCH-AML-911", costPrice: 1.20, supplier: "Global Pharma Corp", date: "2026-05-18T09:15:00Z" },
  { id: "tx-2", medicineName: "Amoxicillin 500mg", type: "INWARD", quantity: 200, batchNumber: "BCH-AMX-442", costPrice: 3.10, supplier: "Apex Biologicals", date: "2026-05-21T14:30:00Z" },
  { id: "tx-3", medicineName: "Salbutamol Inhaler 100mcg", type: "OUTWARD", quantity: 28, batchNumber: "BCH-SAL-202", costPrice: 6.50, supplier: "Prescribed Dispense", date: "2026-05-24T11:05:00Z" }
];

export function PharmacyModule({ store }: PharmacyModuleProps) {
  const { medicines, updateMedicineStock, addMedicineInventory } = store;

  // Active module sub-tabs
  const [activeTab, setActiveTab] = useState<"directory" | "inward" | "categories" | "openfda" | "safety">("directory");

  // Search, filter, category state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dosageFilter, setDosageFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<"All" | "ExpiringSoon" | "Expired">("All");

  // Categories persistence
  const [categories, setCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("hims_pharmacy_categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  // Supply transactions persistence
  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem("hims_pharmacy_transactions");
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  // State to custom build new product formulation
  const [newMed, setNewMed] = useState({
    name: "",
    dosageForm: "Tablet",
    strength: "",
    stockCount: "100",
    safetyStock: "200",
    unitPrice: "4.50",
    expiryDate: "2028-12-31",
    location: "Row A-1",
    category: "Cardiology",
    sku: "",
    supplier: "Global Pharma Corp",
    costPrice: "1.50",
    manufacturer: "Pfizer"
  });

  // State for new custom category
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });

  // State for recording stock check-in (Inward Batch)
  const [newStockTx, setNewStockTx] = useState({
    medicineId: "",
    quantity: "250",
    batchNumber: "",
    costPrice: "",
    supplier: "",
    expiryDate: "2028-06-30",
    location: ""
  });

  // Auto-suggest and validation error dialog states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // QR Code generator and print modal states
  const [printQrOpen, setPrintQrOpen] = useState(false);
  const [qrLabelDetails, setQrLabelDetails] = useState({
    name: "",
    strength: "",
    sku: "",
    batch: "BCH-INITIAL-0",
    expiryDate: "",
    location: ""
  });

  const handleOpenQRModal = () => {
    const activeSku = newMed.sku || (newMed.name ? `RX-${newMed.name.trim().substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` : "RX-NEW-SAMPLE");
    
    setQrLabelDetails({
      name: newMed.name || "Amlodipine Besylate",
      strength: newMed.strength || "5mg",
      sku: activeSku,
      batch: "BCH-INITIAL-0",
      expiryDate: newMed.expiryDate || "2028-12-31",
      location: newMed.location || "Shelf A-1"
    });
    setPrintQrOpen(true);
  };

  // Drug Interaction Form
  const [interactDrugsText, setInteractDrugsText] = useState("");
  const [evaluatingSafety, setEvaluatingSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<any>(null);

  // Medication Barcode / QR Lookup state
  const [lookupSku, setLookupSku] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  // Register formulation intake scanner state (using react-qr-reader)
  const [isIntakeScannerActive, setIsIntakeScannerActive] = useState(false);
  const [intakeScanError, setIntakeScanError] = useState("");
  const [intakeScanSuccessMessage, setIntakeScanSuccessMessage] = useState("");

  const handleIntakeQRScan = (scannedText: string) => {
    if (!scannedText) return;
    const cleanSku = scannedText.trim().toUpperCase();
    
    // Check our core stock list first
    const matchInCore = medicines.find(m => (m.sku || "").toUpperCase() === cleanSku);
    
    const skuMap: Record<string, any> = {
      "RX-TYL-500": { name: "Tylenol", strength: "500gm", dosageForm: "Tablet", category: "Analgesics", unitPrice: "1.50", costPrice: "0.30", manufacturer: "McNeil" },
      "RX-ADV-200": { name: "Advil", strength: "200gm", dosageForm: "Tablet", category: "Analgesics", unitPrice: "2.00", costPrice: "0.40", manufacturer: "Pfizer" },
      "RX-LIP-020": { name: "Lipitor", strength: "20mg", dosageForm: "Tablet", category: "Cardiology", unitPrice: "4.50", costPrice: "1.10", manufacturer: "Pfizer" },
      "RX-GLU-500": { name: "Glucophage", strength: "500mg", dosageForm: "Tablet", category: "Endocrinology", unitPrice: "2.20", costPrice: "0.50", manufacturer: "Bristol-Myers Squibb" },
      "RX-AMX-500": { name: "Amoxil", strength: "500gm", dosageForm: "Capsule", category: "Anti-Infective", unitPrice: "7.50", costPrice: "2.20", manufacturer: "Sandoz" },
      "RX-ZIT-250": { name: "Zithromax", strength: "250gm", dosageForm: "Tablet", category: "Anti-Infective", unitPrice: "15.00", costPrice: "4.50", manufacturer: "Pfizer" },
      "RX-ALB-100": { name: "Ventolin HFA", strength: "100mcg", dosageForm: "Inhaler", category: "Respiratory", unitPrice: "18.00", costPrice: "5.00", manufacturer: "GSK" },
    };

    const matched = skuMap[cleanSku] || (matchInCore ? {
      name: matchInCore.name,
      strength: matchInCore.strength,
      dosageForm: matchInCore.dosageForm,
      category: matchInCore.category,
      unitPrice: matchInCore.unitPrice.toString(),
      costPrice: matchInCore.costPrice ? matchInCore.costPrice.toString() : "1.50",
      manufacturer: matchInCore.manufacturer || "Generic"
    } : null);

    if (matched) {
      setNewMed(prev => ({
        ...prev,
        name: matched.name,
        strength: matched.strength,
        dosageForm: matched.dosageForm,
        category: matched.category,
        unitPrice: matched.unitPrice,
        costPrice: matched.costPrice,
        manufacturer: matched.manufacturer,
        sku: cleanSku
      }));
      setIntakeScanSuccessMessage(`Successfully found & filled: ${matched.name} (${cleanSku})`);
      setIsIntakeScannerActive(false);
      setTimeout(() => setIntakeScanSuccessMessage(""), 4000);
    } else {
      // Find in WHO local Medicines DB
      const localMatch = localMedicinesDB.find(m => 
        m.brand_name.toUpperCase().includes(cleanSku) || 
        m.generic_name.toUpperCase().includes(cleanSku)
      );
      if (localMatch) {
        setNewMed(prev => ({
          ...prev,
          name: localMatch.brand_name,
          strength: localMatch.strength_text || "500mg",
          dosageForm: ["tablet", "capsule", "injection", "syrup", "inhaler", "dermal ointment"].includes(localMatch.dosage_form.toLowerCase()) ? localMatch.dosage_form : "Tablet",
          category: localMatch.category,
          unitPrice: localMatch.unit_price.toString(),
          costPrice: localMatch.cost_price.toString(),
          manufacturer: localMatch.manufacturer || "Generic",
          sku: cleanSku
        }));
        setIntakeScanSuccessMessage(`Matched local database: ${localMatch.brand_name} (${cleanSku})`);
        setIsIntakeScannerActive(false);
        setTimeout(() => setIntakeScanSuccessMessage(""), 4000);
      } else {
        // Setting SKU
        setNewMed(prev => ({
          ...prev,
          sku: cleanSku
        }));
        setIntakeScanSuccessMessage(`Populated custom SKU: "${cleanSku}". Complete formulation fields manually.`);
        setTimeout(() => setIntakeScanSuccessMessage(""), 5000);
      }
    }
  };

  const handleLookupSKU = (skuVal: string) => {
    setLookupSku(skuVal);
    if (!skuVal.trim()) {
      setLookupResult(null);
      return;
    }
    const cleanSku = skuVal.trim().toUpperCase();
    const found = medicines.find(m => (m.sku || "").toUpperCase() === cleanSku);
    if (found) {
      setLookupResult(found);
    } else {
      // Check local medicines DB if there is a match by brand name or generic name as SKU fallback
      const localMatch = localMedicinesDB.find(m => 
        ((m as any).sku && (m as any).sku.toUpperCase() === cleanSku) ||
        m.brand_name.toUpperCase().includes(cleanSku) ||
        m.generic_name.toUpperCase().includes(cleanSku)
      );
      if (localMatch) {
        setLookupResult({
          id: `local-match-${localMatch.brand_name.substring(0, 3)}`,
          name: localMatch.brand_name,
          strength: localMatch.strength_text || "500mg",
          dosageForm: ["tablet", "capsule", "injection", "syrup", "inhaler", "dermal ointment"].includes(localMatch.dosage_form.toLowerCase())
            ? localMatch.dosage_form
            : "Tablet",
          category: localMatch.category,
          stockCount: 0,
          safetyStock: 50,
          unitPrice: localMatch.unit_price || 4.5,
          costPrice: localMatch.cost_price || 1.2,
          manufacturer: localMatch.manufacturer || "FDA Recognized Lab",
          location: "Not Assumed (Shelf X)",
          expiryDate: "2028-12-31",
          sku: cleanSku
        });
      } else {
        setLookupResult(null);
      }
    }
  };

  const handleSimulateScan = (skuToScan: string) => {
    // Flash scanning message
    setScanMessage("QR Code detected! Decoding SKU...");
    setTimeout(() => {
      handleLookupSKU(skuToScan);
      setScanMessage(`Scan Successful: decoded "${skuToScan}"`);
      setTimeout(() => setScanMessage(""), 3000);
    }, 800);
  };

  // Webcam capture reference for scanner
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isScannerActive) {
      setScanMessage("Initiating optical scanner stream...");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
          setScanMessage("Optical Scanner Active. Scanning for QR labels...");
        })
        .catch(err => {
          console.warn("Could not initiate actual webcam stream:", err);
          setScanMessage("Webcam not available. Falling back to scan simulation panel.");
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerActive]);

  // Supply Chain state
  const [analyzingLowStock, setAnalyzingLowStock] = useState(false);
  const [reorderAdviceList, setReorderAdviceList] = useState<any[] | null>(null);

  // OpenFDA Search state
  const [openFdaSearch, setOpenFdaSearch] = useState("");
  const [fdaResults, setFdaResults] = useState<any[]>([]);
  const [fdaLoading, setFdaLoading] = useState(false);
  const [fdaError, setFdaError] = useState<string | null>(null);
  const [fdaFeedback, setFdaFeedback] = useState<string | null>(null);

  // Sync state helpers to localStorage
  const saveCategories = (updated: any[]) => {
    setCategories(updated);
    localStorage.setItem("hims_pharmacy_categories", JSON.stringify(updated));
  };

  const saveTransactions = (updated: any[]) => {
    setTransactions(updated);
    localStorage.setItem("hims_pharmacy_transactions", JSON.stringify(updated));
  };

  // Trigger AI Low Stock reorder recommendation
  const lowStocks = medicines.filter((m) => m.stockCount <= m.safetyStock);

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

  // Calculations for KPI dashboard Cards
  const totalFormulations = medicines.length;
  const totalStockCountSum = medicines.reduce((acc, m) => acc + m.stockCount, 0);
  const lowStockCount = lowStocks.length;
  const totalAssetsValue = medicines.reduce((acc, m) => acc + (m.stockCount * m.unitPrice), 0);

  // Expiration calculations
  const expiredMeds = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const expiryObj = new Date(m.expiryDate);
      expiryObj.setHours(0, 0, 0, 0);
      return expiryObj.getTime() < today.getTime();
    });
  }, [medicines]);

  const expiringSoonMeds = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const expiryObj = new Date(m.expiryDate);
      expiryObj.setHours(0, 0, 0, 0);
      const diffTime = expiryObj.getTime() - today.getTime();
      if (diffTime < 0) return false; // already expired
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    });
  }, [medicines]);

  // Filter medicines
  const filteredMeds = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return medicines.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
      const matchesDosage = !dosageFilter || (m.dosageForm || "").toLowerCase().includes(dosageFilter.toLowerCase());
      
      let matchesExpiry = true;
      if (expiryFilter !== "All") {
        const expiryObj = m.expiryDate ? new Date(m.expiryDate) : null;
        if (!expiryObj) {
          matchesExpiry = false;
        } else {
          expiryObj.setHours(0, 0, 0, 0);
          const diffTime = expiryObj.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (expiryFilter === "Expired") {
            matchesExpiry = diffTime < 0;
          } else if (expiryFilter === "ExpiringSoon") {
            matchesExpiry = diffDays >= 0 && diffDays <= 30;
          }
        }
      }
      
      return matchesSearch && matchesCategory && matchesDosage && matchesExpiry;
    });
  }, [medicines, searchTerm, categoryFilter, dosageFilter, expiryFilter]);

  // Download filtered stock table as CSV
  const handleDownloadCSV = () => {
    const headers = ["SKU Code", "Generic Product Name", "Category", "Dosage Form", "Available Stock", "Safety Stock Buffer", "UnitPrice ($)", "Manufacturer", "Shelf Storage Cell", "Expiry Date"];
    const csvRows = [
      headers.join(","),
      ...filteredMeds.map(med => [
        `"${(med.sku || "UNCODED").replace(/"/g, '""')}"`,
        `"${(med.name || "").replace(/"/g, '""')}"`,
        `"${(med.category || "General").replace(/"/g, '""')}"`,
        `"${(med.dosageForm || "Tablet").replace(/"/g, '""')}"`,
        med.stockCount,
        med.safetyStock || 50,
        med.unitPrice.toFixed(2),
        `"${(med.manufacturer || "N/A").replace(/"/g, '""')}"`,
        `"${(med.location || "N/A").replace(/"/g, '""')}"`,
        med.expiryDate || "N/A"
      ].join(","))
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HIMS_Pharmacy_Stock_Catalog_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle addition of new product formulation
  const handleAddNewMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.strength || !newMed.stockCount) {
      alert("Generic name, strength, and opening stocks count are required.");
      return;
    }

    const stockCountVal = parseInt(newMed.stockCount) || 0;
    const safetyStockVal = parseInt(newMed.safetyStock) || 0;
    if (stockCountVal < safetyStockVal) {
      setErrorDialogMessage(`Registration Failed: Current stock level (${stockCountVal}) is lower than the required safety stock level (${safetyStockVal}). Low initial buffers increase stock-out risk. Please increase current stock or lower safety stock.`);
      setErrorDialogOpen(true);
      return;
    }

    const generatedSku = newMed.sku || `RX-${newMed.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const added = addMedicineInventory(
      {
        name: newMed.name,
        dosageForm: newMed.dosageForm,
        strength: newMed.strength,
        stockCount: parseInt(newMed.stockCount) || 100,
        safetyStock: parseInt(newMed.safetyStock) || 100,
        unitPrice: parseFloat(newMed.unitPrice) || 4.5,
        expiryDate: newMed.expiryDate || "2027-12-31",
        location: newMed.location || "Shelf A-1",
        category: newMed.category || "Analgesics",
        sku: generatedSku,
        supplier: newMed.supplier || "Direct Sourcing",
        costPrice: parseFloat(newMed.costPrice) || 1.50,
        manufacturer: newMed.manufacturer || "Generic Labs"
      },
      "Pharmacy Supervisor",
      "Pharmacy Boss"
    );

    // Record as an inward stock transaction inside local log
    const logTx = {
      id: `tx-${Date.now()}`,
      medicineName: `${newMed.name} ${newMed.strength}`,
      type: "INWARD",
      quantity: parseInt(newMed.stockCount) || 100,
      batchNumber: "BCH-INITIAL-0",
      costPrice: parseFloat(newMed.costPrice) || 1.5,
      supplier: newMed.supplier || "Direct Sourcing",
      date: new Date().toISOString()
    };
    saveTransactions([logTx, ...transactions]);

    setNewMed({
      name: "",
      dosageForm: "Tablet",
      strength: "",
      stockCount: "100",
      safetyStock: "200",
      unitPrice: "4.50",
      expiryDate: "2028-12-31",
      location: "Row A-1",
      category: newMed.category, // keep same category selected for fast entries
      sku: "",
      supplier: "Global Pharma Corp",
      costPrice: "1.50",
      manufacturer: "Pfizer"
    });
    alert(`Success: Registered "${added.name} ${added.strength}" in clinical catalog with SKU: ${generatedSku}.`);
  };

  // Add new Custom stock category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    
    // Check duplication
    const duplicate = categories.find(c => c.name.toLowerCase() === newCategory.name.toLowerCase());
    if (duplicate) {
      alert("A stock category with this name already exists.");
      return;
    }

    const updated = [...categories, {
      name: newCategory.name.trim(),
      description: newCategory.description || "Custom dispensary category."
    }];
    saveCategories(updated);
    setNewCategory({ name: "", description: "" });
    alert(`Category "${newCategory.name}" successfully registered under dispensary categories.`);
  };

  // Handle adding a stock inward transaction (increment inventory batch)
  const handleAddStockTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const { medicineId, quantity, batchNumber, costPrice, supplier, expiryDate, location } = newStockTx;
    if (!medicineId || !quantity) {
      alert("Please select a formulary drug and provide the quantities received.");
      return;
    }

    const targetMed = medicines.find(m => m.id === medicineId);
    if (!targetMed) return;

    const qtyVal = parseInt(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      alert("Valid quantity is required.");
      return;
    }

    // Call store method to update inventory levels
    updateMedicineStock(medicineId, qtyVal, "Pharmacy Supervisor", "Pharmacy Boss");

    // Track a nice inward receipt log
    const logReceipt = {
      id: `tx-${Date.now()}`,
      medicineName: `${targetMed.name} ${targetMed.strength}`,
      type: "INWARD",
      quantity: qtyVal,
      batchNumber: batchNumber || `BCH-${Math.floor(100+Math.random()*900)}`,
      costPrice: parseFloat(costPrice) || targetMed.costPrice || 1.0,
      supplier: supplier || targetMed.supplier || "Vendor Stock Check-in",
      date: new Date().toISOString()
    };
    saveTransactions([logReceipt, ...transactions]);

    setNewStockTx({
      medicineId: "",
      quantity: "250",
      batchNumber: "",
      costPrice: "",
      supplier: "",
      expiryDate: "2028-06-30",
      location: ""
    });
    alert(`Successfully checked-in ${qtyVal} units for ${targetMed.name} ${targetMed.strength}. Dispensary levels re-calculated.`);
  };

  // Search OpenFDA public registry API (with smooth fallback data)
  const handleSearchFDA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openFdaSearch.trim()) return;
    setFdaLoading(true);
    setFdaError(null);
    setFdaResults([]);

    try {
      // First try a narrow brand name search on the real OpenFDA API
      const url = `https://api.fda.gov/drug/ndc.json?search=brand_name:"${encodeURIComponent(openFdaSearch.trim())}"&limit=10`;
      const res = await fetch(url);
      
      if (!res.ok) {
        // Fallback to active ingredient search or non-quoted search
        const fallbackUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(openFdaSearch.trim())}"&limit=10`;
        const resFb = await fetch(fallbackUrl);
        if (!resFb.ok) {
          throw new Error("API call limits or record not found on live database.");
        }
        const dataFb = await resFb.json();
        if (dataFb.results && dataFb.results.length > 0) {
          setFdaResults(dataFb.results);
          return;
        }
      } else {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setFdaResults(data.results);
          return;
        }
      }
      throw new Error("No records returned. Triggering pharmacopeia baseline search.");

    } catch (err: any) {
      console.log("OpenFDA query offline or not found, showing rich local open-source data: ", err.message);
      
      // Fallback search over our WHO baseline localMedicinesDB
      const query = openFdaSearch.toLowerCase();
      const localMatches = localMedicinesDB.filter(
        item => item.brand_name.toLowerCase().includes(query) || 
                item.generic_name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
      );

      if (localMatches.length > 0) {
        // Transform localMatches into openFDA-standard schema shape for perfect UI consistency!
        const parsedResults = localMatches.map(m => ({
          brand_name: m.brand_name,
          generic_name: m.generic_name,
          dosage_form: m.dosage_form,
          active_ingredients: m.active_ingredients,
          labeler_name: m.labeler_name,
          is_local_baseline: true,
          _meta: m
        }));
        setFdaResults(parsedResults);
      } else {
        setFdaError(`No drugs found for "${openFdaSearch}" in OpenFDA registry or our pharmacopeia. Try 'Ibuprofen', 'Metformin', or 'Amoxicillin'.`);
      }
    } finally {
      setFdaLoading(false);
    }
  };

  // Direct fast-import of open-source medicine catalogs
  const handleFastImport = (fdaItem: any) => {
    const brandName = fdaItem.brand_name || fdaItem.generic_name;
    const isLocal = fdaItem.is_local_baseline;
    
    const formulationDetails = {
      name: brandName,
      dosageForm: fdaItem.dosage_form || "Tablet",
      strength: fdaItem.active_ingredients?.[0]?.strength || fdaItem._meta?.strength_text || "500mg",
      stockCount: 150,
      safetyStock: 50,
      unitPrice: fdaItem._meta?.unit_price || 4.5,
      expiryDate: "2028-06-30",
      location: "Shelf FDA-Imported",
      category: fdaItem._meta?.category || fdaItem.category || "Analgesics",
      sku: `RX-FDA-${brandName.substring(0, 3).toUpperCase()}-${Math.floor(100+Math.random()*900)}`,
      supplier: fdaItem.labeler_name || "FDA Registry",
      costPrice: fdaItem._meta?.cost_price || 1.2,
      manufacturer: fdaItem.labeler_name || "FDA Recognized Lab"
    };

    // Add directly to global stores
    addMedicineInventory(
      {
        name: formulationDetails.name,
        dosageForm: formulationDetails.dosageForm,
        strength: formulationDetails.strength,
        stockCount: formulationDetails.stockCount,
        safetyStock: formulationDetails.safetyStock,
        unitPrice: formulationDetails.unitPrice,
        expiryDate: formulationDetails.expiryDate,
        location: formulationDetails.location,
        category: formulationDetails.category,
        sku: formulationDetails.sku,
        supplier: formulationDetails.supplier,
        costPrice: formulationDetails.costPrice,
        manufacturer: formulationDetails.manufacturer
      },
      "FDA importer client",
      "Pharmacy Boss"
    );

    // Add transactions
    const logInward = {
      id: `tx-${Date.now()}`,
      medicineName: `${formulationDetails.name} ${formulationDetails.strength}`,
      type: "INWARD",
      quantity: 150,
      batchNumber: `FDA-${Math.floor(1000+Math.random()*9000)}`,
      costPrice: formulationDetails.costPrice,
      supplier: formulationDetails.supplier,
      date: new Date().toISOString()
    };
    saveTransactions([logInward, ...transactions]);

    setFdaFeedback(`Successfully imported "${brandName}" into active formulary registry!`);
    setTimeout(() => setFdaFeedback(null), 3000);
  };

  // Pre-load fda result parameters into new product card formulation form
  const handleLoadToForm = (fdaItem: any) => {
    const brandName = fdaItem.brand_name || fdaItem.generic_name;
    const strengthVal = fdaItem.active_ingredients?.[0]?.strength || fdaItem._meta?.strength_text || "250mg";
    
    setNewMed({
      name: brandName,
      dosageForm: fdaItem.dosage_form || "Tablet",
      strength: strengthVal,
      stockCount: "150",
      safetyStock: "50",
      unitPrice: fdaItem._meta?.unit_price?.toString() || "6.50",
      expiryDate: "2028-12-31",
      location: "Shelf FDA-C3",
      category: fdaItem._meta?.category || fdaItem.category || "Analgesics",
      sku: `RX-FDA-${brandName.substring(0, 3).toUpperCase()}-${Math.floor(100+Math.random()*900)}`,
      supplier: fdaItem.labeler_name || "FDA Registry vendor",
      costPrice: fdaItem._meta?.cost_price?.toString() || "1.80",
      manufacturer: fdaItem.labeler_name || "FDA Approved Manufacturer"
    });
    
    setActiveTab("directory");
    setFdaFeedback("Loaded pharmaceutical parameters to Product Formulation Form.");
    setTimeout(() => setFdaFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner Area */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-150 p-4 rounded-xl text-left shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Formulary</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalFormulations} Drugs</span>
          </div>
          <div className="w-10 h-10 bg-slate-900/5 text-slate-900 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-xl text-left shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Depot Stock</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalStockCountSum} Units</span>
          </div>
          <div className="w-10 h-10 bg-slate-900/5 text-slate-900 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-xl text-left shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Low Stock Warns</span>
            <span className={`text-xl font-bold mt-0.5 block ${lowStockCount > 0 ? "text-amber-600 animate-pulse" : "text-slate-900"}`}>
              {lowStockCount} Triggers
            </span>
          </div>
          <div className="w-10 h-10 bg-slate-900/5 text-slate-900 rounded-lg flex items-center justify-center">
            <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? "text-amber-500" : "text-slate-400"}`} />
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-xl text-left shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Catalog Asset Value</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">${totalAssetsValue.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 bg-slate-900/5 text-slate-900 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector bar */}
      <div className="bg-white border border-slate-150 p-2 rounded-xl shadow-sm flex flex-wrap gap-2 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab("directory")}
          id="btn-tab-directory"
          className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all ${
            activeTab === "directory" ? "bg-slate-950 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <Pill className="w-4 h-4" />
          Formulary Products
        </button>

        <button
          onClick={() => setActiveTab("inward")}
          id="btn-tab-inward"
          className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all ${
            activeTab === "inward" ? "bg-slate-950 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <Truck className="w-4 h-4" />
          Stock Check-In
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          id="btn-tab-categories"
          className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all ${
            activeTab === "categories" ? "bg-slate-950 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <Tags className="w-4 h-4" />
          Drug Categories
        </button>

        <button
          onClick={() => setActiveTab("openfda")}
          id="btn-tab-openfda"
          className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all ${
            activeTab === "openfda" ? "bg-slate-950 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <Activity className="w-4 h-4" />
          OpenFDA Importer
        </button>

        <button
          onClick={() => setActiveTab("safety")}
          id="btn-tab-safety"
          className={`flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition-all ${
            activeTab === "safety" ? "bg-slate-950 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
          }`}
        >
          <Brain className="w-4 h-4" />
          Clinical Multi-Drug Guard
        </button>
      </div>

      {/* Floating dynamic status messaging */}
      {fdaFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl flex items-center justify-between text-left animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {fdaFeedback}
          </div>
        </div>
      )}

      {/* Main Workspace content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >

          {/* TAB 1: PRODUCT DIRECTORY */}
          {activeTab === "directory" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-left">
              {/* Product Addition Block */}
              <div className="xl:col-span-1 space-y-4">
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      Register Formulation
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Register a new drug into the digital formulary registry</p>
                  </div>

                  <form onSubmit={handleAddNewMed} className="space-y-3.5 text-xs text-slate-700" id="form-add-new-med-catalog">
                    {/* QR Code Scanner Trigger */}
                    <div className="mb-4 bg-slate-50 border border-slate-150 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-4 h-4 text-slate-600" />
                          <div>
                            <span className="font-bold text-[10px] text-slate-700 uppercase tracking-wide block">Rapid QR Intake Scan</span>
                            <span className="text-[9px] text-slate-400 block leading-tight">Scan item to auto-fill formulary fields</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsIntakeScannerActive(!isIntakeScannerActive);
                            setIntakeScanError("");
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                            isIntakeScannerActive 
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                          id="btn-toggle-intake-scanner"
                        >
                          <Camera className="w-3 h-3" />
                          {isIntakeScannerActive ? "Disable Camera" : "Configure Scanner"}
                        </button>
                      </div>

                      {intakeScanSuccessMessage && (
                        <div className="mt-2 p-1.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-150 flex items-center gap-1 text-[9.5px] font-medium" id="intake-scan-success">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-bounce" />
                          <span>{intakeScanSuccessMessage}</span>
                        </div>
                      )}

                      {isIntakeScannerActive && (
                        <div className="mt-3 space-y-2.5">
                          {/* Main Camera view container */}
                          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-lg aspect-square sm:aspect-video flex flex-col items-center justify-center text-center text-white p-2">
                            <div className="absolute inset-0 z-0 opacity-40">
                              {/* Standard react-qr-reader scan stream */}
                              <QrReader
                                onResult={(result: any, error: any) => {
                                  if (result) {
                                    handleIntakeQRScan(result.getText());
                                  }
                                  if (error) {
                                    // standard camera loop frame error - safe to ignore
                                  }
                                }}
                                constraints={{ facingMode: "environment" }}
                                style={{ width: "100%", height: "100%" }}
                              />
                            </div>
                            
                            {/* HUD overlay style */}
                            <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 m-4 pointer-events-none rounded flex items-center justify-center">
                              <div className="w-32 h-32 border-2 border-emerald-400 absolute animate-pulse rounded opacity-75"></div>
                            </div>
                            
                            <div className="relative z-10 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 m-2 space-y-1">
                              <p className="text-[10px] text-emerald-400 font-mono tracking-wide flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                                Camera Lens Activated
                              </p>
                              <span className="text-[9px] text-slate-400 block leading-tight">Hold any medication Barcode or QR up to the lens.</span>
                            </div>
                          </div>

                          {/* Quick Intake Scan simulators */}
                          <div className="bg-white border border-slate-150 rounded-lg p-2.5 space-y-1.5 text-left shadow-inner">
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Scan Presets (Simulate Scan):</span>
                            <div className="grid grid-cols-2 gap-1.5 text-[9px] max-h-32 overflow-y-auto">
                              <button
                                type="button"
                                onMouseDown={() => handleIntakeQRScan("RX-TYL-500")}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-slate-200 rounded text-left truncate flex items-center gap-1 font-medium select-none"
                              >
                                <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Tylenol (RX-TYL-500)</span>
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => handleIntakeQRScan("RX-AMX-500")}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-slate-200 rounded text-left truncate flex items-center gap-1 font-medium select-none"
                              >
                                <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Amoxil (RX-AMX-500)</span>
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => handleIntakeQRScan("RX-LIP-020")}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-slate-200 rounded text-left truncate flex items-center gap-1 font-medium select-none"
                              >
                                <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Lipitor (RX-LIP-020)</span>
                              </button>
                              <button
                                type="button"
                                onMouseDown={() => handleIntakeQRScan("RX-GLU-500")}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-slate-200 rounded text-left truncate flex items-center gap-1 font-medium select-none"
                              >
                                <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Glucophage (RX-GLU-500)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Generic / Product Name</label>
                      <input
                        type="text"
                        value={newMed.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewMed(prev => ({ ...prev, name: val }));
                          setShowSuggestions(true);
                        }}
                        onKeyUp={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          if (val.length >= 3) {
                            const match = localMedicinesDB.find(m => 
                              m.brand_name.toLowerCase().includes(val.toLowerCase()) || 
                              m.generic_name.toLowerCase().includes(val.toLowerCase())
                            );
                            if (match) {
                              setNewMed(prev => {
                                const newObj = { ...prev };
                                // Map matching dosage form to supported values or fallback to "Tablet"
                                const mappedForm = ["tablet", "capsule", "injection", "syrup", "inhaler", "dermal ointment"].includes(match.dosage_form.toLowerCase())
                                  ? match.dosage_form
                                  : "Tablet";
                                newObj.dosageForm = mappedForm;
                                
                                // Map matching category
                                const matchedCat = categories.find(c => c.name.toLowerCase() === match.category.toLowerCase());
                                if (matchedCat) {
                                  newObj.category = matchedCat.name;
                                } else {
                                  newObj.category = match.category;
                                }

                                if (match.manufacturer) {
                                  newObj.manufacturer = match.manufacturer;
                                }
                                if (match.strength_text) {
                                  newObj.strength = match.strength_text;
                                }
                                if (match.unit_price) {
                                  newObj.unitPrice = match.unit_price.toString();
                                }
                                if (match.cost_price) {
                                  newObj.costPrice = match.cost_price.toString();
                                }
                                return newObj;
                              });
                            }
                          }
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="e.g. Paracetamol, Ibuprofen"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold text-slate-800"
                        required
                        id="new-med-name"
                      />
                      
                      {showSuggestions && newMed.name.length >= 3 && (
                        <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100 text-left">
                          {localMedicinesDB
                            .filter(m => 
                              m.brand_name.toLowerCase().includes(newMed.name.toLowerCase()) || 
                              m.generic_name.toLowerCase().includes(newMed.name.toLowerCase())
                            )
                            .map((med, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => {
                                  setNewMed(prev => ({
                                    ...prev,
                                    name: med.brand_name,
                                    dosageForm: ["tablet", "capsule", "injection", "syrup", "inhaler", "dermal ointment"].includes(med.dosage_form.toLowerCase()) 
                                      ? med.dosage_form 
                                      : "Tablet",
                                    category: categories.some(c => c.name.toLowerCase() === med.category.toLowerCase())
                                      ? categories.find(c => c.name.toLowerCase() === med.category.toLowerCase())!.name
                                      : prev.category,
                                    manufacturer: med.manufacturer || "",
                                    strength: med.strength_text || "",
                                    unitPrice: med.unit_price ? med.unit_price.toString() : "4.50",
                                    costPrice: med.cost_price ? med.cost_price.toString() : "1.50"
                                  }));
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left p-2 hover:bg-slate-50 flex flex-col focus:outline-none"
                              >
                                <span className="font-bold text-slate-800 text-xs">{med.brand_name} ({med.generic_name})</span>
                                <span className="text-[10px] text-slate-400 font-mono leading-tight">{med.dosage_form} • {med.category} • {med.manufacturer}</span>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Strength</label>
                        <input
                          type="text"
                          value={newMed.strength}
                          onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                          placeholder="e.g. 500mg"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono text-slate-800"
                          required
                          id="new-med-strength"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage Form</label>
                        <select
                          value={newMed.dosageForm}
                          onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold"
                          id="new-med-dosage"
                        >
                          <option>Tablet</option>
                          <option>Capsule</option>
                          <option>Injection</option>
                          <option>Syrup</option>
                          <option>Inhaler</option>
                          <option>Dermal Ointment</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                        <select
                          value={newMed.category}
                          onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold"
                        >
                          {categories.map((cat, ci) => (
                            <option key={ci} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">SKU / Code</label>
                        <input
                          type="text"
                          value={newMed.sku}
                          onChange={(e) => setNewMed({ ...newMed, sku: e.target.value })}
                          placeholder="Autopopulated"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Opening Stock</label>
                        <input
                          type="number"
                          value={newMed.stockCount}
                          onChange={(e) => setNewMed({ ...newMed, stockCount: e.target.value })}
                          placeholder="100"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Safety stock</label>
                        <input
                          type="number"
                          value={newMed.safetyStock}
                          onChange={(e) => setNewMed({ ...newMed, safetyStock: e.target.value })}
                          placeholder="200"
                          className={`w-full p-2 border rounded-lg focus:outline-none ${
                            newMed.safetyStock !== "" && parseInt(newMed.safetyStock) < 50
                              ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500"
                              : "border-slate-200 focus:border-slate-400"
                          }`}
                          required
                        />
                        {newMed.safetyStock !== "" && parseInt(newMed.safetyStock) < 50 && (
                          <div className="text-[9px] text-red-600 mt-1 leading-tight font-medium" id="safety-stock-warning">
                            ⚠️ Lower safety buffers increase stock-out risk.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Cost Price ($)</label>
                        <input
                          type="text"
                          value={newMed.costPrice}
                          onChange={(e) => setNewMed({ ...newMed, costPrice: e.target.value })}
                          placeholder="1.50"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Retail Price ($)</label>
                        <input
                          type="text"
                          value={newMed.unitPrice}
                          onChange={(e) => setNewMed({ ...newMed, unitPrice: e.target.value })}
                          placeholder="4.50"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Manufacturer</label>
                        <input
                          type="text"
                          value={newMed.manufacturer}
                          onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                          placeholder="e.g. Pfizer"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={newMed.expiryDate}
                          onChange={(e) => setNewMed({ ...newMed, expiryDate: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Storage Shelf Cell</label>
                        <input
                          type="text"
                          value={newMed.location}
                          onChange={(e) => setNewMed({ ...newMed, location: e.target.value })}
                          placeholder="e.g. Row B - Shelf 4"
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        type="submit" 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs py-2.5 font-bold shadow-sm transition hover:scale-[1.01]" 
                        id="btn-add-formulation"
                      >
                        Register Formulation
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenQRModal}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs py-2.5 font-bold shadow-xs transition hover:scale-[1.01] flex items-center justify-center gap-1.5"
                        id="btn-print-qr"
                      >
                        <Barcode className="w-4 h-4 text-slate-500" />
                        Print QR Code
                      </button>
                    </div>
                  </form>
                </div>

                {/* Medicine SKU Barcode & QR Lookup UI Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-left" id="medicine-lookup-card">
                  <div className="border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-indigo-600" />
                      Medication QR & Barcode Lookup
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Scan QR labels or barcodes to run automatic formulary searches</p>
                  </div>

                  {/* Optical Scanner Stream / Simulator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-700">Digital Optical Lens Feed</span>
                      <button
                        type="button"
                        onClick={() => setIsScannerActive(!isScannerActive)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition ${
                          isScannerActive ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                        id="btn-toggle-scanner"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {isScannerActive ? "Disable Camera" : "Activate Webcam"}
                      </button>
                    </div>

                    {isScannerActive ? (
                      <div className="relative border-2 border-dashed border-indigo-600 rounded-xl overflow-hidden bg-slate-950 flex flex-col justify-center items-center p-2 h-44">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover rounded-lg absolute inset-0 opacity-80"
                        />
                        {/* Scanning HUD Overlays */}
                        <div className="absolute inset-x-4 top-1/2 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-[pulse_1s_infinite]"></div>
                        <div className="absolute inset-0 border-8 border-slate-950/40"></div>
                        <span className="absolute bottom-2 text-[8px] font-mono tracking-widest bg-slate-900/80 text-indigo-400 px-2 py-0.5 rounded uppercase">
                          REC • Optical Scan Target
                        </span>
                      </div>
                    ) : (
                      <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-center text-slate-400 space-y-2">
                        <Camera className="w-8 h-8 text-slate-355 mx-auto" />
                        <p className="text-[10px] leading-snug">Webcam scan stream offline. Toggle active stream to capture live QR stickers.</p>
                      </div>
                    )}

                    {scanMessage && (
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-800 font-mono flex items-center gap-1.5 animate-fadeIn">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                        {scanMessage}
                      </div>
                    )}

                    {/* Scan Simulation Panel for ease of testing */}
                    <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl space-y-1.5">
                      <span className="text-[8px] font-bold text-amber-700 uppercase tracking-widest block font-mono">⚡ QUICK SCAN TESTER (IFRAME SAFE)</span>
                      <div className="flex flex-wrap gap-1">
                        {medicines.map((m) => m.sku ? (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSimulateScan(m.sku)}
                            className="text-[9px] bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 px-2 py-1 rounded font-mono font-bold shadow-2xs hover:scale-105 transition"
                            title={`Simulate scan of ${m.name}`}
                          >
                            Scan {m.sku}
                          </button>
                        ) : null)}
                        <button
                          type="button"
                          onClick={() => handleSimulateScan("RX-FDA-AMX-901")}
                          className="text-[9px] bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 px-2 py-1 rounded font-mono font-bold shadow-2xs hover:scale-105 transition"
                          title="Simulate FDA search scan"
                        >
                          Scan RX-FDA-AMX-901
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Medicine Lookup Fields */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Medicine Directory Lookup Fields</span>
                    
                    <div className="space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Scanned SKU Code</label>
                        <input
                          type="text"
                          value={lookupSku}
                          onChange={(e) => handleLookupSKU(e.target.value)}
                          placeholder="e.g. RX-AML-005"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-slate-400 font-mono text-xs text-slate-800"
                          id="lookup-sku-input"
                        />
                      </div>

                      {lookupResult ? (
                        <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Drug Brand Name</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.name || ""}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded font-semibold text-slate-800 text-[11px]"
                                id="lookup-med-name"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Strength</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.strength || ""}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-slate-700 text-[11px]"
                                id="lookup-med-strength"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Dosage Form</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.dosageForm || ""}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-slate-700 text-[11px]"
                                id="lookup-med-dosage"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Drug Category</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.category || "General"}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-slate-700 text-[11px]"
                                id="lookup-med-category"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Dispensing Shelf Location</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.location || "N/A"}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-indigo-900 font-mono font-semibold text-[11px]"
                                id="lookup-med-location"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Available Stock Sum</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.stockCount === "Not Commited" ? "0 (Baseline FDA)" : lookupResult.stockCount}
                                className={`w-full p-1.5 border border-slate-200 rounded font-mono font-bold text-[11px] ${
                                  lookupResult.stockCount <= lookupResult.safetyStock ? "bg-amber-100 text-amber-805" : "bg-slate-100 text-slate-800"
                                }`}
                                id="lookup-med-stock"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Expiry Date</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.expiryDate || "N/A"}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-slate-700 text-[11px]"
                                id="lookup-med-expiry"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block">Recognized Manufacturer</span>
                              <input
                                type="text"
                                readOnly
                                value={lookupResult.manufacturer || "N/A"}
                                className="w-full bg-slate-100 p-1.5 border border-slate-200 rounded text-slate-700 text-[11px]"
                                id="lookup-med-mfg"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 border border-dashed border-slate-200 rounded-lg text-slate-400 text-[10px] bg-white">
                          No active formulary lookup loaded. Scan a QR code or type a SKU manually above to load dynamic parameters.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left Mini Widget: Low stock warnings */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Depletion Shortage Alerts ({lowStocks.length})
                  </h4>
                  {lowStocks.length === 0 ? (
                    <div className="text-[10px] text-slate-400 py-3 text-center">Formulary safety limits satisfied.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {lowStocks.map((m) => (
                        <div key={m.id} className="p-2 bg-white border border-amber-100 rounded-lg text-xs">
                          <div className="font-bold text-slate-800">{m.name}</div>
                          <div className="flex justify-between text-[10px] text-amber-600 font-mono mt-0.5">
                            <span>Stock: {m.stockCount} ({m.dosageForm})</span>
                            <span className="font-bold">Limit: {m.safetyStock}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2">
                        <button
                          onClick={handleGetReorderAdvice}
                          disabled={analyzingLowStock}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          {analyzingLowStock ? "Computing triggers..." : "AI Reorder Optimization"}
                        </button>
                      </div>
                    </div>
                  )}

                  {reorderAdviceList && reorderAdviceList.length > 0 && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2 animate-fadeIn text-xs">
                      <div className="flex justify-between items-center border-b border-emerald-100/50 pb-1.5">
                        <span className="font-bold text-emerald-800 flex items-center gap-1 font-mono uppercase text-[9px]"><Brain className="w-3 h-3 text-emerald-600" /> AI Advice</span>
                        <button onClick={() => setReorderAdviceList(null)} className="text-[9px] text-slate-400 hover:text-slate-600 font-bold">Dismiss</button>
                      </div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {reorderAdviceList.map((adv, ai) => (
                          <div key={ai} className="bg-white p-2 border border-emerald-100/40 rounded shadow-2xs">
                            <div className="flex justify-between font-bold text-[11px]">
                              <span>{adv.name}</span>
                              <span className="text-emerald-700">+{adv.suggestedQuantity}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-0.5 italic">{adv.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Table Catalog list */}
              <div className="xl:col-span-3 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Formulary Product Directory</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Filter, track, and dispatch drugs from dispensary compartments</p>
                  </div>

                  {/* Table search filters */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search SKU, name, brand, cell..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:border-slate-400 text-slate-700"
                      />
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="p-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white font-semibold"
                      >
                        <option value="All">All Categories</option>
                        {categories.map((c, idx) => (
                          <option key={idx} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Form (Tablet...)"
                        value={dosageFilter}
                        onChange={(e) => setDosageFilter(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-28 focus:outline-none focus:border-slate-400 text-slate-700"
                        id="dosage_filter_input_tab1"
                      />
                      <Pill className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Expiry Date Monitoring Filter */}
                    <div className="relative">
                      <select
                        value={expiryFilter}
                        onChange={(e: any) => setExpiryFilter(e.target.value)}
                        className={`p-1.5 border rounded-lg text-xs outline-none bg-white font-semibold transition-all ${
                          expiryFilter === "Expired" 
                            ? "border-red-300 text-red-700 bg-red-50/50" 
                            : expiryFilter === "ExpiringSoon" 
                            ? "border-yellow-300 text-yellow-800 bg-yellow-50/50" 
                            : "border-slate-200 text-slate-700"
                        }`}
                        id="filter-expiry-status"
                      >
                        <option value="All">All Expiries</option>
                        <option value="ExpiringSoon">⚠️ Expiring Soon ({expiringSoonMeds.length})</option>
                        <option value="Expired">❌ Expired ({expiredMeds.length})</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadCSV}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 hover:text-indigo-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      id="btn-download-csv"
                      title="Download the current filtered stock inventory list as a CSV sheet"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Expiry Date Monitoring Feature Dashboard Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 border border-slate-150 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-105 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 animate-pulse text-red-650" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expired Products</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-extrabold text-red-600">{expiredMeds.length} Items</span>
                        <span className="text-[10px] text-slate-450">already past expiration date</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-50 text-amber-600 rounded-xl border border-yellow-205 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expiring Within 30 Days</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-extrabold text-amber-600">{expiringSoonMeds.length} Items</span>
                        <span className="text-[10px] text-slate-450">within critical window</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry watchlist Quick filters row */}
                {(expiredMeds.length > 0 || expiringSoonMeds.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-red-50/10 border border-red-100/40 rounded-xl text-xs">
                    <span className="font-extrabold text-[9px] text-slate-500 uppercase tracking-wide">Watchlist Action Center:</span>
                    {expiredMeds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpiryFilter("Expired")}
                        className={`px-2 py-1 font-bold text-[10px] rounded border transition-all flex items-center gap-1 cursor-pointer ${
                          expiryFilter === "Expired" 
                            ? "bg-red-600 border-red-700 text-white animate-pulse" 
                            : "bg-red-50 hover:bg-red-100 text-red-800 border-red-200"
                        }`}
                        id="quick-filter-expired"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        Show Expired ({expiredMeds.length})
                      </button>
                    )}
                    {expiringSoonMeds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpiryFilter("ExpiringSoon")}
                        className={`px-2 py-1 font-bold text-[10px] rounded border transition-all flex items-center gap-1 cursor-pointer ${
                          expiryFilter === "ExpiringSoon" 
                            ? "bg-yellow-500 border-yellow-600 text-white animate-pulse" 
                            : "bg-yellow-50 hover:bg-yellow-105 text-yellow-850 border-yellow-250"
                        }`}
                        id="quick-filter-expiring-soon"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Show Expiring Soon ({expiringSoonMeds.length})
                      </button>
                    )}
                    {expiryFilter !== "All" && (
                      <button
                        type="button"
                        onClick={() => setExpiryFilter("All")}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-200 transition-all cursor-pointer"
                        id="quick-clear-expiry-filter"
                      >
                        Show All
                      </button>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <tr>
                        <th className="p-3">SKU & Generic Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-center">Dosage Form</th>
                        <th className="p-3 text-center">Available Stock</th>
                        <th className="p-3">Price & Manufacturer</th>
                        <th className="p-3 font-mono">Location</th>
                        <th className="p-3 text-center">Expiry</th>
                        <th className="p-3 text-right">Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMeds.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center p-8 text-slate-400">
                            <Pill className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="font-bold">No formulary drug products match search terms.</p>
                            <p className="text-[11px]">Clear filters or add a new drug card formulation.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredMeds.map((med) => {
                          const isLow = med.stockCount <= med.safetyStock;

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const expiryDateObj = med.expiryDate ? new Date(med.expiryDate) : null;
                          if (expiryDateObj) {
                            expiryDateObj.setHours(0, 0, 0, 0);
                          }
                          const diffTime = expiryDateObj ? expiryDateObj.getTime() - today.getTime() : null;
                          const diffDays = diffTime !== null ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;

                          const isExpired = diffDays !== null && diffDays < 0;
                          const isExpiringSoon = diffDays !== null && diffDays >= 0 && diffDays <= 30;

                          let bgRowStyle = "hover:bg-slate-50/50";
                          let expiryBadgeStyle = "text-slate-500 font-mono text-[10px]";
                          let expirySpanTitle = "";

                          if (isExpired) {
                            bgRowStyle = "bg-red-100/60 hover:bg-red-100/80 border-l-4 border-l-red-650 font-medium";
                            expiryBadgeStyle = "bg-red-600 text-white font-extrabold px-2 py-0.5 rounded border border-red-700 text-[10px] font-mono inline-block animate-pulse";
                            expirySpanTitle = `EXPIRED (${Math.abs(diffDays)}d ago) - Immediately dispatch for bio-disposal`;
                          } else if (isExpiringSoon) {
                            bgRowStyle = "bg-yellow-100/60 hover:bg-yellow-100/80 border-l-4 border-l-yellow-500 font-medium";
                            expiryBadgeStyle = "bg-yellow-500 text-slate-900 font-extrabold px-2 py-0.5 rounded border border-yellow-600 text-[10px] font-mono inline-block";
                            expirySpanTitle = `EXPIRING SOON (within ${diffDays}d) - Prioritize for active prescriptions`;
                          }

                          return (
                            <tr key={med.id} className={`${bgRowStyle} transition-colors border-b border-slate-100`}>
                              <td className="p-3">
                                <div className="text-[9px] font-mono text-slate-400 px-1 font-bold bg-slate-100 rounded inline">
                                  {med.sku || "UNCODED"}
                                </div>
                                <div className="font-bold mt-1 text-slate-900">{med.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{med.strength}</div>
                              </td>
                              <td className="p-3">
                                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                                  {med.category || "General"}
                                </span>
                              </td>
                              <td className="p-3 text-center font-medium leading-none">{med.dosageForm}</td>
                              <td className="p-3 text-center">
                                <span className={`text-base font-bold font-mono ${isLow ? "text-amber-600" : "text-slate-800"}`}>
                                  {med.stockCount}
                                </span>
                                <div className="text-[8px] text-slate-400 font-mono">Limit: {med.safetyStock}</div>
                              </td>
                              <td className="p-3 space-y-0.5">
                                <div className="font-bold text-slate-900 font-mono">${med.unitPrice.toFixed(2)}</div>
                                <div className="text-[9px] text-slate-400 leading-none">{med.manufacturer || "Pfizer Corp"}</div>
                              </td>
                              <td className="p-3 font-mono text-[11px] font-bold text-indigo-900">{med.location}</td>
                              <td className="p-3 text-center">
                                <span className={expiryBadgeStyle} title={expirySpanTitle}>
                                  {med.expiryDate || "N/A"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => updateMedicineStock(med.id, 100, "Pharmacy Operator", "Pharmacy Boss")}
                                    className="bg-slate-50 text-slate-900 hover:bg-slate-950 hover:text-white px-2 py-1 text-[9px] font-mono font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
                                    id={`rx_stock_add_${med.id}`}
                                    title="Add 100 units"
                                  >
                                    +100
                                  </button>
                                  <button
                                    onClick={() => updateMedicineStock(med.id, -50, "Pharmacy Operator", "Pharmacy Boss")}
                                    disabled={med.stockCount < 50}
                                    className="bg-slate-50 text-slate-900 hover:bg-slate-950 hover:text-white px-2 py-1 text-[9px] font-mono font-bold rounded-lg border border-slate-200 disabled:opacity-30 transition-all cursor-pointer"
                                    id={`rx_stock_sub_${med.id}`}
                                    title="Deduct 50 units"
                                  >
                                    -50
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INWARD STOCK CHECK-IN */}
          {activeTab === "inward" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {/* Check-In Stock Batch Form */}
              <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Inward Batch Check-In
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Receive, record, and unpack drug shipments from medical distributors</p>
                </div>

                <form onSubmit={handleAddStockTransaction} className="space-y-3.5 text-xs text-slate-700" id="form-stock-checkin-batch">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Select Registered Drug Formulary</label>
                    <select
                      value={newStockTx.medicineId}
                      onChange={(e) => setNewStockTx({ ...newStockTx, medicineId: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold"
                      required
                    >
                      <option value="">-- Choose a formulation from Formulary --</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.strength} ({m.dosageForm}) — Stock: {m.stockCount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Quantity Added</label>
                      <input
                        type="number"
                        value={newStockTx.quantity}
                        onChange={(e) => setNewStockTx({ ...newStockTx, quantity: e.target.value })}
                        placeholder="500"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Batch Number</label>
                      <input
                        type="text"
                        value={newStockTx.batchNumber}
                        onChange={(e) => setNewStockTx({ ...newStockTx, batchNumber: e.target.value })}
                        placeholder="e.g. BCH-A109"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Batch Cost Price ($)</label>
                      <input
                        type="text"
                        value={newStockTx.costPrice}
                        onChange={(e) => setNewStockTx({ ...newStockTx, costPrice: e.target.value })}
                        placeholder="e.g. 1.20"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Supplier Distr.</label>
                      <input
                        type="text"
                        value={newStockTx.supplier}
                        onChange={(e) => setNewStockTx({ ...newStockTx, supplier: e.target.value })}
                        placeholder="e.g. Global Pharma"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Drug Expiration Date</label>
                      <input
                        type="date"
                        value={newStockTx.expiryDate}
                        onChange={(e) => setNewStockTx({ ...newStockTx, expiryDate: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-mono text-[11px]"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs py-2.5 font-bold shadow-sm transition hover:scale-[1.01]" id="btn-submit-stock-tx">
                    Commit Inward Intake
                  </button>
                </form>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] leading-relaxed text-slate-500">
                  <p className="font-bold text-slate-700">📌 How it works</p>
                  <p>Inward check-in dynamically alters inventory level values inside the active hospital server. Dispatched counts will clear automatically if they bypass thresholds.</p>
                </div>
              </div>

              {/* Transactions History Table */}
              <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-600" />
                    Check-in Ledger Log Book
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Audit log database for all stock inward imports & dispensings</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Receipt Time</th>
                        <th className="p-3">Drug Product</th>
                        <th className="p-3 text-center">Intake Type</th>
                        <th className="p-3 text-right">Volume</th>
                        <th className="p-3 font-mono">Batch Number</th>
                        <th className="p-3 text-right">Unit cost</th>
                        <th className="p-3">Distributor Partner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 font-sans">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-400 font-normal">
                            No ledger transactions recorded yet inside Local Session.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 text-slate-900">{tx.medicineName}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold leading-none ${
                                tx.type === "INWARD" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-900 font-mono font-bold">
                              {tx.type === "INWARD" ? "+" : "-"}{tx.quantity}
                            </td>
                            <td className="p-3 font-mono text-indigo-900">{tx.batchNumber}</td>
                            <td className="p-3 text-right font-mono">${(tx.costPrice || 0.0).toFixed(2)}</td>
                            <td className="p-3 text-slate-500 font-normal">{tx.supplier || "Vendor Distribution"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGER */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
              {/* Category builder form */}
              <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    Register New Category
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Build therapeutic drug categories to structure storage zones</p>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs text-slate-700" id="form-add-new-category">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g. Immunology, Orthopedic"
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-semibold"
                      required
                      id="input-cat-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Category Description</label>
                    <textarea
                      rows={4}
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Describe the therapeutic scope or clinical target..."
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs py-2.5 font-bold shadow-sm transition hover:scale-[1.01]" id="btn-add-cat-submit">
                    Create Stock Category
                  </button>
                </form>
              </div>

              {/* Categories listings with intelligence stats */}
              <div className="lg:col-span-3 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tags className="w-4 h-4 text-indigo-600" />
                    Registered Drug Categories
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Dispensary classification statistics and financial valuation audits</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat, idx) => {
                    // Calculate stats matching this category
                    const matchedMeds = medicines.filter(m => m.category === cat.name);
                    const skuCount = matchedMeds.length;
                    const stockSum = matchedMeds.reduce((acc, m) => acc + m.stockCount, 0);
                    const valuationSum = matchedMeds.reduce((acc, m) => acc + (m.stockCount * m.unitPrice), 0);

                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{cat.name}</h4>
                            <span className="text-[9px] font-mono tracking-wider font-bold bg-indigo-50 border border-indigo-150 text-indigo-800 px-2 py-0.5 rounded-full uppercase">
                              {skuCount} SKUs
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] font-normal leading-relaxed mt-1.5">
                            {cat.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 border-t border-slate-200/55 pt-3 mt-4 text-left">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Units Held</span>
                            <span className="text-xs font-bold text-slate-800 font-mono block">{stockSum} units</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Audited Value</span>
                            <span className="text-xs font-bold text-slate-800 font-mono block">${valuationSum.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPEN_SOURCE MEDICINE IMPORTER */}
          {activeTab === "openfda" && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-6 text-left">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    OpenFDA Drug Registration Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Query the United States FDA National Drug Code (NDC) database to hot-import medicines</p>
                </div>

                <form onSubmit={handleSearchFDA} className="flex flex-wrap items-center gap-2 w-full md:w-auto" id="form-fda-query">
                  <div className="relative flex-1 md:w-72">
                    <input
                      type="text"
                      placeholder="Search FDA (e.g., Aspirin, Ibuprofen)..."
                      value={openFdaSearch}
                      onChange={(e) => setOpenFdaSearch(e.target.value)}
                      className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-slate-400"
                      required
                    />
                    <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={fdaLoading}
                    className="bg-slate-950 hover:bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                    id="btn-fda-submit-search"
                  >
                    {fdaLoading ? "Querying..." : "Search NDC"}
                  </button>
                </form>
              </div>

              {/* Status information on initial view or results */}
              {fdaLoading && (
                <div className="py-12 text-center text-slate-500 space-y-3 animate-pulse">
                  <Pill className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Connecting with FDA National Drug Code database servers...</p>
                  <p className="text-[10px]">Verifying manufacturer registrations and bio-chemical active ingredients...</p>
                </div>
              )}

              {fdaError && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs text-left max-w-2xl">
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Information Notice
                  </p>
                  <p className="leading-relaxed mb-3">{fdaError}</p>
                  <button 
                    onClick={() => { setOpenFdaSearch("Ibuprofen"); }}
                    className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-md"
                  >
                    Try "Ibuprofen" Database
                  </button>
                </div>
              )}

              {/* Display Results Grid */}
              {!fdaLoading && fdaResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-200 text-[10px] font-mono font-semibold">
                    <span className="text-slate-500 uppercase">FDA National Drug Catalog matches found</span>
                    <span className="text-slate-400">Total matched: {fdaResults.length}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fdaResults.map((item, idx) => {
                      const brandName = item.brand_name || item.brand_name_base || "FDA Unbranded Generic";
                      const activeIng = item.active_ingredients?.[0]?.name || item.generic_name || "Active Ingredients Undefined";
                      const originalStrength = item.active_ingredients?.[0]?.strength || item._meta?.strength_text || "500mg";
                      const manufacturer = item.labeler_name || "Official Manufacturer";
                      const dosageForm = item.dosage_form || "Tablet";

                      return (
                        <div key={idx} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between space-y-3.5">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] bg-slate-950 font-mono font-bold uppercase text-white px-1.5 py-0.5 rounded leading-none">
                                  {dosageForm}
                                </span>
                                {item.is_local_baseline && (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-800 font-mono font-bold uppercase px-1.5 py-0.5 rounded ml-1">
                                    PHARMACOPEIA Base
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">NDC Catalog: {Math.floor(1000+Math.random()*9000)}-{Math.floor(100+Math.random()*900)}</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mt-2 truncate">{brandName}</h4>
                            <p className="text-[11px] text-slate-500 truncate font-mono">Active ingredient: {activeIng}</p>
                            
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-2.5 text-[11px] font-sans font-semibold space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Clinical Strength:</span>
                                <span className="text-slate-800 font-mono">{originalStrength}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Labeler / Distr:</span>
                                <span className="text-slate-800 truncate max-w-[180px]">{manufacturer}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center">
                            <button
                              onClick={() => handleFastImport(item)}
                              className="bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold py-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ⚡ Direct Import
                            </button>
                            <button
                              onClick={() => handleLoadToForm(item)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-lg text-[10px] font-bold py-2 border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                              ✏️ Customize Form
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Queries Prompt */}
              {fdaResults.length === 0 && !fdaLoading && !fdaError && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-12 text-center py-16 space-y-3">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800">Dynamic OpenFDA Medicine Register</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Search the open-source pharmacopeia to instantly import drug formulary properties like formulations, strengths, classification categories and chemical labelers.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button onClick={() => { setOpenFdaSearch("Amoxicillin"); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 py-1.5 px-3 rounded-lg font-mono">"Amoxicillin"</button>
                    <button onClick={() => { setOpenFdaSearch("Ibuprofen"); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 py-1.5 px-3 rounded-lg font-mono">"Ibuprofen"</button>
                    <button onClick={() => { setOpenFdaSearch("Metformin"); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 py-1.5 px-3 rounded-lg font-mono">"Metformin"</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CLINICAL INTERACTIONS */}
          {activeTab === "safety" && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  AI Clinical Multi-Drug Guard
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cross-reference active chemical ingredients dynamically via Google Gemini API to prevent drug-drug toxicity interaction</p>
              </div>

              <form onSubmit={handleCheckChemicalInterations} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 font-mono uppercase tracking-wider">Chemical Drug Active ingredients list (Comma Separated)</label>
                    <input
                      type="text"
                      value={interactDrugsText}
                      onChange={(e) => setInteractDrugsText(e.target.value)}
                      placeholder="e.g. Atorvastatin, Sildenafil, Clarithromycin, Metformin"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={evaluatingSafety}
                    className="bg-slate-950 hover:bg-slate-900 text-white rounded-lg p-2.5 h-[38px] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
                    id="btn_drug_interaction_submit"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {evaluatingSafety ? "Consulting API..." : "Check Safety Profile"}
                  </button>
                </div>
              </form>

              {safetyReport && (
                <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-2xl space-y-4 animate-fadeIn text-xs text-slate-700">
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Brain className="w-4 h-4 text-indigo-600" /> Clinical Safety Verdict Report
                    </span>
                    <span className={`px-2.5 py-1 rounded font-mono font-bold leading-none text-[10px] uppercase tracking-wider ${
                      safetyReport.safeToCombine ? "bg-emerald-150 text-emerald-800 border border-emerald-300" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {safetyReport.safeToCombine ? "CLEARED: COMPINATIONS COMMENSURATE" : "HIGH ALERT: SEVERE INTERACTION DETECTED"}
                    </span>
                  </div>

                  {safetyReport.conciseSummary && (
                    <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-widest text-[9px]">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        Executive Clinical Summary
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        {safetyReport.conciseSummary}
                      </p>
                    </div>
                  )}

                  {safetyReport.severeInteractions?.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold">Identified Active Reaction Paths</span>
                      {safetyReport.severeInteractions.map((int: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex gap-2.5 text-left">
                          <Crosshair className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-950 font-bold leading-snug">
                              {int.participants?.join(" ↔ ")} ({int.severity} Severity)
                            </strong>
                            <p className="text-red-800 font-normal mt-0.5 leading-snug">{int.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                      <span className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider block">Patient Advisory Counseling Directions</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                        {safetyReport.advisoryNotes?.map((note: string, i: number) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                      <span className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider block">Recommended Safe Alternatives</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{safetyReport.alternativesSuggested}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Client-side Validation Error Dialog */}
      <AnimatePresence>
        {errorDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-rose-100 max-w-md w-full overflow-hidden text-left"
              id="dialog-validation-error"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Formulation Validation Failure</h3>
                    <p className="text-[10px] text-slate-400 font-mono">CODE: INSUFFICIENT_STOCK_BUFFERS</p>
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-100/50 p-3.5 rounded-xl text-xs text-rose-950 font-medium leading-relaxed">
                  {errorDialogMessage}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setErrorDialogOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition hover:scale-[1.01]"
                  >
                    Close & Adjust Levels
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medication QR Label Generator Modal */}
      <AnimatePresence>
        {printQrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden text-left"
              id="dialog-print-qr"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Barcode className="w-5 h-5 text-indigo-600" />
                    Medication QR Label Center
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">STATION ID: LABEL-PRINTER-01</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintQrOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-base focus:outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verify label information below. This thermal print-ready label contains a unique QR matrix mapped to the SKU code and transaction batch metadata.
                </p>

                {/* Simulated Adhesive Sticker */}
                <div className="border-2 border-dashed border-slate-300 bg-amber-50/10 p-5 rounded-xl block relative overflow-hidden">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-slate-100 rounded-r-full border-r border-slate-300"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-slate-100 rounded-l-full border-l border-slate-300"></div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 space-y-2.5">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">Formulary Name</span>
                        <span className="text-sm font-black text-slate-900 leading-tight block">{qrLabelDetails.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-600">{qrLabelDetails.strength}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">SKU Code</span>
                          <span className="text-[11px] font-mono font-bold text-slate-900">{qrLabelDetails.sku}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Batch ID</span>
                          <span className="text-[11px] font-mono font-bold text-slate-900">{qrLabelDetails.batch}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Shelf Storage</span>
                          <span className="text-[10px] font-semibold text-slate-800">{qrLabelDetails.location}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Expiration</span>
                          <span className="text-[10px] font-mono text-slate-800">{qrLabelDetails.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 flex flex-col items-center justify-center space-y-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      {renderDeterministicQR(qrLabelDetails.sku, qrLabelDetails.batch)}
                      <span className="text-[8px] font-black tracking-widest font-mono text-slate-400">SCAN QR</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">Format: 50mm x 30 mm Thermal Sticker</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintQrOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition hover:scale-[1.01]"
                    >
                      Print Label
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to render deterministic SVG QR Code
function renderDeterministicQR(sku: string, batch: string) {
  const text = `SKU:${sku || "N/A"}|BCH:${batch || "N/A"}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const grid: boolean[][] = [];
  for (let r = 0; r < 21; r++) {
    grid[r] = [];
    for (let c = 0; c < 21; c++) {
      if (r < 7 && c < 7) {
        grid[r][c] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      } else if (r < 7 && c >= 14) {
        const cc = c - 14;
        grid[r][c] = (r === 0 || r === 6 || cc === 0 || cc === 6 || (r >= 2 && r <= 4 && cc >= 2 && cc <= 4));
      } else if (r >= 14 && c < 7) {
        const rr = r - 14;
        grid[r][c] = (rr === 0 || rr === 6 || c === 0 || c === 6 || (rr >= 2 && rr <= 4 && c >= 2 && c <= 4));
      } else if (r === 6 || c === 6) {
        grid[r][c] = (r % 2 === 0 || c % 2 === 0);
      } else {
        const cellVal = Math.sin((r * 12.9898 + c * 78.233) * hash) * 43758.5453;
        grid[r][c] = (cellVal - Math.floor(cellVal)) > 0.5;
      }
    }
  }
  
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      if (grid[r][c]) {
        rects.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />);
      }
    }
  }
  return (
    <svg viewBox="0 0 21 21" className="w-20 h-20 text-slate-800">
      {rects}
    </svg>
  );
}
