# Machine guide library

## Current catalog

`data/machines.json` contains the stable English machine records used to seed the starter catalog. `data/translations.ar.json` contains the Arabic names and guidance. Both are written into SQLite by `scripts/setup-db.ts`.

Each machine record includes:

- Stable ID, display name, category, and beginner-level description.
- Setup instructions, short movement steps, target muscles, a simple sensation cue, and one common mistake to avoid.
- Optional instructor video URL and MIME type, attached by the authenticated YFLB admin upload route.

The current seed catalog includes chest press, lat pulldown, leg press, seated cable row, seated leg curl, and shoulder press. Categories are push, pull, and legs.

## Editorial and safety rules

Use simple, specific verbs. Avoid guaranteed results, body shaming, diagnosis, or advice that ignores injury history. Explain how to stop or ask gym staff for help when something hurts or the setup is unclear. A qualified fitness professional must review the sample movement guidance and routines before public release.

## Media

Local development uploads are saved under `public/uploads/videos/`. Hosted uploads use the public-read Supabase bucket `yflb-training-videos`, owner-signed upload URLs, and a 50 MiB per-file limit. Each language needs its own recording or captions; audio is not translated automatically.
