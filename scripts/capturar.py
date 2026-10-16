"""Capturas de la página de Balance para revisarla a ojo: levanta Vite, recorre la página y apaga todo al terminar.

Uso (desde la raíz del proyecto, Python 3.12 + Playwright). Cada servidor con SU puerto y SU caché
(BAL_CACHE), para que varios puedan correr a la vez sin pisarse:
    python scripts/capturar.py --puerto 5211 --cache .vite-plano --ruta "?solo=Plano" \
        --anchos 390x844,1440x900 --salida .capturas/plano
    python scripts/capturar.py --ruta "?sinintro=1" --completa --pasos 0          # solo la página entera
    python scripts/capturar.py --sin-servidor --puerto 5210 --webkit                # contra un Vite ya abierto

Por cada ancho guarda <salida>/<ancho>x<alto>-NN.png (una por pantalla al ir bajando) y, con
--completa, <ancho>x<alto>-completa.png. Al final imprime los errores y avisos de la consola, las
peticiones fallidas y los elementos que desbordan a lo ancho.

Para pruebas propias de interacción, importa las piezas:
    from capturar import servidor_vite, abrir_navegador, nuevo_contexto, vigilar, desbordes
    with servidor_vite(5212, '.vite-cotiza') as base, abrir_navegador() as navegador:   # TU puerto y TU caché
        pagina = nuevo_contexto(navegador, 390, 844).new_page()
        registro = vigilar(pagina)
        pagina.goto(base + '/?solo=Servicios,Cotiza', wait_until='networkidle')
        pagina.click('text=Cotizar')  # …
"""
import argparse
import contextlib
import os
import signal
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
VITE = RAIZ / 'node_modules' / 'vite' / 'bin' / 'vite.js'


