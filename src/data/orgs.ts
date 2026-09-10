/* The white plate the partner logos sit on, lifted out of the comp as path data by
   tools/svgart.py 900 11100 1000 11200.

   It is not a rounded rectangle. The comp draws one closed organic shape — sides that bulge
   at different rates, a bottom edge that dips in the middle, corners of four different radii —
   with a spout at the top that points up at the open tab. A rounded rectangle plus a CSS
   triangle, which is what was here, reads as a dialog box rather than as the drawn speech
   bubble it is, and that difference is visible along the whole 1913px of its width.

   The spout rises to y 0 at x 956.6, the shape's midpoint, so it aims at the middle of three
   equal tabs. Only the middle tab carries logos, which is the only tab that opens this plate,
   so the spout is always aimed correctly and never needs moving. */

export const ORGS_PLATE = {
  /** Design px. The plate spans the full page bar a 3.4px margin either side. */
  width: 1913.23,
  height: 986.87,
  /** How far the spout's tip rises above the body of the shape. */
  spout: 100.2,
  /** Slightly above 1 — grows the white bubble around the marks without moving them. */
  bodyScale: 1.1,
  path:
    'M1876.73 248.78 C1841.51 187.5 1776.37 148.04 1708.38 128.76 C1640.38 109.48 1568.79 ' +
    '108.04 1498.13 106.72 C1381.18 104.55 1264.24 102.37 1147.3 100.2 C1111.26 99.53 ' +
    '1047.06 97.29 1042.36 91.49 C1029.79 75.96 992.84 16.68 965.33 2.95 C964.33 1.78 ' +
    '963.17 0.95 961.83 0.53 C960.17 0.1 958.43 0 956.61 0.19 C954.8 0 953.06 0.1 951.4 ' +
    '0.53 C950.06 0.95 948.9 1.78 947.9 2.95 C920.39 16.68 883.44 75.96 870.87 91.49 ' +
    'C866.17 97.29 801.96 99.53 765.93 100.2 C648.99 102.37 532.04 104.55 415.1 106.72 ' +
    'C344.44 108.04 272.85 109.48 204.85 128.76 C136.85 148.04 71.72 187.5 36.5 248.78 ' +
    'C2.76 307.5 0 378.7 3.14 446.35 C6.46 517.84 15.4 589.06 29.83 659.15 C46.46 739.84 ' +
    '72.23 822.32 129.23 881.81 C188.49 943.66 275.32 973.08 360.76 979.31 C464.52 986.87 ' +
    '532.31 972.18 616.02 956.15 C949.8 892.24 1276.93 952.27 1297.21 956.15 C1380.92 ' +
    '972.18 1448.7 986.87 1552.47 979.31 C1637.91 973.08 1724.73 943.66 1784 881.81 ' +
    'C1841 822.32 1866.77 739.84 1883.39 659.15 C1897.83 589.06 1906.77 517.84 1910.09 ' +
    '446.35 C1913.23 378.7 1910.47 307.5 1876.73 248.78',
} as const

const PLATE_CX = ORGS_PLATE.width / 2
const PLATE_CY = ORGS_PLATE.height / 2

/** Expanded viewBox so a scaled-up plate body is not clipped at the corners. */
export function orgsPlateViewBox(): string {
  const s = ORGS_PLATE.bodyScale
  /* Scale is around the plate centre — grow pads so the full curved lip stays visible. */
  const padX = (ORGS_PLATE.width * (s - 1)) / 2 + 6
  const padTop = (ORGS_PLATE.height * (s - 1)) / 2 + ORGS_PLATE.spout * 0.08
  const padBottom = (ORGS_PLATE.height * (s - 1)) / 2 + 16
  const x = -padX
  const y = -padTop
  const w = ORGS_PLATE.width + padX * 2
  const h = ORGS_PLATE.height + padTop + padBottom
  return `${x} ${y} ${w} ${h}`
}

export function orgsPlateViewBoxSize(): { width: number; height: number } {
  const parts = orgsPlateViewBox().split(/\s+/).map(Number)
  return { width: parts[2], height: parts[3] }
}

/** Grow the white shape around its centre; logo coordinates are unchanged. */
export function orgsPlatePathTransform(): string {
  const s = ORGS_PLATE.bodyScale
  return `translate(${PLATE_CX} ${PLATE_CY}) scale(${s}) translate(${-PLATE_CX} ${-PLATE_CY})`
}

