"""Genera la geometría del logo de Balance (src/components/logoTrazos.js) a partir de las medidas de
la maqueta (fotos_originales/marca/logo_maqueta.jpg). Ya está generado: solo hace falta volver a
correrlo para AJUSTAR el logo recreado (cuando llegue el original, se reemplaza logoTrazos.js y listo).

Requisitos (no son dependencias del sitio):
    pip install fonttools brotli
    npm pack @fontsource/montserrat@5.2.8   → descomprime y pasa la carpeta «package/files» con --montserrat
Uso:
    python scripts/generar_logo.py --montserrat C:/ruta/package/files

Isotipo (138 × 161): fuste de oro en dos bloques con un corte diagonal (pendiente −0,63) y las dos
panzas de concreto con su arista de arriba en diagonal, tangente a su arco (grosor 21). Wordmark
(mayúscula = 100): B Λ L Λ N C E con trazos de 16 y el triángulo dorado en la segunda Λ. Los textos
chicos («OBRAS CIVILES» y el lema) son Montserrat 500 convertida a curvas, con el tracking justo.
"""
import argparse
import json
import math
import re
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

RAIZ = Path(__file__).resolve().parent.parent
_args = argparse.ArgumentParser(description='Genera src/components/logoTrazos.js')
_args.add_argument('--montserrat', required=True, help='carpeta con montserrat-latin-500-normal.woff2 (de @fontsource/montserrat)')
_args.add_argument('--destino', default=str(RAIZ / 'src' / 'components' / 'logoTrazos.js'))
ARGS = _args.parse_args()
MONTSERRAT = Path(ARGS.montserrat) / 'montserrat-latin-{peso}-normal.woff2'
DESTINO = Path(ARGS.destino)


def n(v):
    """Número compacto para el SVG (2 decimales, sin ceros de más)."""
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def un_decimal(v):
    """Un decimal: para los glifos de los textos chicos (0,1 unidad no se ve ni en el pie)."""
    s = f'{v:.1f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def pt(p):
    return f'{n(p[0])} {n(p[1])}'


def poligono(puntos):
    return 'M' + 'L'.join(pt(p) for p in puntos) + 'Z'


def interseccion_recta_circulo(m, b, cx, cy, r):
    """Puntos de y = m x + b con el círculo (cx, cy, r), ordenados por x."""
    A = 1 + m * m
    B = 2 * (m * (b - cy) - cx)
    C = cx * cx + (b - cy) ** 2 - r * r
    disc = B * B - 4 * A * C
    if disc < 0:
        raise ValueError('sin intersección')
    raiz = math.sqrt(disc)
    xs = sorted([(-B - raiz) / (2 * A), (-B + raiz) / (2 * A)])
    return [(x, m * x + b) for x in xs]


def angulo(c, p):
    return math.degrees(math.atan2(p[1] - c[1], p[0] - c[0]))


def arco(c, r, desde, hasta, horario=True):
    """Comando A del SVG de `desde` a `hasta` sobre el círculo (c, r)."""
    a0, a1 = angulo(c, desde), angulo(c, hasta)
    tramo = (a1 - a0) % 360 if horario else (a0 - a1) % 360
    grande = 1 if tramo > 180 else 0
    return f'A{n(r)} {n(r)} 0 {grande} {1 if horario else 0} {pt(hasta)}'


# ───────────────────────── Isotipo (unidades: alto 161) ─────────────────────────
ALTO = 161
T = 21  # grosor de las piezas de concreto
X0 = 60  # borde izquierdo del concreto (8 de junta con el oro)
JUNTA_CONCRETO = 6.5  # junta vertical entre las dos piezas de concreto

ORO_SUP = [(0, 24), (52, 0), (52, 57.24), (0, 90)]
ORO_INF = [(0, 99), (52, 66.24), (52, ALTO), (0, ALTO)]

# Pieza superior: arista de arriba con pendiente s1 desde (X0, 0), tangente al círculo C1.
s1 = 0.6
R1 = 34
cx1 = 132 - R1
n1 = math.hypot(1, s1)
cy1 = s1 * cx1 - X0 * s1 + R1 * n1
u1 = (s1 / n1, -1 / n1)  # normal unitaria del centro hacia la recta
T1o = (cx1 + R1 * u1[0], cy1 + R1 * u1[1])
r1 = R1 - T
T1i = (cx1 + r1 * u1[0], cy1 + r1 * u1[1])
y_interior1 = T * n1  # la arista interior corta x = X0 en esta altura

