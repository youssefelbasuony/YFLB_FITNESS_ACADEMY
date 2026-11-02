# Security and Data Handling

## Authentication and authorization

- Better Auth manages email/password accounts and sessions. Password hashes, account IDs, and current sessions must be migrated unchanged.
- Member APIs scope saved equipment, plans, session history, and progress to the authenticated user's ID.
- Admin access requires the configured `ADMIN_EMAIL`, the separate `ADMIN_ACCESS_KEY`, a signed six-hour HttpOnly/SameSite admin cookie, and same-origin mutation requests.
- Admin checks run on the server; hiding the admin link is not treated as authorization.
- Local first-owner claim is available only during development when no `ADMIN_EMAIL` is configured. PostgreSQL/production never uses that local-claim path.

## Database protection

- `.env*`, SQLite databases and WAL/SHM files, backups, archives, logs, local uploads, dependencies, and build output are ignored by Git.
- PostgreSQL connections use a Supabase pooler URL for runtime and TLS certificate verification. Migration scripts prefer a non-pooled URL when available.
- The migration runner aborts if it sees unknown public tables or existing rows before first schema application. The data importer aborts if any target table has rows, writes in one transaction, and verifies per-table counts.
- RLS is enabled on public application and Better Auth tables, and client Data API table/sequence privileges are revoked. Application access goes through server routes and the private Postgres connection.
- Never place a service-role or Supabase secret key in client code or a `NEXT_PUBLIC_` variable.

## File storage

Exercise recordings are public-read, matching the current app behavior. Upload authorization remains private: the server verifies admin access and creates a single-object signed upload URL; the service key remains server-side. The initial bucket allows MP4, WebM, MOV, GIF, and WebP up to 50 MiB. The server verifies size and file signature before publishing metadata. Do not upload private member documents to this public bucket.

## Not configured or not yet verified

- Supabase schema, data import, and Storage bucket have not yet been applied.
- Vercel environment values for Better Auth/admin are missing or not verified; admin must remain unavailable until they are set.
- Email verification, password recovery, rate limiting, security logging, formal retention/account deletion behavior, and managed backup schedule need setup before public launch.
- No Preview deployment or live auth/media flow has been tested yet.
