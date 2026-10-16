"""Recortes, gradación y variantes livianas de las fotos (y videos) de Balance Obras Civiles.

Uso (desde la raíz del proyecto, Python 3.12 + Pillow 12 con AVIF; consola: PYTHONIOENCODING=utf-8):
    python scripts/optimizar_fotos.py                                  # genera lo que falte
    python scripts/optimizar_fotos.py --forzar                         # rehace todo
    python scripts/optimizar_fotos.py --hoja .capturas/fotos/hoja.jpg  # + hoja de contactos para revisar
    python scripts/optimizar_fotos.py --solo portada,ref-losa          # solo esos ids (para ajustar rápido)

De dónde salen las fotos:
  1. scripts/fotos_config.json → "fotos": cada id con su archivo dentro de fotos_originales/
     (p. ej. "referenciales/losa.jpg"), caja de recorte, proporción, gradación, alt, crédito y usos.
     Las claves que empiezan con «_» se ignoran (sirven de comentario y de ejemplo).
  2. fotos_originales/obras/<idObra>/ → TODAS sus imágenes (.jpg .jpeg .png .webp), sin configurar
     nada: id «obras/<idObra>/<archivo sin extensión>», en el orden de los nombres (01.jpg, 02.jpg…),
     con la gradación de "obras" en fotos_config.json. Ajustes por foto (caja, proporción, alt…) en
     "obras" → "ajustes" → "<idObra>/<archivo sin extensión>". Los videos (.mp4 .webm) de esas
     carpetas se copian a public/videos/ y van a src/data/videos.json; su póster es la imagen con el
     MISMO nombre (recorrido.mp4 + recorrido.jpg). No se recodifican (no hay ffmpeg): expórtalos ya
     livianos (H.264, ≤ 8 MB, 720–1080 p, sin audio si es de fondo).

Por cada foto (y por cada uno de sus «usos», recortes alternativos que se guardan como «id@uso»):
  1. Abre el original (respeta la orientación EXIF), le aplica sus «parches» (tapar un letrero o una
     marca ajena: clonar una zona vecina, interpolar, difundir o un color) y lo recorta a su caja
     (fracciones 0–1 del original) con la proporción exacta.
  2. Gradación (opcional): la paleta de la marca, «carbón y oro», para que fotos de distintos
     orígenes parezcan de la misma obra: exposición pareja (gamma automática medida en la foto
     ENTERA, así todos sus recortes salen iguales), verdes hacia oliva y cielos hacia pizarra
     (saturación y tono por color), naranjas y amarillos hacia oro, curva en S, luces doradas y
     sombras carbón (luz suave), negros levantados al carbón de la página, blancos que no queman
     (hueso cálido) y viñeta. Presets en "gradaciones" ("balance" para las referenciales, "suave"
     para las reales); una foto puede pedir un preset, false, o un objeto que cambia solo algunos
     valores: {"preset": "balance", "vineta": 0.2}. Parámetros: ver `gradar()`.
     El grano NO se hornea en la foto (pesaría más): lo pone la página con <Grano>.
  3. Escribe public/fotos/<nombre>-<huella>-<ancho>.avif y .webp en los anchos de la config
     (480/768/1200/1920) que no superen el del recorte: nunca agranda (si el recorte es más ancho
     que el mayor ancho útil, se añade su ancho real).
  4. Placeholder WebP de 24 px en base64 (el «blur-up» de <Foto>) y color medio.
  5. Con "plano": true (o {"detalle": 0.075, "reticula": 40, "sombra": 0.3}), además la versión
     «plano azul con líneas» del MISMO recorte, como «id@plano»: los bordes de la foto en celeste
     sobre el azul de plano con su retícula. Es la mitad «Plano» del comparador «Plano / Obra».
Y escribe src/data/fotos.json y src/data/videos.json, que es lo único que lee la página, y
src/data/creditos.js: el crédito (título, autor, licencia y fuente, de
fotos_originales/referenciales/creditos.json) de cada foto referencial que la config usa.
La huella (hash del original + su configuración) va en el nombre del archivo: si cambia algo,
cambia la URL, así que vercel.json puede pedir caché de un año para /fotos/ y /videos/.
Adaptado de las demos de Ellie Shop y Rickbarber.
"""
import argparse
import base64
import hashlib
import io
import json
import math
import re
import shutil
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageMath, ImageOps, ImageStat

RAIZ = Path(__file__).resolve().parent.parent
ORIGINALES = RAIZ / 'fotos_originales'
OBRAS = ORIGINALES / 'obras'
SALIDA = RAIZ / 'public' / 'fotos'
SALIDA_VIDEOS = RAIZ / 'public' / 'videos'
MANIFIESTO = RAIZ / 'src' / 'data' / 'fotos.json'
MANIFIESTO_VIDEOS = RAIZ / 'src' / 'data' / 'videos.json'
CREDITOS_JSON = ORIGINALES / 'referenciales' / 'creditos.json'
CREDITOS_JS = RAIZ / 'src' / 'data' / 'creditos.js'
CONFIG = json.loads((Path(__file__).parent / 'fotos_config.json').read_text(encoding='utf-8'))
VERSION_SCRIPT = 4  # súbelo si cambia la forma de procesar: invalida todas las huellas
IMAGENES = {'.jpg', '.jpeg', '.png', '.webp'}
VIDEOS = {'.mp4', '.webm'}

# Gradación por defecto si fotos_config.json no trae "gradaciones" (los mismos valores que allí).
GRADACIONES = {
    # Referenciales: el look de la marca, marcado (fotos de bancos distintos → una sola obra).
    'balance': {
        'gamma': 'auto', 'gammaObjetivo': 0.36, 'gammaFuerza': 0.7, 'gammaLimites': [0.9, 1.9],
        'luminanciaTono': [[0, 1], [30, 1], [45, 0.97], [60, 0.9], [90, 0.75], [150, 0.72], [180, 0.68],
                           [210, 0.6], [240, 0.62], [270, 0.75], [320, 0.92], [360, 1]],
        'saturacionTono': [[0, 0.74], [18, 0.88], [38, 0.9], [52, 0.74], [62, 0.6], [75, 0.45], [90, 0.32],
                           [160, 0.32], [185, 0.3], [215, 0.4], [250, 0.44], [290, 0.38], [330, 0.56], [360, 0.74]],
        'giroTono': [[0, 12], [20, 5], [38, 0], [48, -6], [62, -14], [90, -24], [150, -18], [170, 0],
                     [190, 14], [212, 6], [235, 0], [330, 0], [345, 9], [360, 12]],
        'saturacion': 0.94, 'curva': 0.36, 'calidez': 0.68, 'sombras': [12, 14, 18], 'luces': [240, 205, 150],
        'negro': [14, 15, 17], 'blanco': [238, 228, 208], 'vineta': 0.38,
    },
    # Reales del ingeniero: lo mismo, pero más discreto (que la obra se vea como es).
    'suave': {
        'gamma': 'auto', 'gammaObjetivo': 0.45, 'gammaFuerza': 0.3, 'gammaLimites': [0.95, 1.3],
        'saturacionTono': [[0, 0.95], [40, 1], [60, 0.95], [90, 0.75], [160, 0.75], [190, 0.8], [250, 0.85], [360, 0.95]],
        'giroTono': [[0, 0], [60, 0], [90, -8], [150, -6], [175, 0], [360, 0]],
        'saturacion': 0.96, 'curva': 0.18, 'calidez': 0.3, 'sombras': [16, 17, 21], 'luces': [236, 214, 170],
        'negro': [9, 10, 11], 'blanco': [250, 245, 236], 'vineta': 0.18,
    },
}
GRADACIONES.update({k: v for k, v in CONFIG.get('gradaciones', {}).items() if not k.startswith('_')})


