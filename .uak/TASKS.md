# TASKS · stateless backlog

State lives on the `claims` branch (`uak status`); this file holds only tasks.
Stack: Node 20 + Express + SQLite (better-sqlite3) + SSE · Valkey optional (`USE_VALKEY=false` → in-memory Map) · web: Vite + React + TS. All data is fictitious (`demo_data: true`).

## HACK-001 · Setup + contrato + núcleo de jornadas, documentos y semáforo
- **Type:** setup
- **Priority:** P0
- **Estimate:** 45 min
- **Rubric / Spec:** C1, C2 · IDEA.md §4 pasos 1, 4, 5 · §6
- **Depends on:** None
- **Uses contract:** None
- **Related:** HACK-003, HACK-004
- **Paths:** package.json, package-lock.json, server/app.js, server/index.js, server/db.js, server/kv.js, server/semaforo.js, server/routes/jornadas.js, server/routes/documentos.js, server/routes/panorama.js, server/tests/core.test.js, schemas/, docker-compose.yml, Dockerfile, render.yaml, .env.example, .gitignore
- **Freeze-Allowed:** no
- **Acceptance:**
  - `POST /api/jornadas` con un municipio ficticio crea la jornada con sus documentos en `pendiente`
  - `POST /api/documentos/:id/archivo` crea una versión nueva con su sha256; `POST /api/documentos/:id/revision` con `observado` sin motivo → 400
  - `GET /api/panorama` devuelve cada jornada con semáforo verde/ámbar/rojo según IDEA.md, ordenado por riesgo
  - `server/app.js` monta todo archivo de `server/routes/` (HACK-003 solo agrega archivos); `schemas/` tiene los JSON de contrato y `schemas/fixtures/` el caso demo que consume HACK-004
  - `bash .uak/bin/smoke` exits 0
- **Tests:** crea_jornada_con_documentos_pendientes, cada_subida_crea_version_con_sha256, observado_sin_motivo_responde_400, semaforo_rojo_a_7_dias_sin_aprobar, panorama_ordena_por_riesgo
- **Verify:** `npm test`
- **Next step:** `npm init -y`, instalar express better-sqlite3 iovalkey multer, escribir `server/tests/core.test.js` con node:test y `uak red HACK-001`

## HACK-002 · Design lock + scaffold web
- **Type:** setup
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C2 · IDEA.md §0
- **Depends on:** None
- **Uses contract:** HACK-001
- **Related:** HACK-004
- **Paths:** web/DESIGN.md, web/src/index.css, web/src/lib/ui/, web/src/App.tsx, web/src/main.tsx, web/public/design-lock/, web/package.json, web/package-lock.json, web/index.html, web/vite.config.ts, web/tsconfig.json
- **Freeze-Allowed:** no
- **Acceptance:**
  - `/uak-design-lock`: el humano elige la dirección visual desde capturas; queda en `web/DESIGN.md` con la tabla de recipes
  - Vite + React + TS con vitest; proxy `/api` a `$UAK_PORT`; shell `App.tsx` con rutas `/m/:jornada` (municipio) y `/panel` (Eira)
  - UI en español (MX), contraste AA
- **Test-First:** no (design lock y scaffold; las vistas se prueban en HACK-004)
- **Verify:** `test -s web/DESIGN.md && ls web/public/design-lock/screens/*-1280.png && bash .uak/bin/uak lint`
- **Next step:** `/uak-design-lock`

## HACK-003 · Magic link, tablero en vivo (SSE), carta con cláusulas protegidas y recordatorios
- **Type:** feature
- **Priority:** P0
- **Estimate:** 45 min
- **Rubric / Spec:** C1, C3 · IDEA.md §4 pasos 2, 3, 6
- **Depends on:** HACK-001
- **Uses contract:** None
- **Related:** HACK-004
- **Paths:** server/routes/magic.js, server/routes/stream.js, server/routes/carta.js, server/reminders.js, server/audit.js, server/tests/flow.test.js
- **Freeze-Allowed:** no
- **Acceptance:**
  - `POST /api/magic/solicitar` guarda `magic:{sha256(token)}` NX EX 900; `POST /api/magic/consumir` lo consume con GETDEL: segundo uso → 401
  - `GET /api/jornadas/:id/stream` emite un evento SSE al cambiar un documento (PUBLISH `jornada:{id}`)
  - `POST /api/jornadas/:id/carta` que altera una cláusula protegida → 422; cada acción queda en `auditoria`
  - recordatorios en T−21 y T−14, máximo 2 por semana, solo en horario laboral; `DEMO_CLOCK_OFFSET_DAYS` los dispara en la demo
- **Tests:** magic_link_solo_sirve_una_vez, magic_link_expira_a_los_15_min, cambio_de_documento_emite_evento_sse, carta_con_clausula_protegida_alterada_responde_422, recordatorio_no_pasa_de_2_por_semana
- **Verify:** `npm test`
- **Next step:** escribir `server/tests/flow.test.js` y `uak red HACK-003`

## HACK-004 · Vista del municipio y panel de Eira con semáforo
- **Type:** feature
- **Priority:** P0
- **Estimate:** 45 min
- **Rubric / Spec:** C1, C2 · IDEA.md §4 pasos 2, 4, 5
- **Depends on:** HACK-002
- **Uses contract:** HACK-001, HACK-003
- **Related:** HACK-001
- **Paths:** web/src/features/municipio/, web/src/features/panel/, web/src/lib/api.ts, web/src/mocks/
- **Freeze-Allowed:** no
- **Acceptance:**
  - Recipe: dashboard · Hero: semáforo de jornadas
  - `/panel` lista las jornadas con semáforo y días restantes; se actualiza solo vía SSE
  - `/m/:jornada` (entrada por `#t=` del magic link) muestra la checklist, sube archivos y ve el motivo de un `observado`
  - arranca con `web/src/mocks/` (`demo_data: true`) desde `schemas/fixtures/`; cambia a la API real cuando HACK-001 integre
  - capturas en `.uak-shots/HACK-004/` y SHIP de `design-critic`
- **Tests:** panel_muestra_rojo_para_jornada_a_7_dias, municipio_ve_motivo_de_observacion, subir_archivo_marca_recibido
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
- **Next step:** leer `web/DESIGN.md`, escribir los tests en vitest y `uak red HACK-004`

## HACK-005 · Landing + demo y entrega en Devpost
- **Type:** demo
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C2, C3 · IDEA.md §1, §8
- **Depends on:** HACK-002, HACK-004
- **Uses contract:** HACK-003
- **Related:** HACK-004
- **Paths:** web/src/features/landing/, demo/, README.md
- **Freeze-Allowed:** yes
- **Acceptance:**
  - Recipe: flow · Hero: el caso demo del municipio ficticio de punta a punta
  - landing con skill `landing-story`: la frase de IDEA §1, el wow como captura real, 3 pasos, cómo cuidamos los datos (C3)
  - `demo/plan-b.mp4` grabado y guion de 3 min en `demo/`; README con cómo correrlo
- **Test-First:** no (landing, video y docs)
- **Verify:** `npm --prefix web run build && bash .uak/bin/design-lint`
- **Next step:** skill `landing-story` con IDEA.md y capturas de HACK-004
