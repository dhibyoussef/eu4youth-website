import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const base = 'http://127.0.0.1:3030'
const out = join(import.meta.dirname, 'typography-audit')
await mkdir(out, { recursive: true })

const paths = [
  ['Accueil', '/'],
  ['À propos', '/programme/a-propos'],
  ['Objectifs', '/programme/objectifs'],
  ['Financement', '/programme/financement'],
  ['Gouvernance', '/programme/gouvernance'],
  ['Projets', '/projets'],
  ['JeunESS', '/projets/jeuness'],
  ['GO4Youth', '/projets/go4youth'],
  ['SWAFY', '/projets/swafy'],
  ['Carte', '/carte'],
  ['Opportunités', '/opportunites'],
  ['Actualités', '/actualites'],
  ['Publications', '/publications'],
  ['Glossaire', '/glossaire'],
  ['Contact', '/contact'],
  ['Agenda', '/agenda'],
  ['Partenaires', '/partenaires'],
  ['Mécanismes', '/mecanismes-appui'],
  ['Stories', '/stories'],
  ['EU en Tunisie', '/eu-en-tunisie'],
  ['Coin média', '/coin-media'],
  ['Plan du site', '/plan-du-site'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const report = []

for (const [name, path] of paths) {
  const url = base + path
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(500)

    const metrics = await page.evaluate(() => {
      const px = (el) => {
        const s = getComputedStyle(el)
        return {
          fontSize: s.fontSize,
          lineHeight: s.lineHeight,
          textAlign: s.textAlign,
          marginBottom: s.marginBottom,
        }
      }

      const h1 = document.querySelector('h1')
      const h2 = document.querySelector('main h2, .page h2')
      const bodyPs = [...document.querySelectorAll('main p, .page p')]
        .filter((p) => {
          const t = (p.textContent || '').trim()
          if (t.length < 80) return false
          const s = getComputedStyle(p)
          return s.display !== 'none' && s.visibility !== 'hidden'
        })
        .slice(0, 6)
        .map((p) => ({
          text: (p.textContent || '').trim().slice(0, 70),
          ...px(p),
        }))

      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 4

      return {
        h1: h1 ? { text: (h1.textContent || '').trim().slice(0, 60), ...px(h1) } : null,
        h2: h2 ? { text: (h2.textContent || '').trim().slice(0, 60), ...px(h2) } : null,
        bodyPs,
        overflowX: overflow,
      }
    })

    const issues = []
    if (res?.status() !== 200) issues.push(`HTTP ${res?.status()}`)
    if (metrics.overflowX) issues.push('horizontal overflow')
    if (metrics.h1 && parseFloat(metrics.h1.fontSize) < 40) issues.push(`small h1 (${metrics.h1.fontSize})`)
    for (const p of metrics.bodyPs) {
      const size = parseFloat(p.fontSize)
      if (size < 18) issues.push(`small body (${p.fontSize}): ${p.text.slice(0, 40)}…`)
      if (p.textAlign === 'start' || p.textAlign === 'left') {
        issues.push(`left-aligned long text: ${p.text.slice(0, 40)}…`)
      }
    }

    report.push({ name, path, url, status: res?.status() ?? 0, ...metrics, issues })
    const slug = name.replace(/[^\w]+/g, '-').toLowerCase()
    await page.screenshot({ path: join(out, `${slug}.png`), fullPage: false })
  } catch (error) {
    report.push({ name, path, url, error: String(error), issues: ['load failed'] })
  }
}

await browser.close()
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2), 'utf8')

for (const row of report) {
  const flag = row.issues?.length ? row.issues.join('; ') : 'ok'
  const h1 = row.h1 ? `${row.h1.fontSize}/${row.h1.lineHeight}` : '—'
  const body = row.bodyPs?.[0] ? `${row.bodyPs[0].fontSize}/${row.bodyPs[0].lineHeight}` : '—'
  console.log(`${row.name.padEnd(16)} h1=${h1.padEnd(12)} body=${body.padEnd(12)} ${flag}`)
}
