import type { Invoice, CreateInvoicePayload } from '../types/index'
import { isBackendMode, apiFetch } from './api'

const STORAGE_KEY = 'billing_invoices'

function generateInvoiceNo(): string {
  const now = new Date()
  const seq = (JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Invoice[]).length + 1
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(seq).padStart(4, '0')}`
}

function localGetAll(): Invoice[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function localCreate(payload: CreateInvoicePayload): Invoice {
  const taxableAmount = payload.items.reduce((sum, i) => sum + Number(i.amount), 0)
  const cgst = parseFloat(((taxableAmount * payload.cgstRate) / 100).toFixed(2))
  const sgst = parseFloat(((taxableAmount * payload.sgstRate) / 100).toFixed(2))
  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNo: generateInvoiceNo(),
    customer: payload.customer,
    month: payload.month,
    year: payload.year,
    items: payload.items,
    extraColumns: payload.extraColumns,
    taxableAmount,
    cgstRate: payload.cgstRate,
    sgstRate: payload.sgstRate,
    cgst,
    sgst,
    totalAmount: parseFloat((taxableAmount + cgst + sgst).toFixed(2)),
    createdAt: new Date().toISOString(),
  }
  const all = localGetAll()
  all.unshift(invoice)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return invoice
}

function localDelete(id: string): void {
  const all = localGetAll().filter(i => i.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ─── Public API ───────────────────────────────────────────────────────────────
// When backend is ready: replace local* calls with apiFetch calls below.
// UI hooks never change.

export const invoiceService = {
  getAll: (): Promise<Invoice[]> => {
    if (isBackendMode()) return apiFetch('/invoices')
    return Promise.resolve(localGetAll())
  },

  getById: (id: string): Promise<Invoice | null> => {
    if (isBackendMode()) return apiFetch(`/invoices/${id}`)
    return Promise.resolve(localGetAll().find(i => i.id === id) ?? null)
  },

  create: (payload: CreateInvoicePayload): Promise<Invoice> => {
    if (isBackendMode())
      return apiFetch('/invoices', { method: 'POST', body: JSON.stringify(payload) })
    return Promise.resolve(localCreate(payload))
  },

  delete: (id: string): Promise<void> => {
    if (isBackendMode()) return apiFetch(`/invoices/${id}`, { method: 'DELETE' })
    localDelete(id)
    return Promise.resolve()
  },
}
