# home-web · frontend

Hub y portfolio de [reckernode.dev](https://reckernode.dev): enlaces a mis servicios,
skills, proyectos y un arcade jugable, todo en pixel art.

## Puesta en marcha

```bash
npm install
npm run dev           # servidor de desarrollo en http://localhost:5173
npm run build         # valida presets + tipos + build de producción en dist/
npm run preview       # sirve dist/ para revisarlo antes de desplegar
npm run check:tracks  # valida solo los presets del secuenciador
npm run lint
```

## Cómo cambiar el contenido

Todo el texto vive en **`src/data/site.ts`**: perfil, servicios, skills, proyectos,
intereses y enlaces. No hace falta tocar ningún componente para actualizar la web.

Para añadir un servicio nuevo basta con un objeto más en `services`. El campo
`probeUrl` es opcional: si lo rellenas, la tarjeta comprueba al cargar si el host
responde a una petición HTTP; si lo dejas en `''`, no se hace ninguna comprobación
(es el caso de TeamSpeak, que no habla HTTP).

### Skills y proyectos van juntos

Las dos secciones comparten **un único filtro por área**. Al elegir "DevOps" se
muestran a la vez las skills de DevOps y los proyectos donde las has usado, así
que lo que se ve siempre cuadra.

Eso lo decide el campo `areas` de cada proyecto, que usa las mismas categorías
que las skills (`skillCategories`):

```ts
{
  title: 'reckernode',
  areas: ['DevOps'],            // un proyecto puede estar en varias
  ...
}
```

Si añades una categoría de skills y ningún proyecto la declara, al filtrarla
verás un aviso de "sin proyectos" en lugar de una sección vacía. La lógica del
filtro vive en `src/state/areaSelectors.ts`, en un solo sitio, para que ambas
secciones no puedan discrepar.

## Stack

- **React 19 + Vite + TypeScript**, sin librería de componentes. El pixel art se lleva
  mal con Material Design y similares: bordes duros, sombras sólidas y cero
  redondeos son más fáciles de conseguir con CSS propio.
- **Temas claro y oscuro** con variables CSS. El tema se aplica en `index.html` antes
  del primer render, así que no hay parpadeo de color al cargar.
- **Sin dependencias de iconos**: cada icono es un mapa ASCII de 16x16 en
  `src/components/PixelIcon.tsx` que se convierte a `<rect>` de SVG. Editar un icono
  es pintar caracteres.
- **Sin archivos de audio**: los efectos y el secuenciador se generan con Web Audio.
  Los efectos de interfaz salen silenciados y se activan desde la barra superior.

## El icono

`public/favicon.svg` está dibujado a mano, píxel a píxel, igual que los iconos.
Para donde no se admite SVG (fotos de perfil de GitHub, Discord…) hay un script
que genera PNG a partir de él, sin dependencias:

```bash
npm run icon                    # public/icon-512.png
npm run icon -- 1024            # public/icon-1024.png
npm run icon -- 512 --circular  # con margen para recortes en círculo
```

El tamaño se ajusta solo para que cada píxel del dibujo ocupe un número entero
de píxeles y no salga borroso. La variante `--circular` encoge el dibujo al 75%:
a tamaño completo, el acento dorado de la esquina se sale del círculo que
recortan Discord, Slack o Twitter.

Al vivir en `public/`, los PNG se publican con la web
(`https://reckernode.dev/icon-512.png`).

## El arcade

Tres minijuegos, todos en el navegador y sin backend:

| Juego     | Qué hace                                                                   |
| --------- | -------------------------------------------------------------------------- |
| Puntería  | 30 segundos de tiro al blanco; el récord se guarda en `localStorage`.       |
| Pixel art | Lienzo de 16x16 con 16 colores, relleno por inundación y descarga PNG.      |
| Chiptune  | Piano roll cromático de 3 octavas sincronizado con el reloj de Web Audio.   |

### Componer y añadir presets

El secuenciador cubre **C3–B5 con todos los semitonos** (36 teclas) más KICK,
SNARE y HAT, con patrones de 16, 32 o 64 pasos. Un paso es una semicorchea:
16 pasos son un compás de 4/4.

Los presets viven en **`src/data/tracks.ts`** y se escriben como en un tracker:

```ts
{
  name: 'Blues en A',
  bpm: 96,
  steps: 16,
  track: {
    //      |1...|2...|3...|4...|
    'D#4': '......x.........',   // 'x' suena, '.' calla
    'A3':  'x...x...x...x...',
    'KICK':'x...x...x...x...',
  },
}
```

- Los bemoles valen: `'Db4'` es lo mismo que `'C#4'`.
- La cadena debe tener tantos caracteres como `steps`.
- `npm run check:tracks` avisa de notas fuera de rango, semitonos mal escritos
  y cadenas a las que les falta o sobra un paso. El build lo ejecuta solo.

Lo que compongas en el navegador se guarda en `localStorage`, así que sobrevive
a una recarga; cargar un preset lo reemplaza.

## Detalles

- Funciona con teclado y respeta `prefers-reduced-motion`.
- Cinco disparos al servidor del inicio activan el modo CRT (vuelve a dispararle
  cinco veces para quitarlo).
- El estado que se guarda —tema, sonido, récord y dibujo— vive solo en el navegador.
