/**
 * Composante marks — graphic brief:
 * - Jeun'ESS only: pre-existing composante logos (markUrl images).
 * - Every other project: show the composante **name** (no invented logos).
 */
export function buildComposanteMarkSvg(_theme: string, _name: string): string | null {
  return null
}

export function hasComposanteMark(theme: string, _name: string, markUrl?: string): boolean {
  return theme === 'jeuness' && Boolean(markUrl)
}
