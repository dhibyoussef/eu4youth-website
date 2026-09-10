import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Prefix /img and /docs strings so the SPA works under /eu4youth/ on Prodexo. */
function prefixPublicAssets(base: string): Plugin {
  const prefix = base.endsWith('/') ? base : `${base}/`
  return {
    name: 'prefix-public-assets',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0].replaceAll('\\', '/')
      if (file.includes('node_modules') || !file.includes('/src/')) return null
      let next = code
      next = next.replaceAll('`/img/', `\`${prefix}img/`)
      next = next.replaceAll('`/docs/', `\`${prefix}docs/`)
      next = next.replace(/(['"])\/((?:img|docs)\/[^'"]+)\1/g, `$1${prefix}$2$1`)
      if (file.endsWith('.css')) {
        next = next.replaceAll("url('/img/", `url('${prefix}img/`)
        next = next.replaceAll('url("/img/', `url("${prefix}img/`)
        next = next.replaceAll('url(/img/', `url(${prefix}img/`)
      }
      return next === code ? null : next
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const base = env.VITE_BASE || '/'
  return {
    base,
    plugins: [react(), prefixPublicAssets(base)],
    server: {
      // Prefer the configured development port, but let Vite choose the next available port.
      port: Number(env.VITE_PORT || env.PORT || 3030),
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8040',
          changeOrigin: true,
        },
      },
    },
  }
})
