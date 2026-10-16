import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dominio público de la página. Solo lo usan las metas para compartir (og:image necesita una URL
// absoluta): en index.html aparece como %SITIO%. Cambiarlo aquí basta.
const SITIO = 'https://balance-obras.vercel.app'

// Lo que pinta la portada y no debe esperar a que el JS arranque para empezar a bajar:
// Archivo expandida (titulares), Inter (texto) y Michroma (etiquetas y cotas).
const FUENTES_PRECARGA = /(archivo-expandida-latin-wght|inter-latin-wght-normal|michroma-latin-400-normal|instrument-serif-latin-400-(?:normal|italic))-[\w-]+\.woff2$/

function metasDelSitio() {
  return {
    name: 'balance-metas',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITIO%', SITIO) },
  }
}

/** El HTML pide las fuentes de la portada en paralelo con el JS, sin esperar a que este arranque. */
function precargarFuentes() {
  return {
    name: 'balance-precarga-fuentes',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html, { bundle }) =>
        Object.values(bundle ?? {})
          .filter((archivo) => archivo.type === 'asset' && FUENTES_PRECARGA.test(archivo.fileName))
          .map(({ fileName }) => ({
            tag: 'link',
            injectTo: 'head',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${fileName}` },
          })),
    },
  }
}

export default defineConfig({
  plugins: [react(), metasDelSitio(), precargarFuentes()],
  // Una caché por servidor (BAL_CACHE=.vite-algo): así pueden correr varios a la vez sin pisarse.
  cacheDir: process.env.BAL_CACHE || 'node_modules/.vite',
  build: {
    // Los archivos con hash van a /static/: vercel.json les pide al navegador guardarlos un año.
    assetsDir: 'static',
    rollupOptions: {
      // main.jsx importa App.jsx en diferido (por el modo ?solo= de desarrollo); en producción
      // va todo en un solo archivo JS, sin viajes de más.
      output: { inlineDynamicImports: true },
    },
  },
})
