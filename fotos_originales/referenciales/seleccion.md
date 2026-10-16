# Fotos referenciales — selección

22 fotografías de Wikimedia Commons para la web de Balance Obras Civiles, mientras llegan las reales de las obras.
Todas son **referenciales**: en la página cada una lleva la etiqueta «Imagen referencial» y su crédito en «Créditos de
imágenes» (`creditos.json`, mismo orden que este documento).

- **Archivos:** `<id>.jpg`, JPEG de **2000 px de ancho** (calidad 92, progresivo), reducidos con Lanczos desde la
  miniatura de 3840 px de Commons (`iiurlwidth=2000` hoy devuelve ese tamaño fijo). Orientación EXIF aplicada, **sin
  metadatos EXIF** (nada de GPS) y perfil de color conservado cuando el original lo traía. Peso total ≈ 19 MB.
- **Todas horizontales.** Proporciones: 3:2 casi todas; 4:3 en `portada-grua-atardecer`, `estructura-columnas-losas`,
  `estructura-acero` y `arquitectura-edificio`; 16:9 en `portada-grua-ocaso` y `maquinaria-excavadora`; 2:1 en
  `equipo-ingenieros-planos`.
- **Licencias:** 7 CC0, 7 CC BY, 8 CC BY-SA. Ninguna NC ni ND. Ninguna tiene en Commons aviso de
  derechos de imagen (`Personality rights`) ni de marca registrada.
- **Coordenadas:** todas las cajas van en fracciones `[x0, y0, x1, y1]` (0 = izquierda/arriba, 1 = derecha/abajo), el mismo
  formato que `caja` y `parches` en el `fotos_config.json` de las demos.

## Resumen

| id | Qué muestra | Sección sugerida | Licencia |
|---|---|---|---|
| `portada-grua-ocaso` | Grúa torre en silueta, ocaso naranja con nubes iluminadas | `#inicio` (principal), `og:image` | CC BY 2.0 |
| `portada-grua-atardecer` | Grúa entre torres, cielo rojo intenso | `#inicio` en móvil (sujeto vertical) | CC BY 2.0 |
| `portada-gruas-hora-azul` | Cinco grúas sobre la ciudad a la hora azul, trópico | `#inicio` alterna, transición a `#plano` | CC0 |
| `estructura-columnas-losas` | Edificio de concreto en obra gris con grúa al atardecer | `#plano` (b, la estructura sube), Construcción | CC BY 4.0 |
| `estructura-encofrado` | Encofrado de losa visto desde arriba, obrero con casco | Construcción, `#proceso` 04 | CC BY-SA 4.0 |
| `estructura-acero` | Interior de una jaula de acero de refuerzo hacia el cielo | Construcción, fondos/texturas | CC BY-SA 4.0 |
| `equipo-obreros` | Tres obreros con casco amarrando acero sobre una losa | `#nosotros`, `#proceso` 04 | CC BY-SA 3.0 |
| `equipo-armador` | Armador en braga naranja caminando sobre la malla | `#nosotros`, Construcción | CC0 |
| `equipo-ingenieros-planos` | Ingenieros con casco revisando planos en obra | Ingeniería, `#proceso` 01 | CC BY 4.0 |
| `asfaltado-pavimentadora` | Pavimentadora y compactadoras en una vía, vista aérea | Asfaltado y vialidad (principal) | CC BY-SA 4.0 |
| `asfaltado-compactadora` | Rodillo compactador y cuadrilla tendiendo asfalto | Asfaltado, `#obras` | CC BY 2.0 |
| `asfaltado-via-nueva` | Vía de montaña recién asfaltada y demarcada (Ecuador) | Asfaltado, `#obras` (resultado) | CC BY-SA 2.0 |
| `remodelacion-sala` | Sala contemporánea luminosa, tonos cálidos | Remodelación, `#obras` | CC BY-SA 4.0 |
| `remodelacion-cocina` | Cocina blanca con isla, lámparas negras y piso de madera | Remodelación (principal), comparador | CC0 |
| `remodelacion-bano` | Baño con bañera exenta y ventanas a palmeras | Remodelación, `#obras` | CC BY-SA 4.0 |
| `arquitectura-edificio` | Edificio moderno escalonado blanco en Caracas, cielo azul | `#plano` (d, obra terminada), Proyectos | CC BY 2.0 |
| `arquitectura-casa` | Casa moderna de bloque de concreto entre árboles | Proyectos arquitectónicos, `#proceso` 05 | CC0 |
| `arquitectura-fachada` | Fachada blanca en diagonal, líneas limpias | Proyectos, comparador «Plano / Obra» | CC0 |
| `planos-mesa` | Plano de planta con portaminas y escalímetro | `#plano` (a), Ingeniería, `#proceso` 02 | CC0 |
| `planos-herramientas` | Transportador y escuadra sobre un plano, fondo azul petróleo | `#proceso` 03, fondo con texto | CC0 |
| `maquinaria-excavadora` | Excavadora en silueta a contraluz del sol | `#cotiza` (fondo), Asfaltado/movimiento de tierra | CC BY 2.0 |
| `maquinaria-retroexcavadora` | Retroexcavadora amarilla entre palmeras, día soleado | `#obras`, Asfaltado y vialidad | CC BY-SA 4.0 |