# Pieza inferior: arista de arriba desde (X0, 64) tangente al círculo C2 (abajo en 161).
R2 = 38
cx2, cy2 = 138 - R2, ALTO - R2
P2 = (X0, 64)


def pendiente_tangente(P, c, r):
    # la menor pendiente s con distancia(c, recta(P, s)) = r y el centro debajo de la recta
    lo, hi = 0.0, 3.0
    def dist(s):
        return (c[1] - P[1] - s * (c[0] - P[0])) / math.hypot(1, s)
    # dist(s) decrece con s; buscamos dist = r
    for _ in range(200):
        mid = (lo + hi) / 2
        if dist(mid) > r:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


s2 = pendiente_tangente(P2, (cx2, cy2), R2)
n2 = math.hypot(1, s2)
u2 = (s2 / n2, -1 / n2)
T2o = (cx2 + R2 * u2[0], cy2 + R2 * u2[1])
r2 = R2 - T
T2i = (cx2 + r2 * u2[0], cy2 + r2 * u2[1])
y_interior2 = P2[1] + T * n2

# Junta: la pieza superior termina en la recta paralela a la arista de la inferior, más arriba.
b_junta = P2[1] - s2 * X0 - JUNTA_CONCRETO * n2
S1o = interseccion_recta_circulo(s2, b_junta, cx1, cy1, R1)[1]  # la de la derecha
S1i = interseccion_recta_circulo(s2, b_junta, cx1, cy1, r1)[1]

CONCRETO_SUP = (
    f'M{pt((X0, 0))}L{pt(T1o)}{arco((cx1, cy1), R1, T1o, S1o, True)}'
    f'L{pt(S1i)}{arco((cx1, cy1), r1, S1i, T1i, False)}L{pt((X0, y_interior1))}Z'
)
CONCRETO_INF = (
    f'M{pt(P2)}L{pt(T2o)}{arco((cx2, cy2), R2, T2o, (cx2, ALTO), True)}'
    f'L{pt((X0, ALTO))}L{pt((X0, ALTO - T))}L{pt((cx2, ALTO - T))}'
    f'{arco((cx2, cy2), r2, (cx2, ALTO - T), T2i, False)}L{pt((X0, y_interior2))}Z'
)

ISOTIPO = {
    'ancho': 138,
    'alto': ALTO,
    'oroSuperior': poligono(ORO_SUP),
    'oroInferior': poligono(ORO_INF),
    'concretoSuperior': CONCRETO_SUP,
    'concretoInferior': CONCRETO_INF,
}

# ───────────────────────── Wordmark (alto de mayúscula = 100) ─────────────────────────
G = 16  # grosor de los trazos rectos


def letra_b():
    xu, ru = 55, 27  # panza de arriba: y 0–54
    xl, rl = 59, 31  # panza de abajo: y 38–100
    cu, cl = (xu, 27), (xl, 69)
    # cintura: intersección de los dos círculos exteriores, del lado derecho
    d = math.dist(cu, cl)
    a = (ru * ru - rl * rl + d * d) / (2 * d)
    h = math.sqrt(ru * ru - a * a)
    mx = cu[0] + a * (cl[0] - cu[0]) / d
    my = cu[1] + a * (cl[1] - cu[1]) / d
    p1 = (mx + h * (cl[1] - cu[1]) / d, my - h * (cl[0] - cu[0]) / d)
    p2 = (mx - h * (cl[1] - cu[1]) / d, my + h * (cl[0] - cu[0]) / d)
    cintura = p1 if p1[0] > p2[0] else p2
    exterior = (f'M0 0H{n(xu)}{arco(cu, ru, (xu, 0), cintura, True)}'
                f'{arco(cl, rl, cintura, (xl, 100), True)}H0Z')
    hueco1 = f'M{G} {G}H{n(xu)}A11 11 0 0 1 {n(xu)} 38H{G}Z'
    hueco2 = f'M{G} 54H{n(xl)}A15 15 0 0 1 {n(xl)} 84H{G}Z'
    return exterior + hueco1 + hueco2, 90


