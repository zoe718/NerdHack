# Backlog published on claims (uak plan)

Append-only; added to .uak/TASKS.md from main. Why: adding tasks never waits for a PR.
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
- **Acceptance:** `POST /api/jornadas` con un municipio ficticio crea la jornada con sus documentos en `pendiente`, `POST /api/documentos/:id/archivo` crea una versión nueva con su sha256; `POST /api/documentos/:id/revision` con `observado` sin motivo → 400, `GET /api/panorama` devuelve cada jornada con semáforo verde/ámbar/rojo según IDEA.md, ordenado por riesgo, `server/app.js` monta todo archivo de `server/routes/` (HACK-003 solo agrega archivos); `schemas/` tiene los JSON de contrato y `schemas/fixtures/` el caso demo que consume HACK-004, `bash .uak/bin/smoke` exits 0
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
- **Acceptance:** `/uak-design-lock`: el humano elige la dirección visual desde capturas; queda en `web/DESIGN.md` con la tabla de recipes, Vite + React + TS con vitest; proxy `/api` a `$UAK_PORT`; shell `App.tsx` con rutas `/m/:jornada` (municipio) y `/panel` (Eira), UI en español (MX), contraste AA
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
- **Acceptance:** `POST /api/magic/solicitar` guarda `magic:{sha256(token)}` NX EX 900; `POST /api/magic/consumir` lo consume con GETDEL: segundo uso → 401, `GET /api/jornadas/:id/stream` emite un evento SSE al cambiar un documento (PUBLISH `jornada:{id}`), `POST /api/jornadas/:id/carta` que altera una cláusula protegida → 422; cada acción queda en `auditoria`, recordatorios en T−21 y T−14, máximo 2 por semana, solo en horario laboral; `DEMO_CLOCK_OFFSET_DAYS` los dispara en la demo
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
- **Acceptance:** Recipe: dashboard · Hero: semáforo de jornadas, `/panel` lista las jornadas con semáforo y días restantes; se actualiza solo vía SSE, `/m/:jornada` (entrada por `#t=` del magic link) muestra la checklist, sube archivos y ve el motivo de un `observado`, arranca con `web/src/mocks/` (`demo_data: true`) desde `schemas/fixtures/`; cambia a la API real cuando HACK-001 integre, capturas en `.uak-shots/HACK-004/` y SHIP de `design-critic`
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
- **Acceptance:** Recipe: flow · Hero: el caso demo del municipio ficticio de punta a punta, landing con skill `landing-story`: la frase de IDEA §1, el wow como captura real, 3 pasos, cómo cuidamos los datos (C3), `demo/plan-b.mp4` grabado y guion de 3 min en `demo/`; README con cómo correrlo
- **Test-First:** no (landing, video y docs)
- **Verify:** `npm --prefix web run build && bash .uak/bin/design-lint`
- **Next step:** skill `landing-story` con IDEA.md y capturas de HACK-004
## HACK-006 · Revisión de Eira: observar o aprobar requisito con motivo
- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C2 · Reto 2 demo: solicitar corrección, aprobar requisito
- **Depends on:** HACK-002
- **Uses contract:** HACK-001
- **Related:** HACK-004
- **Paths:** web/src/features/revision/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: detail · Hero: el archivo subido con sus botones Aprobar / Observar, `/panel/:jornada/revision` lista requisitos `recibido`; Observar exige motivo (no deja enviar vacío); Aprobar cambia el estado al instante, muestra versiones del archivo (v1, v2…) con fecha y sha256 corto, usa mocks de `web/src/mocks/` hasta que HACK-001 integre, capturas en `.uak-shots/HACK-006/` y SHIP de `design-critic`
- **Tests:** observar_sin_motivo_no_envia, aprobar_marca_aprobado, muestra_versiones_del_archivo
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
- **Next step:** leer `web/DESIGN.md`, tests en vitest y `uak red HACK-006`

## HACK-007 · Editor de carta compromiso con cláusulas bloqueadas e historial
- **Type:** feature
- **Priority:** P0
- **Estimate:** 45 min
- **Rubric / Spec:** C1, C2 · Reto 2: campos variables, cláusulas fijas, versiones y trazabilidad
- **Depends on:** HACK-002
- **Uses contract:** HACK-003
- **Related:** HACK-003
- **Paths:** web/src/features/carta/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: flow · Hero: la carta con los campos variables editables y las cláusulas con candado, campos variables (municipio, sede, fecha, servicios, persona enlace) editables; cláusulas protegidas de solo lectura con candado, si la API responde 422 muestra "Esta cláusula no se puede modificar", historial de versiones de la carta con quién y cuándo, capturas en `.uak-shots/HACK-007/` y SHIP de `design-critic`
- **Tests:** clausula_protegida_es_solo_lectura, error_422_muestra_aviso, guardar_crea_nueva_version
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
- **Next step:** leer `web/DESIGN.md`, tests en vitest y `uak red HACK-007`

