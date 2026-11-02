# Developer handbook

## Run locally

Use Node.js 24 or newer and npm. From this directory:

```powershell
npm install
npm run dev
```

On first run, the database setup script creates a random `.env.local` secret, runs Better Auth migrations, creates app tables, and seeds bilingual guides and starter workouts. Visit `http://127.0.0.1:3000`.

## Where changes belong

- Routes and API handlers: `app/`
- Shared app interface: `components/fitness-app.tsx`
- Theme and responsive styling: `app/globals.css`
- Auth, SQLite connection, repository, and session helpers: `lib/`
- Seed catalog and Arabic text: `data/`
- App schema and setup: `db/schema.sql`, `scripts/setup-db.ts`
- Supplied logos: `public/logos/`
- Product docs and decisions: `docs/`
- Local agent issue notes: `.scratch/`

## Admin video uploads

Create an account, set `ADMIN_EMAIL` in `.env.local` to that account's email, and restart the server. The upload form appears in machine guides for that account. Files are local development content and are ignored by Git.

## Local data

SQLite is stored at `data/yflb.sqlite`. `.env.local`, database files, and uploaded videos must not be committed. The app stores the language and color theme in browser local storage; member equipment and completed sessions are stored server-side against the signed-in user.

## Continuity

Read `AGENTS.md`, `docs/START_HERE.md`, `docs/PROJECT_CONTEXT.md`, `docs/PROJECT_STATE.md`, `GLOSSARY.md`, and the applicable record under `docs/adr/` before broad changes. Keep `10_Project_Log.md` and `11_Changelog.md` current.
