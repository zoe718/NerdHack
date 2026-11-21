# Agent messages

Append-only; use bash .uak/bin/uak msg / inbox. Format: - N | epoch | from | to | kind | task | text

- 1 | 1795283923 | zoe718 | all | info | - | Backlog: new tasks HACK-001 HACK-002 HACK-003 HACK-004 HACK-005 published by zoe718. uak next shows them.
- 2 | 1795284429 | zoe718 | all | info | - | Backlog: new tasks HACK-006 HACK-007 HACK-008 HACK-009 HACK-010 published by zoe718. uak next shows them.
- 3 | 1795285305 | claude-1 | agent:devin-1 | review | HACK-001 | HACK-001 ready for review (your turn by rotation): https://github.com/zoe718/NerdHack/pull/4 (SHA 24cd821540805c40bbbefc3ee635c9873d289c9c). /uak-review HACK-001; if you can't, reply and any free agent takes it (uak next shows it).
