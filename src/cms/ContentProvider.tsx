import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cmsApi } from './cmsApi'
import { useEditMode } from './EditModeProvider'
import { slugFromPath } from './pageSlug'

type Pending = Record<string, { section: string; key: string; locale: string; type: string; value: string }>

type ContentValue = {
  page: string
  blocks: Record<string, string>
  pendingCount: number
  get: (path: string, fallback?: string) => string
  t: (key: string, fallback?: string) => string
  set: (section: string, key: string, value: string, type?: 'text' | 'image' | 'json') => void
  save: () => Promise<boolean | 'global'>
  discard: () => void
}

function adminOrigin() {
  try {
    if (document.referrer) {
      const origin = new URL(document.referrer).origin
      if (origin.includes('3040') || origin.includes('localhost')) return origin
    }
  } catch {
    /* ignore */
  }
  return 'http://localhost:3040'
}

const ADMIN_ORIGIN = adminOrigin()
const PREVIEW_MSG = 'gc-builder-preview'
const PREVIEW_READY = 'gc-builder-preview-ready'
const PREVIEW_EDIT = 'gc-builder-preview-edit'
const PREVIEW_SAVED = 'gc-builder-preview-saved'

const ContentContext = createContext<ContentValue | null>(null)

function compound(section: string, key: string) {
  return `${section}.${key}`
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const page = slugFromPath(pathname)
  const { locale, isEditMode, isBuilderPreview, markDirty, resetDirty, setLocale } = useEditMode()
  const [blocks, setBlocks] = useState<Record<string, string>>({})
  const [globalBlocks, setGlobalBlocks] = useState<Record<string, string>>({})
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<Pending>({})
  const [i18n, setI18n] = useState<Record<string, string>>({})
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setContentReady(false)
    cmsApi
      .get(`/content/${page}`, { params: { locale } })
      .then((res) => {
        if (!cancelled) {
          setBlocks(res.data.blocks || {})
          setContentReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBlocks({})
          setContentReady(true)
        }
      })
    cmsApi
      .get('/content/global', { params: { locale } })
      .then((res) => {
        if (!cancelled) setGlobalBlocks(res.data.blocks || {})
      })
      .catch(() => undefined)
    cmsApi
      .get('/translations/all')
      .then((res) => {
        if (!cancelled) setI18n(res.data?.[locale] || res.data?.fr || {})
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [page, locale])

  useEffect(() => {
    if (!isEditMode || isBuilderPreview) return
    const hiddenSections = new Set(['header', 'footer', 'legal', 'cookie', 'cookies'])
    const report = () => {
      const nodes = [...document.querySelectorAll('[data-cms-section]')]
      const seen = new Set<string>()
      const sections = nodes
        .map((node) => ({
          id: node.getAttribute('data-cms-section') || '',
          label:
            (node.getAttribute('aria-labelledby') &&
              document.getElementById(node.getAttribute('aria-labelledby') || '')?.textContent?.trim()) ||
            node.getAttribute('data-cms-label') ||
            node.getAttribute('data-cms-section') ||
            '',
        }))
        .filter((item) => item.id && !hiddenSections.has(item.id) && !seen.has(item.id) && seen.add(item.id))
      window.parent.postMessage({ type: 'eu4y-cms-outline', page, sections }, '*')
    }
    const reportActive = () => {
      const nodes = [...document.querySelectorAll('[data-cms-section]')].filter(
        (node) => !hiddenSections.has(node.getAttribute('data-cms-section') || ''),
      )
      let bestId = ''
      let bestDist = Infinity
      for (const node of nodes) {
        const rect = node.getBoundingClientRect()
        if (rect.bottom < 72 || rect.top > window.innerHeight) continue
        const dist = Math.abs(rect.top - 96)
        if (dist < bestDist) {
          bestDist = dist
          bestId = node.getAttribute('data-cms-section') || ''
        }
      }
      if (bestId) window.parent.postMessage({ type: 'eu4y-cms-section-active', section: bestId }, '*')
    }
    report()
    const timer = window.setTimeout(report, 400)
    const observer = new MutationObserver(() => report())
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-cms-section', 'aria-labelledby', 'data-cms-label'],
    })
    let scrollTimer = 0
    const onScroll = () => {
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(reportActive, 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const onScrollMsg = (event: MessageEvent) => {
      if (event.data?.type !== 'eu4y-cms-scroll') return
      const id = String(event.data.section || '')
      const target = document.querySelector(`[data-cms-section="${id}"]`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (target) {
        target.classList.add('cms-section-highlight')
        window.setTimeout(() => target.classList.remove('cms-section-highlight'), 2200)
      }
    }
    window.addEventListener('message', onScrollMsg)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(scrollTimer)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('message', onScrollMsg)
    }
  }, [isEditMode, isBuilderPreview, page])

  useEffect(() => {
    if (!isEditMode) return
    window.parent.postMessage({ type: 'eu4y-cms-dirty', count: Object.keys(pending).length }, '*')
  }, [pending, isEditMode])

  useEffect(() => {
    if (!isBuilderPreview) return
    window.parent.postMessage({ type: PREVIEW_READY, page }, ADMIN_ORIGIN)
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== ADMIN_ORIGIN) return
      if (event.data?.type !== PREVIEW_MSG) return
      if (event.data.locale) setLocale(event.data.locale)
      setOverrides(event.data.overrides || {})
      const highlight = event.data.highlightSection as string | null
      document.querySelectorAll('[data-cms-section]').forEach((node) => {
        node.classList.toggle('cms-section-highlight', node.getAttribute('data-cms-section') === highlight)
      })
      if (event.data.scrollToSection) {
        document.querySelector(`[data-cms-section="${event.data.scrollToSection}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isBuilderPreview, page, setLocale])

  const get = useCallback(
    (path: string, fallback = '') => {
      const pendingHit = Object.values(pending).find(
        (item) => compound(item.section, item.key) === path && (item.locale === locale || item.locale === '_all'),
      )
      if (pendingHit?.value) return pendingHit.value
      if (overrides[path]) return overrides[path]
      if (blocks[path]) return blocks[path]
      if (globalBlocks[path]) return globalBlocks[path]
      // Avoid flashing French static fallbacks while EN/AR CMS content loads.
      if (!contentReady && locale !== 'fr') return ''
      return fallback
    },
    [pending, overrides, blocks, globalBlocks, locale, contentReady],
  )

  const set = useCallback(
    (section: string, key: string, value: string, type: 'text' | 'image' | 'json' = 'text') => {
      const loc = type === 'image' ? '_all' : locale
      const id = `${section}.${key}.${loc}`
      setPending((current) => ({
        ...current,
        [id]: { section, key, locale: loc, type, value },
      }))
      markDirty()
      if (isBuilderPreview) {
        window.parent.postMessage(
          {
            type: PREVIEW_EDIT,
            page,
            section,
            key,
            locale,
            blockType: type,
            value,
          },
          ADMIN_ORIGIN,
        )
      }
    },
    [locale, markDirty, isBuilderPreview, page],
  )

  const save = useCallback(async () => {
    if (!isEditMode) return false
    const list = Object.values(pending).map((item) => ({
      page:
        item.section.startsWith('settings') ||
        ['footer', 'legal', 'header', 'nav', 'logos'].includes(item.section)
          ? 'global'
          : page,
      section: item.section,
      key: item.key,
      locale: item.locale,
      type: item.type,
      value: item.value,
    }))
    if (!list.length) return false
    const savedGlobal = list.some((item) => item.page === 'global')
    await cmsApi.post('/admin/content/bulk', {
      blocks: list,
      source_locale: locale,
      translate: true,
    })
    setPending({})
    resetDirty()
    window.parent.postMessage({ type: PREVIEW_SAVED, page, cleared: true, savedGlobal }, ADMIN_ORIGIN)
    const res = await cmsApi.get(`/content/${page}`, { params: { locale } })
    setBlocks(res.data.blocks || {})
    return savedGlobal ? 'global' : true
  }, [isEditMode, pending, page, resetDirty, locale])

  const t = useCallback(
    (key: string, fallback = '') => i18n[key] || fallback,
    [i18n],
  )

  const discard = useCallback(() => {
    setPending({})
    resetDirty()
  }, [resetDirty])

  const pendingCount = Object.keys(pending).length

  const value = useMemo<ContentValue>(
    () => ({ page, blocks, pendingCount, get, t, set, save, discard }),
    [page, blocks, pendingCount, get, t, set, save, discard],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent requires ContentProvider')
  return ctx
}
