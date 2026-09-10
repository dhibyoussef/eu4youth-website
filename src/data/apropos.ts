import { PROJECTS } from './projects'
import { MAP_SHAPES } from './tunisia'

/**
 * À propos EU4Youth — content, transcribed from `a propos.pdf`.
 *
 * The comp is one 13,979px page, but unlike the homepage it cannot be reproduced by
 * placing everything at its measured coordinate. Three of its bands are accordions,
 * two paragraphs expand behind a "Lire la suite", and the partner block is tabbed —
 * every one of those changes the height of what follows it, so a fixed y for the band
 * below would be wrong the moment a reader opens anything. The page is therefore built
 * as a vertical flow and the comp's numbers are used for type, colour and spacing.
 *
 * The PDF's later pages are not more page: they are states of this one. Page 2 is a
 * project card opened from the six logos, page 3 is "Une vision commune" expanded, and
 * page 4 is a chart revealed from one of the impact figures. They are read as the
 * open state of a control here, not as extra content.
 */

export interface Accordion {
  /**
   * Small line above the title: "AXE 2", or a pair.
   *
   * A pair is set in two sizes, the way the comp sets the objectifs rows: "OBJECTIF" at 36 and
   * "SPÉCIFIQUE 1" at 38 beside it. Two sizes two apart is not something anyone would notice as
   * a size, but it is enough to read as two weights, and set in one size the line loses the
   * distinction the comp draws between the category and which one this is. The AXE kickers on
   * the comment band are a single span, so they stay a single string.
   */
  kicker?: string | [string, string]
  /**
   * A pair here is the same two-weight setting as in `kicker`, at one size: the comp's general
   * objective reads "OBJECTIF GÉNÉRAL" with the category word in Changa 500 and the qualifier in
   * 700, both at 60. The PDF reports it as one Changa-Regular run, so only the advance gives it
   * away — 480.0 across, where one weight throughout gives 478.9 at 600 or 483.7 at 700, and
   * 500 + 700 gives 479.1.
   */
  title: string | [string, string]
  body: string[]
  /**
   * True where the comp draws the row closed and so never shows its wording.
   *
   * A control that opens onto nothing is worse than no control, and the comp clearly
   * intends all of these to open — it prints a chevron on every one. So these carry a
   * summary written from the programme's own vocabulary elsewhere on the page rather
   * than being left empty, and this flag marks them for replacement with the real copy.
   */
  provisional?: boolean
  icon?: string
}

export const HERO = {
  badge: "Programme d'appui à la jeunesse tunisienne",
  title: [
    'EU4Youth accompagne les jeunes Tunisiennes et Tunisiens',
    'dans leurs parcours, leurs projets',
    'et leur engagement.',
  ],
  body: [
    "EU4Youth est le principal programme de l'Union européenne d’appui à la jeunesse tunisienne. " +
      "Depuis 2019, il réunit six projets complémentaires qui agissent ensemble pour " +
      "renforcer les opportunités d'emploi, d'entrepreneuriat, de culture, de sport, de " +
      'science et de participation citoyenne des jeunes de 18 à 35 ans, dans toutes les ' +
      'régions du pays.',
    "EU4Youth s'inscrit dans une dynamique de coopération entre l'Union européenne, les " +
      "institutions tunisiennes et les acteurs des territoires pour que chaque jeune, où " +
      "qu'il se trouve, puisse accéder aux ressources, aux soutiens et aux opportunités.",
  ],
}

