import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  NEWS as NEWS_FALLBACK,
  NEWS_LIST_FALLBACK,
  NEWS_TYPE_CHIPS,
  NEWS_TYPES,
  listingNews,
  parseNewsTypeChips,
} from '../data/news'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import PeriodCalendarFilter, {
  matchesPeriodFilter,
  parsePeriodParam,
  periodFilterLabel,
  serializePeriodParam,
  type PeriodFilterValue,
} from '../components/PeriodCalendarFilter'
import '../components/period-calendar.css'
import './actualites.css'

const ALL = 'Toutes'
const PAGE_SIZE = 4

function ListDock({ children }: { children: ReactNode }) {
  return <div className="news-edit-region">{children}</div>
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
      className="news-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function ActualitesPage() {
  const { get, t } = useContent()
  const catalog = useCatalog('news', NEWS_FALLBACK)
  const NEWS = listingNews(get('browser.items', JSON.stringify(NEWS_LIST_FALLBACK)), catalog)
  const typeChips = parseNewsTypeChips(get('browser.types', JSON.stringify(NEWS_TYPE_CHIPS)))
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? ALL)
  const [theme, setTheme] = useState(searchParams.get('theme') ?? ALL)
  const [project, setProject] = useState(searchParams.get('project') ?? ALL)
  const [location, setLocation] = useState(searchParams.get('location') ?? ALL)
  const [period, setPeriod] = useState<PeriodFilterValue>(() =>
    parsePeriodParam(searchParams.get('period')),
  )
  const [page, setPage] = useState(1)

  const allF = get('browser.allF', 'Toutes')
  const searchLabel = get('browser.search', 'Recherche')
  const searchPlaceholder = get('browser.placeholder', 'Mot-clé…')
  const filtersTitle = get('browser.filtersTitle', 'Filtrer par')
  const resetLabel = get('browser.reset', 'Réinitialiser')
  const oneLabel = get('browser.one', 'actualité')
  const manyLabel = get('browser.many', 'actualités')
  const sortHint = get('browser.sortHint', 'Les plus récentes en premier')
  const readLabel = get('browser.read', 'Lire l\'article')
  const prevLabel = get('browser.prev', '‹')
  const nextLabel = get('browser.next', '›')

  const typeLabel = (option: string) =>
    typeChips.find((chip) => chip.id === option)?.label || (option === ALL ? allF : option)

  const themes = [...new Set(NEWS.flatMap((item) => item.themes))]
  const locations = [...new Set(NEWS.flatMap((item) => item.locations))]
  const projects = [...new Set(NEWS.map((item) => item.project))]
  const markedDates = useMemo(() => NEWS.map((item) => item.publishedAt), [NEWS])

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr')
    return NEWS.filter((item) => {
      const haystack = [item.title, item.summary, item.project, ...item.themes, ...item.locations]
        .join(' ')
        .toLocaleLowerCase('fr')

      return (
        (!needle || haystack.includes(needle)) &&
        (type === ALL || item.type === type) &&
        (theme === ALL || item.themes.includes(theme)) &&
        (project === ALL || item.project === project) &&
        (location === ALL || item.locations.includes(location)) &&
        matchesPeriodFilter(item.publishedAt, period)
      )
    }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [NEWS, location, period, project, query, theme, type])

  useEffect(() => {
    setPage(1)
  }, [location, period, project, query, theme, type])

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (type !== ALL) params.set('type', type)
    if (theme !== ALL) params.set('theme', theme)
    if (project !== ALL) params.set('project', project)
    if (location !== ALL) params.set('location', location)
    const periodParam = serializePeriodParam(period)
    if (periodParam) params.set('period', periodParam)
    setSearchParams(params, { replace: true })
  }, [location, period, project, query, setSearchParams, theme, type])

  const activeFilters = [
    query.trim() ? { label: `${searchLabel} : ${query.trim()}`, clear: () => setQuery('') } : null,
    type !== ALL ? { label: typeLabel(type), clear: () => setType(ALL) } : null,
    project !== ALL ? { label: project, clear: () => setProject(ALL) } : null,
    theme !== ALL ? { label: theme, clear: () => setTheme(ALL) } : null,
    location !== ALL ? { label: location, clear: () => setLocation(ALL) } : null,
    period.mode !== 'all'
      ? { label: periodFilterLabel(period), clear: () => setPeriod({ mode: 'all' }) }
      : null,
  ].filter((item): item is { label: string; clear: () => void } => item !== null)
  const pageCount = Math.ceil(results.length / PAGE_SIZE)
  const visibleResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const reset = () => {
    setQuery('')
    setType(ALL)
    setTheme(ALL)
    setProject(ALL)
    setLocation(ALL)
    setPeriod({ mode: 'all' })
  }

  return (
    <div className="page page--news">
      <CmsSection id="hero" className="news-hero" labelledBy="news-title">
        <EditableText
          section="hero"
          field="title"
          fallback="ACTUALITÉS"
          as="h1"
          id="news-title"
          className="news-hero__title"
          label="Titre"
        />
      </CmsSection>

      <CmsSection id="browser" className="news-browser">
        <div className="news-layout">
          <aside className="news-filters">
            <label className="news-search">
              <EditableText
                section="browser"
                field="search"
                fallback="Recherche"
                as="span"
                multiline={false}
                label="Recherche"
              >
                {searchLabel}
              </EditableText>
              <div className="news-btn-edit">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder={searchPlaceholder}
                />
                <b aria-hidden="true">⌕</b>
                <Pencil
                  section="browser"
                  field="placeholder"
                  fallback="Mot-clé…"
                  label="Placeholder"
                />
              </div>
            </label>

            <div className="news-filters__head">
              <EditableText
                section="browser"
                field="filtersTitle"
                fallback="Filtrer par"
                as="h2"
                className="news-filters__title"
                label="Titre filtres"
              >
                {filtersTitle}
              </EditableText>
              <div className="news-btn-edit">
                <button type="button" className="news-filters__reset" onClick={reset}>
                  <EditableText
                    section="browser"
                    field="reset"
                    fallback="Réinitialiser"
                    as="span"
                    multiline={false}
                    label="Réinitialiser"
                  >
                    {resetLabel}
                  </EditableText>
                </button>
              </div>
            </div>
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="type"
                  fallback="Type d’actualité"
                  as="span"
                  multiline={false}
                  label="Filtre type"
                >
                  {get('browser.type', 'Type d’actualité')}
                </EditableText>
              }
              value={type}
              onChange={setType}
              options={typeChips.map((chip) => chip.id)}
              display={typeLabel}
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="project"
                  fallback="Projet associé"
                  as="span"
                  multiline={false}
                  label="Filtre projet"
                >
                  {get('browser.project', 'Projet associé')}
                </EditableText>
              }
              value={project}
              onChange={setProject}
              options={[ALL, ...projects]}
              display={(option) => (option === ALL ? allF : option)}
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="theme"
                  fallback="Thématique"
                  as="span"
                  multiline={false}
                  label="Filtre thématique"
                >
                  {get('browser.theme', 'Thématique')}
                </EditableText>
              }
              value={theme}
              onChange={setTheme}
              options={[ALL, ...themes]}
              display={(option) => (option === ALL ? allF : option)}
            />
            <PeriodFilter
              value={period}
              markedDates={markedDates}
              onChange={setPeriod}
              label={
                <EditableText
                  section="browser"
                  field="period"
                  fallback="Période"
                  as="span"
                  multiline={false}
                  label="Filtre période"
                >
                  {get('browser.period', 'Période')}
                </EditableText>
              }
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="location"
                  fallback="Localisation"
                  as="span"
                  multiline={false}
                  label="Filtre localisation"
                >
                  {get('browser.location', 'Localisation')}
                </EditableText>
              }
              value={location}
              onChange={setLocation}
              options={[ALL, ...locations]}
              display={(option) => (option === ALL ? allF : option)}
            />

            <nav className="news-quick scroll-rail" aria-label="Accès rapide par type d'actualité">
              {typeChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={type === chip.id ? 'is-active' : ''}
                  onClick={() => setType(chip.id === ALL ? ALL : type === chip.id ? ALL : chip.id)}
                >
                  {chip.id === ALL ? allF : chip.label}
                </button>
              ))}
            </nav>
            <ListDock>
              <EditableJsonList
                section="browser"
                field="types"
                label="Types"
                className="news-list-cms"
                wrapItems={false}
                manageLabel="Gérer les types"
                fallback={NEWS_TYPE_CHIPS}
                fields={[
                  { key: 'id', label: 'Valeur (filtre)', options: [ALL, ...NEWS_TYPES], multiple: false },
                  { key: 'label', label: 'Libellé affiché' },
                ]}
                emptyItem={{ id: 'Communiqué', label: 'Communiqué' }}
                renderItem={() => null}
              />
            </ListDock>
            <p className="news-filter-pencils">
              <Pencil section="browser" field="allF" fallback="Toutes" label="Option Toutes" />
            </p>
          </aside>

          <div className="news-results">
            {activeFilters.length > 0 && (
              <div className="news-active" aria-label="Filtres actifs">
                {activeFilters.map((filter) => (
                  <button key={filter.label} type="button" onClick={filter.clear}>
                    {filter.label} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
            <div className="news-results__head">
              <p>
                <strong>{results.length}</strong>{' '}
                {results.length === 1 ? (
                  <EditableText
                    section="browser"
                    field="one"
                    fallback="actualité"
                    as="span"
                    multiline={false}
                    label="Singulier"
                  >
                    {oneLabel}
                  </EditableText>
                ) : (
                  <EditableText
                    section="browser"
                    field="many"
                    fallback="actualités"
                    as="span"
                    multiline={false}
                    label="Pluriel"
                  >
                    {manyLabel}
                  </EditableText>
                )}
              </p>
              <EditableText
                section="browser"
                field="sortHint"
                fallback="Les plus récentes en premier"
                as="span"
                multiline={false}
                label="Tri"
              >
                {sortHint}
              </EditableText>
            </div>

            <ListDock>
              <EditableJsonList
                section="browser"
                field="items"
                label="Actualités"
                className="news-list-cms"
                wrapItems={false}
                manageLabel="Gérer les actualités"
                fallback={NEWS_LIST_FALLBACK}
                fields={[
                  { key: 'slug', label: 'Slug URL' },
                  { key: 'title', label: 'Titre' },
                  { key: 'type', label: 'Type', options: [...NEWS_TYPES], multiple: false },
                  { key: 'summary', label: 'Résumé', multiline: true },
                  { key: 'image', label: 'Image' },
                  { key: 'dateLabel', label: 'Date affichée' },
                  { key: 'publishedAt', label: 'Publication (AAAA-MM-JJ)' },
                  { key: 'project', label: 'Nom du projet' },
                  {
                    key: 'projectSlug',
                    label: 'Logo projet',
                    options: PROJECTS.map((item) => item.slug),
                    optionLabels: Object.fromEntries(PROJECTS.map((item) => [item.slug, item.acronym])),
                    multiple: false,
                  },
                  { key: 'themes', label: 'Thématiques', multiline: true },
                  { key: 'locations', label: 'Lieux', multiline: true },
                  { key: 'source', label: 'Source' },
                ]}
                emptyItem={{
                  ...NEWS_LIST_FALLBACK[0],
                  id: '',
                  slug: '',
                  title: '',
                  summary: '',
                }}
                renderItem={() => null}
              />
            </ListDock>
            <p className="news-filter-pencils">
              <Pencil section="browser" field="read" fallback="Lire l'article" label="Lire l’article" />
            </p>

            {results.length > 0 ? (
              <>
                <ul className="news-grid">
                  {visibleResults.map((item) => (
                    <li key={item.id}>
                      <article className="news-card">
                        <img src={assetUrl(item.image)} alt="" />
                        <div className="news-card__body">
                          <h2>
                            <Link to={`/actualites/${item.slug}`}>{item.title}</Link>
                          </h2>
                          <p className="news-card__tag">{item.project}</p>
                          <p className="sr-only">{typeLabel(item.type)}</p>
                          <p className="news-card__summary">{item.summary}</p>
                          <div className="news-card__foot">
                            <span className="news-card__when">
                              <img src={assetUrl('/img/icon-calendar.png')} alt="" aria-hidden="true" />
                              <time dateTime={item.publishedAt}>{item.dateLabel}</time>
                            </span>
                            <Link className="news-card__cta" to={`/actualites/${item.slug}`}>
                              {readLabel}
                            </Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
                {pageCount > 1 && (
                  <nav className="news-pagination" aria-label={t('a11y.pagination_news', 'Pagination des actualités')}>
                    <span className="news-btn-edit">
                      <button
                        type="button"
                        aria-label={t('a11y.page_prev', 'Page précédente')}
                        disabled={page === 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                      >
                        {prevLabel}
                      </button>
                      <Pencil section="browser" field="prev" fallback="‹" label="Précédent" />
                    </span>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={page === value ? 'is-active' : ''}
                        aria-current={page === value ? 'page' : undefined}
                        onClick={() => setPage(value)}
                      >
                        {value}
                      </button>
                    ))}
                    <span className="news-btn-edit">
                      <button
                        type="button"
                        aria-label={t('a11y.page_next', 'Page suivante')}
                        disabled={page === pageCount}
                        onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                      >
                        {nextLabel}
                      </button>
                      <Pencil section="browser" field="next" fallback="›" label="Suivant" />
                    </span>
                  </nav>
                )}
              </>
            ) : (
              <div className="news-empty">
                <EditableText
                  section="browser"
                  field="empty"
                  fallback="Aucune actualité publiée pour le moment."
                  as="strong"
                  multiline={false}
                  label="Aucun résultat"
                >
                  {get('browser.empty', 'Aucune actualité publiée pour le moment.')}
                </EditableText>
                <EditableText
                  section="browser"
                  field="emptyHint"
                  fallback="Les résultats et événements restent consultables sur les pages des six projets jusqu’à publication des premiers articles datés."
                  as="p"
                  label="Conseil vide"
                />
                <Link to="/projets">
                  <EditableText
                    section="browser"
                    field="emptyCta"
                    fallback="Explorer les projets"
                    as="span"
                    multiline={false}
                    label="Lien projets"
                  >
                    {get('browser.emptyCta', 'Explorer les projets')}
                  </EditableText>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CmsSection>
    </div>
  )
}

function PeriodFilter({
  value,
  markedDates,
  onChange,
  label,
}: {
  value: PeriodFilterValue
  markedDates: readonly string[]
  onChange: (value: PeriodFilterValue) => void
  label: ReactNode
}) {
  const [open, setOpen] = useState(value.mode !== 'all')
  return (
    <div className={`news-filter news-filter--calendar${open ? ' is-open' : ''}`}>
      <div className="news-title-row">
        <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {label}
          <b className="news-filter__chev" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <PeriodCalendarFilter
          value={value}
          markedDates={markedDates}
          onChange={onChange}
          accent="orange"
        />
      ) : null}
    </div>
  )
}

function Filter<T extends string>({
  label,
  value,
  options,
  onChange,
  display,
}: {
  label: ReactNode
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  display: (option: T) => string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`news-filter${open ? ' is-open' : ''}`}>
      <div className="news-title-row">
        <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          {label}
          <b className="news-filter__chev" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <ul className="news-filter__list">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={option === value ? 'is-active' : ''}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {display(option)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