## Ficha por foto

### Portada

**`portada-grua-ocaso`** · 2000×1125 (16:9) · Addis Abeba, 2015 · *Jean Rebiffé*
Grúa torre en silueta con la pluma cruzando todo el cuadro, el sol justo al lado del gancho, una franja de nubes con borde
dorado arriba y la ciudad en negro abajo. Es la que mejor calza con la gradación carbón-oro: la pondría de portada.
- Punto de interés: mástil y cabina `[0.28, 0.27, 0.40, 0.70]`; sol y gancho `[0.60, 0.58, 0.70, 0.70]`.
- El tercio inferior `[0, 0.72, 1, 1]` es negro casi plano: ahí va el titular sin perder contraste.
- Recorte vertical (móvil): franja `x 0.50–0.82` (sol, gancho y pluma) o `x 0.17–0.49` (mástil y contrapeso).
- `og:image` 1200×630: recorte `[0, 0.04, 1, 0.973]` (ancho completo, 93 % del alto).

**`portada-grua-atardecer`** · 2000×1500 (4:3) · Almaty, 2015 · *Alexandru Panoiu*
Grúa torre de frente entre dos bloques de edificios en sombra, cielo rojo saturado. Sujeto vertical: es la mejor para la
portada en teléfono.
- Punto de interés: mástil y pluma `[0.33, 0.10, 0.62, 1.0]`.
- Recorte vertical: centrado en `x ≈ 0.42`. Los edificios a los lados enmarcan solos.
- A 100 % el rojo tiene algo de ruido; el grano de la gradación lo disimula.

**`portada-gruas-hora-azul`** · 2000×1335 (3:2) · Kuala Lumpur, 2017 · *EJ Yao* (Unsplash, CC0)
Cinco grúas torre sobre una ciudad tropical recién oscurecida, cielo azul con nubes finas. Clima cálido, tono frío: sirve
de puente hacia el azul plano de `#plano` o como segunda imagen de la portada.
- Punto de interés: grúa principal `[0.45, 0.28, 0.75, 0.75]`; mitad superior despejada para texto.
- Recorte vertical: centrado en `x ≈ 0.58`.

### Estructura

**`estructura-columnas-losas`** · 2000×1500 (4:3) · 2020 · *Cvstr*
Edificio de varios pisos con su esqueleto de concreto, andamios y grúa torre, nubes rosadas de atardecer y tierra
removida al frente. Es la escena (b) de «De plano a realidad»: la estructura que sube.
- Punto de interés: edificio y grúa `[0.20, 0.05, 0.85, 0.85]`.
- Recorte vertical: centrado en `x ≈ 0.48` (mástil de la grúa y núcleo del edificio).

