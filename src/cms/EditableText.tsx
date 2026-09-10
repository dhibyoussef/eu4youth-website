import { useRef, useState, type CSSProperties, type ElementType, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CmsPencil } from './CmsPencil'
import { useContent } from './ContentProvider'
import { useEditMode } from './EditModeProvider'

function withBreaks(value: string) {
  return value.split('\n').map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

export function EditableText({
  section,
  field,
  fallback,
  as: Tag = 'span',
  className,
  children: _children,
  render,
  multiline = true,
  id,
  label,
  chipOnly = false,
  style,
}: {
  section: string
  field: string
  fallback: string
  as?: ElementType
  className?: string
  /** @deprecated Prefer `render` so EN/AR CMS values cannot be overridden by static French children. */
  children?: ReactNode
  /** Build display markup from the live CMS value (correct for all locales). */
  render?: (value: string) => ReactNode
  multiline?: boolean
  id?: string
  label?: string
  chipOnly?: boolean
  style?: CSSProperties
}) {
  const { isEditMode, locale } = useEditMode()
  const { get, set, page } = useContent()
  const value = get(`${section}.${field}`, fallback)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLElement | null>(null)
  const display = render ? render(value) : withBreaks(value)
  const caption = label || `${section} · ${field}`
  void _children

  const localeHint =
    locale === 'fr'
      ? 'Français = langue source. EN / AR se complètent à l’enregistrement.'
      : locale === 'en'
        ? 'Editing English. Save to persist; FR remains the source catalogue.'
        : 'تحرير العربية. احفظ للتسجيل؛ الفرنسية تبقى المصدر.'

  const popup = open
    ? createPortal(
        <div
          className="cms-modal"
          role="dialog"
          aria-modal="true"
          aria-label={caption}
          onClick={() => setOpen(false)}
        >
          <div className="cms-popup" onClick={(event) => event.stopPropagation()}>
            <h3>{caption}</h3>
            <p className="cms-popup__hint">{localeHint}</p>
            {multiline ? (
              <textarea
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={6}
                autoFocus
              />
            ) : (
              <input
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
              />
            )}
            <div className="cms-popup__actions">
              <button type="button" className="cms-popup__cancel" onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="cms-popup__ok"
                onClick={() => {
                  set(section, field, draft, 'text')
                  setOpen(false)
                }}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  if (!isEditMode) {
    if (chipOnly) return null
    return (
      <Tag className={className} id={id} data-cms-page={page} data-cms-block={`${section}.${field}`}>
        {display}
      </Tag>
    )
  }

  const pencil = (
    <CmsPencil
      label={`Modifier ${caption}`}
      onOpen={() => {
        setDraft(value)
        setOpen(true)
      }}
    />
  )

  if (chipOnly) {
    return (
      <>
        <span className={`cms-chip-only ${className || ''}`.trim()} style={style}>{pencil}</span>
        {popup}
      </>
    )
  }

  return (
    <>
      <Tag
        ref={ref}
        className={`cms-editable cms-editable--text ${className || ''}${open ? ' is-on' : ''}`}
        data-cms-page={page}
        data-cms-block={`${section}.${field}`}
        id={id}
        onClick={(event: MouseEvent) => {
          if ((event.target as HTMLElement).closest('.cms-pencil')) return
          setDraft(value)
          setOpen(true)
        }}
      >
        {display}
        {pencil}
      </Tag>
      {popup}
    </>
  )
}
