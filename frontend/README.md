# home-web · frontend

Hub y portfolio de [reckernode.dev](https://reckernode.dev): enlaces a mis servicios,
skills, proyectos y un arcade jugable, todo en pixel art.

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # comprobación de tipos + build de producción en dist/
npm run preview  # sirve dist/ para revisarlo antes de desplegar
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

| Juego     | Qué hace                                                              |
| --------- | --------------------------------------------------------------------- |
| Puntería  | 30 segundos de tiro al blanco; el récord se guarda en `localStorage`.  |
| Pixel art | Lienzo de 16x16 con 16 colores, relleno por inundación y descarga PNG. |
| Chiptune  | Caja de ritmos de 16 pasos sincronizada con el reloj de Web Audio.     |

## Detalles

- Funciona con teclado y respeta `prefers-reduced-motion`.
- El código Konami (o cinco toques al avatar) activa el modo CRT.
- El estado que se guarda —tema, sonido, récord y dibujo— vive solo en el navegador.
