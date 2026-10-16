"""Favicon e imagen para compartir de Balance, a partir de los trazos del logo (src/components/logoTrazos.js).

Uso (desde la raíz, Python 3.12 + Playwright + Node; consola: PYTHONIOENCODING=utf-8):
    python scripts/generar_marca.py

Escribe en public/:
  favicon.svg            el isotipo (la «B» de oro y concreto) sobre un cuadrado carbón redondeado
  favicon-32.png         lo mismo en PNG, para navegadores sin favicon SVG
  apple-touch-icon.png   180×180, a sangre (el iPhone redondea las esquinas solo)
  og.jpg                 1200×630: la vista previa del enlace (WhatsApp, Instagram…): el logo completo
                         sobre carbón con la retícula de plano. La URL absoluta la arma vite.config.js (SITIO).
Lee los trazos con node (logoTrazos.js es la única fuente del logo) y las fuentes de node_modules.
Adaptado de las demos de Ellie Shop y Rickbarber.
"""
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / 'public'
MODULOS = RAIZ / 'node_modules'


def trazos():
    """Los datos del logo, leídos del propio módulo JS con node."""
    codigo = "import('./src/components/logoTrazos.js').then((t) => console.log(JSON.stringify(t)))"
    salida = subprocess.run(['node', '--input-type=module', '-e', codigo], cwd=RAIZ, capture_output=True, text=True, check=True)
    return json.loads(salida.stdout)


T = trazos()
I = T['ISOTIPO']

DEGRADADOS = """
<linearGradient id="oro" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="62" y2="161">
  <stop offset="0" stop-color="#F0DAA6"/><stop offset=".16" stop-color="#E8CC8E"/><stop offset=".42" stop-color="#C9A45C"/>
  <stop offset=".7" stop-color="#B08A45"/><stop offset="1" stop-color="#8A6A33"/>
</linearGradient>
<linearGradient id="brillo" gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="52" y2="128">
  <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".4" stop-color="#fff" stop-opacity=".2"/>
  <stop offset=".47" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
</linearGradient>
<linearGradient id="concreto" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="161">
  <stop offset="0" stop-color="#DFE1E2"/><stop offset=".55" stop-color="#B9BCBE"/><stop offset="1" stop-color="#929597"/>
</linearGradient>
<linearGradient id="letras" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
  <stop offset="0" stop-color="#DFE1E2"/><stop offset=".6" stop-color="#B9BCBE"/><stop offset="1" stop-color="#9A9DA0"/>
</linearGradient>
<linearGradient id="oroTexto" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#E8CC8E"/><stop offset=".55" stop-color="#C9A45C"/><stop offset="1" stop-color="#A9843F"/>
</linearGradient>"""


def isotipo(relieve=True):
    canto = ''
    if relieve:
        canto = (f'<g transform="translate(2.2 3)"><path d="{I["oroSuperior"]}" fill="#5E4520"/><path d="{I["oroInferior"]}" fill="#5E4520"/>'
                 f'<path d="{I["concretoSuperior"]}" fill="#3A3D3F"/><path d="{I["concretoInferior"]}" fill="#3A3D3F"/></g>')
    return (canto
            + f'<path d="{I["oroInferior"]}" fill="url(#oro)"/><path d="{I["oroInferior"]}" fill="url(#brillo)"/>'
            + f'<path d="{I["oroSuperior"]}" fill="url(#oro)"/><path d="{I["oroSuperior"]}" fill="url(#brillo)"/>'
            + f'<path d="{I["concretoInferior"]}" fill="url(#concreto)"/><path d="{I["concretoSuperior"]}" fill="url(#concreto)"/>')


def icono_svg(lado=64, alto_iso=46, redondeo=14):
    """El isotipo centrado en un cuadrado carbón (`redondeo` 0 = a sangre)."""
    escala = alto_iso / I['alto']
    x = (lado - I['ancho'] * escala) / 2 - 0.6
    y = (lado - alto_iso) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}" width="{lado}" height="{lado}">'
            f'<defs>{DEGRADADOS}</defs><rect width="{lado}" height="{lado}" rx="{redondeo}" fill="#111213"/>'
            f'<g transform="translate({x:.2f} {y:.2f}) scale({escala:.5f})">{isotipo()}</g></svg>')


def logo_completo_svg():
    """El logo completo (mismas piezas que <Logo>), sin animación."""
    C = T['COMPOSICION']['completo']
    caja = ' '.join(str(v) for v in C['caja'])
    i, p = C['isotipo'], C['palabra']
    letras = ''.join(f'<path d="{l["d"]}"/>' for l in T['LETRAS'])
    filetes = ''.join(f'<rect x="{f["x1"]}" y="{f["y"] - 1.5}" width="{f["x2"] - f["x1"]}" height="3" fill="#C9A45C"/>' for f in T['FILETES'])
    puntos = ''.join(f'<circle cx="{q["cx"]}" cy="{q["cy"]}" r="{q["r"]}" fill="#C9A45C"/>' for q in T['PUNTOS_LEMA'])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{caja}"><defs>{DEGRADADOS}</defs>'
            f'<g transform="translate({i["x"]} {i["y"]}) scale({i["escala"]})">{isotipo()}</g>'
            f'<g transform="translate({p["x"]} {p["y"]})">'
            f'<g transform="translate(1.6 2.4)" fill="#36393B" fill-rule="evenodd">{letras}</g>'
            f'<g fill="url(#letras)" fill-rule="evenodd">{letras}</g>'
            f'<path d="{T["TRIANGULO"]}" fill="url(#oroTexto)"/>{filetes}'
            f'<path d="{T["SUBTITULO"]}" fill="url(#oroTexto)"/>'
            f'<path d="{T["LEMA"]}" fill="#ECEAE5" opacity=".92"/>{puntos}</g></svg>')


