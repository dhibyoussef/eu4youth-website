import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import './stub.css'

const TITLE = 'PAGE INTROUVABLE'
const BODY =
  'La page demandée n’existe pas ou a été déplacée. Utilisez le plan du site ou la recherche pour retrouver le contenu.'
const HOME = 'Retour à l’accueil'

const LINKS = [
  { label: 'Plan du site', to: '/plan-du-site' },
  { label: 'Recherche', to: '/recherche' },
  { label: 'Les six projets', to: '/projets' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Agenda', to: '/agenda' },
  { label: 'Contact', to: '/contact' },
]

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
      className="stub-pencil"
      section={section}
      field={field}
      fallback={fallback}
      label={label}
    />
  )
}

function parseLinks(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : parsed?.fr
    if (!Array.isArray(list)) return LINKS
    return list
      .map((row: { label?: string; to?: string }) => ({
        label: String(row.label || '').trim(),
        to: String(row.to || '').trim(),
      }))
      .filter((row) => row.label && row.to)
  } catch {
    return LINKS
  }
}

export default function StubPage() {
  const { get } = useContent()
  const title = get('hero.title', TITLE)
  const home = get('actions.home', HOME)
  const links = useMemo(
    () => parseLinks(get('links.items', JSON.stringify(LINKS))),
    [get],
  )

  return (
    <div className="page page--stub">
      <CmsSection id="hero" className="stub" labelledBy="stub-title">
        <EditableText
          section="hero"
          field="title"
          fallback={TITLE}
          as="h1"
          id="stub-title"
          className="stub__title"
          label="Titre"
        >
          {title.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index ? <br /> : null}
              {line}
            </span>
          ))}
        </EditableText>
        <EditableText
          section="hero"
          field="body"
          fallback={BODY}
          as="p"
          className="stub__intro"
          label="Texte"
        />
      </CmsSection>

      <CmsSection id="links" className="stub-links-band" labelledBy="stub-links-title">
        <h2 id="stub-links-title" className="sr-only">
          Pages principales
        </h2>
        <EditableJsonList
          section="links"
          field="items"
          label="Liens utiles"
          className="stub-list-cms"
          wrapItems={false}
          manageLabel="Gérer la liste"
          fallback={LINKS}
          fields={[
            { key: 'label', label: 'Libellé' },
            { key: 'to', label: 'URL' },
          ]}
          emptyItem={{ label: 'Nouveau lien', to: '/' }}
          renderItem={() => null}
        />
        <nav className="stub__links" aria-label="Pages principales">
          {links.map((link) => (
            <Link key={`${link.to}-${link.label}`} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      </CmsSection>

      <CmsSection id="actions" className="stub-actions" labelledBy="stub-home">
        <div className="stub-btn-row">
          <Link id="stub-home" to="/" className="btn btn--fill-blue stub__back">
            {home}
          </Link>
          <Pencil section="actions" field="home" fallback={HOME} label="Accueil" />
        </div>
      </CmsSection>
    </div>
  )
}
