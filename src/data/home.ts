/** Home page content.
 *
 * Layout and short labels follow Accueil.pdf. Editorial wording for hero, streams and
 * supporting bands is taken from `EU4Youth - Homepage fr.docx` and the six project briefs
 * so the page stops shipping Lorem / Titre placeholders while the designed card geometry
 * stays intact.
 */

export interface Kpi {
  value: string
  /** One or two lines, matching the programme IMPACT wording. */
  label: string | readonly [string, string]
  /** Source-requested clickable destination. */
  to: string
  /** Horizontal centre in design px, measured from the comp. */
  cx: number
}

export const HERO = {
  badge: 'LA JEUNESSE TUNISIENNE PORTE LES SOLUTIONS DE DEMAIN.',
  headline: [
    'EU4Youth accompagne',
    'les jeunes dans leurs',
    'parcours, leurs projets',
    'et leur engagement.',
  ],
  /* The comp sets this in three lines between the headline and the buttons, and the
     slot is 107.9 design px tall — four lines at most. The docx opens with two more
     sentences about what the programme is and who runs it; they belong to the longer
     introduction the À propos hero carries, and putting them here ran the paragraph
     through the row of buttons underneath. */
  body:
    'Vous avez entre 18 et 35 ans. Vous avez une idée, un projet, une envie de ' +
    'faire quelque chose pour votre quartier, votre commune ou votre ' +
    'gouvernorat. EU4Youth Tunisie vous accompagne.',
  context:
    'EU4Youth est le programme d’appui à la jeunesse tunisienne financé par ' +
    'l’Union européenne et mis en œuvre avec les institutions tunisiennes et ' +
    'les acteurs nationaux et internationaux engagés en faveur des jeunes.',
  invitation: 'Ce programme est pour vous.',
  /* x and w are the comp's own plates. All three are drawn the same way, so there is no
     longer a flag here saying which one is filled. */
  actions: [
    { label: 'Découvrir les projets', to: '/projets', x: 281.1, w: 265.1 },
    { label: 'Voir les opportunités', to: '/opportunites', x: 576.3, w: 347.2 },
    { label: 'Explorer la carte', to: '/carte', x: 960, w: 347.2 },
  ],
} as const

export const CHIFFRES = {
  title: 'EU4YOUTH EN CHIFFRES',
  period: '2019 – 2027',
  source: 'Source : documents programme et projets EU4Youth fournis en août 2026.',
  kpis: [
    { value: '6', label: 'PROJETS', to: '/projets', cx: 200 },
    { value: '+ 300', label: 'CLUBS', to: '/projets', cx: 520 },
    { value: '+ 300', label: 'PROJETS', to: '/projets', cx: 840 },
    { value: '+ 100', label: 'INITIATIVES', to: '/carte', cx: 1160 },
    { value: '24', label: 'GOUVERNORATS', to: '/carte', cx: 1480 },
  ] satisfies Kpi[],
} as const

export const ENTRANCES = {
  title: 'PAR OÙ SOUHAITEZ-VOUS COMMENCER ?',
  body:
    'Que vous soyez un jeune à la recherche d’une opportunité, une association, ' +
    'un partenaire institutionnel ou un chercheur, explorez EU4Youth selon ce ' +
    'qui vous correspond.',
  items: [
    {
      label: 'Territoire',
      description:
        'Trouvez ce qui se passe dans votre gouvernorat et explorez la carte nationale.',
      to: '/carte',
    },
    {
      label: 'Secteur',
      description:
        'Emploi, ESS, culture, sport, sciences et politiques publiques.',
      to: '/projets',
    },
    {
      label: 'Opportunité',
      description:
        'Formations, bourses et appels à projets disponibles ou archivés.',
      to: '/opportunites',
    },
    {
      label: 'Initiative',
      description:
        'Découvrez les fiches financées et accompagnées dans les régions.',
      to: '/carte',
    },
    {
      label: 'Ressource',
      description:
        'Publications, rapports, guides et outils du programme en accès libre.',
      to: '/publications',
    },
    {
      label: 'Projet',
      description:
        'Comprenez les six projets et trouvez celui qui correspond à vos besoins.',
      to: '/projets',
    },
  ],
} as const

export const SIX_PROJETS = {
  title: 'SIX PROJETS',
  subtitle: 'UNE VISION COMMUNE.',
  body:
    'EU4Youth Tunisie s’organise en trois composantes thématiques portées par ' +
    'six projets complémentaires. Chaque projet intervient sur une dimension ' +
    'spécifique de l’inclusion des jeunes tunisiennes et tunisiens. Ensemble, ' +
    'ils couvrent l’intégralité du parcours : de l’emploi et de ' +
    'l’entrepreneuriat à la participation citoyenne, en passant par la ' +
    'culture, le sport et les sciences.',
} as const

export const MAP_BAND = {
  title: 'EU4YOUTH',
  subtitle: 'PARTOUT EN TUNISIE',
  paragraphs: [
    'De Bizerte à Ben Guerdane, de Jendouba à Tataouine, EU4Youth accompagne ' +
      'les jeunes Tunisiennes et Tunisiens dans les 24 gouvernorats de la Tunisie.',
    'Découvrez les initiatives, les projets et les histoires qui prennent vie ' +
      'près de chez vous.',
  ],
  action: { label: 'Explorer la carte', to: '/carte' },
} as const