def proporcion(texto):
    a, b = (float(v) for v in str(texto).split(':'))
    return a / b


def nombre_archivo(id_):
    """'obras/edificio/fachada@movil' → 'obras--edificio--fachada__movil' (seguro para una URL)."""
    return re.sub(r'[^a-zA-Z0-9_-]', '-', id_.replace('/', '--').replace('@', '__'))


def gradacion_de(valor):
    """Resuelve "balance" | false | {"preset": "balance", …} a un diccionario completo (o None)."""
    if not valor:
        return None
    if valor is True:
        valor = 'balance'
    if isinstance(valor, str):
        if valor not in GRADACIONES:
            raise ValueError(f'gradación desconocida «{valor}» (hay: {", ".join(GRADACIONES)})')
        return dict(GRADACIONES[valor])
    base = dict(GRADACIONES[valor.get('preset', 'balance')])
    base.update({k: v for k, v in valor.items() if k != 'preset'})
    return base


def huella(cfg):
    h = hashlib.sha1()
    h.update((ORIGINALES / cfg['origen']).read_bytes())
    h.update(json.dumps([VERSION_SCRIPT, cfg, CONFIG.get('calidad'), CONFIG.get('anchos'),
                         gradacion_de(cfg.get('gradacion'))], sort_keys=True).encode())
    return h.hexdigest()[:8]


def abrir(nombre):
    imagen = Image.open(ORIGINALES / nombre)
    return ImageOps.exif_transpose(imagen).convert('RGB')


# ───────────────────────── Parches (tapar marcas y letreros ajenos) ─────────────────────────
# Sin numpy (no se instala nada): la aritmética con signo va en bandas de 32 bits («F») con ImageMath.

def _flotante(imagen):
    """RGB → sus tres bandas en coma flotante (para restar sin recortar a 0–255)."""
    return [banda.convert('F') for banda in imagen.split()]


def _a_rgb(bandas):
    return Image.merge('RGB', [ImageMath.lambda_eval(lambda a: a['b'] + 0.5, b=b).convert('L') for b in bandas])


def _peso(mascara):
    """Máscara L (255 = sí) → banda F de 0 a 1."""
    return ImageMath.lambda_eval(lambda a: a['m'] / 255, m=mascara.convert('F'))


def _binaria(mascara):
    return mascara.point(lambda v: 255 if v else 0)


def empujar_tirar(bandas, peso):
    """Interpolación «tirar y empujar» (pull-push): donde `peso` (banda F de 0 a 1) vale 0 pone una
    mezcla suave de lo conocido, con una pirámide de promedios ponderados. Llega desde todos los
    bordes a la vez: sin el tono claro de un cierre morfológico ni las rayas de interpolar por columnas."""
    pm = [ImageMath.lambda_eval(lambda a: a['b'] * a['w'], b=b, w=peso) for b in bandas]
    niveles = [(pm, peso)]
    w = peso
    while w.width > 1 or w.height > 1:
        tam = ((w.width + 1) // 2, (w.height + 1) // 2)
        pm, w = [b.resize(tam, Image.BOX) for b in pm], w.resize(tam, Image.BOX)
        niveles.append((pm, w))
    pm, w = niveles[-1]
    lleno = [ImageMath.lambda_eval(lambda a: a['p'] / a['max'](a['w'], 1e-6), p=p, w=w) for p in pm]
    for pm, w in reversed(niveles[:-1]):
        lleno = [ImageMath.lambda_eval(lambda a: a['p'] + (1 - a['w']) * a['u'], p=p, w=w, u=u.resize(w.size, Image.BILINEAR))
                 for p, u in zip(pm, lleno)]
    return lleno


def con_grano(relleno, grano, suave=0):
    """Ruido de luminancia (el mismo en los tres canales) de desviación `grano`; `suave` lo
    desenfoca un poco para que parezca grano de foto y no ruido digital."""
    if not grano:
        return relleno
    ruido = Image.effect_noise(relleno.size, grano * (1 + 1.6 * suave))
    if suave:
        ruido = ruido.filter(ImageFilter.GaussianBlur(suave))
    return ImageChops.add(relleno, Image.merge('RGB', [ruido] * 3), 1.0, -128)


def grano_local(region, hueco):
    """El grano de la superficie que rodea el hueco: la MEDIANA del detalle fino de su luminancia
    (robusta: los bordes de las letras vecinas no la inflan), en desviación equivalente."""
    duro = _binaria(hueco)
    anillo = ImageChops.subtract(duro.filter(ImageFilter.MaxFilter(9)), duro)
    if not anillo.getbbox():
        return 0
    gris = region.convert('L')
    detalle = ImageChops.difference(gris, gris.filter(ImageFilter.GaussianBlur(1.2)))
    return 1.1 * ImageStat.Stat(detalle, anillo).median[0]


def _conocido(hueco, ignorar):
    conocido = ImageOps.invert(_binaria(hueco))
    return ImageChops.subtract(conocido, ignorar) if ignorar else conocido


def rellenar(region, hueco, ignorar=None, grano='auto'):
    """El hueco (L, ≠ 0 = se rellena) con la interpolación suave de lo que lo rodea (sin lo que
    marca `ignorar`) más el grano de esa superficie («grano»: "auto" o la desviación en niveles)."""
    lleno = _a_rgb(empujar_tirar(_flotante(region), _peso(_conocido(hueco, ignorar))))
    return con_grano(lleno, grano_local(region, hueco) if grano == 'auto' else grano, suave=0.6)


def clonar_sin_costura(region, fuente, hueco, ignorar=None):
    """Clon «sin costura» (aproximación rápida del clonado de Poisson): la TEXTURA de `fuente` con
    la luz y el color de `region`. La diferencia entre ambas se conoce fuera del hueco y se
    interpola suave hacia adentro, así que el clon no deja borde ni cambio de tono."""
    t, f = _flotante(region), _flotante(fuente)
    diferencia = [ImageMath.lambda_eval(lambda a: a['t'] - a['f'], t=x, f=y) for x, y in zip(t, f)]
    diferencia = empujar_tirar(diferencia, _peso(_conocido(hueco, ignorar)))
    return _a_rgb([ImageMath.lambda_eval(lambda a: a['f'] + a['d'], f=y, d=d) for y, d in zip(f, diferencia)])


def buscar_desde(imagen, caja, hueco, prohibido=None, distancias=(1.15, 1.6, 2.2, 3.0, 4.2), direcciones=16):
    """«desde»: "auto" → desplazamiento (px) de la fuente del clon. Prueba `direcciones` ×
    `distancias` (múltiplos del lado mayor del hueco) y elige la fuente cuyo anillo se parece más
    al que rodea el hueco (forma y textura; el color lo corrige el clon sin costura) y que no trae
    más detalle que ese anillo (ni un borde ni un objeto), sin salirse de la foto ni pisar otra
    zona tapada (`prohibido`: L del tamaño de la foto)."""
    W, H = imagen.size
    x0, y0, x1, y1 = caja
    duro = _binaria(hueco)
    cuadro = duro.getbbox()
    if not cuadro:
        return 0, 0
    lado = max(cuadro[2] - cuadro[0], cuadro[3] - cuadro[1])
    con_anillo = duro.filter(ImageFilter.MaxFilter(7))
    anillo = ImageChops.subtract(con_anillo, duro)
    gris = imagen.convert('L')
    region = gris.crop(caja)

    def detalle(g):
        return ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(1.5)))

    det_region = detalle(region)
    actividad = ImageStat.Stat(det_region, anillo).mean[0]
    mejor, menor = (0, 0), float('inf')
    for d in distancias:
        r = d * lado
        for k in range(direcciones):
            angulo = 2 * math.pi * k / direcciones
            dx, dy = round(r * math.cos(angulo)), round(r * math.sin(angulo))
            fuente_caja = (x0 + dx, y0 + dy, x1 + dx, y1 + dy)
            if fuente_caja[0] < 0 or fuente_caja[1] < 0 or fuente_caja[2] > W or fuente_caja[3] > H:
                continue
            if prohibido is not None and ImageChops.multiply(prohibido.crop(fuente_caja), con_anillo).getbbox():
                continue
            fuente = gris.crop(fuente_caja)
            forma = ImageStat.Stat(ImageChops.subtract(region, fuente, 1, 128), anillo).stddev[0]
            det_fuente = detalle(fuente)
            textura = ImageStat.Stat(ImageChops.difference(det_region, det_fuente), anillo).mean[0]
            exceso = max(0.0, ImageStat.Stat(det_fuente, duro).mean[0] - actividad)
            costo = forma + 0.5 * textura + 1.5 * exceso + 0.4 * d
            if costo < menor:
                mejor, menor = (dx, dy), costo
    return mejor


