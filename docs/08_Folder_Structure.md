# Folder structure

```text
YFLB-Fitness-Academy/
├── app/                  Next.js App Router pages and route handlers
│   └── api/              Auth, bootstrap, member state, uploads
├── components/           React UI
├── lib/                  Auth, database adapter, sessions, and repository
├── data/                 Seed catalog and starter workout content
│   └── translations.ar.json Arabic guide and workout copy
├── db/                   SQLite/PostgreSQL schemas and Storage config
├── scripts/               Local setup and guarded database migrations
├── public/logos/          Supplied light/dark logo variants
├── public/uploads/videos/ Local development uploads
├── docs/                  Product docs, ADRs, and agent handoff
├── .scratch/              Local issue notes
├── archive/                Archived static prototype from the redesign
├── START_YFLB.bat          Windows one-click local start
├── AGENTS.md              Agent workflow summary
├── GLOSSARY.md            Product vocabulary
└── README.md               Run instructions and project overview
```

Keep API mutations in Route Handlers. Validate IDs and request payloads on the server and always derive member ownership from the authenticated session. Keep seed data versioned and user data/media ignored by Git.