**`estructura-encofrado`** · 2000×1333 (3:2) · Austria, 2023 · *Schiplagerheide*
Encofrado de losa visto desde arriba: tableros amarillos, puntales abajo a la izquierda y un obrero con casco verde
colocando tableros. Gráfico y muy cálido.
- Punto de interés: obrero `[0.16, 0.28, 0.35, 0.62]`; composición diagonal útil a ancho completo.
- Marcas: «doka» impreso en los tableros (ver «Marcas visibles»).

**`estructura-acero`** · 2000×1500 (4:3) · Baviera, 2016 · *Ermell* (foto destacada en Commons)
Vista desde el interior de una jaula cilíndrica de acero de refuerzo hacia el cielo, con fuga al centro. Imagen-concepto:
funciona como fondo o textura.
- Punto de interés: punto de fuga `[0.40, 0.42, 0.62, 0.68]`. Simétrica: aguanta recorte cuadrado o vertical centrado.

### Equipo

**`equipo-obreros`** · 2000×1333 (3:2) · China, 2010 · *RudolfSimon*
Tres obreros con casco amarillo, chaleco y guantes, arrodillados amarrando acero sobre la malla de una losa. Rostros
cubiertos con tapabocas o pañuelos: no son identificables.
- Punto de interés: los tres `[0.04, 0.10, 0.98, 0.75]`.
- Recorte vertical: obrero central, `x 0.36–0.68`.

**`equipo-armador`** · 2000×1333 (3:2) · São Paulo, 2017 · *Guilherme Cunha* (Unsplash, CC0)
Armador en braga naranja con casco verde caminando sobre la malla de acero, vista cenital; cabillas dobladas en primer
plano. Persona de espaldas.
- Punto de interés: obrero `[0.50, 0.08, 0.66, 0.48]`; cabillas `[0.40, 0.55, 1.0, 1.0]`.
- Recorte vertical: centrado en `x ≈ 0.57`.

**`equipo-ingenieros-planos`** · 2000×997 (2:1, panorámica) · Cerro Pachón, Chile, 2017 · *Vera C. Rubin Observatory/NOIRLab*
Tres profesionales con casco y chaleco revisando planos frente a un corte de roca; a la izquierda, un topógrafo con su
estación total. Es la única de «ingenieros revisando planos en obra» con buena calidad y sin rostros protagonistas.
- Punto de interés: grupo `[0.50, 0.32, 0.70, 0.80]`.
- Recorte para tarjeta 4:5: `x 0.42–0.80`. Recorte vertical: centrado en `x ≈ 0.60`.
- Marcas: logo de empresa en un chaleco rojo (ver «Marcas visibles»).

### Asfaltado

**`asfaltado-pavimentadora`** · 2000×1451 · Irán, 2020 · *باراد*
Vista aérea en diagonal: pavimentadora verde tendiendo asfalto, compactadora de neumáticos amarilla detrás, rodillo
tándem al fondo y cuadrilla. Asfalto negro recién tendido junto a un talud de roca.
- Punto de interés: pavimentadora y compactadora `[0.30, 0.35, 0.70, 0.95]`.
- Recorte vertical: centrado en `x ≈ 0.48`.
- Marcas: «VÖGELE», «SUPER 1804» y «BOMAG» en las máquinas.

**`asfaltado-compactadora`** · 2000×1333 (3:2) · Oregón, 2017 · *Oregon Department of Transportation*
Rodillo compactador de frente con operador, cuadrilla con chalecos reflectivos rastrillando detrás, polvo a contraluz,
conos al borde. Mucha acción y luz de mediodía.
- Punto de interés: rodillo `[0.24, 0.27, 0.46, 0.68]`; cuadrilla `[0.45, 0.32, 0.78, 0.62]`.
- Recorte vertical: centrado en `x ≈ 0.40`.
- Marcas y letreros: «CATERPILLAR», «CAT» y dos avisos viales en inglés (ver «Marcas visibles»).

