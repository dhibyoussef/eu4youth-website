import { EVENTS as EVENTS_FALLBACK } from '../data/events'
import { GLOSSARY_CATEGORIES as GLOSSARY_FALLBACK } from '../data/glossary'
import { NEWS as NEWS_FALLBACK } from '../data/news'
import { OPPORTUNITIES as OPPORTUNITIES_FALLBACK } from '../data/opportunities'
import { PROJECTS as PROJECTS_FALLBACK } from '../data/projects'
import { PUBLICATIONS as PUBLICATIONS_FALLBACK } from '../data/publications'

let NEWS = NEWS_FALLBACK
let PUBLICATIONS = PUBLICATIONS_FALLBACK
let EVENTS = EVENTS_FALLBACK
let OPPORTUNITIES = OPPORTUNITIES_FALLBACK
let PROJECTS = PROJECTS_FALLBACK
let GLOSSARY_CATEGORIES = GLOSSARY_FALLBACK
let catalogVersion = 0
const catalogListeners = new Set<() => void>()

export function setLiveCatalogs(next: {
  news?: typeof NEWS_FALLBACK
  publications?: typeof PUBLICATIONS_FALLBACK
  events?: typeof EVENTS_FALLBACK
  opportunities?: typeof OPPORTUNITIES_FALLBACK
  projects?: typeof PROJECTS_FALLBACK
  glossary?: typeof GLOSSARY_FALLBACK
}) {
  if (next.news) NEWS = next.news
  if (next.publications) PUBLICATIONS = next.publications
  if (next.events) EVENTS = next.events
  if (next.opportunities) OPPORTUNITIES = next.opportunities
  if (next.projects) PROJECTS = next.projects
  if (next.glossary) GLOSSARY_CATEGORIES = next.glossary
  cachedIndex = null
  catalogVersion += 1
  catalogListeners.forEach((listener) => listener())
}

export function subscribeCatalogs(listener: () => void) {
  catalogListeners.add(listener)
  return () => catalogListeners.delete(listener)
}

export function getCatalogVersion() {
  return catalogVersion
}

export type SearchContentType =
  | 'page'
  | 'project'
  | 'opportunity'
  | 'publication'
  | 'news'
  | 'event'
  | 'glossary'
  | 'mechanism'

export type SearchDocument = {
  id: string
  type: SearchContentType
  typeLabel: string
  title: string
  summary: string
  href: string
  text: string
  boost: number
}

export type SearchHit = SearchDocument & { score: number }

const TYPE_LABELS: Record<SearchContentType, string> = {
  page: 'Page',
  project: 'Projet',
  opportunity: 'Opportunité',
  publication: 'Publication',
  news: 'Actualité',
  event: 'Événement',
  glossary: 'Glossaire',
  mechanism: 'Mécanisme',
}