## HACK-008 · Pendientes por municipio y expediente de jornada
- **Type:** feature
- **Priority:** P0
- **Estimate:** 40 min
- **Rubric / Spec:** C1, C2 · Reto 2 demo: ver pendientes por municipio; expediente con servicios y responsables
- **Depends on:** HACK-002
- **Uses contract:** HACK-001, HACK-009
- **Related:** HACK-004
- **Paths:** web/src/features/pendientes/, web/src/features/expediente/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: list · Hero: municipios ordenados por pendientes críticos, `/pendientes` agrupa por municipio: cuántos pendientes, cuál es el más urgente, semáforo, `/panel/:jornada` expediente: municipio, sede, fecha, servicios, responsables, persona enlace y checklist, capturas en `.uak-shots/HACK-008/` y SHIP de `design-critic`
- **Tests:** agrupa_pendientes_por_municipio, ordena_municipios_por_urgencia, expediente_muestra_servicios_y_responsables
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
- **Next step:** leer `web/DESIGN.md`, tests en vitest y `uak red HACK-008`

## HACK-009 · API de requisitos configurables y pendientes por municipio
- **Type:** feature
- **Priority:** P0
- **Estimate:** 30 min
- **Rubric / Spec:** C1 · Reto 2: lista de requisitos configurable (carta compromiso, fotos del espacio, logotipos, persona enlace)
- **Depends on:** HACK-001
- **Uses contract:** HACK-001
- **Related:** HACK-008
- **Paths:** server/routes/requisitos.js, server/routes/pendientes.js, server/tests/requisitos.test.js
- **Freeze-Allowed:** no
- **Acceptance:** `GET/POST /api/requisitos` catálogo editable; el default trae carta compromiso, fotos del espacio, logotipos y persona enlace, crear jornada con un subconjunto de requisitos crea solo esos documentos, `GET /api/pendientes` agrupa por municipio con conteo y el más urgente
- **Tests:** catalogo_default_trae_cuatro_requisitos, jornada_usa_solo_requisitos_elegidos, pendientes_agrupa_por_municipio
- **Verify:** `npm test`
- **Next step:** tests con node:test y `uak red HACK-009`

## HACK-010 · Bitácora de auditoría y pulido móvil
- **Type:** feature
- **Priority:** P1
- **Estimate:** 35 min
- **Rubric / Spec:** C2, C3 · Reto 2: trazabilidad; municipio usa celular
- **Depends on:** HACK-002, HACK-004
- **Uses contract:** HACK-003
- **Related:** HACK-004
- **Paths:** web/src/features/bitacora/
- **Freeze-Allowed:** no
- **Acceptance:** Recipe: list · Hero: línea de tiempo de cambios por jornada, `/panel/:jornada/bitacora` muestra quién hizo qué y cuándo (subida, observación, aprobación, cambio de carta), vista del municipio usable a 390×844 sin scroll horizontal, capturas 1280×720 y 390×844 en `.uak-shots/HACK-010/` y SHIP de `design-critic`
- **Tests:** bitacora_ordena_eventos_recientes_primero, muestra_actor_y_accion
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
- **Next step:** tests en vitest y `uak red HACK-010`

## HACK-011 · Seed de datos demo, core.test con mkdtemp y despachador de recordatorios en index.js (follow-up of HACK-001)

- **Type:** follow-up
- **Priority:** P1
- **Depends on:** HACK-001
- **Follow-up of:** HACK-001
- **Paths:** package.json, package-lock.json, server/app.js, server/index.js, server/db.js, server/kv.js, server/semaforo.js, server/routes/jornadas.js, server/routes/documentos.js, server/routes/panorama.js, server/tests/core.test.js, schemas/, docker-compose.yml, Dockerfile, render.yaml, .env.example, .gitignore
- **Freeze-Allowed:** no
- **Acceptance:**
  - Seed de datos demo, core.test con mkdtemp y despachador de recordatorios en index.js
- **Verify:** `npm test`

## HACK-012 · App.tsx registra la ruta y la vista que exporta cada feature, para que 006, 007, 008 y 010 no lo editen (follow-up of HACK-002)

- **Type:** follow-up
- **Priority:** P1
- **Depends on:** HACK-002
- **Follow-up of:** HACK-002
- **Paths:** web/DESIGN.md, web/src/index.css, web/src/lib/ui/, web/src/App.tsx, web/src/main.tsx, web/public/design-lock/, web/package.json, web/package-lock.json, web/index.html, web/vite.config.ts, web/tsconfig.json
- **Freeze-Allowed:** no
- **Acceptance:**
  - App.tsx registra la ruta y la vista que exporta cada feature, para que 006, 007, 008 y 010 no lo editen
- **Verify:** `test -s web/DESIGN.md && ls web/public/design-lock/screens/*-1280.png && bash .uak/bin/uak lint`

## HACK-013 · Camino demo: crear jornada y enviar acceso desde el panel, municipio enlaza a su carta (follow-up of HACK-004)

- **Type:** follow-up
- **Priority:** P1
- **Depends on:** HACK-004
- **Follow-up of:** HACK-004
- **Paths:** web/src/features/municipio/, web/src/features/panel/, web/src/lib/api.ts, web/src/mocks/
- **Freeze-Allowed:** no
- **Acceptance:**
  - Camino demo: crear jornada y enviar acceso desde el panel, municipio enlaza a su carta
- **Verify:** `npm --prefix web run build && npm --prefix web test -- --run`
