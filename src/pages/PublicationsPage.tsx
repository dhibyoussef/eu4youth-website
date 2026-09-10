import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  PUBLICATIONS as PUBLICATIONS_FALLBACK,
  PUBLICATION_LIST_FALLBACK,
  PUBLICATION_SORT_FALLBACK,
  PUBLICATION_TYPE_CHIPS,
  RESOURCE_TYPES,
  listingPublications,
  parseNamedRows,
} from '../data/publications'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './publications.css'

const ALL = 'Toutes'
const PAGE_SIZE = 6

const HERO_TITLE = 'PUBLICATIONS\nET RESSOURCES'

function ListDock({ children }: { children: ReactNode }) {
  return <div className="pub-edit-region">{children}</div>
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
      className="pub-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function PublicationsPage() {
  const { get, t } = useContent()
  const catalog = useCatalog('publications', PUBLICATIONS_FALLBACK)
  const PUBLICATIONS = listingPublications(
    get('browser.items', JSON.stringify(PUBLICATION_LIST_FALLBACK)),
    catalog,
  )
  const typeChips = parseNamedRows(
    get('browser.types', JSON.stringify(PUBLICATION_TYPE_CHIPS)),
    PUBLICATION_TYPE_CHIPS,
  )
  const sortRows = parseNamedRows(
    get('browser.sorts', JSON.stringify(PUBLICATION_SORT_FALLBACK)),
    PUBLICATION_SORT_FALLBACK,
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? ALL)
  const [theme, setTheme] = useState(searchParams.get('theme') ?? ALL)
  const [project, setProject] = useState(searchParams.get('project') ?? ALL)
  const [year, setYear] = useState(searchParams.get('year') ?? ALL)
  const [language, setLanguage] = useState(searchParams.get('language') ?? ALL)
  const [format, setFormat] = useState(searchParams.get('format') ?? ALL)
  const sortParam = searchParams.get('sort')
  const [sort, setSort] = useState(
    sortRows.some((item) => item.id === sortParam) ? sortParam! : 'default',
  )
  const [openFilter, setOpenFilter] = useState('')
  const [page, setPage] = useState(1)

  const allF = get('browser.allF', 'Toutes')
  const searchLabel = get('browser.search', 'Rechercher')
  const searchPlaceholder = get('browser.placeholder', 'Titre, projet, thématique…')
  const downloadLabel = get('browser.download', 'Télécharger')
  const missingFile = get('browser.missingFile', 'Fichier à fournir')
  const oneLabel = get('browser.one', 'ressource')
  const manyLabel = get('browser.many', 'ressources')
  const resetLabel = get('browser.reset', 'Réinitialiser les filtres')
  const prevLabel = get('browser.prev', '‹')
  const nextLabel = get('browser.next', '›')
  const heroTitle = get('hero.title', HERO_TITLE)

  const typeLabel = (option: string) =>
    typeChips.find((chip) => chip.id === option)?.label || (option === ALL ? allF : option)
  const sortLabel = (id: string) => sortRows.find((row) => row.id === id)?.label || id

  const types = [...new Set(PUBLICATIONS.map((item) => item.type))]
  const themes = [...new Set(PUBLICATIONS.flatMap((item) => item.themes))]
  const projects = [...new Set(PUBLICATIONS.map((item) => item.project))]
  const years = [...new Set(PUBLICATIONS.flatMap((item) => item.year ?? []))]
    .sort()
    .reverse()
  const languages = [...new Set(PUBLICATIONS.map((item) => item.language))]
  const formats = [...new Set(PUBLICATIONS.map((item) => item.format))]
  const typeOptions = [
    ALL,
    ...new Set([...typeChips.map((chip) => chip.id).filter((id) => id !== ALL), ...types]),
  ]

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr')
    return PUBLICATIONS.filter((item) => {
      const haystack = [item.title, item.summary, item.project, ...item.themes]
        .join(' ')
        .toLocaleLowerCase('fr')
      return (
        (!needle || haystack.includes(needle)) &&
        (type === ALL || item.type === type) &&
        (theme === ALL || item.themes.includes(theme)) &&
        (project === ALL || item.project === project) &&
        (year === ALL || item.year === year) &&
        (language === ALL || item.language === language) &&
        (format === ALL || item.format === format)
      )
    }).sort((a, b) => {
      if (sort === 'recent') {
        return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
      }
      if (sort === 'downloads') {
        const byFile = Number(Boolean(b.href)) - Number(Boolean(a.href))
        if (byFile !== 0) return byFile
        return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
      }
      return 0
    })
  }, [PUBLICATIONS, format, language, project, query, sort, theme, type, year])

  useEffect(() => {
    setPage(1)
  }, [format, language, project, query, sort, theme, type, year])

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (type !== ALL) params.set('type', type)
    if (theme !== ALL) params.set('theme', theme)
    if (project !== ALL) params.set('project', project)
    if (year !== ALL) params.set('year', year)
    if (language !== ALL) params.set('language', language)
    if (format !== ALL) params.set('format', format)
    if (sort !== 'default') params.set('sort', sort)
    setSearchParams(params, { replace: true })
  }, [format, language, project, query, setSearchParams, sort, theme, type, year])

  const pageCount = Math.ceil(results.length / PAGE_SIZE)
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = [
    query.trim() ? { label: `${searchLabel} : ${query.trim()}`, clear: () => setQuery('') } : null,
    type !== ALL ? { label: typeLabel(type), clear: () => setType(ALL) } : null,
    theme !== ALL ? { label: theme, clear: () => setTheme(ALL) } : null,
    project !== ALL ? { label: project, clear: () => setProject(ALL) } : null,
    year !== ALL ? { label: year, clear: () => setYear(ALL) } : null,
    language !== ALL ? { label: language, clear: () => setLanguage(ALL) } : null,
    format !== ALL ? { label: format, clear: () => setFormat(ALL) } : null,
  ].filter((item): item is { label: string; clear: () => void } => item !== null)

  const reset = () => {
    setQuery('')
    setType(ALL)
    setTheme(ALL)
    setProject(ALL)
    setYear(ALL)
    setLanguage(ALL)
    setFormat(ALL)
    setSort('default')
    setPage(1)
  }

  return (
    <div className="page page--publications">
      <CmsSection id="hero" className="pub-hero" labelledBy="pub-title">
        <div className="pub-hero__copy">
          <EditableText
            section="hero"
            field="title"
            fallback={HERO_TITLE}
            as="h1"
            id="pub-title"
            className="cms-break pub-hero__title"
            label="Titre"
          >
            {heroTitle.split('\n').map((line, index) => (
              <span key={`${line}-${index}`}>
                {index ? <br /> : null}
                {line}
              </span>
            ))}
          </EditableText>
        </div>
        <div className="pub-hero__art">
          <EditableImage
            section="hero"
            field="image"
            fallback="/img/art-pile-livres.webp"
            alt=""
          />
        </div>
      </CmsSection>

      <CmsSection id="browser" className="pub-browser" labelledBy="pub-browser-title">
        <h2 id="pub-browser-title" className="sr-only">
          Catalogue des publications et ressources
        </h2>
        <div className="pub-toolbar">
          <label className="pub-search">
            <span>
              {searchLabel}
              <Pencil section="browser" field="search" fallback="Rechercher" label="Recherche" />
            </span>
            <span className="pub-btn-edit">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
              />
              <Pencil
                section="browser"
                field="placeholder"
                fallback="Titre, projet, thématique…"
                label="Placeholder"
              />
            </span>
          </label>
        </div>

        <div className="pub-controls">
          <div className="pub-filters">
            <Filter
              label={get('browser.type', 'Type de ressource')}
              pencil={
                <Pencil
                  section="browser"
                  field="type"
                  fallback="Type de ressource"
                  label="Filtre type"
                />
              }
              value={type}
              options={typeOptions}
              display={(option) => (option === ALL ? allF : typeLabel(option))}
              open={openFilter === 'type'}
              onToggle={() => setOpenFilter(openFilter === 'type' ? '' : 'type')}
              onChange={setType}
            />
            <Filter
              label={get('browser.theme', 'Thématique')}
              pencil={
                <Pencil section="browser" field="theme" fallback="Thématique" label="Filtre thématique" />
              }
              value={theme}
              options={[ALL, ...themes]}
              display={(option) => (option === ALL ? allF : option)}
              open={openFilter === 'theme'}
              onToggle={() => setOpenFilter(openFilter === 'theme' ? '' : 'theme')}
              onChange={setTheme}
            />
            <Filter
              label={get('browser.project', 'Projet associé')}
              pencil={
                <Pencil
                  section="browser"
                  field="project"
                  fallback="Projet associé"
                  label="Filtre projet"
                />
              }
              value={project}
              options={[ALL, ...projects]}
              display={(option) => (option === ALL ? allF : option)}
              open={openFilter === 'project'}
              onToggle={() => setOpenFilter(openFilter === 'project' ? '' : 'project')}
              onChange={setProject}
            />
            <Filter
              label={get('browser.year', 'Année de publication')}
              pencil={
                <Pencil
                  section="browser"
                  field="year"
                  fallback="Année de publication"
                  label="Filtre année"
                />
              }
              value={year}
              options={[ALL, ...years]}
              display={(option) => (option === ALL ? allF : option)}
              open={openFilter === 'year'}
              onToggle={() => setOpenFilter(openFilter === 'year' ? '' : 'year')}
              onChange={setYear}
            />
            <Filter
              label={get('browser.language', 'Langue')}
              pencil={
                <Pencil section="browser" field="language" fallback="Langue" label="Filtre langue" />
              }
              value={language}
              options={[ALL, ...languages]}
              display={(option) => (option === ALL ? allF : option)}
              open={openFilter === 'language'}
              onToggle={() => setOpenFilter(openFilter === 'language' ? '' : 'language')}
              onChange={setLanguage}
            />
            <Filter
              label={get('browser.format', 'Format')}
              pencil={
                <Pencil section="browser" field="format" fallback="Format" label="Filtre format" />
              }
              value={format}
              options={[ALL, ...formats]}
              display={(option) => (option === ALL ? allF : option)}
              open={openFilter === 'format'}
              onToggle={() => setOpenFilter(openFilter === 'format' ? '' : 'format')}
              onChange={setFormat}
            />
          </div>
          <Filter
            label={get('browser.sort', 'Tri par')}
            pencil={<Pencil section="browser" field="sort" fallback="Tri par" label="Filtre tri" />}
            value={sort}
            options={sortRows.map((row) => row.id)}
            display={sortLabel}
            open={openFilter === 'sort'}
            onToggle={() => setOpenFilter(openFilter === 'sort' ? '' : 'sort')}
            onChange={setSort}
            showValue={false}
          />
        </div>

        <nav className="pub-quick scroll-rail" aria-label="Accès rapide par type de ressource">
          {typeChips.map((chip) => (
            <button
              key={chip.id}
              className={type === chip.id ? 'is-active' : ''}
              type="button"
              onClick={() => setType(chip.id === ALL ? ALL : type === chip.id ? ALL : chip.id)}
            >
              {chip.id === ALL
                ? allF
                : `${chip.label} (${PUBLICATIONS.filter((item) => item.type === chip.id).length})`}
            </button>
          ))}
        </nav>
        <ListDock>
          <EditableJsonList
            section="browser"
            field="types"
            label="Types"
            className="pub-list-cms"
            wrapItems={false}
            manageLabel="Gérer les types"
            fallback={PUBLICATION_TYPE_CHIPS}
            fields={[
              { key: 'id', label: 'Valeur (filtre)', options: [ALL, ...RESOURCE_TYPES], multiple: false },
              { key: 'label', label: 'Libellé affiché' },
            ]}
            emptyItem={{ id: 'Rapport', label: 'Rapport' }}
            renderItem={() => null}
          />
        </ListDock>
        <ListDock>
          <EditableJsonList
            section="browser"
            field="sorts"
            label="Tris"
            className="pub-list-cms"
            wrapItems={false}
            manageLabel="Gérer les tris"
            fallback={PUBLICATION_SORT_FALLBACK}
            fields={[
              {
                key: 'id',
                label: 'Identifiant',
                options: PUBLICATION_SORT_FALLBACK.map((item) => item.id),
                multiple: false,
              },
              { key: 'label', label: 'Libellé affiché' },
            ]}
            emptyItem={{ id: 'default', label: 'par défaut' }}
            renderItem={() => null}
          />
        </ListDock>
        <p className="pub-filter-pencils">
          <Pencil section="browser" field="allF" fallback="Toutes" label="Option Toutes" />
        </p>

        {activeFilters.length > 0 && (
          <div className="pub-active" aria-label="Filtres actifs">
            {activeFilters.map((filter) => (
              <button key={filter.label} type="button" onClick={filter.clear}>
                {filter.label} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="pub-summary">
          <p>
            <strong>{results.length}</strong> {results.length === 1 ? oneLabel : manyLabel}
            <Pencil section="browser" field="one" fallback="ressource" label="Singulier" />
            <Pencil section="browser" field="many" fallback="ressources" label="Pluriel" />
          </p>
          <span className="pub-btn-edit">
            <button type="button" onClick={reset}>
              {resetLabel}
            </button>
            <Pencil
              section="browser"
              field="reset"
              fallback="Réinitialiser les filtres"
              label="Réinitialiser"
            />
          </span>
        </div>

        <ListDock>
          <EditableJsonList
            section="browser"
            field="items"
            label="Publications"
            className="pub-list-cms"
            wrapItems={false}
            manageLabel="Gérer les publications"
            fallback={PUBLICATION_LIST_FALLBACK}
            fields={[
              { key: 'id', label: 'Identifiant URL' },
              { key: 'title', label: 'Titre' },
              { key: 'type', label: 'Type', options: [...RESOURCE_TYPES], multiple: false },
              { key: 'summary', label: 'Résumé', multiline: true },
              { key: 'project', label: 'Nom du projet' },
              {
                key: 'projectSlug',
                label: 'Logo projet',
                options: PROJECTS.map((item) => item.slug),
                optionLabels: Object.fromEntries(PROJECTS.map((item) => [item.slug, item.acronym])),
                multiple: false,
              },
              { key: 'publishedAt', label: 'Publication (AAAA-MM-JJ)' },
              { key: 'dateLabel', label: 'Date affichée' },
              { key: 'year', label: 'Année' },
              { key: 'language', label: 'Langue' },
              { key: 'format', label: 'Format' },
              { key: 'themes', label: 'Thématiques', multiline: true },
              { key: 'href', label: 'Fichier (/docs…)' },
              { key: 'fileSize', label: 'Poids' },
              { key: 'cover', label: 'Couverture' },
            ]}
            emptyItem={{
              ...PUBLICATION_LIST_FALLBACK[0],
              id: '',
              title: '',
              summary: '',
              href: '',
              cover: '',
            }}
            renderItem={() => null}
          />
        </ListDock>
        <p className="pub-filter-pencils">
          <Pencil section="browser" field="download" fallback="Télécharger" label="Télécharger" />
          <Pencil
            section="browser"
            field="missingFile"
            fallback="Fichier à fournir"
            label="Fichier manquant"
          />
        </p>

        {results.length > 0 ? (
          <>
            <ul className="pub-grid">
              {visible.map((item) => (
                <li key={item.id}>
                  <article>
                    <div className="pub-cover">
                      {item.cover ? (
                        <img
                          className="pub-cover__page"
                          src={assetUrl(item.cover)}
                          alt={`Couverture : ${item.title}`}
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={assetUrl(`/img/logo-${item.projectSlug}.png`)}
                          alt=""
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="pub-card__body">
                      <div className="pub-card__meta">
                        <span>{item.type}</span>
                        <b>{item.language}</b>
                      </div>
                      <h2>
                        <Link to={`/publications/${item.id}`}>{item.title}</Link>
                      </h2>
                      <span>{item.project}</span>
                      <small>{item.summary}</small>
                      <div className="pub-card__tags">
                        <b>
                          {item.format}
                          {item.fileSize ? ` · ${item.fileSize}` : ''}
                        </b>
                        {item.themes.slice(0, 2).map((themeName) => (
                          <b key={themeName}>{themeName}</b>
                        ))}
                      </div>
                    </div>
                    <div className="pub-card__foot">
                      {item.publishedAt ? (
                        <time dateTime={item.publishedAt}>
                          <img src={assetUrl('/img/icon-calendar.png')} alt="" aria-hidden="true" />
                          {item.dateLabel}
                        </time>
                      ) : (
                        <span className="pub-card__undated">
                          <img src={assetUrl('/img/icon-calendar.png')} alt="" aria-hidden="true" />
                          {item.dateLabel}
                        </span>
                      )}
                      {item.href ? (
                        <a href={item.href} download target="_blank" rel="noreferrer">
                          {downloadLabel}
                        </a>
                      ) : (
                        <em>{missingFile}</em>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            {pageCount > 1 ? (
              <nav className="pub-pagination" aria-label={t('a11y.pagination_pubs', 'Pagination des publications')}>
                <span className="pub-btn-edit">
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
                <span className="pub-btn-edit">
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
            ) : null}
          </>
        ) : (
          <div className="pub-empty">
            <strong>
              {get('browser.empty', 'Aucune ressource ne correspond à ces critères.')}
              <Pencil
                section="browser"
                field="empty"
                fallback="Aucune ressource ne correspond à ces critères."
                label="Aucun résultat"
              />
            </strong>
            <EditableText
              section="browser"
              field="emptyHint"
              fallback="Élargissez la recherche ou réinitialisez les filtres."
              as="p"
              label="Conseil vide"
            />
            <span className="pub-btn-edit">
              <button type="button" onClick={reset}>
                {resetLabel}
              </button>
              <Pencil
                section="browser"
                field="reset"
                fallback="Réinitialiser les filtres"
                label="Réinitialiser"
              />
            </span>
          </div>
        )}
      </CmsSection>
    </div>
  )
}

function Filter<T extends string>({
  label,
  pencil,
  value,
  options,
  display,
  open,
  onToggle,
  onChange,
  showValue = true,
}: {
  label: string
  pencil?: ReactNode
  value: T
  options: readonly T[]
  display: (option: T) => string
  open: boolean
  onToggle: () => void
  onChange: (value: T) => void
  showValue?: boolean
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [onToggle, open])

  return (
    <div ref={root} className={`pub-filter${open ? ' is-open' : ''}`}>
      <div className="pub-title-row">
        <button type="button" aria-expanded={open} onClick={onToggle}>
          <span>
            {label}
            {showValue && value !== ALL && display(value) !== label ? (
              <small>{display(value)}</small>
            ) : null}
          </span>
          <b className="pub-filter__chev" aria-hidden="true" />
        </button>
        {pencil}
      </div>
      {open ? (
        <div className="pub-filter__menu">
          <ul>
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  className={option === value ? 'is-active' : ''}
                  onClick={() => {
                    onChange(option)
                    onToggle()
                  }}
                >
                  {display(option)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