export interface StreamCard {
  title: string
  /** Orange/teal sub-label: badge type on opportunities, project elsewhere. */
  meta: string
  body: string
  date: string
  location?: string
  action?: string
  /** Route for the card action. Falls back to the stream listing when omitted. */
  to?: string
  /** Project whose mark the comp prints at the head of an opportunity card, where the
   *  sub-label carries the kind of call rather than the project's name. Slug of one of
   *  the six logos in public/img. */
  logo?: string
  /** The comp sets the same photograph on all six cards, so all six carry it — from
   *  the design pack's own file rather than the flattened one. Per-card pictures
   *  belong here once there is real content to attach them to. */
  thumb: string
}

export interface Stream {
  /** Two-line heading exactly as broken in the comp. */
  heading: [string, string]
  /** Per-line colours; the comp colours the two lines differently in col 1. */
  headingColors: [string, string]
  accent: string
  /** Column wrapper, heading, card and CTA x positions in design px. */
  x: { wrap: number; heading: number; card: number; cta: number; ctaText: number }
  variant: 'opportunity' | 'news' | 'event'
  cta: string[]
  /** How far above the plate's centre the comp sets this column's CTA label,
   *  in design px. The comp is not consistent between the three, so each is
   *  measured rather than derived. */
  ctaLift: number
  /** Destination of the column's "voir tout" plate. */
  to: string
  cards: StreamCard[]
}

export const STREAMS: Stream[] = [
  {
    heading: ['OPPORTUNITÉS', 'EN COURS'],
    /* Accueil.pdf: first line pink, second line EU blue (CTA stays pink). */
    headingColors: ['var(--pink)', 'var(--eu-blue)'],
    accent: 'var(--pink)',
    x: { wrap: 212, heading: 597, card: 597, cta: 625, ctaText: 157 },
    variant: 'opportunity',
    cta: ['Voir toutes les opportunités'],
    ctaLift: 4,
    to: '/opportunites',
    cards: [
      {
        title: 'Irada4Youth — 2e appel à propositions',
        meta: 'Appel à projets · Clôturé',
        body:
          'Financement de projets créateurs d’emplois dans six gouvernorats ' +
          'prioritaires, avec le CGDR.',
        date: '24 JUIL 2026',
        location: 'Zaghouan · Mahdia · Le Kef · Kairouan · Kébili · Tozeur',
        action: "Voir l’appel",
        to: '/opportunites/irada-2e-appel-a-propositions-2026',
        logo: 'irada4youth',
        thumb: '/img/photo-entretien.webp',
      },
    ],
  },
  {
    heading: ['DERNIÈRES', 'ACTUALITÉS'],
    headingColors: ['var(--orange)', 'var(--orange)'],
    accent: 'var(--orange)',
    x: { wrap: 652.6, heading: 698.6, card: 698.3, cta: 699.4, ctaText: 30.2 },
    variant: 'news',
    cta: ['Voir toutes les actualités'],
    ctaLift: 7,
    to: '/actualites',
    cards: [
      {
        title: 'Avancées majeures dans la transformation digitale de l’ANETI',
        meta: 'Go4Youth',
        body:
          'Refonte du SI en cours, GEC/GED généralisé et 102 sites raccordés ' +
          'à la fibre optique.',
        date: 'AVRIL 2026',
        action: 'Lire l’article',
        to: '/actualites/go4youth-avancees-transformation-digitale-aneti-avril-2026',
        thumb: '/img/photo-celebration.webp',
      },
    ],
  },
  {
    heading: ['PROCHAINS', 'ÉVÉNEMENTS'],
    headingColors: ['var(--teal)', 'var(--teal)'],
    accent: 'var(--teal)',
    x: { wrap: 1278.9, heading: 1321.9, card: 1321.9, cta: 1322.7, ctaText: 15.7 },
    variant: 'event',
    cta: ['Voir l’agenda complet'],
    ctaLift: 5,
    to: '/agenda',
    cards: [
      {
        title: '48 chefs de BETIs réunis pour préparer la généralisation',
        meta: 'Go4Youth',
        body:
          'Deux journées d’ateliers réunissant les BETIs pilotes et ceux de la ' +
          'première phase de généralisation.',
        date: '4–5 DÉC 2024',
        location: 'Tunis',
        action: 'Voir les archives',
        to: '/actualites/go4youth-48-chefs-beti-tunis-decembre-2024',
        thumb: '/img/art-graffiti.webp',
      },
    ],
  },
]

export const STORIES = {
  eyebrow: 'YOUTH PORTRAITS',
  headline: ['DES JEUNES QUI AGISSENT.', 'DES TERRITOIRES QUI CHANGENT.'],
  action: { label: 'Découvrir toutes les stories', to: '/stories' },
} as const

export const PUBLICATIONS = {
  title: ['RESSOURCES ET', 'PUBLICATIONS'],
  body:
    'EU4Youth produit des connaissances et les met à disposition de tous. ' +
    'Rapports de suivi, études sectorielles, guides pratiques, notes de ' +
    'politique publique, outils méthodologiques : téléchargez librement les ' +
    'documents du programme.',
  action: { label: 'Accéder à toutes les publications', to: '/publications' },
} as const

export const NEWSLETTER = {
  title: 'RESTEZ INFORMÉ.ES',
  body:
    'Inscrivez-vous à la newsletter du programme et recevez en avant-première ' +
    'les appels à projets, formations, bourses et événements ouverts aux ' +
    'jeunes tunisiennes et tunisiens.',
  placeholder: 'Votre adresse e-mail',
  submit: 'Je m’inscris',
  legal:
    'En vous inscrivant, vous acceptez de recevoir des communications du ' +
    'programme EU4Youth Tunisie. Vous pouvez vous désinscrire à tout moment. ' +
    'Vos données ne seront pas partagées avec des tiers.',
} as const
