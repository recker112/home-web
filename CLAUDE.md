# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hub y portfolio personal de reckernode.dev: enlaces a los servicios del homelab,
skills, proyectos y un arcade jugable, todo en estética pixel art.

**La interfaz, los comentarios y la documentación están en español.** Mantén ese
idioma al añadir código o textos.

## Dónde se trabaja

Todo el proyecto vive en `frontend/`. `docker/` existe pero está vacío: no hay
backend, ni base de datos, ni API. Es una SPA estática.

```bash
cd frontend
npm install
npm run dev            # servidor de desarrollo (puerto 5173 por defecto)
npm run build          # check:tracks + tsc -b + vite build
npm run lint           # oxlint
npm run check:tracks   # valida los presets del secuenciador
npm run preview        # sirve dist/
npm run icon           # regenera los PNG del icono desde public/favicon.svg
```

El usuario suele tener su propio `npm run dev` abierto desde VS Code. Si
necesitas levantar el servidor para comprobar algo, **usa otro puerto**
(`npm run dev -- --port 5178`) y ciérralo al terminar.

## Verificación: no hay tests

No hay test runner ni suite de pruebas, así que "ejecutar un test" no aplica. Lo
que sí funciona para verificar cambios sin navegador:

- `npm run build` cubre los tipos; `npm run lint` no debe dejar avisos.
- **Smoke test por render**: compila una entrada temporal con
  `npx vite build --ssr <entry>.tsx --outDir dist-ssr` y ejecútala con Node
  pasando shims mínimos (`window.matchMedia`, `document.documentElement.dataset`,
  `localStorage`). `renderToStaticMarkup(<App />)` recorre todos los componentes
  y delata errores de render. Para probar un estado concreto, monta el contexto a
  mano (`<AreaContext.Provider value={{ area, setArea: () => {} }}>`) en lugar de
  usar el provider real. Borra la entrada y `dist-ssr` al acabar.
- **Pixel art**: los sprites se pueden volcar a PNG y mirarlos. Es la única forma
  de saber si un dibujo se lee; varios iconos parecían correctos en ASCII y no lo
  eran.

## Arquitectura

### El contenido está separado del código

`src/data/site.ts` (perfil, servicios, skills, proyectos, intereses, enlaces,
navegación) y `src/data/tracks.ts` (presets del secuenciador) concentran todo el
texto y los datos. Cambiar contenido no debería obligar a tocar componentes: si
te ves editando un `.tsx` para cambiar una frase, probablemente falte un campo en
`site.ts`.

### Pixel art: mapas ASCII, no imágenes ni librerías de iconos

`components/pixelRuntime.ts` convierte mapas de caracteres en `<rect>` de SVG,
comprimiendo cada fila en tramos del mismo color y cacheando por cadena.

- `PixelIcon.tsx`: sprites de **16x16** con una paleta compartida (`#` es
  `currentColor`, los dígitos son colores del tema).
- `ServerRack.tsx`: sprite de **24x24** con su propia paleta.

Para añadir o editar un icono se pinta el mapa ASCII. **Todas las filas deben
tener exactamente la misma longitud**; un carácter de más rompe la rejilla en
silencio. Los colores salen de variables CSS, así que los sprites cambian con el
tema. A 16x16 hay formas que simplemente no caben — no insistas en dibujos
demasiado detallados.

### Sin librería de UI: CSS plano con variables

No hay MUI, Tailwind ni CSS-in-JS, y es deliberado: Material Design y el pixel
art se llevan mal. Cada componente tiene su `.css` al lado con clases
prefijadas.

Los tokens viven en `src/styles/base.css`, en `:root` y `:root[data-theme='light']`.
**Usa siempre las variables**, nunca colores literales, o el tema claro se rompe.
El lenguaje visual es: bordes duros de 2-4 px, `box-shadow` sólido y desplazado
(nunca difuminado), cero `border-radius` y transiciones con `steps()`.

El tema se aplica en un script inline de `index.html` **antes del primer paint**;
`useTheme` lo lee del `dataset` en vez de recalcularlo. Si eso se cambia, vuelve
el parpadeo de color al cargar.

### Providers y contextos van en archivos separados

`audio/context.ts` + `audio/SoundProvider.tsx`, `state/areaContext.ts` +
`state/AreaProvider.tsx`. El contexto y su hook en un `.ts`, el componente
provider en un `.tsx`. No es estético: oxlint avisa con
`react(only-export-components)` si un módulo exporta a la vez componentes y otras
cosas, y eso rompe el refresco en caliente. Sigue el patrón al añadir contextos.

### Skills y Proyectos comparten un único filtro

`AreaProvider` envuelve a ambas secciones en `App.tsx`. Los proyectos declaran
`areas: SkillCategory[]`, las mismas categorías que las skills, y eso es lo que
une las dos secciones. **La lógica de qué se ve con cada área vive solo en
`state/areaSelectors.ts`**; estaba duplicada en tres sitios y es cuestión de
tiempo que discrepen. Si una categoría se queda sin proyectos, Proyectos muestra
un estado vacío en vez de una sección en blanco.

### Audio: todo generado, ningún archivo

Los efectos y los instrumentos se sintetizan con Web Audio. `ensureContext()`
crea el `AudioContext` de forma perezosa y lo reanuda (Safari e iOS arrancan
suspendidos). Los SFX de interfaz **salen silenciados** y el usuario los activa
en la barra superior; el secuenciador suena igual, porque sonar es su función.

### El secuenciador es la parte delicada

`components/arcade/Sequencer.tsx` y `arcade/notes.ts`:

- El patrón es un `Record<nota, string>` de `'x'` y `'.'`. Ese formato es el
  mismo que usan los presets, hace barata la memoización por fila y permite
  conservar los pasos al reducir la longitud del patrón.
- `notes.ts` genera C3–B5 cromático por fórmula MIDI. `normalizeRowId` acepta
  bemoles, minúsculas y espacios; devuelve `null` fuera de rango.
- El tiempo lo marca el **reloj del `AudioContext`** con planificación por
  adelantado, no `setInterval` a secas, que se desviaría. El scheduler lee
  `patternRef` / `bpmRef` / `stepsRef` para no reiniciarse cuando editas.
- Rendimiento: filas memoizadas y cabezal de reproducción como elemento aparte.
  Con 64 pasos hay ~2500 celdas y sin eso va a tirones.
- `--cell` y `--gap` se inyectan desde JS al CSS: es la única forma de que el
  cabezal no se desalinee de las celdas.

Los presets se escriben a mano en `src/data/tracks.ts`; `npm run check:tracks`
detecta notas fuera de rango y cadenas con pasos de más o de menos, y el build lo
ejecuta antes de compilar.

### Estado persistido

Claves `rn.*` en `localStorage`: `rn.theme`, `rn.sound`, `rn.aim.best`,
`rn.canvas`, `rn.track`. `useLocalStorage` no escribe si el valor no cambia
(pintar arrastrando provocaría una escritura por fotograma).

### Movimiento y accesibilidad

`prefers-reduced-motion` se respeta de verdad: el fondo se dibuja quieto, el
cursor de mira no aparece y los efectos de tecleo se saltan la animación. Al
añadir animación, compruébalo.

## Scripts propios

`scripts/check-tracks.ts` y `scripts/make-icon.mjs` no usan dependencias. Node
ejecuta el TypeScript directamente, sin flags. `make-icon.mjs` escribe el PNG a
mano con `zlib` y ajusta el tamaño al múltiplo que toque para que los píxeles
queden exactos.
