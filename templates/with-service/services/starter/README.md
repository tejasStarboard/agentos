# starter

Stub Python **service** for the `with-service` template. Linked from `extensions/starter/meta.json`.

Built-in `GET /health` → `{ "ok": true }` via `agentos.create_app`. Sample route: `GET /hello`.

## Run

Prefer `agentos dev` from the consumer app (starts this service when discovered).

Manual:

```bash
uv sync
uv run uvicorn app.main:app --host 127.0.0.1 --port 6111
```
