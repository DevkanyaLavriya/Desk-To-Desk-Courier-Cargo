import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Upload, Download, Eye, ArrowLeft, Printer,
  FileText, Check, X, Users, UserPlus, ChevronDown,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { useCustomers } from './hooks/useCustomers'
import { useInvoices } from './hooks/useInvoices'
import { useBranch } from './hooks/useBranch'
import type {
  CustomerBillingInfo, CustomerExtraField, ExtraColumn, InvoiceItem, Invoice, CreateInvoicePayload,
} from './types/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

function emptyItem(srNo: number, extraColumns: ExtraColumn[]): InvoiceItem {
  const extraFields: Record<string, string> = {}
  extraColumns.forEach(c => { extraFields[c.key] = '' })
  return { srNo, date: '', awbNo: '', destination: '', weight: 0, amount: 0, extraFields }
}

function numberToWords(n: number): string {
  if (n === 0) return 'Zero'
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  function convert(num: number): string {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '')
    if (num < 1000) return ones[Math.floor(num/100)]+' Hundred'+(num%100 ? ' '+convert(num%100) : '')
    if (num < 100000) return convert(Math.floor(num/1000))+' Thousand'+(num%1000 ? ' '+convert(num%1000) : '')
    if (num < 10000000) return convert(Math.floor(num/100000))+' Lakh'+(num%100000 ? ' '+convert(num%100000) : '')
    return convert(Math.floor(num/10000000))+' Crore'+(num%10000000 ? ' '+convert(num%10000000) : '')
  }
  const [intPart, decPart] = n.toFixed(2).split('.')
  const words = convert(parseInt(intPart)) + ' Rupees'
  return decPart && parseInt(decPart) > 0
    ? words + ' and ' + convert(parseInt(decPart)) + ' Paise Only'
    : words + ' Only'
}

// ─── Add Customer Modal ───────────────────────────────────────────────────────

function AddCustomerModal({ onSave, onClose, existing }: {
  onSave: (c: CustomerBillingInfo) => Promise<void>
  onClose: () => void
  existing?: CustomerBillingInfo
}) {
  const [form, setForm] = useState<CustomerBillingInfo>(
    existing ?? { id: '', name: '', address: '', gstNo: '', phone: '', email: '', extraFields: [] }
  )
  const [saving, setSaving] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')

  const update = (k: keyof CustomerBillingInfo, v: string) => setForm(f => ({ ...f, [k]: v }))

  const addExtraField = () => {
    const label = newFieldLabel.trim()
    if (!label) return
    const key = label.toLowerCase().replace(/\s+/g, '_')
    const already = (form.extraFields ?? []).find(f => f.key === key)
    if (already) return
    setForm(f => ({ ...f, extraFields: [...(f.extraFields ?? []), { key, label, value: '' }] }))
    setNewFieldLabel('')
  }

  const updateExtraField = (key: string, value: string) =>
    setForm(f => ({ ...f, extraFields: (f.extraFields ?? []).map(ef => ef.key === key ? { ...ef, value } : ef) }))

  const removeExtraField = (key: string) =>
    setForm(f => ({ ...f, extraFields: (f.extraFields ?? []).filter(ef => ef.key !== key) }))

  const isValid = form.name.trim() && form.address.trim()

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)
    await onSave({ ...form, id: form.id || `cust_${Date.now()}` })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative glass-panel border border-white/10 rounded-2xl p-6 w-full max-w-lg z-10 shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
            <UserPlus size={18} className="text-primary-red" />
            {existing ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Fixed fields */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fixed Fields</p>

          {([
            { label: 'Customer Name', key: 'name', placeholder: 'Rajesh Kumar Enterprises', required: true },
            { label: 'GST Number', key: 'gstNo', placeholder: '22AAAAA0000A1Z5' },
            { label: 'Phone', key: 'phone', placeholder: '9876543210' },
            { label: 'Email', key: 'email', placeholder: 'billing@example.com' },
          ] as const).map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input value={form[f.key] ?? ''} onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red placeholder:text-gray-600 transition-all" />
            </div>
          ))}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Address <span className="text-red-400">*</span>
            </label>
            <textarea rows={2} value={form.address} onChange={e => update('address', e.target.value)}
              placeholder="Full billing address"
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red resize-none placeholder:text-gray-600 transition-all" />
          </div>
        </div>

        {/* Extra fields */}
        <div className="mt-5 space-y-3">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Extra Fields (optional)</p>

          {(form.extraFields ?? []).map(ef => (
            <div key={ef.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ef.label}</label>
                <button onClick={() => removeExtraField(ef.key)}
                  className="p-1 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
              <input value={ef.value} onChange={e => updateExtraField(ef.key, e.target.value)}
                placeholder={ef.label}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red placeholder:text-gray-600 transition-all" />
            </div>
          ))}

          {/* Add new extra field */}
          <div className="flex gap-2">
            <input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addExtraField()}
              placeholder="New field name e.g. City, PIN, Credit Limit"
              className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red placeholder:text-gray-600 transition-all" />
            <button onClick={addExtraField}
              className="px-3 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
              <Plus size={13} /> Add Field
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!isValid || saving}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              isValid
                ? 'bg-gradient-to-r from-primary-red to-red-600 text-white shadow-[0_0_16px_rgba(255,59,48,0.3)] hover:scale-[1.02]'
                : 'bg-white/5 text-gray-500 cursor-not-allowed')}>
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check size={14} />{existing ? 'Update Customer' : 'Save Customer'}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Invoice Print Layout ─────────────────────────────────────────────────────

