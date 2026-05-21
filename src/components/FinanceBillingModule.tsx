import React, { useState } from "react";
import { DollarSign, FileCheck, Landmark, CheckCircle, Clock, ShieldCheck, Printer, FileText } from "lucide-react";
import { HIMSStore } from "../useHIMSStore";

interface FinanceBillingModuleProps {
  store: HIMSStore;
}

export function FinanceBillingModule({ store }: FinanceBillingModuleProps) {
  const { billing, payInvoiceDirect, approveInsuranceTPA } = store;

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(billing[0]?.id || null);
  const selectedInvoice = billing.find((b) => b.id === selectedInvoiceId);

  // Stats
  const revenueSettled = billing.filter((b) => b.status === "Paid").reduce((s, b) => s + b.totalAmount, 0);
  const pendingCollections = billing.filter((b) => b.status === "Unpaid").reduce((s, b) => s + b.totalAmount, 0);
  const tpaClaimsOut = billing.filter((b) => b.status === "Pending_TPA").reduce((s, b) => s + b.totalAmount, 0);

  // Categories sum
  const opdIncome = billing.reduce((sum, b) => sum + b.items.filter(i => i.category === "OPD Consultation").reduce((si, i) => si + i.amount, 0), 0);
  const roomRentIncome = billing.reduce((sum, b) => sum + b.items.filter(i => i.category === "Room Rent").reduce((si, i) => si + i.amount, 0), 0);
  const labIncome = billing.reduce((sum, b) => sum + b.items.filter(i => i.category === "Laboratory").reduce((si, i) => si + i.amount, 0), 0);

  return (
    <div className="space-y-6">
      {/* Financial stats card bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="finance_stats_cards">
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block pb-0.5">Direct Settled Collections</span>
            <span className="text-xl font-mono font-bold text-slate-800">${revenueSettled.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block pb-0.5">Insurance TPA Claims Invoiced</span>
            <span className="text-xl font-mono font-bold text-slate-800">${tpaClaimsOut.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block pb-0.5">Total Billing Accuracy Index</span>
            <span className="text-xl font-mono font-bold text-slate-800">99.8% Certified</span>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="finance_split">
        {/* Invoice list database */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Hospital Billing Records Registry</h2>
            <p className="text-xs text-slate-400">Chronological list of outpatient audits and active ward discharges invoice ledgers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase">
                <tr>
                  <th className="p-3">Invoice Number / date</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">total Charges</th>
                  <th className="p-3">TPA allocation</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {billing.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedInvoiceId === inv.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-semibold font-mono">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">21 May 2026</div>
                    </td>
                    <td className="p-3">{inv.patientName}</td>
                    <td className="p-3 font-semibold font-mono">${inv.totalAmount}</td>
                    <td className="p-3 text-slate-500 font-mono">${inv.insuranceClaimed || 0}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${
                        inv.status === "Paid" ? "text-emerald-600" :
                        inv.status === "Pending_TPA" ? "text-amber-600" : "text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          inv.status === "Paid" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                        }`}></span>
                        {inv.status === "Pending_TPA" ? "Pending TPA Pre-auth" : inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Invoice Audit and Insurance Portal */}
        <div className="space-y-6">
          {selectedInvoice ? (
            <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-sm relative">
              {/* Receipt Visual Header */}
              <div className="border-b border-dashed border-slate-200 pb-3 block">
                <span className="text-[10px] text-slate-400 font-mono block">PRINT REFERENCE: {selectedInvoice.id}</span>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                    <FileText className="w-4 h-4 text-slate-400" /> itemized Patient Bill
                  </h3>
                  <button onClick={() => window.print()} className="p-1 text-slate-400 hover:text-slate-800 transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Patient data */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-mono text-slate-600">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice Num:</span>
                  <span className="font-mono text-slate-600 font-semibold">{selectedInvoice.invoiceNumber}</span>
                </div>
              </div>

              {/* Itemized list */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Breakdown Details</span>
                <div className="space-y-1 text-xs">
                  {selectedInvoice.items.map((it, i) => (
                    <div key={i} className="flex justify-between py-1 bg-slate-50/40 px-2 rounded">
                      <span className="text-slate-600 font-light truncate max-w-[180px]">{it.description}</span>
                      <span className="font-semibold font-mono text-slate-800">${it.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itemized Total */}
              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Total:</span>
                  <span className="font-mono">${selectedInvoice.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Insurance Share (TPA):</span>
                  <span className="font-mono">${selectedInvoice.insuranceClaimed}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold border-t border-slate-100 pt-1">
                  <span>Net Payable:</span>
                  <span className="font-mono text-emerald-600">${selectedInvoice.totalAmount - selectedInvoice.insuranceClaimed}</span>
                </div>
              </div>

              {/* Operations settlement */}
              <div className="pt-4 border-t border-slate-100">
                {selectedInvoice.status !== "Paid" ? (
                  <div className="space-y-2">
                    {selectedInvoice.status === "Pending_TPA" && (
                      <button
                        onClick={() => approveInsuranceTPA(selectedInvoice.id, "Insurance Evaluator", "Admin")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs py-2 font-semibold flex items-center justify-center gap-1.5"
                        id="btn_approve_tpa_invoice"
                      >
                        <ShieldCheck className="w-4 h-4" /> Authorize TPA Pre-auth Clearance
                      </button>
                    )}

                    <button
                      onClick={() => payInvoiceDirect(selectedInvoice.id, "Billing Desk", "Admin")}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded text-xs py-2 font-semibold"
                      id="btn_pay_invoice_direct"
                    >
                      Settle Balance Directly (Cash/Card)
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-semibold text-center text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> All accounts fully settled & paid.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-12 text-center bg-white border border-slate-100 rounded-xl">
              Select an invoice ledger block from left registry to review itemized charges or clear insurance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
