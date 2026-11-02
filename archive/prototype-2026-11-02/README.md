# YFLB interactive interface prototype

This static prototype shows the product flows implemented in the main YFLB Fitness Academy app. It is deliberately self-contained so it can open directly in a browser.

## Open it

Open `index.html` from this folder. No npm install, server, or database is needed. Alexandria and Manrope load from Google Fonts when the browser has internet access; the page has local system fallbacks.

## Included flows

- Arabic and English interface with right-to-left and left-to-right layouts
- Light and dark themes with the matching YFLB logo
- Home, Academy, starter workout, and About screens
- Search and filters for machines, muscle groups, and saved equipment
- Machine guides with setup, movement steps, target muscles, safety cues, and media preview
- Muscle information and related machines
- Mock member sign-in/sign-up, saved equipment, and completed workout sessions
- Admin gate preview, bilingual machine guide editor, muscle targeting, and local video/GIF/WebP selection
- Responsive desktop and mobile navigation

## Prototype limits

Nothing in this folder authenticates users, contacts the backend, or writes to the live site. Account creation, saved machines, workout completion, and guide edits use this browser's local storage. Selected media is previewed locally and is not uploaded. The admin preview gate is for reviewing the interface only; the protected owner panel in the main Next.js application is the real admin tool.

The `data/` folder contains the content snapshot used to build the preview. `catalog.js` is loaded by the static page so the prototype also works with `file://` and does not need to fetch local JSON. The standalone JSON files make the snapshot easy to inspect and compare with the main `data/` folder.

To clear prototype-only state, clear this site's local storage keys beginning with `yflb.prototype.` and its session storage key `yflb.prototype.admin`.
