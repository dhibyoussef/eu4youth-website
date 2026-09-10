import { useEffect } from 'react'

const PRODUCTION_ORIGIN = 'https://eu4youth.org'

type PageMetaProps = {
  title: string
  description: string
  pathname: string
  structuredData?: Record<string, unknown>
}

const setMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export default function PageMeta({
  title,
  description,
  pathname,
  structuredData,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | EU4Youth Tunisie`
    const canonicalUrl = `${PRODUCTION_ORIGIN}${pathname}`
    document.title = fullTitle
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl

    const scriptId = 'route-structured-data'
    document.getElementById(scriptId)?.remove()
    if (structuredData) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData)
      document.head.append(script)
    }

    return () => {
      document.getElementById(scriptId)?.remove()
    }
  }, [description, pathname, structuredData, title])

  return null
}
