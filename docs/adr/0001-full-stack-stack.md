# ADR 0001: Full-stack framework and local data store

- Status: Accepted
- Date: 2026-11-02

## Context

The project began as a static HTML prototype. The product now needs real registration, per-member equipment and workout state, APIs, and an admin path for demonstration videos. It should also start locally without requiring a hosted database account.

## Decision

Use Next.js App Router as the full-stack React framework, with Node.js as the server runtime. Use Better Auth for email/password sessions and SQLite through `better-sqlite3` for local development and self-hosted single-instance deployments. Use Next.js Route Handlers for data APIs and local public storage for development video uploads.

## Consequences

- `npm run dev` can initialize a local SQLite database and seed the guide catalog.
- Member machine selections and workout completion are account-backed rather than browser-only.
- Production hosting must provide persistent storage; production video hosting should move to a durable object store before using ephemeral or horizontally scaled hosting.
- A managed PostgreSQL adapter can replace SQLite if deployment or concurrency needs grow.
- Current framework versions are recorded in `package.json` and `package-lock.json`.
