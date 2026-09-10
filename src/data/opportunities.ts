import type { ProjectSlug } from './types'

export type OpportunityStatus = 'Ouverte' | 'À venir' | 'Clôturée'

export type OpportunityType =
  | 'Appel à projets'
  | 'Appel à candidatures'
  | 'Stage / emploi'
  | 'Bourse'
  | 'Formation'

export interface Opportunity {
  id: string
  slug: string
  title: string
  type: OpportunityType
  summary: string
  /** Inclusive opening date, ISO YYYY-MM-DD. */
  opensAt: string
  /** Inclusive closing date, ISO YYYY-MM-DD. */
  deadline: string
  deadlineLabel: string
  locations: string[]
  locationLabel: string
  project: string
  projectSlug: ProjectSlug
  themes: string[]
  audiences: string[]
  image: string
  applyLabel?: string
  applyHref?: string
  contactEmail?: string
  dataGaps?: string[]
}

/**
 * Source-backed opportunities only.
 * Currently one complete call notice exists in the corpus:
 * Publications et ressources/Irada4youth/2e_AaPs_PPT JUIN_2026.pdf
 *
 * Homepage prototype cards with invented deadlines must not seed this list.
 */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'irada-2aap-2026',
    slug: 'irada-2e-appel-a-propositions-2026',
    title: 'Irada4Youth — 2e appel à propositions',
    type: 'Appel à projets',
    summary:
      'Financement de projets créateurs d’emplois dans six gouvernorats prioritaires, ' +
      'avec le CGDR.',
    opensAt: '2026-06-26',
    deadline: '2026-07-24',
    deadlineLabel: '24 juillet 2026',
    locations: ['Zaghouan', 'Mahdia', 'Le Kef', 'Kairouan', 'Kébili', 'Tozeur'],
    locationLabel: 'Zaghouan · Mahdia · Le Kef · Kairouan · Kébili · Tozeur',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    themes: ['Emploi et entrepreneuriat', 'Agriculture et agroalimentaire'],
    audiences: ['Jeunes diplômés', 'Certifiés professionnels', 'Porteuses de projets'],
    image: '/img/photo-entretien.webp',
    applyLabel: 'Voir l’appel complet',
    contactEmail: 'question-2aap-irada4youth@cgdr.nat.tn',
    dataGaps: [
      'Titre éditorial long non fourni dans la source (intitulé officiel : 2è APPEL À PROPOSITIONS).',
      'Lien public de dépôt en ligne non fourni ; le PPT distingue une adresse de questions de l’adresse réservée aux soumissions.',
    ],
  },
]

export function opportunityStatus(
  item: Pick<Opportunity, 'opensAt' | 'deadline'>,
  now = new Date(),
): OpportunityStatus {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const opens = new Date(`${item.opensAt}T00:00:00`)
  const closes = new Date(`${item.deadline}T23:59:59`)
  if (today < opens) return 'À venir'
  if (today > closes) return 'Clôturée'
  return 'Ouverte'
}

export const OPPORTUNITY_TYPE_CHIPS = [
  { id: 'Toutes', label: 'Toutes' },
  { id: 'Appel à projets', label: 'Appel à projets' },
  { id: 'Appel à candidatures', label: 'Appel à candidatures' },
  { id: 'Stage / emploi', label: 'Stage / emploi' },
  { id: 'Bourse', label: 'Bourse' },
  { id: 'Formation', label: 'Formation' },
]

export const OPPORTUNITY_LIST_FALLBACK = OPPORTUNITIES.map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  type: item.type,
  summary: item.summary,
  opensAt: item.opensAt,
  deadline: item.deadline,
  deadlineLabel: item.deadlineLabel,
  locations: item.locations.join(' · '),
  locationLabel: item.locationLabel,
  project: item.project,
  projectSlug: item.projectSlug,
  themes: item.themes.join(' · '),
  audiences: item.audiences.join(' · '),
  image: item.image,
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

function names(raw: unknown, fallback: string[]) {
  if (Array.isArray(raw)) {
    const list = raw.map(String).map((item) => item.trim()).filter(Boolean)
    return list.length ? list : fallback
  }
  if (typeof raw !== 'string' || !raw.trim()) return fallback
  const list = raw.split(/[·,;\n]/).map((item) => item.trim()).filter(Boolean)
  return list.length ? list : fallback
}

