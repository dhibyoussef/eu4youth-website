import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { INTERVENTIONS as INTERVENTIONS_FALLBACK, type Intervention } from '../data/interventions'
import { PROJECTS as PROJECTS_FALLBACK } from '../data/projects'
import { getCarteMapLabels, getTooltipPlacement, MAP_LABEL_STYLES } from '../data/mapLabels'
import { MAP_SHAPES, MAP_VIEWBOX } from '../data/tunisia'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './carte.css'

const PAGE_SIZE = 12

const GRAND_TUNIS = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'] as const

const STAT_FALLBACK = [
  { id: 'covered', label: 'Gouvernorats couverts' },
  { id: 'structures', label: 'Structures bénéficiaires' },
  { id: 'projects', label: 'Projets EU4Youth' },
  { id: 'sectors', label: "Secteurs d'activité représentés" },
  { id: 'total', label: "Total d'interventions territoriales" },
]

const LEGEND_FALLBACK = [
  { id: 'none', label: '0 intervention' },
  { id: 't1', label: '0 à 20' },
  { id: 't2', label: '20 à 40' },
  { id: 't3', label: '40 à 60' },
  { id: 't4', label: 'Plus de 60' },
]

const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')

const coversGovernorate = (item: Intervention, shapeName: string) =>
  item.governorate === shapeName ||
  (item.governorate === 'Grand Tunis' &&
    (GRAND_TUNIS as readonly string[]).includes(shapeName))