def angulo_de(puntos):
    """Inclinación (grados, antihoraria: + sube hacia la derecha) del lado más largo de un polígono."""
    lados = [(puntos[i], puntos[(i + 1) % len(puntos)]) for i in range(len(puntos))]
    (x0, y0), (x1, y1) = max(lados, key=lambda l: math.dist(*l))
    if x1 < x0:
        x0, y0, x1, y1 = x1, y1, x0, y0
    return math.degrees(math.atan2(y0 - y1, x1 - x0))


def interpolar_banda(region, hueco, angulo, grano):
    """Rellena el hueco A LO LARGO de una banda inclinada `angulo` grados (el eje de un letrero
    sobre un toldo, una viga, una cinta): gira la región para dejar la banda horizontal y cada fila
    va del color de su extremo izquierdo al del derecho. Conserva el degradado de un canto al otro
    de la banda (luz arriba, sombra abajo) sin mezclarlo con lo que hay fuera de ella."""
    girada = region.rotate(-angulo, resample=Image.BICUBIC, expand=True)
    mascara = _binaria(hueco).rotate(-angulo, resample=Image.NEAREST, expand=True)
    valida = Image.new('L', region.size, 255).rotate(-angulo, resample=Image.NEAREST, expand=True)
    valida = valida.filter(ImageFilter.MinFilter(5))  # sin el borde negro que deja el giro
    ancho, alto = girada.size
    pg, pm, pv = girada.load(), mascara.load(), valida.load()

    def promedio(xs, y):
        colores = [pg[x, y] for x in xs if 0 <= x < ancho and pv[x, y] and not pm[x, y]]
        if not colores:
            return None
        return tuple(sum(c[i] for c in colores) / len(colores) for i in range(3))

    tramos = {}  # fila → [(a, b, color_izq, color_der)]
    for y in range(alto):
        x = 0
        while x < ancho:
            if pm[x, y]:
                a = x
                while x < ancho and pm[x, y]:
                    x += 1
                b = x - 1
                izq, der = promedio(range(a - 5, a - 1), y), promedio(range(b + 2, b + 6), y)
                tramos.setdefault(y, []).append([a, b, izq or der, der or izq])
            x += 1
    # Los extremos de filas vecinas se promedian (5 filas): sin rayas de fila a fila.
    filas = sorted(tramos)
    for y in filas:
        for tramo in tramos[y]:
            for lado in (2, 3):
                vecinos = [t[lado] for yy in range(y - 2, y + 3) for t in tramos.get(yy, [])
                           if t[lado] is not None and abs(t[0] - tramo[0]) < 12]
                if vecinos:
                    tramo[lado] = tuple(sum(c[i] for c in vecinos) / len(vecinos) for i in range(3))
    relleno = girada.copy()
    pr = relleno.load()
    for y in filas:
        for a, b, izq, der in tramos[y]:
            if izq is None:
                continue
            for x in range(a, b + 1):
                f = (x - a + 1) / (b - a + 2)
                pr[x, y] = tuple(round(izq[i] + (der[i] - izq[i]) * f) for i in range(3))
    vuelta = relleno.rotate(angulo, resample=Image.BICUBIC, expand=True)
    dx, dy = (vuelta.width - region.width) // 2, (vuelta.height - region.height) // 2
    vuelta = vuelta.crop((dx, dy, dx + region.width, dy + region.height))
    return con_grano(vuelta, grano, suave=0.6)


def _poligono(parche, W, H):
    puntos = parche.get('poligono') or [
        [parche['caja'][0], parche['caja'][1]], [parche['caja'][2], parche['caja'][1]],
        [parche['caja'][2], parche['caja'][3]], [parche['caja'][0], parche['caja'][3]]]
    return [(x * W, y * H) for x, y in puntos]


def zonas_tapadas(tamano, parches):
    """Todas las zonas de los parches de una foto (L del tamaño de la foto): un clon nunca las usa de fuente."""
    W, H = tamano
    zonas = Image.new('L', tamano, 0)
    dibujo = ImageDraw.Draw(zonas)
    for parche in parches:
        dibujo.polygon(_poligono(parche, W, H), fill=255)
    return zonas.filter(ImageFilter.MaxFilter(5))


def mascara_letras(recorte, zona, parche):
    """Los trazos de un letrero dentro de la zona: lo que es más oscuro («tinta»: "oscura", por
    defecto) o más claro ("clara") que su entorno por al menos «umbral» niveles (22), con un
    filtro del tamaño del trazo más grueso («grosor», px del original), agrandado «crecer» px (2)."""
    lado = 2 * parche.get('grosor', 5) + 1
    oscura = parche.get('tinta', 'oscura') != 'clara'
    filtros = (ImageFilter.MaxFilter(lado), ImageFilter.MinFilter(lado))
    fondo = recorte.filter(filtros[0 if oscura else 1]).filter(filtros[1 if oscura else 0])
    gris, gris_fondo = recorte.convert('L'), fondo.convert('L')
    contraste = ImageChops.subtract(gris_fondo, gris) if oscura else ImageChops.subtract(gris, gris_fondo)
    umbral = parche.get('umbral', 22)
    trazos = ImageChops.multiply(contraste.point(lambda v: 255 if v >= umbral else 0), zona)
    crecer = parche.get('crecer', 2)
    if crecer:
        trazos = ImageChops.multiply(trazos.filter(ImageFilter.MaxFilter(2 * crecer + 1)),
                                     zona.filter(ImageFilter.MaxFilter(2 * crecer + 1)))
    return trazos


