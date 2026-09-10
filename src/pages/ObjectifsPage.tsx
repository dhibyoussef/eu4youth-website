import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { COMMENT, OBJECTIFS, SIX_PROJETS, VISION, type Accordion } from '../data/apropos'
import { BAND_LOGOS } from '../data/logos'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './objectifs.css'

const COMPOSANTES_FALLBACK = [
  {
    code: 'C1',
    title: 'Emploi, employabilité et entrepreneuriat',
    links: "jeuness|Jeun'ESS\ngo4youth|GO4Youth\nswafy|SWAFY\nirada4youth|IRADA4YOUTH",
  },
  {
    code: 'C2',
    title: "Culture et sport pour l'inclusion",
    links: "maghroumin|Maghroum'IN",
  },
  {
    code: 'C3',
    title: 'Politiques publiques et participation des jeunes',
    links: 'fe3ila|Fe3il.a',
  },
]

const ACC_FIELDS = [
  { key: 'kicker', label: 'Sur-titre' },
  { key: 'title', label: 'Titre', multiline: true },
  { key: 'body', label: 'Texte', multiline: true },
]

const AXE_FIELDS = [
  ...ACC_FIELDS,
  { key: 'icon', label: 'Icône (ex. /img/icon-axe-1.webp)' },
]

function parseJsonRows(raw: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    return list as Record<string, unknown>[] | null
  } catch {
    return null
  }
}

function ListDock({ children }: { children: ReactNode }) {
  return <div className="obj-edit-region">{children}</div>
}

function paragraphs(raw: string, fallback: string[]) {
  const parts = raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  return parts.length ? parts : fallback
}

function linesOf(raw: string, fallback: string[]) {
  const parts = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  return parts.length ? parts : fallback
}

function accFallback(items: Accordion[]) {
  return items.map((item) => ({
    kicker: Array.isArray(item.kicker) ? item.kicker.join(' ') : item.kicker ?? '',
    title: Array.isArray(item.title) ? item.title.join('\n') : item.title,
    body: item.body.join('\n\n'),
    icon: item.icon ?? '',
  }))
}

function pairOf(value: string): string | [string, string] {
  if (value.includes('\n')) {
    const [first, ...rest] = value.split('\n')
    return rest.length ? [first, rest.join(' ')] : value
  }
  const match = value.match(/^(OBJECTIF)\s+(.+)$/i)
  return match ? [match[1], match[2]] : value
}

function asAccordion(raw: string, fallback: Accordion[]): Accordion[] {
  const list = parseJsonRows(raw)
  if (!list?.length) return fallback
  return list.map((row, index) => {
    const fb = fallback[index]
    const kickerRaw = String(
      row.kicker ?? (Array.isArray(fb?.kicker) ? fb.kicker.join(' ') : fb?.kicker ?? ''),
    ).trim()
    const titleRaw = String(
      row.title ?? (Array.isArray(fb?.title) ? fb.title.join('\n') : fb?.title ?? ''),
    )
    const body = String(row.body ?? '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    return {
      ...(kickerRaw ? { kicker: pairOf(kickerRaw) } : {}),
      title: pairOf(titleRaw),
      body: body.length ? body : fb?.body ?? [''],
      icon: String(row.icon || fb?.icon || `/img/icon-axe-${index + 1}.webp`),
    }
  })
}

function parseLinks(raw: string) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [slug, ...rest] = line.split('|')
      return { slug: slug.trim(), name: rest.join('|').trim() || slug.trim() }
    })
}

const OBJECTIFS_FALLBACK = accFallback(OBJECTIFS.items)
const COMMENT_FALLBACK = accFallback(COMMENT.items).map((item, index) => ({
  ...item,
  icon: `/img/icon-axe-${index + 1}.webp`,
}))
const PRINCIPLE_FALLBACK = VISION.principles.map((text) => ({ text }))
const LOGO_FALLBACK = BAND_LOGOS.map((cell) => ({
  slug: cell.slug,
  name: cell.name,
  grey: `/img/logo-${cell.slug}-grey.png`,
  color: `/img/logo-${cell.slug}.png`,
}))

