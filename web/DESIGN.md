# DESIGN · Jornada Lista

> Escrito por `/uak-design-lock` con la dirección que zoe718 eligió mirando capturas (21 nov 2026, dirección 1 de 4).
> Un cambio global después del lock (tema, paleta, tipografía, shell) necesita una decisión humana.

## Direction
- Name: `Rosa y berenjena` · Intent: `un tablero claro y amable donde el único color fuerte es el del semáforo`
- The one memorable element: `el semáforo: tres lámparas con su conteo como héroe del panel, y la franja ámbar "Eira pidió un cambio" en la vista del municipio; todo lo demás es calma`
- References: `web/public/design-lock/screens/` (las tres pantallas bloqueadas). El humano no dio productos de referencia; IDEA.md §0 pide un tablero tipo Linear o Notion.

## Type
- Families: display `Quicksand 700` · body `Cabin 400 y 600` (paquetes `@fontsource`, sin CDN)
- Scale (px, 6 steps): `12 / 14 / 16 / 20 / 28 / 56` (utilidades `text-xs` a `text-hero`; no existen otros tamaños)
- Body: `16` px · line height `1.5` · hero display `56` px · tabular figures for numbers: yes (`tabular-nums`)
- Tres niveles por pantalla: display (título o número héroe), cuerpo y secundario.

## Space and shape
- Spacing scale (px): `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` (3 o 4 pasos por pantalla: 24 entre bloques, 16 dentro)
- Radius family: `8 / 12 / 18` (`rounded-sm`, `rounded-md`, `rounded-lg`) · elevation: ninguna (`--elevation` vacío), hairlines `1px --line`
- Content width `1200` px · side panel `360` px (la columna de un tercio de la receta detail) · formularios `720` px
- La demo corre en dos ventanas lado a lado en un proyector de 1280: toda pantalla se lee a 640 de ancho.

## Color (tokens en `web/src/index.css`)
| Token | Value | Job |
|---|---|---|
| `--bg` | `#f6f3f8` | página |
| `--surface` | `#ffffff` | el único nivel de contenedor |
| `--surface-2` | `#eee9f2` | fondo de íconos, chips neutros, bloque protegido y deshabilitado |
| `--text` / `--text-2` | `#1e1826` / `#5a5266` | cuerpo / secundario |
| `--line` | `#dcd5e3` | líneas finas |
| `--accent` | `#c2185b` | la acción primaria y la marca, nada más |
| `--accent-ink` | `#ffffff` | texto sobre el acento (contraste de 4.5:1 o más, lo revisa `design-lint`) |
| `--shell` / `--shell-ink` | `#2b1a3f` / `#ffffff` | barra de navegación berenjena y su texto |
| `--ok` / `--warn` / `--bad` | `#1b7f4d` / `#f2ae17` / `#c93a2c` | solo estados: las lámparas del semáforo |
| `--ok-ink` / `--warn-ink` / `--bad-ink` | `#ffffff` / `#3a2900` / `#ffffff` | texto sobre cada color de estado |
| `--info` | `#3d5a96` | estado recibido (en revisión de Eira) |
| `--ok-soft`, `--warn-soft`, `--bad-soft`, `--info-soft`, `--accent-soft` y su `-ink` | ver `index.css` | chips y franjas de estado |

Disabled: fondo `--surface-2` con texto `--text-2`; nunca el acento con opacidad.
Un estado nunca se dice solo con color: lleva lámpara o ícono y la palabra.

## Shell (owned by the design lock task)
- `AppShell` · `NavBar` (marca, `pill` para las vistas, 6 entradas como máximo) · `PageHeader` · `PageLayout` (una receta por pantalla: dashboard, detail, flow, list)
- Dos roles: `eira` ve la vista Panorama y su nombre; `municipio` no ve navegación, solo su jornada y el aviso de acceso de un solo uso.
- At 390 wide: quedan la marca y el indicador de acceso; con más de una vista, las vistas pasan a una fila de pestañas bajo la barra.
- UI kit en `web/src/lib/ui/`: `Button`, `Surface`, `Chip`, `EstadoChip`, `DemoBadge`, `Lamp`, `Semaforo`, `Legend`, `Stat`, `Row`, `RowList`, `SectionHeader`, `Steps`, `TextField`, `TextAreaField`, `ProtectedBlock`, `EmptyState`, `ErrorState`, `Skeleton`, `EnVivo`.
- Íconos: solo los de `icons.ts` (Phosphor regular, 20 px; 16 px dentro de chips). Un ícono nuevo se agrega ahí.
- Rutas: cada `web/src/features/NOMBRE/index.tsx` exporta su componente por defecto y `ruta` (`path` y `rol`: eira, municipio o publico); si va en la barra de Eira exporta también `vista` (`etiqueta`, `orden`). `App.tsx` las registra solas: ninguna feature edita `App.tsx`.
- Todo dato de ejemplo lleva `DemoBadge` ("Datos de ejemplo") en el `PageHeader`.

## Screens: one recipe and one hero each
| Screen | Recipe (skill `product-ui` §2) | Hero |
|---|---|---|
| `/panel` Panorama de Eira (`panel-1280.png`) | dashboard | el semáforo de jornadas: tres lámparas con conteo; el rojo es el número más grande |
| `/m/:jornada` Vista del municipio (`municipio-1280.png`) | detail | la franja "Eira pidió un cambio" con el motivo y la acción de subir |
| Carta compromiso (`carta-1280.png`) | flow | el grupo de campos del paso actual, con las cláusulas fijas bloqueadas a la vista |
| Revisión de Eira y expediente | detail | el requisito en revisión con sus acciones de aprobar y observar |
| Pendientes y bitácora | list | la fila: lámpara o ícono, título, meta, estado y acción |
| Landing | `landing-story` | el wow como captura real: las dos ventanas lado a lado |

Las pantallas bloqueadas viven en `web/src/lib/ui/lock/` y se abren en `/design-lock/panel`, `/design-lock/municipio` y `/design-lock/carta`. Cada pantalla nueva copia la de su receta.

## AI tells we refuse
- A colored side stripe on rows or cards · a card inside a card · a grid of equal boxes
- Purple-blue gradients, glass on every surface, emoji as icons, tracked-out uppercase eyebrows over every heading
- Three equal pricing or feature cards · every label in the same weight · `demo:`, `undefined` or raw IDs on screen
- Para este producto: un semáforo que solo se distingue por color · rojo o ámbar usados como adorno · un número sin su fuente
