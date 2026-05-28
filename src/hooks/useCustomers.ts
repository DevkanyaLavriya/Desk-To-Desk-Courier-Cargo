import { useState, useEffect, useCallback } from 'react'
import type { CustomerBillingInfo } from '../types/index'
import { customerService } from '../services/customerService'

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerBillingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await customerService.getAll()
      setCustomers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveCustomer = useCallback(async (customer: CustomerBillingInfo) => {
    const saved = await customerService.save(customer)
    setCustomers(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved]
    })
    return saved
  }, [])

  const deleteCustomer = useCallback(async (id: string) => {
    await customerService.delete(id)
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [])

  return { customers, loading, error, saveCustomer, deleteCustomer, reload: load }
}
