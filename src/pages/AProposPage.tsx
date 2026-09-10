import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  AVENIR,
  COMMENT,
  HERO,
  IMPACT,
  OBJECTIFS,
  PARTENAIRES,
  POURQUOI,
  PROJETS,
  SECTEURS,
  SIX_PROJETS,
  MAP_PICKS,
  TERRITOIRES,
  VISION,
  type Accordion,
} from '../data/apropos'
import { PROJECTS_BY_SLUG } from '../data/projects'
import { APROPOS_BAND_LOGOS } from '../data/logos'
import { ORGS_PLATE, layoutPlateLogos, orgsPlatePathTransform, orgsPlateViewBox, orgsPlateViewBoxSize } from '../data/orgs'
import { MAP_SHAPES, MAP_VIEWBOX } from '../data/tunisia'
import { spreadMapLabels } from '../data/mapLabels'
import Disque from '../components/Disque'
import HeroCarousel from '../components/HeroCarousel'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import { assetUrl } from '../lib/assetUrl'
import './apropos.css'

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

function EditBar({ children }: { children: ReactNode }) {
  const { isEditMode } = useEditMode()
  if (!isEditMode) return null
  return <div className="ap-cms-bar">{children}</div>
}

function fieldValue(projet: { fields: { label: string; value: string[] }[] }, label: string) {
  return projet.fields.find((item) => item.label === label)?.value.join('\n') ?? ''
}

function ficheFallback() {
  return Object.values(PROJETS).map((projet) => ({
    slug: projet.slug,
    name: projet.name,
    tagline: projet.tagline,
    quote: projet.quote,
    summary: projet.summary,
    theme: projet.theme,
    composante: fieldValue(projet, 'COMPOSANTE'),
    partner: fieldValue(projet, 'PARTENAIRE'),
    territory: fieldValue(projet, 'TERRITOIRE'),
    period: fieldValue(projet, 'PÉRIODE'),
  }))
}

const FICHE_FIELDS = [
  { key: 'slug', label: 'Identifiant (ne pas changer)' },
  { key: 'name', label: 'Nom' },
  { key: 'tagline', label: 'Accroche' },
  { key: 'quote', label: 'Citation', multiline: true },
  { key: 'summary', label: 'Description', multiline: true },
  { key: 'theme', label: 'Couleur (thème CSS)' },
  { key: 'composante', label: 'Composante' },
  { key: 'partner', label: 'Partenaire' },
  { key: 'territory', label: 'Territoire', multiline: true },
  { key: 'period', label: 'Période' },
]

function FichesListManager() {
  return (
    <EditableJsonList
      section="projets"
      field="fiches"
      label="Fiches projet"
      wrapItems={false}
      manageLabel="Gérer les fiches projet"
      fallback={ficheFallback()}
      fields={FICHE_FIELDS}
      emptyItem={{
        slug: 'nouveau',
        name: 'NOUVEAU',
        tagline: '',
        quote: '',
        summary: '',
        theme: 'jeuness',
        composante: '',
        partner: '',
        territory: '',
        period: '',
      }}
      renderItem={() => null}
    />
  )
}

function asFiche(slug: string, raw: string) {
  const base = PROJETS[slug]
  const rows = parseJsonRows(raw) || []
  const row = rows.find((item) => String(item.slug) === slug)
  if (!base && !row) return null
  const pick = (key: string, fallback: string) => {
    const raw = row?.[key]
    const text = raw == null ? '' : String(raw).trim()
    return text || fallback
  }
  const lines = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  const name = pick('name', base?.name ?? slug)
  const tagline = pick('tagline', base?.tagline ?? '')
  const quote = pick('quote', base?.quote ?? '')
  const summary = pick('summary', base?.summary ?? '')
  const theme = pick('theme', base?.theme ?? slug)
  const fields = [
    {
      icon: 'composante',
      label: 'COMPOSANTE',
      value: lines(pick('composante', fieldValue(base || { fields: [] }, 'COMPOSANTE'))) || [''],
    },
    {
      icon: 'partenaire',
      label: 'PARTENAIRE',
      value: lines(pick('partner', fieldValue(base || { fields: [] }, 'PARTENAIRE'))) || [''],
    },
    {
      icon: 'territoire',
      label: 'TERRITOIRE',
      value: lines(pick('territory', fieldValue(base || { fields: [] }, 'TERRITOIRE'))) || [''],
    },
    {
      icon: 'periode',
      label: 'PÉRIODE',
      value: lines(pick('period', fieldValue(base || { fields: [] }, 'PÉRIODE'))) || [''],
    },
  ]
  return {
    slug,
    name,
    tagline,
    quote,
    summary,
    theme,
    fields,
  }
}

/* The map's own units, so a shape's centre can place its name as a percentage of the box. */
/**
 * The sheet the comp opens its three overlays in.
 *
 * A project card, the vision's principles and the sectors chart are all drawn the same
 * way: the page dimmed behind, one rounded card over it. They only differ in colour, so
 * the behaviour that makes an overlay usable — escape to leave, a click on the dimmed
 * area to leave, the page behind held still, and focus handed back to whatever opened it
 * — belongs here once rather than three times.
 *
 * It renders into the body rather than into the page. The page resets the margin on every
 * paragraph it contains, which is right for bands laid out to the comp's coordinates and
 * wrong for prose in a card, and being a descendant meant that reset reached in and
 * closed up every gap here. A fixed overlay does not need to sit inside the page to cover
 * it, so it does not.
 */
/* How much of the window is left around a card, and how far it may be taken down to fit.
   The comp's cards are drawn at the page's own scale, where the fiche alone is 873 design
   px tall — on a laptop that is most of the window before the copy inside it is counted,
   which is what put a scrollbar down the side of a card the comp prints whole. */
const SHEET_GUTTER = 24
const SHEET_FLOOR = 0.45

