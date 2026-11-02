> **Status:** Inherited planning material from the previous Night Gym Academy project. This is not a statement of implemented YFLB functionality. Confirm every proposal against `PROJECT_CONTEXT.md` and `PROJECT_STATE.md` before treating it as current.

# 🌍 Translation System

Project: Night Gym Academy

Parent Company: YFLB

Founder: Youssef El Basuony

Developed by: YFLB

Version: 1.0

---

# Purpose

This document defines the translation strategy for Night Gym Academy.

The platform is designed to support multiple languages while maintaining a consistent user experience.

---

# Supported Languages

✅ Arabic

✅ English

✅ German

✅ French

✅ Spanish

✅ Portuguese

✅ Russian

✅ Chinese (Simplified)

✅ Hindi

Future languages may be added as the platform grows.

---

# Default Language

English

Users can change the language at any time from the Settings page.

The selected language should be remembered for future visits.

---

# RTL & LTR Support

RTL

- Arabic

LTR

- English
- German
- French
- Spanish
- Portuguese
- Russian
- Chinese
- Hindi

The interface must automatically switch direction based on the selected language.

---

# Translation Rules

Every visible text must be translatable.

Do NOT hardcode text inside HTML or JavaScript.

Use translation keys instead.

Example:

home.title

home.subtitle

courses.title

profile.settings

---

# Translation Files

Example Structure:

translations/

├── en.json

├── ar.json

├── de.json

├── fr.json

├── es.json

├── pt.json

├── ru.json

├── zh.json

└── hi.json

---

# Translation Standards

Translations should be:

- Accurate
- Professional
- Easy to Understand
- Natural
- Consistent

Avoid literal word-for-word translations.

---

# Fitness Terminology

Scientific and fitness terms should use internationally accepted terminology whenever possible.

When necessary, include commonly used local terms.

---

# User Content

Future versions may allow users to create content.

User-generated content will not be translated automatically unless AI translation is enabled.

---

# Date & Time

Dates and times should follow the selected language and regional format.

---

# Numbers & Units

Support:

Metric System

Imperial System (Future)

Users should be able to choose their preferred unit system.

---

# Search

Search should work correctly in every supported language.

Future versions may include multilingual search.

---

# AI Translation (Future)

Future versions may include AI-powered translation for:

Courses

Lessons

Exercises

Community Posts

Comments

Questions

---

# Language Switching

Changing the language should update the interface immediately without requiring the user to create a new account.

---

# Accessibility

Translations must preserve accessibility.

Screen readers should work correctly in every supported language.

---

# Future Expansion

Additional languages may include:

- Japanese

- Italian

- Turkish

- Korean

- Dutch

- Indonesian

- Polish

---

# Final Principle

Every user should feel that Night Gym Academy was originally built in their language.

Translation quality is as important as the educational content itself.

---

Approved By

Youssef El Basuony

Parent Company

YFLB
