import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { cmsApi } from './cmsApi'
import { useEditMode } from './EditModeProvider'
import type { LivePack, Locale } from './liveTypes'

type LiveContentValue = {
  live: LivePack | null
  text: (section: keyof LivePack, key: string, fallback: string) => string
  setText: (section: keyof LivePack, key: string, value: string) => void
  save: () => Promise<void>
}

const LiveContentContext = createContext<LiveContentValue | null>(null)

export function LiveContentProvider({ children }: { children: ReactNode }) {
  const { locale, markDirty, resetDirty, isEditMode } = useEditMode()
  const [live, setLive] = useState<LivePack | null>(null)

  useEffect(() => {
    cmsApi
      .get('/public/live')
      .then((res) => setLive(res.data.live))
      .catch(() => undefined)
  }, [])

  const text = useCallback(
    (section: keyof LivePack, key: string, fallback: string) => {
      const field = live?.[section]?.[key]
      return field?.[locale] || field?.fr || fallback
    },
    [live, locale],
  )

  const setText = useCallback(
    (section: keyof LivePack, key: string, value: string) => {
      setLive((current) => {
        if (!current) return current
        const next = structuredClone(current)
        if (!next[section][key]) {
          next[section][key] = { fr: value, en: value, ar: value }
        } else {
          next[section][key][locale] = value
        }
        return next
      })
      markDirty()
    },
    [locale, markDirty],
  )

  const save = useCallback(async () => {
    if (!live || !isEditMode) return
    const { data } = await cmsApi.patch('/admin/live', live)
    setLive(data)
    resetDirty()
  }, [isEditMode, live, resetDirty])

  return (
    <LiveContentContext.Provider value={{ live, text, setText, save }}>
      {children}
    </LiveContentContext.Provider>
  )
}

export function useLiveContent() {
  const ctx = useContext(LiveContentContext)
  if (!ctx) throw new Error('useLiveContent requires LiveContentProvider')
  return ctx
}

export function useLiveLocale(): Locale {
  return useEditMode().locale
}