function Sheet({
  label,
  tone,
  onClose,
  children,
}: {
  label: string
  tone: 'pale' | 'pink' | 'chart'
  onClose: () => void
  children: ReactNode
}) {
  const card = useRef<HTMLDivElement>(null)
  const gutter = tone === 'chart' ? 12 : SHEET_GUTTER
  const floor = tone === 'chart' ? 0.62 : SHEET_FLOOR

  /* Fit the card to the window rather than letting it scroll.
     Measured at rest and then zoomed: `zoom` scales the used value of every length inside,
     so one number takes the whole card — type, padding, the plate behind it and the radius
     on its corners — down together, and because it is a layout scale rather than a paint
     one the card is still centred on its real size and stays crisp. Measuring first sets
     the zoom back to 1, which costs a reflow but no paint, since this runs before one. */
  useLayoutEffect(() => {
    const el = card.current
    if (!el) return

    const fit = () => {
      el.style.setProperty('--fit', '1')
      /* Below 1100px the card is a scrolling page, not a scaled desktop drawing. */
      if (window.matchMedia('(max-width: 1099px)').matches) return
      const natural = el.scrollHeight
      if (!natural) return
      const room = window.innerHeight - gutter * 2
      const scale = Math.min(1, room / natural)
      el.style.setProperty('--fit', String(Math.max(floor, Number(scale.toFixed(4)))))
    }

    fit()
    window.addEventListener('resize', fit)
    // An icon or the plate arriving late changes the height the card was measured at.
    const pending = [...el.querySelectorAll('img')].filter((img) => !img.complete)
    pending.forEach((img) => img.addEventListener('load', fit, { once: true }))
    document.fonts.ready.then(fit)

    return () => {
      window.removeEventListener('resize', fit)
      pending.forEach((img) => img.removeEventListener('load', fit))
    }
  }, [floor, gutter])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const { overflow, paddingRight } = document.body.style
    document.body.style.overflow = 'hidden'
    // Replacing the scrollbar's width as padding, so hiding it does not shift the page
    // sideways behind the sheet.
    document.body.style.paddingRight = `${scrollbar}px`
    card.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      opener?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div
      className="sheet"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={card}
        className={`sheet__card sheet__card--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Fermer">
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** The project card: name, pitch, a quote bubble and five drawn fields. */
function ProjetSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { get } = useContent()
  const cta = get('projets.ficheCta', 'Découvrir plus sur')
  const projet = asFiche(slug, get('projets.fiches', JSON.stringify(ficheFallback())))

  if (!projet) {
    const name = APROPOS_BAND_LOGOS.find((f) => f.slug === slug)?.name ?? slug
    return (
      <Sheet label={name} tone="pale" onClose={onClose}>
        <h2 className="fiche__name">{name}</h2>
        <p className="fiche__pending">
          La fiche de ce projet reste à renseigner : le comp n’en détaille qu’un seul.
        </p>
        <Link className="fiche__cta" to={`/projets/${slug}`}>
          <EditableText
            section="projets"
            field="ficheCta"
            fallback="Découvrir plus sur"
            as="span"
            multiline={false}
            label="Bouton des fiches projet"
          >
            {cta}
          </EditableText>{' '}
          {name}
        </Link>
        <EditBar>
          <FichesListManager />
        </EditBar>
      </Sheet>
    )
  }

  return (
    <Sheet label={projet.name} tone="pale" onClose={onClose}>
      <div
        className="fiche"
        data-mark={projet.name}
        data-theme={projet.theme}
        style={
          {
            '--project-colour': `var(--p-${projet.theme})`,
            '--project-text': `var(--p-${projet.theme}-text, var(--p-${projet.theme}))`,
            '--project-soft': `var(--p-${projet.theme}-soft, #f7e7c8)`,
            '--project-on': `var(--p-${projet.theme}-on, var(--white))`,
          } as CSSProperties
        }
      >
        <div className="fiche__head">
          <h2 className="fiche__name">{projet.name}</h2>
          <p className="fiche__tagline">{projet.tagline}</p>
        </div>

        <blockquote className="fiche__quote">
          <span className="fiche__mark" aria-hidden="true">
            “
          </span>
          <p>{projet.quote}</p>
          <span className="fiche__mark fiche__mark--close" aria-hidden="true">
            ”
          </span>
        </blockquote>

        {projet.summary ? <p className="fiche__summary">{projet.summary}</p> : null}

        <dl className="fiche__fields">
          {projet.fields.map((field) => (
            <div key={field.label} className="fiche__field">
              <img src={`/img/icon-${field.icon}.webp`} alt="" aria-hidden="true" />
              <div>
                <dt>{field.label}</dt>
                <dd>
                  {field.value.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <Link className="fiche__cta" to={`/projets/${projet.slug}`}>
          <EditableText
            section="projets"
            field="ficheCta"
            fallback="Découvrir plus sur"
            as="span"
            multiline={false}
            label="Bouton des fiches projet"
          >
            {cta}
          </EditableText>{' '}
          {projet.name.charAt(0) + projet.name.slice(1).toLowerCase()}
          <span aria-hidden="true">»</span>
        </Link>
        <EditBar>
          <FichesListManager />
        </EditBar>
      </div>
    </Sheet>
  )
}

function SecteursSheet({ onClose }: { onClose: () => void }) {
  const { get } = useContent()
  const title = get('impact.chartTitle', SECTEURS.title)
  const featured =
    IMPACT.rows.flat().find((kpi) => kpi.featured) || IMPACT.rows[1][1]
  const headValue = get('impact.chartHeadValue', featured.value)
  const headLabel = get('impact.chartHeadLabel', featured.label.join('\n'))
  const fallbackBars = SECTEURS.bars.map((bar) => ({
    label: bar.label,
    value: String(bar.value),
    color: bar.color,
  }))
  const rows = parseJsonRows(get('impact.secteurs', JSON.stringify(fallbackBars)))
  const bars = (rows?.length ? rows : fallbackBars).map((row, index) => {
    const data = row as Record<string, unknown>
    const fb = fallbackBars[index] || fallbackBars[0]
    return {
      label: String(data.label ?? fb.label),
      value: Number(data.value ?? fb.value),
      color: String(data.color ?? fb.color),
    }
  })
  const max = Math.max(SECTEURS.max, ...bars.map((bar) => bar.value), 1)
  const axis = Array.from({ length: Math.floor(max / 2) + 1 }, (_, i) => max - i * 2)

  return (
    <Sheet label={title} tone="chart" onClose={onClose}>
      <div className="chart">
        <p className="chart__head">
          <strong>{headValue}</strong>
          <span>
            {headLabel.split('\n').filter(Boolean).map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </p>
        <div className="chart__grid">
          <ol className="chart__axis" aria-hidden="true">
            {axis.map((tick) => {
              const tint = SECTEURS.ticks[tick]
              return (
                <li key={tick}>
                  <span
                    className={`chart__tick${tint ? ' chart__tick--lit' : ''}`}
                    style={tint ? { background: tint } : undefined}
                  >
                    {tick}
                  </span>
                </li>
              )
            })}
          </ol>
          <ol className="chart__bars">
            {bars.map((bar) => (
              <li key={bar.label}>
                <span
                  className="chart__bar"
                  style={{
                    height: `${(bar.value / max) * 100}%`,
                    background: bar.color,
                  }}
                />
                <span className="chart__label">{bar.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="chart__title">{title}</p>
      </div>
    </Sheet>
  )
}

/**
 * A heading the comp sets in two weights, where it does.
 *
 * A plain string comes through as itself; a pair gets its first part in Changa 500 and the rest
 * at whatever weight the heading is already set in. See Accordion.kicker for how the comp's own
 * advance widths give the weights away — the PDF's metadata does not.
 */
function TwoWeight({ of }: { of: string | [string, string] }) {
  if (!Array.isArray(of)) return <>{of}</>
  return (
    <>
      <span className="disclosure__lead">{of[0]}</span> {of[1]}
    </>
  )
}

function OrgsPlate({
  logos,
  label,
}: {
  logos: { src: string; alt: string; x: number; y: number; w: number; h: number }[]
  label: string
}) {
  const clipId = useId()
  const plateLogos = layoutPlateLogos(logos).filter((logo) => logo.w > 0 && logo.h > 0)
  const plateFrame = orgsPlateViewBoxSize()
  const plateTransform = orgsPlatePathTransform()

  return (
    <div className="ap-orgs">
      <svg
        className="ap-orgs__plate"
        viewBox={orgsPlateViewBox()}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        style={
          {
            '--plate-aspect-w': plateFrame.width,
            '--plate-aspect-h': plateFrame.height,
          } as CSSProperties
        }
      >
        <defs>
          <clipPath id={clipId}>
            <path d={ORGS_PLATE.path} transform={plateTransform} />
          </clipPath>
        </defs>
        <path fill="#fff" d={ORGS_PLATE.path} transform={plateTransform} />
        <g clipPath={`url(#${clipId})`}>
          {plateLogos.map((logo) => (
            <image
              key={logo.src}
              href={logo.src}
              x={logo.x}
              y={logo.y}
              width={logo.w}
              height={logo.h}
              preserveAspectRatio="xMidYMid meet"
              aria-label={logo.alt}
            />
          ))}
        </g>
      </svg>
      <ul className="ap-orgs__marks" aria-hidden="true">
        {plateLogos.map((logo) => (
          <li key={logo.src}>
            <img src={logo.src} alt="" loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A disclosure list.
 *
 * The comp draws both of its accordions with the row it wants open already open, and
 * prints a chevron on every other row — so every row opens, and each is a real button
 * that reports its own state rather than a heading with a decorative arrow on it.
 */
function Disclosure({
  items,
  variant,
}: {
  items: Accordion[]
  variant: 'objectifs' | 'avenir'
}) {
  const base = useId()
  const [open, setOpen] = useState(variant === 'objectifs' ? 1 : -1)
  const rows = useRef(new Map<number, HTMLDivElement | null>())
  const held = useRef<{ index: number; top: number } | null>(null)

  /* Only one row is open at a time, as the comp shows, so opening one closes another and every
     row below the join moves by the height of the panel that went away — 206px between the two
     rows a reader is most likely to try. The row they pressed ends up somewhere else and the
     heading arrives under their pointer, so the next click drags across it and leaves a
     selection slab over the title. Scrolling by the same amount keeps the pressed row where the
     reader put it and moves the page around it instead. */
  useLayoutEffect(() => {
    const anchor = held.current
    held.current = null
    if (!anchor) return

    const node = rows.current.get(anchor.index)
    if (!node) return

    const drift = node.getBoundingClientRect().top - anchor.top
    if (drift) window.scrollBy(0, drift)
  }, [open])

  const toggle = (index: number) => {
    const node = rows.current.get(index)
    if (node) held.current = { index, top: node.getBoundingClientRect().top }
    setOpen(open === index ? -1 : index)
  }

  return (
    <div className={`disclosure disclosure--${variant}`}>
      {items.map((item, index) => {
        const isOpen = open === index
        const panelId = `${base}-${index}`

        return (
          <div
            key={String(item.title)}
            ref={(node) => {
              rows.current.set(index, node)
            }}
            className={`disclosure__row${isOpen ? ' disclosure__row--open' : ''}`}
          >
            <button
              type="button"
              className="disclosure__head"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
                      <span className="disclosure__titles">
                        {item.kicker && (
                          <span className="disclosure__kicker">
                            <TwoWeight of={item.kicker} />
                          </span>
                        )}
                        <span className="disclosure__title">
                          <TwoWeight of={item.title} />
                        </span>
              </span>
              <span className="disclosure__chev" aria-hidden="true" />
            </button>

            {isOpen && (
              <div className="disclosure__panel" id={panelId}>
                {item.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * The three axes: square tabs above one panel.
 *
 * The comp puts three 136px squares at the top right of the orange card — the open one
 * filled orange with white lettering, the closed two white with orange lettering — and
 * shows only the open axis. Stacking all three as accordion rows, which is what this
 * was, put content on the page that the design deliberately keeps behind a click.
 */
function Axes({ items }: { items: Accordion[] }) {
  const base = useId()
  const [open, setOpen] = useState(0)
  const axis = items[open] ?? items[0]
  if (!axis) return null

  return (
    <div className="axes">
      <div className="axes__tabs" role="tablist" aria-label="Axes du programme">
        {items.map((item, index) => (
          <button
            key={String(item.title)}
            type="button"
            role="tab"
            id={`${base}-tab-${index}`}
            aria-selected={index === open}
            aria-controls={`${base}-panel-${index}`}
            tabIndex={index === open ? 0 : -1}
            className={`axes__tab${index === open ? ' axes__tab--on' : ''}`}
            onClick={() => setOpen(index)}
          >
            <img
              className="axes__icon"
              src={assetUrl(item.icon || `/img/icon-axe-${index + 1}.webp`)}
              alt=""
            />
            <span>{Array.isArray(item.kicker) ? item.kicker.join(' ') : item.kicker}</span>
          </button>
        ))}
      </div>
      <div
        className="axes__panel"
        role="tabpanel"
        id={`${base}-panel-${open}`}
        aria-labelledby={`${base}-tab-${open}`}
      >
        <p className="axes__kicker">
          {Array.isArray(axis.kicker) ? axis.kicker.join(' ') : axis.kicker}
        </p>
        <h3 className="axes__title">
          {Array.isArray(axis.title) ? axis.title.join(' ') : axis.title}
        </h3>
        {axis.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="axes__body">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

/**
 * One photograph on a pale card, with the comp's own pager under it.
 *
 * The comp draws the pager as eight orange rules with the current one thickened, between
 * two large bare chevrons — not dots in circles. Only two photographs ship with the page,
 * so the eight rules still paint (matching the card) and map onto the two by modulo.
 */
/* The comp draws these as one thick stroke with rounded ends and a rounded elbow, 39.1 by 66.7
   in a stroke of about 11. The character ‹ that stood in for it is a typographic guillemet: at
   any weight the font has, it comes out a third of that thickness and half that size, which is
   why the pager read as faint next to the comp's. Inset by half the stroke so the drawing sits
   inside the box the comp measures rather than half a stroke outside it. */
function Chevron({ back }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 39.06 66.67"
      width="3.906rem"
      height="6.667rem"
      fill="none"
      stroke="currentColor"
      strokeWidth="11"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {back ? (
        <path d="M33.56 5.5 5.5 33.335 33.56 61.17" />
      ) : (
        <path d="M5.5 5.5 33.56 33.335 5.5 61.17" />
      )}
    </svg>
  )
}

function Carousel({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0)
  const step = (by: number) => setIndex((i) => (i + by + photos.length) % photos.length)
  const rules = 8

  return (
    <figure className="carousel">
      <img className="carousel__img" src={photos[index].src} alt={photos[index].alt} />
      <figcaption className="carousel__bar">
        <button
          type="button"
          className="carousel__arrow"
          aria-label="Image précédente"
          onClick={() => step(-1)}
        >
          <Chevron back />
        </button>
        <span className="carousel__rules">
          {Array.from({ length: rules }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel__rule${i === index ? ' carousel__rule--on' : ''}`}
              aria-label={`Image ${(i % photos.length) + 1} sur ${photos.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i % photos.length)}
            />
          ))}
        </span>
        <button
          type="button"
          className="carousel__arrow"
          aria-label="Image suivante"
          onClick={() => step(1)}
        >
          <Chevron />
        </button>
      </figcaption>
    </figure>
  )
}

/**
 * The map, and the six projects whose footprints it can show.
 *
 * The comp draws this as a white card on the orange band: the legend across the top, the
 * six project marks down the left with the chosen one in colour behind a blue rule, and
 * the map to the right of them with its lit gouvernorats named on the shapes themselves.
 */
function Footprints() {
  const [chosen, setChosen] = useState(1) // the comp shows Jeun'ESS second in the strip
  const footprint = MAP_PICKS[chosen]
  const { get } = useContent()
  const theme = PROJECTS_BY_SLUG[footprint.slug as keyof typeof PROJECTS_BY_SLUG]?.theme ?? footprint.slug

  return (
    <div
      className="ap-map"
      style={{ '--map-lit': `var(--p-${theme})` } as CSSProperties}
    >
        <div className="ap-map__legend">
        <EditableText
          section="territoires"
          field="legendTitle"
          fallback={TERRITOIRES.legend.title}
          as="h3"
          className="ap-map__title"
          label="Titre de la légende"
        >
          {get('territoires.legendTitle', TERRITOIRES.legend.title)}
        </EditableText>
        <EditableText
          section="territoires"
          field="legendNote"
          fallback={TERRITOIRES.legend.note}
          as="p"
          className="ap-map__note"
          label="Note de la légende"
        >
          {get('territoires.legendNote', TERRITOIRES.legend.note)}
        </EditableText>
      </div>

      <ul className="ap-map__picks">
        {MAP_PICKS.map((item, index) => (
          <li key={item.slug}>
            <button
              type="button"
              aria-pressed={index === chosen}
              title={`Voir les gouvernorats ciblés par ${item.name}`}
              className={`ap-pick${index === chosen ? ' ap-pick--on' : ''}`}
              onClick={() => setChosen(index)}
            >
              <img
                src={`/img/logo-${item.slug}${index === chosen ? '' : '-grey'}.png`}
                alt={item.name}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="ap-map__plate">
        <div className="ap-map__fit">
          <svg
            className="ap-map__svg"
            viewBox={MAP_VIEWBOX}
            role="img"
            aria-label={
              footprint.national
                ? `${footprint.name} : présence sur l'ensemble du territoire`
                : `Gouvernorats ciblés par ${footprint.name} : ${footprint.governorates.join(', ')}`
            }
          >
            {MAP_SHAPES.map((shape, index) => {
              const lit = footprint.national || footprint.governorates.includes(shape.name)
              return (
                <path
                  key={`${shape.name}-${index}`}
                  className={`ap-map__gov${lit ? ' ap-map__gov--on' : ''}`}
                  d={shape.d}
                />
              )
            })}
          </svg>

          {/* Labels sit on the same box as the SVG so % coords match the viewBox 1:1. */}
          {!footprint.national &&
            spreadMapLabels(
              MAP_SHAPES.filter(
                (shape) => shape.label && footprint.governorates.includes(shape.name),
              ),
            ).map((label) => (
              <span
                key={label.name}
                className={`ap-map__label${
                  label.name.length > 11 ? ' ap-map__label--compact' : ''
                }`}
                style={{ left: `${label.x}%`, top: `${label.y}%` }}
              >
                {label.name.toUpperCase()}
              </span>
            ))}
        </div>
      </div>

      <div className="ap-map__readout" aria-live="polite">
        <strong>{footprint.name}</strong>
        <p>
          {footprint.national
            ? 'Présence sur l’ensemble du territoire'
            : footprint.count || 'Gouvernorats à renseigner'}
        </p>
      </div>

      <p className="sr-only" role="status">
        <strong>{footprint.name}</strong>
        {footprint.count ? ` — ${footprint.count}` : ' — gouvernorats à renseigner'}
      </p>
    </div>
  )
}

const rem = (designPx: number) => `${designPx / 10}rem`

/** Comp row ink y 6690-6849 on a propos.pdf p1. */
const AP_LOGO_ROW_Y = 6690
/** Comp runs the row from x 115 to 1805 — 1690 design px of spread. */
const AP_LOGO_ROW_W = 1690
const AP_LOGO_ROW_X = 115

function paragraphs(raw: string, fallback: string[]) {
  // Empty string = CMS still loading for EN/AR — do not flash French fallbacks.
  if (raw === '') return []
  const parts = raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  return parts.length ? parts : fallback
}

function linesOf(raw: string, fallback: string[]) {
  if (raw === '') return []
  const parts = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  return parts.length ? parts : fallback
}

function accFallback(items: Accordion[]) {
  return items.map((item) => ({
    kicker: Array.isArray(item.kicker) ? item.kicker.join(' ') : item.kicker ?? '',
    title: Array.isArray(item.title) ? item.title.join('\n') : item.title,
    body: item.body.join('\n\n'),
  }))
}

function asAccordion(raw: string, fallback: Accordion[]): Accordion[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (!list?.length) return fallback
    return list.map((row, index) => {
      const data = row as Record<string, unknown>
      const fb = fallback[index]
      const kicker = String(
        data.kicker ??
          (Array.isArray(fb?.kicker) ? fb.kicker.join(' ') : fb?.kicker ?? ''),
      )
      const titleRaw = String(
        data.title ?? (Array.isArray(fb?.title) ? fb.title.join('\n') : fb?.title ?? ''),
      )
      const title = titleRaw.includes('\n') ? (titleRaw.split('\n') as [string, string]) : titleRaw
      const body = String(data.body ?? '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
      return {
        ...(kicker ? { kicker } : {}),
        title,
        body: body.length ? body : fb?.body ?? [''],
      }
    })
  } catch {
    return fallback
  }
}

const OBJECTIFS_FALLBACK = accFallback(OBJECTIFS.items)
const COMMENT_FALLBACK = accFallback(COMMENT.items)
const AVENIR_FALLBACK = accFallback(AVENIR.items)
const IMPACT_KPI_FALLBACK = IMPACT.rows.flat().map((kpi) => ({
  value: kpi.value,
  label: kpi.label.join('\n'),
  note: (kpi.note || []).join('\n'),
  featured: kpi.featured ? '1' : '',
}))
const PARTNER_TAB_FALLBACK = PARTENAIRES.tabs.map((tab) => ({
  line1: tab.title[0],
  line2: tab.title[1],
  body: tab.body,
}))
const PHOTO_FALLBACK = POURQUOI.photos.map((photo) => ({ src: photo.src, alt: photo.alt }))
const PRINCIPLE_FALLBACK = VISION.principles.map((text) => ({ text }))
const SECTEUR_FALLBACK = SECTEURS.bars.map((bar) => ({
  label: bar.label,
  value: String(bar.value),
  color: bar.color,
}))

const ACC_FIELDS = [
  { key: 'kicker', label: 'Sur-titre' },
  { key: 'title', label: 'Titre' },
  { key: 'body', label: 'Texte', multiline: true },
]

const AP_HERO_SLIDE_DEFS = [
  { fallback: '/img/home-hero-v2.webp', label: 'Photo 1' },
  { fallback: '/img/apropos-hero-v2.webp', label: 'Photo 2' },
  { fallback: '/img/apropos-atelier.webp', label: 'Photo 3' },
  { fallback: '/img/art-femme-saut.webp', label: 'Photo 4' },
] as const

export default function AProposPage() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const heroTitleLines = linesOf(get('hero.title', HERO.title.join('\n')), HERO.title)
  const pourquoiTitleLines = linesOf(get('pourquoi.title', POURQUOI.title.join('\n')), POURQUOI.title)
  const pourquoiBodyParagraphs = paragraphs(get('pourquoi.body', POURQUOI.body.join('\n\n')), POURQUOI.body)
  const visionTitleLines = linesOf(get('vision.title', VISION.title.join('\n')), VISION.title)
  const visionBodyParagraphs = paragraphs(get('vision.body', VISION.body.join('\n\n')), VISION.body)
  const objectifsTitleLines = linesOf(get('objectifs.title', OBJECTIFS.title), ['OBJECTIFS', 'DU PROGRAMME'])
  const commentTitleLines = linesOf(get('comment.title', COMMENT.title.join('\n')), COMMENT.title)
  const territoiresBodyParagraphs = paragraphs(
    get('territoires.body', TERRITOIRES.body.join('\n\n')),
    TERRITOIRES.body,
  )
  const objectifsItems = asAccordion(get('objectifs.items', JSON.stringify(OBJECTIFS_FALLBACK)), OBJECTIFS.items)
  const commentItems = asAccordion(get('comment.items', JSON.stringify(COMMENT_FALLBACK)), COMMENT.items)
  const avenirItems = asAccordion(get('avenir.items', JSON.stringify(AVENIR_FALLBACK)), AVENIR.items)
  const [tab, setTab] = useState<number | null>(1) // the comp opens on the Tunisian institutions
  const [territoiresOpen, setTerritoiresOpen] = useState(false)
  let partnerTabs = PARTENAIRES.tabs
  try {
    const parsed = JSON.parse(get('partners.tabs', JSON.stringify(PARTNER_TAB_FALLBACK))) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (list?.length) {
      partnerTabs = PARTENAIRES.tabs.map((item, index) => {
        const row = (list[index] || {}) as Record<string, unknown>
        return {
          ...item,
          title: [
            String(row.line1 ?? item.title[0]),
            String(row.line2 ?? item.title[1]),
          ] as [string, string],
          body: String(row.body ?? item.body),
        }
      })
    }
  } catch {
    partnerTabs = PARTENAIRES.tabs
  }
  const partner = tab !== null ? (partnerTabs[tab] ?? partnerTabs[0]) : null

  const isBudgetImpactKpi = (label: string) =>
    /^(BUDGET(\s+TOTAL|\s+GLOBAL)?|TOTAL\s+BUDGET|الميزانية(\s*الإجمالية)?)$/i.test(
      label.replace(/\s+/g, ' ').trim(),
    )

  let impactKpis = IMPACT_KPI_FALLBACK
  try {
    const parsed = JSON.parse(get('impact.items', JSON.stringify(IMPACT_KPI_FALLBACK))) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (list?.length) {
      impactKpis = list
        .map((row, index) => {
          const data = row as Record<string, unknown>
          const fallback = IMPACT_KPI_FALLBACK[index]
          const rawValue = String(data.value ?? '').trim()
          // CMS sometimes stores empty / "0" / "+ 0" placeholders — keep real fallbacks.
          const isPlaceholder = rawValue === '' || /^(\+\s*)?0$/.test(rawValue)
          let label = String(data.label ?? fallback?.label ?? '')
          /* Older FR dumps put “BUDGET TOTAL” on the 2019–2027 period row. */
          if (/^2019\s*[–-]\s*2027$/.test(rawValue) && /BUDGET|TOTAL BUDGET|الميزانية/i.test(label)) {
            label = 'DURÉE DU\nPROGRAMME'
          }
          return {
            value: isPlaceholder && fallback ? fallback.value : rawValue,
            label,
            note: String(data.note ?? fallback?.note ?? ''),
            featured: String(data.featured ?? fallback?.featured ?? ''),
          }
        })
        .filter((kpi) => {
          /* Drop the money KPI only — keep period / other figures. */
          if (/^2019\s*[–-]\s*2027$/.test(kpi.value)) return true
          return !isBudgetImpactKpi(kpi.label)
        })
    }
  } catch {
    impactKpis = IMPACT_KPI_FALLBACK
  }
  const impactRows = [impactKpis.slice(0, 3), impactKpis.slice(3)].filter((row) => row.length)
  const photoRows = parseJsonRows(get('pourquoi.photos', JSON.stringify(PHOTO_FALLBACK)))
  const photos = (photoRows?.length ? photoRows : PHOTO_FALLBACK).map((row, index) => {
    const data = row as Record<string, unknown>
    const fb = PHOTO_FALLBACK[index] || PHOTO_FALLBACK[0]
    return {
      src: String(data.src ?? fb.src),
      alt: String(data.alt ?? fb.alt),
    }
  })
  const principleRows = parseJsonRows(get('vision.principles', JSON.stringify(PRINCIPLE_FALLBACK)))
  const principles = (principleRows?.length ? principleRows : PRINCIPLE_FALLBACK).map((row, index) =>
    String((row as Record<string, unknown>).text ?? PRINCIPLE_FALLBACK[index]?.text ?? ''),
  )
  const visionClosingParagraphs = paragraphs(
    get('vision.closing', VISION.closing.join('\n\n')),
    VISION.closing,
  )

  // The comp's overlays. Only one can be open, so one piece of state carries which.
  const [sheet, setSheet] = useState<
    | { kind: 'projet'; slug: string }
    | { kind: 'chart' }
    | { kind: 'vision' }
    | { kind: 'pourquoi' }
    | null
  >(null)

  return (
    <div className="page page--apropos">
      <CmsSection id="hero" className="ap-hero ap-hero--slider">
        <HeroCarousel
          slideDefs={AP_HERO_SLIDE_DEFS}
          ariaLabel="Photographies du programme"
          emptySlideImage="/img/apropos-hero-v2.webp"
          artClassName="ap-hero__slide-img"
        />
        <div className="ap-hero__copy">
          <div className="ap-hero__intro">
            <EditableText
              section="hero"
              field="badge"
              fallback={HERO.badge}
              as="p"
              className="ap-hero__badge"
              label="Badge"
              render={(text) => <span>{text}</span>}
            />
            <EditableText
              section="hero"
              field="title"
              fallback={HERO.title.join('\n')}
              as="h1"
              className="ap-hero__title"
              label="Titre"
              render={(text) =>
                linesOf(text, HERO.title).map((line) => <span key={line}>{line}</span>)
              }
            />
          </div>
          <div className="ap-hero__actions">
          <Link className="btn btn--photo-line" to="/projets">
            <EditableText
              section="hero"
              field="ctaProjects"
              fallback="Découvrir les projets"
              as="span"
              multiline={false}
              label="Bouton projets"
            />
          </Link>
          <Link className="btn btn--photo-line" to="/opportunites">
            <EditableText
              section="hero"
              field="ctaOpportunities"
              fallback="Voir les opportunités"
              as="span"
              multiline={false}
              label="Bouton opportunités"
            />
          </Link>
          <Link className="btn btn--photo-line" to="/carte">
            <EditableText
              section="hero"
              field="ctaMap"
              fallback="Explorer la carte"
              as="span"
              multiline={false}
              label="Bouton carte"
            />
          </Link>
        </div>
        </div>
      </CmsSection>

      <CmsSection id="pourquoi" className="ap-why">
        <EditBar>
          <EditableJsonList
            section="pourquoi"
            field="photos"
            label="Photos du carrousel"
            wrapItems={false}
            manageLabel="Gérer les photos"
            fallback={PHOTO_FALLBACK}
            fields={[
              { key: 'src', label: 'Image (URL)' },
              { key: 'alt', label: 'Légende' },
            ]}
            emptyItem={{ src: '/img/apropos-atelier.webp', alt: 'Nouvelle photo' }}
            renderItem={() => null}
          />
        </EditBar>
        <EditableText
          section="pourquoi"
          field="title"
          fallback={POURQUOI.title.join('\n')}
          as="h2"
          className="ap-why__title"
          label="Titre"
          render={(text) =>
            linesOf(text, POURQUOI.title).map((line) => <span key={line}>{line}</span>)
          }
        />
        <div className="ap-why__copy">
          {isEditMode ? (
            <EditableText section="pourquoi" field="body" fallback={POURQUOI.body.join('\n\n')} as="p" />
          ) : (
            (pourquoiBodyParagraphs.length ? pourquoiBodyParagraphs : POURQUOI.body)
              .slice(0, 2)
              .map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)
          )}
          <button
            type="button"
            className="readmore__toggle readmore__toggle--dark ap-why__more"
            onClick={() => setSheet({ kind: 'pourquoi' })}
          >
            <EditableText
              section="pourquoi"
              field="more"
              fallback="Lire La suite"
              as="span"
              multiline={false}
              label="Lien lire la suite"
            >
              {get('pourquoi.more', 'Lire La suite') || 'Lire La suite'}
            </EditableText>
          </button>
        </div>
        <div className="ap-why__media">
          <Carousel photos={photos} />
        </div>
      </CmsSection>

      <CmsSection id="impact" className="ap-impact">
        <EditableText
          section="impact"
          field="title"
          fallback={IMPACT.title}
          as="h2"
          className="ap-impact__title"
          label="Titre"
        />
        <EditableText
          section="impact"
          field="body"
          fallback={IMPACT.body}
          as="p"
          className="ap-impact__body"
        />
        <EditBar>
        <EditableJsonList
          section="impact"
          field="items"
          label="Chiffres d’impact"
          wrapItems={false}
          manageLabel="Gérer les chiffres"
          fallback={IMPACT_KPI_FALLBACK}
          fields={[
            { key: 'value', label: 'Chiffre' },
            { key: 'label', label: 'Libellé' },
            { key: 'note', label: 'Note' },
            { key: 'featured', label: 'Ouvre le graphique (mettre 1)' },
          ]}
          emptyItem={{ value: '0', label: 'NOUVEAU', note: '', featured: '' }}
          renderItem={() => null}
        />
          <EditableText
            chipOnly
            section="impact"
            field="chartTitle"
            fallback={SECTEURS.title}
            label="Titre du graphique"
          />
          <EditableJsonList
            section="impact"
            field="secteurs"
            label="Barres du graphique"
            wrapItems={false}
            manageLabel="Gérer le graphique"
            fallback={SECTEUR_FALLBACK}
            fields={[
              { key: 'label', label: 'Libellé' },
              { key: 'value', label: 'Valeur' },
              { key: 'color', label: 'Couleur' },
            ]}
            emptyItem={{ label: 'nouveau', value: '10', color: '#074ea2' }}
            renderItem={() => null}
          />
        </EditBar>
        {impactRows.map((row, i) => (
          <ul key={i} className={`ap-kpis ap-kpis--${row.length}`}>
            {row.map((kpi) => {
              const figure = (
                <>
                  <span className="ap-kpi__value">
                    <CountUp value={kpi.value} />
                  </span>
                  <span className="ap-kpi__label">
                    {kpi.label.split('\n').filter(Boolean).map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  {kpi.note ? (
                    <span className="ap-kpi__note">
                      {kpi.note.split('\n').filter(Boolean).map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  ) : null}
                </>
              )

              return (
                <li
                  key={kpi.value + kpi.label}
                  className={`ap-kpi${kpi.featured === '1' ? ' ap-kpi--featured' : ''}`}
                >
                  {kpi.featured === '1' ? (
                    <button
                      type="button"
                      className="ap-kpi__open"
                      onClick={() => setSheet({ kind: 'chart' })}
                    >
                      {figure}
                      <span className="ap-kpi__hint">
                        <EditableText
                          section="impact"
                          field="chartHint"
                          fallback="Voir les secteurs"
                          as="span"
                          multiline={false}
                          label="Lien du graphique"
                        >
                          {get('impact.chartHint', 'Voir les secteurs')}
                        </EditableText>
                      </span>
                    </button>
                  ) : (
                    figure
                  )}
                </li>
              )
            })}
          </ul>
        ))}
      </CmsSection>


      

      <CmsSection id="vision" className="ap-vision">
        <EditBar>
          <EditableJsonList
            section="vision"
            field="principles"
            label="Principes"
            wrapItems={false}
            manageLabel="Gérer les principes"
            fallback={PRINCIPLE_FALLBACK}
            fields={[{ key: 'text', label: 'Principe', multiline: true }]}
            emptyItem={{ text: 'Nouveau principe' }}
            renderItem={() => null}
          />
        </EditBar>
        <EditableText
          section="vision"
          field="title"
          fallback={VISION.title.join('\n')}
          as="h2"
          className="ap-vision__title"
          label="Titre"
        >
          {visionTitleLines.length >= 2 ? (
            <>
              <span>{visionTitleLines[0]} </span>
              <span className="ap-vision__title-accent">
                {visionTitleLines.slice(1).join(' ')}
              </span>
            </>
          ) : (
            visionTitleLines.map((line, i) => (
              <span key={line} className={i === 1 ? 'ap-vision__title-accent' : undefined}>
                {line}
              </span>
            ))
          )}
        </EditableText>
        <div className="ap-vision__copy">
          <EditableText
            section="vision"
            field="lead"
            fallback={VISION.lead}
            as="p"
            className="ap-vision__lead"
          />
          {isEditMode ? (
            <EditableText
              section="vision"
              field="body"
              fallback={VISION.body.join('\n\n')}
              as="p"
              className="ap-vision__body"
            />
          ) : (
            (visionBodyParagraphs[0] ? [visionBodyParagraphs[0]] : VISION.body.slice(0, 1)).map(
              (paragraph) => (
                <p key={paragraph.slice(0, 24)} className="ap-vision__body">
                  {paragraph}
                </p>
              ),
            )
          )}
          {isEditMode ? (
            <>
              <ol className="ap-vision__list">
                {principles.map((principle) => (
                  <li key={principle.slice(0, 48)}>{principle}</li>
                ))}
              </ol>
              <EditableText
                section="vision"
                field="closing"
                fallback={VISION.closing.join('\n\n')}
                as="p"
                className="ap-vision__body"
                label="Texte de clôture"
              />
            </>
          ) : (
            <button
              type="button"
              className="readmore__toggle readmore__toggle--light"
              onClick={() => setSheet({ kind: 'vision' })}
            >
              <EditableText
                section="vision"
                field="more"
                fallback="Lire La suite"
                as="span"
                multiline={false}
                label="Lien lire la suite"
              >
                {get('vision.more', 'Lire La suite') || 'Lire La suite'}
              </EditableText>
            </button>
          )}
        </div>
      </CmsSection>

      <CmsSection id="objectifs" className="ap-objectifs">
        <EditBar>
          <EditableJsonList
            section="objectifs"
            field="items"
            label="Objectifs"
            wrapItems={false}
            manageLabel="Gérer les objectifs"
            fallback={OBJECTIFS_FALLBACK}
            fields={ACC_FIELDS}
            emptyItem={{ kicker: '', title: 'Nouvel objectif', body: '' }}
            renderItem={() => null}
          />
        </EditBar>
        <EditableText
          section="objectifs"
          field="title"
          fallback={OBJECTIFS.title}
          as="h2"
          className="ap-objectifs__title"
          label="Titre"
        >
          <img src="/img/icon-objectifs.svg" alt="" aria-hidden="true" />
          <span>
            {objectifsTitleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </EditableText>
        <Disclosure items={objectifsItems} variant="objectifs" />
      </CmsSection>

      <CmsSection id="comment" className="ap-comment">
        <EditBar>
          <EditableJsonList
            section="comment"
            field="items"
            label="Axes"
            wrapItems={false}
            manageLabel="Gérer les axes"
            fallback={COMMENT_FALLBACK}
            fields={ACC_FIELDS}
            emptyItem={{ kicker: 'AXE', title: 'Nouvel axe', body: '' }}
            renderItem={() => null}
          />
        </EditBar>
        <EditableText
          section="comment"
          field="title"
          fallback={COMMENT.title.join('\n')}
          as="h2"
          className="ap-comment__title"
          label="Titre"
        >
          {commentTitleLines[0]}
          <br />
          {commentTitleLines[1] ?? ''}
        </EditableText>
        <Axes items={commentItems} />
      </CmsSection>

      <CmsSection id="projets" className="ap-projets">
        <EditBar>
          <FichesListManager />
        </EditBar>
        <h2 className="ap-projets__title">
          <EditableText
            section="projets"
            field="title"
            fallback={SIX_PROJETS.title}
            as="span"
            className="ap-projets__title-main"
            label="Titre"
          >
            {get('projets.title', SIX_PROJETS.title)}
          </EditableText>
          <EditableText
            section="projets"
            field="subtitle"
            fallback={SIX_PROJETS.subtitle}
            as="span"
            className="ap-projets__subtitle"
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
          className="ap-projets__body"
        />
        <ul className="ap-projets__logos">
          {/* The measured cell carries both numbers, and both are needed: the width sets how
              much of the row the mark takes and the ratio sets its height, so the six land on
              the common optical height the comp draws them at rather than at whatever height a
              shared column width happens to give each aspect ratio. */}
          {APROPOS_BAND_LOGOS.map((cell) => (
            <li
              key={cell.slug}
              style={
                {
                  '--cell-x': cell.x,
                  '--cell-w': cell.w,
                  left: `calc((var(--cell-x) - ${AP_LOGO_ROW_X}) * 100% / ${AP_LOGO_ROW_W})`,
                  width: `calc(var(--cell-w) * 100% / ${AP_LOGO_ROW_W})`,
                  top: rem(cell.y - AP_LOGO_ROW_Y),
                  height: rem(cell.h),
                } as CSSProperties
              }
            >
              {/* The comp opens a card over this band rather than leaving the page, so
                  these are buttons. The card itself links through to the project. */}
              <button
                type="button"
                className="ap-logo"
                onClick={() => setSheet({ kind: 'projet', slug: cell.slug })}
              >
                <img
                  className="ap-logo__grey"
                  src={`/img/logo-${cell.slug}-grey.png`}
                  alt=""
                  aria-hidden="true"
                />
                <img className="ap-logo__colour" src={`/img/logo-${cell.slug}.png`} alt="" />
                <span className="sr-only">{cell.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </CmsSection>

      <CmsSection id="territoires" className="ap-territoires">
        {/* Same drawing again, over this band's own seam, and here it also paints across the
            card's top corner. */}
        <Disque className="ap-territoires__disque" />
        <div className="ap-territoires__main">
          <EditableText
            section="territoires"
            field="title"
            fallback={TERRITOIRES.title}
            as="h2"
            className="ap-territoires__title"
            label="Titre"
          >
            {get('territoires.title', TERRITOIRES.title)}
          </EditableText>
          <div className="ap-territoires__copy">
            {isEditMode ? (
              <EditableText
                section="territoires"
                field="body"
                fallback={TERRITOIRES.body.join('\n\n')}
                as="p"
              />
            ) : (
              <>
                {(territoiresBodyParagraphs.length
                  ? territoiresBodyParagraphs
                  : TERRITOIRES.body
                )
                  .slice(0, territoiresOpen ? undefined : 3)
                  .map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                {(territoiresBodyParagraphs.length
                  ? territoiresBodyParagraphs
                  : TERRITOIRES.body
                ).length > 3 ? (
                  <button
                    type="button"
                    className="readmore__toggle readmore__toggle--light"
                    aria-expanded={territoiresOpen}
                    onClick={() => setTerritoiresOpen((open) => !open)}
                  >
                    {territoiresOpen
                      ? get('territoires.less', 'Réduire') || 'Réduire'
                      : get('territoires.more', 'Lire La suite') || 'Lire La suite'}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
        <Footprints />
      </CmsSection>

      <CmsSection id="partners" className="ap-partners">
        <EditableText
          section="partners"
          field="title"
          fallback={PARTENAIRES.title}
          as="h2"
          className="ap-partners__title"
          label="Titre"
        >
          {get('partners.title', PARTENAIRES.title)}
        </EditableText>
        <EditableText
          section="partners"
          field="body"
          fallback={PARTENAIRES.body}
          as="p"
          className="ap-partners__body"
        />
        <EditBar>
          <EditableJsonList
            section="partners"
            field="tabs"
            label="Onglets partenaires"
            wrapItems={false}
            manageLabel="Gérer les onglets"
            fallback={PARTNER_TAB_FALLBACK}
            fields={[
              { key: 'line1', label: 'Ligne 1' },
              { key: 'line2', label: 'Ligne 2' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ line1: 'NOUVEAU', line2: '', body: '' }}
            renderItem={() => null}
          />
        </EditBar>
        <div className={`ap-partners__switch${tab === null ? ' ap-partners__switch--collapsed' : ''}`}>
          <div className="ap-tabs" role="tablist" aria-label="Familles de partenaires">
            {partnerTabs.map((item, i) => (
              <button
                key={item.title.join()}
                type="button"
                role="tab"
                id={`ap-tab-${i}`}
                aria-selected={tab === i}
                aria-controls={tab === null ? undefined : `ap-panel-${i}`}
                tabIndex={tab === i ? 0 : -1}
                className={`ap-tab${tab === i ? ' ap-tab--on' : ''}`}
                onClick={() => setTab(i)}
                onDoubleClick={() => setTab(null)}
              >
                {item.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span className="ap-tab__bar" aria-hidden="true" />
              </button>
            ))}
          </div>
          {tab !== null && partner ? (
          <div
            className="ap-panel"
            role="tabpanel"
            id={`ap-panel-${tab}`}
            aria-labelledby={`ap-tab-${tab}`}
          >
            <p className="ap-panel__body">{partner.body}</p>
            {partner.roles && partner.roles.length > 0 ? (
              <ul className="ap-impl">
                {partner.roles.map((item) => (
                  <li key={item.org} className="ap-impl__card">
                    {item.logo ? (
                      <div className="ap-impl__logo">
                        <img src={item.logo} alt="" />
                      </div>
                    ) : null}
                    <strong className="ap-impl__org">{item.org}</strong>
                    <span className="ap-impl__role">{item.role}</span>
                  </li>
                ))}
              </ul>
            ) : tab === 0 ? (
              <div className="ap-eu">
                <div className="ap-eu__brand">
                  <img
                    className="ap-eu__flags-combo"
                    src="/img/flags-eu-tunisie-partners.jpg"
                    alt="Financé par l'Union européenne — République Tunisienne"
                  />
                  <div className="ap-eu__labels">
                    <span className="ap-eu__label ap-eu__label--eu">
                      Financé par
                      <br />
                      l’Union européenne
                    </span>
                    <span className="ap-eu__label ap-eu__label--tn">
                      République
                      <br />
                      Tunisienne
                    </span>
                  </div>
                </div>
                <div className="ap-eu__copy">
                  <h3>Délégation de l’Union européenne en Tunisie</h3>
                  <p>
                    Elle assure le pilotage stratégique du programme, le suivi de sa mise en
                    œuvre et le dialogue avec les autorités tunisiennes.
                  </p>
                </div>
              </div>
            ) : partner.logos.length > 0 ? (
              <OrgsPlate logos={partner.logos} label={partner.title.join(' ')} />
            ) : null}
          </div>
          ) : null}
        </div>
      </CmsSection>


      

      <CmsSection id="avenir" className="ap-avenir">
        <EditBar>
          <EditableJsonList
            section="avenir"
            field="items"
            label="Accordéons"
            wrapItems={false}
            manageLabel="Gérer les volets"
            fallback={AVENIR_FALLBACK}
            fields={ACC_FIELDS}
            emptyItem={{ kicker: '', title: 'Nouveau volet', body: '' }}
            renderItem={() => null}
          />
        </EditBar>
        <EditableText
          section="avenir"
          field="title"
          fallback={AVENIR.title.join('\n')}
          as="h2"
          className="ap-avenir__title"
          label="Titre"
          render={(text) => {
            const lines = linesOf(text, AVENIR.title)
            let titleLines: string[]
            if (lines.length >= 2) titleLines = [lines[0], lines.slice(1).join(' ')]
            else {
              const joined = lines.join(' ').trim()
              if (!joined) titleLines = [...AVENIR.title]
              else {
                const match =
                  joined.match(/^(.*?VERS)\s+(.+)$/i) || joined.match(/^(.*?TOWARD)\s+(.+)$/i)
                titleLines = match ? [match[1], match[2]] : [joined]
              }
            }
            return titleLines.map((line) => <span key={line}>{line}</span>)
          }}
        />
        <EditableText
          section="avenir"
          field="body"
          fallback={AVENIR.body}
          as="p"
          className="ap-avenir__body"
        />
        <Disclosure items={avenirItems} variant="avenir" />
        <div className="ap-avenir__art-slot">
          <EditableImage
            section="avenir"
            field="image"
            fallback="/img/apropos-panneaux-v3.webp"
            className="ap-avenir__art"
          />
        </div>
      </CmsSection>

      {sheet?.kind === 'projet' && (
        <ProjetSheet slug={sheet.slug} onClose={() => setSheet(null)} />
      )}
      {sheet?.kind === 'chart' && <SecteursSheet onClose={() => setSheet(null)} />}
      {sheet?.kind === 'vision' && (
        <Sheet label={visionTitleLines.join(' ')} tone="pink" onClose={() => setSheet(null)}>
          <div className="creed">
            <h2 className="creed__title">
              {visionTitleLines.map((line, i) => (
                <span key={line} className={i === 1 ? 'creed__title-accent' : undefined}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="creed__lead">{get('vision.lead', VISION.lead)}</p>
            {visionBodyParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="creed__body">
                {paragraph}
              </p>
            ))}
            <ul className="creed__list">
              {principles.map((principle) => (
                <li key={principle.slice(0, 24)}>{principle}</li>
              ))}
            </ul>
            {visionClosingParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="creed__body">
                {paragraph}
              </p>
            ))}
            <EditBar>
              <EditableText
                chipOnly
                section="vision"
                field="closing"
                fallback={VISION.closing.join('\n\n')}
                label="Texte de clôture"
              />
            </EditBar>
          </div>
        </Sheet>
      )}
      {sheet?.kind === 'pourquoi' && (
        <Sheet label={pourquoiTitleLines.join(' ')} tone="pale" onClose={() => setSheet(null)}>
          <div className="creed creed--pale">
            <h2 className="creed__title">
              {pourquoiTitleLines.map((line, i) => (
                <span key={line} className={i === 0 ? 'creed__title-accent' : undefined}>
                  {line}
                </span>
              ))}
            </h2>
            {[...(pourquoiBodyParagraphs.length ? pourquoiBodyParagraphs : POURQUOI.body)].map(
              (paragraph) => (
                <p key={paragraph.slice(0, 24)} className="creed__body">
                  {paragraph}
                </p>
              ),
            )}
            <EditBar>
              <EditableText
                chipOnly
                section="pourquoi"
                field="body"
                fallback={POURQUOI.body.join('\n\n')}
                label="Texte complet Pourquoi"
              />
            </EditBar>
          </div>
        </Sheet>
      )}
    </div>
  )
}
