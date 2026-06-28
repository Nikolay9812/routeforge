# RouteForge Admin

Next.js admin panel for RouteForge admins and dispatchers.

## Development

Run commands from the monorepo root:

```powershell
npm --workspace admin run dev
npm --workspace admin run lint
npm --workspace admin run typecheck
```

## Notes

- Follow root `AGENTS.md` and `context/admin-rules.md`.
- Read installed Next.js docs in `node_modules/next/dist/docs/` before changing Next.js APIs or routing.
- Keep admin dependencies in this workspace package and the lockfile at the monorepo root.
