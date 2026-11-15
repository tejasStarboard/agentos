# `@agentos/core/api` tests

Run with:

```bash
bun test packages/core/src/api/tests/
```

- `env.test.ts` — platform / extension env naming helpers
- `create-app.test.ts` — health, dispatch, middleware, 404/405
- `load-routes.test.ts` — file scan, `[param]` → `:param`, fixtures under `fixtures/routes/`
- `match-route.test.ts` — path pattern matching
