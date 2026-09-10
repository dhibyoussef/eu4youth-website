import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

type FeedVariant = 'opportunity' | 'news' | 'event'

export type ProjectFeedCardProps = {
  variant: FeedVariant
  accent: string
  title: string
  meta: string
  body: string
  date: string
  location?: string
  action: string
  to: string
  logo?: string
  thumb: string
}

function Fact({ icon, children }: { icon: string; children: string }) {
  return (
    <span className={`pj-feed-card__fact pj-feed-card__fact--${icon}`}>
      <img src={`/img/icon-${icon}.png`} alt="" aria-hidden="true" />
      <span className="pj-feed-card__fact-value">{children}</span>
    </span>
  )
}

/** Stream card for project feed columns — geometry from Accueil.pdf, in normal flow. */
export function ProjectFeedCard({
  variant,
  accent,
  title,
  meta,
  body,
  date,
  location,
  action,
  to,
  logo,
  thumb,
}: ProjectFeedCardProps) {
  const place = location ? (
    <Fact icon={variant === 'event' ? 'pin-teal' : 'pin-pink'}>{location}</Fact>
  ) : null
  const when = <Fact icon="calendar">{date}</Fact>

  return (
    <article
      className={`pj-feed-card pj-feed-card--${variant}`}
      style={{ '--feed-accent': accent } as CSSProperties}
    >
      <img className="pj-feed-card__thumb" src={thumb} alt="" />

      <div className="pj-feed-card__head">
        <div className="pj-feed-card__titles">
          <h3 className="pj-feed-card__title">{title}</h3>
          <p className="pj-feed-card__meta">{meta}</p>
        </div>
        {logo ? <img className="pj-feed-card__logo" src={`/img/logo-${logo}.png`} alt="" /> : null}
      </div>

      <span className="pj-feed-card__rule" />
      <p className="pj-feed-card__body">{body}</p>
      {variant === 'opportunity' ? <span className="pj-feed-card__rule" /> : null}

      <div className="pj-feed-card__foot">
        {variant === 'event' ? (
          <>
            {place}
            {when}
          </>
        ) : (
          <>
            {when}
            {place}
          </>
        )}
        <Link to={to} className="pj-feed-card__btn">
          {action}
        </Link>
      </div>
    </article>
  )
}
