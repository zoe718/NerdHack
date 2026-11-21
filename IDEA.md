# IDEA · Jornada Lista

> Reto: **Reto 2 · Coordinación institucional, cartas compromiso y documentación** · Evento: Eira × Nerdearla Vibeathon México 2026 (21 nov 2026).
> Etiquetas: **[Decidido]** · **[Recomendado]** · **[A validar]**. Cada número del pitch sale de §10 con su fuente.
> §4 → tareas verticales · §6 → contrato · §7 → spikes · §8 → aceptación.

## 0. Nombre y marca (fijo en T0)
- Nombre: **Jornada Lista** **[Recomendado, el humano confirma]** · repo: `zoe718/NerdHack` · tagline: *"Cada jornada, lista a tiempo."*
- Cambiar el nombre después de T−50% requiere un `uak decision` humano.
- Look: tablero tipo Linear o Notion (limpio, denso, legible) y semáforo claro. Color de marca: rosa Eira **[A validar]**. La dirección visual se elige en `/uak-design-lock` con capturas.

## 1. Una línea
Para la **coordinadora de Eira y el enlace municipal**, que hoy persiguen cartas, fotos y logotipos por Excel, WhatsApp y correo y no ven quién debe qué ni cuándo, **Jornada Lista** les da **un expediente por jornada**. Ahí el municipio entra sin contraseña, llena la carta desde la plantilla, sube archivos y ve en vivo si algo quedó *observado*. Eira, por su parte, ve en un semáforo qué bloquea cada jornada. **A diferencia de** la hoja de cálculo y el seguimiento manual.

Ventaja frente a otros equipos: la mayoría hará un CRUD con formulario. Nosotros cerramos el **ciclo de corrección en vivo** (observar → corregir → aprobar, sin recargar). Además, la carta trae **cláusulas protegidas que no se pueden editar** y cada archivo queda con **versión y hash**. Así se cumplen tres límites explícitos de la guía.

## 2. Usuarios
| Persona | Momento | Necesidad | Paso |
|---|---|---|---|
| Coordinadora Eira (ficticia: "Laura") | Prepara jornadas con varios municipios | Saber qué falta, quién lo debe y qué bloquea | 1, 4, 5, 6 |
| Enlace municipal de Villa Ejemplo (ficticio: "Jorge") | Le piden carta, fotos y logotipo | Entrar fácil, sin cuenta nueva, y saber qué le falta | 2, 3, 4 |
| Dirección Eira | Revisa avance general | Panorama de pendientes críticos por municipio | 6 |

Familiaridad digital mixta (dice la guía): por eso el acceso es por **magic link**, sin contraseñas, y la vista del municipio es una sola página con checklist.

## 3. Caso demo
Es el **caso oficial de la guía**:
1. Eira crea una jornada en **"Villa Ejemplo"**.
2. El enlace recibe el checklist, llena los datos de la carta y sube fotos.
3. Eira detecta que falta una imagen y pide corrección.
4. El municipio adjunta la imagen y la coordinadora valida la carpeta.
5. El tablero muestra qué está completo y qué bloquea.

Usamos este caso porque recorre todo el flujo y porque es el que el jurado ya conoce. Todos los datos son **ficticios**.

## 4. Flujo de demo (≤6 pasos, ≤3 min; cada paso = una tarea vertical)
| # | Usuario hace | Ve en pantalla | API | Prio |
|---|---|---|---|---|
| 1 | Eira crea jornada (municipio, sede, fecha, servicios, responsables) y checklist | Expediente nuevo con 5 requisitos en *pendiente* | `POST /api/jornadas` | P0 |
| 2 | Eira envía acceso; el enlace abre el correo (Mailpit) y entra. Se reusa el link | Entra sin contraseña; **el 2º intento falla** | `POST /api/magic/solicitar` · `POST /api/magic/consumir` | P0 |
| 3 | Enlace llena la carta desde la plantilla y sube fotos y logo | Carta con campos variables llenos, **cláusulas fijas bloqueadas**; archivos en *recibido* v1 | `POST /api/jornadas/:id/carta` · `POST /api/documentos/:id/archivo` | P0 |
| 4 | Eira marca "fotografías" como *observado*: "falta foto de la sede" | **Wow:** en la ventana del municipio el estado cambia a *observado* con el comentario, **sin recargar** | `POST /api/documentos/:id/revision` · `GET /api/jornadas/:id/stream` (SSE) | P0 |
| 5 | Enlace sube la foto (v2); Eira aprueba | v1 → v2 en el historial; requisito en **verde** en ambas ventanas | `POST /api/documentos/:id/archivo` · `.../revision` | P0 |
| 6 | Eira abre el panorama y avanza el reloj demo | Semáforo por municipio y pendientes críticos; sale el recordatorio T−14 en Mailpit | `GET /api/panorama` · worker | P1 |