def aplicar_parche(imagen, parche, prohibido=None, registro=None):
    """Tapa algo de la foto (un letrero, una marca ajena). Zona: `caja` [x0, y0, x1, y1] o
    `poligono` [[x, y], …] en fracciones del original; `excluir` [[[x, y], …], …]: polígonos que
    NO se tocan (un casco, una mano) ni se usan de referencia. «metodo»:
      "letras"     borra SOLO los trazos del texto (ver mascara_letras): la superficie entre letra
                   y letra queda intacta. «proteger»: luminancia (0–255) de lo que no es letra
                   aunque contraste más (con tinta oscura, lo que esté por debajo: varillas,
                   sombras; con clara, por encima). Los trazos se rellenan suave desde la
                   superficie que los rodea, más su grano; con «desde» ([dx, dy] o "auto"), con
                   la textura de un sitio vecino (lo mejor en madera, tela o rejilla). La
                   referencia es solo la superficie del polígono más «borde» px (2): dibújalo
                   ceñido a la superficie del letrero (la banda del toldo, la tabla).
      "clonar"     la zona entera, con la textura de un sitio vecino desplazado «desde» [dx, dy]
                   (fracciones) o "auto" (buscar_desde), sin costura (toma la luz del sitio).
      "difundir"   la zona entera, interpolada suave desde sus bordes más el grano del entorno.
      "banda"      la zona entera, interpolada A LO LARGO de su lado más largo (o de «angulo»,
                   grados antihorarios): un letrero que llena una banda (toldo, viga, cinta) se
                   rellena con los extremos limpios de esa banda, sin el gris de lo que la rodea.
      "color"      la zona pintada de «color». · "interpolar": columnas de arriba abajo (zonas lisas).
    «suave»: px de transición del borde (12; en "letras" lo fija el grosor). «grano»: "auto" o número."""
    W, H = imagen.size
    puntos = _poligono(parche, W, H)
    metodo = parche.get('metodo', 'clonar')
    suave = parche.get('suave', 12)
    if metodo == 'letras':  # margen para que los filtros no lean fuera de la foto
        suave = max(suave, 2 * parche.get('grosor', 5) + 4)
    xs, ys = [p[0] for p in puntos], [p[1] for p in puntos]
    contexto = max(suave, 18) if metodo == 'banda' else suave  # la banda necesita sus extremos limpios
    caja = (max(0, round(min(xs)) - contexto), max(3, round(min(ys)) - contexto),
            min(W, round(max(xs)) + contexto), min(H - 3, round(max(ys)) + contexto))
    ancho, alto = caja[2] - caja[0], caja[3] - caja[1]
    hueco = Image.new('L', (ancho, alto), 0)
    ImageDraw.Draw(hueco).polygon([(x - caja[0], y - caja[1]) for x, y in puntos], fill=255)
    ignorar = None
    if parche.get('excluir'):
        ignorar = Image.new('L', (ancho, alto), 0)
        for poligono in parche['excluir']:
            ImageDraw.Draw(ignorar).polygon([(x * W - caja[0], y * H - caja[1]) for x, y in poligono], fill=255)
        ignorar = ignorar.filter(ImageFilter.MaxFilter(3))
    region = imagen.crop(caja)

    def fuente_de(mascara):
        desde = parche.get('desde', 'auto' if metodo == 'clonar' else False)
        if not desde:
            return None
        dx, dy = buscar_desde(imagen, caja, mascara, prohibido) if desde == 'auto' else (round(desde[0] * W), round(desde[1] * H))
        if registro is not None:  # para revisar qué eligió "auto" (y fijarlo en la config si conviene)
            registro.append([round(dx / W, 4), round(dy / H, 4)])
        return imagen.crop((caja[0] + dx, caja[1] + dy, caja[2] + dx, caja[3] + dy))

    if metodo == 'letras':
        trazos = mascara_letras(region, hueco, parche)
        if parche.get('proteger') is not None:
            limite = parche['proteger']
            oscura = parche.get('tinta', 'oscura') != 'clara'
            intocable = region.convert('L').point(lambda v: 255 if (v < limite if oscura else v > limite) else 0)
            margen = parche.get('protegerMargen', 2)  # px alrededor de lo protegido que tampoco se toca
            if margen:
                intocable = intocable.filter(ImageFilter.MaxFilter(2 * margen + 1))
            ignorar = ImageChops.lighter(ignorar, intocable) if ignorar else intocable
        if ignorar:
            trazos = ImageChops.subtract(trazos, ignorar)
        if not trazos.getbbox():
            return
        # La referencia del relleno es SOLO la superficie del letrero: el polígono y un borde de
        # pocos px (lo de fuera —la máquina oscura bajo un toldo claro— lo ensuciaría de gris).
        borde = 2 * (parche.get('crecer', 2) + parche.get('borde', 2)) + 1
        fuera = ImageOps.invert(hueco.filter(ImageFilter.MaxFilter(borde)))
        referencia = ImageChops.lighter(ignorar, fuera) if ignorar else fuera
        fuente = fuente_de(trazos)
        relleno = (clonar_sin_costura(region, fuente, trazos, referencia) if fuente
                   else rellenar(region, trazos, referencia, parche.get('grano', 'auto')))
        imagen.paste(relleno, caja[:2], trazos.filter(ImageFilter.GaussianBlur(0.8)))
        return
    radio = suave // 2
    ampliado = hueco.filter(ImageFilter.MaxFilter(2 * radio + 1)) if radio else hueco
    if ignorar:
        ampliado = ImageChops.subtract(ampliado, ignorar)
    mascara = ampliado.filter(ImageFilter.GaussianBlur(radio)) if radio else ampliado
    if ignorar:
        mascara = ImageChops.subtract(mascara, ignorar)
    if metodo == 'color':
        relleno = Image.new('RGB', (ancho, alto), parche['color'])
    elif metodo == 'interpolar':
        relleno = interpolar(imagen, caja, ampliado, parche.get('grano', 3), parche.get('desenfoque', 1))
    elif metodo == 'difundir':
        relleno = rellenar(region, ampliado, ignorar, parche.get('grano', 'auto'))
    elif metodo == 'banda':
        angulo = parche.get('angulo')
        if angulo is None:
            angulo = angulo_de(puntos)
        grano = parche.get('grano', 'auto')
        relleno = interpolar_banda(region, ampliado, angulo, grano_local(region, ampliado) if grano == 'auto' else grano)
    else:
        relleno = clonar_sin_costura(region, fuente_de(ampliado), ampliado, ignorar)
    imagen.paste(relleno, caja[:2], mascara)


def interpolar(imagen, caja, hueco, grano, desenfoque):
    """Rellena el hueco columna a columna, del borde de arriba al de abajo, y le añade grano."""
    ancho, alto = hueco.size
    tramos = [hueco.crop((x, 0, x + 1, alto)).getbbox() for x in range(ancho)]
    arriba, abajo = Image.new('RGB', (ancho, 1)), Image.new('RGB', (ancho, 1))
    promedio = lambda xi, a, b: imagen.crop((xi, a, xi + 1, b)).resize((1, 1), Image.BOX).getpixel((0, 0))  # noqa: E731
    for x, tramo in enumerate(tramos):
        yi, yf = caja[1] + (tramo[1] if tramo else 0), caja[1] + (tramo[3] if tramo else alto)
        arriba.putpixel((x, 0), promedio(caja[0] + x, yi - 3, yi))
        abajo.putpixel((x, 0), promedio(caja[0] + x, yf, yf + 3))
    arriba, abajo = (fila.filter(ImageFilter.BoxBlur(desenfoque)) for fila in (arriba, abajo))
    relleno = imagen.crop(caja)
    for x, tramo in enumerate(tramos):
        if tramo:
            pareja = Image.new('RGB', (1, 2))
            pareja.putpixel((0, 0), arriba.getpixel((x, 0)))
            pareja.putpixel((0, 1), abajo.getpixel((x, 0)))
            relleno.paste(pareja.resize((1, tramo[3] - tramo[1]), Image.BILINEAR), (x, tramo[1]))
    return con_grano(relleno, grano)