function InvoicePrintLayout({ invoice, branch }: {
  invoice: Omit<Invoice, 'id' | 'createdAt'> & { invoiceNo?: string }
  branch: NonNullable<ReturnType<typeof useBranch>['branch']>
}) {
  const allCols = [
    { key: 'date', label: 'Date' },
    { key: 'awbNo', label: 'AWB No' },
    { key: 'destination', label: 'Destination' },
    { key: 'weight', label: 'Weight (kg)' },
    { key: 'amount', label: 'Amount (₹)' },
    ...invoice.extraColumns.map(c => ({ key: c.key, label: c.label })),
  ]

  const getCellValue = (item: InvoiceItem, key: string) => {
    if (key === 'date') return item.date
    if (key === 'awbNo') return item.awbNo
    if (key === 'destination') return item.destination
    if (key === 'weight') return item.weight
    if (key === 'amount') return `₹${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    return item.extraFields[key] ?? ''
  }

  return (
    <div id="invoice-print-area" className="bg-white text-gray-900 p-8 text-xs" style={{ fontFamily: 'Arial, sans-serif', minWidth: 700 }}>
      <div className="text-center mb-6">
        <h1 className="text-xl font-black uppercase tracking-widest">Tax Invoice</h1>
        {invoice.invoiceNo && (
          <p className="text-xs text-gray-500 mt-1">
            Invoice No: <strong>{invoice.invoiceNo}</strong> &nbsp;|&nbsp; Period: {MONTHS[invoice.month - 1]} {invoice.year}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 border border-gray-300 mb-5">
        <div className="border-r border-gray-300">
          <div className="p-4 border-b border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
            <p className="font-black text-sm">{invoice.customer.name}</p>
            <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{invoice.customer.address}</p>
            {invoice.customer.gstNo && <p className="mt-1.5 font-semibold">GSTIN: {invoice.customer.gstNo}</p>}
            {invoice.customer.phone && <p className="text-gray-500 mt-0.5">Ph: {invoice.customer.phone}</p>}
          </div>
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">From</p>
            <p className="font-black text-sm">{branch.name}</p>
            <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{branch.address}</p>
            {branch.gstNo && <p className="mt-1.5 font-semibold">GSTIN: {branch.gstNo}</p>}
            {branch.phone && <p className="text-gray-500 mt-0.5">Ph: {branch.phone}</p>}
            {branch.email && <p className="text-gray-500">{branch.email}</p>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Reserved</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 mb-5 text-[11px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 py-2 px-2 text-left font-black uppercase text-gray-600 w-8">Sr</th>
            {allCols.map(c => (
              <th key={c.key} className="border border-gray-300 py-2 px-2 text-left font-black uppercase text-gray-600 whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
              <td className="border border-gray-200 py-1.5 px-2 text-gray-600">{item.srNo}</td>
              {allCols.map(c => (
                <td key={c.key} className="border border-gray-200 py-1.5 px-2 text-gray-800">{getCellValue(item, c.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-5">
        <div className="w-72 border border-gray-300">
          <div className="flex justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-gray-600 font-semibold">Taxable Amount</span>
            <span className="font-bold">₹{invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-gray-600 font-semibold">CGST @ {invoice.cgstRate}%</span>
            <span className="font-bold">₹{invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-gray-600 font-semibold">SGST @ {invoice.sgstRate}%</span>
            <span className="font-bold">₹{invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 bg-gray-100">
            <span className="font-black uppercase tracking-wide">Total Amount</span>
            <span className="font-black">₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-3 mb-5 bg-gray-50">
        <span className="text-gray-500 font-semibold">Amount in Words: </span>
        <span className="font-bold text-gray-800">{numberToWords(invoice.totalAmount)}</span>
      </div>

      <div className="border border-gray-300 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Bank Details</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
          <div><span className="text-gray-500 font-semibold">Account Holder: </span><span className="font-bold">{branch.accountHolder}</span></div>
          <div><span className="text-gray-500 font-semibold">Bank Name: </span><span className="font-bold">{branch.bankName}</span></div>
          <div><span className="text-gray-500 font-semibold">Account No: </span><span className="font-bold font-mono">{branch.accountNo}</span></div>
          <div><span className="text-gray-500 font-semibold">IFSC Code: </span><span className="font-bold font-mono">{branch.ifscCode}</span></div>
          <div><span className="text-gray-500 font-semibold">Branch: </span><span className="font-bold">{branch.branchName}</span></div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-4">This is a computer generated invoice.</p>
    </div>
  )
}

// ─── Invoice Preview Page ─────────────────────────────────────────────────────

function InvoicePreviewPage({ invoiceData, branch, cgstRate, setCgstRate, sgstRate, setSgstRate, onBack, onSave, saving }: {
  invoiceData: Omit<Invoice, 'id' | 'invoiceNo' | 'createdAt'>
  branch: NonNullable<ReturnType<typeof useBranch>['branch']>
  cgstRate: number; setCgstRate: (v: number) => void
  sgstRate: number; setSgstRate: (v: number) => void
  onBack: () => void; onSave: () => void; saving: boolean
}) {
  const [downloading, setDownloading] = useState(false)

  const taxable = invoiceData.items.reduce((s, i) => s + Number(i.amount), 0)
  const cgst = parseFloat(((taxable * cgstRate) / 100).toFixed(2))
  const sgst = parseFloat(((taxable * sgstRate) / 100).toFixed(2))
  const liveInvoice = { ...invoiceData, taxableAmount: taxable, cgst, sgst, totalAmount: parseFloat((taxable + cgst + sgst).toFixed(2)), cgstRate, sgstRate }

  const handlePrint = () => {
    const el = document.getElementById('invoice-print-area')
    if (!el) return
    const printContents = el.outerHTML
    const printWindow = document.createElement('iframe')
    printWindow.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
    document.body.appendChild(printWindow)
    const doc = printWindow.contentDocument || printWindow.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #111;
      background: #fff;
      width: 100%;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 4px 6px; font-size: 10px; }
    th { background: #f3f3f3; font-weight: bold; text-transform: uppercase; }
    tr:nth-child(even) td { background: #fafafa; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: 1fr 1fr; }
    .border { border: 1px solid #ccc; }
    .border-r { border-right: 1px solid #ccc; }
    .border-b { border-bottom: 1px solid #ccc; }
    .p-4 { padding: 16px; }
    .p-3 { padding: 12px; }
    .p-8 { padding: 32px; }
    .mb-5 { margin-bottom: 20px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-3 { margin-bottom: 12px; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-black { font-weight: 900; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .text-xl { font-size: 18px; }
    .text-sm { font-size: 12px; }
    .text-xs { font-size: 10px; }
    .uppercase { text-transform: uppercase; }
    .tracking-widest { letter-spacing: 0.15em; }
    .tracking-wide { letter-spacing: 0.05em; }
    .leading-relaxed { line-height: 1.6; }
    .whitespace-pre-line { white-space: pre-line; }
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .w-72 { width: 288px; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
    .bg-gray-100 { background: #f3f4f6; }
    .bg-gray-50 { background: #f9fafb; }
    .text-gray-900 { color: #111827; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-300 { color: #d1d5db; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-gray-200 { border-color: #e5e7eb; }
    .rounded { border-radius: 4px; }
    .mt-1 { margin-top: 4px; }
    .mt-1\\.5 { margin-top: 6px; }
    .mt-4 { margin-top: 16px; }
    .min-w-\\[700px\\] { min-width: 0; }
    @media print {
      html, body { width: 210mm; }
      body { margin: 0 !important; padding: 0 !important; }
    }
  </style>
</head>
<body>${printContents}</body>
</html>`)
    doc.close()
    printWindow.contentWindow?.focus()
    setTimeout(() => {
      printWindow.contentWindow?.print()
      setTimeout(() => document.body.removeChild(printWindow), 1000)
    }, 500)
  }

  const handleDownloadPDF = async () => {
    const el = document.getElementById('invoice-print-area')
    if (!el) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`Invoice_${invoiceData.customer.name}_${MONTHS[invoiceData.month - 1]}_${invoiceData.year}.pdf`)
    } finally { setDownloading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Invoice Preview</h2>
          <p className="text-xs text-gray-400">{invoiceData.customer.name} · {MONTHS[invoiceData.month - 1]} {invoiceData.year} · {invoiceData.items.length} entries</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-xs text-gray-400 font-bold">CGST%</span>
            <input type="number" value={cgstRate} onChange={e => setCgstRate(parseFloat(e.target.value) || 0)}
              className="w-10 bg-transparent text-gray-900 dark:text-white text-xs font-mono focus:outline-none" />
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-xs text-gray-400 font-bold">SGST%</span>
            <input type="number" value={sgstRate} onChange={e => setSgstRate(parseFloat(e.target.value) || 0)}
              className="w-10 bg-transparent text-gray-900 dark:text-white text-xs font-mono focus:outline-none" />
          </div>
          <button onClick={handleDownloadPDF} disabled={downloading}
            className="px-3 py-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl text-xs font-bold hover:bg-accent-cyan/20 transition-all flex items-center gap-1.5">
            <Download size={13} />{downloading ? 'Generating...' : 'PDF'}
          </button>
          <button onClick={handlePrint}
            className="px-3 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <Printer size={13} />Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white">
        <InvoicePrintLayout invoice={liveInvoice} branch={branch} />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack}
          className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
          <ArrowLeft size={16} />Back
        </button>
        <button onClick={onSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-green-600 to-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <Check size={16} />{saving ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </div>
  )
}

