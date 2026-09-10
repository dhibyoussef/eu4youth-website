import type { ProjectSlug } from './types'

export type NewsType =
  | 'Communiqué'
  | 'Événement'
  | 'Partenariat'
  | 'Résultat / succès de terrain'
  | 'Vie du programme'

export interface NewsArticle {
  id: string
  slug: string
  title: string
  type: NewsType
  summary: string
  /** ISO YYYY-MM-DD. When the source only gives a month, use the 1st and note it. */
  publishedAt: string
  dateLabel: string
  project: string
  projectSlug: ProjectSlug
  themes: string[]
  locations: string[]
  image: string
  source?: string
  dataGaps?: string[]
}

/**
 * Dated, newsletter-backed articles only.
 * Homepage teasers with invented day stamps must not seed this list.
 */
export const NEWS: NewsArticle[] = [
  {
    id: 'go4youth-nl11-avril-2026',
    slug: 'go4youth-avancees-transformation-digitale-aneti-avril-2026',
    title: 'Avancées majeures dans la transformation digitale de l’ANETI',
    type: 'Vie du programme',
    summary:
      'Refonte du système d’information en cours d’évaluation, GEC/GED généralisé ' +
      'et 102 sites raccordés à la fibre optique.',
    publishedAt: '2026-04-01',
    dateLabel: 'Avril 2026',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    locations: ['Présence nationale'],
    image: '/img/photo-entretien.webp',
    source: 'ANETI Newsletter n°11 — Avril 2026',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl10-decembre-2025',
    slug: 'go4youth-generalisation-matching-14-betis-decembre-2025',
    title: 'Généralisation des services et préparation du matching dans 14 BETIs',
    type: 'Résultat / succès de terrain',
    summary:
      'Inscription à distance et CIVP en ligne opérationnels dans 48 BETIs ; ' +
      '116 990 comptes créés et 17 202 entreprises inscrites.',
    publishedAt: '2025-12-01',
    dateLabel: 'Décembre 2025',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    locations: ['Présence nationale'],
    image: '/img/photo-celebration.webp',
    source: 'ANETI Newsletter n°10 — Décembre 2025',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl8-mai-2025',
    slug: 'go4youth-civp-inscription-19-betis-mai-2025',
    title: 'CIVP et inscription en ligne déployés dans 19 BETIs supplémentaires',
    type: 'Résultat / succès de terrain',
    summary:
      'Deux outils majeurs étendus le 10 avril puis le 8 mai 2025, portant à 25 ' +
      'le nombre de BETIs équipés après la phase pilote.',
    publishedAt: '2025-05-01',
    dateLabel: 'Mai 2025',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    locations: ['Présence nationale', 'Grand Tunis'],
    image: '/img/photo-livres.webp',
    source: 'ANETI Newsletter n°8 — Mai 2025',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl7-janvier-2025',
    slug: 'go4youth-48-chefs-beti-tunis-decembre-2024',
    title: '48 chefs de BETIs réunis à Tunis pour lancer la généralisation',
    type: 'Événement',
    summary:
      'Ateliers des 4 et 5 décembre 2024 réunissant les BETIs pilotes et ceux de ' +
      'la première phase de généralisation.',
    publishedAt: '2025-01-01',
    dateLabel: 'Janvier 2025',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité'],
    locations: ['Tunis'],
    image: '/img/art-graffiti.webp',
    source: 'ANETI Newsletter n°7 — Janvier 2025',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl6-septembre-2024',
    slug: 'go4youth-41-beti-phase-generalisation-septembre-2024',
    title: '41 nouveaux BETIs sélectionnés pour la 1re phase de généralisation',
    type: 'Résultat / succès de terrain',
    summary:
      'Après la phase pilote dans six bureaux, la couverture atteint 42 % du ' +
      'réseau national des BETIs.',
    publishedAt: '2024-09-01',
    dateLabel: 'Septembre 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité'],
    locations: ['Présence nationale'],
    image: '/img/photo-recyclage.webp',
    source: 'ANETI Newsletter n°6 — Septembre 2024',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl5-juin-2024',
    slug: 'go4youth-copil-entree-generalisation-juin-2024',
    title: 'Le COPIL Go4Youth acte l’entrée en phase de généralisation',
    type: 'Communiqué',
    summary:
      'Réuni le 7 juin 2024 sous la présidence du ministre Lotfi Dhiab, le comité ' +
      'valide le passage de la phase pilote à la généralisation.',
    publishedAt: '2024-06-07',
    dateLabel: '7 juin 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité', 'Gouvernance'],
    locations: ['Tunis'],
    image: '/img/photo-elevage.webp',
    source: 'ANETI Newsletter n°5 — Juin 2024',
  },
  {
    id: 'go4youth-nl4-mars-2024',
    slug: 'go4youth-refonte-outil-profilage-mars-2024',
    title: 'L’outil de profilage ANETI est en cours de refonte',
    type: 'Vie du programme',
    summary:
      'Après plusieurs mois d’expérimentation, plus de 40 % des segments sont ' +
      'corrigés en entretien ; une cellule d’amélioration continue est créée.',
    publishedAt: '2024-03-01',
    dateLabel: 'Mars 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    locations: ['Présence nationale'],
    image: '/img/photo-entretien.webp',
    source: 'ANETI Newsletter n°4 — Mars 2024',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-nl2-juin-2023',
    slug: 'go4youth-nouveaux-services-six-beti-pilotes-juin-2023',
    title: 'Nouveaux services et outils dans six BETIs pilotes',
    type: 'Résultat / succès de terrain',
    summary:
      'Expérimentation à Hammam Sousse, Gafsa, Le Kef, Charguia, Gabès et ' +
      'Fouchana, avec 118 maîtres formateurs préparés depuis octobre 2022.',
    publishedAt: '2023-06-01',
    dateLabel: 'Juin 2023',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    themes: ['Emploi et employabilité'],
    locations: ['Hammam Sousse', 'Gafsa', 'Le Kef', 'Charguia', 'Gabès', 'Fouchana'],
    image: '/img/photo-celebration.webp',
    source: 'ANETI Newsletter n°2 — Juin 2023',
    dataGaps: ['Jour de publication non indiqué dans la newsletter ; date retenue : 1er du mois.'],
  },
]

