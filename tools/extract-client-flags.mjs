import sharp from 'sharp'
import { copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, '../public/img/flags-pair-source.jpg')
const outDir = join(root, '../public/img')

const WHITE = 238

function isWhite(r, g, b) {
  return r >= WHITE && g >= WHITE && b >= WHITE
}

/** Remove only outer white — keeps TN white circle (not reachable from image edges). */
function keyOuterWhite(raw, width, height, channels) {
  const out = Buffer.alloc(width * height * 4)
  const edgeWhite = new Uint8Array(width * height)

  const queue = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const idx = y * width + x
    if (edgeWhite[idx]) return
    const i = idx * channels
    if (!isWhite(raw[i], raw[i + 1], raw[i + 2])) return
    edgeWhite[idx] = 1
    queue.push([x, y])
  }

  for (let x = 0; x < width; x++) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    push(0, y)
    push(width - 1, y)
  }

  while (queue.length) {
    const [x, y] = queue.pop()
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  for (let idx = 0; idx < width * height; idx++) {
    const i = idx * channels
    const o = idx * 4
    out[o] = raw[i]
    out[o + 1] = raw[i + 1]
    out[o + 2] = raw[i + 2]
    out[o + 3] = edgeWhite[idx] ? 0 : 255
  }

  return out
}

async function exportFlag(left, cropW, height, opaqueName, blendName) {
  const cropped = await sharp(src)
    .extract({ left, top: 0, width: cropW, height })
    .toBuffer()

  await sharp(cropped).webp({ quality: 96 }).toFile(join(outDir, `${opaqueName}.webp`))

  const { data, info } = await sharp(cropped)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const keyed = keyOuterWhite(data, info.width, info.height, info.channels)

  await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 96, alphaQuality: 100 })
    .toFile(join(outDir, `${blendName}.webp`))
}

const { width, height } = await sharp(src).metadata()
const mid = Math.floor(width / 2)

await exportFlag(0, mid - 8, height, 'flag-eu-client', 'flag-eu-client-blend')
await exportFlag(mid + 8, width - mid - 8, height, 'flag-tn-client', 'flag-tn-client-blend')

console.log('Client flags exported — opaque (header) + blend (footer)')
