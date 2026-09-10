import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import { EditableText } from '../cms/EditableText'
import { CmsSection } from '../cms/EditableImage'
import { EditableJsonList } from '../cms/EditableJsonList'
import { useContent } from '../cms/ContentProvider'
import './eu-tunisie.css'

const INTRO_BODY =
  "L’Union européenne accompagne la Tunisie à travers une coopération qui couvre des domaines variés, en lien avec les enjeux sociaux, économiques, territoriaux et environnementaux du pays. Son action s’articule autour de thématiques complémentaires, allant des droits humains et de l’égalité à l’emploi, l’innovation, le développement économique, la transition écologique et le développement territorial.\n\nDécouvrez les principaux domaines d’intervention de l’Union européenne en Tunisie et explorez les projets qui contribuent à ces différentes dynamiques."

const THEME_FALLBACK = [
  {
    title: 'Égalité Femmes-Hommes',
    body:
      'L’action de l’Union européenne contribue à promouvoir l’égalité entre les femmes et les hommes et à renforcer leur participation dans les différents domaines de la vie sociale et économique. Elle soutient des initiatives visant à favoriser l’égalité des chances et à mieux prendre en compte les enjeux liés au genre.',
  },
  {
    title: 'Droits humains et société civile',
    body:
      'L’Union européenne soutient la promotion et la protection des droits humains ainsi que le rôle de la société civile. Cette coopération contribue à renforcer les capacités des acteurs associatifs et leur participation à la vie publique et sociale.',
  },
  {
    title: 'Santé',
    body:
      'La coopération européenne intervient dans le domaine de la santé, en appui aux dynamiques visant à améliorer les systèmes et les services de santé. Elle accompagne également les acteurs concernés dans leurs efforts pour répondre aux enjeux sanitaires.',
  },
  {
    title: 'Changement climatique et énergie',
    body:
      'Face aux enjeux liés au changement climatique, l’Union européenne soutient les dynamiques de transition vers des modèles plus durables. Son action porte notamment sur les questions liées à l’énergie, à l’adaptation au changement climatique et à la transition énergétique.',
  },
  {
    title: 'Développement régional et local',
    body:
      'L’Union européenne contribue au développement équilibré des territoires et au renforcement des dynamiques locales. Les interventions dans ce domaine visent notamment à soutenir le développement régional et les acteurs qui contribuent à la cohésion et au développement des territoires.',
  },
  {
    title: 'Environnement, développement durable et eau',
    body:
      'La coopération européenne soutient la protection de l’environnement et la promotion de modes de développement plus durables. Elle porte également sur la gestion et la préservation des ressources en eau, ainsi que sur les enjeux environnementaux qui concernent les territoires.',
  },
  {
    title: 'Agriculture',
    body:
      'L’agriculture constitue un domaine important de la coopération entre l’Union européenne et la Tunisie. L’action européenne accompagne les dynamiques liées au développement agricole et à la durabilité du secteur, en lien avec les enjeux économiques, territoriaux et environnementaux.',
  },
  {
    title: 'Médias & Culture',
    body:
      'L’Union européenne soutient les secteurs des médias et de la culture, qui contribuent au pluralisme, à la création et à la diversité culturelle. La coopération vise également à renforcer les acteurs et les initiatives qui participent au développement de ces secteurs.',
  },
  {
    title: 'Education, recherche, innovation',
    body:
      'L’Union européenne soutient l’éducation, la recherche et l’innovation comme leviers de développement et d’ouverture. Cette coopération contribue à favoriser l’accès aux connaissances, le développement des compétences et les dynamiques d’innovation.',
  },
  {
    title: 'Emploi et formation professionnelle',
    body:
      'L’action européenne contribue au développement de l’emploi et au renforcement de la formation professionnelle. Elle vise notamment à soutenir l’acquisition de compétences et à favoriser une meilleure adéquation entre les compétences et les opportunités professionnelles.',
  },
  {
    title: 'Démocratie et gouvernance',
    body:
      'L’Union européenne accompagne les dynamiques liées à la démocratie et à la gouvernance. Son action soutient notamment le renforcement des institutions, des pratiques de gouvernance et de la participation à la vie publique.',
  },
  {
    title: 'Développement économique et appui au secteur privé',
    body:
      'L’Union européenne soutient le développement économique et les acteurs du secteur privé en Tunisie. La coopération contribue notamment à créer un environnement favorable à l’activité économique, à l’entrepreneuriat et au développement des entreprises.',
  },
]

