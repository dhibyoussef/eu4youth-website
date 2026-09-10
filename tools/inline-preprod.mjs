import fs from 'node:fs'
import path from 'node:path'

/**
 * Pack the Vite build into a single index.html.
 * Prodexo currently serves that one file for every /eu4youth/* URL,
 * including .js and images, so a normal dist cannot boot.
 */
const dist = path.resolve('dist')
const mimeByExt = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

function publicUrl(abs) {
  return `/eu4youth/${path.relative(dist, abs).replaceAll('\\', '/')}`
}

function dataUri(abs) {
  const ext = path.extname(abs).toLowerCase()
  const mime = mimeByExt[ext]
  if (!mime) return null
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`
}

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

html = html.replace(
  /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_match, href) => {
    const file = path.join(dist, href.replace(/^\/eu4youth\//, ''))
    return `<style>${fs.readFileSync(file, 'utf8')}</style>`
  },
)

html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
  (_match, src) => {
    const file = path.join(dist, src.replace(/^\/eu4youth\//, ''))
    return `<script type="module">${fs.readFileSync(file, 'utf8')}</script>`
  },
)

const assetMap = {}
for (const file of walk(dist)) {
  const rel = path.relative(dist, file).replaceAll('\\', '/')
  if (rel === 'index.html' || rel.startsWith('assets/')) continue
  const uri = dataUri(file)
  if (!uri) continue
  assetMap[publicUrl(file)] = uri
}

const urls = Object.keys(assetMap).sort((a, b) => b.length - a.length)

function applyAssets(text) {
  let next = text
  for (const url of urls) next = next.split(url).join(assetMap[url])
  return next
}

html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_match, css) => `<style>${applyAssets(css)}</style>`)
html = html.replace(
  /(href|src)="(\/eu4youth\/[^"]+)"/g,
  (match, attr, url) => {
    const mapped = assetMap[url.split('?')[0]]
    return mapped ? `${attr}="${mapped}"` : match
  },
)

const interceptor = `<script>
window.__EU4YOUTH_ASSETS__=${JSON.stringify(assetMap)};
(function(){
  var map = window.__EU4YOUTH_ASSETS__ || {};
  function resolve(value) {
    if (typeof value !== "string" || value.indexOf("/eu4youth/") === -1) return value;
    try {
      var assetPath = new URL(value, location.origin).pathname;
      if (map[assetPath]) return map[assetPath];
    } catch (e) {}
    var bare = value.split("?")[0];
    return map[bare] || value;
  }
  var setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (name === "src" || name === "href" || name === "poster") value = resolve(value);
    return setAttribute.call(this, name, value);
  };
  function patch(ctor, prop) {
    var desc = Object.getOwnPropertyDescriptor(ctor.prototype, prop);
    if (!desc || !desc.set) return;
    Object.defineProperty(ctor.prototype, prop, {
      configurable: true,
      enumerable: desc.enumerable,
      get: desc.get,
      set: function(value) { desc.set.call(this, resolve(value)); }
    });
  }
  patch(HTMLImageElement, "src");
  patch(HTMLScriptElement, "src");
  patch(HTMLLinkElement, "href");
  patch(HTMLAnchorElement, "href");
  patch(HTMLSourceElement, "src");
})();
</script>`

html = html.replace('<head>', `<head>${interceptor}`)

fs.writeFileSync(path.join(dist, 'index.html'), html)
const sizeMb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(1)
console.log(`inlined ${urls.length} files into dist/index.html (${sizeMb} MB)`)
