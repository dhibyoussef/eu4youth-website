import { Link, Navigate, useParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ShareActions from '../components/ShareActions'
import {
  PUBLICATIONS as PUBLICATIONS_FALLBACK,
  listingPublications,
} from '../data/publications'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalogQuery } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './content-detail.css'

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

export default function PublicationDetailPage() {
  const { id } = useParams()
  const { get } = useContent()
  const { items: catalog, ready } = useCatalogQuery('publications', PUBLICATIONS_FALLBACK)
  const PUBLICATIONS = listingPublications(get('browser.items', '[]'), catalog)
  const listed = PUBLICATIONS.find((item) => item.id === id)
  const fromCatalog = catalog.find((item) => item.id === id)
  const publication = listed ? { ...fromCatalog, ...listed } : fromCatalog
  if (!ready && !publication) return null
  if (!publication) return <Navigate to="/publications" replace />

  const pathname = `/publications/${publication.id}`
  const related = PUBLICATIONS.filter(
    (item) =>
      item.id !== publication.id &&
      (item.projectSlug === publication.projectSlug || item.type === publication.type),
  ).slice(0, 3)
  const back = get('fiche.back', '← Toutes les publications')
  const dtType = get('fiche.dtType', 'Type de ressource')
  const dtProject = get('fiche.dtProject', 'Projet associé')
  const dtDate = get('fiche.dtDate', 'Date')
  const dtFormat = get('fiche.dtFormat', 'Format')
  const dtLanguage = get('fiche.dtLanguage', 'Langue')
  const dtThemes = get('fiche.dtThemes', 'Thématiques')
  const sourceTitle = get('fiche.sourceTitle', 'Document source')
  const sourceLead = get(
    'fiche.sourceLead',
    'Le fichier fourni est disponible au téléchargement dans son format original.',
  )
  const sourceMissing = get(
    'fiche.sourceMissing',
    'Le fichier PDF sera proposé au téléchargement dès qu’il sera disponible.',
  )
  const download = get('fiche.download', 'Télécharger le PDF')
  const relatedTitle = get('fiche.related', 'Ressources liées')
  const relatedEmpty = get(
    'fiche.relatedEmpty',
    'Aucune autre ressource liée n’est actuellement fournie.',
  )
  const projectCta = get('fiche.projectCta', 'Découvrir le projet')

  return (
    <div className="page content-detail content-detail--publication">
      <PageMeta
        title={publication.title}
        description={publication.summary}
        pathname={pathname}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: publication.title,
          description: publication.summary,
          inLanguage: 'fr',
          datePublished: publication.publishedAt,
          image: publication.cover ? `https://eu4youth.org${publication.cover}` : undefined,
          mainEntityOfPage: `https://eu4youth.org${pathname}`,
          url: `https://eu4youth.org${pathname}`,
          publisher: {
            '@type': 'Organization',
            name: 'EU4Youth Tunisie',
            url: 'https://eu4youth.org',
          },
          ...(publication.href
            ? {
                encoding: {
                  '@type': 'MediaObject',
                  contentUrl: `https://eu4youth.org${publication.href}`,
                  encodingFormat: 'application/pdf',
                },
              }
            : {}),
        }}
      />

      <CmsSection id="fiche" className="content-detail__shell">
        <header className="content-detail__hero">
          <p className="content-detail__edit-row">
            <Link className="content-detail__back" to="/publications">
              <EditableText
                section="fiche"
                field="back"
                fallback="← Toutes les publications"
                as="span"
                multiline={false}
                label="Retour"
              >
                {back}
              </EditableText>
            </Link>
          </p>
          <p className="content-detail__eyebrow">{publication.type}</p>
          <h1>{publication.title}</h1>
          <div className="content-detail__meta">
            <span>{publication.project}</span>
            {publication.publishedAt ? (
              <time dateTime={publication.publishedAt}>{publication.dateLabel}</time>
            ) : (
              <span>{publication.dateLabel}</span>
            )}
            <span>{publication.language}</span>
          </div>
        </header>

        <div className="content-detail__layout">
          <article className="content-detail__article">
            {publication.cover ? (
              <img
                className="content-detail__cover"
                src={assetUrl(publication.cover)}
                alt={`Couverture : ${publication.title}`}
              />
            ) : (
              <img
                className="content-detail__project-mark"
                src={assetUrl(`/img/logo-${publication.projectSlug}.png`)}
                alt={`Logo ${publication.project}`}
              />
            )}
            <p className="content-detail__lead">{publication.summary}</p>

            <dl className="content-detail__facts">
              <div>
                <dt>
                  {dtType}
                  <Pencil field="dtType" fallback="Type de ressource" label="Type" />
                </dt>
                <dd>{publication.type}</dd>
              </div>
              <div>
                <dt>
                  {dtProject}
                  <Pencil field="dtProject" fallback="Projet associé" label="Projet" />
                </dt>
                <dd>
                  <Link to={`/projets/${publication.projectSlug}`}>{publication.project}</Link>
                </dd>
              </div>
              <div>
                <dt>
                  {dtDate}
                  <Pencil field="dtDate" fallback="Date" label="Date" />
                </dt>
                <dd>{publication.dateLabel}</dd>
              </div>
              <div>
                <dt>
                  {dtFormat}
                  <Pencil field="dtFormat" fallback="Format" label="Format" />
                </dt>
                <dd>
                  {publication.format}
                  {publication.fileSize ? ` · ${publication.fileSize}` : ''}
                </dd>
              </div>
              <div>
                <dt>
                  {dtLanguage}
                  <Pencil field="dtLanguage" fallback="Langue" label="Langue" />
                </dt>
                <dd>{publication.language}</dd>
              </div>
              <div>
                <dt>
                  {dtThemes}
                  <Pencil field="dtThemes" fallback="Thématiques" label="Thématiques" />
                </dt>
                <dd>{publication.themes.join(' · ')}</dd>
              </div>
            </dl>

            <div className="content-detail__source">
              <h2>
                {sourceTitle}
                <Pencil field="sourceTitle" fallback="Document source" label="Titre source" />
              </h2>
              {publication.href ? (
                <>
                  <p>
                    {sourceLead}
                    <Pencil
                      field="sourceLead"
                      fallback="Le fichier fourni est disponible au téléchargement dans son format original."
                      label="Texte source"
                    />
                  </p>
                  <p className="content-detail__edit-row">
                    <a
                      className="btn btn--fill-blue"
                      href={publication.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {download}
                    </a>
                    <Pencil field="download" fallback="Télécharger le PDF" label="Télécharger" />
                  </p>
                </>
              ) : (
                <p>
                  {sourceMissing}
                  <Pencil
                    field="sourceMissing"
                    fallback="Le fichier PDF sera proposé au téléchargement dès qu’il sera disponible."
                    label="Fichier manquant"
                  />
                </p>
              )}
            </div>

            <ShareActions title={publication.title} pathname={pathname} />
          </article>

          <aside className="content-detail__related">
            <img src={assetUrl(`/img/logo-${publication.projectSlug}.png`)} alt="" />
            <h2>
              {relatedTitle}
              <Pencil field="related" fallback="Ressources liées" label="Ressources liées" />
            </h2>
            {related.length ? (
              <ul>
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/publications/${item.id}`}>
                      <span>{item.type}</span>
                      <strong>{item.title}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {relatedEmpty}
                <Pencil
                  field="relatedEmpty"
                  fallback="Aucune autre ressource liée n’est actuellement fournie."
                  label="Vide"
                />
              </p>
            )}
            <p className="content-detail__edit-row">
              <Link to={`/projets/${publication.projectSlug}`}>
                {projectCta} {publication.project}
              </Link>
              <Pencil field="projectCta" fallback="Découvrir le projet" label="Lien projet" />
            </p>
          </aside>
        </div>
      </CmsSection>
    </div>
  )
}