const MAP_URL = 'https://ue-tunisie.org/zone_projects'
const EEAS_URL = 'https://www.eeas.europa.eu/delegations/tunisia_fr'

/** EU flag ring — twelve stars on a circle, cropped on the hero’s right edge. */
const EU_RING_STARS = 12
const EU_RING_RADIUS_REM = 54

function EuStarRing() {
  return (
    <div className="eu-tn-hero__stars" aria-hidden="true">
      {Array.from({ length: EU_RING_STARS }, (_, index) => {
        const angleDeg = index * (360 / EU_RING_STARS) - 90
        const angleRad = (angleDeg * Math.PI) / 180
        const x = Math.cos(angleRad) * EU_RING_RADIUS_REM
        const y = Math.sin(angleRad) * EU_RING_RADIUS_REM
        return (
          <span
            key={index}
            className="eu-tn-hero__star-mark"
            style={
              {
                '--star-x': `${x}rem`,
                '--star-y': `${y}rem`,
              } as CSSProperties
            }
          >
            ★
          </span>
        )
      })}
    </div>
  )
}

function ThemeChevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg className="eu-tn-themes__chev" viewBox="0 0 28 46" aria-hidden="true" focusable="false">
      <path
        d={direction === 'prev' ? 'M24 2 L6 23 L24 44' : 'M4 2 L22 23 L4 44'}
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
  return <div className="eu-edit-region">{children}</div>
}

function linesOf(raw: string, fallback: string[]) {
  const parts = raw.split('\n').map((line) => line.trim()).filter(Boolean)
  return parts.length ? parts : fallback
}

function paragraphs(raw: string, fallback: string[]) {
  const parts = raw
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length ? parts : fallback
}

function DoubleChevron({ className = 'eu-tn-chev' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 26" aria-hidden="true" focusable="false">
      <path
        d="M2.2 2.2 L12.7 13 L2.2 23.8 M15.2 2.2 L25.7 13 L15.2 23.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThemesCarousel({ themes }: { themes: { title: string; body: string }[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, themes.length - 1)))
  }, [themes.length])

  const theme = themes[index]
  if (!theme) return null

  return (
    <div className="eu-tn-themes__carousel">
      <button
        type="button"
        className="eu-tn-themes__nav eu-tn-themes__nav--prev"
        aria-label="Thématique précédente"
        disabled={index <= 0}
        onClick={() => setIndex((current) => Math.max(0, current - 1))}
      >
        <ThemeChevron direction="prev" />
      </button>

      <article className="eu-tn-themes__slide">
        <span className="eu-tn-themes__star" aria-hidden="true">
          ★
        </span>
        <h3>{theme.title}</h3>
        <p>{theme.body}</p>
      </article>

      <button
        type="button"
        className="eu-tn-themes__nav eu-tn-themes__nav--next"
        aria-label="Thématique suivante"
        disabled={index >= themes.length - 1}
        onClick={() => setIndex((current) => Math.min(themes.length - 1, current + 1))}
      >
        <ThemeChevron direction="next" />
      </button>
    </div>
  )
}