export const POURQUOI = {
  title: ['POURQUOI', 'EU4YOUTH ?'],
  body: [
    'La Tunisie est un pays jeune. Les moins de 35 ans représentent plus de la moitié de ' +
      'la population. Cette réalité démographique porte en elle une énergie créatrice, ' +
      "une force d'innovation et un désir de contribution que les communautés et le pays " +
      'tout entier ont intérêt à valoriser.',
    'Les jeunes Tunisiennes et Tunisiens expriment des aspirations fortes en matière ' +
      "d'emploi, de participation, de mobilité, de culture et d'engagement. Leurs " +
      'initiatives, leurs projets, leurs idées circulent dans les quartiers, les ' +
      'universités, les associations et les communes. Ils représentent une ressource ' +
      'essentielle pour le développement économique, social et territorial.',
    "Pourtant, tous n'ont pas accès aux mêmes possibilités. Les territoires connaissent " +
      "des dynamiques diverses : là où une région dispose d'un bassin d'emploi dense et " +
      "d'infrastructures accessibles, une région peut présenter un éloignement des centres " +
      "de formation, un accès limité aux marchés ou d'une moindre présence d'espaces " +
      'culturels et sportifs. Ces disparités sont réelles et se vivent différemment selon ' +
      "que l'on grandit à Tunis ou à Kébili, à Sfax ou à Jendouba.",
    'Sur le marché du travail, les transitions entre la formation et ' +
      "l'emploi restent un défi pour de nombreux jeunes, en particulier pour celles et " +
      'ceux qui portent plusieurs facteurs de vulnérabilité cumulés : chômage, précarité, ' +
      'distance géographique, écart entre compétences et besoins des employeurs. Les ' +
      'jeunes femmes, les habitants des zones rurales, les porteurs de handicap font face ' +
      'à des obstacles spécifiques qui demandent des réponses adaptées.',
    'En matière de culture, de sport et de participation civique, les opportunités ' +
      'existent; les maisons de la culture, les clubs sportifs, les associations, les ' +
      "structures communales sont autant de lieux d'apprentissage, de rencontre et " +
      "d'expression. Mais ces espaces ont besoin d'être renforcés, accessibles à tous, en " +
      'lien avec les communes et les acteurs de terrain.',
    "C'est dans cette réalité complexe, vivante et riche de potentiels que s'inscrit " +
      'EU4Youth comme un investissement dans les capacités de toute une jeunesse et dans ' +
      'les territoires qui la portent.',
  ],
  /** Continuation paragraphs (legacy). Prefer putting the full copy in `body`. */
  more: [] as string[],
  quote:
    "« EU4Youth s'inscrit dans une dynamique de coopération entre l'Union européenne, " +
    'les institutions tunisiennes et les acteurs locaux afin de soutenir les parcours, ' +
    "les initiatives et l'engagement des jeunes. »",
  /** The comp shows one photograph with carousel controls, so it is a set of them. */
  photos: [
    { src: '/img/apropos-atelier.webp', alt: 'Objets gravés au laser réalisés par un jeune atelier tunisien' },
    { src: '/img/apropos-plongee.webp', alt: 'Jeune plongeur sous la surface au large des côtes tunisiennes' },
  ],
}

export const VISION = {
  title: ['UNE VISION', 'COMMUNE'],
  lead: "EU4Youth part d'une conviction fondamentale : les jeunes Tunisiennes et\u00A0Tunisiens sont des acteurs à\u00A0part entière du changement.",
  body: [
    "Le programme se construit sur une logique d'investissement dans les capacités, dans les opportunités et dans les conditions d'autonomisation et\u00A0d'intégration socioéconomique dans tous les territoires du\u00A0pays.",
    "Cette vision se décline en sept principes transversaux qui guident l'ensemble des projets :",
  ],
  /** Revealed by "Lire la suite" — page 3 of the comp is this band, opened. */
  principles: [
    'Créer des opportunités réelles de développement personnel et professionnel pour les ' +
      'jeunes, là où ils vivent.',
    'Prioriser celles et ceux qui font face aux obstacles les plus importants : ' +
      'éloignement géographique, précarité, chômage, discrimination.',
    'Associer les jeunes à la conception et à la mise en oeuvre des activités qui les ' +
      'concernent pas seulement comme bénéficiaires, mais comme acteurs.',
    'Ancrer les interventions dans les territoires, au niveau des communes, des ' +
      'gouvernorats et des écosystèmes locaux.',
    'Construire des mécanismes durables de représentation et de participation des jeunes ' +
      "dans la vie citoyenne et l'action publique.",
    'Capitaliser sur les expériences passées et les dynamiques déjà engagées, pour ' +
      'construire sur ce qui fonctionne.',
    'Coordonner les six projets entre eux et avec les autres programmes européens en ' +
      'Tunisie pour produire un impact cohérent et démultiplié.',
  ],
  closing: [
    "À ces principes s'ajoutent des engagements transversaux partagés par tous les " +
      'projets : intégration systématique de la dimension genre, attention aux besoins ' +
      'spécifiques des jeunes femmes, des jeunes porteurs de handicap et des jeunes des ' +
      'zones rurales ou enclavées ainsi que la dimension environnement et durabilité.',
    'EU4Youth accompagne les aspirations des jeunes Tunisiennes et Tunisiens en ' +
      'renforçant les opportunités, les partenariats et les initiatives qui contribuent ' +
      'au développement des territoires.',
  ],
}