const STATIC_PAGES: Array<Omit<SearchDocument, 'typeLabel' | 'boost' | 'text'> & { text?: string }> =
  [
    {
      id: 'page-home',
      type: 'page',
      title: 'Accueil EU4Youth Tunisie',
      summary: 'Programme d’appui à la jeunesse tunisienne financé par l’Union européenne.',
      href: '/',
    },
    {
      id: 'page-apropos',
      type: 'page',
      title: 'À propos du programme EU4Youth',
      summary: 'Vision, territoires, partenaires, impact et principes du programme.',
      href: '/programme/a-propos',
    },
    {
      id: 'page-objectifs',
      type: 'page',
      title: 'Objectifs et résultats attendus',
      summary: 'Objectifs globaux, spécifiques et composantes thématiques.',
      href: '/programme/objectifs',
    },
    {
      id: 'page-financement',
      type: 'page',
      title: 'Financement Union européenne',
      summary: 'Budget global, convention de financement et répartition entre les six projets.',
      href: '/programme/financement',
    },
    {
      id: 'page-gouvernance',
      type: 'page',
      title: 'Gouvernance et pilotage',
      summary: 'Acteurs, responsabilités et coordination du programme EU4Youth.',
      href: '/programme/gouvernance',
    },
    {
      id: 'page-projets',
      type: 'page',
      title: 'Les six projets',
      summary: 'Vue comparative des six projets complémentaires EU4Youth.',
      href: '/projets',
    },
    {
      id: 'page-carte',
      type: 'page',
      title: 'Carte des initiatives',
      summary: 'Catalogue territorial des fiches EU4Youth dans les gouvernorats tunisiens.',
      href: '/carte',
    },
    {
      id: 'page-opportunites',
      type: 'page',
      title: 'Opportunités',
      summary: 'Appels à projets, candidatures, formations et opportunités EU4Youth.',
      href: '/opportunites',
    },
    {
      id: 'page-actualites',
      type: 'page',
      title: 'Actualités',
      summary: 'Actualités, résultats et événements vérifiés des projets EU4Youth.',
      href: '/actualites',
    },
    {
      id: 'page-agenda',
      type: 'page',
      title: 'Agenda',
      summary: 'Événements documentés du programme EU4Youth Tunisie.',
      href: '/agenda',
    },
    {
      id: 'page-publications',
      type: 'page',
      title: 'Publications et ressources',
      summary: 'Publications, rapports et ressources téléchargeables EU4Youth.',
      href: '/publications',
    },
    {
      id: 'page-glossaire',
      type: 'page',
      title: 'Glossaire',
      summary: 'Comprendre les termes, dispositifs et acteurs de l’écosystème EU4Youth.',
      href: '/glossaire',
    },
    {
      id: 'page-stories',
      type: 'page',
      title: 'Youth Stories',
      summary:
        'Archive destinée aux portraits de bénéficiaires. Aucune story approuvée n’a encore été fournie.',
      href: '/stories',
    },
    {
      id: 'page-mecanismes',
      type: 'page',
      title: 'Mécanismes d’appui',
      summary: 'Accompagnement, financement et renforcement des capacités.',
      href: '/mecanismes-appui',
    },
    {
      id: 'page-partenaires',
      type: 'page',
      title: 'Partenaires',
      summary: 'Institutions tunisiennes, Union européenne et organisations de mise en œuvre.',
      href: '/partenaires',
    },
    {
      id: 'page-media',
      type: 'page',
      title: 'Coin média',
      summary: 'Actualités et ressources médias actuellement fournies au programme.',
      href: '/coin-media',
    },
    {
      id: 'page-eu-tunisie',
      type: 'page',
      title: 'L’Union européenne dans EU4Youth',
      summary: 'Rôle de l’Union européenne dans le programme EU4Youth Tunisie.',
      href: '/eu-en-tunisie',
    },
    {
      id: 'page-contact',
      type: 'page',
      title: 'Contact',
      summary: 'Formulaire pour contacter l’équipe du programme EU4Youth Tunisie.',
      href: '/contact',
    },
    {
      id: 'page-plan-du-site',
      type: 'page',
      title: 'Plan du site',
      summary: 'Toutes les pages publiques du site, regroupées par rubrique.',
      href: '/plan-du-site',
    },
  ]

export const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')

const joinText = (...parts: Array<string | string[] | undefined>) =>
  parts
    .flatMap((part) => (Array.isArray(part) ? part : part ? [part] : []))
    .join(' ')

const documentFrom = (
  item: Omit<SearchDocument, 'typeLabel' | 'text'> & { text?: string },
): SearchDocument => ({
  ...item,
  typeLabel: TYPE_LABELS[item.type],
  text: item.text ?? joinText(item.title, item.summary, TYPE_LABELS[item.type]),
})

let cachedIndex: SearchDocument[] | null = null

