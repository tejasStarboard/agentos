# 26 — Sample `invoice-bot` extension + Python service

**Status:** todo

## Goal

TS extension (ui/agent/meta) + separate `services/invoice-bot` FastAPI service.

## Done when

- [ ] `ui/page.tsx` invoice table in main slot
- [ ] `meta.json` points at `services/invoice-bot`
- [ ] Tools `parse_invoice`, `request_payout_approval` → HITL + db-store
- [ ] `agent/instructions.md` composed into AI prompt when enabled

## Notes

Proves extension vs service boundary.