export const OBJECTIFS: { title: string; items: Accordion[] } = {
  title: 'OBJECTIFS DU PROGRAMME',
  items: [
    {
      title: ['OBJECTIF', 'GÉNÉRAL'],
      body: [
        "Contribuer à l'amélioration de l'inclusion économique, sociale et citoyenne des " +
          'jeunes Tunisiennes et Tunisiens, à travers une approche ancrée dans les ' +
          'territoires et dans les dynamiques locales.',
      ],
    },
    {
      kicker: ['OBJECTIF', 'SPÉCIFIQUE 1'],
      title: 'EMPLOI, EMPLOYABILITÉ ET ENTREPRENEURIAT',
      body: [
        "Renforcer l'accès des jeunes à des emplois décents, développer leurs compétences " +
          'et leurs capacités entrepreneuriales, soutenir les filières économiques ' +
          'porteuses dans les régions ciblées.',
        "Cela passe par le soutien à l'économie sociale et solidaire, la modernisation des " +
          "services publics d'intermédiation sur le marché du travail, l'appui à la " +
          'recherche et à la créativité des jeunes chercheurs, et le financement de ' +
          'projets économiques dans des filières identifiées localement.',
      ],
    },
    {
      kicker: ['OBJECTIF', 'SPÉCIFIQUE 2'],
      title: "CULTURE ET SPORT POUR L'INCLUSION",
      body: [
        "Renforcer l'inclusion et la participation des jeunes à travers l'accès à la " +
          'culture et au sport, en renforçant les capacités des opérateurs culturels et ' +
          'sportifs, en améliorant les espaces de pratique et en développant ' +
          "l'employabilité dans ces secteurs.",
        "La culture et le sport ne sont pas des accessoires dans la vie d'un jeune; ils " +
          "en sont des conditions fondamentales d'épanouissement, de confiance en soi et " +
          "d'appartenance sociale.",
      ],
    },
    {
      kicker: ['OBJECTIF', 'SPÉCIFIQUE 3'],
      title: 'POLITIQUES PUBLIQUES ET PARTICIPATION DES JEUNES',
      body: [
        'Renforcer la place des jeunes dans la conception et la mise en œuvre des ' +
          'politiques publiques, au niveau local comme au niveau national.',
        'Les politiques en faveur de la jeunesse ne peuvent être efficaces que si les ' +
          'jeunes eux-mêmes y participent. EU4Youth travaille avec les communes ' +
          'tunisiennes et le Ministère de la Jeunesse et des Sports pour créer des ' +
          'espaces réels de consultation, de représentation et de participation.',
      ],
    },
  ],
}

/**
 * The three axes.
 *
 * Not an accordion. The comp draws three square tabs at the top right of one orange
 * card, the selected one filled orange with white lettering and the other two white
 * with orange lettering, and only the selected axis is on the page at all. So this is a
 * tab set with a single panel, and building it as stacked rows was wrong.
 */
export const COMMENT: { title: [string, string]; lead: string; items: Accordion[] } = {
  /* Comp breaks after COMMENT — "COMMENT LE" on one line is what a wrap at the column's
     natural width does, and it is not what the sheet prints. */
  title: ['COMMENT', 'LE PROGRAMME AGIT'],
  lead:
    "EU4Youth n'agit pas en silo. Il couvre trois grands axes d'intervention complémentaires, " +
    'pensés pour se renforcer mutuellement et produire un impact qui dépasse la somme de ses parties.',
  items: [
    {
      kicker: 'AXE 1',
      icon: '/img/icon-axe-1.webp',
      title: 'EMPLOI ET OPPORTUNITÉS ÉCONOMIQUES',
      body: [
        "Le programme renforce l'accès des jeunes aux opportunités économiques, qu'il " +
          "s'agisse de création d'entreprises, d'accès à l'emploi salarié ou de " +
          'développement de projets dans des filières porteuses. Il agit sur plusieurs ' +
          "leviers complémentaires : le soutien à l'entrepreneuriat social et collectif, " +
          "la modernisation des services d'orientation et d'intermédiation sur le marché " +
          'du travail, la promotion de la recherche et de la créativité comme chemins ' +
          "vers l'emploi, et le financement de projets économiques ancrés dans les " +
          'territoires.',
      ],
    },
    {
      kicker: 'AXE 2',
      icon: '/img/icon-axe-2.webp',
      title: 'CULTURE, SPORT ET PARTICIPATION',
      body: [
        'EU4Youth considère la culture et le sport comme des leviers ' +
          "d'inclusion à part entière. Le programme renforce les opérateurs culturels et " +
          "sportifs, améliore l'accès des jeunes en situation de vulnérabilité aux " +
          "pratiques créatives et sportives, et développe l'employabilité dans ces " +
          "secteurs. En parallèle, il crée les conditions d'une participation citoyenne " +
          'authentique des jeunes — au niveau de leurs communes, de leurs associations, ' +
          'et des politiques publiques qui les concernent.',
      ],
    },
    {
      kicker: 'AXE 3',
      icon: '/img/icon-axe-3.webp',
      title: 'INNOVATION, RECHERCHE ET DÉVELOPPEMENT TERRITORIAL',
      body: [
        'Le programme investit dans la recherche et ' +
          "l'innovation comme ressources pour l'emploi des jeunes chercheurs et pour le " +
          "développement de la société. Il appuie également une logique de développement " +
          "territorial fondée sur l'émergence d'écosystèmes locaux dynamiques — des " +
          'réseaux d\'acteurs qui se connaissent, coopèrent et créent ensemble des ' +
          'opportunités pour les jeunes de leurs régions. Cette logique territoriale est ' +
          "au coeur de la conception d'EU4Youth, de sa sélection des zones d'intervention " +
          'à ses modalités de mise en oeuvre.',
      ],
    },
  ],
}

