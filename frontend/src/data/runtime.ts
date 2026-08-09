/**
 * ─────────────────────────────────────────────────────────────
 *  TEXTOS QUE SE CAMBIAN SIN RECOMPILAR
 *
 *  Lo normal es editar `site.ts` y volver a construir. Para lo que
 *  cambia a menudo —la disponibilidad del hero— eso es mucho trabajo:
 *  aquí se lee el valor en tiempo de ejecución y basta con reiniciar
 *  el contenedor.
 *
 *  De dónde sale cada texto, en orden:
 *    1. `window.__RN_CONFIG__`, que escribe el contenedor al arrancar
 *       (docker/40-runtime-config.sh) a partir de las variables RN_*.
 *    2. `VITE_RN_*` de un `.env`, para desarrollo, donde no hay
 *       contenedor que genere nada.
 *    3. El texto por defecto que se pasa desde `site.ts`.
 * ─────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    /* Lo define public/config.js, cargado antes que la aplicación. */
    __RN_CONFIG__?: Record<string, string | undefined>
  }
}

/* Las claves van escritas a mano y no con un índice calculado: Vite
   sustituye cada `import.meta.env.VITE_*` durante el build mirando el
   texto del código, así que `import.meta.env[algo]` se quedaría vacío. */
const FROM_ENV = {
  availability: import.meta.env.VITE_RN_AVAILABILITY,
} satisfies Record<string, string | undefined>

export type RuntimeKey = keyof typeof FROM_ENV

/** Devuelve el texto configurado para `key`, o `fallback` si no hay ninguno. */
export function runtimeText(key: RuntimeKey, fallback: string): string {
  /* `window` no existe al renderizar fuera del navegador (el smoke test
     por SSR del README lo hace). */
  const fromContainer = typeof window === 'undefined' ? undefined : window.__RN_CONFIG__?.[key]

  return fromContainer?.trim() || FROM_ENV[key]?.trim() || fallback
}
