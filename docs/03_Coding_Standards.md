# Coding standards

- Use strict TypeScript for app code and keep API boundaries explicitly typed.
- Use Next.js App Router conventions. Keep server-only modules out of client components.
- Validate user-controlled inputs with Zod at API boundaries; return clear status codes and messages.
- Keep database reads and writes in `lib/repository.ts` or route handlers, with SQL schema in `db/schema.sql` and additive migrations/seeding in `scripts/setup-db.ts`.
- Use stable IDs for machine and workout content. Keep Arabic translations alongside the English concepts in `data/translations.ar.json`.
- Keep UI controls keyboard operable, labelled, and large enough to tap. Respect reduced-motion settings and text direction.
- Prefer small components and readable code over compressed JSX. Keep shared visual values in `app/globals.css`.
- Never commit `.env.local`, SQLite databases, or uploaded video files.
- Read `AGENTS.md`, `docs/START_HERE.md`, and the relevant ADR before broad changes.
