import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS as EVENTS_FALLBACK } from '../data/events'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import PeriodCalendarFilter, {
  matchesPeriodFilter,
  periodFilterLabel,
  type PeriodFilterValue,
} from '../components/PeriodCalendarFilter'
import '../components/period-calendar.css'
import './agenda.css'

type Tab = 'upcoming' | 'past'

const TODAY = new Date().toLocaleDateString('sv-SE')
const HERO_TITLE = 'AGENDA'

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
      className="agenda-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function AgendaPage() {
  const { get } = useContent()
  const EVENTS = useCatalog('events', EVENTS_FALLBACK)
  const hasUpcoming = EVENTS.some((event) => event.startsAt >= TODAY)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('Tous')
  const [period, setPeriod] = useState<PeriodFilterValue>({ mode: 'all' })
  const [periodOpen, setPeriodOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)

  const heroTitle = get('hero.title', HERO_TITLE)
  const upcomingLabel = get('browser.upcoming', 'À venir')
  const pastLabel = get('browser.past', 'Événements passés')
  const notice = get(
    'browser.notice',
    'Le calendrier à venir est prêt à recevoir les prochains rendez-vous confirmés. L’historique documenté reste accessible dans l’onglet « Événements passés ».',
  )
  const searchLabel = get('browser.search', 'Recherche')
  const searchPlaceholder = get('browser.placeholder', 'Titre, projet, lieu…')
  const filtersTitle = get('browser.filtersTitle', 'Filtrer par')
  const resetLabel = get('browser.reset', 'Réinitialiser')
  const periodLabel = get('browser.period', 'Période')
  const projectLabel = get('browser.project', 'Projet associé')
  const allM = get('browser.allM', 'Tous')
  const oneLabel = get('browser.one', 'événement')
  const manyLabel = get('browser.many', 'événements')
  const sortUpcoming = get('browser.sortUpcoming', 'Du plus proche au plus lointain')
  const sortPast = get('browser.sortPast', 'Du plus récent au plus ancien')
  const cardDetail = get('browser.cardDetail', 'Voir la fiche')
  const cardProject = get('browser.cardProject', 'Découvrir le projet')
  const emptyReady = get('browser.emptyReady', 'CALENDRIER PRÊT')
  const emptyUpcomingTitle = get(
    'browser.emptyUpcomingTitle',
    'Aucun événement à venir n’est confirmé pour le moment.',
  )
  const emptyUpcomingBody = get(
    'browser.emptyUpcomingBody',
    'Les rendez-vous seront publiés ici dès qu’une date, un lieu et un porteur auront été confirmés.',
  )
  const emptyPastCta = get('browser.emptyPastCta', 'Consulter les événements passés')
  const emptyFiltered = get('browser.emptyFiltered', 'Aucun événement ne correspond à ces critères.')
  const emptyReset = get('browser.emptyReset', 'Réinitialiser les filtres')
  const ctaNews = get('browser.ctaNews', 'Actualités')
  const ctaOpportunities = get('browser.ctaOpportunities', 'Opportunités')

  const projects = useMemo(() => {
    const seen = new Map<string, string>()
    for (const event of EVENTS) {
      const key = (event.projectSlug || event.project).toLocaleLowerCase('fr')
      if (!seen.has(key)) seen.set(key, event.project)
    }
    return [...seen.values()]
  }, [EVENTS])
  const markedDates = useMemo(() => EVENTS.map((event) => event.startsAt), [EVENTS])

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('fr')
    const selectedKey = project.toLocaleLowerCase('fr')
    return EVENTS.filter((event) => {
      const isUpcoming = event.startsAt >= TODAY
      const haystack = [event.title, event.summary, event.project, event.location, event.format]
        .join(' ')
        .toLocaleLowerCase('fr')
      const eventKey = (event.projectSlug || event.project).toLocaleLowerCase('fr')
      return (
        (tab === 'upcoming' ? isUpcoming : !isUpcoming) &&
        (project === 'Tous' ||
          project === allM ||
          event.project === project ||
          eventKey === selectedKey) &&
        matchesPeriodFilter(event.startsAt, period) &&
        (!needle || haystack.includes(needle))
      )
    }).sort((a, b) =>
      tab === 'upcoming' ? a.startsAt.localeCompare(b.startsAt) : b.startsAt.localeCompare(a.startsAt),
    )
  }, [EVENTS, allM, period, project, query, tab])

  const reset = () => {
    setQuery('')
    setProject('Tous')
    setPeriod({ mode: 'all' })
  }

  const showPast = () => {
    setTab('past')
    reset()
  }

  return (
    <div className="page page--agenda">
      <CmsSection id="hero" className="agenda-hero" labelledBy="agenda-title">
        <p className="agenda-eyebrow">
          <EditableText section="hero" field="badge" fallback="ÉVÉNEMENTS" as="span" label="Sur-titre" />
        </p>
        <EditableText
          section="hero"
          field="title"
          fallback={HERO_TITLE}
          as="h1"
          id="agenda-title"
          className="agenda-hero__title"
          label="Titre"
        >
          {heroTitle.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index ? <br /> : null}
              {line}
            </span>
          ))}
        </EditableText>
        <Pencil section="hero" field="mark" fallback="EU\n4Y" label="Filigrane" />
      </CmsSection>

      <CmsSection id="browser" className="agenda-browser" labelledBy="agenda-browser-title">
        <h2 id="agenda-browser-title" className="sr-only">
          Agenda des événements EU4Youth
        </h2>
        <nav className="agenda-tabs" aria-label="Période des événements">
          <span className="agenda-btn-edit">
            <button
              type="button"
              className={tab === 'upcoming' ? 'is-active' : ''}
              aria-pressed={tab === 'upcoming'}
              onClick={() => setTab('upcoming')}
            >
              {upcomingLabel}
            </button>
            <Pencil section="browser" field="upcoming" fallback="À venir" label="Onglet à venir" />
          </span>
          <span className="agenda-btn-edit">
            <button
              type="button"
              className={tab === 'past' ? 'is-active' : ''}
              aria-pressed={tab === 'past'}
              onClick={() => setTab('past')}
            >
              {pastLabel}
            </button>
            <Pencil
              section="browser"
              field="past"
              fallback="Événements passés"
              label="Onglet passés"
            />
          </span>
        </nav>

        {hasUpcoming ? null : (
          <p className="agenda-note">
            {notice}
            <Pencil
              section="browser"
              field="notice"
              fallback="Le calendrier à venir est prêt à recevoir les prochains rendez-vous confirmés. L’historique documenté reste accessible dans l’onglet « Événements passés »."
              label="Note calendrier"
            />
          </p>
        )}

        <div className="agenda-layout">
          <aside className="agenda-filters">
            <label className="agenda-search">
              <span>
                {searchLabel}
                <Pencil section="browser" field="search" fallback="Recherche" label="Recherche" />
              </span>
              <div className="agenda-btn-edit">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                />
                <Pencil
                  section="browser"
                  field="placeholder"
                  fallback="Titre, projet, lieu…"
                  label="Placeholder"
                />
                <b aria-hidden="true">⌕</b>
              </div>
            </label>

            <div className="agenda-filters__head">
              <h2>
                {filtersTitle}
                <Pencil
                  section="browser"
                  field="filtersTitle"
                  fallback="Filtrer par"
                  label="Titre filtres"
                />
              </h2>
              <span className="agenda-btn-edit">
                <button type="button" onClick={reset}>
                  {resetLabel}
                </button>
                <Pencil section="browser" field="reset" fallback="Réinitialiser" label="Réinitialiser" />
              </span>
            </div>

            <div className={`agenda-filter agenda-filter--calendar${periodOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                aria-expanded={periodOpen}
                onClick={() => setPeriodOpen((current) => !current)}
              >
                <span>
                  {periodLabel}
                  <Pencil section="browser" field="period" fallback="Période" label="Période" />
                </span>
                <b className="agenda-filter__chev" aria-hidden="true" />
              </button>
              {periodOpen ? (
                <PeriodCalendarFilter
                  value={period}
                  markedDates={markedDates}
                  onChange={setPeriod}
                  accent="teal"
                />
              ) : null}
            </div>

            <div className={`agenda-filter${projectOpen ? ' is-open' : ''}`}>
              <div className="agenda-title-row">
                <button
                  type="button"
                  aria-expanded={projectOpen}
                  onClick={() => setProjectOpen((current) => !current)}
                >
                  <span>{projectLabel}</span>
                  <b className="agenda-filter__chev" aria-hidden="true" />
                </button>
                <Pencil
                  section="browser"
                  field="project"
                  fallback="Projet associé"
                  label="Filtre projet"
                />
              </div>
              {projectOpen ? (
                <ul className="agenda-filter__list">
                  {['Tous', ...projects].map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className={item === project ? 'is-active' : ''}
                        onClick={() => {
                          setProject(item)
                          setProjectOpen(false)
                        }}
                      >
                        {item === 'Tous' ? allM : item}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="agenda-filter-pencils">
                <Pencil section="browser" field="allM" fallback="Tous" label="Tous" />
              </p>
            </div>
          </aside>

          <div className="agenda-results">
            <div className="agenda-results__head" aria-live="polite">
              <p>
                <strong>{results.length}</strong> {results.length === 1 ? oneLabel : manyLabel}
                <Pencil section="browser" field="one" fallback="événement" label="Singulier" />
                <Pencil section="browser" field="many" fallback="événements" label="Pluriel" />
              </p>
              <span className="agenda-card-pencils">
                <Pencil
                  section="browser"
                  field="cardDetail"
                  fallback="Voir la fiche"
                  label="Lien fiche"
                />
                <Pencil
                  section="browser"
                  field="cardProject"
                  fallback="Découvrir le projet"
                  label="Lien projet"
                />
              </span>
              {period.mode !== 'all' ? (
                <span>{periodFilterLabel(period)}</span>
              ) : (
                <span>
                  {tab === 'upcoming' ? sortUpcoming : sortPast}
                  <Pencil
                    section="browser"
                    field="sortUpcoming"
                    fallback="Du plus proche au plus lointain"
                    label="Tri à venir"
                  />
                  <Pencil
                    section="browser"
                    field="sortPast"
                    fallback="Du plus récent au plus ancien"
                    label="Tri passés"
                  />
                </span>
              )}
            </div>

            {results.length > 0 ? (
              <ul className="agenda-grid">
                {results.map((event) => (
                  <li key={event.id}>
                    <article className="agenda-card">
                      <img src={assetUrl(event.image)} alt="" />
                      <div className="agenda-card__date">
                        <time dateTime={event.startsAt}>{event.dateLabel}</time>
                        <span>{event.location}</span>
                      </div>
                      <div className="agenda-card__body">
                        <div className="agenda-card__meta">
                          <span>{event.project}</span>
                          <b>{event.format}</b>
                        </div>
                        <h2>
                          <Link to={`/agenda/${event.id}`}>{event.title}</Link>
                        </h2>
                        <p className="agenda-card__summary">{event.summary}</p>
                        <small>Source&nbsp;: {event.source}</small>
                        <div className="agenda-card__actions">
                          <Link to={`/agenda/${event.id}`}>{cardDetail}</Link>
                          <Link to={`/projets/${event.projectSlug}`}>{cardProject}</Link>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="agenda-empty">
                {tab === 'upcoming' ? (
                  <>
                    <span aria-hidden="true">◷</span>
                    <small>
                      {emptyReady}
                      <Pencil
                        section="browser"
                        field="emptyReady"
                        fallback="CALENDRIER PRÊT"
                        label="Sur-titre vide"
                      />
                    </small>
                    <strong>{emptyUpcomingTitle}</strong>
                    <Pencil
                      section="browser"
                      field="emptyUpcomingTitle"
                      fallback="Aucun événement à venir n’est confirmé pour le moment."
                      label="Titre vide à venir"
                    />
                    <p>
                      {emptyUpcomingBody}
                      <Pencil
                        section="browser"
                        field="emptyUpcomingBody"
                        fallback="Les rendez-vous seront publiés ici dès qu’une date, un lieu et un porteur auront été confirmés."
                        label="Texte vide à venir"
                      />
                    </p>
                    <span className="agenda-btn-edit">
                      <button type="button" onClick={showPast}>
                        {emptyPastCta}
                      </button>
                      <Pencil
                        section="browser"
                        field="emptyPastCta"
                        fallback="Consulter les événements passés"
                        label="Lien passés"
                      />
                    </span>
                    <nav className="agenda-empty__links" aria-label="Suivre le programme">
                      <span className="agenda-btn-edit">
                        <Link to="/actualites">{ctaNews}</Link>
                        <Pencil section="browser" field="ctaNews" fallback="Actualités" label="Lien actualités" />
                      </span>
                      <span className="agenda-btn-edit">
                        <Link to="/opportunites">{ctaOpportunities}</Link>
                        <Pencil
                          section="browser"
                          field="ctaOpportunities"
                          fallback="Opportunités"
                          label="Lien opportunités"
                        />
                      </span>
                    </nav>
                  </>
                ) : (
                  <>
                    <strong>{emptyFiltered}</strong>
                    <Pencil
                      section="browser"
                      field="emptyFiltered"
                      fallback="Aucun événement ne correspond à ces critères."
                      label="Texte vide filtres"
                    />
                    <span className="agenda-btn-edit">
                      <button type="button" onClick={reset}>
                        {emptyReset}
                      </button>
                      <Pencil
                        section="browser"
                        field="emptyReset"
                        fallback="Réinitialiser les filtres"
                        label="Réinitialiser vide"
                      />
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CmsSection>
    </div>
  )
}
