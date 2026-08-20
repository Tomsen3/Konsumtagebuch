# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** People in outpatient or inpatient addiction treatment, self-tracking consumption
  between therapy sessions on their own device.
- **Secondary (indirect):** Their therapists/counselors — never direct app users, but the app's
  history/summary views are purpose-built to be reviewed together in session ("Für das Gespräch" /
  "Therapiegespräch").

This is a clinical self-help tool, not a medical device. It explicitly disclaims that it replaces
professional advice or treatment ("ersetzt keine medizinische Beratung oder Behandlung").

German-language only. No localization planned.

## Product Purpose

**KLARA** ("Mein Konsumtagebuch") is an offline-capable, static Progressive Web App for personal
patient documentation of substance use. KLARA stands for **K**onsum · **L**age · **A**uslöser ·
**R**eflexion · **A**uswertung (consumption · situation · trigger · reflection · evaluation) — the
five-column structure of every diary entry. Success is a user who journals consistently enough,
without shame or friction, to notice their own patterns and bring something concrete to their next
therapy session.

## Positioning

Privacy and therapy-readiness are equally ranked, inseparable core promises — neither is the "real"
differentiator on its own:

- **Radical locality:** entries, weekly goals, and profile data never leave the device. No account,
  no server, no sync, no analytics, no third-party libraries. A competitor offering cloud sync or an
  account system could not adopt this claim without abandoning it.
- **Built for the therapy conversation:** the fixed five-column structure and the History view's
  "Für das Gespräch" summary exist specifically to produce something worth bringing into a session —
  not a general-purpose mood tracker repurposed for therapy.

## Operating Context

- Used solo, in daily life, in whatever moment the user chooses to log something — must work
  fully offline (PWA, service-worker cached).
- Periodically reviewed together with a therapist/counselor during in-person sessions; the History
  view's summary and PDF/print export (`pdfgen.js`) exist for exactly this ritual.
- Multi-device use happens, but only via manual JSON export/import of a backup — never automatic
  sync — a deliberate privacy tradeoff to preserve, not a gap to close.
- Regular manual backups are the user's only protection against data loss (uninstall, cleared
  browser data); the app surfaces this as an ongoing responsibility, not a one-time warning.

## Capabilities and Constraints

- **Privacy is the product.** All data (entries, weekly goals, optional profile data) lives only in
  the browser's `localStorage`. No backend, no user accounts, no database, no analytics/tracking, no
  third-party libraries. CSP is locked to `'self'` for scripts/styles/connect — this must never be
  loosened to add trackers, CDNs, or remote fonts.
- **No auto-sync, by design** — see Operating Context. Don't "fix" it with sync.
- Vanilla JS PWA: no framework, no build step, no `package.json`. `app.js` (single file),
  `index.html`, `styles.css`, `sw.js` (service worker for offline caching). Keep it that way; don't
  introduce a bundler/framework without an explicit ask.
- **Data is not additionally encrypted.** The app relies on device lock screen + user discipline.
  Surfaced repeatedly in-app as a warning, not hidden in fine print.
- **App updates never touch patient data.** App files live in the service-worker cache; entries live
  separately in `localStorage`. Any release-process change must preserve this separation. Version
  number is duplicated in `app.js`, `sw.js`, `version.json`, and the display in `index.html` — all
  four must be bumped together on release (documented in README.md). Current: 1.8.5.
- **Structure:** single-page app, tab-based navigation across 6 views — Start, Heute/Today,
  Verlauf/History (timeline + category charts, 7/30/90-day/all-time filter, PDF/print export),
  Wochenziel/Goals (goal setting, risk prep, weekly review), Anleitung/Guide (how-to for the 5-part
  entry structure plus alcohol-unit reference and crisis info), Mehr/Settings (profile, backup
  export/import, version/update check, crisis info, medical disclaimer).
- Entry dialog supports two modes: **"Schnell festhalten"** (quick capture) and **"Reflexion
  ergänzen"** (add full reflection) — quick capture must stay genuinely quick; don't force the full
  5-field form on users who just want to log something fast.

## Brand Commitments

- Name: **KLARA**, always expanded once as Konsum · Lage · Auslöser · Reflexion · Auswertung where
  the acronym is introduced.
- Non-judgmental voice throughout: "Beobachten statt bewerten" (observe, don't judge). No
  streaks-as-guilt, no red "you failed" framing for consumption entries. Calm, clinical-warm,
  second person ("du").
- Crisis path always visible: emergency contacts (112 / PP.rt Infozentrale) appear on the Guide and
  Settings views and must not be buried behind navigation.

## Evidence on Hand

- Informal feedback exists from both therapy professionals ("Fachpersonen") and affected users
  ("Betroffene") who have tried the app — no named partner clinic, no formal study, no quantified
  results, and no permission on file to quote anyone. Future work must not fabricate testimonials,
  named endorsements, clinic partnerships, or usage statistics beyond this.

## Product Principles

1. Privacy is not a feature toggle — it is the reason the product can exist in this context at all.
2. Observation, not evaluation — the app never scores, shames, or grades a user's consumption.
3. What gets built must survive being read aloud in a therapy session.
4. Quick capture must stay one tap away from full reflection, never gated behind it.
5. Nothing about updates, sync, or storage may put a user's already-logged entries at risk.
