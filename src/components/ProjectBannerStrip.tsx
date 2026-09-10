import { useEffect, useRef, useState } from 'react'
import { PROJECT_BANNERS, type BannerPartnerLogo } from '../data/projectBanners'
import type { Project } from '../data/types'

type PartnerCluster = {
  items: BannerPartnerLogo[]
  caption?: string[]
}

function clusterPartners(partners: BannerPartnerLogo[]): PartnerCluster[] {
  const clusters: PartnerCluster[] = []
  for (const logo of partners) {
    const last = clusters.at(-1)
    if (logo.cluster && last?.items[0]?.cluster === logo.cluster) {
      last.items.push(logo)
      continue
    }
    clusters.push({
      items: [logo],
      caption: logo.clusterCaption,
    })
  }
  return clusters
}

/** Project strip — sticky under the blue nav on project pages only. */
export function ProjectBannerStrip({ project }: { project: Project }) {
  const config = PROJECT_BANNERS[project.slug]
  const clusters = clusterPartners(config.stripPartners)
  const anchorRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)
  const [anchorHeight, setAnchorHeight] = useState(0)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1100px)')
    const update = () => {
      const anchor = anchorRef.current
      const strip = stripRef.current
      if (!anchor || !strip) return
      if (!desktop.matches) {
        setPinned(false)
        setAnchorHeight(0)
        return
      }
      const nav = document.querySelector('.nav') as HTMLElement | null
      const pinTop = nav?.getBoundingClientRect().height ?? 0
      const shouldPin = anchor.getBoundingClientRect().top <= pinTop + 1
      setPinned(shouldPin)
      setAnchorHeight(shouldPin ? strip.offsetHeight : 0)
      if (shouldPin) {
        strip.style.top = `${Math.round(pinTop)}px`
      } else {
        strip.style.top = ''
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    desktop.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      desktop.removeEventListener('change', update)
    }
  }, [project.slug])

  const labelAfter = Math.min(
    Math.max(config.stripLabelAfter ?? clusters.length, 0),
    clusters.length,
  )
  const beforeLabel = clusters.slice(0, labelAfter)
  const afterLabel = clusters.slice(labelAfter)

  const renderLogo = (logo: BannerPartnerLogo) => (
    <img
      key={`${logo.src}-${logo.alt}`}
      className="pj-strip__logo"
      src={logo.src}
      alt={logo.alt}
      loading="eager"
      decoding="async"
    />
  )

  const renderCluster = (cluster: PartnerCluster, index: number) => {
    const first = cluster.items[0]
    const caption = cluster.caption ?? (cluster.items.length === 1 ? first.caption : undefined)
    const extraWide = cluster.items.some((item) => item.extraWide)
    const wide = cluster.items.some((item) => item.wide)
    const grouped = cluster.items.length > 1
    const className = [
      'pj-strip__partner',
      caption?.length ? 'pj-strip__partner--caption' : '',
      extraWide ? 'pj-strip__partner--extra-wide' : '',
      wide && !extraWide ? 'pj-strip__partner--wide' : '',
      grouped ? 'pj-strip__partner--cluster' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <li key={`${first.src}-${index}`} className={className}>
        {grouped ? (
          <div className="pj-strip__cluster-row">{cluster.items.map(renderLogo)}</div>
        ) : (
          renderLogo(first)
        )}
        {caption?.length ? (
          <span className="pj-strip__caption">
            {caption.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        ) : null}
      </li>
    )
  }

  return (
    <div className="pj-strip-anchor" ref={anchorRef} style={{ height: anchorHeight || undefined }}>
      <div className={pinned ? 'pj-strip pj-strip--pinned' : 'pj-strip'} ref={stripRef}>
        <div className="pj-strip__inner">
          <div className="pj-strip__partners-block">
            <ul className="pj-strip__partners">
              {beforeLabel.map(renderCluster)}
              {config.stripLabel ? (
                <li className="pj-strip__partner pj-strip__partner--label">
                  <p className="pj-strip__label">{config.stripLabel}</p>
                </li>
              ) : null}
              {afterLabel.map((cluster, index) => renderCluster(cluster, index + beforeLabel.length))}
            </ul>
            {config.stripFootnote ? (
              <p className="pj-strip__footnote">{config.stripFootnote}</p>
            ) : null}
          </div>

          <div className="pj-strip__identity">
            <img
              className="pj-strip__mark"
              src={`/img/logo-${project.slug}.png`}
              alt={project.acronym}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