export const SIX_PROJETS = {
  title: 'SIX PROJETS,',
  subtitle: 'UNE VISION COMMUNE',
  body:
    "EU4Youth s'organise en trois composantes thématiques portées par six projets " +
    'complémentaires. Chaque projet intervient sur une dimension spécifique de ' +
    "l'inclusion des jeunes Tunisiennes et Tunisiens. Ensemble, ils couvrent " +
    "l'intégralité du parcours : de l'emploi et de l'entrepreneuriat à la participation " +
    'citoyenne, en passant par la culture, le sport et les sciences.',
}

export const TERRITOIRES = {
  title: 'UNE ACTION DANS LES TERRITOIRES',
  body: [
    'De Bizerte à Ben Guerdane, de Jendouba à Tataouine, EU4Youth accompagne les jeunes ' +
      'Tunisiennes et Tunisiens dans les 24 gouvernorats de la Tunisie.',
    "L'une des caractéristiques les plus distinctives du programme est son attachement à " +
      "une logique territoriale. EU4Youth ne se contente pas d'agir sur des politiques " +
      'nationales : il cherche à comprendre et à transformer les dynamiques locales, en ' +
      'mobilisant les acteurs présents sur chaque territoire — communes, délégations ' +
      'régionales, offices de développement régional, associations locales, clubs ' +
      'sportifs.',
    "La sélection des zones d'intervention prioritaires prend en compte les indices de " +
      "développement régional, les taux de chômage et d'émigration, et le degré de " +
      'vulnérabilité des populations jeunes. Le programme accorde une attention ' +
      "particulière aux gouvernorats de l'intérieur, du centre-ouest et du sud, où les " +
      "besoins sont les plus importants et où l'impact peut être le plus transformateur.",
    "Mais EU4Youth agit aussi à l'échelle nationale, avec des projets qui touchent " +
      "l'ensemble du territoire et des mécanismes qui renforcent les institutions au " +
      'niveau central.',
    "Au-delà des institutions formelles, EU4Youth cherche à stimuler l'émergence " +
      "d'écosystèmes locaux dynamiques : des réseaux d'acteurs qui se connaissent, " +
      'coopèrent et créent ensemble des opportunités pour les jeunes. Ces écosystèmes, ' +
      'une fois constitués, ont la capacité de produire des résultats durables bien ' +
      'au-delà de la fin du financement européen.',
  ],
  legend: {
    title: 'LES GOUVERNORATS CIBLÉS EN PRIORITÉ',
    note:
      "PLUSIEURS PROJETS CIBLENT DES GOUVERNORATS SPÉCIFIQUES, CHOISIS SUR LA BASE " +
      "D'INDICATEURS DE VULNÉRABILITÉ ET D'OPPORTUNITÉS LOCALES :",
  },
}

/**
 * One project's footprint on the map.
 *
 * The comp's own words for this band — "plusieurs projets ciblent des gouvernorats
 * spécifiques" — are a specification: picking a project changes which gouvernorats are
 * lit and which names appear on them. So the map ships as a grey base with a per-project
 * overlay rather than as one picture with a single project's regions burnt into it.
 *
 * `x` and `y` centre each label inside the map box, as percentages of it. They are the midpoints
 * of the comp's own text spans measured against the tight bounds of the governorate paths —
 * x 1345 to 1765, y 7380 to 8267 on page 1 — with the vertical taken a third of the size above
 * the baseline so the percentage names the middle of the lettering rather than its foot.
 */
