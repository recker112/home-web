/* Configuración de ejecución de la web.
 *
 * En producción este archivo lo reescribe el contenedor al arrancar
 * (docker/40-runtime-config.sh) con las variables RN_* que tenga
 * definidas. Este contenido es el de reserva: sin nada configurado
 * mandan los textos de src/data/site.ts.
 *
 * No hace falta editarlo a mano; en desarrollo se usa un .env con
 * variables VITE_RN_*. */
window.__RN_CONFIG__ = {}