**`asfaltado-via-nueva`** · 2000×1328 (3:2) · Piñas, Ecuador, 2012 · *MunicipioPinas*
Carretera de montaña recién asfaltada, con raya amarilla central y bordes blancos, que se pierde en curva hacia las
montañas. Paisaje andino y luz cálida: muy cercano a Venezuela. Es el «resultado» del asfaltado.
- Punto de interés: la curva `[0.40, 0.25, 0.95, 1.0]`.
- Recorte vertical: centrado en `x ≈ 0.68`.

### Remodelación

**`remodelacion-sala`** · 2000×1334 (3:2) · Bucarest, 2025 · *SPEEDWELL Development*
Sala contemporánea con cortinas traslúcidas, butaca curva, mesa de piedra y mueble negro con TV; maderas claras y
acentos terracota. Luminosa y cálida.
- Punto de interés: butaca y mueble `[0.38, 0.28, 0.88, 0.78]`.
- Recorte vertical: centrado en `x ≈ 0.55`.

**`remodelacion-cocina`** · 2000×1328 (3:2) · Boston, 2017 · *Naomi Hébert* (Unsplash, CC0)
Cocina blanca de líneas rectas con isla, dos lámparas colgantes negras, salpicadero oscuro, acero inoxidable y piso de
madera oscura. La más «revista» de las tres; sus líneas la hacen buena candidata para el comparador.
- Punto de interés: cocina completa `[0.12, 0.0, 1.0, 1.0]`; lámparas e isla `[0.62, 0.0, 1.0, 1.0]`.
- Recorte vertical: centrado en `x ≈ 0.76` (lámparas, isla y taburetes) o `x ≈ 0.42` (horno y microondas).

**`remodelacion-bano`** · 2000×1333 (3:2) · Luang Prabang, Laos, 2023 · *Basile Morin*
Baño amplio con bañera exenta al centro, tres ventanas de marco oscuro con palmeras detrás, consola de madera y piso de
baldosa. Simétrico y tropical.
- Punto de interés: bañera y ventanas `[0.30, 0.12, 0.82, 0.88]`.
- Recorte vertical: centrado en `x ≈ 0.55`.

### Arquitectura

**`arquitectura-edificio`** · 2000×1509 (4:3) · Caracas, 2011 · *Cristóbal Alvarado Minic*
Edificio de oficinas blanco con terrazas escalonadas y vidrio oscuro contra un cielo azul profundo. Es de Caracas: para el
cierre de «De plano a realidad» (d) o para Proyectos arquitectónicos.
- Punto de interés: terrazas `[0.40, 0.05, 0.98, 0.75]`; cielo libre a la izquierda `[0, 0, 0.30, 1]` para texto.
- Recorte vertical: centrado en `x ≈ 0.62`.

**`arquitectura-casa`** · 2000×1333 (3:2) · Pearl Beach, Australia, 2022 · *ColonelLight* (casa premiada, CC0)
Casa contemporánea de bloque de concreto a la vista, volumen alto con ventana grande, entre árboles; dos troncos
enmarcan la escena y un camino de grava lleva a la entrada.
- Punto de interés: casa `[0.28, 0.22, 0.62, 0.72]`.
- Recorte vertical: centrado en `x ≈ 0.45`.

**`arquitectura-fachada`** · 2000×1333 (3:2) · 2017 · *Samuel Zeller* (Unsplash, CC0)
Fachada residencial blanca en diagonal, bandas horizontales de ventanas y un balcón entrante; cielo claro arriba a la
izquierda. Gráfica y limpia: ideal para pasarla a «plano azul» en el comparador «Plano / Obra».
- Punto de interés: balcón entrante `[0.42, 0.0, 0.66, 0.62]`; triángulo de cielo `[0, 0, 0.45, 0.50]` para texto.