// ─── Invoice History ──────────────────────────────────────────────────────────

function InvoiceHistory({ invoices, onView, onDelete, loading }: {
  invoices: Invoice[]; onView: (inv: Invoice) => void
  onDelete: (id: string) => void; loading: boolean
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (invoices.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
      <FileText size={36} className="text-gray-600 mb-3" />
      <p className="text-sm font-bold text-gray-500">No invoices yet</p>
      <p className="text-xs text-gray-600 mt-1">Click "New Invoice" to create your first invoice</p>
    </div>
  )
  return (
    <div className="space-y-3">
      {invoices.map(inv => (
        <div key={inv.id} className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-primary-red" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-gray-900 dark:text-white text-sm">{inv.invoiceNo}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-bold">
                  {MONTHS[inv.month - 1]} {inv.year}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{inv.customer.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{inv.items.length} entries · <span className="text-green-400 font-bold">₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onView(inv)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
              <Eye size={12} />View
            </button>
            <button onClick={() => onDelete(inv.id)}
              className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
              <Trash2 size={12} />Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Create Invoice Form (single page, no stepper) ────────────────────────────

function CreateInvoiceForm({ customers, onSaveCustomer, onPreview, onCancel }: {
  customers: CustomerBillingInfo[]
  onSaveCustomer: (c: CustomerBillingInfo) => Promise<CustomerBillingInfo>
  onPreview: (data: { customer: CustomerBillingInfo; month: number; year: number; items: InvoiceItem[]; extraColumns: ExtraColumn[] }) => void
  onCancel: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBillingInfo | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [extraColumns, setExtraColumns] = useState<ExtraColumn[]>([])
  const [newColName, setNewColName] = useState('')
  const [newColType, setNewColType] = useState<'text' | 'number'>('text')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [uploadError, setUploadError] = useState('')

  // close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAddCustomer = async (c: CustomerBillingInfo) => {
    const saved = await onSaveCustomer(c)
    setSelectedCustomer(saved)
  }

  const addExtraColumn = () => {
    const trimmed = newColName.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase().replace(/\s+/g, '_')
    if (extraColumns.find(c => c.key === key)) return
    const newCol: ExtraColumn = { key, label: trimmed, type: newColType }
    setExtraColumns(prev => [...prev, newCol])
    setItems(prev => prev.map(item => ({ ...item, extraFields: { ...item.extraFields, [key]: '' } })))
    setNewColName('')
  }

  const removeExtraColumn = (key: string) => {
    setExtraColumns(prev => prev.filter(c => c.key !== key))
    setItems(prev => prev.map(item => {
      const ef = { ...item.extraFields }
      delete ef[key]
      return { ...item, extraFields: ef }
    }))
  }

  const addRow = () => setItems(prev => [...prev, emptyItem(prev.length + 1, extraColumns)])

  const removeRow = (idx: number) =>
    setItems(prev => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, srNo: i + 1 })))

  const updateRow = (idx: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'date' || field === 'awbNo' || field === 'destination') return { ...item, [field]: value }
      if (field === 'weight' || field === 'amount') return { ...item, [field]: parseFloat(value) || 0 }
      return { ...item, extraFields: { ...item.extraFields, [field]: value } }
    }))
  }

  const downloadTemplate = () => {
    const headers = ['Date', 'AWB No', 'Destination', 'Weight', 'Amount', ...extraColumns.map(c => c.label)]
    const ws = XLSX.utils.aoa_to_sheet([headers])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice Data')
    XLSX.writeFile(wb, 'invoice_template.xlsx')
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('')
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        if (rows.length < 2) { setUploadError('File is empty or has no data rows.'); return }
        const headers: string[] = rows[0].map((h: any) => String(h).trim().toLowerCase())
        const aliases: Record<string, string[]> = {
          date: ['date'], awbNo: ['awb no','awb_no','awbno','awb number','awb'],
          destination: ['destination','dest','to'], weight: ['weight','wt'],
          amount: ['amount','amt','fare','charge'],
        }
        const colMap: Record<string, number> = {}
        for (const [field, alts] of Object.entries(aliases)) {
          const idx = headers.findIndex(h => alts.includes(h))
          if (idx >= 0) colMap[field] = idx
        }
        extraColumns.forEach(col => {
          const idx = headers.findIndex(h => h === col.label.toLowerCase() || h === col.key)
          if (idx >= 0) colMap[col.key] = idx
        })
        if (colMap['awbNo'] === undefined && colMap['amount'] === undefined) {
          setUploadError('Could not detect required columns. Please download and use the template.')
          return
        }
        const parsed: InvoiceItem[] = rows.slice(1)
          .filter(row => row.some(cell => cell !== undefined && cell !== ''))
          .map((row, i) => {
            const extraFields: Record<string, string> = {}
            extraColumns.forEach(col => { extraFields[col.key] = colMap[col.key] !== undefined ? String(row[colMap[col.key]] ?? '') : '' })
            let dateVal = ''
            if (colMap['date'] !== undefined && row[colMap['date']]) {
              const raw = row[colMap['date']]
              dateVal = raw instanceof Date ? raw.toISOString().split('T')[0] : String(raw)
            }
            return {
              srNo: i + 1, date: dateVal,
              awbNo: colMap['awbNo'] !== undefined ? String(row[colMap['awbNo']] ?? '') : '',
              destination: colMap['destination'] !== undefined ? String(row[colMap['destination']] ?? '') : '',
              weight: colMap['weight'] !== undefined ? parseFloat(row[colMap['weight']]) || 0 : 0,
              amount: colMap['amount'] !== undefined ? parseFloat(row[colMap['amount']]) || 0 : 0,
              extraFields,
            }
          })
        setItems(parsed)
        if (fileRef.current) fileRef.current.value = ''
      } catch { setUploadError('Failed to parse file. Please use .xlsx or .csv format.') }
    }
    reader.readAsBinaryString(file)
  }

  const totalAmount = items.reduce((s, i) => s + Number(i.amount), 0)
  const hasCustomer = !!selectedCustomer
  const hasItems = items.length > 0
  const canPreview = hasCustomer && hasItems

  const allCols = [
    { key: 'date', label: 'Date', type: 'text' as const },
    { key: 'awbNo', label: 'AWB No', type: 'text' as const },
    { key: 'destination', label: 'Destination', type: 'text' as const },
    { key: 'weight', label: 'Weight', type: 'number' as const },
    { key: 'amount', label: 'Amount', type: 'number' as const },
    ...extraColumns,
  ]

  return (
    <>
      {showAddCustomer && (
        <AddCustomerModal
          onSave={handleAddCustomer}
          onClose={() => setShowAddCustomer(false)}
        />
      )}

      <div className="space-y-5">
        {/* ── Row 1: Customer selector + Month/Year ── */}
        <div className="glass-panel p-5 rounded-2xl space-y-4" style={{ position: 'relative', zIndex: 20, overflow: 'visible' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">

            {/* Customer dropdown */}
            <div className="sm:col-span-1 relative" ref={dropdownRef}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Customer <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button onClick={() => setDropdownOpen(v => !v)}
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border bg-white/5 text-sm font-semibold flex items-center justify-between gap-2 transition-all',
                    dropdownOpen ? 'border-primary-red ring-2 ring-primary-red' : 'border-white/10 hover:border-white/20',
                    selectedCustomer ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  )}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Users size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{selectedCustomer ? selectedCustomer.name : 'Select customer...'}</span>
                  </div>
                  <ChevronDown size={14} className={cn('flex-shrink-0 transition-transform text-gray-400', dropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden" style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.12)', zIndex: 9999 }}>
                      {customers.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-gray-500 text-center">No customers saved yet</p>
                      ) : (
                        <div className="max-h-48 overflow-y-auto">
                          {customers.map(c => (
                            <button key={c.id} onClick={() => { setSelectedCustomer(c); setDropdownOpen(false) }}
                              className={cn('w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0',
                                selectedCustomer?.id === c.id && 'bg-primary-red/10')}>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                              {c.gstNo && <p className="text-[10px] text-gray-500 mt-0.5">GST: {c.gstNo}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-white/5">
                        <button onClick={() => { setDropdownOpen(false); setShowAddCustomer(true) }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-primary-red hover:bg-primary-red/5 transition-colors flex items-center gap-2">
                          <UserPlus size={13} />Add New Customer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Month */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Month</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red">
                {MONTHS.map((m, i) => <option key={i} value={i + 1} className="bg-gray-900">{m}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Year</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="bg-gray-900">{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Row 2: Extra columns ── */}
        <div className="glass-panel p-5 rounded-2xl space-y-3" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Extra Columns (optional)</p>
            <div className="flex flex-wrap gap-1.5">
              {['Sr No','Date','AWB No','Destination','Weight','Amount'].map(col => (
                <span key={col} className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] font-bold">{col}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <input value={newColName} onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExtraColumn()}
                placeholder="Column name e.g. Docket No"
                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red placeholder:text-gray-600 transition-all" />
            </div>
            <select value={newColType} onChange={e => setNewColType(e.target.value as 'text' | 'number')}
              className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red">
              <option value="text" className="bg-gray-900">Text</option>
              <option value="number" className="bg-gray-900">Number</option>
            </select>
            <button onClick={addExtraColumn}
              className="px-4 py-2 bg-primary-red/10 border border-primary-red/20 text-primary-red rounded-xl text-sm font-bold hover:bg-primary-red/20 transition-all flex items-center gap-1.5">
              <Plus size={14} />Add
            </button>
          </div>

          {extraColumns.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {extraColumns.map(col => (
                <span key={col.key} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                  {col.label}
                  <span className="text-[9px] text-gray-500">{col.type}</span>
                  <button onClick={() => removeExtraColumn(col.key)} className="text-gray-500 hover:text-red-400 transition-colors ml-0.5">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Row 3: Parcel entries table ── */}
        <div className="glass-panel p-5 rounded-2xl space-y-4" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Parcel Entries</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{items.length} entries · Total: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={downloadTemplate}
                className="px-3 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                <Download size={13} />Template
              </button>
              <label className="px-3 py-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl text-xs font-bold cursor-pointer hover:bg-accent-cyan/20 transition-all flex items-center gap-1.5">
                <Upload size={13} />Upload Excel
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
              </label>
              <button onClick={addRow}
                className="px-3 py-2 bg-primary-red/10 border border-primary-red/20 text-primary-red rounded-xl text-xs font-bold hover:bg-primary-red/20 transition-all flex items-center gap-1.5">
                <Plus size={13} />Add Row
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">{uploadError}</div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <FileText size={32} className="text-gray-600 mb-3" />
              <p className="text-sm font-bold text-gray-500">No entries yet</p>
              <p className="text-xs text-gray-600 mt-1">Upload an Excel file or add rows manually</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="py-2.5 px-3 text-left font-bold text-gray-400 uppercase tracking-wider">Sr</th>
                    {allCols.map(c => (
                      <th key={c.key} className="py-2.5 px-3 text-left font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-bold text-gray-400 uppercase tracking-wider">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-mono font-bold text-gray-500">{item.srNo}</td>
                      {allCols.map(col => (
                        <td key={col.key} className="py-1.5 px-2">
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={
                              col.key === 'date' ? item.date
                              : col.key === 'awbNo' ? item.awbNo
                              : col.key === 'destination' ? item.destination
                              : col.key === 'weight' ? (item.weight || '')
                              : col.key === 'amount' ? (item.amount || '')
                              : (item.extraFields[col.key] ?? '')
                            }
                            onChange={e => updateRow(idx, col.key, e.target.value)}
                            placeholder={col.key === 'date' ? 'YYYY-MM-DD' : col.label}
                            className="w-full min-w-[80px] px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-red text-xs placeholder:text-gray-600"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => removeRow(idx)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom nav */}
          <div className="flex justify-between items-center pt-1">
            <button onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
              <ArrowLeft size={16} />Back
            </button>
            <div className="flex flex-col items-end gap-1">
              {!hasCustomer && <p className="text-[10px] text-yellow-500 font-semibold">Select a customer first</p>}
              {hasCustomer && !hasItems && <p className="text-[10px] text-yellow-500 font-semibold">Add at least one entry</p>}
              <button
                onClick={() => { if (selectedCustomer) onPreview({ customer: selectedCustomer, month, year, items, extraColumns }) }}
                disabled={!canPreview}
                className={cn('px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all',
                  canPreview
                    ? 'bg-gradient-to-r from-primary-red to-red-600 text-white shadow-[0_0_16px_rgba(255,59,48,0.3)] hover:scale-[1.02]'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10')}>
                Preview Invoice <Eye size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main BillingPage ─────────────────────────────────────────────────────────

export function BillingPage() {
  const { customers, saveCustomer } = useCustomers()
  const { invoices, loading: invLoading, createInvoice, deleteInvoice } = useInvoices()
  const { branch, loading: branchLoading } = useBranch()

  const [view, setView] = useState<'list' | 'create' | 'preview' | 'viewInvoice'>('list')
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [cgstRate, setCgstRate] = useState(9)
  const [sgstRate, setSgstRate] = useState(9)
  const [pendingData, setPendingData] = useState<{
    customer: CustomerBillingInfo; month: number; year: number
    items: InvoiceItem[]; extraColumns: ExtraColumn[]
  } | null>(null)

  const handlePreview = useCallback((data: typeof pendingData) => {
    setPendingData(data)
    setView('preview')
  }, [])

  const handleSave = useCallback(async () => {
    if (!pendingData) return
    setSaving(true)
    try {
      let cust = pendingData.customer
      if (!cust.id) {
        cust = await saveCustomer({ ...cust, id: `cust_${Date.now()}` })
      }
      const payload: CreateInvoicePayload = {
        customer: cust, month: pendingData.month, year: pendingData.year,
        items: pendingData.items, extraColumns: pendingData.extraColumns,
        cgstRate, sgstRate,
      }
      await createInvoice(payload)
      setPendingData(null)
      setView('list')
    } finally { setSaving(false) }
  }, [pendingData, cgstRate, sgstRate, saveCustomer, createInvoice])

  if (branchLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const taxable = pendingData?.items.reduce((s, i) => s + Number(i.amount), 0) ?? 0
  const previewInvoiceData = pendingData ? {
    customer: pendingData.customer, month: pendingData.month, year: pendingData.year,
    items: pendingData.items, extraColumns: pendingData.extraColumns,
    taxableAmount: taxable, cgstRate, sgstRate,
    cgst: parseFloat(((taxable * cgstRate) / 100).toFixed(2)),
    sgst: parseFloat(((taxable * sgstRate) / 100).toFixed(2)),
    totalAmount: parseFloat((taxable + taxable * cgstRate / 100 + taxable * sgstRate / 100).toFixed(2)),
  } : null

  return (
    <div className="space-y-6">
      {showAddCustomerModal && (
        <AddCustomerModal
          onSave={async (c) => { await saveCustomer(c) }}
          onClose={() => setShowAddCustomerModal(false)}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <FileText size={26} className="text-primary-red" />
            Billing & Invoices
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">Generate monthly transport invoices for bulk customers.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            <UserPlus size={15} />Add Customer
          </button>
          {view === 'list' && (
            <button onClick={() => setView('create')}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 text-white rounded-xl font-bold text-sm shadow-[0_0_16px_rgba(255,59,48,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2">
              <Plus size={16} />New Invoice
            </button>
          )}
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">

        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-panel p-6 rounded-2xl">
            <InvoiceHistory invoices={invoices} loading={invLoading}
              onView={inv => { setViewingInvoice(inv); setView('viewInvoice') }}
              onDelete={deleteInvoice} />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CreateInvoiceForm
              customers={customers}
              onSaveCustomer={saveCustomer}
              onPreview={handlePreview}
              onCancel={() => setView('list')}
            />
          </motion.div>
        )}

        {view === 'preview' && previewInvoiceData && branch && (
          <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <InvoicePreviewPage
              invoiceData={previewInvoiceData} branch={branch}
              cgstRate={cgstRate} setCgstRate={setCgstRate}
              sgstRate={sgstRate} setSgstRate={setSgstRate}
              onBack={() => setView('create')} onSave={handleSave} saving={saving}
            />
          </motion.div>
        )}

        {view === 'viewInvoice' && viewingInvoice && branch && (
          <motion.div key="viewInvoice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setView('list'); setViewingInvoice(null) }}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">{viewingInvoice.invoiceNo}</h2>
                <p className="text-xs text-gray-400">{viewingInvoice.customer.name} · {MONTHS[viewingInvoice.month - 1]} {viewingInvoice.year}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={() => {
                  const el = document.getElementById('invoice-print-area')
                  if (!el) return
                  const iframe = document.createElement('iframe')
                  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
                  document.body.appendChild(iframe)
                  const doc = iframe.contentDocument || iframe.contentWindow?.document
                  if (!doc) return
                  doc.open()
                  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice</title><style>@page{size:A4 portrait;margin:10mm 12mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11px;color:#111;background:#fff}.grid{display:grid}.grid-cols-2{grid-template-columns:1fr 1fr}.border{border:1px solid #ccc}.border-r{border-right:1px solid #ccc}.border-b{border-bottom:1px solid #ccc}.p-4{padding:16px}.p-8{padding:32px}.mb-5{margin-bottom:20px}.text-center{text-align:center}.font-black{font-weight:900}.font-bold{font-weight:700}.font-semibold{font-weight:600}.text-xl{font-size:18px}.text-sm{font-size:12px}.text-xs{font-size:10px}.uppercase{text-transform:uppercase}.tracking-widest{letter-spacing:.15em}.flex{display:flex}.justify-end{justify-content:flex-end}.justify-between{justify-content:space-between}.w-72{width:288px}.px-4{padding:0 16px}.py-2{padding:8px 0}.bg-gray-100{background:#f3f4f6}.bg-gray-50{background:#f9fafb}.text-gray-900{color:#111}.text-gray-600{color:#4b5563}.text-gray-500{color:#6b7280}.text-gray-400{color:#9ca3af}.border-gray-300{border-color:#d1d5db}.border-gray-200{border-color:#e5e7eb}.rounded{border-radius:4px}.mt-1{margin-top:4px}.mt-1\\.5{margin-top:6px}.mt-4{margin-top:16px}.whitespace-pre-line{white-space:pre-line}.leading-relaxed{line-height:1.6}.min-w-\\[700px\\]{min-width:0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;font-size:10px}th{background:#f3f4f6;font-weight:bold;text-transform:uppercase}tr:nth-child(even) td{background:#fafafa}</style></head><body>${el.outerHTML}</body></html>`)
                  doc.close()
                  iframe.contentWindow?.focus()
                  setTimeout(() => { iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000) }, 500)
                }} className="px-3 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                  <Printer size={13} />Print
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white">
              <InvoicePrintLayout invoice={viewingInvoice} branch={branch} />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
