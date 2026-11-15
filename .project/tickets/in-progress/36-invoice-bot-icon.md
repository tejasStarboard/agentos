# 36 — Custom icon for `invoice-bot`

**Status:** in-progress

## Goal

Give the customer extension `invoice-bot` a distinct Activity Bar / manager icon instead of the shared block (`CubeIcon`) fallback.

## Depends on

- Ticket **34** — extension `icon` in `meta.json` + Shell wiring

## Done when

- [x] `examples/client-app/extensions/invoice-bot/meta.json` sets `"icon"` to an invoice-appropriate Phosphor name (suggested: `Receipt` or `Invoice`)
- [x] Icon appears in Activity Bar for the invoice page contribution and in Extension Manager
- [x] No change to builtin icons or other customer extensions

## Notes

Path: `examples/client-app/extensions/invoice-bot/`. This extension has `ui/page.tsx`, so it is the clearest Activity Bar case after ticket 34.
