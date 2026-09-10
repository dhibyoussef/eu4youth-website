import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#003399"/>${stars}</svg>`
}

const tnSvg = readFileSync('public/img/flag-tunisie.svg')
writeFileSync('public/img/flag-ue.svg', euSvg(60, 40))

const tn = await sharp(tnSvg, { density: 400 }).resize(360, 240, { fit: 'fill' }).png().toBuffer()
const ue = await sharp(Buffer.from(euSvg(600, 400))).resize(360, 240).png().toBuffer()
await sharp(tn).webp({ quality: 97 }).toFile('public/img/org-tunisie.webp')
await sharp(ue).webp({ quality: 97 }).toFile('public/img/org-ue.webp')
await sharp({ create: { width: 780, height: 272, channels: 3, background: '#ffffff' } })
  .composite([
    { input: tn, left: 20, top: 16 },
    { input: ue, left: 400, top: 16 },
  ])
  .webp({ quality: 97 })
  .toFile('public/img/partners-flags.webp')
console.log('flags ok')
