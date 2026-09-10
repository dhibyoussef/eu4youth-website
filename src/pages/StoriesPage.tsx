import { Link } from 'react-router-dom'
import { PROJECTS as PROJECTS_FALLBACK } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection, EditableImage } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { locText, useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import { assetUrl } from '../lib/assetUrl'
import './stories.css'

type Story = {
  id: string | number
  firstName?: string
  city?: string
  format?: string
  projectSlug?: string
  quote?: unknown
  body?: unknown
  image?: string
}

const STORY_SLOTS = [
  {
    id: 'portrait',
    number: '01',
    label: 'Portrait',
    title: 'Parcours d’une ou d’un bénéficiaire',
  },
  {
    id: 'initiative',
    number: '02',
    label: 'Initiative',
    title: 'Une action portée sur le territoire',
  },
  {
    id: 'voix',
    number: '03',
    label: 'Voix',
    title: 'Témoignage et engagement',
  },
]

function parseSlots(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (!list?.length) return STORY_SLOTS
    return list.map((row, index) => {
      const rec = row as Record<string, unknown>
      const fallback = STORY_SLOTS[index] || STORY_SLOTS[0]
      return {
        id: String(rec.id || fallback.id),
        number: String(rec.number || fallback.number),
        label: String(rec.label || fallback.label),
        title: String(rec.title || fallback.title),
      }
    })
  } catch {
    return STORY_SLOTS
  }
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
      className="stories-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

export default function StoriesPage() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const stories = useCatalog<Story>('stories', [])
  const PROJECTS = useCatalog('projects', PROJECTS_FALLBACK)
  const slots = parseSlots(get('slots.items', JSON.stringify(STORY_SLOTS)))
  const heroTitle = get('hero.title', 'YOUTH STORIES')
  const badgeFallback = 'PAROLES, PARCOURS, INITIATIVES'
  const emptyTitle = get('archive.emptyTitle', 'Portraits à publier depuis le CMS')
  const slotsTitle = get('slots.title', 'Emplacements prêts à être renseignés')
  const projectsTitle = get('projects.title', 'SIX PROJETS À DÉCOUVRIR')
  const liveTitle = get('archive.title', 'Portraits et voix validés')
  const slotBadge = get('slots.badge', 'CONTENU À RENSEIGNER')
  const slotHint = get('slots.hint', 'Zone réservée au portrait et au texte validés par l’éditeur.')
  const ctaProjects = get('archive.ctaProjects', 'Découvrir les projets')
  const ctaContact = get('archive.ctaContact', 'Nous contacter')

  return (
    <div className="page page--stories">
      <CmsSection id="hero" className="stories-hero" labelledBy="stories-page-title">
        <EditableImage section="hero" field="image" fallback="/img/home-stories-v2.webp" alt="" />
        <div className="stories-hero__veil" />
        <div className="stories-hero__copy">
          <p>
            <EditableText section="hero" field="badge" fallback={badgeFallback} as="span" label="Sur-titre" />
          </p>
          <EditableText
            section="hero"
            field="title"
            fallback="YOUTH STORIES"
            as="h1"
            id="stories-page-title"
            className="stories-hero__title"
            label="Titre"
          >
            {heroTitle}
          </EditableText>
        </div>
      </CmsSection>

      {stories.length && !isEditMode ? (
        <CmsSection id="archive" className="stories-live" labelledBy="stories-live-title">
          <header>
            <p>
              <EditableText
                section="archive"
                field="eyebrow"
                fallback="ARCHIVE PUBLIÉE"
                as="span"
                label="Sur-titre archive"
              />
            </p>
            <EditableText
              section="archive"
              field="title"
              fallback="Portraits et voix validés"
              as="h2"
              id="stories-live-title"
              label="Titre archive"
            >
              {liveTitle}
            </EditableText>
          </header>
          <ul>
            {stories.map((story, index) => (
              <li key={String(story.id)}>
                <article>
                  <div className="stories-slots__media" aria-hidden="true">
                    {story.image ? (
                      <img src={assetUrl(story.image)} alt="" />
                    ) : (
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    )}
                    <b>{story.format || 'Portrait'}</b>
                  </div>
                  <div className="stories-slots__body">
                    <p>{[story.firstName, story.city].filter(Boolean).join(' · ') || 'Témoignage'}</p>
                    <h3>{locText(story.quote) || locText(story.body) || story.firstName}</h3>
                    {locText(story.body) ? <span>{locText(story.body)}</span> : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </CmsSection>
      ) : (
        <CmsSection id="archive" className="stories-empty" labelledBy="stories-empty-title">
          <div className="stories-empty__number">
            <span aria-hidden="true">{get('archive.emptyNumber', '00')}</span>
            <Pencil section="archive" field="emptyNumber" fallback="00" label="Chiffre" />
          </div>
          <div>
            <p className="stories-empty__eyebrow">
              <EditableText
                section="archive"
                field="emptyEyebrow"
                fallback="ARCHIVE DES STORIES"
                as="span"
                label="Sur-titre vide"
              >
                {get('archive.emptyEyebrow', 'ARCHIVE DES STORIES')}
              </EditableText>
            </p>
            <EditableText
              section="archive"
              field="emptyTitle"
              fallback="Portraits à publier depuis le CMS"
              as="h2"
              id="stories-empty-title"
              label="Titre vide"
            >
              {emptyTitle}
            </EditableText>
            <EditableText
              section="archive"
              field="emptyBody"
              fallback="Les témoignages et parcours seront présentés ici dès que leurs contenus éditoriaux seront validés. L’archive et la grille ci-dessous sont déjà en place pour les accueillir."
              as="p"
              label="Texte vide"
            />
            <div className="stories-empty__actions">
              <Link className="btn btn--solid-pink" to="/projets">
                <EditableText
                  section="archive"
                  field="ctaProjects"
                  fallback="Découvrir les projets"
                  as="span"
                  multiline={false}
                  label="Lien projets"
                >
                  {ctaProjects}
                </EditableText>
              </Link>
              <Link className="btn btn--line-pink" to="/contact">
                <EditableText
                  section="archive"
                  field="ctaContact"
                  fallback="Nous contacter"
                  as="span"
                  multiline={false}
                  label="Lien contact"
                >
                  {ctaContact}
                </EditableText>
              </Link>
            </div>
          </div>
        </CmsSection>
      )}

      {(!stories.length || isEditMode) && (
        <CmsSection id="slots" className="stories-slots" labelledBy="stories-slots-title">
          <header>
            <EditableText
              section="slots"
              field="eyebrow"
              fallback="FORMATS PRÉVUS"
              as="p"
              label="Sur-titre formats"
            >
              {get('slots.eyebrow', 'FORMATS PRÉVUS')}
            </EditableText>
            <EditableText
              section="slots"
              field="title"
              fallback="Emplacements prêts à être renseignés"
              as="h2"
              id="stories-slots-title"
              label="Titre formats"
            >
              {slotsTitle}
            </EditableText>
          </header>
          <div className="stories-edit-region">
            <EditableJsonList
              section="slots"
              field="items"
              label="Formats"
              className="stories-list-cms"
              wrapItems={false}
              manageLabel="Gérer les formats"
              fallback={STORY_SLOTS}
              fields={[
                { key: 'id', label: 'Identifiant' },
                { key: 'number', label: 'Numéro' },
                { key: 'label', label: 'Libellé' },
                { key: 'title', label: 'Titre' },
              ]}
              emptyItem={{ id: '', number: '04', label: '', title: '' }}
              renderItem={() => null}
            />
          </div>
          <p className="stories-filter-pencils">
            <Pencil section="slots" field="badge" fallback="CONTENU À RENSEIGNER" label="Badge carte" />
            <Pencil
              section="slots"
              field="hint"
              fallback="Publier un portrait dans Catalogues → Stories (prénom, photo, consentement)."
              label="Texte carte"
            />
          </p>
          <ul>
            {slots.map((slot) => (
              <li key={slot.id}>
                <article>
                  <div className="stories-slots__media" aria-hidden="true">
                    <span>{slot.number}</span>
                    <b>{slotBadge}</b>
                  </div>
                  <div className="stories-slots__body">
                    <p>{slot.label}</p>
                    <h3>{slot.title}</h3>
                    <span>{slotHint}</span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </CmsSection>
      )}

      <CmsSection id="projects" className="stories-projects" labelledBy="stories-projects-title">
        <header>
          <EditableText
            section="projects"
            field="eyebrow"
            fallback="EN ATTENDANT"
            as="p"
            label="Sur-titre projets"
          >
            {get('projects.eyebrow', 'EN ATTENDANT')}
          </EditableText>
          <EditableText
            section="projects"
            field="title"
            fallback="SIX PROJETS À DÉCOUVRIR"
            as="h2"
            id="stories-projects-title"
            label="Titre projets"
          >
            {projectsTitle}
          </EditableText>
        </header>
        <ul>
          {PROJECTS.map((project, index) => (
            <li key={project.slug}>
              <Link to={`/projets/${project.slug}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <img src={assetUrl(`/img/logo-${project.slug}.png`)} alt="" />
                <div>
                  <strong>{project.acronym}</strong>
                  <p>{project.tagline}</p>
                </div>
                <b aria-hidden="true">→</b>
              </Link>
            </li>
          ))}
        </ul>
      </CmsSection>
    </div>
  )
}