# ───────────────────────── Recorte y gradación ─────────────────────────

def caja_exacta(imagen, cfg):
    """Caja en píxeles con la proporción exacta: recorta el lado sobrante alrededor del centro."""
    W, H = imagen.size
    x0, y0, x1, y1 = (v * (W if i % 2 == 0 else H) for i, v in enumerate(cfg.get('caja', [0, 0, 1, 1])))
    ancho, alto = x1 - x0, y1 - y0
    if cfg.get('proporcion'):
        p = proporcion(cfg['proporcion'])
        if ancho / alto > p:
            x0 += (ancho - alto * p) / 2
            ancho = alto * p
        else:
            y0 += (alto - ancho / p) / 2
            alto = ancho / p
        ancho = int(ancho)
        alto = round(ancho / p)
    ancho, alto = round(ancho), round(alto)
    x0, y0 = max(0, min(round(x0), W - ancho)), max(0, min(round(y0), H - alto))
    return x0, y0, x0 + ancho, y0 + alto


def tramo(grado, puntos):
    """Interpolación lineal por tramos sobre la rueda de color: `puntos` = [[grado, valor], …]
    ordenados de 0 a 360 (el primero y el último deberían coincidir: la rueda da la vuelta)."""
    for (a, va), (b, vb) in zip(puntos, puntos[1:]):
        if a <= grado <= b:
            return va + (vb - va) * (grado - a) / (b - a) if b > a else va
    return puntos[-1][1]


def gamma_automatica(imagen, objetivo=0.42, fuerza=0.55, limites=(0.92, 1.6)):
    """Gamma que acerca la luminancia media de la foto a `objetivo` (0–1): `fuerza` 0 = nada,
    1 = toda. Baja las fotos muy claras (interiores blancos, papel) sin tocar sus blancos y apenas
    levanta las oscuras (los contraluces deben seguir siendo contraluces)."""
    chica = imagen.convert('L').resize((96, max(1, round(96 * imagen.height / imagen.width))), Image.BILINEAR)
    media = min(0.95, max(0.05, ImageStat.Stat(chica).mean[0] / 255))
    gamma = 1 + fuerza * (math.log(objetivo) / math.log(media) - 1)
    return max(limites[0], min(limites[1], gamma))


def gradar(imagen, g):
    """Gradación de la marca. `g` es un diccionario completo (un preset resuelto); todo es opcional:
      gamma            número (1 = igual; >1 oscurece los medios sin tocar los blancos) o "auto"
                       (gamma_automatica con gammaObjetivo, gammaFuerza y gammaLimites; recortar()
                       la mide en la foto entera antes de recortar)
      brillo           multiplicador lineal (1 = igual)
      saturacionTono   [[grado, factor], …]: saturación por color (0 rojo, 30 naranja, 60 amarillo,
                       120 verde, 180 cian, 240 azul, 300 magenta, 360 rojo otra vez)
      giroTono         [[grado, desplazamiento en grados], …]: mueve el tono (verdes → oliva…)
      luminanciaTono   [[grado, factor ≤ 1], …]: oscurece un color en proporción a su saturación,
                       como un filtro en blanco y negro (cielos azules y follaje más bajos, sin
                       tocar los grises)
      nd               {"fuerza": 0–0,6, "hasta": 0–1}: filtro degradado desde arriba (cielos lavados)
      saturacion       global (1 = igual) · curva: curva en S, 0–1 (contraste de medios sin quemar
                       los extremos) · contraste: el de Pillow (1 = igual)
      calidez          0–1: mezcla en «luz suave» de un mapa sombras → luces (los colores
                       `sombras` y `luces`): sombras carbón y luces doradas
      negro / blanco   niveles de salida, número o [r, g, b]: negros levantados al carbón de la
                       página y blancos que no queman (hueso cálido)
      vineta           0–0,6: cuánto se oscurecen los bordes."""
    gamma = g.get('gamma', 1)
    if gamma == 'auto':
        gamma = gamma_automatica(imagen, g.get('gammaObjetivo', 0.42), g.get('gammaFuerza', 0.55), g.get('gammaLimites', (0.92, 1.6)))
    if gamma != 1:
        imagen = imagen.point([round(255 * (v / 255) ** gamma) for v in range(256)] * 3)
    if g.get('brillo', 1) != 1:
        imagen = ImageEnhance.Brightness(imagen).enhance(g['brillo'])
    saturacion_tono, giro_tono, luminancia_tono = g.get('saturacionTono'), g.get('giroTono'), g.get('luminanciaTono')
    if saturacion_tono or giro_tono or luminancia_tono:
        # En HSV de Pillow el tono va de 0 a 255 (= 0–360°).
        tono, sat, valor = imagen.convert('HSV').split()
        if luminancia_tono:
            # Como un filtro de color en blanco y negro: oscurece un color según cuán saturado
            # esté (un cielo azul intenso baja; un gris no se entera). Factor 1 = igual, 0,6 = −40 %.
            caida = tono.point([max(0, min(255, round(255 * (1 - tramo(i * 360 / 256, luminancia_tono))))) for i in range(256)])
            valor = ImageChops.multiply(valor, ImageOps.invert(ImageChops.multiply(sat, caida)))
        if saturacion_tono:
            factores = [max(0, min(255, round(255 * tramo(i * 360 / 256, saturacion_tono)))) for i in range(256)]
            sat = ImageChops.multiply(sat, tono.point(factores))
        if giro_tono:
            tono = tono.point([round(((i * 360 / 256 + tramo(i * 360 / 256, giro_tono)) % 360) * 256 / 360) % 256 for i in range(256)])
        imagen = Image.merge('HSV', (tono, sat, valor)).convert('RGB')
    if g.get('saturacion', 1) != 1:
        imagen = ImageEnhance.Color(imagen).enhance(g['saturacion'])
    curva = g.get('curva', 0)
    if curva:
        def en_s(v):
            x = v / 255
            return 255 * (x + curva * (x * x * (3 - 2 * x) - x))
        imagen = imagen.point([max(0, min(255, round(en_s(v)))) for v in range(256)] * 3)
    if g.get('contraste', 1) != 1:
        imagen = ImageEnhance.Contrast(imagen).enhance(g['contraste'])
    calidez = g.get('calidez', 0)
    if calidez:
        # Mapa de tonos por luminancia: sombras → carbón, luces → oro; se mezcla en «luz suave».
        luminancia = imagen.convert('L')
        canales = [luminancia.point(lambda v, a=a, b=b: round(a + (b - a) * v / 255))
                   for a, b in zip(g['sombras'], g['luces'])]
        mapa = Image.merge('RGB', canales)
        imagen = Image.blend(imagen, ImageChops.soft_light(imagen, mapa), min(1, calidez))
    nd = g.get('nd')
    if nd:
        # Filtro degradado (ND) para cielos claros o lavados: oscurece desde el borde de arriba
        # («fuerza» 0–0,6) y se desvanece hasta «hasta» (fracción del alto del recorte).
        fuerza, hasta = (nd.get('fuerza', 0.3), nd.get('hasta', 0.5)) if isinstance(nd, dict) else (nd, 0.5)
        limite = max(1.0, hasta * imagen.height)
        columna = Image.new('L', (1, imagen.height))
        columna.putdata([round(255 * (t * t * (3 - 2 * t))) for t in (max(0.0, 1 - y / limite) for y in range(imagen.height))])
        imagen = Image.composite(ImageEnhance.Brightness(imagen).enhance(1 - fuerza), imagen, columna.resize(imagen.size))
    negro, blanco = g.get('negro', 0), g.get('blanco', 255)
    negro = list(negro) if isinstance(negro, (list, tuple)) else [negro] * 3
    blanco = list(blanco) if isinstance(blanco, (list, tuple)) else [blanco] * 3
    if negro != [0, 0, 0] or blanco != [255, 255, 255]:
        # Negros levantados hacia el carbón de la página (#111213): cine, no negro puro; y los
        # blancos, a un hueso cálido en vez del blanco de pantalla.
        lut = []
        for n, b in zip(negro, blanco):
            lut += [round(n + v * (b - n) / 255) for v in range(256)]
        imagen = imagen.point(lut)
    vineta = g.get('vineta', 0)
    if vineta:
        radial = Image.radial_gradient('L').resize(imagen.size, Image.BILINEAR)  # 0 en el centro, 255 en el borde
        mascara = radial.point(lambda v: round(255 * max(0.0, min(1.0, (v / 255 - 0.38) / 0.62)) ** 1.5))
        imagen = Image.composite(ImageEnhance.Brightness(imagen).enhance(1 - vineta), imagen, mascara)
    return imagen


