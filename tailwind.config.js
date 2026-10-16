import defaultTheme from 'tailwindcss/defaultTheme'

/**
 * Tailwind 3.4 compilado al construir (no el CDN), por compatibilidad con iPhones viejos.
 * Los colores viven AQUÍ; src/index.css los expone también como variables CSS (--carbon, …).
 * Las clases se leen de `content`: no armes nombres por partes (`bg-${color}`), Tailwind no los ve.
 *
 * «Hormigón y oro» (brief §3). Contraste WCAG medido (AA texto normal ≥ 4,5:1):
 *   sobre carbón #111213 → hueso 15,6 · oro-claro 12 · concreto-claro 11,5 · oro 8 · plano-linea 7,2 ·
 *     concreto 5,9 · oro-medio 5,9 · oro-oscuro 3,7 (este último: solo decorativo o texto ≥ 24 px)
 *   sobre hormigón #1C1E20 → hueso 13,9 · oro 7,1 · plano-linea 6,4 · concreto 5,3
 *   sobre hormigón-claro #26292B → hueso 12,2 · oro 6,2 · concreto 4,6
 *   sobre plano #0D2742 → hueso 12,6 · oro 6,5 · plano-linea 5,8 · concreto 4,8
 *   carbón sobre oro: 8 (texto de .boton-oro) · carbón sobre oro-claro: 12
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // xs va primero: con `extend` quedaría al final del CSS y pisaría a sm/md/lg.
    screens: { xs: '380px', ...defaultTheme.screens },
    extend: {
      colors: {
        carbon: '#111213', // fondo de la página
        hormigon: {
          DEFAULT: '#1C1E20', // superficies (tarjetas, paneles, ficha técnica)
          claro: '#26292B', // superficie realzada (hover, chips, bordes marcados)
        },
        concreto: {
          DEFAULT: '#8E9193', // texto secundario, líneas
          claro: '#C9CBCC', // texto terciario claro, piezas de concreto
        },
        hueso: '#ECEAE5', // texto principal
        oro: {
          DEFAULT: '#C9A45C', // acento: botones, filetes, numeración, triángulo
          claro: '#E8CC8E', // brillo, hover, inicio del degradado
          medio: '#B08A45', // mitad del degradado
          oscuro: '#8A6A33', // final del degradado, pulsado
        },
        plano: {
          DEFAULT: '#0D2742', // azul de plano (fondo de la sección «De plano a realidad»)
          profundo: '#081A2E', // sombra del azul de plano
          linea: '#6FA4DB', // líneas, cotas y textos del plano
        },
      },
      fontFamily: {
        // Michroma: ancha y técnica, como el wordmark. Etiquetas, cotas, anotaciones y cifras cortas.
        marca: ['Michroma', '"Arial Black"', 'system-ui', 'sans-serif'],
        // Archivo con la anchura fija al máximo (125 %), pesos 500–900: titulares de alto impacto.
        display: ['"Archivo Expandida"', '"Arial Black"', 'Impact', 'system-ui', 'sans-serif'],
        // La Archivo de fontsource con su anchura variable (100 % por defecto; .ancho-112, .ancho-125…). +90 KB.
        archivo: ['Archivo', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        // Instrument Serif: textos editoriales (.texto-lead, .texto-serif), citas.
        serif: ['"Instrument Serif"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        // Archivo expandida en mayúsculas: titular de la portada, de sección y del menú móvil.
        // Ancho medido (em por palabra, 800/125 %): CONSTRUIMOS 10 · CONSTRUCCIÓN 10,9 ·
        // REMODELACIÓN 10,8 · ARQUITECTÓNICOS 12,9 · INGENIERÍA 7,8 · BALANCE 6,4.
        portada: ['clamp(1.75rem, 8.2vw, 7.5rem)', { lineHeight: '0.9', letterSpacing: '0.005em' }],
        seccion: ['clamp(1.5rem, 7vw, 5.25rem)', { lineHeight: '0.95', letterSpacing: '0.01em' }],
        menu: ['clamp(1.6rem, 7.4vw, 3.5rem)', { lineHeight: '1', letterSpacing: '0.01em' }],
      },
      letterSpacing: {
        etiqueta: '0.18em',
        marca: '0.32em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        suave: 'cubic-bezier(0.22, 1, 0.36, 1)',
        viga: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      zIndex: {
        grano: '30',
        nav: '40',
        progreso: '41',
        flotante: '45',
        menu: '50',
        velo: '55',
        modal: '60',
        visor: '60',
        intro: '100',
        cursor: '110',
      },
      maxWidth: {
        contenedor: '1320px',
      },
      boxShadow: {
        oro: '0 18px 40px -18px rgb(201 164 92 / 0.55)',
        profunda: '0 30px 60px -28px rgb(0 0 0 / 0.85)',
        laser: '0 0 12px 1px rgb(232 204 142 / 0.65)',
      },
      keyframes: {
        girar: { to: { transform: 'rotate(360deg)' } },
        flotar: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' },
        },
        parpadeo: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        // Úsalas con motion-safe: (motion-safe:animate-girar) para respetar «reducir movimiento».
        girar: 'girar 22s linear infinite',
        flotar: 'flotar 6s ease-in-out infinite',
        parpadeo: 'parpadeo 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
