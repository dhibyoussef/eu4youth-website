import { EVENTS } from '../data/events'
import { NEWS } from '../data/news'
import { OPPORTUNITIES, opportunityStatus } from '../data/opportunities'
import type { ProjectFeedCardProps } from '../components/ProjectFeedCard'
import type { ProjectSlug } from '../data/types'

export function pickProjectOpportunityFeed(
  slug: ProjectSlug,
  catalog = OPPORTUNITIES,
): ProjectFeedCardProps | null {
  const open = catalog
    .filter((item) => item.projectSlug === slug)
    .sort((a, b) => b.deadline.localeCompare(a.deadline))

  const item =
    open.find((entry) => opportunityStatus(entry) === 'Ouverte') ??
    open.find((entry) => opportunityStatus(entry) === 'À venir') ??
    open[0]

  if (!item) return null

  const status = opportunityStatus(item)
  return {
    variant: 'opportunity',
    accent: 'var(--pink)',
    title: item.title,
    meta: `${item.type} · ${status}`,
    body: item.summary,
    date: item.deadlineLabel.toUpperCase(),
    location: item.locationLabel,
    action: "Voir l'appel",
    to: `/opportunites/${item.slug}`,
    logo: item.projectSlug,
    thumb: item.image,
  }
}

export function pickProjectNewsFeed(
  slug: ProjectSlug,
  catalog = NEWS,
): ProjectFeedCardProps | null {
  const item = catalog
    .filter((entry) => entry.projectSlug === slug)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]

  if (!item) return null

  return {
    variant: 'news',
    accent: 'var(--orange)',
    title: item.title,
    meta: item.project,
    body: item.summary,
    date: item.dateLabel.toUpperCase(),
    action: "Lire l'article",
    to: `/actualites/${item.slug}`,
    thumb: item.image,
  }
}

export function pickProjectEventFeed(
  slug: ProjectSlug,
  catalog = EVENTS,
): ProjectFeedCardProps | null {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = catalog
    .filter((entry) => entry.projectSlug === slug && entry.startsAt >= today)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]

  const item =
    upcoming ??
    catalog
      .filter((entry) => entry.projectSlug === slug)
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0]

  if (!item) return null

  return {
    variant: 'event',
    accent: 'var(--teal)',
    title: item.title,
    meta: item.project,
    body: item.summary,
    date: item.dateLabel.toUpperCase(),
    location: item.location,
    action: item.startsAt >= today ? 'En savoir plus' : 'Voir les archives',
    to: `/agenda/${item.id}`,
    thumb: item.image,
  }
}