@contextlib.contextmanager
def servidor_vite(puerto, cache=None, espera_maxima=90):
    """Arranca `vite` en 127.0.0.1:<puerto> con su propia caché (BAL_CACHE) y devuelve la URL base.

    Al salir del `with` mata el árbol de procesos entero (en Windows, taskkill /T /F).
    """
    cache = cache or f'.vite-capturar-{puerto}'
    registro = RAIZ / '.capturas' / f'vite-{puerto}.log'
    registro.parent.mkdir(parents=True, exist_ok=True)
    entorno = {**os.environ, 'BAL_CACHE': cache, 'BROWSER': 'none'}
    opciones = {'creationflags': subprocess.CREATE_NEW_PROCESS_GROUP} if os.name == 'nt' else {'start_new_session': True}
    with open(registro, 'w', encoding='utf-8') as salida:
        proceso = subprocess.Popen(
            ['node', str(VITE), '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
            cwd=RAIZ, env=entorno, stdout=salida, stderr=subprocess.STDOUT, **opciones,
        )
        base = f'http://127.0.0.1:{puerto}'
        try:
            limite = time.time() + espera_maxima
            while True:
                if proceso.poll() is not None:
                    raise RuntimeError(f'Vite se cerró al arrancar (¿puerto {puerto} ocupado?). Mira {registro}')
                try:
                    with urllib.request.urlopen(base + '/', timeout=2) as respuesta:
                        if respuesta.status == 200:
                            break
                except OSError:
                    pass
                if time.time() > limite:
                    raise TimeoutError(f'Vite no respondió en {espera_maxima} s. Mira {registro}')
                time.sleep(0.4)
            yield base
        finally:
            matar_arbol(proceso)


def matar_arbol(proceso):
    if proceso.poll() is not None:
        return
    if os.name == 'nt':
        subprocess.run(['taskkill', '/T', '/F', '/PID', str(proceso.pid)], capture_output=True)
    else:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(proceso.pid, signal.SIGTERM)
    with contextlib.suppress(subprocess.TimeoutExpired):
        proceso.wait(timeout=10)


@contextlib.contextmanager
def abrir_navegador(webkit=False):
    """Chrome del sistema (o WebKit, el motor de Safari) sin ventana."""
    with sync_playwright() as p:
        navegador = p.webkit.launch() if webkit else p.chromium.launch(channel='chrome')
        try:
            yield navegador
        finally:
            navegador.close()


def nuevo_contexto(navegador, ancho, alto, menos_movimiento=False, dpr=1):
    """Ventana de ancho×alto. Por debajo de 768 px se comporta como un teléfono táctil."""
    movil = ancho < 768
    opciones = {
        'viewport': {'width': ancho, 'height': alto},
        'device_scale_factor': dpr,
        'has_touch': movil,
        'reduced_motion': 'reduce' if menos_movimiento else 'no-preference',
        'locale': 'es-VE',
        'timezone_id': 'America/Caracas',
    }
    if movil and navegador.browser_type.name == 'chromium':
        opciones['is_mobile'] = True
    return navegador.new_context(**opciones)


def vigilar(pagina):
    """Junta errores y avisos de consola, excepciones y peticiones fallidas de la página."""
    registro = {'errores': [], 'avisos': [], 'peticiones': []}

    def consola(mensaje):
        if mensaje.type == 'error':
            registro['errores'].append(mensaje.text)
        elif mensaje.type == 'warning':
            registro['avisos'].append(mensaje.text)

    pagina.on('console', consola)
    pagina.on('pageerror', lambda error: registro['errores'].append(f'Excepción: {error}'))
    pagina.on('requestfailed', lambda pet: registro['peticiones'].append(f'{pet.failure} {pet.url}'))
    pagina.on('response', lambda res: res.status >= 400 and registro['peticiones'].append(f'HTTP {res.status} {res.url}'))
    return registro


JS_DESBORDES = """() => {
  const ancho = window.innerWidth
  if (document.documentElement.scrollWidth <= ancho) return []
  const recorta = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX
      if (o !== 'visible') return true
    }
    return false
  }
  const nombre = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : '')
  const malos = []
  for (const el of document.body.querySelectorAll('*')) {
    const caja = el.getBoundingClientRect()
    if (caja.width && (caja.right > ancho + 1 || caja.left < -1) && !recorta(el)) {
      malos.push(`${nombre(el)} (de ${Math.round(caja.left)} a ${Math.round(caja.right)} px)`)
      if (malos.length >= 8) break
    }
  }
  return [`scrollWidth ${document.documentElement.scrollWidth} > ${ancho}`, ...malos]
}"""


def desbordes(pagina):
    """Lista vacía si nada desborda a lo ancho; si no, la medida y hasta 8 elementos culpables."""
    return pagina.evaluate(JS_DESBORDES)


def bajar_hasta_el_final(pagina, pausa=350):
    """Recorre la página entera para disparar los whileInView y las fotos diferidas; vuelve arriba."""
    alto_vista = pagina.evaluate('innerHeight')
    y = 0
    while y < pagina.evaluate('document.documentElement.scrollHeight'):
        y += alto_vista * 0.8
        pagina.evaluate(f'window.scrollTo({{top: {y}, behavior: "instant"}})')
        pagina.wait_for_timeout(pausa)
    pagina.evaluate('window.scrollTo({top: 0, behavior: "instant"})')
    pagina.wait_for_timeout(pausa)


def capturar(navegador, base, ruta, ancho, alto, salida, pasos, completa, esperar, menos_movimiento, dpr):
    contexto = nuevo_contexto(navegador, ancho, alto, menos_movimiento, dpr)
    pagina = contexto.new_page()
    registro = vigilar(pagina)
    problemas = set()
    url = base + '/' + ruta.lstrip('/')
    pagina.goto(url, wait_until='networkidle', timeout=90_000)
    pagina.evaluate('document.fonts.ready.then(() => true)')
    pagina.wait_for_timeout(esperar)
    prefijo = f'{ancho}x{alto}'

    alto_total = pagina.evaluate('document.documentElement.scrollHeight')
    for i in range(pasos):
        y = i * alto
        if i and y >= alto_total:
            break
        pagina.evaluate(f'window.scrollTo({{top: {y}, behavior: "instant"}})')
        pagina.wait_for_timeout(1000)
        pagina.screenshot(path=str(salida / f'{prefijo}-{i + 1:02d}.png'))
        problemas.update(desbordes(pagina))
        alto_total = pagina.evaluate('document.documentElement.scrollHeight')

    if completa:
        bajar_hasta_el_final(pagina)
        pagina.wait_for_timeout(800)
        pagina.screenshot(path=str(salida / f'{prefijo}-completa.png'), full_page=True)
        problemas.update(desbordes(pagina))

    contexto.close()
    return registro, sorted(problemas)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description='Capturas de la página de Balance Obras Civiles')
    parser.add_argument('--puerto', type=int, default=5210)
    parser.add_argument('--cache', help='carpeta de caché de Vite para este servidor (p. ej. .vite-portada); por defecto .vite-capturar-<puerto>')
    parser.add_argument('--ruta', default='?sinintro=1', help='lo que va tras la barra: "?solo=Portada" o "?sinintro=1"')
    parser.add_argument('--anchos', default='390x844,1440x900', help='lista de ANCHOxALTO separados por comas')
    parser.add_argument('--pasos', type=int, default=4, help='capturas de pantalla al ir bajando (0 = ninguna)')
    parser.add_argument('--completa', action='store_true', help='además, una captura de la página entera')
    parser.add_argument('--salida', default='.capturas/general')
    parser.add_argument('--esperar', type=int, default=1500, help='ms tras cargar, para que terminen las entradas')
    parser.add_argument('--dpr', type=float, default=1, help='densidad de píxeles (2 = capturas nítidas y pesadas)')
    parser.add_argument('--webkit', action='store_true', help='usar WebKit (Safari) en vez de Chrome')
    parser.add_argument('--menos-movimiento', action='store_true', help='emular «reducir movimiento»')
    parser.add_argument('--sin-servidor', action='store_true', help='usar un Vite ya abierto en --puerto')
    args = parser.parse_args()

    salida = RAIZ / args.salida
    salida.mkdir(parents=True, exist_ok=True)
    medidas = [tuple(int(v) for v in m.lower().split('x')) for m in args.anchos.split(',')]

    servidor = contextlib.nullcontext(f'http://127.0.0.1:{args.puerto}') if args.sin_servidor else servidor_vite(args.puerto, args.cache)
    hubo_problemas = False
    with servidor as base, abrir_navegador(args.webkit) as navegador:
        for ancho, alto in medidas:
            registro, problemas = capturar(navegador, base, args.ruta, ancho, alto, salida, args.pasos,
                                           args.completa, args.esperar, args.menos_movimiento, args.dpr)
            print(f'\n── {ancho}x{alto} {"(WebKit)" if args.webkit else ""}')
            for clave, titulo in (('errores', 'Errores de consola'), ('avisos', 'Avisos de consola'), ('peticiones', 'Peticiones fallidas')):
                unicos = list(dict.fromkeys(registro[clave]))
                if unicos:
                    hubo_problemas |= clave != 'avisos'
                    print(f'{titulo} ({len(unicos)}):')
                    for linea in unicos[:15]:
                        print('  ·', linea[:300])
            if problemas:
                hubo_problemas = True
                print('Desborde horizontal:')
                for linea in problemas:
                    print('  ·', linea)
            if not any(registro.values()) and not problemas:
                print('Sin errores ni desbordes.')
    print(f'\nCapturas en {salida}')
    sys.exit(1 if hubo_problemas else 0)


if __name__ == '__main__':
    main()