def letra_lambda():
    ancho = 100
    pierna = G * math.hypot(1, 0.5) / 1  # ancho horizontal de la pierna (G / cos α), tan α = 0.5
    pierna = G / math.cos(math.atan(0.5))
    vertice_in = 100 - 2 * (50 - pierna)
    d = (f'M0 100L50 0L100 100H{n(100 - pierna)}L50 {n(vertice_in)}L{n(pierna)} 100Z')
    return d, ancho


def letra_l():
    return f'M0 0H{G}V84H74V100H0Z', 74


def letra_n():
    pts = [(0, 0), (20, 0), (74, 76), (74, 0), (90, 0), (90, 100), (70, 100), (16, 24), (16, 100), (0, 100)]
    return poligono(pts), 90


def letra_c():
    c, R, r, th = (50, 50), 50, 34, math.radians(37)
    po1 = (50 + R * math.cos(th), 50 - R * math.sin(th))
    po2 = (50 + R * math.cos(th), 50 + R * math.sin(th))
    pi2 = (50 + r * math.cos(th), 50 + r * math.sin(th))
    pi1 = (50 + r * math.cos(th), 50 - r * math.sin(th))
    d = (f'M{pt(po1)}A{R} {R} 0 1 0 {pt(po2)}L{pt(pi2)}A{r} {r} 0 1 1 {pt(pi1)}Z')
    return d, po1[0]


def letra_e():
    return f'M0 0H76V{G}H{G}V42H66V58H{G}V84H76V100H0Z', 76


def desplazar(d, dx):
    """Mueve un path (solo comandos absolutos M L H V A Z) dx en x."""
    import re
    salida = []
    for cmd, args in re.findall(r'([MLHVAZ])([^MLHVAZ]*)', d):
        nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', args)]
        if cmd in 'ML':
            nums = [v + dx if i % 2 == 0 else v for i, v in enumerate(nums)]
        elif cmd == 'H':
            nums = [v + dx for v in nums]
        elif cmd == 'A':
            nums = [v + dx if i % 7 == 5 else v for i, v in enumerate(nums)]
        salida.append(cmd + ' '.join(n(v) for v in nums))
    return ''.join(salida)


ESPACIOS = [36, 34, 32, 34, 36, 34]
FORMAS = [('B', letra_b), ('A', letra_lambda), ('L', letra_l), ('A', letra_lambda), ('N', letra_n), ('C', letra_c), ('E', letra_e)]
LETRAS = []
x = 0
for i, (letra, funcion) in enumerate(FORMAS):
    d, ancho = funcion()
    LETRAS.append({'letra': letra, 'x': round(x, 2), 'ancho': round(ancho, 2), 'd': desplazar(d, x)})
    x += ancho + (ESPACIOS[i] if i < len(ESPACIOS) else 0)
ANCHO_PALABRA = round(x, 2)

# triángulo dorado dentro de la segunda Λ
xa = LETRAS[3]['x']
TRIANGULO = poligono([(xa + 50, 56), (xa + 67, 100), (xa + 33, 100)])

# ───────────────────────── Textos (Montserrat convertida a curvas) ─────────────────────────


def glifos(texto, peso, alto_mayus, x_ini, x_fin, linea_base):
    """Path del texto en mayúsculas, con el tracking justo para ir de x_ini a x_fin."""
    fuente = TTFont(str(MONTSERRAT).format(peso=peso))
    juego = fuente.getGlyphSet()
    cmap = fuente.getBestCmap()
    hmtx = fuente['hmtx']
    mayus = fuente['OS/2'].sCapHeight or 700
    escala = alto_mayus / mayus
    # ancho natural (de la tinta de la primera letra a la de la última) sin tracking
    nombres = [cmap[ord(c)] for c in texto]
    cajas = []
    for nombre in nombres:
        bp = BoundsPen(juego)
        juego[nombre].draw(bp)
        cajas.append(bp.bounds)
    avances = [hmtx[nm][0] for nm in nombres]
    # posiciones naturales
    pos, xx = [], 0
    for a in avances:
        pos.append(xx)
        xx += a
    tinta_ini = cajas[0][0] if cajas[0] else 0
    ultimo = len(texto) - 1
    tinta_fin = pos[ultimo] + (cajas[ultimo][2] if cajas[ultimo] else avances[ultimo])
    natural = (tinta_fin - tinta_ini) * escala
    tracking = ((x_fin - x_ini) - natural) / ultimo  # extra por letra (en unidades del logo)
    partes = []
    for i, nombre in enumerate(nombres):
        if texto[i] == ' ':
            continue
        x_letra = x_ini + (pos[i] - tinta_ini) * escala + tracking * i
        pen = SVGPathPen(juego, ntos=un_decimal)
        tp = TransformPen(pen, (escala, 0, 0, -escala, x_letra, linea_base))
        juego[nombre].draw(tp)
        partes.append(pen.getCommands())
    return ''.join(partes), tracking


