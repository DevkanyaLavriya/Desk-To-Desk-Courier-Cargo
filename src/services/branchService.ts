import type { BranchInfo } from '../types/index'
import { isBackendMode, apiFetch } from './api'

const STORAGE_KEY = 'billing_branch_info'

const DEFAULT_BRANCH: BranchInfo = {
  name: 'Desk To Desk Courier & Cargo',
  address: 'Your Branch Address, City - PIN',
  gstNo: 'YOUR_GST_NUMBER',
  phone: '9800000000',
  email: 'ops@desktodesk.com',
  bankName: 'Bank Name',
  accountNo: '000000000000',
  ifscCode: 'IFSC0000000',
  branchName: 'Branch Name',
  accountHolder: 'Account Holder Name',
}

function localGet(): BranchInfo {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') ?? DEFAULT_BRANCH
  } catch {
    return DEFAULT_BRANCH
  }
}

function localSave(info: BranchInfo): BranchInfo {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  return info
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const branchService = {
  get: (): Promise<BranchInfo> => {
    if (isBackendMode()) return apiFetch('/branch')
    return Promise.resolve(localGet())
  },

  save: (info: BranchInfo): Promise<BranchInfo> => {
    if (isBackendMode()) return apiFetch('/branch', { method: 'PUT', body: JSON.stringify(info) })
    return Promise.resolve(localSave(info))
  },
}
