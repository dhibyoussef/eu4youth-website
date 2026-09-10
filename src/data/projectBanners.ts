import type { ProjectSlug } from './types'

export type BannerPartnerLogo = {
  src: string
  alt: string
  wide?: boolean
  /** Wider than `wide` — Cooperación Española three-part lockup. */
  extraWide?: boolean
  /** Consecutive logos with the same cluster share one cell (SWAFY flags). */
  cluster?: string
  /** Caption under a whole cluster, set on the first logo. */
  clusterCaption?: string[]
  /** Caption lines under the mark (EU / TN flags in the PDF strip). */
  caption?: string[]
}

export type ProjectBannerConfig = {
  /** Implementer / funder marks on the left of the white strip. */
  stripPartners: BannerPartnerLogo[]
  /** Optional caption beside partner logos (SWAFY: EU Delegation). */
  stripLabel?: string
  /** Insert stripLabel after this many partner logos (default: after all). */
  stripLabelAfter?: number
  /** Funding line under the partner logos (GO4Youth). */
  stripFootnote?: string
  /** Hero mark: white lockup on dark fields, colour mark on light/yellow fields. */
  heroMark: 'white' | 'color'
  /** Uppercase title lines in the coloured hero (projet banner.pdf). */
  heroTitleLines?: string[]
  /** Large acronym line under the title — defaults to project.acronym. */
  heroAcronym?: string
}

