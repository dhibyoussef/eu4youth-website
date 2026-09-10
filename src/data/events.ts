import type { ProjectSlug } from './types'

export type EventFormat =
  | 'Atelier'
  | 'Comité de pilotage'
  | 'Cérémonie'
  | 'Formation'
  | "Journée d'information"
  | 'Rencontre'

export interface ProgrammeEvent {
  id: string
  title: string
  summary: string
  startsAt: string
  endsAt?: string
  dateLabel: string
  project: string
  projectSlug: ProjectSlug
  location: string
  format: EventFormat
  image: string
  source: string
  /** Links the event back to the public publication that documents it. */
  sourcePublicationId?: string
}

/** Explicit source-label → publication.id mappings; never inferred from logos. */
export const EVENT_SOURCE_PUBLICATIONS: Record<string, string> = {
  'ANETI Newsletter n°10 — Décembre 2025': 'go4youth-newsletter-10',
  'ANETI Newsletter n°7 — Janvier 2025': 'go4youth-newsletter-7',
  'ANETI Newsletter n°6 — Septembre 2024': 'go4youth-newsletter-6',
  'ANETI Newsletter n°5 — Juin 2024': 'go4youth-newsletter-5',
  'IRADA4YOUTH — Rapport narratif 2025': 'irada-rapport-narratif-2025',
  'IRADA4YOUTH — Rapport narratif 2024': 'irada-rapport-narratif-2024',
  'IRADA4YOUTH — Rapport narratif 2023': 'irada-rapport-narratif-2023',
}

export function resolveEventSourcePublicationId(source: string) {
  return EVENT_SOURCE_PUBLICATIONS[source]
}

/**
 * Public event dates explicitly stated in approved project publications.
 * Publication months from newsletters are never reused as event dates.
 * Internal selection committees and monitoring visits are omitted.
 */
