---
name: KLARA
description: Konsum · Lage · Auslöser · Reflexion · Auswertung — a quiet, non-judgmental consumption diary
colors:
  clinical-blue: "#0879bd"
  clinical-blue-deep: "#075d92"
  blue-mist: "#e8f5fc"
  clinical-cyan: "#21b5ca"
  quiet-ink: "#172534"
  muted-slate: "#687988"
  calm-paper: "#f3f8fc"
  clinical-white: "#ffffff"
  hairline-mist: "#e0eaf1"
  reassurance-green: "#168263"
  caution-amber: "#a05a00"
  quiet-alert-red: "#df0038"
  crisis-rose: "#962b46"
  crisis-rose-mist: "#efc8d2"
  crisis-rose-paper: "#fff8fa"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.8rem, 5vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  hero-display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.35rem, 7vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.08rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.7rem"
    fontWeight: 850
    letterSpacing: "0.13em"
rounded:
  xs: "8px"
  sm: "11px"
  md: "14px"
  lg: "18px"
  xl: "25px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.clinical-blue}"
    textColor: "{colors.clinical-white}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.clinical-blue-deep}"
  button-secondary:
    backgroundColor: "{colors.clinical-white}"
    textColor: "{colors.quiet-ink}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  tag:
    backgroundColor: "{colors.blue-mist}"
    textColor: "{colors.clinical-blue-deep}"
    rounded: "{rounded.pill}"
    padding: "5px 9px"
  panel:
    backgroundColor: "{colors.clinical-white}"
    rounded: "{rounded.lg}"
    padding: "18px 28px"
  input:
    backgroundColor: "#fbfdff"
    textColor: "{colors.quiet-ink}"
    rounded: "{rounded.sm}"
    padding: "11px 12px"
    height: "44px"
  crisis-button:
    backgroundColor: "{colors.crisis-rose}"
    textColor: "{colors.clinical-white}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: KLARA

## Overview

**Creative North Star: "Der stille Begleiter" (The Quiet Companion)**

KLARA sits with the user without ever raising its voice. The interface's job is to disappear into
the moment of writing something down — a calm blue-and-white surface, generous rounding, soft
diffuse shadows, one typeface at every weight it needs and no more. Nothing in the system scores,
counts up dramatically, or celebrates; the one place color gets expressive is the gradient hero card
that opens Start and Today, and even there it stays a gentle wash rather than a splash. The system
deliberately avoids two failure modes at once: it must never read as a cold, sterile clinic
interface, and it must never read as a playful habit-tracker with streaks and rewards — both would
misrepresent what the product is for. Structure carries the seriousness (fixed five-part entry
format, an always-visible crisis exit); color and shape carry the warmth.

**Key Characteristics:**
- Calm clinical-blue palette on an off-white paper ground, never stark white-on-white
- Soft, ambient shadows and consistently rounded corners (nothing sharp-edged)
- One typeface (Inter), differentiated only by weight, size, and letter-spacing
- A single gradient "hero" surface as the system's one moment of visual richness
- A deliberately separate, muted rose family reserved only for crisis/emergency content

## Colors

Two accent hues (blue for action, cyan for data) sit on a near-white paper ground; two additional
"alert" families are kept strictly apart from each other so severity is never ambiguous.

### Primary
- **Clinical Blue** (`#0879bd`): every interactive/actionable element — primary buttons, active tab
  state, links, form focus rings, brand mark. If it's clickable, it's this blue.
- **Deep Clinical Blue** (`#075d92`): hover/pressed state for Clinical Blue; also used at rest for
  emphasized numerals and headings inside colored info surfaces (summary stats, chart captions).
- **Blue Mist** (`#e8f5fc`): the soft fill for tags, active tab backgrounds, and icon badges — the
  "selected but calm" state.