export type OrgLogoMark = {
  src: string
  alt: string
  x: number
  y: number
  w: number
  h: number
}

/** Per-mark visual weight — square canvases with heavy seals need shrinking; wide lockups need a nudge. */
const LOGO_VISUAL: Partial<Record<string, number>> = {
  '/img/org-economie-planification.webp': 0.78,
  '/img/org-affaires-culturelles.webp': 0.94,
  '/img/org-jeunesse-sports.webp': 0.86,
  '/img/org-aneti.webp': 0.98,
  '/img/org-formation-emploi.webp': 0.92,
  '/img/org-cgdr.webp': 0.88,
  '/img/org-observatoire-jeunesse.webp': 1.12,
  '/img/org-mesrs.webp': 1,
  '/img/org-anpr.webp': 0.96,
}

type SizedMark = OrgLogoMark & { col: number }

/** Top row: five columns; bottom row: four logos centred in the middle four slots. */
export function layoutPlateLogos(logos: readonly OrgLogoMark[]): OrgLogoMark[] {
  const placed = logos.filter((logo) => logo.w > 0 && logo.h > 0)
  if (placed.length < 2) return [...logos]

  const padX = 102
  const gap = 38
  const row1 = { top: 168, height: 350 }
  const row2 = { top: 562, height: 350 }

  const split = placed.length === 9 ? 5 : Math.ceil(placed.length / 2)
  const top = placed.slice(0, split)
  const bottom = placed.slice(split)

  const innerW = ORGS_PLATE.width - padX * 2
  const cols = 5
  const cellW = (innerW - gap * (cols - 1)) / cols
  const maxW = cellW * 0.86

  const sizeMark = (
    logo: OrgLogoMark,
    row: { height: number },
    maxCellW: number,
  ): { w: number; h: number } => {
    const aspect = logo.w / logo.h
    const visual = LOGO_VISUAL[logo.src] ?? 1
    const wide = aspect >= 1.85
    const ultraWide = aspect >= 3.8
    const cellBudget = maxCellW * (ultraWide ? 1.28 : wide ? 1.06 : 1)

    if (wide) {
      let w = cellBudget * Math.min(visual, 1.08)
      let h = w / aspect
      const capH = row.height * 0.82
      const minH = row.height * (ultraWide ? 0.52 : 0.62)
      if (h > capH) {
        h = capH
        w = h * aspect
      }
      if (h < minH) {
        h = minH
        w = h * aspect
        if (w > cellBudget) {
          w = cellBudget
          h = w / aspect
        }
      }
      return { w, h }
    }

    let h = row.height * 0.86 * visual
    let w = h * aspect
    if (w > cellBudget) {
      w = cellBudget
      h = w / aspect
    }
    return { w, h }
  }

  const normalizeRow = (
    marks: SizedMark[],
    row: { top: number; height: number },
  ): SizedMark[] => {
    const capH = row.height * 0.88
    const tallest = Math.max(...marks.map((mark) => mark.h))
    const scale = tallest > capH ? capH / tallest : 1
    return marks.map((mark) => {
      let w = mark.w * scale
      let h = mark.h * scale
      const x = padX + mark.col * (cellW + gap) + (cellW - w) / 2
      const y = row.top + (row.height - h) / 2
      const safeX = Math.max(padX, Math.min(x, ORGS_PLATE.width - padX - w))
      const safeY = Math.max(row.top, Math.min(y, row.top + row.height - h))
      return { ...mark, x: safeX, y: safeY, w, h }
    })
  }

  const layoutRow = (
    rowLogos: readonly OrgLogoMark[],
    row: { top: number; height: number },
    colOffset = 0,
  ): SizedMark[] => {
    const sized = rowLogos.map((logo, index) => {
      const { w, h } = sizeMark(logo, row, maxW)
      return { ...logo, col: colOffset + index, w, h, x: 0, y: 0 }
    })
    return normalizeRow(sized, row)
  }

  const bottomOffset = bottom.length === 4 ? 0.5 : 0
  const laidOut = [
    ...layoutRow(top, row1, 0),
    ...layoutRow(bottom, row2, bottomOffset),
  ]

  const keyed = new Map(laidOut.map((logo) => [logo.src, logo]))
  return logos.map((logo) => {
    const hit = keyed.get(logo.src)
    if (!hit) return logo
    const { col: _col, ...rest } = hit
    return rest
  })
}
