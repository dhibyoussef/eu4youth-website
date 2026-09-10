const input = process.argv[2] ?? process.env.DEPLOYMENT_URL

if (!input) {
  console.error(
    'Usage: node tools/deployment-audit.mjs https://deployment.example\n' +
      'Or set DEPLOYMENT_URL.',
  )
  process.exit(2)
}

const baseUrl = new URL(input)
const local = ['localhost', '127.0.0.1'].includes(baseUrl.hostname)
if (!local && baseUrl.protocol !== 'https:') {
  console.error('Production deployment audits require HTTPS.')
  process.exit(2)
}

const failures = []
const checks = []

async function request(path, label) {
  try {
    const response = await fetch(new URL(path, baseUrl), {
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    })
    checks.push(label)
    if (!response.ok) failures.push(`${label}: HTTP ${response.status}`)
    return response
  } catch (error) {
    checks.push(label)
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

const home = await request('/', 'homepage availability')
const homeHtml = home ? await home.text() : ''
if (home && !homeHtml.includes('id="root"')) {
  failures.push('homepage availability: React root is absent')
}

if (home && !local) {
  const expectedHeaders = {
    'content-security-policy': ['default-src', "frame-ancestors 'none'"],
    'referrer-policy': ['strict-origin-when-cross-origin'],
    'strict-transport-security': ['max-age=31536000'],
    'x-content-type-options': ['nosniff'],
    'x-frame-options': ['DENY'],
    'permissions-policy': ['camera=()'],
  }
  for (const [header, fragments] of Object.entries(expectedHeaders)) {
    checks.push(`security header: ${header}`)
    const value = home.headers.get(header) ?? ''
    for (const fragment of fragments) {
      if (!value.includes(fragment)) {
        failures.push(`security header: ${header} is missing "${fragment}"`)
      }
    }
  }
}

const deepLink = await request('/programme/a-propos', 'SPA deep link')
if (deepLink && !(await deepLink.text()).includes('id="root"')) {
  failures.push('SPA deep link: deployment did not return the application shell')
}

const robots = await request('/robots.txt', 'robots.txt')
if (robots) {
  const body = await robots.text()
  if (!body.includes('User-agent:') || !body.includes('Sitemap:')) {
    failures.push('robots.txt: expected crawler and sitemap directives are absent')
  }
  if (!(robots.headers.get('content-type') ?? '').includes('text/plain')) {
    failures.push('robots.txt: incorrect content type')
  }
}

const sitemap = await request('/sitemap.xml', 'sitemap.xml')
if (sitemap && !(await sitemap.text()).includes('<urlset')) {
  failures.push('sitemap.xml: URL set is absent')
}

const health = await request('/health.json', 'static health endpoint')
if (health) {
  try {
    const payload = await health.json()
    if (payload.status !== 'ok' || payload.service !== 'eu4youth-web') {
      failures.push('static health endpoint: unexpected payload')
    }
  } catch {
    failures.push('static health endpoint: response is not JSON')
  }
}

const assetPath = homeHtml.match(/\/assets\/[^"' ]+\.(?:js|css)/)?.[0]
if (!assetPath) {
  failures.push('immutable asset caching: no hashed asset found in homepage HTML')
} else {
  const asset = await request(assetPath, 'immutable asset caching')
  if (asset && !local) {
    const cacheControl = asset.headers.get('cache-control') ?? ''
    if (!cacheControl.includes('max-age=31536000') || !cacheControl.includes('immutable')) {
      failures.push('immutable asset caching: expected one-year immutable policy')
    }
  }
}

console.log(
  JSON.stringify(
    {
      deployment: baseUrl.origin,
      checks: checks.length,
      passing: checks.length - failures.length,
      failures,
    },
    null,
    2,
  ),
)

if (failures.length) process.exitCode = 1
