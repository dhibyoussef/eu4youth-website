/* Visual verification across Accueil and À propos.
 *
 * Walks every band that has ever been reported broken and reports concrete
 * failures: a control whose resting paint is a fill when it should be a stroke,
 * two siblings whose boxes overlap by more than a shared edge, an image that
 * never loaded, a card whose content spills past its own height, a sheet that
 * needs a scrollbar. Zero failures is the pass.
 */
import { chromium } from 'playwright'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'audit')
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 810 },
]

const fails = []
const notes = []

const fail = (msg) => fails.push(msg)
const note = (msg) => notes.push(msg)

const browser = await chromium.launch()

for (const viewport of VIEWPORTS) {
  const tag = `${viewport.width}x${viewport.height}`

  /* ---------------- Accueil ---------------- */
  {
    const page = await browser.newPage({ viewport })
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    page.on('requestfailed', (r) => {
      if (r.resourceType() === 'image' || r.resourceType() === 'stylesheet') {
        errs.push(`failed ${r.url()}`)
      }
    })
    await page.goto('http://localhost:3010/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(10, 10)
    await page.waitForTimeout(500)

    const hero = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('.hero__btn')].map((el) => {
        const s = getComputedStyle(el)
        return {
          fill: s.backgroundColor,
          ink: s.color,
          line: s.borderTopColor,
          transparent: s.backgroundColor === 'rgba(0, 0, 0, 0)',
        }
      })
      const body = document.querySelector('.hero__body').getBoundingClientRect()
      const first = document.querySelector('.hero__btn').getBoundingClientRect()
      const art = document.querySelector('.band__art')
      return {
        buttons,
        clearance: Math.round(first.top - body.bottom),
        art: { src: art.getAttribute('src'), ok: art.complete && art.naturalWidth > 0 },
      }
    })

    if (!hero.art.ok) fail(`${tag} hero art missing (${hero.art.src})`)
    if (hero.clearance < 8) fail(`${tag} hero body overlaps buttons (clearance ${hero.clearance}px)`)
    if (hero.buttons.length !== 3) fail(`${tag} hero has ${hero.buttons.length} buttons`)
    for (const [i, b] of hero.buttons.entries()) {
      if (!b.transparent) fail(`${tag} hero button ${i + 1} is filled at rest (${b.fill})`)
    }
    const same = hero.buttons.every(
      (b) =>
        b.fill === hero.buttons[0].fill &&
        b.ink === hero.buttons[0].ink &&
        b.line === hero.buttons[0].line,
    )
    if (!same) fail(`${tag} hero buttons are not identical at rest`)
    else note(`${tag} hero: 3 identical outlined buttons, body clear by ${hero.clearance}px`)

    await page.locator('.hero__btn').first().hover()
    await page.waitForTimeout(250)
    const hovered = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('.hero__btn'))
      return { fill: s.backgroundColor, ink: s.color }
    })
    if (hovered.fill === 'rgba(0, 0, 0, 0)') fail(`${tag} hero button does not fill on hover`)
    else note(`${tag} hero hover: fill ${hovered.fill}, ink ${hovered.ink}`)
    await page.mouse.move(10, 10)
    await page.waitForTimeout(200)

    /* Cards: no sibling overlap inside a card, no spill, every image loaded. */
    await page.locator('.band--streams').scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const cards = await page.evaluate(() => {
      const overlap = (a, b) => {
        const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        return x * y
      }
      return [...document.querySelectorAll('.card')].map((card, index) => {
        // Direct children of the head / foot / titles, plus the body, rules and
        // thumbnail — never a parent with its own child, which would always
        // "overlap" by nesting.
        const nodes = [
          card.querySelector('.card__thumb'),
          ...card.querySelectorAll('.card__titles > *, .card__logo, .card__rule, .card__body'),
          ...card.querySelectorAll('.card__foot > *'),
        ].filter(Boolean)
        const rects = nodes.map((el) => ({
          tag: el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
          r: el.getBoundingClientRect(),
          broken: el.tagName === 'IMG' && (!el.complete || el.naturalWidth === 0),
        }))
        const pairs = []
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            if (rects[i].tag.includes('card__rule') || rects[j].tag.includes('card__rule')) {
              continue
            }
            if (rects[i].tag.includes('card__thumb') || rects[j].tag.includes('card__thumb')) {
              continue
            }
            const area = overlap(rects[i].r, rects[j].r)
            if (area > 40) pairs.push([rects[i].tag, rects[j].tag, Math.round(area)])
          }
        }
        /* Clamped copy is copy the reader cannot get to: a line-clamped block whose
           content wants another line reports a scrollHeight a whole line taller than its
           box. Compared against a couple of pixels this reads every clamp as a failure,
           because the box a clamp computes rounds a fraction of a line short of the text
           it is showing in full — so the line itself is the unit. */
        const clipped = (sel) => {
          const el = card.querySelector(sel)
          if (!el) return false
          const line = parseFloat(getComputedStyle(el).lineHeight)
          return el.scrollHeight - el.clientHeight > line * 0.5
        }
        return {
          index,
          spill: Math.round(card.scrollHeight - card.clientHeight),
          broken: rects.filter((r) => r.broken).map((r) => r.tag),
          overlaps: pairs,
          titleClipped: clipped('.card__title'),
          bodyClipped: clipped('.card__body'),
          foot: Math.round(card.querySelector('.card__foot').getBoundingClientRect().height),
        }
      })
    })

    const oneRowFoot = Math.round(cards[0].foot)
    for (const card of cards) {
      if (card.spill > 2) fail(`${tag} card ${card.index} spills by ${card.spill}px`)
      if (card.broken.length) fail(`${tag} card ${card.index} broken images: ${card.broken}`)
      if (card.titleClipped) fail(`${tag} card ${card.index} title is truncated`)
      if (card.bodyClipped) fail(`${tag} card ${card.index} body is truncated`)
      if (card.foot > oneRowFoot * 1.6) {
        fail(`${tag} card ${card.index} foot wrapped to ${card.foot}px`)
      }
      for (const [a, b, area] of card.overlaps) {
        fail(`${tag} card ${card.index} overlap ${a} ∩ ${b} = ${area}px²`)
      }
    }
    if (
      !cards.some(
        (c) =>
          c.overlaps.length || c.spill > 2 || c.broken.length || c.titleClipped || c.bodyClipped,
      )
    ) {
      note(`${tag} cards: ${cards.length} clean — nothing truncated, overlapping or spilling`)
    }

    await page.locator('.band--streams').screenshot({ path: join(OUT, `cards-${tag}.png`) })
    await page.screenshot({ path: join(OUT, `home-${tag}.png`) })

    for (const e of errs) fail(`${tag} console: ${e}`)
    await page.close()
  }

  /* ---------------- À propos ---------------- */
  {
    const page = await browser.newPage({ viewport })
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    await page.goto('http://localhost:3010/programme/a-propos', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(10, 10)
    await page.waitForTimeout(500)

    const hero = await page.evaluate(() =>
      [...document.querySelectorAll('.ap-hero__actions .btn')].map((el) => {
        const s = getComputedStyle(el)
        return s.backgroundColor === 'rgba(0, 0, 0, 0)'
      }),
    )
    if (hero.some((t) => !t)) fail(`${tag} à-propos hero has a filled button at rest`)
    else note(`${tag} à-propos hero: ${hero.length} outlined buttons`)

    await page.locator('.ap-vision').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const plate = await page.evaluate(() => {
      const band = document.querySelector('.ap-vision')
      const bg = getComputedStyle(band).backgroundImage
      return { bg, hasPlate: bg.includes('apropos-vision-plate-v2') }
    })
    if (!plate.hasPlate) fail(`${tag} vision band still on old plate`)
    await page.locator('.ap-vision').screenshot({ path: join(OUT, `vision-${tag}.png`) })

    /* Every overlay. */
    const openers = [
      ['.ap-projets__logos .ap-logo', 0, 'projet'],
      ['.ap-vision .readmore__toggle', 0, 'vision'],
      ['.ap-kpi__open', 0, 'chart'],
    ]
    for (const [sel, i, name] of openers) {
      await page.locator(sel).nth(i).click()
      await page.waitForTimeout(400)
      const fit = await page.evaluate(() => {
        const card = document.querySelector('.sheet__card')
        const sheet = document.querySelector('.sheet')
        const r = card.getBoundingClientRect()
        return {
          cardScrolls: card.scrollHeight > card.clientHeight + 1,
          sheetScrolls: sheet.scrollHeight > sheet.clientHeight + 1,
          top: Math.round(r.top),
          bottom: Math.round(window.innerHeight - r.bottom),
        }
      })
      if (fit.cardScrolls || fit.sheetScrolls || fit.top < 0 || fit.bottom < 0) {
        fail(`${tag} sheet ${name} does not fit: ${JSON.stringify(fit)}`)
      } else {
        note(`${tag} sheet ${name}: fits`)
      }
      if (viewport.width === 1440) {
        await page.screenshot({ path: join(OUT, `sheet-${name}-${tag}.png`) })
      }
      await page.keyboard.press('Escape')
      await page.waitForTimeout(220)
    }

    for (const e of errs) fail(`${tag} console: ${e}`)
    await page.close()
  }
}

await browser.close()

const report = [
  `# Visual verification`,
  ``,
  fails.length ? `## FAIL (${fails.length})` : `## PASS`,
  ...fails.map((f) => `- ${f}`),
  ``,
  `## Notes`,
  ...notes.map((n) => `- ${n}`),
  ``,
].join('\n')

writeFileSync(join(OUT, 'verify.md'), report)
console.log(report)
process.exit(fails.length ? 1 : 0)
