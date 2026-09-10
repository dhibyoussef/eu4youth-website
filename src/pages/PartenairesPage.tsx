import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PARTENAIRES } from '../data/apropos'
import { PROJECTS } from '../data/projects'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { CountUp } from '../cms/CountUp'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './partenaires.css'

const TAB_FALLBACK = PARTENAIRES.tabs.map((tab, index) => ({
  tab: ['Union européenne', 'Institutions tunisiennes', 'Mise en œuvre'][index] || tab.title.join(' '),
  line1: tab.title[0] || '',
  line2: tab.title[1] || '',
  body: tab.body,
}))

const INSTITUTION_FALLBACK = PARTENAIRES.tabs[1].logos.map((logo) => ({
  src: logo.src,
  alt: logo.alt,
}))

const IMPLEMENTER_FALLBACK = PROJECTS.map((project) => ({
  slug: project.slug,
  acronym: project.acronym,
  partner: project.partner,
  tagline: project.tagline,
  logo: `/img/logo-${project.slug}.png`,
}))

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
  return <div className="par-edit-region">{children}</div>
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
      className="par-pencil"
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

export default function PartenairesPage() {
  const { get } = useContent()
  const [activeTab, setActiveTab] = useState(0)
  const titleLines = linesOf(get('hero.title', PARTENAIRES.title), [PARTENAIRES.title])

  const tabRows = parseJsonRows(get('tabs.items', JSON.stringify(TAB_FALLBACK)))
  const tabs = (tabRows?.length ? tabRows : TAB_FALLBACK).map((row, index) => {
    const fb = TAB_FALLBACK[index] ?? TAB_FALLBACK[0]
    return {
      tab: String(row.tab || fb.tab),
      line1: String(row.line1 || fb.line1),
      line2: String(row.line2 || fb.line2),
      body: String(row.body || fb.body),
    }
  })
  const safeTab = Math.min(activeTab, Math.max(0, tabs.length - 1))
  const active = tabs[safeTab] ?? tabs[0]

  const institutionRows = parseJsonRows(
    get('institutions.items', JSON.stringify(INSTITUTION_FALLBACK)),
  )
  const institutions = (institutionRows?.length ? institutionRows : INSTITUTION_FALLBACK).map(
    (row) => ({
      src: String(row.src || ''),
      alt: String(row.alt || ''),
    }),
  )

  const implementerRows = parseJsonRows(
    get('implementers.items', JSON.stringify(IMPLEMENTER_FALLBACK)),
  )
  const implementers = (implementerRows?.length ? implementerRows : IMPLEMENTER_FALLBACK).map(
    (row) => {
      const slug = String(row.slug || '')
      const source = PROJECTS.find((item) => item.slug === slug)
      return {
        slug,
        acronym: String(row.acronym || source?.acronym || slug),
        partner: String(row.partner || source?.partner || ''),
        tagline: String(row.tagline || source?.tagline || ''),
        logo: assetUrl(String(row.logo || `/img/logo-${slug}.png`)),
      }
    },
  )

  const figureFallback = [
    { value: '01', label: 'Délégation de l’Union européenne' },
    { value: String(institutions.length), label: 'Institutions tunisiennes partenaires' },
    {
      value: String(new Set(implementers.map((item) => item.partner)).size),
      label: 'Organisations de mise en œuvre',
    },
    { value: String(implementers.length), label: 'Projets coordonnés' },
  ]
  const figureRows = parseJsonRows(get('figures.items', JSON.stringify(figureFallback)))
  const figures = (figureRows?.length ? figureRows : figureFallback).map((row, index) => ({
    value: String(row.value || figureFallback[index]?.value || ''),
    label: String(row.label || figureFallback[index]?.label || ''),
  }))

  if (!active) return null

  return (
    <div className="page page--partners">
      <CmsSection id="hero" className="partners-hero" labelledBy="partners-title">
        <EditableText
          section="hero"
          field="title"
          fallback={PARTENAIRES.title}
          as="h1"
          id="partners-title"
          className="partners-hero__title"
          label="Titre"
        >
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="figures" className="partners-figures">
        <ListDock>
          <EditableJsonList
            section="figures"
            field="items"
            label="Chiffres"
            className="par-list-cms"
            wrapItems={false}
            manageLabel="Gérer les chiffres"
            fallback={figureFallback}
            fields={[
              { key: 'value', label: 'Chiffre' },
              { key: 'label', label: 'Libellé' },
            ]}
            emptyItem={{ value: '', label: '' }}
            renderItem={() => null}
          />
          {figures.map((figure) => (
            <div key={figure.label}>
              <dt>
                {/^0\d/.test(figure.value) ? figure.value : <CountUp value={figure.value} />}
              </dt>
              <dd>{figure.label}</dd>
            </div>
          ))}
        </ListDock>
      </CmsSection>

      <CmsSection id="tabs" className="partners-browser">
        <ListDock>
          <EditableJsonList
            section="tabs"
            field="items"
            label="Onglets"
            className="par-list-cms"
            wrapItems={false}
            manageLabel="Gérer les onglets"
            fallback={TAB_FALLBACK}
            fields={[
              { key: 'tab', label: 'Libellé de l’onglet' },
              { key: 'line1', label: 'Titre ligne 1' },
              { key: 'line2', label: 'Titre ligne 2' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ tab: 'Nouveau', line1: '', line2: '', body: '' }}
            renderItem={() => null}
          />
          <nav className="partners-tabs" aria-label="Catégories de partenaires">
            {tabs.map((item, index) => (
              <button
                key={`${item.tab}-${index}`}
                type="button"
                className={safeTab === index ? 'is-active' : ''}
                aria-pressed={safeTab === index}
                onClick={() => setActiveTab(index)}
              >
                {item.tab}
              </button>
            ))}
          </nav>
        </ListDock>

        <article className="partners-panel">
          <header>
            <span aria-hidden="true">{String(safeTab + 1).padStart(2, '0')}</span>
            <div>
              <h2>
                <span>{active.line1}</span>
                {active.line2 ? <span>{active.line2}</span> : null}
              </h2>
              <p>{active.body}</p>
            </div>
          </header>

          {safeTab === 0 && (
            <CmsSection id="eu" className="partners-eu" as="div">
              <div
                className="partners-eu__funders"
                aria-label="Financé par l'Union européenne — République Tunisienne"
              >
                <div className="partners-eu__item">
                  <span className="partners-eu__flag-wrap">
                    <img
                      className="partners-eu__flag"
                      src={assetUrl('/img/flag-eu-client-blend.webp')}
                      alt=""
                    />
                  </span>
                  <span className="partners-eu__caption">
                    <span>Financé par</span>
                    <span>l’Union européenne</span>
                  </span>
                </div>
                <div className="partners-eu__item">
                  <span className="partners-eu__flag-wrap">
                    <img
                      className="partners-eu__flag"
                      src={assetUrl('/img/flag-tn-client-blend.webp')}
                      alt=""
                    />
                  </span>
                  <span className="partners-eu__caption">
                    <span>République</span>
                    <span>Tunisienne</span>
                  </span>
                </div>
              </div>
              <div>
                <EditableText
                  as="h3"
                  section="eu"
                  field="title"
                  fallback="Délégation de l’Union européenne en Tunisie"
                  label="Titre UE"
                />
                <EditableText
                  section="eu"
                  field="body"
                  fallback="Elle assure le pilotage stratégique du programme, le suivi de sa mise en œuvre et le dialogue avec les autorités tunisiennes."
                  as="p"
                  label="Texte UE"
                />
                <Link to="/partenaires">
                  <EditableText
                    as="span"
                    section="eu"
                    field="link"
                    fallback="Voir tous les partenaires"
                    label="Lien partenaires"
                    multiline={false}
                  />
                </Link>
              </div>
            </CmsSection>
          )}

          {safeTab === 1 && (
            <CmsSection id="institutions" as="div">
            <ListDock>
              <EditableJsonList
                section="institutions"
                field="items"
                label="Institutions"
                className="par-list-cms"
                wrapItems={false}
                manageLabel="Gérer les logos"
                fallback={INSTITUTION_FALLBACK}
                fields={[
                  { key: 'src', label: 'Image' },
                  { key: 'alt', label: 'Nom' },
                ]}
                emptyItem={{ src: '/img/org-aneti.webp', alt: 'Nouvelle institution' }}
                renderItem={() => null}
              />
              <ul className="partners-institutions">
                {institutions.map((institution) => (
                  <li key={institution.alt}>
                    {institution.src ? (
                      <img src={assetUrl(institution.src)} alt="" />
                    ) : null}
                    <span>{institution.alt}</span>
                  </li>
                ))}
              </ul>
            </ListDock>
            </CmsSection>
          )}

          {safeTab === 2 && (
            <CmsSection id="implementers" as="div">
            <ListDock>
              <EditableJsonList
                section="implementers"
                field="items"
                label="Mise en œuvre"
                className="par-list-cms"
                wrapItems={false}
                manageLabel="Gérer les partenaires"
                fallback={IMPLEMENTER_FALLBACK}
                fields={[
                  {
                    key: 'slug',
                    label: 'Projet',
                    options: PROJECTS.map((item) => item.slug),
                    optionLabels: Object.fromEntries(PROJECTS.map((item) => [item.slug, item.acronym])),
                    multiple: false,
                  },
                  { key: 'acronym', label: 'Acronyme' },
                  { key: 'partner', label: 'Organisation', multiline: true },
                  { key: 'tagline', label: 'Texte', multiline: true },
                  { key: 'logo', label: 'Logo' },
                ]}
                emptyItem={{
                  slug: 'jeuness',
                  acronym: "Jeun'ESS",
                  partner: '',
                  tagline: '',
                  logo: '/img/logo-jeuness.png',
                }}
                renderItem={() => null}
              />
              <ul className="partners-implementers">
                {implementers.map((project) => (
                  <li key={project.slug}>
                    <article>
                      <div className="partners-implementers__logo">
                        <img src={project.logo} alt="" />
                      </div>
                      <div>
                        <span>{project.acronym}</span>
                        <h3>{project.partner}</h3>
                        <p>{project.tagline}</p>
                        <Link to={`/projets/${project.slug}`}>
                          {get('implementers.link', 'Découvrir le projet')}
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              <p className="par-card-link-edit">
                <Pencil
                  section="implementers"
                  field="link"
                  fallback="Découvrir le projet"
                  label="Lien projet"
                />
              </p>
            </ListDock>
            </CmsSection>
          )}
        </article>
      </CmsSection>

      <CmsSection id="cta" className="partners-cta" labelledBy="partners-cta-title">
        <div>
          <EditableText
            as="p"
            section="cta"
            field="eyebrow"
            fallback="ALLER PLUS LOIN"
            label="Sur-titre"
          />
          <EditableText
            as="h2"
            id="partners-cta-title"
            section="cta"
            field="title"
            fallback="COMPRENDRE LE PARTENARIAT"
            label="Titre"
          />
        </div>
        <nav aria-label="Pages liées au partenariat">
          <Link to="/programme/gouvernance">
            <EditableText
              as="span"
              section="cta"
              field="governance"
              fallback="Gouvernance et pilotage"
              label="Bouton gouvernance"
              multiline={false}
            />
          </Link>
          <Link to="/programme/a-propos">
            <EditableText
              as="span"
              section="cta"
              field="about"
              fallback="À propos d’EU4Youth"
              label="Bouton à propos"
              multiline={false}
            />
          </Link>
          <Link to="/projets">
            <EditableText
              as="span"
              section="cta"
              field="projects"
              fallback="Les six projets"
              label="Bouton projets"
              multiline={false}
            />
          </Link>
        </nav>
      </CmsSection>
    </div>
  )
}