### Planos

**`planos-mesa`** · 2000×1333 (3:2) · 2016 · *Lorenzo Cafaro* (Pexels, CC0)
Primer plano de un plano de planta impreso con cotas («580», «350»), portaminas en diagonal y escalímetro. Muy nítida;
sus cotas reales acompañan la estética de plano de la página.
- Punto de interés: portaminas y cotas `[0.20, 0.0, 1.0, 0.65]`; escalímetro `[0, 0.50, 0.45, 1.0]`.
- Funciona como textura en cualquier recorte.

**`planos-herramientas`** · 2000×1333 (3:2) · 2015 · *Sergey Zolkin* (Unsplash, CC0)
Transportador y escuadra sobre un plano antiguo, con poca profundidad de campo y fondo azul petróleo. **Foco solo en la
mitad inferior** (el resto está desenfocado a propósito).
- Zona nítida: `[0.10, 0.52, 0.95, 0.92]`. La franja superior `[0, 0, 1, 0.40]` sirve para texto.
- Usar de fondo o tarjeta, no a pantalla completa como protagonista.

### Maquinaria

**`maquinaria-excavadora`** · 2000×1127 (16:9) · Carolina del Norte, 2013 · *NCDOTcommunications*
Excavadora de oruga en silueta a contraluz del sol, con el brazo cruzando desde arriba a la izquierda y otra máquina
pequeña al fondo. Con la gradación oscura queda muy cinematográfica.
- Punto de interés: cabina y sol `[0.42, 0.40, 0.75, 0.78]`; brazo `[0, 0, 0.45, 0.55]`.
- Franja inferior `[0, 0.75, 1, 1]` casi negra: buen fondo para el asistente de `#cotiza`.
- Recorte vertical: centrado en `x ≈ 0.55`. Original de 3264 px: a 100 % el cielo trae algo de ruido.

**`maquinaria-retroexcavadora`** · 2000×1331 (3:2) · Tailandia, 2025 · *PattayaPatrol*
Retroexcavadora amarilla en ángulo de tres cuartos, cuchara al frente, sobre grama con palmeras y cielo despejado. Clima
claramente tropical.
- Punto de interés: máquina `[0.05, 0.33, 0.60, 0.97]`.
- Recorte vertical: centrado en `x ≈ 0.38`.
- Marcas: «JCB» en el brazo y la parrilla.

## Marcas visibles (para taparlas con `parches`)

Ninguna marca es protagonista, pero algunas se leen. Con la gradación oscura casi desaparecen; si hace falta, estas cajas
sirven tal cual en el `fotos_config.json` (`"metodo": "interpolar"`):

| id | Qué se lee | Caja `[x0, y0, x1, y1]` |
|---|---|---|
| `estructura-encofrado` | «doka 3S basic» (tablero superior) | `[0.58, 0.035, 0.71, 0.075]` |
| `estructura-encofrado` | «doka 3S» (centro) | `[0.465, 0.325, 0.565, 0.365]` |
| `estructura-encofrado` | «basic» (borde derecho) | `[0.965, 0.27, 1.0, 0.32]` |
| `estructura-encofrado` | «3S» | `[0.355, 0.55, 0.385, 0.59]` |
| `asfaltado-pavimentadora` | «BOMAG» (rodillo del fondo) | `[0.215, 0.115, 0.255, 0.145]` |
| `asfaltado-pavimentadora` | «VÖGELE» (toldo) | `[0.545, 0.425, 0.60, 0.47]` |
| `asfaltado-pavimentadora` | «SUPER 1804» (costado) | `[0.455, 0.545, 0.505, 0.60]` |
| `asfaltado-compactadora` | «CATERPILLAR» (rodillo) | `[0.315, 0.505, 0.375, 0.535]` |
| `asfaltado-compactadora` | «CAT» (minicargador) | `[0.685, 0.495, 0.725, 0.525]` |
| `asfaltado-compactadora` | Avisos viales en inglés | `[0.245, 0.33, 0.305, 0.41]` y `[0.415, 0.32, 0.485, 0.365]` |
| `maquinaria-retroexcavadora` | «JCB» (brazo trasero) | `[0.125, 0.44, 0.17, 0.54]` |
| `maquinaria-retroexcavadora` | «JCB» (brazo del cargador) | `[0.285, 0.51, 0.315, 0.56]` |
| `maquinaria-retroexcavadora` | «JCB» (parrilla) | `[0.375, 0.60, 0.405, 0.64]` |
| `equipo-ingenieros-planos` | Logo de empresa en chaleco rojo | `[0.625, 0.475, 0.66, 0.505]` |

