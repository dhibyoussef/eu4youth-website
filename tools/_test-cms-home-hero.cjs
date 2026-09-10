const { chromium } = require('playwright')

async function loginToken() {
  const login = await fetch('http://localhost:8040/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eu4youth.org', password: 'eu4youth' }),
  }).then((r) => r.json())
  const edit = await fetch('http://localhost:8040/api/admin/edit-session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' },
    body: '{}',
  }).then((r) => r.json())
  return edit.token
}

async function main() {
  const token = await loginToken()
  const login = await fetch('http://localhost:8040/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eu4youth.org', password: 'eu4youth' }),
  }).then((r) => r.json())

  const matrix = await fetch('http://localhost:8040/api/admin/content/matrix?page=home', {
    headers: { Authorization: `Bearer ${login.token}` },
  }).then((r) => r.json())

  const hero = matrix.sections?.find((s) => s.name === 'hero')
  const heroKeys = hero?.blocks?.map((b) => b.key) || []
  const retired = ['image', 'slide2', 'slide3', 'slide4', 'slide5']
  const visibleInMatrix = heroKeys.filter((k) => !retired.includes(k))
  console.log('Matrix hero keys (raw):', heroKeys.join(', '))
  console.log('Expected live keys include slides:', heroKeys.includes('slides'))

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.goto(`http://localhost:3040/content?page=home`, { waitUntil: 'networkidle' })

  // CMS admin may need login
  const needsLogin = await page.locator('input[type="email"]').count()
  if (needsLogin) {
    await page.fill('input[type="email"]', 'admin@eu4youth.org')
    await page.fill('input[type="password"]', 'eu4youth')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {})
    await page.goto(`http://localhost:3040/content?page=home`, { waitUntil: 'networkidle' })
  }

  await page.waitForTimeout(2000)
  const hasSlidesInList = await page.getByText('Photographies du bandeau').count()
  const legacyCount = await page.getByText('Photo 2 du carrousel').count()
  console.log('CMS list has Photographies du bandeau:', hasSlidesInList > 0)
  console.log('CMS list legacy Photo 2 field hidden:', legacyCount === 0)

  await browser.close()
  process.exit(hasSlidesInList > 0 && legacyCount === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
