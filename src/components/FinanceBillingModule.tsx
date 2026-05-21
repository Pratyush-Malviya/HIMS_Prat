import React, { useState } from "react";
import { DollarSign, FileCheck, Landmark, CheckCircle, Clock, ShieldCheck, Printer, FileText, Download } from "lucide-react";
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
              <div className="border-b border-dashed border-slate-200 pb-3 block text-left">
                <span className="text-[10px] text-slate-400 font-mono block">PRINT REFERENCE: {selectedInvoice.id}</span>
                <div className="flex justify-between items-center mt-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                    <FileText className="w-4 h-4 text-slate-400" /> itemized Patient Bill
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        if (!printWindow) return;
                        const printingHtml = `
                          <html>
                            <head>
                              <title>Invoice - ${selectedInvoice.invoiceNumber}</title>
                              <style>
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                                .hospital { text-transform: uppercase; font-size: 11px; tracking: 1.5px; font-weight: bold; color: #0284c7; margin-bottom: 4px; }
                                h1 { font-size: 20px; text-transform: uppercase; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 0; margin-bottom: 24px; }
                                h2 { font-size: 13px; font-family: monospace; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; margin-top: 24px; padding-bottom: 4px; color: #334155; }
                                .meta { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 12px; }
                                p { font-size: 13px; margin: 8px 0; }
                                .item-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
                                .totals { margin-top: 16px; font-size: 12px; line-height: 1.8; text-align: right; }
                                .footer { margin-top: 48px; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between; }
                              </style>
                            </head>
                            <body>
                              <div class="hospital">HIMS Billing & Finance operations</div>
                              <h1>Patient Invoice statement</h1>
                              <div class="meta">
                                <div><strong>PATIENT NAME:</strong> ${selectedInvoice.patientName}</div>
                                <div><strong>INVOICE REFERENCE:</strong> ${selectedInvoice.invoiceNumber}</div>
                                <div><strong>STATUS:</strong> ${selectedInvoice.status.toUpperCase()}</div>
                                <div><strong>DATE GENERATED:</strong> ${new Date(selectedInvoice.date).toLocaleDateString()}</div>
                              </div>
                              <h2>Itemized Ledger Statement</h2>
                              ${selectedInvoice.items.map(it => `
                                <div class="item-row">
                                  <span>${it.description} (${it.category})</span>
                                  <strong>${it.amount}</strong>
                                </div>
                              `).join("")}
                              <div class="totals">
                                <div>Gross total Amount: ${selectedInvoice.totalAmount}</div>
                                <div>TPA preauth Covered: ${selectedInvoice.insuranceClaimed}</div>
                                <div style="font-size: 14px; font-weight: bold; margin-top: 6px; color: #059669;">Net Patient Payable: ${selectedInvoice.totalAmount - selectedInvoice.insuranceClaimed}</div>
                              </div>
                              <div class="footer">
                                <div>SYSTEM SECURE SIGNATURE • FDIC CODED CERTIFIED</div>
                                <div>Billing Desk Officer: __________________________</div>
                              </div>
                              <script>
                                window.onload = function() { window.print(); }
                              </script>
                            </body>
                          </html>
                        `;
                        printWindow.document.write(printingHtml);
                        printWindow.document.close();
                      }}
                      className="p-1 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs leading-none flex items-center gap-1 font-semibold transition-all cursor-pointer border border-emerald-200/40"
                      title="Download PDF Ledger Report"
                      id="btn_download_billing_pdf"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button onClick={() => window.print()} className="p-1 text-slate-400 hover:text-slate-800 transition-colors">
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
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
