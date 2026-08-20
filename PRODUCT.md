# PRODUCT.md

## What this is

**KLARA** ("Mein Konsumtagebuch") is an offline-capable, static Progressive Web App for personal patient
documentation of substance use, built for people in addiction therapy/counseling to journal between
sessions and bring structured observations to their next appointment. KLARA stands for **K**onsum ·
**L**age · **A**uslöser · **R**eflexion · **A**uswertung (consumption · situation · trigger ·
reflection · evaluation) — the five-column structure of every diary entry.

German-language only. No localization planned.

## Who it's for

- People in outpatient or inpatient addiction treatment, self-tracking consumption between therapy
  sessions.
- Their therapists/counselors, indirectly — the app's history/summary views exist specifically to be
  reviewed together in session ("Für das Gespräch" / "Therapiegespräch").

This is a clinical self-help tool, not a medical device. It explicitly disclaims that it replaces
professional advice or treatment ("ersetzt keine medizinische Beratung oder Behandlung").

## Core product truths (non-negotiable constraints)

- **Privacy is the product.** All data (entries, weekly goals, optional profile data) lives only in
  the browser's `localStorage`. No backend, no user accounts, no database, no analytics/tracking, no
  third-party libraries. CSP is locked to `'self'` for scripts/styles/connect — this must never be
  loosened to add trackers, CDNs, or remote fonts.
- **No auto-sync, by design.** Multi-device use is supported only via manual JSON export/import of a
  backup. This is a deliberate privacy tradeoff, not a missing feature — don't "fix" it with sync.
  Vanilla JS PWA: no framework, no build step, no `package.json`. `app.js` (single file), `index.html`,
  `styles.css`, `sw.js` (service worker for offline caching). Keep it that way; don't introduce a
  bundler/framework without an explicit ask.
- **Data is not additionally encrypted.** The app relies on device lock screen + user discipline
  (regular backups). Surfaced repeatedly in-app as a warning, not hidden in fine print.
- **App updates never touch patient data.** App files live in the service-worker cache; entries live
  separately in `localStorage`. Any release-process change must preserve this separation.
- **Non-judgmental framing throughout.** Copy consistently avoids evaluative language ("Beobachten
  statt bewerten" — observe, don't judge). No streaks-as-guilt, no red "you failed" framing for
  consumption entries. Tone is calm, clinical-warm, second person ("du").
- **Crisis path is always visible.** Emergency contacts (112 / PP.rt Infozentrale) appear on the Guide
  and Settings views and must not be buried behind navigation.

## Structure

Single-page app, tab-based navigation across 6 views (`index.html` `<section id="...">`):

1. **Start** (`#start`) — welcome/onboarding-style landing with orientation cards.
2. **Heute / Today** (`#today`) — today's entries, quick-add.
3. **Verlauf / History** (`#history`) — timeline chart, category breakdown, entry list, filterable by
   7/30/90 days or all-time; PDF/print export (`pdfgen.js`) for therapy sessions.
4. **Wochenziel / Goals** (`#goals`) — weekly goal setting, risk prep, weekly review.
5. **Anleitung / Guide** (`#guide`) — how-to for the 5-part entry structure (Konsum, Situation,
   Auslöser, Strategie, Auswertung), including standard alcohol-unit reference and crisis info.
6. **Mehr / Settings** (`#settings`) — profile data, backup export/import, app version/update check,
   crisis info, medical disclaimer.

Entry dialog supports two modes: **"Schnell festhalten"** (quick capture — minimal friction) and
**"Reflexion ergänzen"** (add full reflection) — quick capture must stay genuinely quick; don't force
the full 5-field form on users who just want to log something fast.

## Versioning

Version number is duplicated in `app.js`, `sw.js`, `version.json`, and the display in `index.html` —
all four must be bumped together on release (documented in README.md). Current: 1.8.5.

## Design system pointer

No DESIGN.md yet. Current visual language (from `styles.css`): light-only (`color-scheme: light`, no
dark mode), Inter typeface, clinical-calm blue/cyan palette (`--blue:#0879bd`, `--cyan:#21b5ca`) on a
soft off-white paper (`--paper:#f3f8fc`), card-based panels with soft shadows and pill tags, red
reserved for crisis/warning content (`--red:#df0038`), green for positive/completed states
(`--green:#168263`). Run `document` to generate a full DESIGN.md from this if doing focused visual work.
