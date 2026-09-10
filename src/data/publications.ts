import type { ProjectSlug } from './types'

export type ResourceType =
  | 'Newsletter'
  | 'Rapport'
  | 'Module de formation'
  | 'Appel à propositions'
  | 'Capitalisation'

export interface Publication {
  id: string
  title: string
  type: ResourceType
  project: string
  projectSlug: ProjectSlug
  /** ISO date used for sorting. Month-only sources use the 1st of that month.
   * Absent when the source document carries no date; those sort last. */
  publishedAt?: string
  dateLabel: string
  /** Absent when the source document carries no publication year. */
  year?: string
  language: 'Français'
  format: 'PDF'
  themes: string[]
  summary: string
  /** Public download path under /docs. Absent while the file itself has not been
   * supplied, in which case the card shows the document without a download. */
  href?: string
  /** Weight of the downloadable file, displayed next to the format per the UX brief
   * (6.6). Measured with tools/pub_file_sizes.py. */
  fileSize?: string
  /** Cover thumbnail under /img/pub-covers. */
  cover?: string
  /** Original corpus path for editorial traceability. */
  sourceFile: string
  dataGaps?: string[]
}

const CORPUS = 'Publications et  ressources'

const PUBLICATION_CORPUS: Publication[] = [
  {
    id: 'go4youth-newsletter-11',
    title: 'Lettre d’information ANETI — numéro 11',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2026-04-01',
    dateLabel: 'Avril 2026',
    year: '2026',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    summary:
      'Avancées dans la transformation digitale de l’ANETI : SI en cours de sélection, GEC/GED généralisé et 102 sites raccordés à la fibre.',
    href: '/docs/go4youth/newsletter-11-avril-2026.pdf',
    fileSize: '2,9 Mo',
    cover: '/img/pub-covers/newsletter-11-avril-2026.webp',
    sourceFile: `${CORPUS}/Go4Youth/ANETI-Newsletter-11-Final.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-10',
    title: 'Lettre d’information ANETI — numéro 10',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2025-12-01',
    dateLabel: 'Décembre 2025',
    year: '2025',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    summary:
      'Nouveaux services opérationnels dans 48 BETIs ; préparation du matching et de la gestion de l’offre dans 14 BETIs.',
    href: '/docs/go4youth/newsletter-10-decembre-2025.pdf',
    fileSize: '2,6 Mo',
    cover: '/img/pub-covers/newsletter-10-decembre-2025.webp',
    sourceFile: `${CORPUS}/Go4Youth/ANETI-Newsletter-10th-Edition (1).pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-8',
    title: 'Lettre d’information Go4Youth — numéro 8',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2025-05-01',
    dateLabel: 'Mai 2025',
    year: '2025',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    summary:
      'Déploiement du CIVP et de l’inscription en ligne dans 19 BETIs supplémentaires, portant à 25 le total équipé.',
    href: '/docs/go4youth/newsletter-8-mai-2025.pdf',
    fileSize: '1,5 Mo',
    cover: '/img/pub-covers/newsletter-8-mai-2025.webp',
    sourceFile: `${CORPUS}/Go4Youth/Go4Youth-Newsletter-8-Final.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-7',
    title: 'Lettre d’information ANETI — numéro 7',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2025-01-01',
    dateLabel: 'Janvier 2025',
    year: '2025',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité'],
    summary:
      '48 chefs de BETIs réunis à Tunis les 4 et 5 décembre 2024 pour lancer la généralisation.',
    href: '/docs/go4youth/newsletter-7-janvier-2025.pdf',
    fileSize: '1,3 Mo',
    cover: '/img/pub-covers/newsletter-7-janvier-2025.webp',
    sourceFile: `${CORPUS}/Go4Youth/ANETI-Newsletter-7-250124-V2 (1).pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-6',
    title: 'Lettre d’information ANETI — numéro 6',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2024-09-01',
    dateLabel: 'Septembre 2024',
    year: '2024',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité'],
    summary:
      'Sélection de 41 nouveaux BETIs pour la première phase de généralisation (42 % du réseau).',
    href: '/docs/go4youth/newsletter-6-septembre-2024.pdf',
    fileSize: '1,9 Mo',
    cover: '/img/pub-covers/newsletter-6-septembre-2024.webp',
    sourceFile: `${CORPUS}/Go4Youth/ANETI-Newsletter-6-241017.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-5',
    title: 'Lettre d’information ANETI — numéro 5',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2024-06-01',
    dateLabel: 'Juin 2024',
    year: '2024',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité', 'Gouvernance'],
    summary:
      'Le comité de pilotage du 7 juin 2024 acte l’entrée du projet en phase de généralisation.',
    href: '/docs/go4youth/newsletter-5-juin-2024.pdf',
    fileSize: '1,6 Mo',
    cover: '/img/pub-covers/newsletter-5-juin-2024.webp',
    sourceFile: `${CORPUS}/Go4Youth/ANETI-Newsletter-5-V1.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-4',
    title: 'Lettre d’information Go4Youth — numéro 4',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2024-03-01',
    dateLabel: 'Mars 2024',
    year: '2024',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité', 'Transformation digitale'],
    summary:
      'Refonte de l’outil de profilage et création d’une cellule d’amélioration continue.',
    href: '/docs/go4youth/newsletter-4-mars-2024.pdf',
    fileSize: '745 Ko',
    cover: '/img/pub-covers/newsletter-4-mars-2024.webp',
    sourceFile: `${CORPUS}/Go4Youth/GO4Youth_Newsletter_4.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'go4youth-newsletter-2',
    title: 'Lettre d’information Go4Youth — numéro 2',
    type: 'Newsletter',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    publishedAt: '2023-06-01',
    dateLabel: 'Juin 2023',
    year: '2023',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et employabilité'],
    summary:
      'Nouveaux services et outils expérimentés dans six BETIs pilotes.',
    href: '/docs/go4youth/newsletter-2-juin-2023.pdf',
    fileSize: '1,6 Mo',
    cover: '/img/pub-covers/newsletter-2-juin-2023.webp',
    sourceFile: `${CORPUS}/Go4Youth/Newsletter_Juin2023.pdf`,
    dataGaps: ['Jour de publication non indiqué ; date retenue : 1er du mois.'],
  },
  {
    id: 'irada-appel-propositions-2026',
    title: 'Irada4Youth — 2e appel à propositions',
    type: 'Appel à propositions',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    publishedAt: '2026-06-26',
    dateLabel: '26 juin 2026',
    year: '2026',
    language: 'Français',
    format: 'PDF',
    themes: ['Emploi et entrepreneuriat'],
    summary:
      'Présentation des conditions, secteurs prioritaires et modalités du second appel.',
    href: '/docs/irada4youth/2e-appel-propositions-juin-2026.pdf',
    fileSize: '1,2 Mo',
    cover: '/img/pub-covers/2e-appel-propositions-juin-2026.webp',
    sourceFile: `${CORPUS}/Irada4youth/2e_AaPs_PPT JUIN_2026.pdf`,
  },
  {
    id: 'irada-rapport-narratif-2025',
    title: 'Irada4Youth — rapport narratif 2025',
    type: 'Rapport',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    publishedAt: '2026-04-01',
    dateLabel: 'Avril 2026',
    year: '2026',
    language: 'Français',
    format: 'PDF',
    themes: ['Suivi et résultats'],
    summary:
      'Rapport narratif intermédiaire n°3 sur les réalisations 2025 : suivi des tranches, retards et renforcement des capacités.',
    href: '/docs/irada4youth/rapport-narratif-2025.pdf',
    fileSize: '1,9 Mo',
    cover: '/img/pub-covers/rapport-narratif-2025.webp',
    sourceFile: `${CORPUS}/Irada4youth/IRADA4YOUTH_Rapp_Narratif_2025.pdf`,
    dataGaps: [
      'Couverture 2025 ; date de publication retenue d’après la couverture (avril 2026). Une page d’identification mentionne aussi mai 2026.',
    ],
  },
  {
    id: 'irada-rapport-narratif-2024',
    title: 'Irada4Youth — rapport narratif 2024',
    type: 'Rapport',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    publishedAt: '2025-06-01',
    dateLabel: 'Juin 2025',
    year: '2025',
    language: 'Français',
    format: 'PDF',
    themes: ['Suivi et résultats'],
    summary:
      'Rapport narratif intermédiaire n°2 : 51 contrats, mise en œuvre et préparation du second appel.',
    href: '/docs/irada4youth/rapport-narratif-2024.pdf',
    fileSize: '1,6 Mo',
    cover: '/img/pub-covers/rapport-narratif-2024.webp',
    sourceFile: `${CORPUS}/Irada4youth/IRADA4YOUTH_Rapp_Narratif_2024.pdf`,
    dataGaps: [
      'Couverture 2024 ; date de publication retenue d’après la couverture (juin 2025). La page d’identification porte une date « février 2024 » chronologiquement incohérente.',
    ],
  },
  {
    id: 'irada-rapport-narratif-2023',
    title: 'Irada4Youth — rapport narratif 2023',
    type: 'Rapport',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    publishedAt: '2024-03-01',
    dateLabel: 'Mars 2024',
    year: '2024',
    language: 'Français',
    format: 'PDF',
    themes: ['Suivi et résultats'],
    summary:
      'Rapport narratif des réalisations juin 2022–décembre 2023 : lancement, premier appel et 306 dossiers éligibles.',
    href: '/docs/irada4youth/rapport-narratif-2023.pdf',
    fileSize: '8,5 Mo',
    cover: '/img/pub-covers/rapport-narratif-2023.webp',
    sourceFile: `${CORPUS}/Irada4youth/IRADA4YOUTH_Rapp_Narratif_2023.pdf`,
    dataGaps: [
      'Couverture 2022–2023 ; date de publication retenue d’après la couverture (mars 2024).',
    ],
  },
  {
    id: 'fe3ila-capitalisation-forums-jeunes',
    title: 'Capitalisation de l’expérience des forums des jeunes',
    type: 'Capitalisation',
    project: 'Fe3il.a',
    projectSlug: 'fe3ila',
    dateLabel: 'Date de publication à confirmer',
    language: 'Français',
    format: 'PDF',
    themes: ['Gouvernance', 'Participation des jeunes'],
    summary:
      'Capitalisation de l’expérience des forums des jeunes conduits dans le cadre du projet Fe3il.a, mis en œuvre par CILG-VNG International avec le financement de l’Union européenne et du ministère néerlandais des Affaires étrangères.',
    cover: '/img/pub-covers/fe3ila-capitalisation-forums-jeunes.webp',
    sourceFile: 'UI Web Design/images/25.png',
    dataGaps: [
      'Seule la couverture du document a été fournie : titre, projet et bailleurs sont lus sur la couverture et sur son bandeau de logos.',
      'Fichier PDF non fourni : la carte reste consultable mais sans téléchargement.',
      'Ni date ni année de publication indiquées sur la couverture.',
      'Thématiques déduites du périmètre documenté du projet Fe3il.a (gouvernance locale, participation des jeunes).',
    ],
  },
  {
    id: 'irada-module-pilotage-changement-2024',
    title: 'Pilotage du changement stratégique et organisationnel',
    type: 'Module de formation',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    publishedAt: '2024-01-01',
    dateLabel: '2024 (brouillon)',
    year: '2024',
    language: 'Français',
    format: 'PDF',
    themes: ['Gouvernance', 'Renforcement des capacités'],
    summary:
      'Support de formation (brouillon) sur le pilotage des processus de changement stratégique et organisationnel.',
    cover: '/img/pub-covers/module-pilotage-changement-2024.webp',
    sourceFile: `${CORPUS}/Irada4youth/Module  PILOTAGE DE PROCESSUS DE CHANGEMENT STRATEGIQUE ET ORGANISATIONNEl_2024.pdf`,
    dataGaps: [
      'Document marqué Draft dans le corpus. L’année 2024 est déduite du nom de fichier. Le texte extractible ne fournit pas de résumé éditorial robuste.',
    ],
  },
]

/** Documents explicitly marked as drafts remain traceable in the source corpus but are
 * not exposed in the public catalogue until editorial validation. */
export const PUBLICATIONS = PUBLICATION_CORPUS.filter(
  (item) => !item.dataGaps?.some((gap) => /\b(?:draft|brouillon)\b/i.test(gap)),
)

export const RESOURCE_TYPES: readonly ResourceType[] = [
  'Newsletter',
  'Rapport',
  'Module de formation',
  'Appel à propositions',
  'Capitalisation',
]

export const PUBLICATION_TYPE_CHIPS = [
  { id: 'Toutes', label: 'Toutes' },
  ...RESOURCE_TYPES.map((type) => ({ id: type, label: type })),
]

export const PUBLICATION_SORT_FALLBACK = [
  { id: 'default', label: 'par défaut' },
  { id: 'downloads', label: 'plus téléchargées' },
  { id: 'views', label: 'plus consultées' },
  { id: 'recent', label: 'plus récents' },
]

export const PUBLICATION_LIST_FALLBACK = PUBLICATIONS.map((item) => ({
  id: item.id,
  title: item.title,
  type: item.type,
  summary: item.summary,
  project: item.project,
  projectSlug: item.projectSlug,
  publishedAt: item.publishedAt || '',
  dateLabel: item.dateLabel,
  year: item.year || '',
  language: item.language,
  format: item.format,
  themes: item.themes.join(' · '),
  href: item.href || '',
  fileSize: item.fileSize || '',
  cover: item.cover || '',
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

function asType(raw: unknown, fallback: ResourceType): ResourceType {
  const value = textOf(raw, fallback)
  return (RESOURCE_TYPES as readonly string[]).includes(value) ? (value as ResourceType) : fallback
}

export function listingPublications(raw: string, catalog: Publication[]): Publication[] {
  const rows = parseJsonRows(raw)

  const fromCatalog = (source: Publication, row?: Record<string, unknown>): Publication => {
    const publishedAt = String(row?.publishedAt || source.publishedAt || '')
    const year = String(row?.year || source.year || '')
    const href = String(row?.href || source.href || '')
    const cover = String(row?.cover || source.cover || '')
    const fileSize = String(row?.fileSize || source.fileSize || '')
    return {
      id: String(row?.id || source.id || ''),
      title: textOf(row?.title, textOf(source.title)),
      type: asType(row?.type, source.type || 'Rapport'),
      project: String(row?.project || source.project || ''),
      projectSlug: (String(row?.projectSlug || source.projectSlug || 'go4youth') ||
        'go4youth') as ProjectSlug,
      publishedAt: publishedAt || undefined,
      dateLabel: String(row?.dateLabel || source.dateLabel || ''),
      year: year || undefined,
      language: (String(row?.language || source.language || 'Français') ||
        'Français') as Publication['language'],
      format: (String(row?.format || source.format || 'PDF') || 'PDF') as Publication['format'],
      themes: names(row?.themes, source.themes || []),
      summary: textOf(row?.summary, textOf(source.summary)),
      href: href || undefined,
      fileSize: fileSize || undefined,
      cover: cover || undefined,
      sourceFile: source.sourceFile || '',
      dataGaps: source.dataGaps,
    }
  }

  if (catalog.length > 0) {
    const overrides = new Map((rows || []).map((row) => [String(row.id || ''), row]))
    return catalog
      .map((item) => fromCatalog(item, overrides.get(String(item.id || ''))))
      .filter((item) => item.id)
  }

  const list = rows?.length ? rows : PUBLICATION_LIST_FALLBACK
  return list
    .map((row) => {
      const id = String(row.id || '')
      const source =
        PUBLICATIONS.find((item) => item.id === id) ||
        ({
          id,
          title: '',
          type: 'Rapport',
          project: '',
          projectSlug: 'go4youth',
          dateLabel: '',
          themes: [],
          summary: '',
          sourceFile: '',
          language: 'Français',
          format: 'PDF',
        } as Publication)
      return fromCatalog(source, row)
    })
    .filter((item) => item.id)
}

export function parseNamedRows(raw: string, fallback: { id: string; label: string }[]) {
  const rows = parseJsonRows(raw)
  const list = rows?.length ? rows : fallback
  return list
    .map((row, index) => ({
      id: String(row.id || fallback[index]?.id || ''),
      label: String(row.label || row.id || fallback[index]?.label || ''),
    }))
    .filter((row) => row.id)
}
