/** Primary navigation, measured from Accueil.pdf.
 *
 *  All numbers are design px on the 1920 canvas (rendered as px/10 rem).
 *  The comp spaces nav items unevenly, so labels are placed absolutely
 *  rather than distributed by flexbox.
 *
 *  Open states come from Accueil.pdf pages 2-4:
 *    p2  PROJETS               white tab + full-width white panel of logos
 *    p3  ACTUALITÉS ET OPP.    orange tab + narrow 3-row panel
 *    p4  MÉDIAS ET RESSOURCES  orange tab + narrow 3-row panel
 *
 *  Source inconsistencies, normalised here and reported rather than guessed:
 *    - The comp spells the first item "PRGRAMME" (missing O) and gives it no
 *      chevron, though the sitemap gives it four child pages.
 *    - p3 draws the tab 102.4 tall, p4 draws it 111.5. Both panels end at a
 *      different y (503.7 vs 507.6). Unified to tab bottom 233.4 / panel
 *      bottom 505.6 so the two states match each other.
 *    - No page draws the PROGRAMME menu, and the sitemap gives it four pages
 *      against the three each drawn menu has. Its panel therefore takes the
 *      drawn row height and runs one row longer.
 *    - p3 and p4 both draw their first row white with an orange label. That is
 *      the hover state, not a permanent highlight: a static comp can only show
 *      it on one row, and the first is the one it picks. The highlight follows
 *      the cursor here, so hovering the first row reproduces the comp.
 */

export type DropdownKind = 'rows' | 'logos'

export interface NavChild {
  label: string
  to: string
}

export interface NavItem {
  label: string
  /** Manual line breaks as drawn in the comp. */
  lines: string[]
  /** Left edge of the label in design px. */
  x: number
  to?: string
  children?: NavChild[]
  /** True when this item came from the CMS menu, so page copy must not override labels. */
  fromCms?: boolean
  dropdown?: {
    kind: DropdownKind
    /** Tab rectangle in design px. */
    tab: { x: number; w: number; top: number }
    /** Narrow panel width; omitted for the full-bleed logos panel. */
    panelW?: number
    panelX?: number
    /** Where the panel begins. The two kinds do not agree: a rows panel starts
     *  at its tab's bottom edge, partway up the blue bar, while the logos panel
     *  starts at the bar's bottom so the bar keeps its full height and only the
     *  tab reaches down into the panel. */
    panelTop: number
    /** Only the logos panel needs this. A rows panel is as tall as its rows, so
     *  stating a bottom as well would let the two disagree. */
    panelBottom?: number
  }
}

/** Shared vertical rhythm of the open states. */
export const NAV_GEO = {
  instHeight: 124,
  barHeight: 150,
  labelSize: 23,
  labelCenter: 59.5, // relative to the blue bar's top edge
  tabBottom: 233.4,
  /** Row pitch, measured from the labels: p3 and p4 both set their three labels
   *  88.5 apart. The panel's own landmarks do not agree with each other — the
   *  hairline two rows down implies 89.8, dividing the panel into thirds implies
   *  90.7, and the two pages put the panel's bottom edge 4px apart — so the copy
   *  is what this follows. Either of the others walks the third label 3-5px low,
   *  which is legible; the panel ending 4px short of one comp page and 8px short
   *  of the other is not, since that edge falls on photography.
   *
   *  A panel is as tall as it has rows. That matters for PROGRAMME, which has
   *  four pages and no comp page of its own: the panel grows rather than
   *  squeezing four rows into the height of three. */
  rowHeight: 88.5,
} as const

export const PRIMARY_NAV: NavItem[] = [
  {
    label: 'Programme',
    lines: ['PROGRAMME'],
    x: 48,
    to: '/programme/a-propos',
  },
  {
    label: 'Projets',
    lines: ['PROJETS'],
    x: 230,
    children: [
      { label: "Jeun'ESS", to: '/projets/jeuness' },
      { label: 'GO4Youth', to: '/projets/go4youth' },
      { label: 'SWAFY', to: '/projets/swafy' },
      { label: 'Irada 4 Youth', to: '/projets/irada4youth' },
      { label: "Maghroum'IN", to: '/projets/maghroumin' },
      { label: 'Fe3il.a', to: '/projets/fe3ila' },
    ],
    dropdown: {
      kind: 'logos',
      tab: { x: 185, w: 190, top: 158.7 },
      panelTop: 277,
      panelBottom: 592.8,
    },
  },
  { label: 'Carte', lines: ['CARTE'], x: 420, to: '/carte' },
  {
    label: 'Actualités et opportunités',
    lines: ['ACTUALITÉS', 'ET OPPORTUNITÉS'],
    x: 560,
    children: [
      { label: 'ACTUALITÉS', to: '/actualites' },
      { label: 'OPPORTUNITÉS', to: '/opportunites' },
      { label: 'ÉVÉNEMENTS', to: '/agenda' },
    ],
    dropdown: {
      kind: 'rows',
      tab: { x: 530, w: 250, top: 127 },
      panelX: 530,
      panelW: 250,
      panelTop: 233.4,
    },
  },
  { label: 'Youth Stories', lines: ['YOUTH STORIES'], x: 820, to: '/stories' },
  {
    label: 'Médias et ressources',
    lines: ['MÉDIAS ET', 'RESSOURCES'],
    x: 1035,
    children: [
      { label: 'PUBLICATIONS', to: '/publications' },
      { label: 'GLOSSAIRE', to: '/glossaire' },
      { label: 'MÉDIAS', to: '/coin-media' },
    ],
    dropdown: {
      kind: 'rows',
      tab: { x: 990, w: 250, top: 127 },
      panelX: 990,
      panelW: 250,
      panelTop: 233.4,
    },
  },
  {
    label: 'EU en Tunisie',
    lines: ['EU EN TUNISIE'],
    x: 1260,
    to: '/eu-en-tunisie',
  },
]

