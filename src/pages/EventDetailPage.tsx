import { Link, Navigate, useParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ShareActions from '../components/ShareActions'
import { EVENTS as EVENTS_FALLBACK, resolveEventSourcePublicationId } from '../data/events'
import { PUBLICATIONS as PUBLICATIONS_FALLBACK } from '../data/publications'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalog, useCatalogQuery } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './content-detail.css'

const TODAY = new Date().toLocaleDateString('sv-SE')

function Pencil({ field, fallback, label }: { field: string; fallback: string; label: string }) {
  return (
    <EditableText
      chipOnly
      className="content-detail__pencil"
      section="fiche"
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const { get } = useContent()
  const { items: EVENTS, ready } = useCatalogQuery('events', EVENTS_FALLBACK)
  const PUBLICATIONS = useCatalog('publications', PUBLICATIONS_FALLBACK)
  const event = EVENTS.find((item) => item.id === id)
  if (!ready && !event) return null
  if (!event) return <Navigate to="/agenda" replace />

  const pathname = `/agenda/${event.id}`
  const isPast = event.startsAt < TODAY
  const sourcePublicationId =
    event.sourcePublicationId ?? resolveEventSourcePublicationId(event.source)
  const sourcePublication = sourcePublicationId
    ? PUBLICATIONS.find((item) => item.id === sourcePublicationId)
    : undefined
  const related = EVENTS.filter(
    (item) => item.id !== event.id && item.projectSlug === event.projectSlug,
  )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .slice(0, 3)

  const back = get('fiche.back', '← Tout l’agenda')
  const dtDate = get('fiche.dtDate', 'Date')
  const dtLocation = get('fiche.dtLocation', 'Lieu')
  const dtFormat = get('fiche.dtFormat', 'Format')
  const dtProject = get('fiche.dtProject', 'Projet associé')
  const sourceTitle = get('fiche.sourceTitle', 'Source vérifiée')
  const sourceLead = get(
    'fiche.sourceLead',
    'Cette fiche reprend uniquement la date, le lieu et le résumé explicitement documentés dans',
  )
  const sourceCta = get('fiche.sourceCta', 'Ouvrir le document source')
  const noticePast = get(
    'fiche.noticePast',
    'Cet événement est terminé et reste publié à titre d’archive.',
  )
  const noticeUpcoming = get(
    'fiche.noticeUpcoming',
    'Les inscriptions seront publiées ici dès qu’un lien officiel sera disponible.',
  )
  const relatedTitle = get('fiche.related', 'Événements liés')
  const projectCta = get('fiche.projectCta', 'Découvrir le projet')

  return (
    <div className="page content-detail content-detail--event">
      <PageMeta
        title={event.title}
        description={event.summary}
        pathname={pathname}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          description: event.summary,
          startDate: event.startsAt,
          endDate: event.endsAt,
          location: {
            '@type': 'Place',
            name: event.location,
          },
          url: `https://eu4youth.org${pathname}`,
        }}
      />

      <CmsSection id="fiche" className="content-detail__shell">
        <header className="content-detail__hero">
          <p className="content-detail__edit-row">
            <Link className="content-detail__back" to="/agenda">
              <EditableText
                section="fiche"
                field="back"
                fallback="← Tout l’agenda"
                as="span"
                multiline={false}
                label="Retour"
              >
                {back}
              </EditableText>
            </Link>
          </p>
          <p className="content-detail__eyebrow">{event.format}</p>
          <h1>{event.title}</h1>
          <div className="content-detail__meta">
            <time dateTime={event.startsAt}>{event.dateLabel}</time>
            <span>{event.location}</span>
            <span>{event.project}</span>
          </div>
        </header>

        <div className="content-detail__layout">
          <article className="content-detail__article">
            <img src={assetUrl(event.image)} alt="" />
            <p className="content-detail__lead">{event.summary}</p>

            <dl className="content-detail__facts">
              <div>
                <dt>
                  {dtDate}
                  <Pencil field="dtDate" fallback="Date" label="Date" />
                </dt>
                <dd>{event.dateLabel}</dd>
              </div>
              <div>
                <dt>
                  {dtLocation}
                  <Pencil field="dtLocation" fallback="Lieu" label="Lieu" />
                </dt>
                <dd>{event.location}</dd>
              </div>
              <div>
                <dt>
                  {dtFormat}
                  <Pencil field="dtFormat" fallback="Format" label="Format" />
                </dt>
                <dd>{event.format}</dd>
              </div>
              <div>
                <dt>
                  {dtProject}
                  <Pencil field="dtProject" fallback="Projet associé" label="Projet" />
                </dt>
                <dd>
                  <Link to={`/projets/${event.projectSlug}`}>{event.project}</Link>
                </dd>
              </div>
            </dl>

            <div className="content-detail__source">
              <h2>
                {sourceTitle}
                <Pencil field="sourceTitle" fallback="Source vérifiée" label="Titre source" />
              </h2>
              <p>
                {sourceLead} <strong>{event.source}</strong>.
                <Pencil
                  field="sourceLead"
                  fallback="Cette fiche reprend uniquement la date, le lieu et le résumé explicitement documentés dans"
                  label="Texte source"
                />
              </p>
              {sourcePublication?.href ? (
                <p className="content-detail__edit-row">
                  <a
                    className="btn btn--fill-blue"
                    href={sourcePublication.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sourceCta}
                  </a>
                  <Pencil
                    field="sourceCta"
                    fallback="Ouvrir le document source"
                    label="Bouton source"
                  />
                </p>
              ) : null}
            </div>

            <p className="content-detail__notice">
              {isPast ? noticePast : noticeUpcoming}
              {isPast ? (
                <Pencil
                  field="noticePast"
                  fallback="Cet événement est terminé et reste publié à titre d’archive."
                  label="Note passé"
                />
              ) : (
                <Pencil
                  field="noticeUpcoming"
                  fallback="Les inscriptions seront publiées ici dès qu’un lien officiel sera disponible."
                  label="Note à venir"
                />
              )}
            </p>

            <ShareActions title={event.title} pathname={pathname} />
          </article>

          <aside className="content-detail__related">
            <img src={assetUrl(`/img/logo-${event.projectSlug}.png`)} alt="" />
            <h2>
              {relatedTitle}
              <Pencil field="related" fallback="Événements liés" label="Événements liés" />
            </h2>
            <ul>
              {related.map((item) => (
                <li key={item.id}>
                  <Link to={`/agenda/${item.id}`}>
                    <time dateTime={item.startsAt}>{item.dateLabel}</time>
                    <strong>{item.title}</strong>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="content-detail__edit-row">
              <Link to={`/projets/${event.projectSlug}`}>
                {projectCta} {event.project}
              </Link>
              <Pencil field="projectCta" fallback="Découvrir le projet" label="Lien projet" />
            </p>
          </aside>
        </div>
      </CmsSection>
    </div>
  )
}
