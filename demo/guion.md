# Guion de la demo · 2 minutos

El pitch dura 2 minutos. Todo se muestra con datos ficticios.

## Antes de empezar
- Abre https://nerdhack.onrender.com dos minutos antes: el plan gratuito tarda cerca de un minuto en despertar y arranca con los datos sembrados.
- Dos ventanas lado a lado. Izquierda (Eira): `/panel` (luego `/panel/1/revision`). Derecha (municipio): `/m/1`.
- Ten a la mano dos archivos pequeños para subir.
- Si algo falla: `demo/plan-b.webm` (56 s, el mismo recorrido grabado de la app real).

## Recorrido

| Tiempo | Qué se dice | Qué se hace |
|---|---|---|
| 0:00 a 0:15 | Eira coordina cada jornada con el municipio por Excel, WhatsApp y correo, y el mayor problema son los retrasos. Jornada Lista les da un expediente por jornada. | Mostrar las dos ventanas. |
| 0:15 a 0:25 | Eira abre la jornada en un minuto y le manda al municipio un enlace de acceso, sin contraseña. | Izquierda: `/panel`, Nueva jornada, llenar municipio, sede y fecha, Crear jornada; luego Enviar acceso y mostrar el enlace `/m/ID#t=…` (en la demo se muestra en pantalla porque no sale correo). |
| 0:25 a 0:35 | El municipio entra sin contraseña y sube lo que le toca. A Eira le aparece solo. | Derecha: subir el primer archivo en Fotografías del espacio. Izquierda: aparece el archivo con su versión. |
| 0:35 a 1:00 | Eira ve que falta algo y pide un cambio; tiene que escribir el motivo. El municipio lo ve al instante, sin recargar. | Izquierda: Observar, escribir "Falta foto de la sede", Enviar observación. Derecha: aparece el aviso. |
| 1:00 a 1:20 | El municipio corrige. La versión anterior se conserva con su huella, y Eira aprueba. | Derecha: Subir nueva versión. Izquierda: se ven v1 y v2; Aprobar. |
| 1:20 a 1:40 | La carta compromiso sale de una plantilla: los datos cambian, las cláusulas no. Si alguien las altera, el servidor rechaza la carta. | Derecha: desde `/m/1`, Carta compromiso (o `/m/1/carta`), cambiar la sede, Guardar carta, mostrar el historial. |
| 1:40 a 1:55 | Eira ve en un semáforo qué jornada necesita atención. No guardamos datos clínicos, el enlace es de un solo uso y todo queda en bitácora. | Izquierda: `/panel` y luego `/panel/1/bitacora`. |
| 1:55 a 2:00 | Qué es real y qué está simulado. Cada jornada, lista a tiempo. | Mostrar la sección de la portada o el README. |

## Lo que hay que decir con honestidad
- No se envía correo: el enlace de acceso se pide por API y los recordatorios quedan en la bitácora.
- Crear la jornada y enviar el acceso ya tienen pantalla en `/panel`; como no sale correo, el enlace de acceso se muestra en pantalla (solo para la demo). El resto del recorrido usa la jornada sembrada 1.
- La API aún no exige sesión: el enlace de un solo uso funciona, pero el control por rol falta.
- El semáforo en rojo se muestra con el reloj de demo (`DEMO_CLOCK_OFFSET_DAYS`); en el despliegue las jornadas sembradas están en verde.

## Preguntas probables
- ¿De dónde sale el semáforo? De la fecha de la jornada y el estado de cada requisito: rojo a 7 días o menos sin aprobar, ámbar a 14.
- ¿Qué cambiaría en otra campaña? La lista de requisitos es configurable (`/api/requisitos`) y la plantilla de carta se sustituye; el resto no cambia.
- ¿Y en un piloto real? Control de acceso por rol, Postgres con respaldo, almacenamiento cifrado, correo con acuerdo de datos y revisión legal.
