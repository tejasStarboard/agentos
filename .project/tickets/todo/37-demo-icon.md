# 37 — Custom icon for `demo`

**Status:** todo

## Goal

Give the customer extension `demo` a distinct Activity Bar / manager icon instead of the shared block (`CubeIcon`) fallback.

## Depends on

- Ticket **34** — extension `icon` in `meta.json` + Shell wiring

## Done when

- [ ] `examples/client-app/extensions/demo/meta.json` sets `"icon"` to a demo-appropriate Phosphor name (suggested: `Sparkle` or `Flask`)
- [ ] Icon appears in Activity Bar for the demo page contribution and in Extension Manager
- [ ] No change to builtin icons or other customer extensions

## Notes

Path: `examples/client-app/extensions/demo/`. Sample/scaffold extension; pick a light, non-domain icon so it stays visually distinct from CRM and invoices.