# Completo: «OBRAS CIVILES» (mayúscula 28) de 136 a 688, base en 170; filetes a y = 157.
SUB_COMPLETO, trk1 = glifos('OBRAS CIVILES', 500, 28, 136, 690, 170)
FILETES_COMPLETO = [(0, 88), (738, ANCHO_PALABRA)]
# Lema: tres palabras de 0 al ancho del wordmark (mayúscula 18, base en 242), con un hueco de 72
# entre palabras y un punto dorado en medio de cada hueco (como en la maqueta).
LEMA_PALABRAS = ['INGENIERÍA', 'CONSTRUCCIÓN', 'REMODELACIÓN']
LEMA_ALTO, LEMA_HUECO, LEMA_BASE = 18, 72, 242


def ancho_natural(texto, peso, alto_mayus):
    fuente = TTFont(str(MONTSERRAT).format(peso=peso))
    juego, cmap, hmtx = fuente.getGlyphSet(), fuente.getBestCmap(), fuente['hmtx']
    escala = alto_mayus / (fuente['OS/2'].sCapHeight or 700)
    nombres = [cmap[ord(c)] for c in texto]
    x, pos = 0, []
    for nm in nombres:
        pos.append(x)
        x += hmtx[nm][0]
    b0, b1 = BoundsPen(juego), BoundsPen(juego)
    juego[nombres[0]].draw(b0)
    juego[nombres[-1]].draw(b1)
    return (pos[-1] + b1.bounds[2] - b0.bounds[0]) * escala


naturales = [ancho_natural(p, 500, LEMA_ALTO) for p in LEMA_PALABRAS]
huecos_letras = sum(len(p) - 1 for p in LEMA_PALABRAS)
trk2 = (ANCHO_PALABRA - 2 * LEMA_HUECO - sum(naturales)) / huecos_letras
LEMA_PARTES, PUNTOS_LEMA, xx = [], [], 0
for i, palabra in enumerate(LEMA_PALABRAS):
    ancho = naturales[i] + trk2 * (len(palabra) - 1)
    d, _ = glifos(palabra, 500, LEMA_ALTO, xx, xx + ancho, LEMA_BASE)
    LEMA_PARTES.append(d)
    xx += ancho
    if i < len(LEMA_PALABRAS) - 1:
        PUNTOS_LEMA.append({'cx': round(xx + LEMA_HUECO / 2, 2), 'cy': round(LEMA_BASE - LEMA_ALTO / 2, 2), 'r': 4.2})
        xx += LEMA_HUECO
LEMA = ''.join(LEMA_PARTES)
# Horizontal: «OBRAS CIVILES» (mayúscula 26) a todo el ancho, base en 154 (wordmark arriba en 0):
# así el isotipo (alto 154) va de la línea de mayúsculas de BALANCE a la base del subtítulo.
ALTO_H = 154
SUB_HORIZONTAL, trk3 = glifos('OBRAS CIVILES', 500, 26, 0, ANCHO_PALABRA, ALTO_H)

# ───────────────────────── Composiciones ─────────────────────────
ESCALA_ISO_COMPLETO = 2
ISO_COMPLETO_X = round((ANCHO_PALABRA - ISOTIPO['ancho'] * ESCALA_ISO_COMPLETO) / 2, 2)
PALABRA_COMPLETO_Y = ISOTIPO['alto'] * ESCALA_ISO_COMPLETO + 50
ALTO_COMPLETO = PALABRA_COMPLETO_Y + 244
ESCALA_ISO_H = ALTO_H / ISOTIPO['alto']
HORIZONTAL_PALABRA_X = round(ISOTIPO['ancho'] * ESCALA_ISO_H + 40, 2)
ANCHO_HORIZONTAL = round(HORIZONTAL_PALABRA_X + ANCHO_PALABRA, 2)

