import { useState, useEffect, useCallback } from 'react'
import type { BranchInfo } from '../types/index'
import { branchService } from '../services/branchService'

export function useBranch() {
  const [branch, setBranch] = useState<BranchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    branchService.get().then(data => { setBranch(data); setLoading(false) })
  }, [])

  const saveBranch = useCallback(async (info: BranchInfo) => {
    setSaving(true)
    const saved = await branchService.save(info)
    setBranch(saved)
    setSaving(false)
    return saved
  }, [])

  return { branch, loading, saving, saveBranch }
}
