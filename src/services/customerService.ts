import type { CustomerBillingInfo } from '../types/index'
import { isBackendMode, apiFetch } from './api'

const STORAGE_KEY = 'billing_customers'

function localGetAll(): CustomerBillingInfo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function localSave(customer: CustomerBillingInfo): CustomerBillingInfo {
  const all = localGetAll()
  const idx = all.findIndex(c => c.id === customer.id)
  if (idx >= 0) all[idx] = customer
  else all.push(customer)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return customer
}

function localDelete(id: string): void {
  const all = localGetAll().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ─── Public API ───────────────────────────────────────────────────────────────
// When backend is ready: replace local* calls with apiFetch calls below.
// UI hooks never change.

export const customerService = {
  getAll: (): Promise<CustomerBillingInfo[]> => {
    if (isBackendMode()) return apiFetch('/customers')
    return Promise.resolve(localGetAll())
  },

  save: (customer: CustomerBillingInfo): Promise<CustomerBillingInfo> => {
    if (isBackendMode())
      return apiFetch('/customers', { method: customer.id ? 'PUT' : 'POST', body: JSON.stringify(customer) })
    return Promise.resolve(localSave(customer))
  },

  delete: (id: string): Promise<void> => {
    if (isBackendMode()) return apiFetch(`/customers/${id}`, { method: 'DELETE' })
    localDelete(id)
    return Promise.resolve()
  },
}
