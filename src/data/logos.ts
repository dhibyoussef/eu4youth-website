/** The six project logos, and where each strip in the comp places them.
 *
 *  Accueil prints the same six logos twice at the same sizes: in the "Six projets"
 *  band, and in the full-bleed panel under the PROJETS nav tab. The two are offset
 *  from each other by about 4px horizontally, so the geometry is measured
 *  separately for each rather than derived from one.
 *
 *  Every number is design px, taken from the ink box of the printed watermark, so
 *  the coloured logo shown on hover lands on the pixels the grey one occupied.
 *  Band coordinates are relative to the band's top-left; panel coordinates are
 *  relative to the panel, whose own top sits at NAV_GEO.tabBottom.
 */

import type { LogoCell } from '../components/ProjectLogos'

/** Left to right, as the comp orders them. */
const PROJECTS = [
  { slug: 'irada4youth', name: 'IRADA4YOUTH' },
  { slug: 'swafy', name: 'SWAFY' },
  { slug: 'jeuness', name: "Jeun'ESS" },
  { slug: 'fe3ila', name: 'Fe3il.a' },
  { slug: 'maghroumin', name: "Maghroum'IN" },
  { slug: 'go4youth', name: 'GO4Youth' },
] as const

/** x, y, w, h per logo, in the order above. */
type Geometry = readonly (readonly [number, number, number, number])[]

const strip = (geometry: Geometry): LogoCell[] =>
  PROJECTS.map((project, index) => ({
    ...project,
    x: geometry[index][0],
    y: geometry[index][1],
    w: geometry[index][2],
    h: geometry[index][3],
  }))

/** "Six projets" band — Accueil.pdf p1, watermarks at y 2827-2987. */
export const BAND_LOGOS = strip([
  [102, 699, 199, 97],
  [393, 664, 132, 147],
  [614, 652, 171, 160],
  [889, 703, 221, 75],
  [1249, 670, 185, 125],
  [1531, 699, 262, 58],
])

/** "Six projets" band — a propos.pdf p1, ink at y 6690-6849 (tools/logobox.py). */
export const APROPOS_BAND_LOGOS = strip([
  [115, 6738, 198, 96],
  [406, 6703, 131, 146],
  [662, 6690, 134, 156],
  [902, 6742, 220, 74],
  [1261, 6709, 185, 129],
  [1543, 6738, 262, 58],
])

/** Footer strip, measured off the footer plate itself (tools/plate.py) rather than the PDF,
 *  because the plate is what the band drew before these became live links: at these cells the
 *  six land on the pixels the flattened footer printed them at, so nothing moved when the
 *  plate went. Relative to the footer band's top, and about 44% of the band strip's size. */
export const FOOTER_LOGOS = strip([
  [76, 758, 88, 42],
  [205, 742, 58, 64],
  [302, 736, 75, 70],
  [424, 759, 97, 32],
  [582, 744, 81, 55],
  [707, 757, 116, 26],
])

/** PROJETS dropdown panel — Accueil.pdf p2, watermarks at y 356-516, taken from
 *  the panel's top edge at y 277. */
export const NAV_LOGOS = strip([
  [107, 126, 198, 97],
  [398, 91, 132, 147],
  [618, 79, 171, 161],
  [894, 130, 220, 75],
  [1253, 98, 185, 124],
  [1535, 126, 263, 58],
])
