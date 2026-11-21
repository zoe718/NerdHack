# HACK-005
ID: HACK-005
State: REVIEW
Owner: devin-1
Branch: feat/hack-005
Worktree: /c/Users/zm180/OneDrive/Desktop/NerdHackDevin/NerdHack-wt/hack-005
Worklog: worklog/WL-1795291628-devin-1-HACK-005-hack.CHXtsI.md
Priority: P0
Paths: web/src/features/landing/, demo/, README.md
Depends: HACK-002, HACK-004
Verify: `npm --prefix web run build && bash .uak/bin/design-lint`
Lease-Until: 1795307867
Updated: 1795293467
Task-Base: f28469ab643c1c97d06be2b8275770bd0cc7c2b5
Next: Wait for review of SHA 2b062da
PR: https://github.com/zoe718/NerdHack/pull/15
Evidence: npm --prefix web run build && bash .uak/bin/design-lint exit 0 (DESIGN_LINT_PASS); npm --prefix web test -- --run exit 0; smoke PRODUCT_PASS; navegador: / a 1280, 1920 y 390 sin scroll horizontal ni errores de pagina, /panel, /m/1 y /pendientes siguen abriendo; video demo/plan-b.webm de 56 s grabado de la app real (webm, no mp4: sin codificador H.264 aqui); entrega en Devpost pendiente de un humano
Participants: author devin-1 (unknown)
Events: 4
Checkpoints: 1
Sessions: 1
Last-Checkpoint: 1795293467
Progress: 0 commit(s) since the claim · last: f28469a Merge pull request #13 from zoe718/feat/hack-008 (23 minutes ago) · 0 uncommitted tracked file(s) · at 1795292922
Progress-Head: f28469a/1051512484
Progress-Changed: 1795292922
Task-Tip: 2b062dae19e43dd486fdd91dc756793521643f15
