/**
 * Prefixes an asset path with Vite's BASE_URL so images work when the app is hosted
 * under a sub-folder (e.g. `/eu4youth/` on preprod).
 */
export function assetUrl(path: string): string {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const cleaned = path.startsWith('/') ? path : `/${path}`

  // If the CMS/API already returned an URL that is already rooted at BASE_URL
  // (e.g. `/eu4youth/img/...` on preprod), avoid double-prefixing it to
  // `/eu4youth/eu4youth/img/...`.
  if (base && (cleaned === base || cleaned.startsWith(`${base}/`))) return cleaned

  return `${base}${cleaned}`
}

