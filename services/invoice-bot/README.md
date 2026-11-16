# Invoice Bot service

Python FastAPI backend for the `invoice-bot` sample extension (ticket 26).

**Repo:** [services/invoice-bot](https://github.com/tejasStarboard/agentos/tree/main/services/invoice-bot) · SDK: [`packages/python`](../../packages/python/README.md)

Linked from `examples/client-app/extensions/invoice-bot/meta.json`
(`language: python`, `root: ../../services/invoice-bot`, port **6102**).
`examples/client-app/services` is a symlink to the repo-root `services/` folder.

See [services.md](../../.project/docs/services.md) for the extension ↔ service boundary.

## Run

**Preferred:** from the repo root, `bun dev` starts Vite + builtin BFFs + this
service (via `packages/core/scripts/dev-bffs.ts`).

Manual (when `bun dev` is already running builtins):

```bash
cd services/invoice-bot
AGENT_OS_AUTH_API_BASE=http://127.0.0.1:6110 \
AGENT_OS_DB_STORE_API_BASE=http://127.0.0.1:6111 \
AGENT_OS_HITL_API_BASE=http://127.0.0.1:6114 \
PYTHONPATH=../../packages/python:. \
  ../../packages/python/.venv/bin/python -m uvicorn app.main:app \
  --host 127.0.0.1 --port 6102
```

Vite proxies `/api/ext/invoice-bot/*` → `127.0.0.1:6102`. Sign in as demo admin
(`admin@example.com` / `password123`) so `invoice.read` / `invoice.write` pass via `*`.

## Routes

| Method | Path                             | Role                                            |
| ------ | -------------------------------- | ----------------------------------------------- |
| `GET`  | `/health`                        | Built-in via `create_app`                       |
| `GET`  | `/invoices`                      | List invoices (UI) — `invoice.read`             |
| `POST` | `/tools/parse_invoice`           | Parse + insert — `invoice.write`                |
| `POST` | `/tools/request_payout_approval` | HITL approval + status update — `invoice.write` |
