import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import './plan-du-site.css'

type LinkRow = { group: string; intro: string; label: string; to: string; note: string }

const HERO_TITLE = 'PLAN DU SITE'

const LINKS_FALLBACK: LinkRow[] = [
  { group: 'LE PROGRAMME', intro: 'Présentation du programme EU4Youth Tunisie.', label: 'Programme EU4Youth', to: '/programme/a-propos', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'Financement Union européenne', to: '/programme/financement', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'Partenaires', to: '/partenaires', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'EU en Tunisie', to: '/eu-en-tunisie', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'Accueil', to: '/', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'Mécanismes d’appui', to: '/mecanismes-appui', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'Partenaires', to: '/partenaires', note: '' },
  { group: 'LE PROGRAMME', intro: '', label: 'L’Union européenne en Tunisie', to: '/eu-en-tunisie', note: '' },
  { group: 'LES PROJETS', intro: 'Les six projets et leurs fiches détaillées.', label: 'Vue d’ensemble des six projets', to: '/projets', note: '' },
  { group: 'LES PROJETS', intro: '', label: "Jeun'ESS", to: '/projets/jeuness', note: '' },
  { group: 'LES PROJETS', intro: '', label: 'GO4Youth', to: '/projets/go4youth', note: '' },
  { group: 'LES PROJETS', intro: '', label: 'SWAFY', to: '/projets/swafy', note: '' },
  { group: 'LES PROJETS', intro: '', label: 'IRADA4YOUTH', to: '/projets/irada4youth', note: '' },
  { group: 'LES PROJETS', intro: '', label: "Maghroum'IN", to: '/projets/maghroumin', note: '' },
  { group: 'LES PROJETS', intro: '', label: 'Fe3il.a', to: '/projets/fe3ila', note: '' },
  { group: 'TERRITOIRES', intro: 'Localisation des interventions du programme.', label: 'Carte des initiatives', to: '/carte', note: '' },
  { group: 'ACTUALITÉS ET OPPORTUNITÉS', intro: 'Informations datées, appels ouverts et rendez-vous du programme.', label: 'Actualités', to: '/actualites', note: '' },
  { group: 'ACTUALITÉS ET OPPORTUNITÉS', intro: '', label: 'Opportunités', to: '/opportunites', note: '' },
  { group: 'ACTUALITÉS ET OPPORTUNITÉS', intro: '', label: 'Agenda des événements', to: '/agenda', note: '' },
  { group: 'MÉDIAS ET RESSOURCES', intro: 'Documents publiés, vocabulaire de référence et espace presse.', label: 'Publications et ressources', to: '/publications', note: '' },
  { group: 'MÉDIAS ET RESSOURCES', intro: '', label: 'Glossaire', to: '/glossaire', note: '' },
  { group: 'MÉDIAS ET RESSOURCES', intro: '', label: 'Coin média', to: '/coin-media', note: '' },
  { group: 'MÉDIAS ET RESSOURCES', intro: '', label: 'Youth Stories', to: '/stories', note: 'Portraits depuis Catalogues CMS' },
  { group: 'CONTACT ET RECHERCHE', intro: 'Joindre l’équipe et parcourir l’ensemble des contenus.', label: 'Contact', to: '/contact', note: '' },
  { group: 'CONTACT ET RECHERCHE', intro: '', label: 'Recherche sur le site', to: '/recherche', note: '' },
  { group: 'INFORMATIONS LÉGALES', intro: 'Mentions obligatoires du site.', label: 'Politique de confidentialité', to: '/confidentialite', note: '' },
  { group: 'INFORMATIONS LÉGALES', intro: '', label: 'Mentions légales', to: '/mentions-legales', note: '' },
  { group: 'INFORMATIONS LÉGALES', intro: '', label: 'Accessibilité', to: '/accessibilite', note: '' },
  { group: 'INFORMATIONS LÉGALES', intro: '', label: 'Gestion des cookies', to: '/cookies', note: '' },
]

function parseRows(raw: string): LinkRow[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { fr?: unknown })?.fr)
        ? (parsed as { fr: unknown[] }).fr
        : null
    if (!list?.length) return LINKS_FALLBACK
    return list.map((row) => {
      const item = row as Record<string, unknown>
      return {
        group: String(item.group || ''),
        intro: String(item.intro || ''),
        label: String(item.label || ''),
        to: String(item.to || ''),
        note: String(item.note || ''),
      }
    })
  } catch {
    return LINKS_FALLBACK
  }
}

function groupRows(rows: LinkRow[]) {
  const groups: { group: string; intro: string; entries: LinkRow[] }[] = []
  for (const row of rows) {
    const last = groups[groups.length - 1]
    if (last && last.group === row.group) last.entries.push(row)
    else groups.push({ group: row.group, intro: row.intro, entries: [row] })
  }
  return groups.map((group) => ({
    ...group,
    intro: group.entries.find((entry) => entry.intro.trim())?.intro || group.intro,
  }))
}

export default function PlanDuSitePage() {
  const { get } = useContent()
  const heroTitle = get('hero.title', HERO_TITLE)
  const rows = useMemo(
    () => parseRows(get('index.items', JSON.stringify(LINKS_FALLBACK))),
    [get],
  )
  const groups = groupRows(rows.length ? rows : LINKS_FALLBACK)

  return (
    <div className="page page--plan">
      <CmsSection id="hero" className="plan-hero" labelledBy="plan-title">
        <p className="plan-eyebrow">
          <EditableText section="hero" field="badge" fallback="NAVIGATION" as="span" label="Sur-titre" />
        </p>
        <EditableText
          section="hero"
          field="title"
          fallback={HERO_TITLE}
          as="h1"
          id="plan-title"
          className="plan-hero__title"
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

      <CmsSection id="index" className="plan-index" labelledBy="plan-index-title">
        <h2 id="plan-index-title" className="sr-only">
          Pages du site par rubrique
        </h2>
        <div className="plan-edit-region">
          <EditableJsonList
            section="index"
            field="items"
            label="Pages du plan"
            className="plan-list-cms"
            wrapItems={false}
            manageLabel="Gérer la liste"
            fallback={LINKS_FALLBACK}
            fields={[
              { key: 'group', label: 'Rubrique' },
              { key: 'intro', label: 'Introduction', multiline: true },
              { key: 'label', label: 'Libellé' },
              { key: 'to', label: 'Chemin' },
              { key: 'note', label: 'Note' },
            ]}
            emptyItem={{ group: '', intro: '', label: '', to: '/', note: '' }}
            renderItem={() => null}
          />
        </div>
        <div className="plan-grid">
          {groups.map((section) => (
            <nav key={section.group} aria-labelledby={`plan-${section.group}`}>
              <h2 id={`plan-${section.group}`}>{section.group}</h2>
              {section.intro ? <p>{section.intro}</p> : null}
              <ul>
                {section.entries.map((entry) => (
                  <li key={`${entry.to}-${entry.label}`}>
                    <Link to={entry.to}>{entry.label}</Link>
                    {entry.note ? <span>{entry.note}</span> : null}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </CmsSection>
    </div>
  )
}
