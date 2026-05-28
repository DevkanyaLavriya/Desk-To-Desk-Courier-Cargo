// When backend is ready, set VITE_API_URL in .env
// The entire app will switch to backend automatically — no UI changes needed
export const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? null

export const isBackendMode = (): boolean => !!BASE_URL

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}