def html_og():
    michroma = (MODULOS / '@fontsource/michroma/files/michroma-latin-400-normal.woff2').as_uri()
    anotaciones = [('arriba-izq', 'N+0.00'), ('arriba-der', 'Escala 1:100'), ('abajo-izq', 'Ingeniería civil'), ('abajo-der', 'Cotiza tu obra')]
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: Michroma; src: url('{michroma}') format('woff2'); }}
html, body {{ margin: 0; }}
#og {{ position: relative; width: 1200px; height: 630px; overflow: hidden; background: #111213; }}
.luz {{ position: absolute; inset: 0; background: radial-gradient(60% 75% at 50% 46%, rgb(201 164 92 / .10), transparent 70%),
        radial-gradient(120% 90% at 50% 40%, transparent 55%, rgb(0 0 0 / .55)); }}
.reticula {{ position: absolute; inset: 0;
  background-image: linear-gradient(to right, rgb(236 234 229 / .07) 1px, transparent 1px), linear-gradient(to bottom, rgb(236 234 229 / .07) 1px, transparent 1px),
                    linear-gradient(to right, rgb(236 234 229 / .035) 1px, transparent 1px), linear-gradient(to bottom, rgb(236 234 229 / .035) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px; background-position: 0 15px, 0 15px, 0 15px, 0 15px;
  -webkit-mask-image: radial-gradient(ellipse 70% 75% at 50% 50%, #000 30%, transparent 100%); }}
.logo {{ position: absolute; left: 50%; top: 50%; width: 600px; transform: translate(-50%, -50%); }}
.logo svg {{ display: block; width: 100%; height: auto; }}
.nota {{ position: absolute; font: 13px/1 Michroma, sans-serif; letter-spacing: .16em; text-transform: uppercase; color: rgb(201 164 92 / .9); }}
.arriba-izq {{ top: 40px; left: 48px; }} .arriba-der {{ top: 40px; right: 48px; }}
.abajo-izq {{ bottom: 40px; left: 48px; }} .abajo-der {{ bottom: 40px; right: 48px; }}
.marco {{ position: absolute; inset: 24px; border: 1px solid rgb(201 164 92 / .22); }}
.cruz {{ position: absolute; width: 18px; height: 18px; }}
.cruz::before, .cruz::after {{ content: ''; position: absolute; background: rgb(201 164 92 / .8); }}
.cruz::before {{ left: 8.5px; top: 0; width: 1px; height: 18px; }} .cruz::after {{ top: 8.5px; left: 0; height: 1px; width: 18px; }}
</style></head><body><div id="og"><div class="reticula"></div><div class="luz"></div><div class="marco"></div>
<div class="cruz" style="left:15px;top:15px"></div><div class="cruz" style="right:15px;top:15px"></div>
<div class="cruz" style="left:15px;bottom:15px"></div><div class="cruz" style="right:15px;bottom:15px"></div>
{''.join(f'<span class="nota {c}">{t}</span>' for c, t in anotaciones)}
<div class="logo">{logo_completo_svg()}</div></div></body></html>"""


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    PUBLICO.mkdir(parents=True, exist_ok=True)
    favicon = icono_svg()
    (PUBLICO / 'favicon.svg').write_text(favicon, encoding='utf-8')
    toque = icono_svg(lado=180, alto_iso=118, redondeo=0)
    temporal = RAIZ / '.capturas' / 'marca'
    temporal.mkdir(parents=True, exist_ok=True)
    (temporal / 'og.html').write_text(html_og(), encoding='utf-8')
    with sync_playwright() as p:
        navegador = p.chromium.launch(channel='chrome')
        try:
            pagina = navegador.new_page(viewport={'width': 1200, 'height': 630})
            for nombre, svg, lado in (('favicon-32.png', icono_svg(lado=32, alto_iso=24, redondeo=7), 32), ('apple-touch-icon.png', toque, 180)):
                pagina.set_viewport_size({'width': lado, 'height': lado})
                pagina.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
                pagina.locator('svg').screenshot(path=str(PUBLICO / nombre), omit_background=True)
            pagina.set_viewport_size({'width': 1200, 'height': 630})
            pagina.goto((temporal / 'og.html').as_uri())
            pagina.evaluate('document.fonts.ready.then(() => true)')
            pagina.wait_for_timeout(300)
            pagina.locator('#og').screenshot(path=str(PUBLICO / 'og.jpg'), type='jpeg', quality=88)
        finally:
            navegador.close()
    for nombre in ('favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og.jpg'):
        print(f'  public/{nombre:<22} {(PUBLICO / nombre).stat().st_size / 1024:.1f} KB')


if __name__ == '__main__':
    main()
