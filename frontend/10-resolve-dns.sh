#!/bin/sh
set -e

# Detectar resolvers DNS desde /etc/resolv.conf o variable de entorno RESOLVER.
# En Docker Compose extraerá 127.0.0.11.
# En Azure Container Apps extraerá la IP de CoreDNS asignada al entorno (p. ej. 10.0.0.10).
# Permite sobreescritura explícita mediante la variable de entorno RESOLVER si fuera necesario.

if [ -n "$RESOLVER" ]; then
    DNS_RESOLVERS="$RESOLVER"
else
    DNS_RESOLVERS=$(grep -i '^nameserver' /etc/resolv.conf | awk '{print $2}' | tr '\n' ' ' | sed 's/[[:space:]]*$//')
fi

# Fallback si no se detecta ningún nameserver en /etc/resolv.conf
if [ -z "$DNS_RESOLVERS" ]; then
    DNS_RESOLVERS="127.0.0.11"
fi

echo "[10-resolve-dns.sh] Configurando resolver DNS dinámico en Nginx: $DNS_RESOLVERS"

cat << EOF > /etc/nginx/conf.d/00-resolver.conf
# Generado dinámicamente en el arranque del contenedor
resolver $DNS_RESOLVERS valid=10s ipv6=off;
resolver_timeout 5s;
EOF
