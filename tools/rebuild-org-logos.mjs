/**
 * Rebuild institution logos from the supplied PDF PNGs.
 * Trim excess white only — do not flood-fill key white, which strips text
 * inside wide lockups (Observatoire, MESRS).
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

const ASSETS =
  'C:/Users/youss/.cursor/projects/c-Users-youss-OneDrive-Attachments-Desktop-fi2t-live-editor/assets'
const PREFIX =
  'c__Users_youss_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_'
const OUT = path.resolve('public/img')
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'orglogos-fix-'))

const LOGOS = {
  image42: 'org-jeunesse-sports',
  image43: 'org-economie-planification',
  image44: 'org-affaires-culturelles',
  image45: 'org-mesrs',
  image46: 'org-formation-emploi',
  image47: 'org-observatoire-jeunesse',
  image48: 'org-aneti',
  image49: 'org-anpr',
  image50: 'org-cgdr',
}

const INSETS = {
  'org-mesrs': 0.035,
  'org-observatoire-jeunesse': 0.04,
}

const MAX = 560

function find(number) {
  const hit = fs
    .readdirSync(ASSETS)
    .filter((name) => name.startsWith(PREFIX) && name.includes(`page1-${number}-`))
    .sort()[0]
  if (!hit) throw new Error(`missing source for ${number}`)
  return path.join(ASSETS, hit)
}

async function exportLogo(number, name) {
  let pipeline = sharp(find(number))
  const inset = INSETS[name]
  if (inset) {
    const meta = await sharp(find(number)).metadata()
    const dx = Math.round(meta.width * inset)
    const dy = Math.round(meta.height * inset)
    pipeline = sharp(find(number)).extract({
      left: dx,
      top: dy,
      width: meta.width - dx * 2,
      height: meta.height - dy * 2,
    })
  }

  const trimmed = await pipeline
    .flatten({ background: '#ffffff' })
    .trim({ threshold: 12 })
    .toBuffer({ resolveWithObject: true })

  const { data, info } = await sharp(trimmed.data)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (r < 248 || g < 248 || b < 248) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const cropW = maxX - minX + 1
  const cropH = maxY - minY + 1
  const cropped =
    cropW > 0 && cropH > 0
      ? await sharp(trimmed.data)
          .extract({ left: minX, top: minY, width: cropW, height: cropH })
          .toBuffer({ resolveWithObject: true })
      : trimmed

  const { width: cropWidth, height: cropHeight } = cropped.info
  const scale = cropWidth > MAX ? MAX / cropWidth : 1
  const outW = Math.round(cropWidth * scale)
  const outH = Math.round(cropHeight * scale)

  const buf = await sharp(cropped.data)
    .resize(outW, outH, { fit: 'fill' })
    .webp({ quality: 94, effort: 6 })
    .toBuffer()

  const outPath = path.join(TMP, `${name}.webp`)
  fs.writeFileSync(outPath, buf)
  return { name, width: outW, height: outH, bytes: buf.length }
}

const results = []
for (const [number, name] of Object.entries(LOGOS)) {
  try {
    results.push(await exportLogo(number, name))
  } catch (err) {
    console.error('failed', name, err.message)
  }
}

for (const { name } of results) {
  fs.copyFileSync(path.join(TMP, `${name}.webp`), path.join(OUT, `${name}.webp`))
}

console.log('TMP', TMP)
console.log(JSON.stringify(results, null, 2))
