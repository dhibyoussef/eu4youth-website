import { chromium } from 'playwright'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const unexpectedSubmissions = []
const failures = []

page.on('request', (request) => {
  if (request.method() === 'POST') unexpectedSubmissions.push(request.url())
})

await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' })
await page.locator('input[name="lastName"]').fill('Test')
await page.locator('input[name="firstName"]').fill('Audit')
await page.locator('input[name="email"]').fill('audit@example.invalid')
await page.locator('select[name="profile"]').selectOption({ index: 1 })
await page.locator('select[name="project"]').selectOption({ index: 1 })
await page.locator('select[name="requestType"]').selectOption({ index: 1 })
await page.locator('textarea[name="subject"]').fill('Test automatique')
await page.locator('textarea[name="message"]').fill('Ce message vérifie uniquement l’état non configuré.')
await page.locator('input[name="consent"]').check()
await page.locator('.contact-submit').click()
const contactStatus = await page.locator('.contact-status').textContent()
if (!contactStatus?.includes('pas encore connecté')) {
  failures.push(`Unexpected contact status: ${contactStatus}`)
}

await page.goto(baseUrl, { waitUntil: 'networkidle' })
const newsletter = page.locator('.news__form')
await newsletter.locator('input[name="email"]').fill('audit@example.invalid')
await newsletter.locator('button[type="submit"]').click()
const newsletterStatus = await newsletter.locator('.news__status').textContent()
if (!newsletterStatus?.includes('pas encore connecté')) {
  failures.push(`Unexpected newsletter status: ${newsletterStatus}`)
}

await newsletter.locator('input[name="email"]').fill('bot@example.invalid')
await newsletter.locator('input[name="website"]').fill('https://spam.invalid')
await newsletter.locator('button[type="submit"]').click()
const trappedStatus = await newsletter.locator('.news__status').textContent()
if (!trappedStatus?.includes('confirmée')) {
  failures.push(`Honeypot did not return the neutral success state: ${trappedStatus}`)
}
if (unexpectedSubmissions.length) {
  failures.push(`Unexpected POST requests: ${unexpectedSubmissions.join(', ')}`)
}

await browser.close()
console.log(
  JSON.stringify(
    {
      checks: 3,
      passing: 3 - failures.length,
      failures,
    },
    null,
    2,
  ),
)
if (failures.length) process.exitCode = 1