- **Wow en una frase:** dos ventanas lado a lado; Eira observa y el municipio lo ve al instante, corrige, y todo pasa a verde. Llegamos al wow en ≈45 s.
- **Plan B:** video grabado antes de 15:15. `USE_VALKEY=false` deja el mismo flujo en memoria. Mailpit es local, así que no depende de red.

## 5. Núcleo técnico
- **Método.** Es una máquina de estados explicable por requisito: `pendiente → recibido → observado ↔ recibido → aprobado`.
  - Cada transición queda en `auditoria`: actor, acción, detalle y fecha.
  - Cada archivo nuevo es una **versión** con `sha256`. Nunca se sobrescribe.
- **Semáforo (calculado, no guardado):**
  - 🟢 aprobado, o faltan más de 14 días.
  - 🟠 faltan 14 días o menos y está pendiente u observado.
  - 🔴 faltan 7 días o menos sin aprobar, o está vencido.
  - Plazos hacia atrás: T−21 y T−14 **[A validar con Eira]**.
- **Carta compromiso.** Plantilla con campos variables: municipio, sede, fecha, servicios, responsables y enlace.
  - Las cláusulas fijas van en bloque protegido: el servidor guarda su hash y **rechaza** cualquier cambio.
  - La generación **no es firma ni aprobación legal**. Eira valida al final; la firma está simulada.
- **No hay LLM en el camino crítico.** Ningún número ni estado lo produce un modelo.
- **Validación honesta.** Pruebas automáticas por criterio:
  - El link no se puede usar dos veces.
  - La cláusula alterada se rechaza (422).
  - La versión v2 conserva v1.
  - El semáforo es correcto en los bordes 14/7/0.
  - Con `USE_VALKEY=false` el flujo es idéntico.

**Valkey es ayudante, no el núcleo [Decidido].** Los datos y archivos viven en SQLite y disco. Valkey maneja solo lo temporal, con un máximo de 3 usos en la demo:
1. **Magic link de un solo uso:** `SET magic:{sha256(token)} jornada_id NX EX 900` y luego `GETDEL`.
   - El token viaja en el fragmento `#t=` y se consume por POST.
   - La respuesta es igual exista o no el correo.
2. **Tablero en vivo:** `PUBLISH jornada:{id}`, de ahí a SSE, y el cliente vuelve a pedir los datos.
3. **Recordatorios:** `ZADD reminders` (T−21, T−14).
   - El worker respeta un máximo de 2 por semana (`rem:wk:`) y solo envía en horario laboral.
   - `DEMO_CLOCK_OFFSET_DAYS` simula el paso del tiempo.

Si sobra tiempo: límite de solicitudes `rl:magic:` (5 por hora) y caché `dash:resumen` con TTL 30.

## 6. Datos (contrato en `app/schemas/` o equivalente)
| Entidad | Campos clave | Fuente |
|---|---|---|
| municipios | id, nombre, contacto_email | Ficticia (seed) |
| jornadas | id, municipio_id, sede, fecha, servicios, responsables, estado | Ficticia |
| documentos (requisitos) | id, jornada_id, tipo, obligatorio, estado, comentario, fecha_limite, actualizado_en | Checklist configurable |
| versiones | id, documento_id, n, archivo_ruta, archivo_sha256, subido_por, creado_en | Generada |
| cartas | id, jornada_id, campos_json, clausulas_hash, generada_en | Plantilla ejemplo |
| auditoria | id, jornada_id, actor, accion, detalle, creado_en | Generada |

Checklist base, que viene de la guía: carta compromiso, fotografías, logotipos, persona enlace y apoyo a convocatoria.

## 7. IA y APIs externas (cada una = spike de 30 min + fallback)
| Uso | Herramienta | Dueño de la clave | Fallback |
|---|---|---|---|
| Datos temporales y pub/sub | Valkey 9.x local (Docker, 127.0.0.1, contraseña, `noeviction`, AOF) | Local (`.env`, sin commit) | `USE_VALKEY=false` → Map en memoria |
| Correo | Mailpit local (SMTP 1025, web 8025) | No aplica | Mostrar el link en consola (solo demo) |
| LLM | **No se usa** en la demo | No aplica | No aplica |

