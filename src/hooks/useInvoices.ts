import { useState, useEffect, useCallback } from 'react'
import type { Invoice, CreateInvoicePayload } from '../types/index'
import { invoiceService } from '../services/invoiceService'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await invoiceService.getAll()
      setInvoices(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createInvoice = useCallback(async (payload: CreateInvoicePayload): Promise<Invoice> => {
    const invoice = await invoiceService.create(payload)
    setInvoices(prev => [invoice, ...prev])
    return invoice
  }, [])

  const deleteInvoice = useCallback(async (id: string) => {
    await invoiceService.delete(id)
    setInvoices(prev => prev.filter(i => i.id !== id))
  }, [])

  return { invoices, loading, error, createInvoice, deleteInvoice, reload: load }
}