function TwoWeight({ value }: { value: string | [string, string] }) {
  if (!Array.isArray(value)) return <>{value}</>
  return (
    <>
      <span className="obj-objective__lead">{value[0]}</span> {value[1]}
    </>
  )
}

function ObjectivesList({ items }: { items: Accordion[] }) {
  const base = useId()
  const [open, setOpen] = useState(1)

  return (
    <div className="obj-objectives__list">
      {items.map((item, index) => {
        const expanded = open === index
        const panelId = `${base}-objective-${index}`

        return (
          <article
            key={`${String(item.title)}-${index}`}
            className={`obj-objective${expanded ? ' obj-objective--open' : ''}`}
          >
            <button
              type="button"
              className="obj-objective__button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? -1 : index)}
            >
              <span className="obj-objective__labels">
                {item.kicker && (
                  <span className="obj-objective__kicker">
                    <TwoWeight value={item.kicker} />
                  </span>
                )}
                <span className="obj-objective__title">
                  <TwoWeight value={item.title} />
                </span>
              </span>
              <span className="obj-objective__chevron" aria-hidden="true" />
            </button>

            {expanded && (
              <div className="obj-objective__panel" id={panelId}>
                {item.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function Axes({ items }: { items: Accordion[] }) {
  const base = useId()
  const [selected, setSelected] = useState(0)
  const current = items[selected] ?? items[0]
  if (!current) return null

  const selectFromKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else return

    event.preventDefault()
    setSelected(next)
    document.getElementById(`${base}-axis-tab-${next}`)?.focus()
  }

  return (
    <div className="obj-axes">
      <div className="obj-axes__tabs" role="tablist" aria-label="Axes du programme">
        {items.map((item, index) => (
          <button
            key={`${String(item.title)}-${index}`}
            type="button"
            role="tab"
            id={`${base}-axis-tab-${index}`}
            aria-selected={index === selected}
            aria-controls={`${base}-axis-panel-${index}`}
            tabIndex={index === selected ? 0 : -1}
            className={`obj-axes__tab${index === selected ? ' obj-axes__tab--active' : ''}`}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => selectFromKey(event, index)}
          >
            <img
              className="obj-axes__icon"
              src={assetUrl(item.icon || `/img/icon-axe-${index + 1}.webp`)}
              alt=""
              aria-hidden="true"
            />
            <span>{Array.isArray(item.kicker) ? item.kicker.join(' ') : item.kicker}</span>
          </button>
        ))}
      </div>

      <div
        className="obj-axes__panel"
        role="tabpanel"
        id={`${base}-axis-panel-${selected}`}
        aria-labelledby={`${base}-axis-tab-${selected}`}
      >
        <p className="obj-axes__kicker">
          {Array.isArray(current.kicker) ? current.kicker.join(' ') : current.kicker}
        </p>
        <h3>{Array.isArray(current.title) ? current.title.join(' ') : current.title}</h3>
        {current.body.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="obj-axes__body">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function ObjectifsPage() {
  const { get } = useContent()
  const titleLines = linesOf(get('hero.title', 'OBJECTIFS DU PROGRAMME'), ['OBJECTIFS DU PROGRAMME'])
  const visionLines = linesOf(get('hero.vision', 'UNE VISION COMMUNE'), ['UNE VISION COMMUNE'])
  const extraParagraphs = paragraphs(get('hero.visionBody', VISION.body.join('\n\n')), VISION.body)
  const closingParagraphs = paragraphs(get('hero.closing', VISION.closing.join('\n\n')), VISION.closing)
  const objectiveTitleLines = linesOf(get('objectives.title', 'OBJECTIFS\nDU PROGRAMME'), ['OBJECTIFS', 'DU PROGRAMME'])
  const actionTitleLines = linesOf(get('action.title', 'COMMENT\nLE PROGRAMME AGIT'), COMMENT.title)
  const objectifItems = asAccordion(get('objectives.items', JSON.stringify(OBJECTIFS_FALLBACK)), OBJECTIFS.items)
  const axeItems = asAccordion(get('action.items', JSON.stringify(COMMENT_FALLBACK)), COMMENT.items)
  const composanteRows = parseJsonRows(get('projets.composantes', JSON.stringify(COMPOSANTES_FALLBACK)))
  const composantes = (composanteRows?.length ? composanteRows : COMPOSANTES_FALLBACK).map((row) => ({
    code: String(row.code || ''),
    title: String(row.title || ''),
    projects: parseLinks(String(row.links || '')),
  }))
  const cta = get('projets.cta', 'Découvrir les projets')
  const logoRows = parseJsonRows(get('projets.logos', JSON.stringify(LOGO_FALLBACK)))
  const logos = (logoRows?.length ? logoRows : LOGO_FALLBACK).map((row) => {
    const slug = String(row.slug || '')
    const geometry = BAND_LOGOS.find((cell) => cell.slug === slug) || BAND_LOGOS[0]
    return {
      slug,
      name: String(row.name || geometry?.name || slug),
      w: geometry?.w ?? 199,
      h: geometry?.h ?? 97,
      grey: assetUrl(String(row.grey || `/img/logo-${slug}-grey.png`)),
      color: assetUrl(String(row.color || `/img/logo-${slug}.png`)),
    }
  })

  return (
    <div className="page page--objectifs">
      <CmsSection id="hero" className="obj-hero" labelledBy="obj-title">
        <div className="obj-hero__copy">
          <EditableText
            section="hero"
            field="badge"
            fallback="LE PROGRAMME EU4YOUTH"
            as="p"
            className="obj-hero__eyebrow"
            label="Badge"
          />
          <EditableText
            section="hero"
            field="title"
            fallback="OBJECTIFS DU PROGRAMME"
            as="h1"
            id="obj-title"
            className="obj-hero__title"
            label="Titre"
          >
            {titleLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < titleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </EditableText>
          <EditableText
            section="hero"
            field="vision"
            fallback="UNE VISION COMMUNE"
            as="h2"
            className="obj-hero__vision"
            label="Vision"
          >
            {visionLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < visionLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </EditableText>
          <EditableText
            section="hero"
            field="visionBody"
            fallback={VISION.body.join('\n\n')}
            as="div"
            className="obj-hero__body"
            label="Texte vision"
          >
            {extraParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </EditableText>
        </div>

        <EditableJsonList
          section="hero"
          field="principles"
          label="Principes"
          className="obj-hero__principles"
          wrapItems={false}
          manageLabel="Gérer les principes"
          fallback={PRINCIPLE_FALLBACK}
          fields={[{ key: 'text', label: 'Principe', multiline: true }]}
          emptyItem={{ text: '' }}
          renderItem={(item) => <li>{item.text}</li>}
        />

        <EditableText
          section="hero"
          field="closing"
          fallback={VISION.closing.join('\n\n')}
          as="div"
          className="obj-hero__closing"
          label="Clôture"
        >
          {closingParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="objectives" className="obj-objectives" labelledBy="obj-objectives-title">
        <h2 className="obj-objectives__heading" id="obj-objectives-title">
          <span className="obj-icon-edit">
            <EditableImage
              section="objectives"
              field="icon"
              fallback="/img/icon-objectifs.svg"
              className="obj-objectives__icon"
              alt=""
            />
          </span>
          <EditableText
            section="objectives"
            field="title"
            fallback={'OBJECTIFS\nDU PROGRAMME'}
            as="span"
            label="Titre"
          >
            {objectiveTitleLines[0]}
            <br />
            {objectiveTitleLines[1] ?? ''}
          </EditableText>
        </h2>
        <ListDock>
          <EditableJsonList
            section="objectives"
            field="items"
            label="Objectifs"
            className="obj-list-cms"
            wrapItems={false}
            manageLabel="Gérer les objectifs"
            fallback={OBJECTIFS_FALLBACK}
            fields={ACC_FIELDS}
            emptyItem={{ kicker: 'OBJECTIF SPÉCIFIQUE', title: 'Nouvel objectif', body: '', icon: '' }}
            renderItem={() => null}
          />
          <ObjectivesList items={objectifItems} />
        </ListDock>
      </CmsSection>

      <CmsSection id="action" className="obj-action" labelledBy="obj-action-title">
        <EditableText
          section="action"
          field="title"
          fallback={'COMMENT\nLE PROGRAMME AGIT'}
          as="h2"
          id="obj-action-title"
          label="Titre"
        >
          {actionTitleLines[0]}
          <br />
          {actionTitleLines[1] ?? ''}
        </EditableText>
        <div className="obj-action__manage">
          <EditableJsonList
            section="action"
            field="items"
            label="Axes"
            className="obj-action-cms"
            wrapItems={false}
            manageLabel="Gérer les axes"
            fallback={COMMENT_FALLBACK}
            fields={AXE_FIELDS}
            emptyItem={{ kicker: 'AXE', title: 'Nouvel axe', body: '', icon: '/img/icon-axe-1.webp' }}
            renderItem={() => null}
          />
        </div>
        <Axes items={axeItems} />
      </CmsSection>

      <CmsSection id="projets" className="obj-projets" labelledBy="obj-projets-title">
        <h2 className="obj-projets__title" id="obj-projets-title">
          <EditableText
            section="projets"
            field="title"
            fallback={SIX_PROJETS.title}
            as="span"
            label="Titre"
          >
            {get('projets.title', SIX_PROJETS.title)}
          </EditableText>
          <EditableText
            section="projets"
            field="subtitle"
            fallback={SIX_PROJETS.subtitle}
            as="span"
            className="obj-projets__subtitle"
            label="Sous-titre"
          >
            {get('projets.subtitle', SIX_PROJETS.subtitle)}
          </EditableText>
        </h2>
        <EditableText
          section="projets"
          field="body"
          fallback={SIX_PROJETS.body}
          as="p"
          className="obj-projets__body"
          label="Texte"
        />

        <ListDock>
          <EditableJsonList
            section="projets"
            field="logos"
            label="Logos"
            className="obj-list-cms"
            wrapItems={false}
            manageLabel="Gérer les logos"
            fallback={LOGO_FALLBACK}
            fields={[
              { key: 'slug', label: 'Identifiant' },
              { key: 'name', label: 'Nom' },
              { key: 'grey', label: 'Logo gris' },
              { key: 'color', label: 'Logo couleur' },
            ]}
            emptyItem={{ slug: 'nouveau', name: 'Nouveau', grey: '', color: '' }}
            renderItem={() => null}
          />
          <ul className="obj-projets__logos">
            {logos.map((cell) => (
              <li key={cell.slug} style={{ width: `${cell.w / 10}rem`, aspectRatio: `${cell.w} / ${cell.h}` }}>
                <Link className="obj-logo" to={`/projets/${cell.slug}`}>
                  <img className="obj-logo__grey" src={cell.grey} alt="" aria-hidden="true" />
                  <img className="obj-logo__colour" src={cell.color} alt="" />
                  <span className="sr-only">{cell.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ListDock>

        <ListDock>
          <EditableJsonList
            section="projets"
            field="composantes"
            label="Composantes"
            className="obj-list-cms"
            wrapItems={false}
            manageLabel="Gérer les composantes"
            fallback={COMPOSANTES_FALLBACK}
            fields={[
              { key: 'code', label: 'Code' },
              { key: 'title', label: 'Titre' },
              { key: 'links', label: 'Projets (slug|nom, une ligne chacun)', multiline: true },
            ]}
            emptyItem={{ code: 'C', title: '', links: 'slug|Nom' }}
            renderItem={() => null}
          />
          <div className="obj-composantes" aria-label="Composantes thématiques">
            {composantes.map((item) => (
              <article key={item.code} className="obj-composante">
                <p className="obj-composante__code">{item.code}</p>
                <h3>{item.title}</h3>
                <ul>
                  {item.projects.map((project) => (
                    <li key={project.slug}>
                      <Link to={`/projets/${project.slug}`}>{project.name}</Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ListDock>

        <Link to="/projets" className="btn btn--fill-blue obj-projets__cta">
          <EditableText
            section="projets"
            field="cta"
            fallback="Découvrir les projets"
            as="span"
            multiline={false}
            label="Bouton"
          >
            {cta}
          </EditableText>{' '}
          <span aria-hidden="true">»</span>
        </Link>
      </CmsSection>
    </div>
  )
}
