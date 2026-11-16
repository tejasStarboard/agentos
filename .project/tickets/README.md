# Tickets

Work items live in status folders. **Do them in numeric order** (filename prefix).

| Status          | Folder         |
| --------------- | -------------- |
| Backlog / ready | `todo/`        |
| Active          | `in-progress/` |
| Finished        | `done/`        |

### Agent status rules

1. When implementation **starts**, move the ticket `todo/` → `in-progress/` and set `**Status:** in-progress`.
2. When implementation **finishes**, leave the ticket in `in-progress/`. **Do not** move it to `done/`.
3. Only the **ticket reconciliation** process moves tickets into `done/` (and updates `**Status:** done`).

Agents must never promote tickets to `done/` themselves.

## Order (1 → 30)

1. Reset legacy workspace
2. Scaffold monorepo
3. Core package exports
4. Comlink SDK
5. Shell UI skeleton
6. Extension host iframes
7. Client hooks
8. Extension Manager
9. Command palette / toasts
10. Vite plugin scanner
11. Virtual registry
12. Virtual iframe entries
13. Gateway proxy
14. Agent control plane
15. Builtin auth
16. Builtin db-store
17. Builtin cache-store
18. Builtin ai
19. Supporting builtins
20. API kit app + loadRoutes
21. API kit auth
22. API kit store
23. Remaining API kit domains
24. Python `agentos` package
25. Sample crm-helper
26. Sample invoice-bot + service
27. CLI `agentos dev`
28. `.project` docs
29. E2E verification
30. (Later) Next.js host adapter spike
31. Install agent skills + ADR (pnpm workspaces / Bun runtime) — **done** (setup)
32. `.project` docs — **done** (setup)
33. Global + extension env config (`@t3-oss/env-core`) — keys export + app extend
34. Extension icons via `meta.json` (replace hardcoded Activity Bar `CubeIcon`)
35. Custom icon for sample `crm-helper`
36. Custom icon for sample `invoice-bot`
37. Custom icon for sample `demo`
38. Activity Bar primary (top→bottom) + secondary (bottom→top, builtins only)
39. Contextual sidebar (per active extension) + Shell panels (manager / HITL) in left sidebar
40. App-level `ui/dashboard.tsx` Home surface (mountShell dashboard option)
41. Chore: git / package metadata + README refresh
42. CLI package: scaffold client app (`create` / `init`, CRA / shadcn-init style)
43. Auth gate routes (`/login` `/register` `/reset-password`) + `agentos.config.ts`
44. Branding in `agentos.config.ts` + `/_public` consumer assets
45. Organize Shell components/hooks/lib by feature (auth, ui-contribs, …)
46. Hide empty active-extension UI contrib hosts + Home `ui/dashboard-sidebar.tsx`
47. Shell topbar (sidebar toggle, branding, settings stub)
48. Builtin `settings` extension + topbar Settings opens it
49. Shell not-found (404) page for unknown SPA paths
50. Auth account settings panel (profile / roles / security — not just sign-out)

**Runtime policy:** `pnpm install` for the monorepo; `bun run` / `bun` for all TS/JS services (never Node).

**Agents:** load `agentos-architecture` + `agentos-ticket-planner` before planning any remaining todo ticket.