def a_plano(recorte, detalle=0.05, reticula=40, sombra=0.3, resolucion=1000, histeresis=0.45, suavizado=5, desenfoque=1.1):
    """La foto como plano: sus bordes en celeste (#A9CBEF) sobre azul de plano (#0D2742) con la
    retícula y un eco muy tenue de las luces. Los bordes se buscan en una copia de `resolucion` px
    de ancho, alisada (mediana `suavizado` + desenfoque `desenfoque`: así la textura y el ruido no
    se vuelven líneas), con histéresis (un borde débil queda solo si toca uno fuerte: trazos
    continuos, no punteados) y se agrandan suaves al tamaño del recorte: líneas finas de dibujo.
    `detalle`: fracción de píxeles que son borde fuerte (0,04 limpio · 0,08 cargado). Para fotos
    con mucha textura (follaje, grava, malla): suavizado 9, desenfoque 1,8, histeresis 0,6."""
    ancho, alto = recorte.size
    escala = min(1, resolucion / ancho)
    chico = recorte.convert('L').resize((max(1, round(ancho * escala)), max(1, round(alto * escala))), Image.LANCZOS)
    chico = ImageOps.autocontrast(chico, cutoff=1).filter(ImageFilter.MedianFilter(suavizado)).filter(ImageFilter.GaussianBlur(desenfoque))
    bordes = chico.filter(ImageFilter.FIND_EDGES)
    ImageDraw.Draw(bordes).rectangle([0, 0, bordes.width - 1, bordes.height - 1], outline=0, width=3)  # sin marco
    histograma, total = bordes.histogram(), bordes.width * bordes.height
    acumulado, umbral = 0, 255
    for valor in range(255, -1, -1):
        acumulado += histograma[valor]
        if acumulado >= total * detalle:
            umbral = max(1, valor)
            break
    fuertes = bordes.point(lambda v: 255 if v >= umbral else 0)
    debiles = bordes.point(lambda v: 255 if v >= umbral * histeresis else 0)
    for _ in range(8):  # histéresis: los fuertes crecen solo por donde hay borde débil
        fuertes = ImageChops.darker(fuertes.filter(ImageFilter.MaxFilter(3)), debiles)
    lineas = fuertes.filter(ImageFilter.MedianFilter(3))
    lineas = lineas.resize((ancho, alto), Image.BILINEAR).filter(ImageFilter.GaussianBlur(0.7))
    lineas = lineas.point(lambda v: 255 if v > 170 else (0 if v < 50 else round((v - 50) * 255 / 120)))
    tono = ImageOps.colorize(recorte.convert('L').filter(ImageFilter.GaussianBlur(ancho / 300)), black='#06142A', white='#1D4A78')
    base = Image.blend(Image.new('RGB', (ancho, alto), '#0D2742'), tono, sombra)
    dibujo = ImageDraw.Draw(base)
    paso = max(16, round(ancho / reticula))
    for i, x in enumerate(range(0, ancho, paso)):
        dibujo.line([(x, 0), (x, alto)], fill=(33, 76, 122) if i % 5 == 0 else (20, 51, 87), width=1)
    for i, y in enumerate(range(0, alto, paso)):
        dibujo.line([(0, y), (ancho, y)], fill=(33, 76, 122) if i % 5 == 0 else (20, 51, 87), width=1)
    return Image.composite(Image.new('RGB', (ancho, alto), '#A9CBEF'), base, lineas)


def anchos_para(ancho_real):
    anchos = [a for a in CONFIG['anchos'] if a <= ancho_real]
    if not anchos or ancho_real > anchos[-1] * 1.12:
        anchos.append(ancho_real)
    return anchos


def opciones_placeholder():
    """"placeholder" en la config: un número (ancho en px; todas las fotos lo llevan) o
    {"ancho": 16, "porDefecto": false} (solo las que piden "placeholder": true). Cada uno pesa
    ~150 bytes de base64 que no se comprimen y viajan DENTRO del JS (fotos.json va en el bundle):
    se reserva para las fotos que se ven al cargar (portada…); las demás se funden sobre su `color`."""
    valor = CONFIG.get('placeholder', 24)
    if isinstance(valor, dict):
        return valor.get('ancho', 16), valor.get('porDefecto', True)
    return valor, True


def placeholder(recorte, ancho=None):
    ancho = ancho or opciones_placeholder()[0]
    alto = max(1, round(recorte.height * ancho / recorte.width))
    chico = recorte.resize((ancho, alto), Image.LANCZOS)
    buffer = io.BytesIO()
    chico.save(buffer, 'WEBP', quality=45, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buffer.getvalue()).decode()


def color_medio(recorte):
    r, g, b = recorte.resize((1, 1), Image.BOX).getpixel((0, 0))
    return f'#{r:02x}{g:02x}{b:02x}'


def recortar(cfg):
    imagen = abrir(cfg['origen'])
    parches = [p for p in cfg.get('parches', []) if not p.get('_apagado')]
    prohibido = zonas_tapadas(imagen.size, parches) if parches else None
    for parche in parches:
        aplicar_parche(imagen, parche, prohibido)
    recorte = imagen.crop(caja_exacta(imagen, cfg))
    if cfg.get('modoPlano') is not None:
        return a_plano(recorte, **cfg['modoPlano'])
    g = gradacion_de(cfg.get('gradacion'))
    if g and g.get('gamma') == 'auto':
        # Medida en la foto ENTERA: todos los recortes de una foto (tarjeta, móvil…) quedan iguales.
        g['gamma'] = gamma_automatica(imagen, g.get('gammaObjetivo', 0.42), g.get('gammaFuerza', 0.55), g.get('gammaLimites', (0.92, 1.6)))
    return gradar(recorte, g) if g else recorte


