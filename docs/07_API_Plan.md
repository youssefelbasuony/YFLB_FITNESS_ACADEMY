> **Status:** Inherited planning material from the previous Night Gym Academy project. This is not a statement of implemented YFLB functionality. Confirm every proposal against `PROJECT_CONTEXT.md` and `PROJECT_STATE.md` before treating it as current.

# 🌐 Night Gym Academy - API Plan

Version: 1.0

Project Name:
Night Gym Academy

Parent Company:
YFLB

Founder:
Youssef El Basuony

---

# API Philosophy

The API should be:

• Secure

• Fast

• Scalable

• Easy to maintain

• Well documented

• Versioned

---

# API Version

Current Version

v1

Future

v2

v3

---

# Authentication API

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/forgot-password

POST /auth/reset-password

POST /auth/verify-email

POST /auth/verify-otp

GET /auth/profile

PUT /auth/profile

---

# Parent Approval API

POST /parent/request

POST /parent/approve

POST /parent/reject

GET /parent/status

---

# User API

GET /users

GET /users/{id}

PUT /users/{id}

DELETE /users/{id}

---

# Courses API

GET /courses

GET /courses/{id}

POST /courses

PUT /courses/{id}

DELETE /courses/{id}

---

# Chapters API

GET /chapters

GET /chapters/{id}

POST /chapters

PUT /chapters/{id}

DELETE /chapters/{id}

---

# Lessons API

GET /lessons

GET /lessons/{id}

POST /lessons

PUT /lessons/{id}

DELETE /lessons/{id}

---

# Exercises API

GET /exercises

GET /exercises/{id}

POST /exercises

PUT /exercises/{id}

DELETE /exercises/{id}

Search

Filter

Categories

---

# Muscles API

GET /muscles

GET /muscles/{id}

POST /muscles

PUT /muscles/{id}

DELETE /muscles/{id}

---

# Nutrition API

GET /nutrition

GET /nutrition/{id}

POST /nutrition

PUT /nutrition/{id}

DELETE /nutrition/{id}

---

# Questions API

GET /questions

GET /questions/{id}

POST /questions

PUT /questions/{id}

DELETE /questions/{id}

Random Questions

Search

Filter

---

# Exams API

GET /exams

GET /exams/{id}

POST /exams

PUT /exams/{id}

DELETE /exams/{id}

Submit Exam

Results

---

# Certificates API

GET /certificates

GET /certificates/{id}

Download PDF

Verify Certificate

---

# Dashboard API

User Progress

XP

Achievements

Statistics

Continue Learning

Recent Activity

---

# Notifications API

GET Notifications

Mark as Read

Delete Notification

---

# Search API

Global Search

Courses

Lessons

Exercises

Muscles

Nutrition

Questions

---

# Media API

Upload Image

Upload Video

Upload PDF

Delete Media

---

# Admin API

Users

Courses

Lessons

Questions

Reports

Analytics

Permissions

Roles

---

# AI API (Future)

AI Coach

AI Nutrition

AI Workout Builder

AI Study Assistant

AI Exam Generator

---

# API Security

Authentication Required

JWT Tokens

HTTPS Only

Rate Limiting

Input Validation

Role-Based Access Control

---

# Future Expansion

Mobile Apps

Desktop Apps

Public API

Third-party Integrations

Smart Watch Integration

Cloud Synchronization
