import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './mecanismes-appui.css'

const ALL = 'Tous'
const PAGE_SIZE = 9

const MECHANISM_FALLBACK = PROJECTS.flatMap((project) =>
  project.components.map((component, index) => ({
    id: `${project.slug}-${index}`,
    projectSlug: project.slug,
    project: project.acronym,
    name: component.name,
    tagline: component.tagline,
    description: component.description,
    results: component.results.join('\n'),
    sectors: component.sectors.join(', '),
    mark: component.mark || '',
  })),
)

type Mechanism = {
  id: string
  projectSlug: string
  project: string
  theme: string
  name: string
  tagline: string
  description: string
  results: string[]
  sectors: string[]
  mark: string
}

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
  return <div className="mec-edit-region">{children}</div>
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
      className="mec-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function linesOf(raw: string, fallback: string[]) {
  const parts = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  return parts.length ? parts : fallback
}

function asMechanisms(raw: string): Mechanism[] {
  const list = parseJsonRows(raw)
  const rows = list?.length ? list : MECHANISM_FALLBACK
  return rows.map((row, index) => {
    const fb = MECHANISM_FALLBACK[index]
    const projectSlug = String(row.projectSlug || fb?.projectSlug || 'jeuness')
    const source = PROJECTS.find((item) => item.slug === projectSlug)
    const results = String(row.results || fb?.results || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const sectors = String(row.sectors || fb?.sectors || '')
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
    return {
      id: String(row.id || fb?.id || `${projectSlug}-${index}`),
      projectSlug,
      project: String(row.project || source?.acronym || fb?.project || projectSlug),
      theme: source?.theme || projectSlug,
      name: String(row.name || fb?.name || ''),
      tagline: String(row.tagline || fb?.tagline || ''),
      description: String(row.description || fb?.description || ''),
      results,
      sectors,
      mark: String(row.mark || fb?.mark || ''),
    }
  })
}

export default function MecanismesAppuiPage() {
  const { get } = useContent()
  const [query, setQuery] = useState('')
  const [project, setProject] = useState(ALL)
  const [sector, setSector] = useState(ALL)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const titleLines = linesOf(get('hero.title', "MÉCANISMES\nD’APPUI"), ['MÉCANISMES', 'D’APPUI'])
  const allLabel = get('browser.all', 'Tous les projets')
  const searchLabel = get('browser.search', 'Recherche')
  const searchPlaceholder = get('browser.placeholder', 'Mécanisme, résultat, secteur…')
  const projectLabel = get('browser.project', 'Projet')
  const sectorLabel = get('browser.sector', 'Secteur')
  const resetLabel = get('browser.reset', 'Réinitialiser')
  const moreLabel = get('browser.more', 'Afficher 9 dispositifs supplémentaires')
  const emptyTitle = get('browser.empty', 'Aucun dispositif ne correspond à ces critères.')
  const countLabel = get('browser.countLabel', 'dispositifs et composantes documentés')
  const cardLink = get('browser.cardLink', 'Voir le projet')

  const mechanisms = asMechanisms(get('browser.items', JSON.stringify(MECHANISM_FALLBACK)))

  const sectors = [...new Set(mechanisms.flatMap((item) => item.sectors))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr')
    return mechanisms.filter((item) => {
      const haystack = [
        item.name,
        item.tagline,
        item.description,
        item.project,
        ...item.results,
        ...item.sectors,
      ]
        .join(' ')
        .toLocaleLowerCase('fr')

      return (
        (!needle || haystack.includes(needle)) &&
        (project === ALL || item.project === project) &&
        (sector === ALL || item.sectors.includes(sector))
      )
    })
  }, [mechanisms, project, query, sector])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [project, query, sector])

  const visible = results.slice(0, visibleCount)

  const reset = () => {
    setQuery('')
    setProject(ALL)
    setSector(ALL)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="page page--mechanisms">
      <CmsSection id="hero" className="mechanisms-hero" labelledBy="mechanisms-title">
        <EditableText
          section="hero"
          field="title"
          fallback={"MÉCANISMES\nD’APPUI"}
          as="h1"
          id="mechanisms-title"
          className="cms-break mechanisms-hero__title"
          label="Titre"
        >
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="browser" className="mechanisms-browser" labelledBy="mechanisms-title">
        <p className="visually-hidden">Dispositifs des projets EU4Youth</p>
        <div className="mechanisms-intro">
          <EditableText
            section="browser"
            field="intro"
            fallback="Les dispositifs et composantes ci-dessous sont ceux décrits dans les fiches des six projets EU4Youth."
            as="p"
            label="Introduction"
          />
          <CountUp value={String(mechanisms.length)} className="mechanisms-intro__figure" />
          <span className="mec-title-row">
            <span className="mechanisms-intro__count">{countLabel}</span>
            <Pencil
              section="browser"
              field="countLabel"
              fallback="dispositifs et composantes documentés"
              label="Libellé du compteur"
            />
          </span>
        </div>

        <ListDock>
          <EditableJsonList
            section="browser"
            field="items"
            label="Dispositifs"
            className="mec-list-cms"
            wrapItems={false}
            manageLabel="Gérer les dispositifs"
            fallback={MECHANISM_FALLBACK}
            fields={[
              {
                key: 'projectSlug',
                label: 'Projet',
                options: PROJECTS.map((item) => item.slug),
                optionLabels: Object.fromEntries(
                  PROJECTS.map((item) => [item.slug, item.acronym]),
                ),
                multiple: false,
              },
              { key: 'name', label: 'Nom du dispositif' },
              { key: 'tagline', label: 'Sous-titre' },
              { key: 'description', label: 'Texte', multiline: true },
              { key: 'results', label: 'Résultats (une ligne chacun)', multiline: true },
              { key: 'sectors', label: 'Secteurs (virgules)' },
            ]}
            emptyItem={{
              id: 'nouveau',
              projectSlug: 'jeuness',
              project: "Jeun'ESS",
              name: '',
              tagline: '',
              description: '',
              results: '',
              sectors: '',
              mark: '',
            }}
            renderItem={() => null}
          />

          <nav className="mechanisms-projects" aria-label="Filtrer par projet">
            <button
              className={project === ALL ? 'is-active' : ''}
              type="button"
              onClick={() => setProject(ALL)}
            >
              {allLabel}
              <strong>{mechanisms.length}</strong>
            </button>
            {PROJECTS.map((item) => {
              const count = mechanisms.filter((mechanism) => mechanism.projectSlug === item.slug).length
              return (
                <button
                  key={item.slug}
                  className={project === item.acronym ? 'is-active' : ''}
                  style={{ '--mechanism-project': `var(--p-${item.theme})` } as CSSProperties}
                  type="button"
                  onClick={() => setProject(project === item.acronym ? ALL : item.acronym)}
                >
                  {item.acronym}
                  <strong>{count}</strong>
                </button>
              )
            })}
          </nav>
          <p className="mec-filter-pencils">
            <Pencil section="browser" field="all" fallback="Tous les projets" label="Tous" />
          </p>

          <div className="mechanisms-controls">
            <label className="mechanisms-search">
              <span className="mec-title-row">
                {searchLabel}
                <Pencil section="browser" field="search" fallback="Recherche" label="Recherche" />
              </span>
              <div>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                />
                <b aria-hidden="true">⌕</b>
              </div>
              <Pencil
                section="browser"
                field="placeholder"
                fallback="Mécanisme, résultat, secteur…"
                label="Placeholder"
              />
            </label>

            <label className="mechanisms-filter">
              <span className="mec-title-row">
                {projectLabel}
                <Pencil section="browser" field="project" fallback="Projet" label="Filtre projet" />
              </span>
              <select value={project} onChange={(event) => setProject(event.target.value)}>
                <option value={ALL}>{ALL}</option>
                {PROJECTS.map((item) => (
                  <option key={item.slug} value={item.acronym}>
                    {item.acronym}
                  </option>
                ))}
              </select>
            </label>

            <label className="mechanisms-filter">
              <span className="mec-title-row">
                {sectorLabel}
                <Pencil section="browser" field="sector" fallback="Secteur" label="Filtre secteur" />
              </span>
              <select value={sector} onChange={(event) => setSector(event.target.value)}>
                <option>{ALL}</option>
                {sectors.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mechanisms-results__head" aria-live="polite">
            <p>
              <strong>{results.length}</strong>{' '}
              {results.length === 1 ? 'résultat' : 'résultats'}
            </p>
            {(query || project !== ALL || sector !== ALL) && (
              <span className="mec-title-row">
                <button type="button" onClick={reset}>
                  {resetLabel}
                </button>
                <Pencil section="browser" field="reset" fallback="Réinitialiser" label="Réinitialiser" />
              </span>
            )}
          </div>

          {results.length > 0 ? (
            <>
              <ul className="mechanisms-grid">
                {visible.map((item, index) => (
                  <li
                    key={item.id}
                    style={{ '--mechanism-accent': `var(--p-${item.theme})` } as CSSProperties}
                  >
                    <article className="mechanism-card">
                      <header>
                        <img
                          src={assetUrl(`/img/logo-${item.projectSlug}.png`)}
                          alt=""
                          loading="lazy"
                        />
                        <span>{item.project}</span>
                      </header>
                      <div className="mechanism-card__body">
                        <small>{String(index + 1).padStart(2, '0')}</small>
                        <h2>{item.name}</h2>
                        <h3>{item.tagline}</h3>
                        <p>{item.description}</p>
                        {item.results.length > 0 && (
                          <ul className="mechanism-card__results">
                            {item.results.map((result) => (
                              <li key={result}>{result}</li>
                            ))}
                          </ul>
                        )}
                        <div className="mechanism-card__sectors">
                          {item.sectors.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <Link to={`/projets/${item.projectSlug}`}>{cardLink}</Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              {visibleCount < results.length && (
                <div className="mechanisms-more">
                  <span className="mec-title-row">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      {moreLabel}
                    </button>
                    <Pencil
                      section="browser"
                      field="more"
                      fallback="Afficher 9 dispositifs supplémentaires"
                      label="Bouton plus"
                    />
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="mechanisms-empty">
              <strong>{emptyTitle}</strong>
              <Pencil
                section="browser"
                field="empty"
                fallback="Aucun dispositif ne correspond à ces critères."
                label="Message vide"
              />
              <button type="button" onClick={reset}>
                {resetLabel}
              </button>
            </div>
          )}
        </ListDock>
        <p className="mec-card-link-edit">
          <Pencil section="browser" field="cardLink" fallback="Voir le projet" label="Lien carte" />
        </p>
      </CmsSection>

      <CmsSection id="cta" className="mechanisms-cta" labelledBy="mechanisms-cta-title">
        <div>
          <div className="mec-title-row">
            <p>{get('cta.eyebrow', 'ÉCOSYSTÈME EU4YOUTH')}</p>
            <Pencil section="cta" field="eyebrow" fallback="ÉCOSYSTÈME EU4YOUTH" label="Sur-titre" />
          </div>
          <div className="mec-title-row">
            <h2 id="mechanisms-cta-title">{get('cta.title', 'DU DISPOSITIF AU PROJET')}</h2>
            <Pencil section="cta" field="title" fallback="DU DISPOSITIF AU PROJET" label="Titre" />
          </div>
          <EditableText
            section="cta"
            field="body"
            fallback="Retrouvez les objectifs, résultats et partenaires de chacun des six projets."
            as="span"
            className="mechanisms-cta__body"
            label="Texte"
          />
        </div>
        <nav aria-label="Découvrir les contenus associés">
          <span className="mec-btn-edit">
            <Link to="/projets">{get('cta.projects', 'Voir les projets')}</Link>
            <Pencil section="cta" field="projects" fallback="Voir les projets" label="Bouton projets" />
          </span>
          <span className="mec-btn-edit">
            <Link to="/partenaires">{get('cta.partners', 'Voir les partenaires')}</Link>
            <Pencil
              section="cta"
              field="partners"
              fallback="Voir les partenaires"
              label="Bouton partenaires"
            />
          </span>
        </nav>
      </CmsSection>
    </div>
  )
}
