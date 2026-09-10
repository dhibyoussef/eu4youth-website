import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cmsApi, readEditToken, setEditToken } from './cmsApi'
import type { Locale } from './liveTypes'

type EditModeValue = {
  isEditMode: boolean
  isBuilderPreview: boolean
  locale: Locale
  setLocale: (locale: Locale) => void
  dirty: number
  markDirty: () => void
  resetDirty: () => void
  exitEditMode: () => void
}

const EditModeContext = createContext<EditModeValue | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const params = new URLSearchParams(window.location.search)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isBuilderPreview] = useState(params.get('builder_preview') === '1')
  const [locale, setLocaleState] = useState<Locale>(() => {
    const fromQuery = params.get('locale')
    if (fromQuery === 'fr' || fromQuery === 'en' || fromQuery === 'ar') {
      try {
        localStorage.setItem('eu4y_locale', fromQuery)
      } catch {
        /* ignore */
      }
      return fromQuery
    }
    try {
      const saved = localStorage.getItem('eu4y_locale')
      if (saved === 'fr' || saved === 'en' || saved === 'ar') return saved
    } catch {
      /* ignore */
    }
    return 'fr'
  })
  const [dirty, setDirty] = useState(0)

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem('eu4y_locale', next)
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('locale') !== next) {
        url.searchParams.set('locale', next)
        const search = url.searchParams.toString()
        window.history.replaceState({}, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`)
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const urlToken = query.get('edit_token')
    const forceLive = query.get('live_edit') === '1'
    if (urlToken) {
      setEditToken(urlToken)
      try {
        sessionStorage.setItem('eu4y_edit_active', '1')
      } catch {
        /* ignore */
      }
      query.delete('edit_token')
      const keep = query.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${keep ? `?${keep}` : ''}`)
    }

    const token = readEditToken()
    let editActive = false
    try {
      editActive = sessionStorage.getItem('eu4y_edit_active') === '1'
    } catch {
      /* ignore */
    }
    /* Stale tokens must not force pencils on every public visit. */
    if (!token || (!urlToken && !forceLive && !isBuilderPreview && !editActive)) {
      return
    }

    cmsApi
      .get('/auth/me')
      .then(({ data }) => {
        const roles: string[] = data.roles || []
        const role = data.user?.role || data.role
        const canLive =
          data.canLiveEdit ||
          data.permissions?.content ||
          roles.includes('admin') ||
          role === 'administrateur' ||
          role === 'editeur' ||
          role === 'contributeur' ||
          role === 'communication'
        if (canLive) {
          try {
            sessionStorage.setItem('eu4y_edit_active', '1')
          } catch {
            /* ignore */
          }
          setIsEditMode(true)
        } else {
          setEditToken(null)
          try {
            sessionStorage.removeItem('eu4y_edit_active')
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        setEditToken(null)
        try {
          sessionStorage.removeItem('eu4y_edit_active')
        } catch {
          /* ignore */
        }
      })
  }, [isBuilderPreview])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.body.classList.toggle('cms-editing', isEditMode)
  }, [isEditMode, locale])

  useEffect(() => {
    if (!isEditMode) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'eu4y-cms-set-locale') return
      const next = event.data.locale
      if (next === 'fr' || next === 'en' || next === 'ar') setLocale(next)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isEditMode])

  useEffect(() => {
    if (!isEditMode) return
    const onClickCapture = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null
      if (!el?.closest('.cms-editable')) return
      if (el.closest('[data-cms-allow-nav]')) return
      const anchor = el.closest('a[href]')
      if (anchor) event.preventDefault()
    }
    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [isEditMode])

  const value = useMemo<EditModeValue>(
    () => ({
      isEditMode,
      isBuilderPreview,
      locale,
      setLocale,
      dirty,
      markDirty: () => setDirty((n) => n + 1),
      resetDirty: () => setDirty(0),
      exitEditMode: () => {
        setEditToken(null)
        try {
          sessionStorage.removeItem('eu4y_edit_active')
        } catch {
          /* ignore */
        }
        setIsEditMode(false)
        setDirty(0)
      },
    }),
    [dirty, isEditMode, isBuilderPreview, locale],
  )

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
}

export function useEditMode() {
  const ctx = useContext(EditModeContext)
  if (!ctx) throw new Error('useEditMode requires EditModeProvider')
  return ctx
}
