# Owner admin guide

This guide explains how to open the private YFLB content manager, localize machine guides and media, and publish workout-plan templates.

## One-time setup

1. With the app running, open http://127.0.0.1:3000/admin. You can also open the gear menu on the home page and choose إدارة المحتوى.
2. Sign in with your account email and password. If you do not have an account yet, choose إنشاء حساب on that page.
3. In local development, if ADMIN_EMAIL is blank, the first signed-in account sees **تعيين حسابي كمالك وفتح الأدمن**. Choose it once. The claim is saved in SQLite and only works in development; the app's local server listens on 127.0.0.1.
4. If ADMIN_EMAIL is already set, the signed-in email must match it and the page will ask for ADMIN_ACCESS_KEY from .env.local. Keep that key private.
5. For production, set `ADMIN_EMAIL` to the owner's exact sign-in email and `ADMIN_ACCESS_KEY` to a private random value of at least 32 characters in the hosting provider's environment-variable settings. Also set a private `BETTER_AUTH_SECRET` (32+ random characters) and `BETTER_AUTH_URL` to the deployed HTTPS origin. Never put these secrets in GitHub or client-side variables. Without the production admin values, the admin page and APIs remain locked.
6. The production admin session expires after six hours. Use قفل لوحة الإدارة to close it sooner.

If you see the local owner setup option, but another account has already claimed it, sign in with that owner account. If ADMIN_EMAIL is configured, sign in with the matching account and restart the server after changing .env.local.

## What you can edit

The admin page has two tabs: **الأجهزة والفيديوهات** and **خطط وتقسيمات التدريب**. Both tabs stay behind the owner-only `/admin` gate and server-checked admin APIs.

## Add or edit a machine guide

- Choose an existing machine from the left list, or use إضافة to create a new one.
- For a new machine, set a short ID using lowercase English letters and hyphens, such as incline-chest-press. The ID cannot be changed later because saved equipment and workout entries refer to it.
- Enter Arabic and English names, descriptions, setup instructions, movement steps, expected feel, and a safety cue. In **ترجمة الدليل**, select German, Spanish, French, Russian, or Chinese and complete the same fields there. A new guide is not accepted until each language is complete.
- Put one movement step on each line. The editor turns each line into a numbered step.
- Select one primary target muscle and any secondary muscles. These choices also power the muscle information pages and filters.
- Select حفظ التغييرات or إضافة الجهاز before uploading media. Use حذف to remove a guide; deleted starter guides stay removed after database setup.

## Add a video or animation in a language

Select an existing saved machine, choose the language in **لغة الشرح المرئي**, then upload its MP4, WebM, MOV, GIF, or WebP file (up to 50 MiB). Repeat for each language. Each language stores its own recording; the member guide does not fall back to English when another language is selected. GIF and WebP files display as animations. Upload a voice-dubbed recording or a visible captioned version when the spoken source is in another language. The app does not automatically translate or dub audio. Local files go under `public/uploads/videos/`; hosted uploads use the `yflb-training-videos` Supabase bucket. Reads are public as they were in the existing guide. Upload and delete operations require owner access.

Use short, clear demonstrations. Include a visible example of machine setup and a controlled repetition. Have a qualified coach review movement guidance and safety cues before public use.

## Add a training split or plan

1. Open the **خطط وتقسيمات التدريب** tab in `/admin` and choose **إنشاء خطة**.
2. Set a stable Plan ID using lowercase English words separated by hyphens, such as `beginner-arnold-split`. The ID cannot be changed later.
3. Select the goal, experience level, and session duration. **إضافة يوم** and **إضافة تمرين** let you define any split (for example, push/pull/legs, Arnold, arms/legs/chest/back, or a custom schedule). The number of days updates as you add or remove days.
4. Choose each of the seven languages in **لغة المحتوى**. Enter the plan title, description, rationale, day names/focus, and each exercise's instructions, purpose, alternatives, sets, repetition range, and rest time. The server checks that every language contains the same day/exercise structure before saving.
5. Add an HTTPS evidence reference for the programming rationale. Selecting a machine on an exercise also marks it as required for recommendations; exercises without a machine can use bodyweight or free-weight alternatives.
6. Check **إتاحة للمتدربين** and save to publish. Choose **إيقاف النشر** later to hide it from new members while preserving assigned schedules and completed logs.

Members open **خطتي التدريبية**, complete their goal, level, gym familiarity, available weekdays, session time, and equipment, then choose a compatible plan. They can record a load and repetitions for every set, run the rest timer, save an exercise alternative, and complete or reopen a session. If planned sessions are overdue, the reschedule action moves them to the next available selected weekdays without deleting their progress.

The app seeds **تمرين الجسم كامل · يومان** as a translated starter template. Its educational rationale links to the [ACSM 2026 resistance-training summary](https://www.acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf). It is a general template, not an individualized prescription.

## Access controls

The /admin page and every /api/admin/* endpoint check the signed-in account. In local development, the first signed-in account can atomically claim the owner slot when ADMIN_EMAIL is blank; no remote production deployment can use this path. When ADMIN_EMAIL is configured, the email must match and ADMIN_ACCESS_KEY is also required; the server then issues a six-hour, signed HttpOnly admin cookie. Write endpoints check same-origin requests, validate form data, and verify file signatures. Knowing the URL alone does not grant content access.

Email verification is not configured for local accounts, so the private access key is an essential second check. Anyone who can read .env.local can administer the content. Keep it private and rotate the value if it is exposed; after changing it, restart the app and unlock the admin page again.

Local SQLite and files are appropriate for development or one persistent server. Vercel's serverless runtime needs a managed database and durable media storage; setting admin secrets alone does not make local SQLite or filesystem uploads persistent. A public deployment also needs HTTPS, backups, and an email verification/recovery plan.
