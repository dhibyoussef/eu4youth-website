/**
 * Fit web-font weight/tracking to the comps and derive each block's CSS `top`.
 *
 * Two problems this solves:
 *
 * 1. The PDFs embed subsets whose names ("Changa-Regular") do not describe the
 *    weight actually drawn, so the reliable signal is advance width: render
 *    each measured string and search for the (weight, letter-spacing) pair
 *    whose width matches the PDF. Only strings that fill their line naturally
 *    are usable — justified lines are stretched by the layout engine — so this
 *    list uses last lines and headings.
 *
 * 2. Turning a measured position into a CSS `top`. A PDF span's y is an em-box
 *    top, which sits well above the glyphs — around 0.58em for Changa caps — so
 *    it cannot be used directly. Instead `align.py --emit` measures where the
 *    ink actually starts in the comp, and this subtracts the browser's own ink
 *    offset for that face, size and line-height. Because the offset is measured
 *    for the exact string, accents such as the É in "INFORMÉ" are accounted for.
 *
 * Usage:
 *   python tools/align.py --emit Accueil-p1   # once, to measure the comp
 *   node tools/calibrate.mjs
 */

import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const INK = JSON.parse(
  readFileSync(
    join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'geometry', 'ink-Accueil-p1.json'),
    'utf-8'
  )
)

// label, family, size, target width, exact string, pdf ink y, line-height px
const SAMPLES = [
  ['hero badge', 'Changa', 27, 715.7, 'LA JEUNESSE TUNISIENNE PORTE LES SOLUTIONS DE DEMAIN.', 360.3, 27],
  ['hero headline', 'Changa', 73, 669.1, 'et leur engagement.', 419.6, 87.6],
  ['chiffres title', 'Changa', 115, 1197.7, 'EU4YOUTH EN CHIFFRES', 1496.8, 138],
  ['chiffres period', 'Changa', 50, 311.8, '2019 – 2027', 1637.5, 60],
  ['kpi value', 'Changa', 50, 141.0, '60 M€', 1837.7, 60],
  ['kpi label', 'Changa', 50, 358.1, 'GOUVERNORATS', 1897.7, 60],
  ['projets title', 'Changa', 115, 628.6, 'SIX PROJETS', 2347.4, 138],
  ['projets subtitle', 'Changa', 79, 805.1, 'UNE VISION COMMUNE.', 2486.2, 94.8],
  ['map title', 'Changa', 141, 666.4, 'EU4YOUTH', 3252.4, 169.2],
  ['map subtitle', 'Changa', 74, 674.2, 'PARTOUT EN TUNISIE', 3423.2, 88.8],
  ['stories eyebrow', 'Changa', 60, 476.2, 'YOUTH PORTRAITS', 6377.0, 72],
  ['stories headline', 'Changa', 86, 426.4, 'CHANGENT.', 6448.4, 103.2],
  ['pubs title', 'Changa', 115, 723.7, 'PUBLICATIONS', 7661.2, 138],
  ['news title', 'Changa', 108, 957.1, 'RESTEZ INFORMÉ.ES', 8672.8, 108],
  ['footer head', 'Changa', 36, 390.9, 'INFORMATIONS LÉGALES', 9700.3, 43.2],

  ['hero body', 'Poppins', 22, 661.6, 'ou votre gouvernorat. EU4Youth Tunisie vous accompagne.', 813.2, 26.4],
  ['projets body', 'Poppins', 32, 966.1, 'citoyenne, en passant par la culture, le sport et les sciences.', 2633.8, 38.4],
  ['map body', 'Poppins', 32, 482.6, '24 gouvernorats de la Tunisie.', 3551.4, 38.4],
  ['pubs body', 'Poppins', 32, 666.2, 'librement les documents du programme.', 7994.8, 38.4],
  ['news body', 'Poppins', 32, 501.4, 'jeunes tunisiennes et tunisiens.', 8844.1, 38.4],
  ['news legal', 'Poppins', 21, 559.1, 'Vos données ne seront pas partagées avec des tiers.', 9200.6, 25.2],
  ['footer link', 'Poppins', 34, 549.9, 'Financement Union européenne', 9757.6, 48],
  ['footer disclaimer', 'Poppins', 21, 727.3, 'et ne reflète pas nécessairement les opinions de l’Union européenne.', 10171.5, 25.2],

  ['hero cta 1', 'Barlow', 22, 202.1, 'Découvrir les projets', 942.9, 22],
  ['map cta', 'Barlow', 32, 234.7, 'Explorer la carte', 3921.6, 32],
  ['stories cta', 'Barlow', 32, 391.0, 'Découvrir toutes les stories', 6881.6, 32],
  ['pubs cta', 'Barlow', 32, 471.4, 'Accéder à toutes les publications', 8230.7, 32],
  ['news field', 'Barlow', 32, 293.2, 'Votre adresse e-mail', 9081.9, 32],
]