## 8. Rúbrica → evidencia
La guía no define criterios: los fija Nerdearla. Mapeamos contra lo que la guía pide en §6 **[A validar con la rúbrica oficial]**.
| Lo que pide la guía | Paso o artefacto que lo prueba |
|---|---|
| Flujo crítico completo > muchas pantallas | Pasos 1–5 de punta a punta con datos ficticios |
| Separar implementado de simulado | Tabla §9 en README y en el cierre de la demo |
| Prototipo funcional, datos ficticios | Seed "Villa Ejemplo" + `reset-demo` |
| Arquitectura, tecnologías, decisiones | README: diagrama, Valkey como ayudante, fallback |
| Riesgos, seguridad, operación, costos | README §Privacidad y §Piloto real |
| Preguntas abiertas a validar con Eira | §11 de este archivo |
| Transversales (accesibilidad, conectividad, privacidad, interoperabilidad) | Contraste AA y teclado; export CSV o JSON; auditoría; roles |

## 9. Alcance
- **Fuera:** firma electrónica real, integración con sistemas de Eira, app móvil, multi-idioma y PDF con diseño final.
- **Implementado vs Simulado:**

| Componente | Estado |
|---|---|
| Expediente por jornada + checklist configurable | ✅ Implementado |
| Estados pendiente / recibido / observado / aprobado + comentario | ✅ Implementado |
| Carta desde plantilla con cláusulas protegidas (hash) | ✅ Implementado |
| Versiones de archivo con sha256 + auditoría | ✅ Implementado |
| Magic link de un solo uso con TTL (Valkey) | ✅ Implementado |
| Tablero en vivo SSE + pub/sub | ✅ Implementado |
| Semáforo y panorama de pendientes críticos | ✅ Implementado |
| Recordatorios con ZSET | ✅ Implementado (P1) |
| Envío de correo | 🟡 Simulado (Mailpit) |
| Paso del tiempo | 🟡 Simulado (`DEMO_CLOCK_OFFSET_DAYS`) |
| Firma o acreditación de la carta | 🟡 Simulada |
| Valkey administrado con TLS y ACL, respaldos en producción | 📄 Diseñado, no implementado |

- **Idioma de la UI:** español (México).
- **Ética y datos (transversales de la guía §5):**
  - **Minimización:** Valkey guarda solo IDs opacos o hashes, cada llave con TTL, sin PII ni documentos.
  - **Acceso:** roles Eira y municipio; el municipio solo ve su jornada.
  - **Registro:** auditoría de accesos y cambios.
  - **Archivos y secretos:** archivos en disco fuera de la carpeta pública; `.env` ignorado por git.
  - **Interoperabilidad:** export abierto en CSV o JSON.
  - **Conectividad:** si la conexión SSE se cae, se reconecta y vuelve a pedir los datos; los conflictos se resuelven por versión, nunca sobrescribiendo.
  - **Piloto real:** Postgres con respaldo probado, almacenamiento cifrado con URL firmada, proveedor de correo con acuerdo de datos, política de retención y revisión legal (LFPDPPP **[A validar con asesoría]**).

## 10. Datos citables (de la guía oficial del Vibeathon, leída el 21 nov 2026)
| Dato | Fuente |
|---|---|
| Eira se fundó en 2017 en Ciudad Guzmán, Jalisco | Guía oficial del Vibeathon (PDF entregado por el organizador) |
| Más de 51,000 personas beneficiadas a sept 2026 (acumulado, no pacientes únicos) | Guía oficial del Vibeathon |
| Hoy usan Excel o Sheets y un formato institucional de carta; el mayor problema son los retrasos | Guía oficial, Reto 2 |
| La generación automática no es firma ni aprobación legal; Eira valida al final | Guía oficial, Reto 2 · Límites |

## 11. Preguntas abiertas para mentores y Eira
1. ¿Qué campos de la carta se llenan solos y cuáles son cláusulas fijas?
2. ¿Qué documentos son obligatorios y cuáles pueden llegar después?
3. ¿Qué recordatorios sirven, a quién y con qué frecuencia? Proponemos T−21 y T−14, máximo 2 por semana y en horario laboral.
4. ¿Quién firma la carta en el municipio y cómo se acredita?
5. ¿Qué define un pendiente "crítico": la fecha, el tipo de documento o ambos?

## 12. Riesgos y siguientes pasos
- **Riesgos y mitigación:**
  - Si Valkey no conecta en 30 min, usamos el flag `false`.
  - Si SSE falla tras un proxy, el cliente hace polling cada 5 s como respaldo.
  - Para no pasarnos de alcance, congelamos a las 14:15.
- **Siguientes pasos para un piloto:**
  - Validar la plantilla real de carta con Eira.
  - Capacitar a enlaces en 15 min.
  - Definir un responsable operativo en Eira.
  - Pasar a Postgres más almacenamiento cifrado.