export const EVENTS: ProgrammeEvent[] = [
  {
    id: 'go4youth-tre-decembre-2025',
    title: 'Trois sessions de formation PI — gestion de l’offre (42 BETIs)',
    summary:
      'Formations destinées aux conseillers Placement Insertion (PI) de 42 BETIs sur la gestion de l’offre d’emploi, dans le cadre de la généralisation GO4Youth.',
    startsAt: '2025-12-15',
    endsAt: '2025-12-15',
    dateLabel: '15 décembre 2025',
    project: 'GO4Youth',
    projectSlug: 'go4youth',
    location: 'Tunisie',
    format: 'Formation',
    image: '/img/photo-entretien.webp',
    source: 'ANETI Newsletter n°10 — Décembre 2025',
  },
  {
    id: 'irada-copil-avril-2025',
    title: 'Comité de pilotage IRADA4YOUTH',
    summary:
      'Réunion du comité de pilotage du projet, documentée dans le rapport narratif 2025.',
    startsAt: '2025-04-07',
    dateLabel: '7 avril 2025',
    project: 'IRADA4YOUTH',
    projectSlug: 'irada4youth',
    location: 'Tunisie',
    format: 'Comité de pilotage',
    image: '/img/photo-recyclage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2025',
  },
  {
    id: 'irada-comite-partenaires-octobre-2025',
    title: 'Comité des partenaires IRADA4YOUTH',
    summary:
      'Réunion du comité des partenaires du projet, documentée dans le rapport narratif 2025.',
    startsAt: '2025-10-03',
    dateLabel: '3 octobre 2025',
    project: 'IRADA4YOUTH',
    projectSlug: 'irada4youth',
    location: 'Tunisie',
    format: 'Comité de pilotage',
    image: '/img/photo-elevage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2025',
  },
  {
    id: 'go4youth-revue-aneti-octobre-2025',
    title: 'Réunion de revue ANETI sur la première phase de généralisation',
    summary:
      'Point d’étape sur le déploiement des nouveaux services dans le réseau des BETIs.',
    startsAt: '2025-10-24',
    dateLabel: '24 octobre 2025',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Rencontre',
    image: '/img/photo-celebration.webp',
    source: 'ANETI Newsletter n°10 — Décembre 2025',
  },
  {
    id: 'go4youth-ms2-octobre-2025',
    title: 'Présentation des résultats de l’enquête MS2',
    summary:
      'Restitution des résultats de l’enquête auprès des usagers et des conseillers des BETIs.',
    startsAt: '2025-10-17',
    dateLabel: '17 octobre 2025',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Rencontre',
    image: '/img/photo-livres.webp',
    source: 'ANETI Newsletter n°10 — Décembre 2025',
  },
  {
    id: 'go4youth-ateliers-beti-decembre-2024',
    title: '48 chefs de BETIs réunis pour préparer la généralisation',
    summary:
      'Deux journées d’ateliers réunissant les BETIs pilotes et ceux de la première phase de généralisation.',
    startsAt: '2024-12-04',
    endsAt: '2024-12-05',
    dateLabel: '4–5 décembre 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Atelier',
    image: '/img/art-graffiti.webp',
    source: 'ANETI Newsletter n°7 — Janvier 2025',
  },
  {
    id: 'irada-formation-kairouan-septembre-2024',
    title: 'Formation des structures d’appui — Kairouan',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-26',
    endsAt: '2024-09-27',
    dateLabel: '26–27 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Kairouan',
    format: 'Formation',
    image: '/img/photo-recyclage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-formation-mahdia-septembre-2024',
    title: 'Formation des structures d’appui — Mahdia',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-24',
    endsAt: '2024-09-25',
    dateLabel: '24–25 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Mahdia',
    format: 'Formation',
    image: '/img/photo-elevage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-formation-zaghouan-septembre-2024',
    title: 'Formation des structures d’appui — Zaghouan',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-19',
    endsAt: '2024-09-20',
    dateLabel: '19–20 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Zaghouan',
    format: 'Formation',
    image: '/img/photo-entretien.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-formation-kef-septembre-2024',
    title: 'Formation des structures d’appui — Le Kef',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-17',
    endsAt: '2024-09-18',
    dateLabel: '17–18 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Le Kef',
    format: 'Formation',
    image: '/img/photo-celebration.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-formation-kebili-septembre-2024',
    title: 'Formation des structures d’appui — Kébili',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-12',
    endsAt: '2024-09-13',
    dateLabel: '12–13 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Kébili',
    format: 'Formation',
    image: '/img/photo-livres.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'go4youth-lancement-matching-septembre-2024',
    title: 'Lancement officiel de la solution de matching WCC/ELISE',
    summary:
      'Réunion de lancement de l’outil de rapprochement offre–demande dans le réseau ANETI.',
    startsAt: '2024-09-12',
    dateLabel: '12 septembre 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Rencontre',
    image: '/img/art-graffiti.webp',
    source: 'ANETI Newsletter n°6 — Septembre 2024',
  },
  {
    id: 'irada-formation-tozeur-septembre-2024',
    title: 'Formation des structures d’appui — Tozeur',
    summary:
      'Session de formation destinée aux structures d’appui des porteurs de projets Irada4Youth.',
    startsAt: '2024-09-10',
    endsAt: '2024-09-11',
    dateLabel: '10–11 septembre 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Tozeur',
    format: 'Formation',
    image: '/img/photo-recyclage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'go4youth-atelier-preparation-septembre-2024',
    title: 'Atelier de préparation de la généralisation',
    summary:
      'Atelier préparatoire au déploiement élargi des services Go4Youth dans le réseau des BETIs.',
    startsAt: '2024-09-11',
    dateLabel: '11 septembre 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Atelier',
    image: '/img/photo-elevage.webp',
    source: 'ANETI Newsletter n°6 — Septembre 2024',
  },
  {
    id: 'go4youth-copil-juin-2024',
    title: 'Le COPIL Go4Youth acte l’entrée en phase de généralisation',
    summary:
      'Le comité de pilotage valide le passage de la phase pilote à la généralisation, sous la présidence du ministre Lotfi Dhiab.',
    startsAt: '2024-06-07',
    dateLabel: '7 juin 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Comité de pilotage',
    image: '/img/photo-entretien.webp',
    source: 'ANETI Newsletter n°5 — Juin 2024',
  },
  {
    id: 'go4youth-atelier-generalisation-3-mai-2024',
    title: 'Troisième atelier Vision 2030 — généralisation',
    summary:
      'Troisième atelier de préparation de la généralisation des services Go4Youth.',
    startsAt: '2024-05-29',
    endsAt: '2024-05-30',
    dateLabel: '29–30 mai 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Atelier',
    image: '/img/photo-celebration.webp',
    source: 'ANETI Newsletter n°5 — Juin 2024',
  },
  {
    id: 'go4youth-atelier-generalisation-2-mai-2024',
    title: 'Deuxième atelier Vision 2030 — généralisation',
    summary:
      'Deuxième atelier de préparation de la généralisation des services Go4Youth.',
    startsAt: '2024-05-14',
    dateLabel: '14 mai 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Atelier',
    image: '/img/photo-livres.webp',
    source: 'ANETI Newsletter n°5 — Juin 2024',
  },
  {
    id: 'irada-signature-zaghouan-avril-2024',
    title: 'Cérémonie de signature des contrats — Zaghouan',
    summary:
      'Signature des conventions de financement avec les porteurs de projets retenus dans le gouvernorat de Zaghouan.',
    startsAt: '2024-04-26',
    dateLabel: '26 avril 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Zaghouan',
    format: 'Cérémonie',
    image: '/img/art-graffiti.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-signature-tozeur-avril-2024',
    title: 'Cérémonie de signature des contrats — Tozeur',
    summary:
      'Signature des conventions de financement avec les porteurs de projets retenus dans le gouvernorat de Tozeur.',
    startsAt: '2024-04-24',
    dateLabel: '24 avril 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Tozeur',
    format: 'Cérémonie',
    image: '/img/photo-recyclage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'irada-signature-kairouan-avril-2024',
    title: 'Cérémonie de signature des contrats — Kairouan',
    summary:
      'Signature des conventions de financement avec les porteurs de projets retenus dans le gouvernorat de Kairouan.',
    startsAt: '2024-04-23',
    dateLabel: '23 avril 2024',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Kairouan',
    format: 'Cérémonie',
    image: '/img/photo-elevage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2024',
  },
  {
    id: 'go4youth-atelier-generalisation-1-mars-2024',
    title: 'Premier atelier Vision 2030 — généralisation',
    summary:
      'Premier atelier de préparation de la généralisation des services Go4Youth.',
    startsAt: '2024-03-07',
    dateLabel: '7 mars 2024',
    project: 'Go4Youth',
    projectSlug: 'go4youth',
    location: 'Tunis',
    format: 'Atelier',
    image: '/img/photo-entretien.webp',
    source: 'ANETI Newsletter n°5 — Juin 2024',
  },
  {
    id: 'irada-lancement-zaghouan-janvier-2023',
    title: 'Journée d’information régionale — Zaghouan',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-31',
    dateLabel: '31 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Zaghouan',
    format: "Journée d'information",
    image: '/img/photo-celebration.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
  {
    id: 'irada-lancement-kef-janvier-2023',
    title: 'Journée d’information régionale — Le Kef',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-27',
    dateLabel: '27 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Le Kef',
    format: "Journée d'information",
    image: '/img/photo-livres.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
  {
    id: 'irada-lancement-mahdia-janvier-2023',
    title: 'Journée d’information régionale — Mahdia',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-24',
    dateLabel: '24 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Mahdia',
    format: "Journée d'information",
    image: '/img/art-graffiti.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
  {
    id: 'irada-lancement-kebili-janvier-2023',
    title: 'Journée d’information régionale — Kébili',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-18',
    dateLabel: '18 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Kébili',
    format: "Journée d'information",
    image: '/img/photo-recyclage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
  {
    id: 'irada-lancement-tozeur-janvier-2023',
    title: 'Journée d’information régionale — Tozeur',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-17',
    dateLabel: '17 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Tozeur',
    format: "Journée d'information",
    image: '/img/photo-elevage.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
  {
    id: 'irada-lancement-kairouan-janvier-2023',
    title: 'Journée d’information régionale — Kairouan',
    summary:
      'Lancement régional d’Irada4Youth et information des acteurs locaux sur l’appel à propositions.',
    startsAt: '2023-01-10',
    dateLabel: '10 janvier 2023',
    project: 'Irada4Youth',
    projectSlug: 'irada4youth',
    location: 'Kairouan',
    format: "Journée d'information",
    image: '/img/photo-entretien.webp',
    source: 'IRADA4YOUTH — Rapport narratif 2023',
  },
]
