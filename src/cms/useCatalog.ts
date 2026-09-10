import { useEffect, useState } from 'react'
import { cmsApi } from './cmsApi'
import { useEditMode } from './EditModeProvider'

export function locText(value: unknown, locale = 'fr'): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    return String(rec[locale] || rec.fr || rec.en || rec.ar || '')
  }
  return String(value)
}

export function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

async function loadCatalog<T>(kind: string, locale: string): Promise<T[] | null> {
  const { data } = await cmsApi.get(`/catalog/${kind}`, { params: { locale } })
  return Array.isArray(data) ? (data as T[]) : null
}

export function useCatalogQuery<T>(kind: string, fallback: T[]) {
  const { locale } = useEditMode()
  const [items, setItems] = useState<T[]>(() => (locale === 'fr' ? fallback : []))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    setReady(false)
    // Avoid flashing French static catalogues while EN/AR loads.
    if (locale !== 'fr') setItems([])

    const run = async () => {
      attempts += 1
      try {
        const data = await loadCatalog<T>(kind, locale)
        if (cancelled) return
        if (data && data.length > 0) {
          setItems(data)
          setReady(true)
          return
        }
      } catch {
        /* retry below */
      }
      if (cancelled) return
      if (attempts < 4) {
        window.setTimeout(() => {
          if (!cancelled) void run()
        }, 400 * attempts)
        return
      }
      if (locale === 'fr') setItems(fallback)
      setReady(true)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [kind, locale, fallback])

  return { items, ready }
}

export function useCatalog<T>(kind: string, fallback: T[]): T[] {
  return useCatalogQuery(kind, fallback).items
}
