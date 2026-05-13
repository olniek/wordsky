// Tiny safe localStorage wrapper. Returns fallback on parse error or SSR / disabled storage.

/** Dispatched on `window` when `setItem` fails (quota, private mode, blocked storage). */
export const STORAGE_WRITE_FAILED_EVENT = 'wordssky-storage-write-failed'
/** Dispatched on `window` when a write succeeds after a prior failure. */
export const STORAGE_WRITE_RECOVERED_EVENT = 'wordssky-storage-write-recovered'

let storageBroken = false

export function isStorageBroken(): boolean {
  return storageBroken
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    if (storageBroken) {
      storageBroken = false
      window.dispatchEvent(new CustomEvent(STORAGE_WRITE_RECOVERED_EVENT, { detail: { key } }))
    }
  } catch {
    storageBroken = true
    window.dispatchEvent(new CustomEvent(STORAGE_WRITE_FAILED_EVENT, { detail: { key } }))
  }
}
