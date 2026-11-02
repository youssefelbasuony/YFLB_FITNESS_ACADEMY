# Project rules

1. Follow the current product direction in `PROJECT_CONTEXT.md` and implementation status in `PROJECT_STATE.md`.
2. Build for people in their first months at the gym. Explain gym terms and keep each screen focused on one next step.
3. Arabic is the default language. Keep machine, muscle, and workout content available in Arabic and English.
4. Store starter machine and workout content in `data/`; persist member data through the server and SQLite repository.
5. Authenticate and authorize every account-specific or admin-only operation on the server. Derive ownership from the session, never a request field.
6. Preserve the supplied logo variants. Use the black mark on light surfaces and the white mark on dark surfaces.
7. Keep app routes in `app/`, reusable interface code in `components/`, backend and domain access in `lib/`, and schema changes in `db/` and `scripts/`.
8. Do not describe sample movement advice as coach-reviewed. Keep the review status visible in project documentation.
9. Update the project state, handoff notes, roadmap, and changelog when the implemented product scope changes.
10. Treat files marked **Inherited planning material** as historical proposals, not active instructions.