def procesar(args):
    """Devuelve (id, entrada del manifiesto, bytes escritos, error)."""
    id_, cfg, forzar = args
    try:
        firma = huella(cfg)
        recorte = recortar(cfg)
        anchos = anchos_para(recorte.width)
        nombre = f'{nombre_archivo(id_)}-{firma}'
        escritos = 0
        for ancho in anchos:
            alto = round(recorte.height * ancho / recorte.width)
            variante = recorte if ancho == recorte.width else recorte.resize((ancho, alto), Image.LANCZOS)
            for formato, opciones in (('avif', {'quality': CONFIG['calidad']['avif'], 'speed': 4}),
                                      ('webp', {'quality': CONFIG['calidad']['webp'], 'method': 6})):
                destino = SALIDA / f'{nombre}-{ancho}.{formato}'
                if forzar or not destino.exists():
                    variante.save(destino, formato.upper(), **opciones)
                    escritos += destino.stat().st_size
        ancho_ph, por_defecto = opciones_placeholder()
        entrada = {
            'ancho': recorte.width,
            'alto': recorte.height,
            'proporcion': cfg.get('proporcion') or f'{recorte.width}:{recorte.height}',
            'anchos': anchos,
            'base': f'/fotos/{nombre}',
            # Las versiones de plano son azul liso con líneas: les basta el color.
            **({'placeholder': placeholder(recorte, ancho_ph)} if cfg.get('placeholder', por_defecto) and cfg.get('modoPlano') is None else {}),
            'color': color_medio(recorte),
            'alt': cfg.get('alt', ''),
        }
        if cfg.get('referencial'):
            entrada['referencial'] = True
        if cfg.get('credito'):
            entrada['credito'] = cfg['credito']
        return id_, entrada, escritos, None
    except Exception as error:  # una foto con error no detiene las demás
        return id_, None, 0, f'{type(error).__name__}: {error}'


# ───────────────────────── Qué hay que procesar ─────────────────────────

def trabajos_de_config():
    """Las fotos de "fotos" y sus usos (recortes alternativos «id@uso»)."""
    salida = {}
    for id_, cfg in CONFIG.get('fotos', {}).items():
        if id_.startswith('_'):
            continue
        base = {k: v for k, v in cfg.items() if k != 'usos' and not k.startswith('_')}
        salida[id_] = base
        for uso, extra in (cfg.get('usos') or {}).items():
            if uso.startswith('_'):
                continue
            # El uso hereda origen, gradación, alt, crédito y parches; cambia caja/proporción (o lo que traiga).
            salida[f'{id_}@{uso}'] = {**{k: v for k, v in base.items() if k not in ('caja', 'proporcion')}, **extra}
    return salida


def trabajos_de_obras():
    """Todas las imágenes de fotos_originales/obras/<idObra>/, y los videos con su póster.
    La PRIMERA imagen de cada carpeta (01.jpg) es la portada de la obra: recibe además lo de
    "obras" → "portada" (los mismos usos que las portadas de ejemplo: «tarjeta» 4:5 y la versión
    de plano para el comparador), así una obra real entra en el portafolio sin configurar nada."""
    fotos, videos = {}, {}
    if not OBRAS.exists():
        return fotos, videos
    obras_cfg = CONFIG.get('obras', {})
    ajustes = obras_cfg.get('ajustes', {})
    de_portada = {k: v for k, v in (obras_cfg.get('portada') or {}).items() if not k.startswith('_')}
    for carpeta in sorted(p for p in OBRAS.iterdir() if p.is_dir() and not p.name.startswith(('_', '.'))):
        archivos = sorted(carpeta.iterdir(), key=lambda p: p.name.lower())
        primera = next((a for a in archivos if a.suffix.lower() in IMAGENES), None)
        for archivo in archivos:
            sufijo = archivo.suffix.lower()
            clave = f'{carpeta.name}/{archivo.stem}'
            if sufijo in IMAGENES:
                cfg = {
                    'origen': archivo.relative_to(ORIGINALES).as_posix(),
                    'gradacion': obras_cfg.get('gradacion', 'suave'),
                    'alt': '',
                    **({'proporcion': obras_cfg['proporcion']} if obras_cfg.get('proporcion') else {}),
                    **(de_portada if archivo == primera else {}),
                    **{k: v for k, v in ajustes.get(clave, {}).items() if not k.startswith('_')},
                }
                usos = cfg.pop('usos', None) or {}
                fotos[f'obras/{clave}'] = cfg
                for uso, extra in usos.items():
                    if not uso.startswith('_'):
                        hereda = {k: v for k, v in cfg.items() if k not in ('caja', 'proporcion', 'plano')}
                        fotos[f'obras/{clave}@{uso}'] = {**hereda, **{k: v for k, v in extra.items() if not k.startswith('_')}}
            elif sufijo in VIDEOS:
                videos.setdefault(f'obras/{clave}', []).append(archivo)
    return fotos, videos


def copiar_videos(videos, manifiesto_fotos):
    """Copia cada video a public/videos/<nombre>-<huella>.<ext> y arma su entrada de videos.json."""
    SALIDA_VIDEOS.mkdir(parents=True, exist_ok=True)
    manifiesto, vigentes = {}, set()
    for id_, archivos in videos.items():
        entrada = {}
        for archivo in archivos:
            firma = hashlib.sha1(archivo.read_bytes()).hexdigest()[:8]
            destino = SALIDA_VIDEOS / f'{nombre_archivo(id_)}-{firma}{archivo.suffix.lower()}'
            if not destino.exists():
                shutil.copyfile(archivo, destino)
            vigentes.add(destino.name)
            entrada[archivo.suffix.lower().lstrip('.')] = f'/videos/{destino.name}'
        poster = manifiesto_fotos.get(id_)
        if poster:
            entrada.update({'poster': id_, 'ancho': poster['ancho'], 'alto': poster['alto'], 'alt': poster.get('alt', '')})
        else:
            print(f'  aviso: el video {id_} no tiene póster (pon una imagen con el mismo nombre en su carpeta)')
        manifiesto[id_] = entrada
    for archivo in SALIDA_VIDEOS.glob('*.*'):
        if archivo.name not in vigentes:
            archivo.unlink()
    return manifiesto


def hoja_de_contactos(trabajos, destino, alto_celda=300, ancho_hoja=2000):
    """Todos los recortes en una lámina oscura, con su id y proporción, para revisarlos de un
    vistazo: van en fila mientras quepan (un 21:9 y un 9:16 no ocupan lo mismo)."""
    piezas = []
    for id_, cfg in trabajos.items():
        try:
            recorte = recortar(cfg)
        except Exception as error:  # noqa: BLE001
            print(f'  hoja: {id_} falló ({error})')
            continue
        escala = alto_celda / recorte.height
        piezas.append((id_, recorte.resize((max(1, round(recorte.width * escala)), alto_celda), Image.LANCZOS)))
    if not piezas:
        print('Hoja de contactos: no hay fotos todavía.')
        return
    margen, rotulo = 14, 44
    try:
        fuente = ImageFont.truetype('arial.ttf', 15)
    except OSError:
        fuente = ImageFont.load_default()
    medir = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    # Cada celda mide lo que la foto o su rótulo (id arriba, proporción abajo), lo que sea más ancho.
    celdas = [(id_, pieza, max(pieza.width, round(medir.textlength(id_, font=fuente)))) for id_, pieza in piezas]
    ancho_hoja = max(ancho_hoja, max(c for _, _, c in celdas) + 2 * margen)
    filas, fila, ocupado = [], [], margen
    for celda in celdas:
        if fila and ocupado + celda[2] + margen > ancho_hoja:
            filas.append(fila)
            fila, ocupado = [], margen
        fila.append(celda)
        ocupado += celda[2] + margen
    filas.append(fila)
    hoja = Image.new('RGB', (ancho_hoja, margen + len(filas) * (alto_celda + rotulo + margen)), '#111213')
    dibujo = ImageDraw.Draw(hoja)
    for r, fila in enumerate(filas):
        x, y = margen, margen + r * (alto_celda + rotulo + margen)
        for id_, pieza, celda in fila:
            hoja.paste(pieza, (x, y))
            dibujo.text((x, y + alto_celda + 6), id_, fill='#ECEAE5', font=fuente)
            dibujo.text((x, y + alto_celda + 25), trabajos[id_].get('proporcion') or 'original', fill='#C9A45C', font=fuente)
            x += celda + margen
    Path(destino).parent.mkdir(parents=True, exist_ok=True)
    hoja.save(destino, quality=88)
    print(f'Hoja de contactos: {destino}')


