# Balance Obras Civiles — página web

Página de **Balance — Obras Civiles** («Ingeniería · Construcción · Remodelación»): una sola página
con la historia de una obra contada con el scroll («De plano a realidad»), servicios, portafolio de
obras, proceso, un cotizador que arma el mensaje de WhatsApp y el contacto.

Es una **vista previa**: no se indexa (`noindex` en `index.html`, `public/robots.txt` y
`vercel.json`). Las fotos son **referenciales** hasta que lleguen las de las obras reales: cada una
lleva la etiqueta «Imagen referencial» y su crédito sale en el pie («Créditos de imágenes»).

- Vite 7 + React 19 + Tailwind 3.4 (compilado) + framer-motion 12 (`LazyMotion`, `m.*`) + Lenis + lucide-react.
- Fuentes autoalojadas (fontsource, solo latín): Archivo expandida (titulares), Michroma (etiquetas y
  cotas), Inter (texto).
- Logo recreado en SVG a partir de la maqueta (`src/components/logoTrazos.js`).

## Cómo correrlo

```bash
npm install
npm run dev                 # http://localhost:5173
npm run build               # dist/ (lo que se publica)
npm run preview             # sirve dist/ para revisarlo
npm run test:whatsapp       # comprueba los mensajes de WhatsApp con node
```

Parámetros de la URL (solo en desarrollo, salvo los de la intro):

| URL | Qué hace |
|---|---|
| `/?sinintro=1` | la página sin la intro |
| `/?intro=1` | fuerza la intro (sale solo en la 1.ª visita de la sesión) |
| `/?solo=Portada,Plano` | monta solo esas secciones de `src/sections/` (con todos los proveedores) |
| `/?solo=Muestrario` | el muestrario de la base: logo, tipografías, botones, iconos, retícula, cotas… |

Capturas para revisar (levanta Vite con su propia caché, recorre, junta errores y desbordes y lo apaga):

```bash
python scripts/capturar.py --puerto 5210 --cache .vite-base --ruta "?sinintro=1" --anchos 390x844,1440x900 --pasos 6
python scripts/capturar.py --sin-servidor --puerto 5210 --ruta "?solo=Plano"   # contra un Vite ya abierto
```

En Windows, antes de los scripts de Python: `set PYTHONIOENCODING=utf-8` (o `PYTHONIOENCODING=utf-8 python …` en Git Bash).

## Dónde está cada cosa

```
src/data/balance.js      TODO el texto y los datos del negocio. Lo dudoso lleva «// POR CONFIRMAR».
src/data/obras.js        el portafolio (obras de ejemplo hasta que lleguen las reales)
src/data/fotos.json      manifiesto de fotos (lo escribe scripts/optimizar_fotos.py: no se edita a mano)
src/data/videos.json     manifiesto de videos (ídem)
src/components/          piezas compartidas: Logo, Foto, Video, Reticula, Cota, Polvo, LineaLaser…
src/lib/                 whatsapp.js, cotizacion.jsx, scroll.jsx, movimiento.js, intro.js, flip.js…
src/sections/            una sección por archivo, en el orden de App.jsx
scripts/                 optimizar_fotos.py, capturar.py, generar_marca.py, generar_logo.py, probar_whatsapp.mjs
fotos_originales/        originales: marca/, referenciales/ y obras/<id>/
public/                  favicon, og.jpg, robots.txt y las fotos/videos ya optimizados
```

**WhatsApp:** mientras no haya número confirmado, los botones abren `https://wa.me/?text=…` (WhatsApp
deja elegir el chat). Cuando lo haya, se cambia **solo** `BALANCE.whatsapp.numero` en
`src/data/balance.js` (formato `58412XXXXXXX`) y se corre `npm run test:whatsapp`.

## Fotos

