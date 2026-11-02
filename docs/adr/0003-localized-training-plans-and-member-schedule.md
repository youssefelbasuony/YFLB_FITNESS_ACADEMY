# ADR 0003: Localized training plans and member schedules

- Status: Accepted
- Date: 2026-11-02

## Context

The product needs fully localized starter content and owner-authored training splits, plus per-member planning data. Editing a published plan must not silently change a session a member has already been assigned or completed. Exercise demonstrations also need a language-specific recording so a selected Russian or Chinese interface does not show English speech.

## Decision

- Store a training-plan template in SQLite with shared prescriptions and a locale-keyed copy for Arabic, English, German, Spanish, French, Russian, and Simplified Chinese. Validate that each locale has the same day and exercise IDs before saving.
- Keep source/evidence URL, goal, experience level, duration, weekly day count, and required equipment on each template. Publishing is explicit; unpublishing is soft so member history remains available.
- Store the member fitness profile as account-scoped JSON. Create dated member sessions with a snapshot of the assigned plan copy/prescription, and keep set logs and exercise substitutions in session progress JSON.
- Store schedule dates as local calendar dates and retain the member's IANA time zone for localized display. When profile weekdays change, regenerate future planned sessions. Missed sessions can be moved forward to selected weekdays without altering set logs or completed sessions.
- Store machine media variants by locale. Legacy single-file media remains English-only; there is no cross-language fallback. Owners provide localized recordings or captions because the application does not synthesize speech.
- Keep the SQLite implementation for local and single-persistent-server use. Protect plan management with the existing owner authorization and member routes with the authenticated account ID.

## Consequences

- The admin must enter complete translations before publishing a new plan or guide.
- Plan IDs, day IDs, and exercise IDs are stable references; changing displayed text does not invalidate logs.
- Member snapshots increase SQLite storage modestly but preserve the experience the member accepted.
- High-concurrency or multi-instance hosting still requires a managed database and durable media storage.
- Starter plans are general educational examples for healthy adults; qualified review is still required before public use.
