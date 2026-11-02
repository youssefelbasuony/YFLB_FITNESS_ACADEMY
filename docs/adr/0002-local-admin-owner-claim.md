# ADR 0002: First-owner setup for local administration

- Status: Accepted
- Date: 2026-11-02

## Context

The admin page required signing in, editing `.env.local`, restarting the server, and entering a separate key before a new local owner could use it. This made local setup hard to discover and easy to misconfigure. The deployed admin still needs a clear owner allowlist and a separate private key.

## Decision

When `NODE_ENV` is `development` and `ADMIN_EMAIL` is blank, allow the first signed-in account to claim one owner slot stored in the SQLite `app_settings` table. Claiming is transactional, so only one account can own that local install. The claim route checks same-origin requests and requires an authenticated account. Local development binds the server to `127.0.0.1`.

The local claim flow is unavailable in production or whenever `ADMIN_EMAIL` is configured. Production administration continues to require a signed-in account matching `ADMIN_EMAIL`, a private `ADMIN_ACCESS_KEY` of at least 32 characters, and the short-lived signed admin cookie.

## Consequences

- A local owner can reach `/admin`, create or sign into an account, and claim ownership with one button without editing environment files.
- Later local accounts cannot replace the first owner. The claim is stored with the local database.
- Production setup remains explicit and must use deployment secrets; the local one-click path does not grant production access.
- The admin content editor currently manages machine guides, target-muscle mappings, and per-machine demonstration media. Static page layout and marketing copy are still maintained in source code.
