/** Content shapes for the static prototype.
 *  Keys mirror the future CMS block paths (e.g. `projects.jeuness.hero.title`)
 *  so the CMS phase becomes wrapping, not restructuring. */

export type ProjectSlug =
  | 'jeuness'
  | 'go4youth'
  | 'swafy'
  | 'irada4youth'
  | 'maghroumin'
  | 'fe3ila'

export type Composante =
  | 'Emploi, employabilité et entrepreneuriat'
  | "Culture et sport pour l'inclusion"
  | "Culture et sport pour l'inclusion des jeunes"
  | 'Politiques publiques et participation des jeunes'
  | 'Politiques publiques pour la jeunesse'

export interface Kpi {
  value: string
  label: string
}

export interface ProjectComponent {
  name: string
  tagline: string
  description: string
  results: string[]
  sectors: string[]
  /** Optional logo mark cropped from projet.pdf (Jeun'ESS composantes row). */
  mark?: string
}

export interface Project {
  slug: ProjectSlug
  acronym: string
  fullName: string
  /** Short line under the name on the programme fiche (orange). */
  tagline: string
  /** « Citation » in the fiche bubble; defaults to tagline when omitted. */
  quote?: string
  /** Long summary shown on the programme fiche (Section 6 body). */
  ficheSummary?: string
  /** When true, the programme fiche shows the BUDGET field (Word Section 6: Fe3il.a only). */
  showFicheBudget?: boolean
  composante: Composante
  /** CSS custom property suffix, e.g. `jeuness` -> var(--p-jeuness) */
  theme: ProjectSlug
  budget: string
  partner: string
  territory: string
  period: string
  sectors: string
  /** Broad source-backed audiences used by the project catalogue filter. */
  beneficiaries: string[]
  presentation: string[]
  governorates: string[]
  generalObjective: string
  specificObjectives: string[]
  kpis: Kpi[]
  /** Lead line under IMPACT GLOBAL DU PROJET — from projet.pdf when available. */
  impactIntro?: string
  components: ProjectComponent[]
  /** Partner strip extracted from projet banner.pdf. */
  bannerStrip?: string
  /** Optional funding line shown in the banner strip / hero (Go4Youth). */
  fundingNote?: string
  /** Unresolved source-data conflicts, surfaced instead of silently guessed. */
  dataGaps?: string[]
}

export interface OpportunityCard {
  title: string
  type: string
  deadline: string
  location: string
  excerpt: string
  project?: string
}

export interface NewsCard {
  title: string
  project: string
  date: string
  excerpt: string
}

export interface EventCard {
  title: string
  project: string
  date: string
  location: string
  excerpt: string
}