export interface Footprint {
  slug: string
  name: string
  /** Short territory summary for the readout under the map, e.g. `7 gouvernorats`. */
  count: string
  /** Lights the whole country instead of naming shapes, for the three national projects. */
  national: boolean
  /** Governorate names, each matching a shape in MAP_SHAPES. */
  governorates: string[]
}

/**
 * The card that opens from a project's mark.
 *
 * Measured off comp page 2, which is page 1 with this card open over the six logos: a
 * near-white sheet 1576 x 873, the name in pink at 115, the pitch in orange, a pink
 * speech bubble at the top right, five labelled fields each with its own drawn mark, and
 * a pink pill through to the project's own page.
 */
export interface Projet {
  slug: string
  name: string
  tagline: string
  quote: string
  summary: string
  theme: string
  fields: { icon: string; label: string; value: string[] }[]
}

/** Every logo opens a complete live fiche. The source of truth is projects.ts, itself compiled
 * from the six project briefs; keeping a second hand-written Jeun'ESS-only copy here was why
 * five logos opened “reste à renseigner” even though their source documents exist. */
export const PROJETS: Record<string, Projet> = Object.fromEntries(
  PROJECTS.map((project) => {
    const fields: Projet['fields'] = [
      {
        icon: 'composante',
        label: 'COMPOSANTE',
        value: [project.composante.toUpperCase()],
      },
      { icon: 'partenaire', label: 'PARTENAIRE', value: [project.partner.toUpperCase()] },
      { icon: 'territoire', label: 'TERRITOIRE', value: [project.territory.toUpperCase()] },
      { icon: 'periode', label: 'PÉRIODE', value: [project.period.toUpperCase()] },
    ]
    return [
      project.slug,
      {
        slug: project.slug,
        name: project.acronym.toUpperCase(),
        tagline: project.tagline.toUpperCase(),
        quote: project.quote ?? project.tagline,
        summary: project.ficheSummary ?? '',
        theme: project.theme,
        fields,
      },
    ]
  }),
)

/** Bar heights and colours measured off comp page 4 (`a propos.pdf`). The comp
 *  illustrates five of sixteen activity families; the axis runs 0–20 in steps of two. */
export interface SecteurBar {
  label: string
  value: number
  color: string
}

export const SECTEURS = {
  title: "SECTEURS D'ACTIVITÉS",
  max: 20,
  bars: [
    { label: '1/16', value: 12.6, color: '#58ac48' },
    { label: '2/16', value: 9.2, color: '#1a9a94' },
    { label: '3/16', value: 17.8, color: '#074ea2' },
    { label: '4/16', value: 14.1, color: '#e34171' },
    { label: '5/16', value: 20, color: '#f2a849' },
  ] satisfies SecteurBar[],
  /** Coloured squares beside the axis ticks, as the comp draws them. */
  ticks: {
    20: '#58ac48',
    18: '#074ea2',
    16: '#1a9a94',
    14: '#e34171',
    12: '#f2a849',
  } as Record<number, string>,
}

const projectFootprint = (slug: string, forceNational?: boolean): Footprint => {
  const project = PROJECTS.find((item) => item.slug === slug)
  if (!project) throw new Error(`Unknown project footprint: ${slug}`)

  const governorates = project.governorates.filter((name) => name !== 'Présence nationale')
  const unknown = governorates.filter(
    (name) => !MAP_SHAPES.some((shape) => shape.name === name),
  )
  /* A governorate the map cannot draw would otherwise vanish from it in silence, which is how
     the old bitmap map came to disagree with the sources it was supposed to illustrate. */
  if (unknown.length) {
    throw new Error(`${slug}: no map shape for ${unknown.join(', ')}`)
  }

  return {
    slug,
    name: project.acronym,
    /* Prefer a short count for the map readout; named lists stay on the fiche. */
    count:
      governorates.length > 0
        ? `${governorates.length} gouvernorat${governorates.length > 1 ? 's' : ''}`
        : project.territory.split(/[—:]/)[0].trim().toLowerCase(),
    national:
      forceNational ??
      (project.governorates.includes('Présence nationale') ||
        project.territory.toLowerCase().includes('nationale')),
    governorates,
  }
}

/** Same order as the six-logo band and footer. Every project's regions come from projects.ts,
 * so choosing one changes which shapes are lit rather than which names float over a fixed
 * picture of Jeun'ESS's. */