Todas pasan por `scripts/optimizar_fotos.py`, que lee `scripts/fotos_config.json`: recorte por id (y
recortes alternativos por uso, `id@uso`), variantes 480/768/1200/1920 sin agrandar, AVIF + WebP,
placeholder borroso, una **gradación** de marca opcional (luces doradas, sombras carbón, viñeta) para
que fotos de orígenes distintos parezcan de la misma obra, y la versión **plano** (`"plano": true` →
`id@plano`, la mitad «Plano» del comparador «Plano / Obra»). Cada foto referencial lleva en la config
`"referencial": true` y su `"credito"` (autor, licencia, fuente, url): de ahí salen la etiqueta y el
modal de créditos.

```bash
python scripts/optimizar_fotos.py --hoja .capturas/fotos/hoja.jpg   # y mirar la hoja de contactos
python scripts/generar_marca.py                                       # favicon y og.jpg (si cambia el logo)
```

## Cómo agregar una obra nueva

1. **Carpeta.** Crea `fotos_originales/obras/<id>/` con un id corto, en minúsculas y con guiones
   (p. ej. `vivienda-norte`), y copia ahí las fotos como `01.jpg`, `02.jpg`… — la `01` es la
   portada. Para un video: `recorrido.mp4` (H.264, liviano) y su póster con el mismo nombre,
   `recorrido.jpg`. Para un antes y después: `antes.jpg` y `despues.jpg` con el mismo encuadre.
2. **Ajustes (opcional).** Si alguna foto necesita recorte, texto alternativo o su versión de plano,
   agrégalo en `scripts/fotos_config.json` → `"obras"` → `"ajustes"` con la clave `"<id>/<archivo>"`:
   `{ "alt": "Fachada terminada", "proporcion": "4:5", "plano": true }`. Sin ajustes, la foto se usa
   entera, con la gradación suave de las fotos reales.
3. **Procesar.** `python scripts/optimizar_fotos.py --hoja .capturas/fotos/hoja.jpg` y revisa la hoja de
   contactos. Las fotos quedan como `obras/<id>/01`, `obras/<id>/02`… en `src/data/fotos.json` (y el
   video, como `obras/<id>/recorrido` en `src/data/videos.json`).
4. **Datos.** Agrega la obra al principio de `OBRAS` en `src/data/obras.js`:
   ```js
   {
     id: 'vivienda-norte',
     nombre: 'Vivienda unifamiliar',      // el nombre que dé el ingeniero
     categoria: 'construccion',           // construccion | remodelacion | asfaltado | arquitectura | ingenieria
     ubicacion: 'Ciudad, Estado',         // la real (o null)
     anio: 2025,                          // el real (o null)
     descripcion: 'Una o dos frases sobre la obra, sin cifras que no estén confirmadas.',
     fotos: ['obras/vivienda-norte/01', 'obras/vivienda-norte/02'],
     video: 'obras/vivienda-norte/recorrido',                    // o null
     antesDespues: null,                                          // o { antes: 'obras/…/antes', despues: 'obras/…/despues' }
     referencial: false,
   },
   ```
   Cuando haya suficientes obras reales, borra las de ejemplo (`referencial: true`) y sus fotos de
   `"fotos"` en `fotos_config.json`.
5. **Revisar y publicar.** `npm run dev` → `http://localhost:5173/?solo=Obras` (teléfono y escritorio),
   luego `npm run build` sin errores, y se publica como siempre.

## Antes de abrirla al público

- Confirmar todo lo marcado `POR CONFIRMAR` en `src/data/balance.js` (nombre del ingeniero, WhatsApp,
  ciudad, correo, Instagram, años y número de proyectos, lista de servicios).
- Quitar `noindex`: la meta `robots` de `index.html`, `Disallow: /` de `public/robots.txt` y el
  encabezado `X-Robots-Tag` de `vercel.json`.
- Revisar el dominio en `SITIO` (`vite.config.js`): de ahí sale la URL absoluta de `og.jpg`.
- Cuando el ingeniero mande el logo original, reemplazar `src/components/logoTrazos.js` (o el
  componente `Logo`) y correr `python scripts/generar_marca.py`.

Diseño y desarrollo: Jeremy Heras.
