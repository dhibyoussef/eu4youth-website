import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { assetUrl } from '../lib/assetUrl'
import { cmsApi } from './cmsApi'
import { useContent } from './ContentProvider'
import { useEditMode } from './EditModeProvider'

export type ListField = {
  key: string
  label: string
  multiline?: boolean
  /** Image URL with optional upload in the list panel. */
  kind?: 'image'
  /** Official names to pick instead of free typing. */
  options?: string[]
  /** Shown on toggles; stored value stays the option string. */
  optionLabels?: Record<string, string>
  /** false = one value (oui / non). Default true when options are set. */
  multiple?: boolean
}

type Props<T extends Record<string, string>> = {
  section: string
  field: string
  label: string
  fallback: T[]
  fields: ListField[]
  emptyItem: T
  className?: string
  wrapItems?: boolean
  manageLabel?: string
  triggerStyle?: CSSProperties
  filterItems?: (items: T[]) => T[]
  renderItem: (item: T, index: number) => ReactNode
}

function selectedNames(raw: string, options: string[]) {
  const asked = raw.split(/[,;\n]/).map((name) => name.trim()).filter(Boolean)
  return options.filter((option) =>
    asked.some((name) => name.toLowerCase() === option.toLowerCase()),
  )
}

function parseItems<T extends Record<string, string>>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.fr)
        ? parsed.fr
        : null
    if (!list) return fallback
    return list.map((row: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, value == null ? '' : String(value)]),
      ),
    ) as T[]
  } catch {
    return fallback
  }
}

export function EditableJsonList<T extends Record<string, string>>({
  section,
  field,
  label,
  fallback,
  fields,
  emptyItem,
  className = '',
  wrapItems = true,
  manageLabel = 'Gérer la liste',
  triggerStyle,
  filterItems,
  renderItem,
}: Props<T>) {
  const { isEditMode } = useEditMode()
  const { get, set } = useContent()
  const raw = get(`${section}.${field}`, '')
  const items = useMemo(() => {
    const parsed = parseItems<T>(raw, fallback)
    return filterItems ? filterItems(parsed) : parsed
  }, [raw, fallback, filterItems])
  const [open, setOpen] = useState(false)

  const queue = (next: T[]) => set(section, field, JSON.stringify(next), 'json')

  return (
    <div className={`cms-json-list ${className}`.trim()} data-cms-block={`${section}.${field}`}>
      {isEditMode ? (
        <div className="cms-list-trigger-wrap" style={triggerStyle}>
          <button type="button" className="cms-list-trigger" onClick={() => setOpen(true)}>
            {manageLabel}
            <span className="cms-list-trigger__count">{items.length}</span>
          </button>
        </div>
      ) : null}

      {items.map((item, index) => {
        const key = `${index}-${item[fields[0]?.key] ?? index}`
        const node = renderItem(item, index)
        if (!wrapItems) return <Fragment key={key}>{node}</Fragment>
        return (
          <div key={key} className="cms-json-list__item">
            {node}
          </div>
        )
      })}

      {isEditMode && open
        ? createPortal(
            <div className="cms-list-modal" role="dialog" onClick={() => setOpen(false)}>
              <div className="cms-list-panel" onClick={(event) => event.stopPropagation()}>
                <header className="cms-list-panel__head">
                  <strong>{label}</strong>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                    ×
                  </button>
                </header>
                <p className="cms-list-panel__hint">
                  Liste de la page : ajouter, modifier ou supprimer. Les blocs globaux (menu, logo) se
                  règlent dans Contenu du site → Global.
                </p>
                {items.map((item, index) => (
                  <article key={index} className="cms-list-panel__card">
                    <div className="cms-list-panel__card-head">
                      <span>Élément {index + 1}</span>
                      <button type="button" onClick={() => queue(items.filter((_, i) => i !== index))}>
                        Supprimer
                      </button>
                    </div>
                    {fields.map((meta) => {
                      const patch = (value: string) =>
                        queue(
                          items.map((row, i) =>
                            i === index ? ({ ...row, [meta.key]: value } as T) : row,
                          ),
                        )
                      const current = item[meta.key] ?? ''
                      const nationalOn = /^(oui|yes|true|1|national)$/i.test(
                        String((item as Record<string, string>).national || ''),
                      )
                      const options = meta.options
                      if (options?.length) {
                        const multiple = meta.multiple !== false
                        const picked = multiple
                          ? selectedNames(current, options)
                          : options.filter(
                              (option) => option.toLowerCase() === current.trim().toLowerCase(),
                            )
                        const locked = meta.key === 'governorates' && nationalOn
                        return (
                          <fieldset key={meta.key} className="cms-list-panel__field cms-list-toggles">
                            <legend>
                              {meta.label}
                              {multiple ? (
                                <em>
                                  {locked ? ' Tout le pays' : ` ${picked.length} / ${options.length}`}
                                </em>
                              ) : null}
                            </legend>
                            {locked ? (
                              <p className="cms-list-toggles__hint">
                                National est sur « oui » : les 24 gouvernorats s’allument. Passez à
                                « non » pour cocher une sélection.
                              </p>
                            ) : (
                              <div className="cms-list-toggles__grid" role="group">
                                {options.map((option) => {
                                  const on = picked.some(
                                    (name) => name.toLowerCase() === option.toLowerCase(),
                                  )
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      aria-pressed={on}
                                      className={`cms-list-toggle${on ? ' is-on' : ''}`}
                                      onClick={() => {
                                        if (!multiple) {
                                          patch(option)
                                          return
                                        }
                                        const next = on
                                          ? picked.filter((name) => name !== option)
                                          : [...picked, option]
                                        patch(
                                          options.filter((name) => next.includes(name)).join(', '),
                                        )
                                      }}
                                    >
                                      {meta.optionLabels?.[option] ?? option}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </fieldset>
                        )
                      }
                      if (meta.kind === 'image') {
                        const upload = async (file: File) => {
                          const dataUrl = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader()
                            reader.onload = () => resolve(String(reader.result))
                            reader.onerror = () => reject(reader.error)
                            reader.readAsDataURL(file)
                          })
                          const { data } = await cmsApi.post('/admin/content/upload-image', {
                            dataUrl,
                            filename: file.name,
                          })
                          patch(data.url)
                        }
                        return (
                          <label key={meta.key} className="cms-list-panel__field cms-list-panel__field--image">
                            <span>{meta.label}</span>
                            {current ? (
                              <img
                                className="cms-list-panel__thumb"
                                src={assetUrl(current)}
                                alt=""
                              />
                            ) : null}
                            <input value={current} onChange={(event) => patch(event.target.value)} />
                            <label className="cms-list-panel__upload">
                              Téléverser une image
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) void upload(file)
                                }}
                              />
                            </label>
                          </label>
                        )
                      }
                      return (
                        <label key={meta.key} className="cms-list-panel__field">
                          <span>{meta.label}</span>
                          {meta.multiline ? (
                            <textarea
                              rows={3}
                              value={current}
                              onChange={(event) => patch(event.target.value)}
                            />
                          ) : (
                            <input
                              value={current}
                              onChange={(event) => patch(event.target.value)}
                            />
                          )}
                        </label>
                      )
                    })}
                  </article>
                ))}
                <button type="button" className="cms-list-panel__add" onClick={() => queue([...items, { ...emptyItem }])}>
                  + Ajouter
                </button>
                <button type="button" className="cms-list-panel__done" onClick={() => setOpen(false)}>
                  Terminé
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
