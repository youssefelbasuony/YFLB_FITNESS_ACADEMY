# Project state — 2026-11-02

## Status

The local full-stack YFLB Fitness Academy build includes a beginner equipment academy, member accounts, a personal fitness profile and workout planner, and a protected owner admin panel. The interface supports Arabic, English, German, Spanish, French, Russian, and Simplified Chinese with localized seeded catalog/plan content, light/dark themes, and a five-step text-size control.

## Working features

- Home, machine library, personal training plan/profile, and About views with responsive navigation.
- Clear first-visit steps, machine search, and filters for categories and saved equipment.
- Arabic, English, German, Spanish, French, Russian, and Simplified Chinese translations for seeded machine, muscle, and starter-plan copy.
- Machine guides with setup, movement steps, target muscles, safety cues, and uploaded media.
- Better Auth account creation, sign-in, and sign-out; saved machines, fitness profiles, training schedules, set logs, alternatives, and completed sessions are scoped to the signed-in member.
- Admin page at /admin. In local development with no ADMIN_EMAIL, the first signed-in account can claim the owner slot with one button. Production requires the configured ADMIN_EMAIL and ADMIN_ACCESS_KEY.
- Settings menu with theme, seven languages, five text-size levels, account, and admin-entry controls.
- Admin editor for translated machine guides, target-muscle mappings, per-language media variants, and custom translated training plans with arbitrary splits, prescriptions, rationale, alternatives, and source URL.
- Member planner with goals, experience and gym-familiarity profiles, available weekdays, session duration, equipment selection, per-set weight/repetition logs, rest timer, exercise replacement, and supportively re-planned missed sessions.
- Localized dates and number formatting that follows the selected language and saved member time zone.
- Static interactive UI prototype in `archive/prototype-2026-11-02/`, covering member and admin-preview flows in Arabic and English. Open its `index.html` directly; browser-only demo state does not modify the live app.
- Server-checked admin APIs and a six-hour signed, HttpOnly, SameSite=Strict admin cookie.
- MP4, WebM, MOV, GIF, and WebP guide media; local files use SQLite metadata, hosted uploads use signed Supabase Storage URLs capped at 50 MiB, and the server checks file signatures.
- Light/dark themes with the supplied black/white logos. The YFLB logo links to Home. Next.js development indicator is hidden to remove the unexplained floating N badge.

The setup script seeds a translated two-day full-body beginner template with an ACSM reference. The admin can edit or unpublish it. Uploaded video speech remains part of the recording; owners must provide localized recordings or visible captions for other languages. The editor does not provide browser-based editing for home/about copy or page layout.

## Run requirements

- Node.js 24 or newer and npm.
- From the app folder, run `npm ci` and `npm run dev`.
- `npm run dev` does not run database setup. A brand-new local database may be initialized deliberately with `npm run db:setup`; this SQLite-only command seeds the translated catalog and starter plan.
- Open http://127.0.0.1:3000.

## Limits before public launch

- A tested SQLite Backup API backup exists outside Git. See `docs/BACKUP_AND_RESTORE.md`.
- The verified SQLite backup was imported to Supabase PostgreSQL on 2026-11-02. All source table counts matched, the existing user/account IDs and password hash were preserved, and foreign-key orphan checks returned zero. The original SQLite database and backup remain unchanged.
- Supabase has the 19-table YFLB schema, RLS enabled on every public table, the 50 MiB public-read media bucket, and foreign-key indexes. No video metadata or media files existed to transfer. Database and Storage runtime flows still need Preview testing.
- The Vercel project is set to Node.js 24.x, but it has no deployment or connected GitHub repository yet. Access to the Vercel team is awaiting its one-time authorization request.
- The app folder now has a local Git repository and deployment-preparation commit. No GitHub repository was created and nothing was pushed.
- Authentication, admin access, deployment environment variables, and Preview have not been verified. Do not use the hosted database as an application until Vercel secrets and the owner email are configured.
- Email verification, password recovery, account deletion, rate limiting, backups, and monitoring need production setup.
- Plan templates are general learning examples for healthy adults, not individualized medical advice. Have a qualified coach review movement guidance before public use.
- Set ADMIN_EMAIL and protect ADMIN_ACCESS_KEY; see ADMIN_GUIDE.md.
- The founder's sketch was not present in the project files; the current layout follows the written product brief.

## Design direction

Keep the interface calm, direct, and beginner-first. Use Alexandria for Arabic, Inter with Noto Sans for Russian, Noto Sans SC for Simplified Chinese, and Manrope for Latin UI. Keep forest green and lime for the YFLB identity, obvious first actions, short instructions, 44px touch targets, safe-area padding, and mobile bottom navigation. Do not show fictional progress metrics.
