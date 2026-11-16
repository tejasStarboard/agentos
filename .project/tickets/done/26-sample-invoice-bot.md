# 26 — Sample `invoice-bot` extension + Python service

**Status:** done

## Goal

TS extension (ui/agent/meta) + separate `services/invoice-bot` FastAPI service.

## Done when

- [x] `ui/page.tsx` invoice table in main slot
- [x] `meta.json` points at `services/invoice-bot`
- [x] Tools `parse_invoice`, `request_payout_approval` → HITL + db-store
- [x] `agent/instructions.md` composed into AI prompt when enabled

## Notes

Proves extension vs service boundary.