// Poppins is the one family whose embedded subset names are trustworthy, so
// its weights come from the PDF rather than from the width search.
const PINNED = { Poppins: 500, 'hero body': 600 }

// Several (weight, tracking) pairs can hit a target width exactly, so the
// candidates are ordered by how plausible they are as an authored value and a
// challenger must beat the incumbent by a clear margin to win. Ties therefore
// collapse onto the round numbers a designer would actually have set.
const WEIGHTS = [700, 500, 600, 400, 800, 300]
const TRACKING = [0]
for (let step = 1; step <= 80; step++) {
  TRACKING.push(Number((step / 1000).toFixed(3)))
  if (step <= 20) TRACKING.push(Number((-step / 1000).toFixed(3)))
}
const MARGIN = 0.2 // px

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 600 } })

await page.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Changa:wght@200..800&family=Poppins:wght@300;400;500;600;700;800&family=Barlow:wght@400;500;600;700;800;900&display=swap">
<style>body{margin:0}#probe{position:absolute;white-space:pre;visibility:hidden}</style>
</head><body><span id="probe"></span><canvas id="c"></canvas></body></html>`)
await page.evaluate(() => document.fonts.ready)
// Google serves the faces lazily; force each one to load before measuring.
await page.evaluate(async () => {
  for (const family of ['Changa', 'Poppins', 'Barlow']) {
    for (const weight of [300, 400, 500, 600, 700, 800]) {
      await document.fonts.load(`${weight} 100px ${family}`)
    }
  }
})

console.log(
  'element'.padEnd(19) +
    'weight'.padStart(7) +
    'tracking'.padStart(10) +
    'err'.padStart(7) +
    'ink top'.padStart(10) +
    'css top'.padStart(10) +
    'rem'.padStart(9)
)

for (const [label, family, size, target, text, , lineHeight] of SAMPLES) {
  const measured = INK[label]
  if (!measured) {
    console.log(`${label.padEnd(19)}  no ink measurement — run align.py --emit`)
    continue
  }

  const pinned = PINNED[label] ?? PINNED[family]
  const weights = pinned ? [pinned] : WEIGHTS
  let best = null

  for (const weight of weights) {
    for (const tracking of TRACKING) {
      const width = await page.evaluate(
        ([family, size, weight, tracking, text]) => {
          const probe = document.getElementById('probe')
          probe.style.font = `${weight} ${size}px ${family}`
          probe.style.letterSpacing = `${tracking}em`
          probe.textContent = text
          return probe.getBoundingClientRect().width
        },
        [family, size, weight, tracking, text]
      )
      // CSS adds tracking after the last glyph; the PDF advance sum does not.
      const effective = width - tracking * size
      const err = Math.abs(effective - target)
      if (!best || err < best.err - MARGIN) best = { weight, tracking, err }
    }
  }

  // Where the glyph ink starts inside a line box of the given height.
  const inkOffset = await page.evaluate(
    ([family, size, weight, text, lineHeight]) => {
      const ctx = document.getElementById('c').getContext('2d')
      ctx.font = `${weight} ${size}px ${family}`
      const metrics = ctx.measureText(text)
      const emAscent = metrics.fontBoundingBoxAscent
      const emDescent = metrics.fontBoundingBoxDescent
      const halfLeading = (lineHeight - (emAscent + emDescent)) / 2
      return halfLeading + emAscent - metrics.actualBoundingBoxAscent
    },
    [family, size, best.weight, text, lineHeight]
  )

  const cssTop = measured.inkTop - inkOffset
  console.log(
    label.padEnd(19) +
      String(best.weight).padStart(7) +
      best.tracking.toFixed(3).padStart(10) +
      best.err.toFixed(2).padStart(7) +
      measured.inkTop.toFixed(1).padStart(10) +
      cssTop.toFixed(1).padStart(10) +
      (cssTop / 10).toFixed(2).padStart(9)
  )
}

await browser.close()
