"""Archivo «expandida» autoalojada: la Archivo variable de fontsource con el eje de anchura FIJO en
125 % (y solo el eje de peso, 500–900), subconjunto latino, en woff2.

Por qué: la página usa Archivo siempre a su anchura máxima. Fijar el eje en el archivo (en vez de
pedir font-stretch: 125 % en el CSS) deja la fuente en la mitad del peso (90 → ~45 KB) y hace que se
vea igual en todos los motores, sin depender de cómo cada uno aplica font-stretch.

Requisitos (no son dependencias del sitio):  pip install fonttools brotli
Uso (desde la raíz):  python scripts/generar_fuente_expandida.py
Escribe src/assets/fuentes/archivo-expandida-latin-wght.woff2 (lo usa src/index.css).
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
DESTINO = RAIZ / 'src/assets/fuentes/archivo-expandida-latin-wght.woff2'

fuente = TTFont(ORIGEN)
# Por defecto, el peso 800 (el del titular): un motor sin variaciones lo pinta bien igual.
fija = instantiateVariableFont(fuente, {'wdth': 125, 'wght': (500, 800, 900)})
fija.flavor = 'woff2'
DESTINO.parent.mkdir(parents=True, exist_ok=True)
fija.save(DESTINO)
ejes = [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in fija['fvar'].axes] if 'fvar' in fija else []
print(f'{DESTINO.relative_to(RAIZ)}: {DESTINO.stat().st_size / 1024:.1f} KB · ejes {ejes}')