Menores, sin necesidad de tapar: logos diminutos de electrodomésticos en `remodelacion-cocina` y «HITACHI» casi
ilegible en la silueta de `maquinaria-excavadora`.

## Licencias y atribución (antes de publicar)

- **CC0 (7):** no exigen crédito; igual van en el modal, por trazabilidad.
- **CC BY y CC BY-SA (15):** el modal «Créditos de imágenes» cumple si cada foto aparece con título, autor, licencia
  enlazada y enlace a la fuente, que es lo que trae `creditos.json`.
- **Son adaptaciones:** la gradación, el recorte, el grano y los parches cuentan como modificación. En el modal conviene
  añadir una línea general: «Imágenes modificadas (recorte y color)». Para las CC BY-SA, la versión modificada de **esa
  foto** queda bajo CC BY-SA; no afecta al resto de la página.
- **Licencias 2.0 (6 fotos):** `portada-grua-ocaso`, `portada-grua-atardecer`, `asfaltado-compactadora`,
  `asfaltado-via-nueva`, `arquitectura-edificio` y `maquinaria-excavadora`. A diferencia de la 4.0, no dan 30 días para
  corregir un crédito incompleto. El modal tiene que estar completo desde la primera publicación. Tres de estas son de
  organismos públicos (ODOT, NCDOT, Municipio de Piñas).
- Se evitaron a propósito las fotos de bancos de imágenes de Flickr con CC BY 2.0 que circulan en Commons, por el
  historial de reclamos por créditos incompletos de algunas de esas cuentas.

## Alternativas revisadas (por si alguna no convence)