const matchesGovernorateFilter = (item: Intervention, selected: string) =>
  !selected ||
  item.governorate === selected ||
  (selected !== 'Présence nationale' && coversGovernorate(item, selected))

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`

const MAP_LABEL_SHORT: Partial<Record<string, string>> = {
  'Ben Arous': 'BEN AR',
}

const formatGovLabel = (name: string) =>
  (MAP_LABEL_SHORT[name] ?? name.toUpperCase()).replace(/\s+/g, '\u00A0')

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

function ListDock({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`map-edit-region ${className}`.trim()}>{children}</div>
}

function Pencil({
  section,
  field,
  fallback,
  label,
}: {
  section: string
  field: string
  fallback: string
  label?: string
}) {
  return (
    <EditableText
      chipOnly
      className="map-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function withTokens(template: string, tokens: Record<string, string | number>) {
  return Object.entries(tokens).reduce(
    (value, [key, token]) => value.replaceAll(`{${key}}`, String(token)),
    template,
  )
}

export default function CartePage() {
  const { get } = useContent()
  const INTERVENTIONS = useCatalog<Intervention>('initiatives', INTERVENTIONS_FALLBACK)
  const PROJECTS = useCatalog('projects', PROJECTS_FALLBACK)
  const [projectSlug, setProjectSlug] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [nature, setNature] = useState('')
  const [sector, setSector] = useState('')
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  useEffect(() => {
    if (selectedId == null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [selectedId])

  const emptyLabel = get('filters.unstated', 'Non renseigné')
  const allLabel = get('filters.all', 'Tous')
  const allProjects = get('filters.allProjects', 'Tous les projets')
  const allGovernorates = get('filters.allGovernorates', 'Tous les gouvernorats')
  const resetLabel = get('filters.reset', 'Réinitialiser Les Filtres')
  const ficheOne = get('map.ficheOne', 'fiche territoriale')
  const ficheMany = get('map.ficheMany', 'fiches territoriales')

  const statRows = parseJsonRows(get('filters.stats', JSON.stringify(STAT_FALLBACK)))
  const stats = (statRows?.length ? statRows : STAT_FALLBACK).map((row, index) => ({
    id: String(row.id || STAT_FALLBACK[index]?.id || ''),
    label: String(row.label || STAT_FALLBACK[index]?.label || ''),
  }))

  const legendRows = parseJsonRows(get('map.legend', JSON.stringify(LEGEND_FALLBACK)))
  const legend = (legendRows?.length ? legendRows : LEGEND_FALLBACK).map((row, index) => ({
    id: String(row.id || LEGEND_FALLBACK[index]?.id || ''),
    label: String(row.label || LEGEND_FALLBACK[index]?.label || ''),
  }))

  const displayField = (value: string) => (value.trim() ? value : emptyLabel)

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query.trim())
    return INTERVENTIONS.filter(
      (item) =>
        (!projectSlug || item.projectSlug === projectSlug) &&
        matchesGovernorateFilter(item, governorate) &&
        (!nature ||
          (nature === emptyLabel
            ? !item.nature || !item.nature.trim()
            : item.nature === nature)) &&
        (!sector ||
          (sector === emptyLabel
            ? !item.sector || !item.sector.trim()
            : item.sector === sector)) &&
        (!needle ||
          normalizeSearch(
            `${item.name} ${item.project} ${item.governorate} ${item.locality}`,
          ).includes(needle)),
    )
  }, [INTERVENTIONS, emptyLabel, governorate, nature, projectSlug, query, sector])

  const intensity = useMemo(
    () =>
      Object.fromEntries(
        MAP_SHAPES.map((shape) => [
          shape.name,
          filtered.filter((item) => coversGovernorate(item, shape.name)).length,
        ]),
      ) as Record<string, number>,
    [filtered],
  )

  const covered = MAP_SHAPES.filter((shape) => intensity[shape.name] > 0).length
  const projectCount = useMemo(
    () => new Set(filtered.map((item) => item.projectSlug)).size,
    [filtered],
  )
  const sectorCount = useMemo(
    () => new Set(filtered.map((item) => item.sector).filter(Boolean)).size,
    [filtered],
  )
  const selectedGovernorate = hovered || governorate
  const selectedCount = selectedGovernorate ? intensity[selectedGovernorate] : 0
  const tooltipPlacement = useMemo(
    () => (selectedGovernorate ? getTooltipPlacement(selectedGovernorate) : null),
    [selectedGovernorate],
  )
  const mapLabels = useMemo(
    () =>
      getCarteMapLabels(
        MAP_SHAPES.filter((shape) => !MAP_LABEL_STYLES[shape.name]?.hide),
      ),
    [],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selectedIntervention =
    selectedId === null
      ? null
      : INTERVENTIONS.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    setPage(1)
    setSelectedId(null)
  }, [governorate, nature, projectSlug, query, sector])

  const natureOptions = useMemo(() => {
    const distinct = [
      ...new Set(
        INTERVENTIONS.map((item) => item.nature?.trim()).filter(
          (value): value is string => Boolean(value),
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, 'fr'))

    const hasEmpty = INTERVENTIONS.some((item) => !item.nature || !item.nature.trim())
    return hasEmpty ? [emptyLabel, ...distinct] : distinct
  }, [INTERVENTIONS, emptyLabel])

  const sectorOptions = useMemo(() => {
    const distinct = [
      ...new Set(
        INTERVENTIONS.map((item) => item.sector?.trim()).filter(
          (value): value is string => Boolean(value),
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, 'fr'))

    const hasEmpty = INTERVENTIONS.some((item) => !item.sector || !item.sector.trim())
    return hasEmpty ? [emptyLabel, ...distinct] : distinct
  }, [INTERVENTIONS, emptyLabel])

  const reset = () => {
    setProjectSlug('')
    setGovernorate('')
    setNature('')
    setSector('')
    setQuery('')
    setHovered('')
    setSelectedId(null)
    setPage(1)
  }

  const exportFiltered = () => {
    const rows = [
      ['Nom', 'Projet', 'Gouvernorat', 'Localité', 'Type', 'Secteur'],
      ...filtered.map((item) => [
        item.name,
        item.project,
        item.governorate,
        item.locality,
        item.nature,
        item.sector,
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'eu4youth-initiatives-filtrees.csv'
    link.click()
    URL.revokeObjectURL(href)
  }

  const intensityClass = (count: number) => {
    if (count <= 0) return 'map-page__gov--none'
    if (count <= 20) return 'map-page__gov--t1'
    if (count <= 40) return 'map-page__gov--t2'
    if (count <= 60) return 'map-page__gov--t3'
    return 'map-page__gov--t4'
  }

  const projectStyle = (intervention: Intervention) => {
    const project = PROJECTS.find((item) => item.slug === intervention.projectSlug)
    return {
      '--project-colour': `var(--p-${project?.theme ?? 'blue'})`,
      '--project-text': `var(--p-${project?.theme ?? 'blue'}-text, var(--eu-blue))`,
    } as CSSProperties
  }

  const statValue = (id: string) => {
    if (id === 'covered') return covered
    if (id === 'structures') return filtered.length
    if (id === 'projects') return projectCount
    if (id === 'sectors') return sectorCount
    return filtered.length
  }

  return (
    <div className="page page--carte">
      <CmsSection id="hero" className="map-hero" labelledBy="map-title">
        <div className="map-hero__art" aria-hidden="true">
          <img src="/img/carte-gemini.jpg" alt="" />
        </div>
        <div className="map-hero__copy">
          <EditableText
            section="hero"
            field="badge"
            fallback={'CARTOGRAPHIE\nDES INTERVENTIONS TERRITORIALES'}
            as="p"
            className="map-hero__badge"
            label="Badge"
          />
          <EditableText
            section="hero"
            field="title"
            fallback="EU4YOUTH"
            as="h1"
            id="map-title"
            className="map-hero__title"
            label="Titre"
          />
        </div>
      </CmsSection>

      <section className="map-dashboard" aria-labelledby="map-dashboard-title">
        <div className="map-dashboard__aside">
        <CmsSection id="filters" className="map-controls" as="div" labelledBy="map-dashboard-title">
          <h2 id="map-dashboard-title" className="sr-only">
            Filtrer la carte
          </h2>

          <label className="map-filter map-filter--project">
            <span>
              {get('filters.project', 'Projet EU4Youth')}
              <Pencil section="filters" field="project" fallback="Projet EU4Youth" label="Filtre projet" />
              <Pencil section="filters" field="allProjects" fallback={allProjects} label="Tous les projets" />
            </span>
            <select value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)}>
              <option value="">{allProjects}</option>
              {PROJECTS.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.acronym}
                </option>
              ))}
            </select>
          </label>

          <label className="map-filter map-filter--partner">
            <span>
              {get('filters.nature', 'Nature du bénéficiaire / partenaire')}
              <Pencil
                section="filters"
                field="nature"
                fallback="Nature du bénéficiaire / partenaire"
                label="Filtre nature"
              />
              <Pencil section="filters" field="all" fallback="Tous" label="Option Tous" />
              <Pencil section="filters" field="unstated" fallback={emptyLabel} label="Non renseigné" />
            </span>
            <select value={nature} onChange={(event) => setNature(event.target.value)}>
              <option value="">{allLabel}</option>
              {natureOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="map-filter map-filter--governorate">
            <span>
              {get('filters.governorate', 'Gouvernorat')}
              <Pencil section="filters" field="governorate" fallback="Gouvernorat" label="Filtre gouvernorat" />
              <Pencil
                section="filters"
                field="allGovernorates"
                fallback={allGovernorates}
                label="Tous les gouvernorats"
              />
            </span>
            <select value={governorate} onChange={(event) => setGovernorate(event.target.value)}>
              <option value="">{allGovernorates}</option>
              {MAP_SHAPES.map((shape) => (
                <option key={shape.name} value={shape.name}>
                  {shape.name}
                </option>
              ))}
            </select>
          </label>

          <label className="map-filter map-filter--sector">
            <span>
              {get('filters.sector', 'Secteur d’activité')}
              <Pencil section="filters" field="sector" fallback="Secteur d’activité" label="Filtre secteur" />
              <Pencil section="filters" field="all" fallback="Tous" label="Option Tous" />
            </span>
            <select value={sector} onChange={(event) => setSector(event.target.value)}>
              <option value="">{allLabel}</option>
              {sectorOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <EditableText
            section="filters"
            field="note"
            fallback="Les filtres projet, gouvernorat, nature et secteur sont actifs. Les interventions « Grand Tunis » colorent Tunis, Ariana, Ben Arous et Manouba ; celles menées à l’échelle nationale restent dans la liste sans colorer la carte."
            as="p"
            className="map-controls__note"
            label="Note filtres"
          />

          <label className="map-search">
            <span>
              {get('filters.search', 'Rechercher une intervention')}
              <Pencil
                section="filters"
                field="search"
                fallback="Rechercher une intervention"
                label="Recherche"
              />
            </span>
            <div className="map-btn-edit">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={get('filters.placeholder', 'Nom, localité, projet…')}
              />
              <Pencil
                section="filters"
                field="placeholder"
                fallback="Nom, localité, projet…"
                label="Placeholder"
              />
            </div>
          </label>

          <div className="map-btn-edit">
            <button type="button" className="map-reset" onClick={reset}>
              {resetLabel}
            </button>
            <Pencil section="filters" field="reset" fallback={resetLabel} label="Réinitialiser" />
          </div>
        </CmsSection>

          <div className="map-stats-dock">
          <ListDock>
            <EditableJsonList
              section="filters"
              field="stats"
              label="Chiffres"
              className="map-list-cms"
              wrapItems={false}
              manageLabel="Gérer les chiffres"
              fallback={STAT_FALLBACK}
              fields={[
                { key: 'id', label: 'Identifiant interne' },
                { key: 'label', label: 'Libellé' },
              ]}
              emptyItem={{ id: 'nouveau', label: '' }}
              renderItem={() => null}
            />
            <dl className="map-stats">
              {stats.map((item) => (
                <div key={item.id}>
                  <dt>
                    <CountUp fromPrevious value={String(statValue(item.id))} />
                  </dt>
                  <dd>{item.label}</dd>
                </div>
              ))}
            </dl>
          </ListDock>
          </div>
        </div>

        <CmsSection id="map" className="map-page__visual" as="div">
          <div className="map-page__canvas">
          <svg
            viewBox={MAP_VIEWBOX}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={get('map.aria', 'Carte des interventions territoriales EU4Youth')}
          >
            {MAP_SHAPES.map((shape, index) => {
              const count = intensity[shape.name]
              const selected = governorate === shape.name
              const ficheWord = count === 1 ? ficheOne : ficheMany
              return (
                <path
                  key={`${shape.name}-${index}`}
                  d={shape.d}
                  className={[
                    'map-page__gov',
                    intensityClass(count),
                    selected ? 'map-page__gov--selected' : '',
                  ].join(' ')}
                  tabIndex={0}
                  role="button"
                  aria-label={`${shape.name} : ${count} ${ficheWord}`}
                  onMouseEnter={() => setHovered(shape.name)}
                  onMouseLeave={() => setHovered('')}
                  onFocus={() => setHovered(shape.name)}
                  onBlur={() => setHovered('')}
                  onClick={() => setGovernorate(governorate === shape.name ? '' : shape.name)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setGovernorate(governorate === shape.name ? '' : shape.name)
                    }
                  }}
                />
              )
            })}
          </svg>

          <div className="map-page__labels" aria-hidden="true">
          {mapLabels.map((label) => {
            const style = MAP_LABEL_STYLES[label.name]
            const compact = Boolean(style?.size)
            const isActive = selectedGovernorate === label.name
            return (
              <span
                key={label.name}
                className={[
                  'map-page__label',
                  compact ? 'map-page__label--compact' : '',
                  isActive ? 'map-page__label--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: `${label.x}%`,
                  top: `${label.y}%`,
                  ...(style?.size ? { '--label-size': style.size } : {}),
                } as CSSProperties}
              >
                {formatGovLabel(label.name)}
              </span>
            )
          })}
          </div>

          {selectedGovernorate && tooltipPlacement && (
            <div className="map-tooltip" role="status" style={tooltipPlacement}>
              <strong>{selectedGovernorate}</strong>
              <span>
                {selectedCount} {selectedCount === 1 ? ficheOne : ficheMany}
              </span>
            </div>
          )}
          </div>

          <ListDock className="map-legend-dock">
            <EditableJsonList
              section="map"
              field="legend"
              label="Légende"
              className="map-list-cms"
              wrapItems={false}
              manageLabel="Gérer la légende"
              fallback={LEGEND_FALLBACK}
              fields={[
                {
                  key: 'id',
                  label: 'Niveau',
                  options: ['none', 't1', 't2', 't3', 't4'],
                  optionLabels: {
                    none: '0',
                    t1: '0 à 20',
                    t2: '20 à 40',
                    t3: '40 à 60',
                    t4: 'Plus de 60',
                  },
                  multiple: false,
                },
                { key: 'label', label: 'Libellé' },
              ]}
              emptyItem={{ id: 't2', label: '' }}
              renderItem={() => null}
            />
            <ul className="map-legend" aria-label={get('map.aria', 'Carte des interventions territoriales EU4Youth')}>
              {legend.map((item) => (
                <li key={item.id}>
                  <span className={`map-legend__${item.id}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          </ListDock>
          <p className="map-filter-pencils">
            <Pencil section="map" field="aria" fallback="Carte des interventions territoriales EU4Youth" label="Libellé carte" />
            <Pencil section="map" field="ficheOne" fallback={ficheOne} label="Fiche" />
            <Pencil section="map" field="ficheMany" fallback={ficheMany} label="Fiches" />
          </p>
        </CmsSection>
      </section>

      <CmsSection id="results" className="map-results" labelledBy="map-results-title">
        <div className="map-results__head">
          <div>
            <div className="map-title-row">
              <p>{get('results.eyebrow', 'RÉSULTATS DE LA CARTE')}</p>
              <Pencil section="results" field="eyebrow" fallback="RÉSULTATS DE LA CARTE" label="Sur-titre" />
            </div>
            <div className="map-title-row">
              <h2 id="map-results-title">
                <CountUp fromPrevious value={String(filtered.length)} />{' '}
                {filtered.length === 1
                  ? get('results.interventionOne', 'INTERVENTION')
                  : get('results.interventionMany', 'INTERVENTIONS')}{' '}
                {filtered.length === 1
                  ? get('results.visibleOne', 'VISIBLE')
                  : get('results.visibleMany', 'VISIBLES')}
              </h2>
              <Pencil section="results" field="interventionOne" fallback="INTERVENTION" label="Intervention" />
            </div>
            <p className="map-filter-pencils">
              <Pencil section="results" field="interventionMany" fallback="INTERVENTIONS" label="Interventions" />
              <Pencil section="results" field="visibleOne" fallback="VISIBLE" label="Visible" />
              <Pencil section="results" field="visibleMany" fallback="VISIBLES" label="Visibles" />
            </p>
          </div>
          <div className="map-results__actions">
            {governorate && <strong>{governorate}</strong>}
            <div className="map-btn-edit">
              <button type="button" onClick={exportFiltered} disabled={!filtered.length}>
                {get('results.export', 'Exporter en CSV')}
              </button>
              <Pencil section="results" field="export" fallback="Exporter en CSV" label="Exporter" />
            </div>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className="map-results__layout">
              <ul className="map-results__grid">
                {visible.map((intervention) => (
                  <li key={intervention.id} style={projectStyle(intervention)}>
                    <button
                      type="button"
                      aria-expanded={selectedId === intervention.id}
                      onClick={() =>
                        setSelectedId(
                          selectedId === intervention.id ? null : intervention.id,
                        )
                      }
                    >
                      <img
                        src={assetUrl(`/img/logo-${intervention.projectSlug}.png`)}
                        alt=""
                        aria-hidden="true"
                      />
                      <div>
                        <p>{intervention.project}</p>
                        <h3>{intervention.name}</h3>
                        <span>
                          {intervention.governorate}
                          {intervention.locality ? ` · ${intervention.locality}` : ''}
                        </span>
                      </div>
                      <b aria-hidden="true">+</b>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {selectedIntervention && (
              <div
                className="map-detail-layer"
                role="presentation"
                onClick={() => setSelectedId(null)}
              >
                <aside
                  className="map-detail"
                  role="dialog"
                  aria-modal="true"
                  style={projectStyle(selectedIntervention)}
                  aria-labelledby="map-detail-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    className="map-detail__close"
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label={get('results.close', 'Fermer le détail')}
                  >
                    ×
                  </button>
                  <header className="map-detail__head">
                    <img
                      className="map-detail__logo"
                      src={assetUrl(`/img/logo-${selectedIntervention.projectSlug}.png`)}
                      alt=""
                      aria-hidden="true"
                    />
                    <div>
                      <p className="map-detail__eyebrow">
                        {withTokens(get('results.detailEyebrow', 'INTERVENTION #{id}'), {
                          id: selectedIntervention.id,
                        })}
                      </p>
                      <h3 id="map-detail-title">{selectedIntervention.name}</h3>
                      <p className="map-detail__project">{selectedIntervention.project}</p>
                    </div>
                  </header>
                  <dl className="map-detail__meta">
                    <div>
                      <dt>{get('results.dtGovernorate', 'Gouvernorat')}</dt>
                      <dd>{selectedIntervention.governorate}</dd>
                    </div>
                    {selectedIntervention.locality && (
                      <div>
                        <dt>{get('results.dtLocality', 'Délégation / commune')}</dt>
                        <dd>{selectedIntervention.locality}</dd>
                      </div>
                    )}
                    <div>
                      <dt>{get('results.dtNature', 'Nature')}</dt>
                      <dd>{displayField(selectedIntervention.nature)}</dd>
                    </div>
                    <div>
                      <dt>{get('results.dtSector', 'Secteur')}</dt>
                      <dd>{displayField(selectedIntervention.sector)}</dd>
                    </div>
                  </dl>
                  <div className="map-detail__actions map-btn-edit">
                    <Link
                      className="btn btn--fill-blue map-detail__cta"
                      to={`/projets/${selectedIntervention.projectSlug}`}
                    >
                      {get('results.link', 'Découvrir le projet')}
                    </Link>
                    <Pencil section="results" field="link" fallback="Découvrir le projet" label="Lien projet" />
                    <Pencil
                      section="results"
                      field="detailEyebrow"
                      fallback="INTERVENTION #{id}"
                      label="Sur-titre détail"
                    />
                    <Pencil section="results" field="close" fallback="Fermer le détail" label="Fermer" />
                    <Pencil section="results" field="dtProject" fallback="Projet" label="Libellé projet" />
                    <Pencil
                      section="results"
                      field="dtGovernorate"
                      fallback="Gouvernorat"
                      label="Libellé gouvernorat"
                    />
                    <Pencil
                      section="results"
                      field="dtLocality"
                      fallback="Délégation / commune"
                      label="Libellé localité"
                    />
                    <Pencil section="results" field="dtNature" fallback="Nature" label="Libellé nature" />
                    <Pencil section="results" field="dtSector" fallback="Secteur" label="Libellé secteur" />
                  </div>
                </aside>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="map-pagination" aria-label="Pagination des interventions">
                <div className="map-btn-edit">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {get('results.prev', 'Précédent')}
                  </button>
                  <Pencil section="results" field="prev" fallback="Précédent" label="Précédent" />
                </div>
                <div className="map-btn-edit">
                  <span>
                    {withTokens(get('results.pageOf', 'Page {page} sur {pages}'), {
                      page,
                      pages: totalPages,
                    })}
                  </span>
                  <Pencil
                    section="results"
                    field="pageOf"
                    fallback="Page {page} sur {pages}"
                    label="Page X sur Y"
                  />
                </div>
                <div className="map-btn-edit">
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    {get('results.next', 'Suivant')}
                  </button>
                  <Pencil section="results" field="next" fallback="Suivant" label="Suivant" />
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="map-results__empty">
            <h3>{get('results.empty', 'Aucune intervention ne correspond à cette combinaison.')}</h3>
            <div className="map-btn-edit">
              <button type="button" onClick={reset}>
                {get('results.emptyCta', resetLabel)}
              </button>
              <Pencil
                section="results"
                field="empty"
                fallback="Aucune intervention ne correspond à cette combinaison."
                label="Aucun résultat"
              />
              <Pencil section="results" field="emptyCta" fallback={resetLabel} label="Bouton vide" />
            </div>
          </div>
        )}
      </CmsSection>
    </div>
  )
}
