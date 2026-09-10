import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from './ContentProvider'
import { useEditMode } from './EditModeProvider'

const LOCALES = [
  { id: 'fr', label: 'FR' },
  { id: 'en', label: 'EN' },
  { id: 'ar', label: 'AR' },
] as const

export function EditToolbar() {
  const { isEditMode, isBuilderPreview, locale, setLocale, exitEditMode, resetDirty } = useEditMode()
  const { save, discard, pendingCount } = useContent()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const inIframe = typeof window !== 'undefined' && window.parent !== window

  const persist = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setNotice('')
    window.parent.postMessage({ type: 'eu4y-cms-saving', saving: true }, '*')
    try {
      const wrote = await save()
      if (wrote === 'global') setNotice('Enregistré (paramètres du site)')
      else setNotice(wrote ? 'Enregistré' : 'Aucune modification')
      window.parent.postMessage({ type: 'eu4y-cms-saved', wrote: Boolean(wrote) }, '*')
    } catch {
      setNotice('Échec — API 8040 indisponible')
      window.parent.postMessage({ type: 'eu4y-cms-save-error' }, '*')
    } finally {
      setBusy(false)
      window.parent.postMessage({ type: 'eu4y-cms-saving', saving: false }, '*')
    }
  }, [busy, save])

  useEffect(() => {
    if (!isEditMode || isBuilderPreview) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'eu4y-cms-save') void persist()
      if (event.data?.type === 'eu4y-cms-discard') {
        discard()
        resetDirty()
        window.parent.postMessage({ type: 'eu4y-cms-discarded' }, '*')
        window.location.reload()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [discard, isBuilderPreview, isEditMode, persist, resetDirty])

  useEffect(() => {
    if (!isEditMode) return
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        void persist()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isEditMode, persist])

  if (!isEditMode) return null

  if (inIframe) {
    return createPortal(
      <div className={`cms-toolbar cms-toolbar--slim cms-toolbar--iframe${pendingCount ? ' cms-toolbar--dirty' : ''}`} dir="ltr">
        <span className="cms-toolbar__hint">
          {pendingCount
            ? `${pendingCount} modification${pendingCount !== 1 ? 's' : ''} en attente`
            : 'Crayon orange → modifier · Ctrl+S pour enregistrer'}
        </span>
        <div className="cms-toolbar__actions">
          {notice ? <span className="cms-count">{notice}</span> : null}
          <button type="button" className="cms-toolbar__save" disabled={busy || !pendingCount} onClick={() => void persist()}>
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div className={`cms-toolbar${isBuilderPreview ? ' cms-toolbar--embed' : ''}${pendingCount ? ' cms-toolbar--dirty' : ''}`} dir="ltr">
      <strong>{isBuilderPreview ? 'Aperçu live' : 'EU4Youth Live Editor'}</strong>
      <div className="cms-toolbar__langs">
        {LOCALES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={locale === item.id ? 'active' : ''}
            onClick={() => setLocale(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <span className="cms-count">
        {pendingCount} modification(s){notice ? ` · ${notice}` : ''}
      </span>
      <div className="cms-toolbar__actions">
        <button
          type="button"
          onClick={() => {
            discard()
            resetDirty()
            window.location.reload()
          }}
        >
          Annuler
        </button>
        <button type="button" className="cms-toolbar__save" disabled={busy || !pendingCount} onClick={() => void persist()}>
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {!isBuilderPreview ? (
          <button type="button" onClick={exitEditMode}>
            Quitter
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