function textOf(value: unknown, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string') return value || fallback
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    return String(rec.fr || rec.en || rec.ar || fallback)
  }
  return String(value) || fallback
}

const TYPES: OpportunityType[] = [
  'Appel à projets',
  'Appel à candidatures',
  'Stage / emploi',
  'Bourse',
  'Formation',
]

function asType(raw: unknown, fallback: OpportunityType): OpportunityType {
  const value = textOf(raw, fallback)
  return (TYPES as string[]).includes(value) ? (value as OpportunityType) : fallback
}

export function listingOpportunities(raw: string, catalog: Opportunity[]): Opportunity[] {
  const rows = parseJsonRows(raw)

  const fromCatalog = (source: Opportunity, row?: Record<string, unknown>): Opportunity => {
    const type = asType(row?.type, source.type || 'Appel à projets')
    return {
      id: String(row?.id || source.id || source.slug || ''),
      slug: String(row?.slug || source.slug || ''),
      title: textOf(row?.title, textOf(source.title)),
      type,
      summary: textOf(row?.summary, textOf(source.summary)),
      opensAt: String(row?.opensAt || source.opensAt || ''),
      deadline: String(row?.deadline || source.deadline || ''),
      deadlineLabel: String(row?.deadlineLabel || source.deadlineLabel || ''),
      locations: names(row?.locations, source.locations || []),
      locationLabel: String(row?.locationLabel || source.locationLabel || ''),
      project: String(row?.project || source.project || ''),
      projectSlug: (String(row?.projectSlug || source.projectSlug || 'irada4youth') ||
        'irada4youth') as ProjectSlug,
      themes: names(row?.themes, source.themes || []),
      audiences: names(row?.audiences, source.audiences || []),
      image: String(row?.image || source.image || '/img/photo-entretien.webp'),
      applyLabel: source.applyLabel,
      applyHref: source.applyHref,
      contactEmail: source.contactEmail,
      dataGaps: source.dataGaps,
    }
  }

  if (catalog.length > 0) {
    const overrides = new Map((rows || []).map((row) => [String(row.slug || ''), row]))
    return catalog
      .map((item) => fromCatalog(item, overrides.get(String(item.slug || ''))))
      .filter((item) => item.slug)
  }

  const list = rows?.length ? rows : OPPORTUNITY_LIST_FALLBACK
  return list
    .map((row) => {
      const slug = String(row.slug || '')
      const source =
        OPPORTUNITIES.find((item) => item.slug === slug) ||
        ({
          id: slug,
          slug,
          title: '',
          type: 'Appel à projets',
          summary: '',
          opensAt: '',
          deadline: '',
          deadlineLabel: '',
          locations: [],
          locationLabel: '',
          project: '',
          projectSlug: 'irada4youth',
          themes: [],
          audiences: [],
          image: '/img/photo-entretien.webp',
        } as Opportunity)
      return fromCatalog(source, row)
    })
    .filter((item) => item.slug)
}

export function parseTypeChips(raw: string) {
  const rows = parseJsonRows(raw)
  const list = rows?.length ? rows : OPPORTUNITY_TYPE_CHIPS
  return list.map((row, index) => ({
    id: String(row.id || OPPORTUNITY_TYPE_CHIPS[index]?.id || ''),
    label: String(row.label || row.id || OPPORTUNITY_TYPE_CHIPS[index]?.label || ''),
  })).filter((row) => row.id)
}

export function sortOpportunities(
  items: Opportunity[],
  mode: 'deadline' | 'recent',
): Opportunity[] {
  return [...items].sort((a, b) => {
    const statusRank = (item: Opportunity) => {
      const status = opportunityStatus(item)
      if (status === 'Ouverte') return 0
      if (status === 'À venir') return 1
      return 2
    }
    const byStatus = statusRank(a) - statusRank(b)
    if (byStatus !== 0) return byStatus
    return mode === 'recent'
      ? b.opensAt.localeCompare(a.opensAt)
      : a.deadline.localeCompare(b.deadline)
  })
}
