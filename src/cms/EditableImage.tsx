import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { assetUrl } from '../lib/assetUrl'
import { CmsPencil } from './CmsPencil'
import { cmsApi } from './cmsApi'
import { useContent } from './ContentProvider'
import { useEditMode } from './EditModeProvider'

function placement(left: string, top: string): CSSProperties | undefined {
  if (!left && !top) return undefined
  return {
    ...(left ? { left, right: 'auto' } : {}),
    ...(top ? { top, bottom: 'auto' } : {}),
  }
}

function ImagePopup({
  title,
  draft,
  setDraft,
  upload,
  onCancel,
  onOk,
  hint,
}: {
  title: string
  draft: string
  setDraft: (value: string) => void
  upload: (file: File) => void
  onCancel: () => void
  onOk: () => void
  hint?: string
}) {
  return createPortal(
    <div className="cms-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="cms-popup" onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        <label className="cms-popup__file">
          Téléverser une image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) upload(file)
            }}
          />
        </label>
        {hint ? <p className="cms-popup__hint">{hint}</p> : null}
        <div className="cms-popup__actions">
          <button type="button" className="cms-popup__cancel" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="cms-popup__ok" onClick={onOk}>
            Appliquer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function EditableImage({
  section,
  field,
  fallback,
  className,
  alt = '',
  movable = false,
}: {
  section: string
  field: string
  fallback: string
  className?: string
  alt?: string
  movable?: boolean
}) {
  const { isEditMode } = useEditMode()
  const { get, set } = useContent()
  const raw = get(`${section}.${field}`, fallback) || fallback
  const src = assetUrl(raw)
  const left = movable ? get(`${section}.${field}Left`, '') : ''
  const top = movable ? get(`${section}.${field}Top`, '') : ''
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(raw)
  const place = placement(left, top)

  const upload = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const { data } = await cmsApi.post('/admin/content/upload-image', { dataUrl, filename: file.name })
    set(section, field, data.url, 'image')
    setDraft(data.url)
  }

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!movable || !isEditMode) return
    if ((event.target as HTMLElement).closest('.cms-pencil')) return
    event.preventDefault()
    event.stopPropagation()
    const node = event.currentTarget
    const parent = (node.offsetParent as HTMLElement | null) || node.parentElement
    if (!parent) return
    const originX = event.clientX
    const originY = event.clientY
    const startLeft = node.offsetLeft
    const startTop = node.offsetTop
    const move = (next: PointerEvent) => {
      node.style.left = `${startLeft + next.clientX - originX}px`
      node.style.top = `${startTop + next.clientY - originY}px`
      node.style.right = 'auto'
      node.style.bottom = 'auto'
    }
    const stop = (next: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      const x = startLeft + next.clientX - originX
      const y = startTop + next.clientY - originY
      const width = parent.clientWidth || 1
      const height = parent.clientHeight || 1
      set(section, `${field}Left`, `${Math.round((x / width) * 1000) / 10}%`, 'text')
      set(section, `${field}Top`, `${Math.round((y / height) * 1000) / 10}%`, 'text')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const popup = open ? (
    <ImagePopup
      title={`${section}.${field}`}
      draft={draft}
      setDraft={setDraft}
      upload={(file) => void upload(file)}
      onCancel={() => setOpen(false)}
      onOk={() => {
        set(section, field, draft, 'image')
        setOpen(false)
      }}
      hint={movable ? 'Glissez l’image pour la placer, puis Enregistrer. Ne pas étirer les fonds de bande.' : undefined}
    />
  ) : null

  if (!isEditMode) {
    return <img className={className} src={src} alt={alt} style={place} />
  }

  if (!movable) {
    const shellClass = ['cms-editable', 'cms-editable--image', open ? 'is-on' : '', className || '']
      .filter(Boolean)
      .join(' ')
    return (
      <>
        <span className={shellClass}>
          <img className="cms-editable__media" src={src} alt={alt} />
          <span className="cms-image-chip">
            <CmsPencil
              label={`Modifier ${section}.${field}`}
              onOpen={() => {
                setDraft(raw)
                setOpen(true)
              }}
            />
          </span>
        </span>
        {popup}
      </>
    )
  }

  return (
    <>
      <div
        className={`cms-editable cms-editable--image cms-editable--text ${className || ''}${open ? ' is-on' : ''} is-movable`}
        style={place}
        onPointerDown={startDrag}
      >
        <img className="cms-editable__media" src={src} alt={alt} />
        <CmsPencil
          label={`Modifier ${section}.${field}`}
          onOpen={() => {
            setDraft(raw)
            setOpen(true)
          }}
        />
      </div>
      {popup}
    </>
  )
}

export function EditableBackground({
  section,
  field,
  fallback,
  className,
}: {
  section: string
  field: string
  fallback: string
  className?: string
}) {
  const { isEditMode } = useEditMode()
  const { get, set } = useContent()
  const raw = get(`${section}.${field}`, fallback) || fallback
  const src = assetUrl(raw)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(raw)

  const upload = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const { data } = await cmsApi.post('/admin/content/upload-image', { dataUrl, filename: file.name })
    set(section, field, data.url, 'image')
    setDraft(data.url)
  }

  return (
    <>
      <div
        className={className}
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden="true"
      />
      {isEditMode ? (
        <span className="cms-image-chip cms-image-chip--collage">
          <CmsPencil
            label={`Modifier ${section}.${field}`}
            onOpen={() => {
              setDraft(raw)
              setOpen(true)
            }}
          />
        </span>
      ) : null}
      {isEditMode && open ? (
        <ImagePopup
          title={`${section}.${field}`}
          draft={draft}
          setDraft={setDraft}
          upload={(file) => void upload(file)}
          onCancel={() => setOpen(false)}
          onOk={() => {
            set(section, field, draft, 'image')
            setOpen(false)
          }}
          hint="Remplacez le collage entier. Les photos se déplacent ensemble, comme sur le visuel."
        />
      ) : null}
    </>
  )
}

export function CmsSection({
  id,
  className,
  as: Tag = 'section',
  children,
  labelledBy,
  style,
}: {
  id: string
  className?: string
  as?: 'section' | 'div' | 'article' | 'nav'
  children: ReactNode
  labelledBy?: string
  style?: CSSProperties
}) {
  return (
    <Tag className={className} data-cms-section={id} aria-labelledby={labelledBy} style={style}>
      {children}
    </Tag>
  )
}
