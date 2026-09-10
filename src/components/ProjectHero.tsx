import { PROJECT_BANNERS, projectHeroMarkSrc } from '../data/projectBanners'
import type { Project } from '../data/types'

/** Coloured hero field — title lines + large acronym (projet.pdf / projet banner.pdf). */
export function ProjectHero({ project }: { project: Project }) {
  const config = PROJECT_BANNERS[project.slug]
  const lines = config.heroTitleLines ?? [project.fullName]
  const acronym = config.heroAcronym ?? project.acronym.toUpperCase()
  const watermark = projectHeroMarkSrc(project.slug, config.heroMark)
  return (
    <section
      className="pj-hero pj-hero--centered"
      aria-labelledby="pj-title"
    >
      <img className="pj-hero__watermark" src={watermark} alt="" aria-hidden="true" />
      <div className="pj-hero__content">
        <h1 id="pj-title" className="pj-hero__title">
          {lines.map((line) => (
            <span key={line} className="pj-hero__line">
              {line}
            </span>
          ))}
          <span className="pj-hero__acronym">{acronym}</span>
        </h1>
      </div>
    </section>
  )
}
