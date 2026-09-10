import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS as PROJECTS_FALLBACK } from '../data/projects'
import type { Composante, Project } from '../data/types'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useCatalog } from '../cms/useCatalog'
import { useContent } from '../cms/ContentProvider'
import { assetUrl } from '../lib/assetUrl'
import './projets.css'

const COMPOSANTE_FALLBACK = [
  { kicker: 'COMPOSANTE 1', name: 'Emploi, employabilité et entrepreneuriat' },
  { kicker: 'COMPOSANTE 2', name: "Culture et sport pour l'inclusion des jeunes" },
  { kicker: 'COMPOSANTE 3', name: 'Politiques publiques pour la jeunesse' },
]

const PROJECT_CARD_FALLBACK = PROJECTS_FALLBACK.map((project) => ({
  slug: project.slug,
  acronym: project.acronym,
  tagline: project.tagline,
  partner: project.partner,
  budget: project.budget,
  period: project.period,
  territory: project.territory,
  composante: project.composante,
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
  return <div className="ps-edit-region">{children}</div>
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
      className="ps-pencil"
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

export default function ProjetsPage() {
  const { get } = useContent()
  const catalog = useCatalog<Project>('projects', PROJECTS_FALLBACK)
  const [theme, setTheme] = useState('Tous')
  const [governorate, setGovernorate] = useState('Tous')
  const [beneficiary, setBeneficiary] = useState('Tous')

  const titleLines = linesOf(get('hero.title', 'LES SIX\nPROJETS'), ['LES SIX', 'PROJETS'])
  const allLabel = get('filters.all', 'Tous')
  const emptyTitle = get('grid.emptyTitle', 'Aucun projet ne correspond à cette combinaison.')
  const emptyCta = get('grid.emptyCta', 'Afficher les six projets')
  const moreLabel = get('grid.link', 'Découvrir le projet »')

  const groupRows = parseJsonRows(get('grid.composantes', JSON.stringify(COMPOSANTE_FALLBACK)))
  const groups = (groupRows?.length ? groupRows : COMPOSANTE_FALLBACK).map((row, index) => ({
    kicker: String(row.kicker || COMPOSANTE_FALLBACK[index]?.kicker || ''),
    name: String(row.name || COMPOSANTE_FALLBACK[index]?.name || '') as Composante,
  }))

  const cardRows = parseJsonRows(get('grid.items', JSON.stringify(PROJECT_CARD_FALLBACK)))
  const cards = (cardRows?.length ? cardRows : PROJECT_CARD_FALLBACK).map((row) => {
    const slug = String(row.slug || '')
    const source = catalog.find((item) => item.slug === slug) || PROJECTS_FALLBACK.find((item) => item.slug === slug)
    return {
      slug,
      acronym: String(row.acronym || source?.acronym || slug),
      tagline: String(row.tagline || source?.tagline || ''),
      partner: String(row.partner || source?.partner || ''),
      budget: String(row.budget || source?.budget || ''),
      period: String(row.period || source?.period || ''),
      territory: String(row.territory || source?.territory || ''),
      composante: String(row.composante || source?.composante || ''),
      theme: source?.theme || slug,
      governorates: source?.governorates || [],
      beneficiaries: source?.beneficiaries || [],
    }
  })

  const governorates = [
    ...new Set(
      catalog.flatMap((project) =>
        (project.governorates || []).filter((item) => item !== 'Présence nationale'),
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, 'fr'))
  const beneficiaries = [...new Set(catalog.flatMap((project) => project.beneficiaries || []))].sort(
    (a, b) => a.localeCompare(b, 'fr'),
  )

  const filtered = useMemo(
    () =>
      cards.filter((project) => {
        const source = catalog.find((item) => item.slug === project.slug)
        const govs = source?.governorates || project.governorates
        const bens = source?.beneficiaries || project.beneficiaries
        return (
          (theme === 'Tous' || project.composante === theme) &&
          (governorate === 'Tous' ||
            govs.includes('Présence nationale') ||
            govs.includes(governorate)) &&
          (beneficiary === 'Tous' || bens.includes(beneficiary))
        )
      }),
    [beneficiary, cards, catalog, governorate, theme],
  )

  const reset = () => {
    setTheme('Tous')
    setGovernorate('Tous')
    setBeneficiary('Tous')
  }

  const composanteNames = groups.map((item) => item.name)

  return (
    <div className="page page--projets">
      <CmsSection id="hero" className="ps-hero" labelledBy="ps-title">
        <div className="ps-hero__copy">
          <EditableText
            section="hero"
            field="badge"
            fallback="EU4YOUTH TUNISIE"
            as="p"
            className="ps-hero__eyebrow"
            label="Badge"
          />
          <EditableText
            section="hero"
            field="title"
            fallback={'LES SIX\nPROJETS'}
            as="h1"
            id="ps-title"
            className="ps-hero__title"
            label="Titre"
          >
            {titleLines.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className={index === 0 ? 'ps-hero__line' : 'ps-hero__kicker'}
              >
                {line}
              </span>
            ))}
          </EditableText>
        </div>
        <ul className="ps-hero__marks" aria-hidden="true">
          {cards.map((project) => (
            <li key={project.slug}>
              <img src={assetUrl(`/img/logo-${project.slug}-white.webp`)} alt="" />
            </li>
          ))}
        </ul>
      </CmsSection>

      <CmsSection id="filters" className="ps-filters" labelledBy="ps-filters-title">
        <div>
          <EditableText
            section="filters"
            field="eyebrow"
            fallback="COMPARER LES PROJETS"
            as="p"
            className="ps-filters__eyebrow"
            label="Sur-titre"
          />
          <EditableText
            section="filters"
            field="title"
            fallback="FILTRER LA GRILLE"
            as="h2"
            id="ps-filters-title"
            className="ps-filters__title"
            label="Titre"
          />
        </div>
        <label>
          <EditableText
            section="filters"
            field="theme"
            fallback="Thématique"
            as="span"
            multiline={false}
            label="Filtre thématique"
          >
            {get('filters.theme', 'Thématique')}
          </EditableText>
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="Tous">{allLabel}</option>
            {groups.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <EditableText
            section="filters"
            field="governorate"
            fallback="Gouvernorat"
            as="span"
            multiline={false}
            label="Filtre gouvernorat"
          >
            {get('filters.governorate', 'Gouvernorat')}
          </EditableText>
          <select value={governorate} onChange={(event) => setGovernorate(event.target.value)}>
            <option value="Tous">{allLabel}</option>
            {governorates.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <EditableText
            section="filters"
            field="beneficiary"
            fallback="Public bénéficiaire"
            as="span"
            multiline={false}
            label="Filtre public"
          >
            {get('filters.beneficiary', 'Public bénéficiaire')}
          </EditableText>
          <select value={beneficiary} onChange={(event) => setBeneficiary(event.target.value)}>
            <option value="Tous">{allLabel}</option>
            {beneficiaries.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="ps-filters__summary" aria-live="polite">
          <strong>{filtered.length}</strong>{' '}
          {filtered.length === 1 ? (
            <EditableText
              as="span"
              section="filters"
              field="projectOne"
              fallback="projet"
              label="Mot projet"
              multiline={false}
            />
          ) : (
            <EditableText
              as="span"
              section="filters"
              field="projectMany"
              fallback="projets"
              label="Mot projets"
              multiline={false}
            />
          )}
          <button type="button" onClick={reset}>
            <EditableText
              as="span"
              section="filters"
              field="reset"
              fallback="Réinitialiser"
              label="Réinitialiser"
              multiline={false}
            />
          </button>
          <Pencil section="filters" field="all" fallback="Tous" label="Option Tous" />
        </div>
      </CmsSection>

      <CmsSection id="grid" className="ps-grid">
        <ListDock>
          <EditableJsonList
            section="grid"
            field="composantes"
            label="Composantes"
            className="ps-list-cms"
            wrapItems={false}
            manageLabel="Gérer les composantes"
            fallback={COMPOSANTE_FALLBACK}
            fields={[
              { key: 'kicker', label: 'Sur-titre' },
              { key: 'name', label: 'Nom' },
            ]}
            emptyItem={{ kicker: 'COMPOSANTE 4', name: '' }}
            renderItem={() => null}
          />
          <EditableJsonList
            section="grid"
            field="items"
            label="Projets"
            className="ps-list-cms"
            wrapItems={false}
            manageLabel="Gérer les projets"
            fallback={PROJECT_CARD_FALLBACK}
            fields={[
              {
                key: 'slug',
                label: 'Projet',
                options: PROJECTS_FALLBACK.map((item) => item.slug),
                optionLabels: Object.fromEntries(
                  PROJECTS_FALLBACK.map((item) => [item.slug, item.acronym]),
                ),
                multiple: false,
              },
              { key: 'acronym', label: 'Acronyme' },
              { key: 'tagline', label: 'Texte', multiline: true },
              { key: 'partner', label: 'Mise en œuvre', multiline: true },
              { key: 'period', label: 'Période' },
              { key: 'territory', label: 'Territoire', multiline: true },
              {
                key: 'composante',
                label: 'Composante',
                options: composanteNames,
                multiple: false,
              },
            ]}
            emptyItem={{
              slug: 'jeuness',
              acronym: "Jeun'ESS",
              tagline: '',
              partner: '',
              budget: '',
              period: '',
              territory: '',
              composante: COMPOSANTE_FALLBACK[0].name as Composante,
            }}
            renderItem={() => null}
          />
        </ListDock>

        {groups.map((composante, index) => {
          const projects = filtered.filter((project) => project.composante === composante.name)
          if (projects.length === 0) return null

          return (
            <section key={composante.name} className="ps-group" aria-labelledby={`ps-group-${index}`}>
              <div className="ps-group__head">
                <p>{composante.kicker}</p>
                <h2 id={`ps-group-${index}`}>{composante.name}</h2>
                <span aria-hidden="true">{`0${projects.length}`}</span>
              </div>
              <ul className="ps-cards">
                {projects.map((project) => (
                  <li
                    key={project.slug}
                    style={{
                      '--project-colour': `var(--p-${project.theme})`,
                      '--project-text': `var(--p-${project.theme}-text, var(--p-${project.theme}))`,
                      '--project-soft': `var(--p-${project.theme}-soft, #f7e7c8)`,
                    } as CSSProperties}
                  >
                    <Link to={`/projets/${project.slug}`}>
                      <div className="ps-card__top">
                        <img src={assetUrl(`/img/logo-${project.slug}.png`)} alt="" aria-hidden="true" />
                        <h3>{project.acronym}</h3>
                      </div>
                      <p className="ps-card__tagline">{project.tagline}</p>
                      <dl className="ps-card__facts">
                        <div>
                          <dt>{get('grid.partner', 'Mise en œuvre')}</dt>
                          <dd>{project.partner}</dd>
                        </div>
                        <div>
                          <dt>{get('grid.period', 'Période')}</dt>
                          <dd>{project.period}</dd>
                        </div>
                        <div>
                          <dt>{get('grid.territory', 'Territoire')}</dt>
                          <dd>{project.territory}</dd>
                        </div>
                      </dl>
                      <span className="ps-card__more">{moreLabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {filtered.length === 0 ? (
          <div className="ps-empty">
            <EditableText
              as="strong"
              section="grid"
              field="emptyTitle"
              fallback={emptyTitle}
              label="Aucun résultat"
              multiline={false}
            />
            <button type="button" onClick={reset}>
              <EditableText
                as="span"
                section="grid"
                field="emptyCta"
                fallback={emptyCta}
                label="Bouton vide"
                multiline={false}
              />
            </button>
          </div>
        ) : null}

        <p className="ps-card-link-edit">
          <Pencil section="grid" field="link" fallback="Découvrir le projet »" label="Lien carte" />
          <Pencil section="grid" field="partner" fallback="Mise en œuvre" label="Libellé partenaire" />
          <Pencil section="grid" field="period" fallback="Période" label="Libellé période" />
          <Pencil section="grid" field="territory" fallback="Territoire" label="Libellé territoire" />
        </p>
      </CmsSection>

      <CmsSection id="cta" className="ps-cta" labelledBy="ps-cta-title">
        <EditableText
          as="h2"
          id="ps-cta-title"
          section="cta"
          field="title"
          fallback="SITUER LES PROJETS SUR LE TERRITOIRE"
          label="Titre"
        />
        <div>
          <Link className="btn btn--fill-blue" to="/carte">
            <EditableText
              as="span"
              section="cta"
              field="map"
              fallback="Carte des initiatives"
              label="Bouton carte"
              multiline={false}
            />{' '}
            <span aria-hidden="true">»</span>
          </Link>
          <Link className="btn btn--line-orange" to="/programme/objectifs">
            <EditableText
              as="span"
              section="cta"
              field="objectives"
              fallback="Objectifs du programme"
              label="Bouton objectifs"
              multiline={false}
            />{' '}
            <span aria-hidden="true">»</span>
          </Link>
        </div>
      </CmsSection>
    </div>
  )
}