def escribir_creditos(trabajos):
    """src/data/creditos.js: crédito de cada foto referencial que se usa (las de "fotos" cuyo
    origen está en referenciales/), en el orden de creditos.json. Lo lee el modal «Créditos de
    imágenes». Las fotos reales de las obras no llevan crédito (son del ingeniero)."""
    usados = {Path(c['origen']).name for c in trabajos.values() if str(c.get('origen', '')).startswith('referenciales/')}
    fichas = json.loads(CREDITOS_JSON.read_text(encoding='utf-8')) if CREDITOS_JSON.exists() else []
    faltan = sorted(usados - {f.get('archivo') for f in fichas})
    if faltan:
        print(f'  aviso: sin crédito en creditos.json: {", ".join(faltan)}')
    lineas = []
    for f in fichas:
        if f.get('archivo') not in usados:
            continue
        fuente = urlparse(f.get('fuente_url', '')).hostname or ''
        datos = {
            'id': f['id'],
            'titulo': f.get('titulo', ''),
            'autor': f.get('autor', ''),
            'licencia': f.get('licencia', ''),
            'licenciaUrl': f.get('licencia_url', ''),
            'fuente': 'Wikimedia Commons' if fuente.endswith('wikimedia.org') else fuente.removeprefix('www.'),
            'fuenteUrl': f.get('fuente_url', ''),
        }
        lineas.append('  { ' + ', '.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in datos.items()) + ' },')
    CREDITOS_JS.write_text(
        '/**\n'
        ' * Créditos de las fotos REFERENCIALES (modal «Créditos de imágenes» del pie).\n'
        ' * GENERADO por scripts/optimizar_fotos.py desde fotos_originales/referenciales/creditos.json:\n'
        ' * no lo edites a mano. Solo trae las fotos que usa scripts/fotos_config.json, en el orden de\n'
        ' * creditos.json. Cada una: { id, titulo, autor, licencia, licenciaUrl, fuente, fuenteUrl }.\n'
        ' * JS puro (se importa con «.js»): se puede leer con node.\n'
        ' */\n'
        'export const CREDITOS = [\n' + ''.join(l + '\n' for l in lineas) + ']\n',
        encoding='utf-8')
    return len(lineas)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--forzar', action='store_true', help='rehace todas las variantes')
    parser.add_argument('--hoja', help='ruta de una hoja de contactos JPG para revisar los recortes')
    parser.add_argument('--solo', help='ids separados por comas: procesa solo esos (el manifiesto conserva el resto)')
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')  # la consola de Windows no es UTF-8 por defecto

    SALIDA.mkdir(parents=True, exist_ok=True)
    trabajos = trabajos_de_config()
    fotos_obras, videos = trabajos_de_obras()
    repetidos = set(trabajos) & set(fotos_obras)
    if repetidos:
        print(f'aviso: ids repetidos entre "fotos" y obras/: {", ".join(sorted(repetidos))} (gana "fotos")')
    trabajos = {**fotos_obras, **trabajos}
    # Versiones «plano» (para el comparador «Plano / Obra»): mismo recorte, como plano azul.
    for id_, cfg in list(trabajos.items()):
        if cfg.get('plano') and '@' not in id_:
            opciones = cfg['plano'] if isinstance(cfg['plano'], dict) else {}
            trabajos[f'{id_}@plano'] = {
                **{k: v for k, v in cfg.items() if k not in ('plano', 'gradacion', 'parches')},
                'parches': cfg.get('parches', []),
                'gradacion': False,
                'modoPlano': {k: v for k, v in opciones.items() if not k.startswith('_')},
                'alt': f'Versión de plano: {cfg.get("alt", "")}'.strip(),
            }

    previo = json.loads(MANIFIESTO.read_text(encoding='utf-8')) if MANIFIESTO.exists() else {}
    elegidos = trabajos
    if args.solo:
        pedidos = {s.strip() for s in args.solo.split(',') if s.strip()}
        elegidos = {k: v for k, v in trabajos.items() if k in pedidos or k.split('@')[0] in pedidos}

    manifiesto, errores, total = {}, [], 0
    if elegidos:
        with ProcessPoolExecutor(max_workers=2) as grupo:  # poca RAM: dos fotos a la vez
            for id_, entrada, escritos, error in grupo.map(procesar, [(i, c, args.forzar) for i, c in elegidos.items()]):
                if error:
                    errores.append(f'{id_}: {error}')
                    continue
                manifiesto[id_] = entrada
                total += escritos
                if escritos:
                    print(f'  {id_:<36} {entrada["ancho"]}x{entrada["alto"]}  {entrada["anchos"]}  {escritos / 1024:.0f} KB')
    if args.solo:  # conserva lo que no se tocó
        manifiesto = {**{k: v for k, v in previo.items() if k in trabajos and k not in manifiesto}, **manifiesto}
    manifiesto = {k: manifiesto[k] for k in trabajos if k in manifiesto}  # orden estable: el de la config
    # Los recortes «id@uso» no repiten el alt ni «referencial» de su foto base: fotos.json viaja
    # dentro del JS y datosFoto() (src/lib/fotos.js) los completa con los de la base.
    for id_, entrada in manifiesto.items():
        base = manifiesto.get(id_.split('@')[0]) if '@' in id_ else None
        for clave in ('alt', 'referencial'):
            if base and clave in entrada and entrada[clave] == base.get(clave):
                del entrada[clave]

    # Borra las variantes que ya no corresponden a ninguna foto vigente.
    vigentes = {f'{Path(e["base"]).name}-{a}.{f}' for e in manifiesto.values() for a in e['anchos'] for f in ('avif', 'webp')}
    for archivo in SALIDA.glob('*.*'):
        if archivo.name not in vigentes:
            archivo.unlink()

    MANIFIESTO.parent.mkdir(parents=True, exist_ok=True)
    MANIFIESTO.write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifiesto_videos = copiar_videos(videos, manifiesto)
    MANIFIESTO_VIDEOS.write_text(json.dumps(manifiesto_videos, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    creditos = escribir_creditos(trabajos)

    peso = sum(f.stat().st_size for f in SALIDA.glob('*.*'))
    print(f'{len(manifiesto)} fotos · {len(manifiesto_videos)} videos · {creditos} créditos · public/fotos: {peso / 1e6:.2f} MB · escrito ahora: {total / 1024:.0f} KB')
    if args.hoja:
        hoja_de_contactos(elegidos, args.hoja)
    for e in errores:
        print('ERROR', e, file=sys.stderr)
    sys.exit(1 if errores else 0)


if __name__ == '__main__':
    main()
