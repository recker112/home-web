/**
 * ─────────────────────────────────────────────────────────────
 *  CANCIONES DEL REPRODUCTOR
 *  Añade aquí cada tema nuevo; el reproductor y la lista se
 *  actualizan solos.
 * ─────────────────────────────────────────────────────────────
 *
 *  CÓMO AÑADIR UNA CANCIÓN
 *
 *  1. Copia el .mp3 dentro de `public/` (puedes usar subcarpetas,
 *     por ejemplo `public/musica/tema.mp3`).
 *  2. Añade una entrada aquí con la ruta empezando por `/`.
 *
 *  El nombre del archivo se escribe **tal cual**, con espacios y
 *  acentos si los tiene: el reproductor lo codifica para la URL.
 *
 *  La duración no se pone a mano; se lee del propio archivo al cargarlo.
 *
 *  El orden de esta lista es el orden de reproducción.
 */

export type Song = {
  title: string
  /** Ruta pública del archivo, empezando por `/`. */
  file: string
  /** Opcionales: solo se muestran si los rellenas. */
  note?: string
  year?: number
}

export const songs: Song[] = [
  {
    title: 'Dydy with fear',
    file: '/Dydy with fear.mp3',
  },
]
