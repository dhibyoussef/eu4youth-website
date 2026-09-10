import { Link, Navigate, useParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ShareActions from '../components/ShareActions'
import {
  OPPORTUNITIES as OPPORTUNITIES_FALLBACK,
  listingOpportunities,
  opportunityStatus,
} from '../data/opportunities'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { useCatalogQuery } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './content-detail.css'

function Pencil({ field, fallback, label }: { field: string; fallback: string; label: string }) {
  return (
    <EditableText chipOnly className="content-detail__pencil" section="fiche" field={field} fallback={fallback} label={label} />
  )
}

export default function OpportunityDetailPage() {
  const { slug } = useParams()
  const { get } = useContent()
  const { items: catalog, ready } = useCatalogQuery('opportunities', OPPORTUNITIES_FALLBACK)
  const OPPORTUNITIES = listingOpportunities(get('browser.items', '[]'), catalog)
  const opportunity = OPPORTUNITIES.find((item) => item.slug === slug) || catalog.find((item) => item.slug === slug)
  if (!ready && !opportunity) return null
  if (!opportunity) return <Navigate to="/opportunites" replace />

  const status = opportunityStatus(opportunity)
  const pathname = `/opportunites/${opportunity.slug}`
  const statusLabel =
    status === 'Ouverte'
      ? get('browser.statusOpen', 'Ouverte')
      : status === 'À venir'
        ? get('browser.statusSoon', 'À venir')
        : get('browser.statusClosed', 'Clôturée')
  const back = get('fiche.back', '← Toutes les opportunités')
  const deadlineLabel = get('fiche.deadline', 'Date limite :')
  const period = get('fiche.period', 'Période de candidature')
  const territories = get('fiche.territories', 'Territoires éligibles')
  const audiences = get('fiche.audiences', 'Publics cibles')
  const themes = get('fiche.themes', 'Thématiques')
  const projectLabel = get('fiche.project', 'Projet porteur')
  const dossierTitle = get('fiche.dossierTitle', 'Dossier de l’appel')
  const dossierBody = get(
    'fiche.dossierBody',
    'Le document officiel présente les conditions, le financement et le calendrier disponibles dans la source fournie par Irada4Youth.',
  )
  const download = get('fiche.download', 'Télécharger le document officiel')
  const closedNotice = get(
    'fiche.closedNotice',
    'Cet appel est clôturé et reste publié à titre d’archive.',
  )
  const contact = get('fiche.contact', 'Contacter l’équipe de l’appel')
  const helpTitle = get('fiche.helpTitle', 'Besoin d’aide ?')
  const helpBody = get(
    'fiche.helpBody',
    'Vérifiez les critères dans le document officiel avant toute démarche.',
  )

  return (
    <div className="page content-detail content-detail--opportunity">
      <PageMeta
        title={opportunity.title}
        description={opportunity.summary}
        pathname={pathname}
      />
      <CmsSection id="fiche" className="content-detail__shell">
        <header className="content-detail__hero">
          <p className="content-detail__edit-row">
            <Link className="content-detail__back" to="/opportunites">
              <EditableText
                section="fiche"
                field="back"
                fallback="← Toutes les opportunités"
                as="span"
                multiline={false}
                label="Retour"
              >
                {back}
              </EditableText>
            </Link>
          </p>
          <p className="content-detail__eyebrow">{opportunity.type}</p>
          <h1>{opportunity.title}</h1>
          <div className="content-detail__meta">
            <span className={`content-detail__status is-${status.toLowerCase().replace(/\s+/g, '-')}`}>
              {statusLabel}
            </span>
            <span>{opportunity.project}</span>
            <span>
              {deadlineLabel} {opportunity.deadlineLabel}
            </span>
            <Pencil field="deadline" fallback="Date limite :" label="Date limite" />
          </div>
        </header>

        <div className="content-detail__layout">
          <article className="content-detail__article">
            <img src={assetUrl(opportunity.image)} alt="" />
            <p className="content-detail__lead">{opportunity.summary}</p>

            <dl className="content-detail__facts">
              <div>
                <dt>
                  {period}
                  <Pencil field="period" fallback="Période de candidature" label="Période" />
                </dt>
                <dd>
                  Du {new Date(`${opportunity.opensAt}T00:00:00`).toLocaleDateString('fr-FR')}{' '}
                  au {opportunity.deadlineLabel}
                </dd>
              </div>
              <div>
                <dt>
                  {territories}
                  <Pencil field="territories" fallback="Territoires éligibles" label="Territoires" />
                </dt>
                <dd>{opportunity.locationLabel}</dd>
              </div>
              <div>
                <dt>
                  {audiences}
                  <Pencil field="audiences" fallback="Publics cibles" label="Publics" />
                </dt>
                <dd>{opportunity.audiences.join(' · ')}</dd>
              </div>
              <div>
                <dt>
                  {themes}
                  <Pencil field="themes" fallback="Thématiques" label="Thématiques" />
                </dt>
                <dd>{opportunity.themes.join(' · ')}</dd>
              </div>
              <div>
                <dt>
                  {projectLabel}
                  <Pencil field="project" fallback="Projet porteur" label="Projet" />
                </dt>
                <dd>
                  <Link to={`/projets/${opportunity.projectSlug}`}>{opportunity.project}</Link>
                </dd>
              </div>
            </dl>

            <div className="content-detail__source">
              <h2>
                {dossierTitle}
                <Pencil field="dossierTitle" fallback="Dossier de l’appel" label="Titre dossier" />
              </h2>
              <EditableText
                section="fiche"
                field="dossierBody"
                fallback={dossierBody}
                as="p"
                label="Texte dossier"
              />
              <p className="content-detail__edit-row">
                <a
                  className="btn btn--fill-blue"
                  href="/docs/irada4youth/2e-appel-propositions-juin-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {download}
                </a>
                <Pencil
                  field="download"
                  fallback="Télécharger le document officiel"
                  label="Télécharger"
                />
              </p>
            </div>

            {status === 'Clôturée' ? (
              <p className="content-detail__notice">
                {closedNotice}
                <Pencil
                  field="closedNotice"
                  fallback="Cet appel est clôturé et reste publié à titre d’archive."
                  label="Avis clôturé"
                />
              </p>
            ) : opportunity.contactEmail ? (
              <p className="content-detail__edit-row">
                <a className="btn btn--fill-orange" href={`mailto:${opportunity.contactEmail}`}>
                  {contact}
                </a>
                <Pencil field="contact" fallback="Contacter l’équipe de l’appel" label="Contacter" />
              </p>
            ) : null}
            <ShareActions title={opportunity.title} pathname={pathname} />
          </article>

          <aside className="content-detail__related">
            <img
              src={assetUrl(`/img/logo-${opportunity.projectSlug}.png`)}
              alt={opportunity.project}
            />
            <h2>
              {helpTitle}
              <Pencil field="helpTitle" fallback="Besoin d’aide ?" label="Aide titre" />
            </h2>
            <EditableText
              section="fiche"
              field="helpBody"
              fallback={helpBody}
              as="p"
              label="Aide texte"
            />
            {opportunity.contactEmail ? (
              <a href={`mailto:${opportunity.contactEmail}`}>{opportunity.contactEmail}</a>
            ) : null}
          </aside>
        </div>
      </CmsSection>
    </div>
  )
}