| Para | Foto | Licencia | Nota |
|---|---|---|---|
| Portada | [Construction crane over Quebec City at dusk](https://commons.wikimedia.org/wiki/File:Construction_crane_over_Quebec_City_at_dusk.jpg) | CC0 | Muy nítida; ciudad canadiense de fondo |
| Portada | [Construction crane below night sky](https://commons.wikimedia.org/wiki/File:Construction_crane_below_night_sky.jpg) | CC0 | Pluma iluminada con estrellas, nocturna |
| Asfaltado | [Road under construction (Unsplash)](https://commons.wikimedia.org/wiki/File:Road_under_construction_(Unsplash).jpg) | CC0 | Cenital de una redoma en obra |
| Asfaltado | [Night Paving near Klamath Lake](https://commons.wikimedia.org/wiki/File:Night_Paving_near_Klamath_Lake_-_Thomas_Feeley_(11409290206).jpg) | CC BY 2.0 | Pavimentación nocturna con vapor; logos CAT |
| Asfaltado | [Asphalt crew Drammen 2019 (4)](https://commons.wikimedia.org/wiki/File:Asphalt_crew_Drammen_2019_(4).jpg) | CC BY-SA 4.0 | Cuadrilla de frente; casas nórdicas, logo NCC |
| Equipo | [Building construction Moira Close… 01](https://commons.wikimedia.org/wiki/File:Building_construction_Moira_Close_Broadwater_Farm_Haringey_2025_01.jpg) | CC BY-SA 4.0 | Cuadrilla con plano en la mano; rostros visibles |
| Estructura | [DFC 1635 Unfinished concrete building…](https://commons.wikimedia.org/wiki/File:DFC_1635_Unfinished_concrete_building_with_exposed_floors_and_metal_scaffolding_rising_along_its_side_green_safety_netting_hanging_from_the_structure.jpg) | CC BY-SA 4.0 | Columnas y losas en primer plano, Tailandia; más cruda |
| Estructura | [ConstructionRolexBaechler2022-14](https://commons.wikimedia.org/wiki/File:ConstructionRolexBaechler2022-14.jpg) | CC BY-SA 4.0 | Cubo de concreto colgando de la grúa, cielo azul |
| Remodelación | [Living room (Unsplash)](https://commons.wikimedia.org/wiki/File:Living_room_(Unsplash).jpg) | CC0 | Sala nórdica, sofá azul, parqué en espiga |
| Remodelación | [Bathroom of Khan Pool Suite…](https://commons.wikimedia.org/wiki/File:Bathroom_of_Khan_Pool_Suite_in_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg) | CC BY-SA 4.0 | Pareja de la elegida: dos lavamanos de madera |
| Arquitectura | [Modern House Eraviputhenthurai](https://commons.wikimedia.org/wiki/File:Modern_House_Eraviputhenthurai_Mar24_A7C_10223.jpg) | CC BY-SA 4.0 | Casa tropical con luz cálida; placa con nombre de la casa |
| Arquitectura | [Palm Springs Alexander 02](https://commons.wikimedia.org/wiki/File:Palm_Springs_Alexander_02.jpg) | CC BY-SA 3.0 | Casa moderna entre palmeras y montaña |
| Maquinaria | [Orange excavator (Unsplash)](https://commons.wikimedia.org/wiki/File:Orange_excavator_(Unsplash).jpg) | CC0 | Muy dramática, pero «LYNCH» grande en el brazo |
| Maquinaria | [Caterpillar 330 excavator on a pile of dirt](https://commons.wikimedia.org/wiki/File:Caterpillar_330_excavator_on_a_pile_of_dirt.jpg) | CC BY-SA 4.0 | Impecable, pero logos CAT grandes |

## Descartes notables

- Casas de Kingsford al anochecer: editadas en blanco y negro o muy oscuras.
- Interiores de cuentas de Flickr con CC BY 2.0 (fotos tipo banco de imágenes): descartadas por la nota de licencias de arriba.
- Excavadoras con marca protagonista (CAT, Doosan, Lynch) y fotos de minería a cielo abierto.
- Escenas con nieve o invierno nórdico, archivos históricos y fotos de obras militares, filtradas de entrada.
- Visitas de obra con políticos y fotos de oficina con rostros reconocibles como protagonistas.

## Proceso (reproducible)

Búsqueda con la API de Commons (`generator=search`, espacio 6, `prop=imageinfo`, `iiprop=url|size|extmetadata`,
`filew:>1799`, `filemime:image/jpeg`), cuatro rondas de consultas en español, inglés, portugués, alemán y francés,
filtros automáticos (licencia, ancho ≥ 1800 px, nieve, blanco y negro, archivo histórico, militar, juguetes, desastres,
año < 2006) y revisión visual en hojas de contactos y a 100 %. Los scripts y las hojas quedan en
`.capturas/referenciales/` (ignorada por git): `commons.py`, `reunir.py`, `hojas.py`, `finalistas.py`, `exportar.py` y
`revisar.py`. `python -I .capturas/referenciales/scripts/exportar.py .capturas/referenciales/datos/elegidas.json` vuelve a
generar las fotos y `creditos.json` desde la lista de ids.
