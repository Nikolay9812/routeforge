# RouteForge Mobile

Expo courier app for RouteForge.

## Development

Run commands from the monorepo root:

```powershell
npm --workspace mobile run start
npm --workspace mobile run lint
npm --workspace mobile run typecheck
```

## Notes

- Follow root `AGENTS.md` and `context/mobile-rules.md`.
- Keep mobile UI German-first, courier-scoped, and wired to real InsForge data where backend support exists.
- Keep mobile dependencies in this workspace package and the lockfile at the monorepo root.
