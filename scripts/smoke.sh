#!/usr/bin/env bash
# Smoke del producto: arranca el server en memoria y prueba health + flujo mínimo.
set -euo pipefail
PORT="${SMOKE_PORT:-$(( ${UAK_PORT:-3900} + 7 ))}"
TMP="$(mktemp -d)"
PORT=$PORT DB_PATH=":memory:" UPLOAD_DIR="$TMP/up" node server/index.js > "$TMP/log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true; rm -rf "$TMP"' EXIT
for _ in $(seq 1 40); do curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null && break; sleep 0.25; done
curl -sf "http://127.0.0.1:$PORT/api/health" | grep -q '"ok":true'
curl -sf -X POST "http://127.0.0.1:$PORT/api/jornadas" -H 'content-type: application/json' \
  -d '{"municipio":{"nombre":"Smoke"},"sede":"Plaza","fecha":"2030-01-01"}' | grep -q '"semaforo"'
curl -sf "http://127.0.0.1:$PORT/api/panorama" | grep -q '"conteo"'
echo "SMOKE_PROJECT_PASS port=$PORT"