### Secondary
- **Clinical Cyan** (`#21b5ca`): reserved for data visualization (chart lines, dots) and one
  decorative glyph (the Guide's ◎ symbol). **The Cyan-Is-Not-Clickable Rule.** Cyan never appears on
  a button or any interactive control — it marks information, blue marks action.

### Neutral
- **Quiet Ink** (`#172534`): primary text.
- **Muted Slate** (`#687988`): secondary text, captions, timestamps, helper copy.
- **Calm Paper** (`#f3f8fc`): the page background — a faint blue tint, never pure white.
- **Clinical White** (`#ffffff`): card and panel surfaces, sitting one step lighter than the page.
- **Hairline Mist** (`#e0eaf1`): borders and dividers — always 1px, never heavier.

### Named Rules
**The Two Reds Rule.** The system defines two visually and semantically distinct "alert" colors and
never lets them substitute for each other: **Quiet Alert Red** (`#df0038`) is reserved for a single
destructive micro-interaction (removing a line item) and must never be used to flag, score, or
color-code a logged consumption entry — the product does not judge what a user records. **Crisis
Rose** (`#962b46`, on `#efc8d2` border / `#fff8fa` fill) is its own separate family used only for the
always-visible emergency-help card and its call links, so a life-safety signal never blends visually
with an ordinary UI warning.

- **Reassurance Green** (`#168263`): checkmarks and completed/positive confirmation only — never a
  score or a streak.
- **Caution Amber** (`#a05a00`): text-only warning state (e.g. "update available"), never a filled
  background.

## Typography

**Display & Body Font:** Inter (with `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", sans-serif` fallback)

**Character:** A single grotesque typeface carries the entire hierarchy — the system never reaches
for a second, "personality" typeface. Hierarchy comes from weight and negative letter-spacing at
large sizes, not from a font change.

### Hierarchy
- **Hero Display** (700, `clamp(2.35rem, 7vw, 4rem)`, 1.08 line-height, −0.045em): the Start/Today
  hero headline only, set on the gradient surface.
- **Display** (700, `clamp(1.8rem, 5vw, 2.6rem)`, 1.08 line-height, −0.045em): standard page `h1`.
- **Title** (700, 1.08rem, −0.025em): section and panel `h2` headings.
- **Body** (400, 1rem, 1.55 line-height): paragraph copy; generous line-height reads as unhurried.
- **Label** (850, 0.7rem, 0.13em letter-spacing, uppercase): the "eyebrow" kicker text above headings
  and the small badge/pill labels throughout.

### Named Rules
**The One Typeface Rule.** Inter is the only typeface in the system, at every weight from 400 to 900.
A second typeface would read as decoration the product's tone doesn't want.

## Layout

Single-column, content-first: a 1000px-max `<main>` centered with generous outer padding, sitting
below a sticky sub-header tab bar (desktop) that becomes a fixed bottom tab bar on mobile
(`max-width: 760px`). Sections stack vertically with consistent rhythm (`content-heading` blocks
separate groups by ~27px). Grids are used sparingly and always collapse to a single column on mobile
(3-up motivation/guide cards → 1-up with an icon-left layout; 3-up stat grid stays but tightens
padding; 4-up summary grid → 2-up). Dialogs (the entry form) become full-width bottom sheets on
mobile with a sticky, blurred action bar pinned above the safe-area inset.

## Elevation & Depth

Soft & Approachable: depth is conveyed through diffuse, low-contrast ambient shadows rather than hard
drop shadows or sharp borders — nothing in the system reads as "lifted hardware." Elevation also
responds to interaction: clickable cards (entries, goal history items) sit at a lighter rest shadow
and gain both the full ambient shadow and a 2px upward translate on hover, the system's one
consistent "aliveness" cue.

### Shadow Vocabulary
- **Ambient (rest, panels)** (`box-shadow: 0 12px 32px rgba(20,65,96,.07)`): the default panel/card
  shadow — very soft, wide spread, low opacity.
- **Ambient (rest, list items)** (`box-shadow: 0 5px 15px rgba(20,65,96,.04)`): lighter version for
  entry rows and similar list items before interaction.
- **Ambient (hover, list items)** (`box-shadow: 0 12px 32px rgba(20,65,96,.07)` + `translateY(-2px)`):
  the interactive response — item "lifts" to the full panel shadow on hover.
- **Hero surface** (`box-shadow: 0 20px 45px rgba(7,93,146,.2)`): the one deliberately heavier shadow,
  reserved for the gradient hero card, underscoring it as the system's single richer moment.
- **Primary button** (`box-shadow: 0 8px 20px rgba(8,121,189,.18)`): a soft colored glow rather than a
  neutral shadow, tying the button visually to Clinical Blue.

### Named Rules
**The No Hard Shadow Rule.** Every shadow in the system uses a wide blur radius and low opacity
(≤0.2 alpha). A tight, dark, "cut-out" shadow never appears — it would break the calm register.

## Shapes

Rounded is the default state of every surface; the system has no sharp rectangular corners.
Buttons and inputs sit around 11px radius, panels and cards around 18px, and the largest surfaces
(hero card, dialogs) scale up to 20–25px. Fully circular shapes (`50%`) mark icon-only controls
(round-button, icon-button) and small badge glyphs. Fully pill-shaped (`999px`) tracks mark
selectable, mutually-exclusive controls: tags, filter chips, and the two segmented switches
(date-range switch, entry-mode switch). Borders are hairline (1px, `Hairline Mist`) by default;
dashed borders are reserved specifically for "add a new item" affordances (add-alcohol-row button,
the empty-state card), a deliberate visual cue distinct from solid-bordered content.

### Named Rules
**The Segmented Pill Rule.** Any control offering a small set of mutually exclusive choices (date
range, entry mode) uses the same pattern: a light gray pill-shaped track (`#eaf3f8`, 13px radius)
containing a white pill that slides under the active choice. This pattern must not be reinvented with
a different visual language elsewhere in the app.

## Components

### Buttons
- **Shape:** pill-adjacent rounded rectangle, 11px radius.
- **Primary:** Clinical Blue fill, white text, 850 weight, soft colored glow shadow. Used for the
  single most important action per screen (log an entry, save).
- **Secondary (default):** white fill, hairline border, ink text — the button style for everything
  that isn't the primary action.
- **Ghost (on hero):** translucent white fill (`rgba(255,255,255,.08)`) with a translucent white
  border, used only on the gradient hero surface for a secondary CTA.
- **Light (on hero):** solid white fill, deep-blue text, no shadow — the hero's equivalent of a
  "primary" button that still reads as calm against the colored background.
- **Icon button:** 40–42px circle, no border, used for compact actions (add, close).
- **Text button:** no border/background, Clinical Blue text only — for the lowest-emphasis actions
  (links inside forms, "add alcohol item").
- **Danger link:** same as text button but Quiet Alert Red — reserved for the single destructive
  action in the system (remove a line item), never for anything entry-related.
- **Hover / Focus:** primary darkens to Deep Clinical Blue; all interactive text/icon buttons get a
  soft background tint on hover rather than an underline-first treatment.

### Chips / Tags
- **Tag:** pill, Blue Mist background, Deep Clinical Blue text — read-only category labels on entries.
- **Filter chip:** pill, white at rest with a hairline border; becomes a solid fill in its assigned
  `--chip-color` (per-substance color) when active — the one place per-item custom color is allowed
  to override the palette, and only for filtering, never for entry content itself.
- **Checkbox pill (`check-grid`):** pill-shaped label wrapping a native checkbox; checked state fills
  with Blue Mist and a Clinical Blue border rather than showing a checkmark icon.

### Cards / Containers
- **Panel (standard):** 18px radius, white background, hairline border, Ambient shadow, `clamp(18px,
  4vw, 28px)` internal padding. The default container for any grouped content.
- **Entry / list item:** 16px radius, white background, hairline border, lighter Ambient shadow at
  rest, becomes clickable-card behavior (see Elevation).
- **Gradient hero (signature component):** the Start/Today welcome card — a 130° blue-to-cyan
  gradient (`#0876b8 → #1098c8 → #23b9c8`), 25px radius, white text, a single oversized translucent
  ring decoration bleeding off the top-right corner, and the system's only heavy shadow. This is the
  one place the system spends its "richness budget"; it must not be duplicated elsewhere or the
  gradient stops reading as special.
- **Crisis / warning card:** same panel shape, but with the Crisis Rose or warning color family
  substituted for the neutral hairline/white — always paired with tel: links styled as solid Crisis
  Rose buttons. Always present on Guide and Settings; never collapsed behind a disclosure.
- **Empty state:** dashed hairline border (not solid), circular icon badge in Blue Mist, centered
  text — visually distinct from every other card so "nothing here yet" never looks like an error.

### Inputs / Fields
- **Style:** 11px radius, light hairline border (`#d7e3eb`), off-white fill (`#fbfdff`), 44px min
  height.
- **Focus:** border shifts to Clinical Blue plus a soft 3px outer glow ring
  (`rgba(8,121,189,.12)`) — no harsh browser default outline.
- **Range slider:** native `accent-color: Clinical Blue`; paired with a small Deep-Blue numeric
  output label rather than a visible track fill.

### Navigation
- **Style:** a pill-track tab bar, transparent at rest, Blue Mist fill + Deep Blue text for the
  active tab. Desktop: sticky top bar, blurred backdrop. Mobile (≤760px): becomes a fixed bottom tab
  bar with icon-over-label layout, respecting the safe-area inset.

## Do's and Don'ts

### Do:
- **Do** use Clinical Blue for every interactive element and Clinical Cyan only for data/decoration
  — keep the Cyan-Is-Not-Clickable Rule intact.
- **Do** keep every new shape rounded (8px minimum radius) with soft, wide, low-opacity shadows.
- **Do** treat the gradient hero as a singular, non-repeatable surface — one per view at most.
- **Do** keep Crisis Rose visually and structurally separate from Quiet Alert Red.

### Don't:
- **Don't** use red, or any color, to flag, score, or visually shame a logged consumption entry —
  this is a durable product principle (see PRODUCT.md), not a stylistic preference.
- **Don't** add gamification elements — streaks, badges, confetti, celebratory progress bars — the
  product observes, it does not reward or grade (PRODUCT.md, "Observe don't judge").
- **Don't** let the interface drift toward a sterile, cold, stark-white "hospital" look — the tinted
  paper background and soft blue palette are load-bearing warmth, not decoration to trim.
- **Don't** introduce a second display/personality typeface. Inter, varied by weight, is the whole
  system.
