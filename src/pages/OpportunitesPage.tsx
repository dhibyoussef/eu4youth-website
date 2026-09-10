import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  OPPORTUNITIES as OPPORTUNITIES_FALLBACK,
  OPPORTUNITY_LIST_FALLBACK,
  OPPORTUNITY_TYPE_CHIPS,
  listingOpportunities,
  opportunityStatus,
  parseTypeChips,
  sortOpportunities,
  type OpportunityStatus,
} from '../data/opportunities'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './opportunites.css'

const TYPES = [
  'Toutes',
  'Appel à projets',
  'Appel à candidatures',
  'Stage / emploi',
  'Bourse',
  'Formation',
] as const

const TYPE_VALUES = TYPES.filter((item) => item !== 'Toutes')

const STATUSES = ['Toutes', 'Ouverte', 'À venir', 'Clôturée'] as const
const ALL_F = 'Toutes'
const ALL_M = 'Tous'

function ListDock({ children }: { children: ReactNode }) {
  return <div className="op-edit-region">{children}</div>
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
      className="op-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function OpportunitesPage() {
  const { get } = useContent()
  const catalog = useCatalog('opportunities', OPPORTUNITIES_FALLBACK)
  const OPPORTUNITIES = listingOpportunities(
    get('browser.items', JSON.stringify(OPPORTUNITY_LIST_FALLBACK)),
    catalog,
  )
  const typeChips = parseTypeChips(get('browser.types', JSON.stringify(OPPORTUNITY_TYPE_CHIPS)))
  const typeIds = typeChips.map((chip) => chip.id) as unknown as (typeof TYPES)[number][]
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState<(typeof TYPES)[number]>(
    (searchParams.get('type') as (typeof TYPES)[number]) ?? ALL_F,
  )
  const [status, setStatus] = useState<(typeof STATUSES)[number]>(
    (searchParams.get('status') as (typeof STATUSES)[number]) ?? ALL_F,
  )
  const [project, setProject] = useState(searchParams.get('project') ?? ALL_M)
  const [location, setLocation] = useState(searchParams.get('location') ?? ALL_F)
  const [audience, setAudience] = useState(searchParams.get('audience') ?? ALL_M)
  const [theme, setTheme] = useState(searchParams.get('theme') ?? ALL_F)
  const [sort, setSort] = useState<'deadline' | 'recent'>(
    searchParams.get('sort') === 'recent' ? 'recent' : 'deadline',
  )

  const allF = get('browser.allF', 'Toutes')
  const allM = get('browser.allM', 'Tous')
  const resetLabel = get('browser.reset', 'Réinitialiser')
  const searchLabel = get('browser.search', 'Recherche')
  const searchPlaceholder = get('browser.placeholder', 'Intitulé, secteur, mot-clé…')
  const filtersTitle = get('browser.filtersTitle', 'Filtrer par')
  const sortLabel = get('browser.sort', 'Trier par')
  const sortDeadline = get('browser.sortDeadline', 'Date limite la plus proche')
  const sortRecent = get('browser.sortRecent', 'Plus récentes')
  const oneLabel = get('browser.one', 'opportunité')
  const manyLabel = get('browser.many', 'opportunités')

  const labelOf = (option: string, allValue: string, allLabel: string) =>
    option === allValue ? allLabel : option

  const typeLabel = (option: string) =>
    typeChips.find((chip) => chip.id === option)?.label || labelOf(option, ALL_F, allF)

  const statusLabel = (value: OpportunityStatus | (typeof STATUSES)[number]) => {
    if (value === 'Ouverte') return get('browser.statusOpen', 'Ouverte')
    if (value === 'À venir') return get('browser.statusSoon', 'À venir')
    if (value === 'Clôturée') return get('browser.statusClosed', 'Clôturée')
    return labelOf(value, ALL_F, allF)
  }

  const projects = [...new Set(OPPORTUNITIES.map((item) => item.project))]
  const locations = [...new Set(OPPORTUNITIES.flatMap((item) => item.locations))]
  const audiences = [...new Set(OPPORTUNITIES.flatMap((item) => item.audiences))]
  const themes = [...new Set(OPPORTUNITIES.flatMap((item) => item.themes))]

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr')
    const filtered = OPPORTUNITIES.filter((item) => {
      const haystack = [
        item.title,
        item.summary,
        ...item.themes,
        ...item.audiences,
        ...item.locations,
      ]
        .join(' ')
        .toLocaleLowerCase('fr')

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (type === ALL_F || item.type === type) &&
        (status === ALL_F || opportunityStatus(item) === status) &&
        (project === ALL_M || item.project === project) &&
        (location === ALL_F || item.locations.includes(location)) &&
        (audience === ALL_M || item.audiences.includes(audience)) &&
        (theme === ALL_F || item.themes.includes(theme))
      )
    })
    return sortOpportunities(filtered, sort)
  }, [OPPORTUNITIES, audience, location, project, query, sort, status, theme, type])

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (type !== ALL_F) params.set('type', type)
    if (status !== ALL_F) params.set('status', status)
    if (project !== ALL_M) params.set('project', project)
    if (location !== ALL_F) params.set('location', location)
    if (audience !== ALL_M) params.set('audience', audience)
    if (theme !== ALL_F) params.set('theme', theme)
    if (sort !== 'deadline') params.set('sort', sort)
    setSearchParams(params, { replace: true })
  }, [audience, location, project, query, setSearchParams, sort, status, theme, type])

  const activeFilters = [
    query.trim() ? { label: `${searchLabel} : ${query.trim()}`, clear: () => setQuery('') } : null,
    type !== ALL_F ? { label: typeLabel(type), clear: () => setType(ALL_F) } : null,
    status !== ALL_F ? { label: statusLabel(status), clear: () => setStatus(ALL_F) } : null,
    project !== ALL_M ? { label: project, clear: () => setProject(ALL_M) } : null,
    location !== ALL_F ? { label: location, clear: () => setLocation(ALL_F) } : null,
    audience !== ALL_M ? { label: audience, clear: () => setAudience(ALL_M) } : null,
    theme !== ALL_F ? { label: theme, clear: () => setTheme(ALL_F) } : null,
  ].filter((item): item is { label: string; clear: () => void } => item !== null)

  const openCount = OPPORTUNITIES.filter((item) => opportunityStatus(item) === 'Ouverte').length
  const closedCount = OPPORTUNITIES.filter((item) => opportunityStatus(item) === 'Clôturée').length

  const reset = () => {
    setQuery('')
    setType(ALL_F)
    setStatus(ALL_F)
    setProject(ALL_M)
    setLocation(ALL_F)
    setAudience(ALL_M)
    setTheme(ALL_F)
  }

  const showArchives = () => {
    setStatus(ALL_F)
    setType(ALL_F)
    setProject(ALL_M)
    setLocation(ALL_F)
    setAudience(ALL_M)
    setTheme(ALL_F)
    setQuery('')
  }

  const emptyOpen = status === ALL_F ? false : status === 'Ouverte' && openCount === 0

  return (
    <div className="page page--opportunities">
      <CmsSection id="hero" className="op-hero" labelledBy="op-title">
        <EditableText
          section="hero"
          field="title"
          fallback="OPPORTUNITÉS"
          as="h1"
          id="op-title"
          className="op-hero__title"
          label="Titre"
        />
      </CmsSection>

      <CmsSection id="browser" className="op-browser">
        <div className="op-layout">
          <aside className="op-filters">
            <label className="op-search">
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
              <div className="op-btn-edit">
                <input
                  id="op-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  type="search"
                />
                <b aria-hidden="true">⌕</b>
                <Pencil
                  section="browser"
                  field="placeholder"
                  fallback="Intitulé, secteur, mot-clé…"
                  label="Placeholder"
                />
              </div>
            </label>

            <div className="op-filters__head">
              <EditableText
                section="browser"
                field="filtersTitle"
                fallback="Filtrer par"
                as="h2"
                className="op-filters__title"
                label="Titre filtres"
              >
                {filtersTitle}
              </EditableText>
              <div className="op-btn-edit">
                <button type="button" className="op-filters__reset" onClick={reset}>
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
                  fallback="Type d’opportunité"
                  as="span"
                  multiline={false}
                  label="Filtre type"
                >
                  {get('browser.type', 'Type d’opportunité')}
                </EditableText>
              }
              value={type}
              onChange={setType}
              options={typeIds.length ? typeIds : TYPES}
              display={typeLabel}
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="status"
                  fallback="Statut"
                  as="span"
                  multiline={false}
                  label="Filtre statut"
                >
                  {get('browser.status', 'Statut')}
                </EditableText>
              }
              value={status}
              onChange={setStatus}
              options={STATUSES}
              display={(option) => statusLabel(option)}
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
              options={[ALL_F, ...themes]}
              display={(option) => labelOf(option, ALL_F, allF)}
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
              options={[ALL_M, ...projects]}
              display={(option) => labelOf(option, ALL_M, allM)}
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="location"
                  fallback="Localisation / éligibilité"
                  as="span"
                  multiline={false}
                  label="Filtre localisation"
                >
                  {get('browser.location', 'Localisation / éligibilité')}
                </EditableText>
              }
              value={location}
              onChange={setLocation}
              options={[ALL_F, ...locations]}
              display={(option) => labelOf(option, ALL_F, allF)}
            />
            <Filter
              label={
                <EditableText
                  section="browser"
                  field="audience"
                  fallback="Public cible"
                  as="span"
                  multiline={false}
                  label="Filtre public"
                >
                  {get('browser.audience', 'Public cible')}
                </EditableText>
              }
              value={audience}
              onChange={setAudience}
              options={[ALL_M, ...audiences]}
              display={(option) => labelOf(option, ALL_M, allM)}
            />

            <nav className="op-quick scroll-rail" aria-label="Accès rapide par type d'opportunité">
              {typeChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={type === chip.id ? 'is-active' : ''}
                  onClick={() =>
                    setType(
                      (chip.id === ALL_F
                        ? ALL_F
                        : type === chip.id
                          ? ALL_F
                          : chip.id) as (typeof TYPES)[number],
                    )
                  }
                >
                  {chip.id === ALL_F ? allF : chip.label}
                </button>
              ))}
            </nav>
            <ListDock>
              <EditableJsonList
                section="browser"
                field="types"
                label="Types"
                className="op-list-cms"
                wrapItems={false}
                manageLabel="Gérer les types"
                fallback={OPPORTUNITY_TYPE_CHIPS}
                fields={[
                  { key: 'id', label: 'Valeur (filtre)', options: [...TYPES], multiple: false },
                  { key: 'label', label: 'Libellé affiché' },
                ]}
                emptyItem={{ id: 'Formation', label: 'Formation' }}
                renderItem={() => null}
              />
            </ListDock>
            <p className="op-filter-pencils">
              <Pencil section="browser" field="allF" fallback="Toutes" label="Option Toutes" />
              <Pencil section="browser" field="allM" fallback="Tous" label="Option Tous" />
            </p>
          </aside>

          <div className="op-results">
            {activeFilters.length > 0 && (
              <div className="op-active" aria-label="Filtres actifs">
                {activeFilters.map((filter) => (
                  <button key={filter.label} type="button" onClick={filter.clear}>
                    {filter.label} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
            <div className="op-results__bar">
              <p>
                <strong>{results.length}</strong>{' '}
                {results.length === 1 ? (
                  <EditableText
                    section="browser"
                    field="one"
                    fallback="opportunité"
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
                    fallback="opportunités"
                    as="span"
                    multiline={false}
                    label="Pluriel"
                  >
                    {manyLabel}
                  </EditableText>
                )}
              </p>
              <label>
                <EditableText
                  section="browser"
                  field="sort"
                  fallback="Trier par"
                  as="span"
                  multiline={false}
                  label="Trier par"
                >
                  {sortLabel}
                </EditableText>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as 'deadline' | 'recent')}
                >
                  <option value="deadline">{sortDeadline}</option>
                  <option value="recent">{sortRecent}</option>
                </select>
                <span className="op-filter-pencils">
                  <Pencil
                    section="browser"
                    field="sortDeadline"
                    fallback="Date limite la plus proche"
                    label="Tri date limite"
                  />
                  <Pencil section="browser" field="sortRecent" fallback="Plus récentes" label="Tri récentes" />
                </span>
              </label>
            </div>

            <ListDock>
              <EditableJsonList
                section="browser"
                field="items"
                label="Opportunités"
                className="op-list-cms"
                wrapItems={false}
                manageLabel="Gérer les opportunités"
                fallback={OPPORTUNITY_LIST_FALLBACK}
                fields={[
                  { key: 'slug', label: 'Slug URL' },
                  { key: 'title', label: 'Titre' },
                  {
                    key: 'type',
                    label: 'Type',
                    options: [...TYPE_VALUES],
                    multiple: false,
                  },
                  { key: 'summary', label: 'Résumé', multiline: true },
                  { key: 'image', label: 'Image' },
                  { key: 'deadlineLabel', label: 'Date affichée' },
                  { key: 'opensAt', label: 'Ouverture (AAAA-MM-JJ)' },
                  { key: 'deadline', label: 'Clôture (AAAA-MM-JJ)' },
                  { key: 'locationLabel', label: 'Lieux affichés', multiline: true },
                  { key: 'locations', label: 'Lieux (filtre)', multiline: true },
                  { key: 'project', label: 'Nom du projet' },
                  {
                    key: 'projectSlug',
                    label: 'Logo projet',
                    options: PROJECTS.map((item) => item.slug),
                    optionLabels: Object.fromEntries(
                      PROJECTS.map((item) => [item.slug, item.acronym]),
                    ),
                    multiple: false,
                  },
                  { key: 'themes', label: 'Thématiques', multiline: true },
                  { key: 'audiences', label: 'Publics', multiline: true },
                ]}
                emptyItem={{
                  ...OPPORTUNITY_LIST_FALLBACK[0],
                  id: '',
                  slug: '',
                  title: '',
                  summary: '',
                }}
                renderItem={() => null}
              />
            </ListDock>
            <p className="op-filter-pencils">
              <Pencil section="browser" field="statusOpen" fallback="Ouverte" label="Statut ouverte" />
              <Pencil section="browser" field="statusSoon" fallback="À venir" label="Statut à venir" />
              <Pencil
                section="browser"
                field="statusClosed"
                fallback="Clôturée"
                label="Statut clôturée"
              />
            </p>

            {results.length > 0 ? (
              <ul className="op-grid">
                  {results.map((item) => {
                    const itemStatus = opportunityStatus(item)
                    return (
                      <li key={item.id}>
                        <Link
                          className={`op-card${itemStatus === 'Clôturée' ? ' is-closed' : ''}`}
                          to={`/opportunites/${item.slug}`}
                        >
                          <div className="op-card__image">
                            <img src={assetUrl(item.image)} alt="" />
                          </div>
                          <div className="op-card__body">
                            <div className="op-card__title">
                              <div>
                                <span className="op-card__status">{statusLabel(itemStatus)}</span>
                                <h2>{item.title}</h2>
                                <p>{typeLabel(item.type)}</p>
                              </div>
                              <img src={assetUrl(`/img/logo-${item.projectSlug}.png`)} alt="" />
                            </div>
                            <p className="op-card__summary">{item.summary}</p>
                            <div className="op-card__foot">
                              <span>
                                <img src={assetUrl('/img/icon-calendar.png')} alt="" aria-hidden="true" />
                                {item.deadlineLabel}
                              </span>
                              <span>
                                <img src={assetUrl('/img/icon-pin-pink.png')} alt="" aria-hidden="true" />
                                {item.locationLabel}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
            ) : (
              <div className="op-empty">
                {emptyOpen ? (
                  <EditableText
                    section="browser"
                    field="emptyEyebrow"
                    fallback="CATALOGUE PRÊT"
                    as="span"
                    className="op-empty__eyebrow"
                    multiline={false}
                    label="Sur-titre vide"
                  >
                    {get('browser.emptyEyebrow', 'CATALOGUE PRÊT')}
                  </EditableText>
                ) : null}
                {emptyOpen ? (
                  <EditableText
                    section="browser"
                    field="emptyOpen"
                    fallback="Aucune opportunité ouverte pour le moment."
                    as="strong"
                    multiline={false}
                    label="Aucune ouverte"
                  >
                    {get('browser.emptyOpen', 'Aucune opportunité ouverte pour le moment.')}
                  </EditableText>
                ) : (
                  <EditableText
                    section="browser"
                    field="empty"
                    fallback="Aucune opportunité ne correspond à ces critères."
                    as="strong"
                    multiline={false}
                    label="Aucun résultat"
                  >
                    {get('browser.empty', 'Aucune opportunité ne correspond à ces critères.')}
                  </EditableText>
                )}
                {status === 'Ouverte' && closedCount > 0 ? (
                  <EditableText
                    section="browser"
                    field="emptyArchives"
                    fallback="Les nouveaux appels seront publiés ici dès validation. Consultez les archives pour les appels clôturés."
                    as="p"
                    label="Texte archives"
                  >
                    {get(
                      'browser.emptyArchives',
                      'Les nouveaux appels seront publiés ici dès validation. Consultez les archives pour les appels clôturés.',
                    )}
                  </EditableText>
                ) : (
                  <EditableText
                    section="browser"
                    field="emptyHint"
                    fallback="Essayez d’élargir votre recherche ou de réinitialiser les filtres."
                    as="p"
                    label="Conseil vide"
                  >
                    {get(
                      'browser.emptyHint',
                      'Essayez d’élargir votre recherche ou de réinitialiser les filtres.',
                    )}
                  </EditableText>
                )}
                {status === 'Ouverte' && closedCount > 0 ? (
                  <>
                    <button type="button" onClick={showArchives}>
                      <EditableText
                        section="browser"
                        field="archives"
                        fallback="Voir les archives"
                        as="span"
                        multiline={false}
                        label="Archives"
                      >
                        {get('browser.archives', 'Voir les archives')}
                      </EditableText>
                    </button>
                    <nav className="op-empty__links" aria-label="Autres contenus à consulter">
                      <Link to="/agenda">
                        <EditableText
                          section="browser"
                          field="agenda"
                          fallback="Agenda"
                          as="span"
                          multiline={false}
                          label="Lien agenda"
                        >
                          {get('browser.agenda', 'Agenda')}
                        </EditableText>
                      </Link>
                      <Link to="/actualites">
                        <EditableText
                          section="browser"
                          field="news"
                          fallback="Actualités"
                          as="span"
                          multiline={false}
                          label="Lien actualités"
                        >
                          {get('browser.news', 'Actualités')}
                        </EditableText>
                      </Link>
                    </nav>
                  </>
                ) : (
                  <button type="button" onClick={reset}>
                    <EditableText
                      section="browser"
                      field="emptyCta"
                      fallback="Réinitialiser les filtres"
                      as="span"
                      multiline={false}
                      label="Bouton vide"
                    >
                      {get('browser.emptyCta', 'Réinitialiser les filtres')}
                    </EditableText>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CmsSection>
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
    <div className={`op-filter${open ? ' is-open' : ''}`}>
      <div className="op-title-row">
        <button
          type="button"
          className="op-filter__toggle"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {label}
          <b className="op-filter__chev" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <ul className="op-filter__list">
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
