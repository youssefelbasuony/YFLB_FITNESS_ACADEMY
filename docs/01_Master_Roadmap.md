# YFLB Fitness Academy — roadmap

## Current milestone: local full-stack foundation

- Rebrand the product as YFLB Fitness Academy and use the supplied black and white logos.
- Build a beginner-first Arabic and English experience with Home, Academy, Starter Plan, and About sections.
- Provide a searchable machine catalog, account-based equipment list, machine and muscle guides, starter sessions, and admin video uploads.
- Keep SQLite and uploaded media local for development; document production limits.

## Next: content and usability review

- Have a qualified coach review setup cues, movement steps, and the sample plan before public use.
- Record demonstrations and add captions and transcripts.
- Walk first-time gym members through equipment selection and the machine guide on a phone.
- Refine Arabic terms based on local gym language and user feedback.

## Next: production readiness

- Select durable database and video storage for the target hosting platform.
- Configure email verification, account recovery, rate limiting, backups, logging, and monitoring.
- Review access controls, accessibility, video delivery, and privacy practices.
- Deploy and observe the complete member flow before public launch.

## Decisions already made

- Product: YFLB Fitness Academy; audience: new members in their first months through first year.
- Stack: Next.js App Router, React, TypeScript, Node.js Route Handlers, Better Auth, and SQLite for local development.
- Interface opens in Arabic and includes English, light mode, and dark mode.
- Local agent work tracking uses Markdown under `.scratch/`; this is a single-context project with `AGENTS.md`.