export const NEWS_TYPES: readonly NewsType[] = [
  'Communiqué',
  'Événement',
  'Partenariat',
  'Résultat / succès de terrain',
  'Vie du programme',
]

export const NEWS_TYPE_CHIPS = [
  { id: 'Toutes', label: 'Toutes' },
  ...NEWS_TYPES.map((type) => ({ id: type, label: type })),
]

export const NEWS_LIST_FALLBACK = NEWS.map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  type: item.type,
  summary: item.summary,
  publishedAt: item.publishedAt,
  dateLabel: item.dateLabel,
  project: item.project,
  projectSlug: item.projectSlug,
  themes: item.themes.join(' · '),
  locations: item.locations.join(' · '),
  image: item.image,
  source: item.source || '',
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

function asType(raw: unknown, fallback: NewsType): NewsType {
  const value = textOf(raw, fallback)
  return (NEWS_TYPES as readonly string[]).includes(value) ? (value as NewsType) : fallback
}

export function listingNews(raw: string, catalog: NewsArticle[]): NewsArticle[] {
  const rows = parseJsonRows(raw)

  const fromCatalog = (item: NewsArticle, row?: Record<string, unknown>): NewsArticle => {
    const source = item
    return {
      id: String(row?.id || source.id || source.slug || ''),
      slug: String(row?.slug || source.slug || ''),
      title: textOf(row?.title, textOf(source.title)),
      type: asType(row?.type, source.type || 'Vie du programme'),
      summary: textOf(row?.summary, textOf(source.summary)),
      publishedAt: String(row?.publishedAt || source.publishedAt || ''),
      dateLabel: String(row?.dateLabel || source.dateLabel || ''),
      project: String(row?.project || source.project || ''),
      projectSlug: (String(row?.projectSlug || source.projectSlug || 'go4youth') ||
        'go4youth') as ProjectSlug,
      themes: names(row?.themes, source.themes || []),
      locations: names(row?.locations, source.locations || []),
      image: String(row?.image || source.image || '/img/photo-entretien.webp'),
      source: String(row?.source || source.source || '') || undefined,
      dataGaps: source.dataGaps,
    }
  }

  /* Live catalogue is source of truth so CMS create/publish appears immediately. */
  if (catalog.length > 0) {
    const overrides = new Map((rows || []).map((row) => [String(row.slug || ''), row]))
    return catalog
      .map((item) => fromCatalog(item, overrides.get(String(item.slug || ''))))
      .filter((item) => item.slug)
  }

  const list = rows?.length ? rows : NEWS_LIST_FALLBACK
  return list
    .map((row) => {
      const slug = String(row.slug || '')
      const source =
        NEWS.find((item) => item.slug === slug) ||
        ({
          id: slug,
          slug,
          title: '',
          type: 'Vie du programme',
          summary: '',
          publishedAt: '',
          dateLabel: '',
          project: '',
          projectSlug: 'go4youth',
          themes: [],
          locations: [],
          image: '/img/photo-entretien.webp',
        } as NewsArticle)
      return fromCatalog(source, row)
    })
    .filter((item) => item.slug)
}

export function parseNewsTypeChips(raw: string) {
  const rows = parseJsonRows(raw)
  const list = rows?.length ? rows : NEWS_TYPE_CHIPS
  return list
    .map((row, index) => ({
      id: String(row.id || NEWS_TYPE_CHIPS[index]?.id || ''),
      label: String(row.label || row.id || NEWS_TYPE_CHIPS[index]?.label || ''),
    }))
    .filter((row) => row.id)
}
