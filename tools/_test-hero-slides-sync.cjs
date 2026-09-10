const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'out', 'cms-audit')

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
  fs.mkdirSync(OUT, { recursive: true })
  const token = await loginToken()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.goto(`http://localhost:3030/?edit_token=${token}&live_edit=1`, { waitUntil: 'networkidle' })
  await page.waitForSelector('body.cms-editing', { timeout: 20000 })

  const carouselImages = await page.evaluate(() =>
    [...document.querySelectorAll('.hero-carousel__slide img')].map((img) => img.getAttribute('src') || ''),
  )

  await page.locator('.hero-carousel__list .cms-list-trigger').click()
  await page.waitForSelector('.cms-list-panel', { timeout: 5000 })

  const panelImages = await page.evaluate(() =>
    [...document.querySelectorAll('.cms-list-panel__thumb')].map((img) => img.getAttribute('src') || ''),
  )

  const panelInputs = await page.evaluate(() =>
    [...document.querySelectorAll('.cms-list-panel__field--image input[type="text"], .cms-list-panel__field--image input:not([type])')]
      .map((input) => input.value)
      .filter(Boolean),
  )

  await page.screenshot({ path: path.join(OUT, 'hero-slides-modal.png') })

  const normalize = (url) => url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
  const carouselNorm = carouselImages.map(normalize)
  const panelNorm = (panelImages.length ? panelImages : panelInputs).map(normalize)

  const report = {
    carouselImages: carouselNorm,
    panelImages: panelNorm,
    match: carouselNorm.length === panelNorm.length && carouselNorm.every((v, i) => v === panelNorm[i]),
  }

  fs.writeFileSync(path.join(OUT, 'hero-slides-sync.json'), JSON.stringify(report, null, 2))
  console.log(report.match ? 'OK hero modal matches carousel' : 'FAIL hero mismatch', report)
  await browser.close()
  process.exit(report.match ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