export const FOOTPRINTS: Footprint[] = [
  projectFootprint('irada4youth'),
  projectFootprint('swafy', true),
  projectFootprint('jeuness'),
  projectFootprint('fe3ila', true),
  projectFootprint('maghroumin', true),
  projectFootprint('go4youth', true),
]

/** Territory map card — comp puts Jeun'ESS second in the strip, not third. */
export const MAP_PICKS: Footprint[] = [
  projectFootprint('irada4youth'),
  projectFootprint('jeuness'),
  projectFootprint('swafy', true),
  projectFootprint('fe3ila', true),
  projectFootprint('maghroumin', true),
  projectFootprint('go4youth', true),
]

export interface Kpi {
  value: string
  label: string[]
  note?: string[]
  /** The comp fills one figure per row in orange; the rest sit on the blue. */
  featured?: boolean
}

export const IMPACT: {
  title: string
  body: string
  rows: Kpi[][]
  pendingNote: string
  pending: Kpi[]
} = {
  title: "L'IMPACT DU PROGRAMME",
  body:
    "Depuis 2019, EU4Youth a mobilisé des centaines d'acteurs, dans toutes les régions de " +
    "Tunisie, autour d'une vision commune. Voici quelques données qui témoignent de " +
    "l'ampleur et de la profondeur de cette action.",
  rows: [
    [
      { value: '6', label: ['PROJETS', 'COMPLÉMENTAIRES'], note: ['3 composantes thématiques'] },
      { value: '24', label: ['GOUVERNORATS'], note: ['Présence nationale'] },
      {
        value: '2019–2027',
        label: ['DURÉE DU', 'PROGRAMME'],
        note: ['Convention signée juin 2019'],
      },
    ],
    [
      { value: '+ 100', label: ['INITIATIVES', 'ASSOCIATIVES'], note: ['Soutenues dans toutes les régions'] },
      {
        value: '+ 300',
        label: ['PROJETS PORTÉS', 'PAR DES JEUNES'],
        note: ['Économiques, culturels, sociaux, scientifiques'],
        featured: true,
      },
      { value: '+ 300', label: ['CLUBS CRÉÉS', 'OU APPUYÉS'], note: ['ESS, scientifiques, culturels, sportifs'] },
    ],
  ],
  pendingNote: '',
  pending: [],
}

/** A logo on the partners plate, at the place and size the comp draws it.
 *
 * Coordinates are design px inside the plate's own 1913.2 x 986.9 box, taken from the placed
 * image rects in the PDF (tools/imgs.py "a propos" 1 10662 11649, less the plate's origin at
 * x 3.4 / y 10662). The comp does not lay these out on a grid: the two rows hold five and four
 * marks at nine different sizes and nine different gaps, chosen so each reads at the same
 * weight regardless of how much air its own artwork carries. A grid gets the marks with tight
 * artwork — MESRS, formation-emploi — coming out visibly larger than the round crests beside
 * them, which is what "the logos look wrong" was. */
export interface PartnerLogo {
  src: string
  alt: string
  x: number
  y: number
  w: number
  h: number
}

export interface PartnerTab {
  /** Two lines, as the comp breaks them. */
  title: [string, string]
  body: string
  logos: PartnerLogo[]
  /** Optional implementers table (Section 9 — partenaires de mise en oeuvre). */
  roles?: { org: string; role: string; logo?: string }[]
}

