#!/bin/sh
# Genera /usr/share/nginx/html/config.js con los textos que se pueden
# cambiar sin recompilar la web.
#
# La imagen de nginx ejecuta todo lo que encuentre en /docker-entrypoint.d/
# antes de arrancar el servidor, así que esto corre en cada arranque del
# contenedor: para cambiar la disponibilidad basta con tocar la variable
# en Dokploy y reiniciar. No hay que reconstruir la imagen.
#
# Variables reconocidas:
#   RN_AVAILABILITY  Texto de disponibilidad del inicio.
#
# Sin ninguna definida se escribe un objeto vacío y la web usa los textos
# que trae src/data/site.ts.

set -eu

CONFIG=/usr/share/nginx/html/config.js

# Deja el texto listo para ir entre comillas dobles en JavaScript: escapa
# barras invertidas y comillas, y aplana los saltos de línea, que dentro
# de una cadena serían un error de sintaxis.
escape() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr '\n\r' '  '
}

# Se escribe con printf y no con echo: el echo de las shells tipo ash y
# dash interpreta las barras invertidas, y deshacía el escapado de arriba
# justo antes de guardarlo. El texto va como argumento de %s, que printf
# copia tal cual.
{
    printf '%s\n' '/* Generado al arrancar el contenedor. No editar a mano. */'
    printf '%s\n' 'window.__RN_CONFIG__ = {'
    if [ -n "${RN_AVAILABILITY:-}" ]; then
        printf '  availability: "%s",\n' "$(escape "$RN_AVAILABILITY")"
    fi
    printf '%s\n' '}'
} >"$CONFIG"

if [ -n "${RN_AVAILABILITY:-}" ]; then
    printf '%s\n' "$0: disponibilidad tomada de RN_AVAILABILITY"
else
    printf '%s\n' "$0: sin variables RN_*, se usan los textos de la propia web"
fi
