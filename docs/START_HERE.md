# Start here — YFLB Fitness Academy

## Product in one sentence

A beginner-friendly guide to gym equipment, movement, muscles, and the first months of training.

## Current build

Next.js App Router and React power the web app. Node.js Route Handlers provide the backend. Better Auth manages email/password accounts. Local development uses SQLite; the hosted adapter uses PostgreSQL and Supabase Storage. The site supports Arabic, English, German, Spanish, French, Russian, and Simplified Chinese.

## Run locally

1. Install Node.js 24.x and npm; Vercel is configured for Node.js 24.x.
2. From this application folder, run `npm ci` and `npm run dev`.
3. Starting the app does not create secrets, run migrations, or seed data. For a brand-new local database only, create `.env.local` from `.env.example` and explicitly run `npm run db:setup`.
4. Open http://127.0.0.1:3000.

## Open the owner admin panel

1. Open http://127.0.0.1:3000/admin. Sign in with email and password, or choose إنشاء حساب if you need an account.
2. In local development with no ADMIN_EMAIL, the first signed-in account can claim ownership with the setup button on the page.
3. If ADMIN_EMAIL is configured, your signed-in email must match it. Enter ADMIN_ACCESS_KEY from .env.local; the setup script creates it automatically if missing.
4. Use the machine list to edit a translated guide or choose إضافة to create a new one. Save the text before uploading language-specific demonstration media. Open **خطط وتقسيمات التدريب** to edit the starter plan or create another split.

Read ADMIN_GUIDE.md for field details, file types, and security behavior. Do not share .env.local or commit it.

## Read before changing product behavior

- PROJECT_CONTEXT.md — audience and experience principles
- PROJECT_STATE.md — implemented scope and deployment limits
- GLOSSARY.md — product language
- docs/adr/0001-full-stack-stack.md — stack and persistence choice
- docs/04_Design_System.md — visual design rules
- docs/agents/domain.md and docs/agents/issue-tracker.md — agent workflow

## Product constraints

Starter exercise guidance should be reviewed by a qualified coach before public use. Local uploads use `public/uploads/videos/`; hosted media uses Supabase Storage with a 50 MiB cap. Email verification and password-reset delivery are not configured.
