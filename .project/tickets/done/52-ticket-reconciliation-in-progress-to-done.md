# 52 — Ticket reconciliation: promote covered in-progress → done

**Status:** done

## Goal

Run the **ticket reconciliation** process: move in-progress tickets whose work is already covered (all **Done when** items checked, implementation landed) from `in-progress/` into `done/`, and set `**Status:** done` in each file.

This is the human/process-owned step that agents must **not** do during normal implementation (see [tickets README](../README.md)).

## Depends on

- None (process / docs chore). Run whenever a batch of in-progress tickets is fully covered.

## Candidates (as of ticket creation)

All **Done when** checkboxes are `[x]` — verify once more before moving:

| Ticket | Title                                                  |
| ------ | ------------------------------------------------------ |
| **43** | Auth gate routes + `agentos.config.ts`                 |
| **44** | Branding config + `/_public` assets                    |
| **45** | Shell feature folder layout                            |
| **46** | Hide empty active UI contribs + Home dashboard sidebar |
| **47** | Shell topbar                                           |
| **48** | Builtin settings extension                             |
| **49** | Shell not-found page                                   |
| **50** | Auth account settings panel                            |
| **51** | Chore: monorepo clean + Python uv sync on install      |

If a ticket still has open work or unchecked acceptance, leave it in `in-progress/`.

## Done when

- [x] Each covered ticket file is moved `in-progress/` → `done/`
- [x] Each moved file has `**Status:** done` (not `in-progress`)
- [x] Tickets still incomplete remain in `in-progress/` with accurate status
- [x] [`.project/tickets/README.md`](../README.md) order list notes reconciliation / current open set if useful (optional, light touch)
- [x] No product code changes — docs/ticket-folder moves only

## Notes

- Agents implementing features must still leave finished work in `in-progress/`; only this (or a future) reconciliation ticket authorizes promotion to `done/`.
- Prefer one reconciliation PR/commit for the whole covered batch so history stays clear.
- Do not renumber tickets or invent new build work here.

## Verify

- `ls .project/tickets/in-progress/` only lists tickets that are still unfinished
- `ls .project/tickets/done/` includes 43–51 (or whichever subset was confirmed covered)
- Spot-check moved files for `**Status:** done`

## Covered in this reconciliation

- Promoted **43–51** → `done/` with `**Status:** done`
- Open backlog remains in `todo/`: **29** (E2E verification), **30** (Next host adapter spike)
