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
