export interface ExtraColumn {
  key: string
  label: string
  type: 'text' | 'number'
}

export interface InvoiceItem {
  srNo: number
  date: string
  awbNo: string
  destination: string
  weight: number
  amount: number
  extraFields: Record<string, string>
}

export interface CustomerExtraField {
  key: string
  label: string
  value: string
}

export interface CustomerBillingInfo {
  id: string
  name: string
  address: string
  gstNo: string
  phone?: string
  email?: string
  extraFields?: CustomerExtraField[]
}

export interface BranchInfo {
  name: string
  address: string
  gstNo: string
  phone: string
  email: string
  bankName: string
  accountNo: string
  ifscCode: string
  branchName: string
  accountHolder: string
}

export interface Invoice {
  id: string
  invoiceNo?: string
  customer: CustomerBillingInfo
  month: number
  year: number
  items: InvoiceItem[]
  extraColumns: ExtraColumn[]
  taxableAmount: number
  cgstRate: number
  sgstRate: number
  cgst: number
  sgst: number
  totalAmount: number
  createdAt: string
}

export interface CreateInvoicePayload {
  customer: CustomerBillingInfo
  month: number
  year: number
  items: InvoiceItem[]
  extraColumns: ExtraColumn[]
  cgstRate: number
  sgstRate: number
}
