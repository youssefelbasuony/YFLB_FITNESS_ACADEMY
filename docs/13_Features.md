# Features

## Implemented in the full-stack local build

- Arabic-first responsive Home, Academy, Workout, and About views with English toggle
- Light/dark themes paired with the supplied logo variants
- Searchable machine catalog with category and My Gym filters
- Account registration, sign-in, and sign-out through Better Auth
- Authenticated machine selection and workout completion persisted in SQLite
- Machine detail dialog with setup, movement steps, muscles, cues, and video playback
- Muscle detail view linked to associated machines
- Admin-only video upload endpoint and UI when `ADMIN_EMAIL` matches the signed-in account

## Remaining product work

- Qualified coach review of every guide and sample routine
- Email verification, reset delivery, rate limiting, and account recovery
- Managed database and durable object storage for public production
- Content management beyond the starter video upload endpoint
- Research with new gym members and visual alignment with the founder’s sketch when it is available
