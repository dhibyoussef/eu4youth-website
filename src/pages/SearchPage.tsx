import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useContent } from '../cms/ContentProvider'
import {
  getCatalogVersion,
  getSearchSuggestions,
  getSearchTypeLabels,
  querySearch,
  subscribeCatalogs,
  type SearchHit,
} from '../lib/search'
import './search.css'

const HERO_TITLE = 'RECHERCHE'
const ALL_M = 'Tous'

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
      className="search-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function Result({ result }: { result: SearchHit }) {
  return (
    <>
      <span>{result.typeLabel}</span>
      <h3>{result.title}</h3>
      <p>{result.summary}</p>
    </>
  )
}

export default function SearchPage() {
  const { get } = useContent()
  const catalogVersion = useSyncExternalStore(subscribeCatalogs, getCatalogVersion)
  const [params, setParams] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const allM = get('browser.allM', ALL_M)
  const selectedType = params.get('type')?.trim() || allM
  const [draft, setDraft] = useState(query)
  const heroTitle = get('hero.title', HERO_TITLE)
  const searchLabel = get('browser.search', 'Rechercher dans le site')
  const searchPlaceholder = get('browser.placeholder', 'Projet, terme, publication…')
  const submitLabel = get('browser.submit', 'Rechercher')
  const typeLabel = get('browser.type', 'Type de contenu')
  const oneLabel = get('results.one', 'résultat')
  const manyLabel = get('results.many', 'résultats')
  const forQuery = get('results.forQuery', 'pour')
  const hint = get('results.hint', 'Saisissez au moins deux caractères.')
  const empty = get(
    'results.empty',
    'Aucun résultat. Essayez un projet, un territoire ou un terme plus général.',
  )

  useEffect(() => {
    setDraft(query)
  }, [query])

  const types = useMemo(() => {
    const labels = getSearchTypeLabels().filter((label) => label !== ALL_M)
    return [allM, ...labels]
  }, [allM, catalogVersion])

  const results = useMemo(
    () => querySearch(query, selectedType === allM ? ALL_M : selectedType),
    [allM, catalogVersion, query, selectedType],
  )
  const suggestions = useMemo(() => getSearchSuggestions(draft), [catalogVersion, draft])

  return (
    <div className="page search-page">
      <CmsSection id="hero" className="search-page__hero" labelledBy="search-title">
        <p className="search-eyebrow">
          <EditableText
            section="hero"
            field="badge"
            fallback="EU4YOUTH TUNISIE"
            as="span"
            label="Sur-titre"
          />
        </p>
        <EditableText
          section="hero"
          field="title"
          fallback={HERO_TITLE}
          as="h1"
          id="search-title"
          className="search-hero__title"
          label="Titre"
        >
          {heroTitle.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index ? <br /> : null}
              {line}
            </span>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="browser" className="search-page__browser" labelledBy="search-browser-title">
        <h2 id="search-browser-title" className="sr-only">
          Formulaire de recherche
        </h2>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const nextQuery = String(formData.get('q') ?? '').trim()
            const nextType = String(formData.get('type') ?? allM)
            setParams({
              q: nextQuery,
              ...(nextType === allM ? {} : { type: nextType }),
            })
          }}
        >
          <span className="search-btn-edit">
            <label htmlFor="site-search-page">{searchLabel}</label>
            <Pencil
              section="browser"
              field="search"
              fallback="Rechercher dans le site"
              label="Recherche"
            />
          </span>
          <div className="search-btn-edit">
            <input
              id="site-search-page"
              name="q"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              list="site-search-suggestions"
              minLength={2}
              required
              placeholder={searchPlaceholder}
            />
            <Pencil
              section="browser"
              field="placeholder"
              fallback="Projet, terme, publication…"
              label="Placeholder"
            />
            <button type="submit">{submitLabel}</button>
            <Pencil section="browser" field="submit" fallback="Rechercher" label="Bouton" />
          </div>
          <datalist id="site-search-suggestions">
            {suggestions.map((item) => (
              <option key={item.id} value={item.title}>
                {item.typeLabel}
              </option>
            ))}
          </datalist>
          <label className="search-page__type" htmlFor="site-search-type">
            <span className="search-btn-edit">
              {typeLabel}
              <Pencil section="browser" field="type" fallback="Type de contenu" label="Type" />
            </span>
            <select id="site-search-type" name="type" value={selectedType} onChange={(event) => {
              setParams({
                q: query,
                ...(event.target.value === allM ? {} : { type: event.target.value }),
              })
            }}>
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <Pencil section="browser" field="allM" fallback="Tous" label="Tous" />
          </label>
        </form>
      </CmsSection>

      <CmsSection id="results" className="search-page__results" labelledBy="search-results-title">
        <h2 id="search-results-title" className="sr-only">
          Résultats de recherche
        </h2>
        {query.trim().length < 2 ? (
          <p className="search-page__empty">
            {hint}
            <Pencil
              section="results"
              field="hint"
              fallback="Saisissez au moins deux caractères."
              label="Consigne"
            />
          </p>
        ) : results.length ? (
          <>
            <p className="search-page__count">
              {results.length} {results.length === 1 ? oneLabel : manyLabel} {forQuery} « {query} »
              <Pencil section="results" field="one" fallback="résultat" label="Singulier" />
              <Pencil section="results" field="many" fallback="résultats" label="Pluriel" />
              <Pencil section="results" field="forQuery" fallback="pour" label="Pour" />
            </p>
            <ul>
              {results.map((item) => (
                <li key={item.id}>
                  <Link to={item.href}>
                    <Result result={item} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="search-page__empty">
            {empty}
            <Pencil
              section="results"
              field="empty"
              fallback="Aucun résultat. Essayez un projet, un territoire ou un terme plus général."
              label="Aucun résultat"
            />
          </p>
        )}
      </CmsSection>
    </div>
  )
}