export const PARTENAIRES: { title: string; body: string; tabs: PartnerTab[] } = {
  title: 'LES PARTENAIRES',
  body:
    "EU4Youth Tunisie mobilise un réseau unique de partenaires institutionnels, " +
    "d'organisations internationales et d'acteurs de terrain. Ce partenariat " +
    'multidimensionnel est la condition de la réussite et de la durabilité du programme.',
  tabs: [
    {
      title: ["L'UNION", 'EUROPÉENNE'],
      body:
        "EU4Youth Tunisie est financé par l'Union européenne. La Délégation de l'Union " +
        "européenne en Tunisie assure la supervision stratégique de l'ensemble des six " +
        'projets, veille à la cohérence du programme et constitue l’interlocuteur ' +
        'institutionnel de référence auprès des autorités tunisiennes. Ce programme ' +
        "s'inscrit dans le cadre du Partenariat UE-Tunisie pour la Jeunesse, annoncé " +
        "conjointement en décembre 2016, et traduit l'engagement de l'Union européenne à " +
        'placer la jeunesse au cœur de sa relation de coopération avec la Tunisie.',
      logos: [
        {
          src: '/img/flag-tunisie.png',
          alt: 'République Tunisienne',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/flag-ue.png',
          alt: 'Union européenne',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
      ],
    },
    {
      title: ['LES INSTITUTIONS', 'TUNISIENNES'],
      body:
        'Les ministères et institutions tunisiennes sont des partenaires centraux du ' +
        'programme. Ils président les cadres de concertation, accompagnent la mise en ' +
        'oeuvre et portent l’appropriation institutionnelle des acquis. Leur engagement ' +
        'est le gage de la durabilité des résultats produits.',
      /* Comp order: five on top, four on bottom. Client: ANETI ↔ MESRS swapped. */
      logos: [
        {
          src: '/img/org-economie-planification.webp',
          alt: "Ministère de l'Économie et de la Planification",
          x: 0,
          y: 0,
          w: 560,
          h: 556,
        },
        {
          src: '/img/org-affaires-culturelles.webp',
          alt: 'Ministère des Affaires Culturelles',
          x: 0,
          y: 0,
          w: 560,
          h: 283,
        },
        {
          src: '/img/org-jeunesse-sports.webp',
          alt: 'Ministère de la Jeunesse et des Sports',
          x: 0,
          y: 0,
          w: 398,
          h: 571,
        },
        {
          src: '/img/org-mesrs.webp',
          alt: "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique",
          x: 0,
          y: 0,
          w: 560,
          h: 205,
        },
        {
          src: '/img/org-formation-emploi.webp',
          alt: "Ministère de la Formation Professionnelle et de l'Emploi",
          x: 0,
          y: 0,
          w: 560,
          h: 314,
        },
        {
          src: '/img/org-cgdr.webp',
          alt: 'Commissariat Général au Développement Régional',
          x: 0,
          y: 0,
          w: 560,
          h: 453,
        },
        {
          src: '/img/org-observatoire-jeunesse.webp',
          alt: 'Observatoire National de la Jeunesse',
          x: 0,
          y: 0,
          w: 560,
          h: 97,
        },
        {
          src: '/img/org-aneti.webp',
          alt: "Agence Nationale pour l'Emploi et le Travail Indépendant",
          x: 0,
          y: 0,
          w: 560,
          h: 413,
        },
        {
          src: '/img/org-anpr.webp',
          alt: 'Agence Nationale de la Promotion de la Recherche scientifique',
          x: 0,
          y: 0,
          w: 560,
          h: 308,
        },
      ],
    },
    {
      title: ['LES PARTENAIRES', 'DE MISE EN OEUVRE'],
      body:
        'Les organisations internationales partenaires assurent la mise en œuvre des six ' +
        'projets. Leur expertise sectorielle et leur expérience dans la coopération ' +
        'internationale garantissent la qualité des interventions.',
      logos: [
        {
          src: '/img/org-oit.webp',
          alt: 'Bureau International du Travail (BIT / OIT)',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/org-banque-mondiale.webp',
          alt: 'Banque mondiale',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/org-aecid.webp',
          alt: 'AECID — Agence Espagnole pour la Coopération Internationale',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/org-fiiapp.webp',
          alt: 'FIIAPP',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/org-british-council.webp',
          alt: 'British Council',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
        {
          src: '/img/org-cilg-vng.webp',
          alt: 'CILG-VNG International',
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
      ],
      roles: [
        {
          org: 'Bureau International du Travail (BIT / OIT)',
          role: "Mise en oeuvre de Jeun'ESS — économie sociale et solidaire",
          logo: '/img/org-oit.webp',
        },
        {
          org: 'Banque mondiale',
          role: 'Mise en oeuvre de Go4Youth — modernisation des services d’emploi',
          logo: '/img/org-banque-mondiale.webp',
        },
        {
          org: 'AECID — Agence Espagnole pour la Coopération Internationale',
          role: "Co-mise en oeuvre de Maghroum'IN — culture et sport",
          logo: '/img/org-aecid.webp',
        },
        {
          org: 'FIIAPP — Fondation Internationale et Ibéro-Américaine pour l’Administration et les Politiques Publiques',
          role: "Co-mise en oeuvre de Maghroum'IN",
          logo: '/img/org-fiiapp.webp',
        },
        {
          org: 'British Council (Royaume-Uni)',
          role: "Co-mise en oeuvre de Maghroum'IN — maillage culturel",
          logo: '/img/org-british-council.webp',
        },
        {
          org: 'CILG-VNG International (Pays-Bas)',
          role: 'Mise en oeuvre de Fe3il.a — gouvernance locale et jeunesse',
          logo: '/img/org-cilg-vng.webp',
        },
      ],
    },
  ],
}

/** Directional signpost on the avenir band — real text, not a flat image. */
export type SignpostArm = {
  side: 'left' | 'right'
  tone: 'blue' | 'orange' | 'magenta' | 'teal' | 'green'
  ar: string
  la: string
}

export const AVENIR_SIGNPOST: SignpostArm[] = [
  { side: 'left', tone: 'blue', ar: 'عين دراهم', la: 'Ayn Darahim' },
  { side: 'right', tone: 'orange', ar: 'بنزرت', la: 'Bizerte' },
  { side: 'left', tone: 'magenta', ar: 'جندوبة', la: 'Jendouba' },
  { side: 'right', tone: 'teal', ar: 'نابل', la: 'Nabeul' },
  { side: 'left', tone: 'orange', ar: 'بن قردان', la: 'Ben Gardane' },
  { side: 'right', tone: 'green', ar: 'صفاقس', la: 'Sfax' },
]

export const AVENIR: { title: [string, string]; body: string; items: Accordion[] } = {
  /* Comp breaks after VERS — a single string wraps there only when the column happens to be
     narrow enough, and at some widths it fitted on one line where the sheet prints two. */
  title: ['REGARDER VERS', "L'AVENIR"],
  body:
    "À l'horizon 2027, EU4Youth laisse un héritage qui dépasse la durée du financement. " +
    "Ce qui compte, au-delà des chiffres, c'est la qualité et la durabilité des " +
    'transformations produites avec et pour les jeunes.',
  items: [
    {
      title: 'DES ACQUIS SOLIDES',
      body: [
        'Le programme a construit des bases durables : une architecture de gouvernance ' +
          'interministérielle qui réunit, dans un cadre formel et régulier, les ministères ' +
          "et les partenaires autour des enjeux de la jeunesse. Des capacités renforcées " +
          "dans des dizaines d'organisations, d'institutions, de communes et " +
          "d'associations. Des espaces de participation des jeunes qui peuvent devenir " +
          'permanents dans les communes, dans les comités de pilotage, dans les processus ' +
          'de consultation.',
      ],
    },
    {
      title: 'DES CONNAISSANCES PARTAGÉES',
      body: [
        'EU4Youth a investi dans la production de connaissances utiles. Cartographie des ' +
          'programmes dédiés à la jeunesse en Tunisie, études sur les mécanismes de ' +
          'participation des jeunes, analyses sectorielles sur la culture, le sport et ' +
          "l'emploi, études sur les vulnérabilités spécifiques de certains groupes. Ces " +
          'connaissances sont mises à disposition librement, accessibles à tous les ' +
          'acteurs qui travaillent avec les jeunes.',
      ],
    },
    {
      title: 'DES RÉSEAUX VIVANTS',
      body: [
        'EU4Youth a permis à des acteurs qui ne se connaissaient pas de se rencontrer, de ' +
          'coopérer et de construire ensemble. Les réseaux constitués entre opérateurs ' +
          "culturels et sportifs, entre structures d'appui à l'entrepreneuriat, entre " +
          'communes, entre organisations de la société civile ont une vie propre qui se ' +
          "prolongera au-delà du programme. Le Groupe Jeunesse réunissant les acteurs " +
          "nationaux et internationaux du secteur sous l'égide de l'ONJ en est un exemple.",
      ],
    },
    {
      title: 'DES INITIATIVES QUI CONTINUENT',
      body: [
        "Les entreprises d'économie sociale et solidaire créées avec l'appui de " +
          "Jeun'ESS, les opérateurs de la culture et du sports appuyés par Maghroum’IN " +
          'continueront de produire. Les jeunes chercheurs accompagnés par SWAFY ' +
          'continueront de travailler. Les stratégies jeunesse élaborées dans les ' +
          'communes partenaires de Fe3il.a continueront ' +
          "d'orienter l'action municipale. Les clubs scientifiques, sportifs et " +
          'culturels créés ou renforcés continueront de fonctionner. Les bureaux ANETI ' +
          'modernisés continueront de servir les demandeurs ' +
          "d'emploi. Ces dynamiques ont leur propre élan.",
      ],
    },
    {
      title: 'UNE GÉNÉRATION FORMÉE',
      body: [
        "EU4Youth a contribué à la formation d'une génération de praticiens qui ont " +
          'intégré les approches participatives et multi-acteurs dans leur façon de ' +
          "travailler. Cette transformation des pratiques professionnelles est peut-être " +
          "l'héritage le plus durable du programme.",
      ],
    },
  ],
}