/** White partner strip + coloured hero — measured from `projet banner.pdf`. */
export const PROJECT_BANNERS: Record<ProjectSlug, ProjectBannerConfig> = {
  jeuness: {
    /* projet banner.pdf p1 — EU, TN, OIT, COOP ESS, EU4Youth | JEUN'ESS mark. */
    stripPartners: [
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        caption: ['Financé par', "l'Union européenne"],
      },
      {
        src: '/img/flag-tn-client-blend.webp',
        alt: 'République Tunisienne',
        caption: ['République Tunisienne'],
      },
      {
        src: '/img/org-oit-lockup.webp',
        alt: 'Organisation internationale du Travail',
        wide: true,
      },
      {
        src: '/img/org-coop-ess.webp',
        alt: 'COOP ESS',
      },
      { src: '/img/logo-eu4youth.png', alt: 'EU4Youth', wide: true },
    ],
    heroMark: 'color',
    heroTitleLines: [
      "PROJET DE PROMOTION DE L'ÉCONOMIE SOCIALE",
      "ET SOLIDAIRE ET DE CRÉATION D'EMPLOIS DÉCENTS",
      'POUR LA JEUNESSE TUNISIENNE',
    ],
    heroAcronym: "JEUN'ESS",
  },
  fe3ila: {
    /* projet banner.pdf p2 — EU, VNG, CILG, NL MFA, EU4Youth, MJS | FE3IL.A mark. */
    stripPartners: [
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        caption: ['Financé par', "l'Union européenne"],
      },
      { src: '/img/org-vng-international.webp', alt: 'VNG International' },
      { src: '/img/org-cilg.webp', alt: 'CILG' },
      {
        src: '/img/org-nl-mfa.webp',
        alt: 'Ministry of Foreign Affairs — Pays-Bas',
        wide: true,
      },
      { src: '/img/logo-eu4youth.png', alt: 'EU4Youth', wide: true },
      {
        src: '/img/org-jeunesse-sports.webp',
        alt: 'Ministère de la Jeunesse et des Sports',
      },
    ],
    heroMark: 'white',
    heroTitleLines: [
      'Politique jeunesse et participation des jeunes',
      'dans les politiques publiques en Tunisie',
    ],
    heroAcronym: 'FE3IL.A',
  },
  swafy: {
    /* projet banner.pdf p3 — EU+TN pair, Délégation under flags, ANPR, EU4Youth | SWAFY mark. */
    stripPartners: [
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        cluster: 'swafy-flags',
        clusterCaption: ["Délégation de l'Union européenne", 'en Tunisie'],
      },
      {
        src: '/img/flag-tn-client-blend.webp',
        alt: 'République Tunisienne',
        cluster: 'swafy-flags',
      },
      {
        src: '/img/org-anpr.webp',
        alt: 'ANPR — Agence Nationale de la Promotion de la Recherche scientifique',
        wide: true,
      },
      { src: '/img/logo-eu4youth.png', alt: 'EU4Youth', wide: true },
    ],
    heroMark: 'white',
    heroTitleLines: ['Science With And For Youth'],
    heroAcronym: 'SWAFY',
  },
  maghroumin: {
    /* projet banner.pdf p4 — EU, MAEUEC+FIIAPP+Cooperación block, British Council, EUNIC, EU4Youth. */
    stripPartners: [
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        caption: ['Financé par', "l'Union européenne"],
      },
      {
        src: '/img/org-cooperacion-espana-block.webp',
        alt: 'Cooperación Española — MAEUEC / FIIAPP',
        extraWide: true,
      },
      {
        src: '/img/org-british-council-lockup.webp',
        alt: 'British Council',
        wide: true,
      },
      {
        src: '/img/org-eunic.webp',
        alt: 'EUNIC — EU National Institutes for Culture',
        wide: true,
      },
      { src: '/img/logo-eu4youth.png', alt: 'EU4Youth', wide: true },
    ],
    heroMark: 'white',
    heroTitleLines: [
      'Participation et inclusion des jeunes tunisien(ne)s',
      'à travers la création, l’accès à la culture et au sport au niveau local',
    ],
    heroAcronym: "MAGHROUM'IN",
  },
  go4youth: {
    /* projet banner.pdf p5 — TERI, WBG, MEFP, ANETI, EU4Youth, EU | GO4Youth mark. */
    stripPartners: [
      { src: '/img/org-teri.webp', alt: 'TERi — Tunisia Economic Resilience & Inclusion', wide: true },
      { src: '/img/org-banque-mondiale.webp', alt: 'World Bank Group', wide: true },
      {
        src: '/img/org-mefp.webp',
        alt: "Ministère de l'Emploi et de la Formation Professionnelle",
      },
      {
        src: '/img/org-aneti-strip.webp',
        alt: 'ANETI — Agence Nationale pour l’Emploi et le Travail Indépendant',
        wide: true,
      },
      { src: '/img/org-eu4youth-lockup.webp', alt: 'EU4Youth', wide: true },
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        caption: ['Financé par', "l'Union européenne"],
      },
    ],
    stripFootnote:
      'Projet financé par le Programme EU4Youth à travers le Fonds TERI de la Banque Mondiale',
    heroMark: 'white',
    heroTitleLines: ['Gates for Opportunities for Youth'],
    heroAcronym: 'GO4YOUTH',
  },
  irada4youth: {
    /* projet banner.pdf p6 — flags + ODS / ODCO / ODNO / CGDR / EU4Youth, project mark right. */
    stripPartners: [
      {
        src: '/img/flag-eu-client-blend.webp',
        alt: 'Union européenne',
        caption: ['Financé par', "l'Union européenne"],
      },
      {
        src: '/img/flag-tn-client-blend.webp',
        alt: 'République Tunisienne',
        caption: ['République Tunisienne'],
      },
      { src: '/img/org-ods.webp', alt: 'ODS — Office de Développement du Sud' },
      { src: '/img/org-odco.webp', alt: 'ODCO — Office de Développement du Centre-Ouest' },
      {
        src: '/img/org-odno.webp',
        alt: 'ODNO — Office de Développement du Nord-Ouest',
      },
      {
        src: '/img/org-cgdr.webp',
        alt: 'CGDR — Commissariat Général au Développement Régional',
        wide: true,
      },
      { src: '/img/logo-eu4youth.png', alt: 'EU4Youth', wide: true },
    ],
    heroMark: 'white',
    heroTitleLines: [
      'Soutien au développement économique durable local',
      "pour l'emploi des jeunes",
    ],
    heroAcronym: 'IRADA4YOUTH',
  },
}

export function projectHeroMarkSrc(slug: ProjectSlug, variant: 'white' | 'color'): string {
  return variant === 'white' ? `/img/logo-${slug}-white.webp` : `/img/logo-${slug}.png`
}
