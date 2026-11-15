# 35 — Custom icon for `crm-helper`

**Status:** todo

## Goal

Give the customer extension `crm-helper` a distinct Activity Bar / manager icon instead of the shared block (`CubeIcon`) fallback.

## Depends on

- Ticket **34** — extension `icon` in `meta.json` + Shell wiring

## Done when

- [ ] `examples/client-app/extensions/crm-helper/meta.json` sets `"icon"` to a CRM-appropriate Phosphor name (suggested: `Users` or `AddressBook`)
- [ ] Icon appears in Activity Bar (when the extension contributes a navigable view) and Extension Manager
- [ ] No change to builtin icons or other customer extensions

## Notes

Path: `examples/client-app/extensions/crm-helper/`. CRM Helper currently contributes `ui/sidebar.tsx` (not a page); confirm where Shell shows its icon after ticket 34, and still set `meta.icon` for consistency.
