import { MAP_SHAPES } from './tunisia'

/** Per-governorate label tuning — anchor in the 420×887 map viewBox, size in rem. */
export interface MapLabelStyle {
  x?: number
  y?: number
  size?: string
  hide?: boolean
}

export const MAP_W = 420
export const MAP_H = 887

export const MAP_LABEL_STYLES: Partial<Record<string, MapLabelStyle>> = {
  /* Grand Tunis — hand-tuned so badges stay readable without auto-spread drift. */
  Ariana: { x: 268, y: 58, size: '0.66rem' },
  Tunis: { x: 248, y: 76, size: '0.66rem' },
  Manouba: { x: 190, y: 98, size: '0.62rem' },
  'Ben Arous': { x: 288, y: 104, size: '0.60rem' },
  Bizerte: { x: 185, y: 42, size: '0.78rem' },
  Nabeul: { x: 328, y: 92, size: '0.70rem' },

  /* North-west */
  Jendouba: { x: 102, y: 110, size: '0.84rem' },
  Béja: { x: 162, y: 122, size: '0.84rem' },
  'Le Kef': { x: 112, y: 176, size: '0.88rem' },
  Siliana: { x: 186, y: 174, size: '0.84rem' },
  Zaghouan: { x: 246, y: 146, size: '0.84rem' },

  /* Sahel */
  Sousse: { x: 304, y: 204, size: '0.86rem' },
  Monastir: { x: 342, y: 226, size: '0.76rem' },
  Mahdia: { x: 268, y: 284, size: '0.82rem' },

  /* Centre */
  Kairouan: { x: 238, y: 244, size: '1rem' },
  Kasserine: { x: 132, y: 262, size: '1rem' },
  'Sidi Bouzid': { x: 212, y: 328, size: '0.96rem' },
  Sfax: { x: 272, y: 334, size: '0.98rem' },

  /* South-west */
  Gafsa: { x: 140, y: 378, size: '0.98rem' },
  Tozeur: { x: 52, y: 438, size: '0.92rem' },

  /* South-east */
  Gabès: { x: 224, y: 442, size: '0.96rem' },
  Médenine: { x: 318, y: 510, size: '0.94rem' },
  Kébili: { x: 138, y: 520, size: '0.96rem' },
  Tataouine: { x: 232, y: 660, size: '1rem' },
}

function toPercentLabels(
  shapes: { name: string; cx: number; cy: number }[],
): { name: string; x: number; y: number }[] {
  return shapes.map((shape) => {
    const anchor = getMapAnchor(shape.name)
    return {
      name: shape.name,
      x: ((anchor?.x ?? shape.cx) / MAP_W) * 100,
      y: ((anchor?.y ?? shape.cy) / MAP_H) * 100,
    }
  })
}

/** Fixed label positions — used where auto-spread would drift labels off-map. */
export function getFixedMapLabels(
  shapes: { name: string; cx: number; cy: number }[],
): { name: string; x: number; y: number }[] {
  return toPercentLabels(shapes)
}

/** Carte page: fixed tuned anchors (auto-spread drifts coastal labels off-map). */
export function getCarteMapLabels(
  shapes: { name: string; cx: number; cy: number }[],
): { name: string; x: number; y: number }[] {
  return toPercentLabels(shapes)
}

export function getMapAnchor(name: string): { x: number; y: number } | null {
  const shape = MAP_SHAPES.find((s) => s.name === name)
  if (!shape) return null
  const style = MAP_LABEL_STYLES[name]
  return { x: style?.x ?? shape.cx, y: style?.y ?? shape.cy }
}

/** Nudge overlapping labels apart — used on programme, gouvernance, and carte maps. */
export function spreadMapLabels(
  shapes: { name: string; cx: number; cy: number }[],
  options?: { minX?: number; minY?: number; passes?: number },
): { name: string; x: number; y: number }[] {
  const placed = toPercentLabels(shapes)
  const minX = options?.minX ?? 11.5
  const minY = options?.minY ?? 3.2
  const passes = options?.passes ?? 5

  for (let pass = 0; pass < passes; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i]
        const b = placed[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        if (Math.abs(dx) >= minX || Math.abs(dy) >= minY) continue

        const pushX = (minX - Math.abs(dx)) * 0.5
        const pushY = (minY - Math.abs(dy)) * 0.55
        const sx = dx === 0 ? (a.x < 50 ? -1 : 1) : Math.sign(dx)
        const sy = dy === 0 ? 1 : Math.sign(dy)
        a.x = Math.min(91, Math.max(9, a.x - sx * pushX))
        b.x = Math.min(91, Math.max(9, b.x + sx * pushX))
        a.y = Math.min(93, Math.max(4, a.y - sy * pushY))
        b.y = Math.min(93, Math.max(4, b.y + sy * pushY))
      }
    }
  }

  return placed
}

/** Position the info box beside the selected governorate, not in a fixed corner. */
export function getTooltipPlacement(name: string): {
  left: string
  top: string
  transform: string
} | null {
  const anchor = getMapAnchor(name)
  if (!anchor) return null

  const leftPct = (anchor.x / MAP_W) * 100
  const topPct = (anchor.y / MAP_H) * 100

  const placeLeft = anchor.x > MAP_W * 0.52
  const placeAbove =
    anchor.y > MAP_H * 0.68 &&
    anchor.x > MAP_W * 0.32 &&
    anchor.x < MAP_W * 0.72

  let transform: string
  if (placeAbove) {
    transform = 'translate(-50%, calc(-100% - 1.4rem))'
  } else if (placeLeft) {
    transform = 'translate(calc(-100% - 1.4rem), -50%)'
  } else {
    transform = 'translate(1.4rem, -50%)'
  }

  return { left: `${leftPct}%`, top: `${topPct}%`, transform }
}