COMPOSICION = {
    'completo': {
        'caja': [-6, -6, ANCHO_PALABRA + 12, ALTO_COMPLETO + 10],
        'isotipo': {'x': ISO_COMPLETO_X, 'y': 0, 'escala': ESCALA_ISO_COMPLETO},
        'palabra': {'x': 0, 'y': PALABRA_COMPLETO_Y},
    },
    'horizontal': {
        'caja': [-3, -3, round(ANCHO_HORIZONTAL + 7, 2), ALTO_H + 7],
        'isotipo': {'x': 0, 'y': 0, 'escala': round(ESCALA_ISO_H, 5)},
        'palabra': {'x': HORIZONTAL_PALABRA_X, 'y': 0},
        'palabraSola': {'x': HORIZONTAL_PALABRA_X, 'y': (ALTO_H - 100) / 2},
    },
    'isotipo': {
        'caja': [-3, -3, ISOTIPO['ancho'] + 7, ISOTIPO['alto'] + 7],
        'isotipo': {'x': 0, 'y': 0, 'escala': 1},
    },
    'palabra': {
        'caja': [-3, -3, ANCHO_PALABRA + 7, 100 + 7],
        'palabra': {'x': 0, 'y': 0},
    },
}


def js(valor):
    return json.dumps(valor, ensure_ascii=False, indent=2)


contenido = f"""/**
 * Trazos del logo de Balance — Obras Civiles, recreado en vectores a partir de la maqueta 3D
 * (fotos_originales/marca/logo_maqueta.jpg). GENERADO por scripts/generar_logo.py:
 * no hace falta ninguna fuente para pintarlo. Cuando llegue el logo original, se reemplaza aquí.
 *
 * Isotipo (unidades: 138 × 161): la «B» de piezas. El fuste son dos bloques de oro separados por
 * un corte diagonal; las panzas, dos piezas de concreto con la arista de arriba en diagonal.
 * Wordmark (alto de mayúscula = 100; ancho {n(ANCHO_PALABRA)}): B Λ L Λ N C E con trazos de 16,
 * la primera A sin travesaño y la segunda con un triángulo dorado. Los textos chicos son
 * Montserrat 500 convertida a curvas, con el tracking justo para ocupar su ancho.
 */

/** Isotipo: cuatro piezas (polígonos y arcos), en el orden en que se arman. */
export const ISOTIPO = {js(ISOTIPO)}

/** Las siete letras de «BALANCE» (`x`: dónde empieza cada una; `d` ya va desplazado). */
export const LETRAS = {js(LETRAS)}

/** Ancho total del wordmark (alto de mayúscula: 100). */
export const ANCHO_PALABRA = {n(ANCHO_PALABRA)}

/** Triángulo dorado dentro de la segunda Λ. */
export const TRIANGULO = {js(TRIANGULO)}

/** «OBRAS CIVILES» del logo completo (mayúscula 28, base en y = 170 bajo el wordmark) y sus filetes (y = 157). */
export const SUBTITULO = {js(SUB_COMPLETO)}
export const FILETES = {js([{'x1': a, 'x2': b, 'y': 157} for a, b in FILETES_COMPLETO])}

/** «INGENIERÍA • CONSTRUCCIÓN • REMODELACIÓN» (mayúscula 22, base en y = 242) y sus dos puntos dorados. */
export const LEMA = {js(LEMA)}
export const PUNTOS_LEMA = {js(PUNTOS_LEMA)}

/** «OBRAS CIVILES» de la versión horizontal: a todo el ancho del wordmark, mayúscula 26, base en y = 154. */
export const SUBTITULO_HORIZONTAL = {js(SUB_HORIZONTAL)}

/** Dónde va cada parte en cada variante (`caja` = viewBox, con aire para el relieve). */
export const COMPOSICION = {js(COMPOSICION)}
"""
DESTINO.parent.mkdir(parents=True, exist_ok=True)
DESTINO.write_text(contenido, encoding='utf-8')
print('escrito', DESTINO, len(contenido), 'bytes')
print('s1', s1, 's2', round(s2, 4), 'T1o', T1o, 'S1o', S1o, 'S1i', S1i, 'T2o', T2o)
print('ancho palabra', ANCHO_PALABRA, 'tracking', round(trk1, 2), round(trk2, 2), round(trk3, 2))
print('puntos', PUNTOS_LEMA)