export function buildSearchIndex(): SearchDocument[] {
  if (cachedIndex) return cachedIndex

  cachedIndex = [
    ...STATIC_PAGES.map((item) =>
      documentFrom({
        ...item,
        boost: 4,
        text: joinText(item.title, item.summary, 'page'),
      }),
    ),
    ...PROJECTS.map((item) =>
      documentFrom({
        id: `project-${item.slug}`,
        type: 'project',
        title: item.acronym,
        summary: `${item.fullName}. ${item.tagline}`,
        href: `/projets/${item.slug}`,
        boost: 5,
        text: joinText(
          item.acronym,
          item.fullName,
          item.tagline,
          item.composante,
          item.partner,
          item.territory,
          item.period,
          item.sectors,
          item.presentation,
          item.governorates,
          item.generalObjective,
          item.specificObjectives,
          item.beneficiaries,
          item.components?.flatMap((component) => [
            component.name,
            component.tagline,
            component.description,
            ...component.results,
            ...component.sectors,
          ]) ?? [],
          item.kpis.flatMap((kpi) => [kpi.label, kpi.value]),
        ),
      }),
    ),
    ...OPPORTUNITIES.map((item) =>
      documentFrom({
        id: `opportunity-${item.id}`,
        type: 'opportunity',
        title: item.title,
        summary: item.summary,
        href: `/opportunites/${item.slug}`,
        boost: 4,
        text: joinText(
          item.title,
          item.summary,
          item.type,
          item.project,
          item.themes,
          item.audiences,
          item.locations,
          item.locationLabel,
          item.deadlineLabel,
        ),
      }),
    ),
    ...PUBLICATIONS.map((item) =>
      documentFrom({
        id: `publication-${item.id}`,
        type: 'publication',
        title: item.title,
        summary: `${item.summary} — ${item.project}, ${item.dateLabel}`,
        href: `/publications/${item.id}`,
        boost: 3,
        text: joinText(
          item.title,
          item.summary,
          item.type,
          item.project,
          item.themes,
          item.language,
          item.dateLabel,
          item.year,
        ),
      }),
    ),
    ...NEWS.map((item) =>
      documentFrom({
        id: `news-${item.id}`,
        type: 'news',
        title: item.title,
        summary: item.summary,
        href: `/actualites/${item.slug}`,
        boost: 3,
        text: joinText(
          item.title,
          item.summary,
          item.type,
          item.project,
          item.themes,
          item.locations,
          item.source,
        ),
      }),
    ),
    ...EVENTS.map((item) =>
      documentFrom({
        id: `event-${item.id}`,
        type: 'event',
        title: item.title,
        summary: `${item.summary} — ${item.project}, ${item.location}, ${item.dateLabel}`,
        href: `/agenda/${item.id}`,
        boost: 3,
        text: joinText(
          item.title,
          item.summary,
          item.project,
          item.location,
          item.format,
          item.dateLabel,
          item.source,
        ),
      }),
    ),
    ...GLOSSARY_CATEGORIES.flatMap((category) =>
      category.entries.map((item, index) =>
        documentFrom({
          id: `glossary-${category.id}-${index}`,
          type: 'glossary',
          title: item.term,
          summary: item.def,
          href: `/glossaire?recherche=${encodeURIComponent(item.term)}`,
          boost: 2,
          text: joinText(item.term, item.tag, item.def, item.ctx),
        }),
      ),
    ),
    ...PROJECTS.flatMap((project) =>
      (project.components || []).map((component, index) =>
        documentFrom({
          id: `mechanism-${project.slug}-${index}`,
          type: 'mechanism',
          title: component.name,
          summary: `${component.tagline} — ${project.acronym}`,
          href: '/mecanismes-appui',
          boost: 2,
          text: joinText(
            component.name,
            component.tagline,
            component.description,
            component.results,
            component.sectors,
            project.acronym,
            project.fullName,
          ),
        }),
      ),
    ),
  ]

  return cachedIndex
}

export function querySearch(
  query: string,
  typeLabel = 'Tous',
  limit = 80,
): SearchHit[] {
  const tokens = normalizeSearch(query)
    .split(/\s+/)
    .filter((token) => token.length >= 2)
  if (!tokens.length) return []

  return buildSearchIndex()
    .filter((item) => typeLabel === 'Tous' || item.typeLabel === typeLabel)
    .map((item) => {
      const haystack = normalizeSearch(item.text)
      if (!tokens.every((token) => haystack.includes(token))) return null
      const title = normalizeSearch(item.title)
      const summary = normalizeSearch(item.summary)
      const score =
        item.boost +
        tokens.reduce((total, token) => {
          let next = total
          if (title.includes(token)) next += 3
          if (summary.includes(token)) next += 1
          if (normalizeSearch(item.typeLabel).includes(token)) next += 1
          return next
        }, 0)
      return { ...item, score }
    })
    .filter((item): item is SearchHit => item !== null)
    .sort(
      (a, b) =>
        b.score - a.score || a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }),
    )
    .slice(0, limit)
}

export function getSearchSuggestions(query: string, limit = 8): SearchHit[] {
  return querySearch(query, 'Tous', limit)
}

export function getSearchTypeLabels(): string[] {
  return ['Tous', ...new Set(buildSearchIndex().map((item) => item.typeLabel))]
}

export function countSearchDocuments() {
  const index = buildSearchIndex()
  return {
    total: index.length,
    pages: index.filter((item) => item.type === 'page').length,
    projects: index.filter((item) => item.type === 'project').length,
    opportunities: index.filter((item) => item.type === 'opportunity').length,
    publications: index.filter((item) => item.type === 'publication').length,
    news: index.filter((item) => item.type === 'news').length,
    events: index.filter((item) => item.type === 'event').length,
    glossary: index.filter((item) => item.type === 'glossary').length,
    mechanisms: index.filter((item) => item.type === 'mechanism').length,
    stories: 0,
  }
}
