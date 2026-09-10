import sharp from 'sharp'
import { writeFileSync } from 'fs'

function starPoints(x, y, r) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 === 0 ? r : r * 0.382
    pts.push(`${(x + rad * Math.cos(a)).toFixed(2)},${(y + rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

function euSvg(w, h) {
  const cx = w / 2
  const cy = h / 2
  const R = w * 0.2
  const sr = w * 0.07
  let stars = ''
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + i * (Math.PI / 6)
    const x = cx + R * Math.cos(a)
    const y = cy + R * Math.sin(a)
    stars += `<polygon fill="#FFCC00" points="${starPoints(x, y, sr)}"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="European Union"><rect width="${w}" height="${h}" fill="#003399"/>${stars}</svg>`
}

const svg60 = euSvg(60, 40)
writeFileSync('public/img/flag-ue.svg', svg60)

const svgHi = Buffer.from(euSvg(600, 400))
await sharp(svgHi).resize(320, 213).webp({ quality: 96 }).toFile('public/img/org-ue.webp')
await sharp(svgHi).resize(320, 213).png().toFile('public/img/_probe-ue2.png')

const tn = await sharp('public/img/flag-tunisie.svg', { density: 400 })
  .resize(320, 213, { fit: 'fill' })
  .png()
  .toBuffer()
const ue = await sharp(svgHi).resize(320, 213).png().toBuffer()
await sharp({ create: { width: 700, height: 245, channels: 3, background: '#ffffff' } })
  .composite([
    { input: tn, left: 20, top: 16 },
    { input: ue, left: 360, top: 16 },
  ])
  .webp({ quality: 96 })
  .toFile('public/img/partners-flags.webp')

async function crop(src, out, region) {
  const buf = await sharp(`public/img/project-banners/${src}`)
    .extract(region)
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer()
  await sharp(buf)
    .trim({ threshold: 12 })
    .extend({ top: 14, bottom: 14, left: 18, right: 18, background: '#ffffff' })
    .webp({ quality: 95 })
    .toFile(`public/img/${out}`)
  console.log('ok', out)
}

/* FIIAPP: earlier slot with full word — widen past previous crop */
await crop('maghroumin-strip.png', 'org-fiiapp.webp', {
  left: 720,
  top: 8,
  width: 220,
  height: 175,
})

/* CILG from probes — try VNG International cell */
await crop('fe3ila-strip.png', 'org-cilg-vng.webp', {
  left: 399,
  top: 10,
  width: 300,
  height: 175,
})

console.log('done')
