# 34 — Extension icons via `meta.json`

**Status:** in-progress

## Goal

Stop hardcoding `CubeIcon` for every customer extension in the Activity Bar. Let each extension declare a Phosphor icon name in `meta.json`, and have the Shell render it.

## Depends on

- Tickets 5–8 (Shell + Extension Manager) — done
- Tickets 10–11 (scanner + virtual registry) — done

## Done when

- [x] `meta.json` accepts optional `icon` (Phosphor icon export name, e.g. `"Users"`)
- [x] Scanner / `ExtensionMeta` / virtual registry pass `icon` through to the Shell
- [x] `ExtensionEntry` (or equivalent) exposes `icon` to Shell UI
- [x] Activity Bar maps `icon` → `@phosphor-icons/react` component; unknown/missing → keep `CubeIcon` fallback
- [x] Extension Manager (and other Shell chrome that lists extensions) uses the same icon when applicable
- [x] Docs: `extensions.md` + cookbook mention `icon` in `meta.json`
- [x] Unit/tests cover parse + Activity Bar fallback

## Notes

Today `packages/core/src/shell/components/activity-bar.tsx` always uses `CubeIcon` for extension items. Icons package is already `@phosphor-icons/react` (see `.cursor/rules/agentos-ui.mdc`). Prefer a small allowlist / dynamic map of known Phosphor icons rather than arbitrary `eval`.
