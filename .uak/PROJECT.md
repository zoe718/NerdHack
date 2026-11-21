# PROJECT · Eira × Nerdearla Vibeathon México 2026 · Reto 2 (sprint mode)

> Filled in by `/uak-setup` with the human at minute 0. uak reads the flat fields of the last block from
> the remote `main`, so a stale worktree can never change permissions.

## Event
| Field | Value |
|---|---|
| Event / challenge | Eira × Nerdearla Vibeathon México 2026 · Reto 2: Coordinación institucional, cartas compromiso y documentación · URL oficial: unverified |
| Start | 2026-11-21 11:00 America/Mexico_City |
| Official deadline | 2026-11-21 16:00 America/Mexico_City · platforms: Devpost + repo GitHub zoe718/NerdHack |
| Design lock | 11:15 |
| First claim by | 11:24 · walking skeleton 11:30 |
| Plan-B video | 13:30 |
| Freeze | 15:15 · `Freeze-Epoch: 1795295700` (uak clock) |
| Clean rehearsal / plan B | 15:36 |
| Internal submission | 15:45 |
| Humans | zoe718: dueño del producto · submission owner: zoe718 |
| Agents | claude-1 (backend), devin-1 (frontend) |
| Machines | laptop Windows · ports: 6379 Valkey, 1025/8025 Mailpit |

## Official rubric (weights sum to 100)
Criterios de la diapositiva "¿Qué espera ver el jurado?"; pesos iguales elegidos por el equipo (no oficiales).
| ID | Criterion | Weight | Evidence in the demo |
|---|---|---:|---|
| C1 | Una demo: caso completo con datos ficticios | 34 | Flujo de 6 pasos de IDEA.md §4 (Villa Ejemplo) |
| C2 | Utilidad: ¿cómo ayuda a Eira? ¿es fácil de usar? | 33 | Panel con semáforo, recordatorios T−21/T−14, magic link sin contraseña |
| C3 | Privacidad: ¿cómo cuidan los datos? ¿qué cambiaría en otra campaña? | 33 | Sin datos clínicos, magic link de un uso, auditoría, cláusulas protegidas, IDEA.md §9 |

## Event rules
| Topic | Confirmed rule | Source |
|---|---|---|
| AI use / prior code | unverified (vibeathon: IA permitida); kit subido al inicio | unverified |
| Data and licenses | Solo datos ficticios | Guía Reto 2 Eira |
| Format and video limits | Devpost; límite de video unverified | unverified |

## Plan B
- A video of the whole flow at `demo/plan-b.mp4` (v1 at 13:30, final at 15:15). Use it if Valkey, Mailpit or the network fails; `USE_VALKEY=false` keeps the demo working.

## Executable config
A human sets `yes`. A missing field means `no`.

```text
Mode: sprint
Backlog-Proposed-Epoch: 0
Backlog-Approved: yes
Autonomy: yes
Auto-Merge: yes
Review-Mode: claims
Plan-Channel: claims
Freeze-Epoch: 1795295700
Lease-Seconds: 2700
Review-Lease-Seconds: 14400
Events-Per-Session: 100
Checkpoint-Percent: 60
Merge-Lease-Seconds: 1800
Merge-Wait-Seconds: 180
Merge-Adopt-Seconds: 300
Max-Parallel-Subagents: 4
Opus-Subagents-Per-Session: 2
Pace: auto
Subagent-Hard-Cap: 6
Strong-Hard-Cap: 3
Subagents-Per-Session: 40
Subagents-Per-Machine: 8
Subagent-Burst-Per-Minute: 6
Max-Worktree-Agents: 6
Blackbox: on
Additive-Paths: -
Test-First: yes
```