export type CmsNavNode = {
  id?: number
  url?: string
  label?: string
  open_in_new_tab?: boolean
  children?: CmsNavNode[]
}

function publicPath(url: string) {
  if (!url) return '/'
  if (/^https?:/i.test(url)) return url
  let path = url.startsWith('/') ? url : `/${url}`
  path = path.replace(/^\/programme\//, '/programme/')
  path = path.replace(/^\/mecanismes-appui/, '/mecanismes-appui')
  path = path.replace(/^\/eu-en-tunisie/, '/eu-en-tunisie')
  path = path.replace(/^\/stories$/, '/stories')
  path = path.replace(/^\/coin-media/, '/coin-media')
  return path
}

function linesFromLabel(label: string) {
  const text = label.trim()
  if (!text) return ['']
  const words = text.split(/\s+/)
  if (text.length > 18 && words.length >= 2) {
    const mid = Math.ceil(words.length / 2)
    return [words.slice(0, mid).join(' ').toUpperCase(), words.slice(mid).join(' ').toUpperCase()]
  }
  return [text.toUpperCase()]
}

function layoutForNode(node: CmsNavNode, index: number) {
  const path = publicPath(node.url || '')
  const childPaths = (node.children || []).map((child) => publicPath(child.url || ''))
  const matched = PRIMARY_NAV.find((item) => {
    if (item.to && (item.to === path || childPaths.includes(item.to))) return true
    return Boolean(item.children?.some((child) => child.to === path || childPaths.includes(child.to)))
  })
  return matched || PRIMARY_NAV[index]
}

const FALLBACK_X = [48, 230, 420, 560, 820, 1035, 1260]

function mapCmsNode(node: CmsNavNode, index: number): NavItem {
  const layout = layoutForNode(node, index)
  const kids = node.children || []
  const path = publicPath(node.url || layout?.to || '/')
  const x = layout?.x ?? FALLBACK_X[index] ?? 68 + index * 210
  if (layout?.dropdown?.kind === 'logos') {
    return {
      ...layout,
      label: node.label || layout.label,
      lines: linesFromLabel(node.label || layout.label),
      x,
      fromCms: true,
    }
  }
  if (kids.length) {
    return {
      label: node.label || layout?.label || path,
      lines: linesFromLabel(node.label || layout?.label || ''),
      x,
      fromCms: true,
      children: kids.map((child) => ({
        label: (child.label || child.url || '').toUpperCase(),
        to: publicPath(child.url || '/'),
      })),
      dropdown: layout?.dropdown || {
        kind: 'rows' as const,
        tab: { x: x - 28, w: 216, top: 127 },
        panelX: x - 28,
        panelW: 216,
        panelTop: 233.4,
      },
    }
  }
  return {
    label: node.label || layout?.label || path,
    lines: linesFromLabel(node.label || layout?.label || ''),
    x,
    to: path,
    fromCms: true,
  }
}

function flattenNavLinks(item: NavItem): { label: string; to: string }[] {
  if (item.children?.length) return item.children
  if (item.to) return [{ label: (item.label || '').toUpperCase(), to: item.to }]
  return []
}

function flattenProgrammeNav(items: NavItem[]): NavItem[] {
  return items.map((item) => {
    const isProgramme =
      /programme/i.test(item.label) ||
      item.to === '/programme/a-propos' ||
      Boolean(item.children?.some((child) => child.to.startsWith('/programme/')))
    if (!isProgramme || !item.children?.length) return item
    return {
      label: item.label,
      lines: item.lines.length ? item.lines : ['PROGRAMME'],
      x: item.x,
      to: '/programme/a-propos',
      fromCms: item.fromCms,
    }
  })
}

/** Map the public /api/site-nav tree onto the measured header layout. */
export function navFromCms(nodes: CmsNavNode[]): NavItem[] {
  if (!nodes.length) return PRIMARY_NAV
  const mapped = flattenProgrammeNav(nodes.map((node, index) => mapCmsNode(node, index)))
  if (mapped.length <= PRIMARY_NAV.length) return mapped
  const kept = mapped.slice(0, PRIMARY_NAV.length)
  const overflow = mapped.slice(PRIMARY_NAV.length).flatMap(flattenNavLinks)
  const x = 1610
  return [
    ...kept,
    {
      label: 'Plus',
      lines: ['PLUS'],
      x,
      fromCms: true,
      children: overflow,
      dropdown: {
        kind: 'rows',
        tab: { x: x - 28, w: 160, top: 127 },
        panelX: x - 28,
        panelW: 200,
        panelTop: 233.4,
      },
    },
  ]
}