export default function EuTunisiePage() {
  const { get } = useContent()
  const titleLines = linesOf(get('hero.title', "L’UNION EUROPÉENNE\nEN TUNISIE"), [
    'L’UNION EUROPÉENNE',
    'EN TUNISIE',
  ])
  const introParagraphs = paragraphs(get('intro.body', INTRO_BODY), INTRO_BODY.split(/\n{2,}/))

  const themeRows = parseJsonRows(get('themes.items', JSON.stringify(THEME_FALLBACK)))
  const themes = (themeRows?.length ? themeRows : THEME_FALLBACK).map((row, index) => ({
    title: String(row.title || THEME_FALLBACK[index]?.title || ''),
    body: String(row.body || THEME_FALLBACK[index]?.body || ''),
  }))

  return (
    <div className="page page--eu-tunisie">
      <CmsSection id="hero" className="eu-tn-hero" labelledBy="eu-tn-title">
        <EuStarRing />
        <div className="eu-tn-hero__inner">
          <EditableText
            section="hero"
            field="title"
            fallback={"L’UNION EUROPÉENNE\nEN TUNISIE"}
            as="h1"
            id="eu-tn-title"
            className="eu-tn-hero__title"
            label="Titre"
          >
            {titleLines.map((line, lineIndex) => (
              <span
                key={`${line}-${lineIndex}`}
                className={lineIndex === titleLines.length - 1 ? 'eu-tn-hero__kicker' : 'eu-tn-hero__line'}
              >
                {line}
              </span>
            ))}
          </EditableText>
        </div>
      </CmsSection>

      <CmsSection id="intro" className="eu-tn-intro">
        <EditableText section="intro" field="body" fallback={INTRO_BODY} as="div" label="Texte d’introduction">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </EditableText>
      </CmsSection>

      <CmsSection id="themes" className="eu-tn-themes" labelledBy="eu-tn-themes-title">
        <header className="eu-tn-themes__head">
          <EditableText
            section="themes"
            field="title"
            fallback="Thématiques"
            as="h2"
            id="eu-tn-themes-title"
            label="Titre"
          />
        </header>
        <ListDock>
          <EditableJsonList
            section="themes"
            field="items"
            label="Thématiques"
            className="eu-list-cms"
            wrapItems={false}
            manageLabel="Gérer les thématiques"
            fallback={THEME_FALLBACK}
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'body', label: 'Texte', multiline: true },
            ]}
            emptyItem={{ title: 'Nouvelle thématique', body: '' }}
            renderItem={() => null}
          />
          <ThemesCarousel themes={themes} />
        </ListDock>

        <div className="eu-tn-explore" aria-labelledby="eu-tn-explore-title">
          <h2 id="eu-tn-explore-title" className="sr-only">
            Explorer l’action de l’Union européenne en Tunisie
          </h2>
          <a className="eu-tn-explore__card eu-tn-explore__card--map" href={MAP_URL} target="_blank" rel="noreferrer">
          <span className="eu-tn-explore__copy">
            <EditableText
              section="explore"
              field="mapCta"
              fallback="Explorer les projets de l’UE en Tunisie"
              as="span"
              className="eu-tn-explore__title"
              multiline={false}
              label="Bouton cartographie"
            />
            <EditableText
              section="explore"
              field="mapSubtitle"
              fallback="Cartographie des projets de l’Union européenne en Tunisie"
              as="span"
              className="eu-tn-explore__subtitle"
              multiline={false}
              label="Sous-titre cartographie"
            />
          </span>
          <DoubleChevron />
        </a>
        <a className="eu-tn-explore__card eu-tn-explore__card--site" href={EEAS_URL} target="_blank" rel="noreferrer">
          <span className="eu-tn-explore__copy">
            <EditableText
              section="explore"
              field="siteCta"
              fallback="Découvrir l’action de l’UE en Tunisie"
              as="span"
              className="eu-tn-explore__title"
              multiline={false}
              label="Bouton site UE"
            />
            <EditableText
              section="explore"
              field="siteSubtitle"
              fallback="Site officiel de l’Union européenne en Tunisie"
              as="span"
              className="eu-tn-explore__subtitle"
              multiline={false}
              label="Sous-titre site UE"
            />
          </span>
          <DoubleChevron />
        </a>
        </div>
      </CmsSection>
    </div>
  )
}
