// Beim Release hier, in version.json und in sw.js auf dieselbe Version setzen.
const VERSION = "1.8.5";
const DATA_KEY       = "konsumtagebuch.data.v1";
const GOALS_KEY      = "konsumtagebuch.goals.v1";
const EXPORT_KEY     = "konsumtagebuch.lastExport";
const PROFILE_KEY    = "konsumtagebuch.profile.v1";
const DISCLAIMER_KEY = "konsumtagebuch.disclaimer.v1";

// Single source of truth für Alkohol-Typen und SE-Berechnung.
// Änderungen hier wirken sich automatisch auf Berechnung, Eintragsanzeige und Hilfetext aus.
const ALCOHOL_TYPES = [
  { id: "beer",    label: "Bier",                referenceMl: 250, guideLabel: "ca. 0,25 l" },
  { id: "wine",    label: "Wein",                referenceMl: 100, guideLabel: "ca. 0,1 l" },
  { id: "spirits", label: "Schnaps / Spirituosen", referenceMl: 30,  guideLabel: "ca. 0,03 l" },
  { id: "custom",  label: "Sonstiges (eigene Angabe)", referenceMl: null, guideLabel: null },
];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Farbe pro Substanz – gleichmäßig über den Farbkreis verteilt für maximale Unterscheidbarkeit
const SUBSTANCE_COLORS = {
  "Alkohol":                       "#ef6c00", // Bernstein  (35°)
  "Opioide":                       "#b71c1c", // Dunkelrot   (0°)
  "Cannabis":                      "#2e7d32", // Dunkelgrün (120°)
  "Glücksspiel / Medien":          "#00695c", // Dunkelblaugrün (174°)
  "Medikamente / Benzodiazepine":  "#0277bd", // Kobaltblau (210°)
  "Stimulanzien":                  "#6a1b9a", // Violett    (270°)
  "Verlangen / Craving":           "#880e4f", // Dunkelmagenta (330°)
  "Kein Konsum":                   "#558b2f", // Olive       (85°)
  "Sonstiges":                     "#4e342e", // Dunkelbraun (neutral)
};
const DEFAULT_CHART_COLOR = "#21b5ca";

const state = {
  entries: read(DATA_KEY, []),
  goals: read(GOALS_KEY, {}),
  installPrompt: null,
  viewHistory: ["start"],
  currentView: "start",
  swipeStart: null,
  substanceFilter: null, // null = alle Substanzen
  entryMode: "quick",
};

// ── Profil (Name, Therapeut:in, Station) ─────────────────────────────────────
function loadProfile() {
  const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  // Migration: altes einzeiliges "name"-Feld auf firstname/lastname aufteilen
  if (p.name && !p.firstname) {
    const parts = p.name.trim().split(/\s+/);
    p.firstname = parts[0] || "";
    p.lastname  = parts.slice(1).join(" ") || "";
  }
  return p;
}

function applyProfile() {
  const p = loadProfile();
  if ($("#profile-firstname")) $("#profile-firstname").value = p.firstname || "";
  if ($("#profile-lastname"))  $("#profile-lastname").value  = p.lastname  || "";
  if ($("#profile-therapist")) $("#profile-therapist").value = p.therapist || "";
  if ($("#profile-ward"))      $("#profile-ward").value      = p.ward      || "";
  const greeting = $("#profile-greeting");
  if (greeting) greeting.textContent = p.firstname ? `Hallo, ${p.firstname}` : "";
  const startGreeting = $("#start-greeting");
  if (startGreeting) startGreeting.textContent = p.firstname ? `Hallo, ${p.firstname}!` : "";
}

function saveProfileData() {
  const p = {
    firstname:  $("#profile-firstname")?.value.trim() || "",
    lastname:   $("#profile-lastname")?.value.trim()  || "",
    therapist:  $("#profile-therapist")?.value.trim() || "",
    ward:       $("#profile-ward")?.value.trim()      || "",
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  const greeting = $("#profile-greeting");
  if (greeting) greeting.textContent = p.firstname ? `Hallo, ${p.firstname}` : "";
  const startGreeting = $("#start-greeting");
  if (startGreeting) startGreeting.textContent = p.firstname ? `Hallo, ${p.firstname}!` : "";
  const btn = $("#save-profile");
  if (btn) { btn.textContent = "✓ Gespeichert"; setTimeout(() => { btn.textContent = "Speichern"; }, 1800); }
}
// ─────────────────────────────────────────────────────────────────────────────

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function formatDate(value, options = { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("de-DE", options).format(new Date(`${value}T12:00:00`));
}
function mondayOf(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDate(d);
}

function showView(id) {
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === id));
  $$(".tabs button").forEach((button) => button.classList.toggle("active", button.dataset.view === id));
  if (id === "history") renderHistory();
  if (id === "goals") loadGoal();
  state.currentView = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchView(id, record = true) {
  if (!document.getElementById(id) || id === state.currentView) return;
  if (record) {
    state.viewHistory.push(id);
    history.pushState({ view: id }, "");
  }
  showView(id);
}

function goBack() {
  if ($("#entry-dialog").open) {
    $("#entry-dialog").close();
    return;
  }
  if (state.viewHistory.length > 1) history.back();
}

function handlePopState(event) {
  if (state.viewHistory.length > 1) state.viewHistory.pop();
  showView(event.state?.view || state.viewHistory.at(-1) || "start");
}

function bindSwipeBack() {
  document.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    state.swipeStart = touch.clientX <= 32 ? { x: touch.clientX, y: touch.clientY } : null;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    if (!state.swipeStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - state.swipeStart.x;
    const dy = Math.abs(touch.clientY - state.swipeStart.y);
    state.swipeStart = null;
    if (dx >= 80 && dy <= 60) goBack();
  }, { passive: true });
}

function renderEntries(target, entries) {
  const container = $(target);
  if (!entries.length) {
    container.replaceChildren($("#empty-template").content.cloneNode(true));
    container.querySelector(".open-entry")?.addEventListener("click", (event) => {
      event.stopPropagation();
      openEntry();
    });
    return;
  }
  container.innerHTML = entries.map((entry) => {
    const alcItems = entry.substanceEntries?.find((e) => e.substance === "Alkohol")?.alcoholItems
      || entry.alcoholItems || [];
    const alcoholStr = alcItems.filter((i) => i.amount).map((i) => {
      const label = i.type === "custom" ? (i.customLabel || "Sonstiges")
        : (ALCOHOL_TYPES.find((t) => t.id === i.type)?.label ?? "Getränk");
      const pct = i.type === "custom" && i.alcPercent ? ` (${i.alcPercent}%)` : "";
      return `${i.amount} ${i.measure === "l" ? "Liter" : "ml"} ${label}${pct}`;
    }).join(", ")
    || (entry.alcoholAmount
      ? `${entry.alcoholAmount} ${entry.alcoholMeasure === "l" ? "Liter" : "ml"} ${ALCOHOL_TYPES.find((t) => t.id === entry.alcoholType)?.label ?? "Bier"}`
      : "");
    const consumptionStr = entry.substanceEntries?.length
      ? entry.substanceEntries.flatMap((e) => {
          if (e.substance === "Glücksspiel / Medien") {
            const typeLabel = e.gamblingType === "gambling" ? "Glücksspiel" : "Medien";
            const hrs  = e.gamblingHours   ? `${e.gamblingHours} Std.`   : "";
            const mins = e.gamblingMinutes ? `${e.gamblingMinutes} Min.`  : "";
            const duration = [hrs, mins].filter(Boolean).join(" ");
            const amount   = e.gamblingAmount ? `${e.gamblingAmount} €`   : "";
            const info = [typeLabel, duration, amount].filter(Boolean).join(", ");
            return info ? [info] : [];
          }
          return e.consumption ? [`${e.substance}: ${e.consumption}`] : [];
        }).join(" · ")
      : (entry.consumptionItems?.length
          ? entry.consumptionItems.map((i) => `${i.substance}: ${i.value}`).join(" · ")
          : entry.consumption || "");
    const scaleStr = [
      entry.cravingLevel !== "" && entry.cravingLevel !== undefined ? `Suchtdruck ${entry.cravingLevel}/10` : "",
      entry.strainLevel !== "" && entry.strainLevel !== undefined ? `Belastung ${entry.strainLevel}/10` : "",
    ].filter(Boolean).join(" · ");
    const details = [alcoholStr, consumptionStr, scaleStr].filter(Boolean).join(" · ");
    const allTexts = entry.substanceEntries?.length
      ? entry.substanceEntries.flatMap((e) => [e.situation, e.trigger, e.strategy].filter(Boolean))
      : [entry.situation, entry.trigger, entry.strategy].filter(Boolean);
    const preview = [...new Set(allTexts)]
      .slice(0, 3).map((s) => s.slice(0, 60) + (s.length > 60 ? " …" : "")).join(" · ");
    const sonstigesLabel = entry.substanceEntries?.find((e) => e.substance === "Sonstiges")?.sonstigesLabel;
    const rawCategory = entry.category || entry.substances?.join(", ") || "Eintrag";
    const categoryDisplay = sonstigesLabel
      ? rawCategory.replace("Sonstiges", `Sonstiges: ${sonstigesLabel}`)
      : rawCategory;
    const needsReflection = !entry.substanceEntries?.some((e) => e.strategy || e.evaluation);
    return `
    <article class="entry card" data-id="${esc(entry.id)}" tabindex="0">
      <div class="entry-top">
        <div><h3>${esc(categoryDisplay)}${needsReflection ? '<span class="entry-reflection-badge">Reflexion offen</span>' : ""}</h3><time>${esc(formatDate(entry.date))}${entry.time ? ` · ${esc(entry.time)} Uhr` : ""}</time></div>
        ${entry.units ? `<span class="tag">${esc(entry.units)} SE</span>` : ""}
      </div>
      ${details ? `<p class="entry-details">${esc(details)}</p>` : ""}
      ${preview ? `<p class="entry-preview">${esc(preview)}</p>` : ""}
    </article>`;
  }).join("");
}

function renderToday() {
  const today = localDate();
  const entries = state.entries.filter((entry) => entry.date === today).sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  $("#today-label").textContent = formatDate(today);
  $("#today-count").textContent = entries.length;
  renderEntries("#today-list", entries);
}

function filteredEntries() {
  const days = Number($("#history-range .active")?.dataset.days || 30);
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days + 1);
  return state.entries.filter((entry) => new Date(`${entry.date}T12:00:00`) >= cutoff)
    .sort((a, b) => `${b.date}${b.time || ""}`.localeCompare(`${a.date}${a.time || ""}`));
}

function renderHistory() {
  const allEntries = filteredEntries(); // nur Datumsgrenzen, kein Substanzfilter
  renderSubstanceFilter(allEntries);
  const entries = state.substanceFilter
    ? allEntries.filter((e) => (e.substances || [e.category || "Eintrag"]).includes(state.substanceFilter))
    : allEntries;
  $("#stat-days").textContent = new Set(entries.map((e) => e.date)).size;
  $("#stat-entries").textContent = entries.length;
  if (state.substanceFilter === "Glücksspiel / Medien") {
    const totalHours = entries.reduce((sum, e) => {
      const g = e.substanceEntries?.find((s) => s.substance === "Glücksspiel / Medien");
      return sum + (Number(g?.gamblingHours) || 0) + (Number(g?.gamblingMinutes) || 0) / 60;
    }, 0);
    $("#stat-se-label").textContent = "Std. gesamt";
    $("#stat-se").textContent = Math.round(totalHours * 10) / 10;
  } else {
    $("#stat-se-label").textContent = "Alkohol-SE";
    $("#stat-se").textContent = entries.reduce((sum, e) => sum + (Number(e.units) || 0), 0).toLocaleString("de-DE", { maximumFractionDigits: 1 });
  }
  renderTimeline(entries);
  renderCategories(entries);
  renderTherapySummary(entries);
  renderEntries("#history-list", entries);
}

function renderTherapySummary(entries) {
  const days = Number($("#history-range .active")?.dataset.days || 30);
  const documented = new Set(entries.map((e) => e.date)).size;
  const noConsumption = new Set(entries.filter((e) => (e.substances || []).includes("Kein Konsum")).map((e) => e.date)).size;
  const cravingEntries = entries.filter((e) => (e.substances || []).includes("Verlangen / Craving") || (e.cravingLevel !== "" && e.cravingLevel !== undefined)).length;
  const openReflection = entries.filter((e) => !e.substanceEntries?.some((s) => s.strategy || s.evaluation)).length;
  const calendarDays = days >= 3650 ? null : days;
  const undocumented = calendarDays === null ? null : Math.max(0, calendarDays - documented);
  $("#summary-period").textContent = days >= 3650 ? "Gesamt" : `${days} Tage`;
  $("#therapy-summary-grid").innerHTML = [
    ["Dokumentierte Tage", documented],
    ["Konsumfreie Tage", noConsumption],
    ["Craving erfasst", cravingEntries],
    ["Reflexion offen", openReflection],
  ].map(([label, value]) => `<div class="summary-item"><strong>${value}</strong><span>${label}</span></div>`).join("");
  $("#therapy-summary-note").textContent = undocumented === null
    ? "Die Gesamtansicht zeigt nur dokumentierte Tage. Tage ohne Eintrag lassen sich hier nicht bewerten."
    : `${undocumented} von ${calendarDays} Tagen haben keinen Eintrag. Kein Eintrag bedeutet nicht automatisch keinen Konsum.`;
}

function renderSubstanceFilter(allEntries) {
  const container = $("#substance-filter");
  if (!container) return;
  const substances = [...new Set(allEntries.flatMap((e) => e.substances || [e.category || "Eintrag"]))].sort();
  if (substances.length <= 1) { container.innerHTML = ""; return; }
  container.innerHTML = [
    `<button class="filter-chip${!state.substanceFilter ? " active" : ""}" data-filter="">Alle</button>`,
    ...substances.map((s) => {
      const color = SUBSTANCE_COLORS[s] || DEFAULT_CHART_COLOR;
      return `<button class="filter-chip${state.substanceFilter === s ? " active" : ""}" data-filter="${esc(s)}" style="--chip-color:${color}">${esc(s)}</button>`;
    }),
  ].join("");
  container.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.substanceFilter = chip.dataset.filter || null;
      renderHistory();
    });
  });
}

// Gibt den metrisch relevanten Wert eines Eintrags zurück — je nach aktivem Filter:
// Alkohol → SE | Glücksspiel/Medien → Stunden | alles andere → 1 (Eintragsanzahl)
function entryMetricValue(entry) {
  if (state.substanceFilter === "Alkohol") {
    return Number(entry.units) || 0;
  }
  if (state.substanceFilter === "Glücksspiel / Medien") {
    const g = entry.substanceEntries?.find((e) => e.substance === "Glücksspiel / Medien");
    const h = Number(g?.gamblingHours)   || 0;
    const m = Number(g?.gamblingMinutes) || 0;
    return h + m / 60;
  }
  return 1;
}

function renderTimeline(entries) {
  const chartColor = (state.substanceFilter && SUBSTANCE_COLORS[state.substanceFilter]) || DEFAULT_CHART_COLOR;
  const days = Number($("#history-range .active")?.dataset.days || 30);
  const useWeeks = days > 30;

  const metricUnit = state.substanceFilter === "Alkohol" ? "SE"
    : state.substanceFilter === "Glücksspiel / Medien" ? "Std."
    : "Einträge";
  const round1 = (n) => Math.round(n * 10) / 10;
  const fmtVal = (n) => n % 1 === 0
    ? String(n)
    : n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

  let values = [];

  if (!useWeeks) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = localDate(d);
      const dayEntries = entries.filter((e) => e.date === date);
      const count = round1(dayEntries.reduce((sum, e) => sum + entryMetricValue(e), 0));
      values.push({ date, count, label: formatDate(date, { day: "2-digit", month: "2-digit" }) });
    }
  } else {
    // Wochenweise aggregieren: Schlüssel = Montag der Woche
    const weekMap = new Map();
    entries.forEach((e) => {
      const key = mondayOf(new Date(`${e.date}T12:00:00`));
      weekMap.set(key, round1((weekMap.get(key) || 0) + entryMetricValue(e)));
    });
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    cutoff.setHours(0, 0, 0, 0);
    const start = new Date(cutoff);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // auf Montag zurücksetzen
    const today = new Date();
    for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 7)) {
      const key = localDate(d);
      values.push({ date: key, count: weekMap.get(key) || 0,
        label: formatDate(key, { day: "2-digit", month: "2-digit" }) });
    }
  }

  const max = Math.max(1, ...values.map((v) => v.count));
  const activePoints = values.filter((v) => v.count > 0).length;
  const periodLabel = days >= 3650 ? "Gesamt (wöchentlich)"
    : useWeeks ? `${days} Tage (wöchentlich)`
    : days === 1 ? "1 Tag" : `${days} Tage`;
  $("#timeline-period").textContent = periodLabel;

  if (!activePoints) {
    $("#timeline-chart").innerHTML = `<div class="chart-empty">
      <span>↗</span><div><strong>Noch kein Verlauf sichtbar</strong><p>Mit deinen Einträgen entsteht hier nach und nach ein Überblick.</p></div>
    </div>`;
    return;
  }
  const width = 720, height = 190, left = 34, right = 16, top = 18, baseline = 142;
  const usableWidth = width - left - right;
  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : left + (i / (values.length - 1)) * usableWidth;
    const y = baseline - (v.count / max) * (baseline - top);
    return { x, y, ...v };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${left},${baseline} ${line} ${width - right},${baseline}`;
  const labelIndexes = [...new Set([0, Math.floor((values.length - 1) / 2), values.length - 1])];
  const captionUnit = useWeeks ? "Wochen" : "Tage";
  const captionMax = useWeeks ? "Höchster Wochenwert" : "Höchster Tageswert";
  $("#timeline-chart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img">
    <defs><linearGradient id="timeline-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${chartColor}" stop-opacity=".2"/><stop offset="100%" stop-color="${chartColor}" stop-opacity="0"/></linearGradient></defs>
    <line class="chart-grid" x1="${left}" x2="${width - right}" y1="${baseline}" y2="${baseline}"/>
    <line class="chart-grid subtle" x1="${left}" x2="${width - right}" y1="${top + 42}" y2="${top + 42}"/>
    <polygon class="chart-area" points="${area}"/><polyline class="chart-line" points="${line}" style="stroke:${chartColor}"/>
    ${points.filter((p) => p.count > 0).map((p) => `<g><circle class="chart-dot-halo" cx="${p.x}" cy="${p.y}" r="8" style="fill:${chartColor};opacity:.15"/><circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="4" style="stroke:${chartColor}"><title>${p.label}: ${fmtVal(p.count)} ${metricUnit}</title></circle><text class="chart-value" x="${p.x}" y="${p.y - 12}" text-anchor="middle">${fmtVal(p.count)}</text></g>`).join("")}
    ${labelIndexes.map((i) => `<text class="chart-label" x="${points[i].x}" y="177" text-anchor="${i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"}">${points[i].label}</text>`).join("")}
  </svg><div class="chart-caption"><span><strong>${activePoints}</strong> ${captionUnit} mit Eintrag</span><span>${captionMax}: <strong>${fmtVal(max)} ${metricUnit}</strong></span></div>`;
}

function renderCategories(entries) {
  const counts = entries.reduce((map, entry) => {
    const substances = entry.substances?.length ? entry.substances : [entry.category || "Eintrag"];
    substances.forEach((substance) => { map[substance] = (map[substance] || 0) + 1; });
    return map;
  }, {});
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, count]) => count));
  $("#category-chart").innerHTML = rows.length ? rows.map(([name, count]) => `
    <div class="bar-row"><span>${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${count / max * 100}%"></div></div><strong>${count}</strong></div>`).join("")
    : "<p>Noch keine Daten in diesem Zeitraum.</p>";
}

function setEntryMode(mode) {
  state.entryMode = mode === "full" ? "full" : "quick";
  $$("[data-entry-mode]").forEach((button) => button.classList.toggle("active", button.dataset.entryMode === state.entryMode));
  $$(".reflection-field").forEach((field) => { field.hidden = state.entryMode !== "full"; });
  $$(".reflection-prompt").forEach((hint) => { hint.hidden = state.entryMode === "full"; });
}

function setScale(input, value) {
  input.value = value === "" || value === undefined ? "0" : String(value);
  input.dataset.touched = value === "" || value === undefined ? "" : "1";
}

function updateScaleDisplays() {
  [["#entry-craving", "#craving-output"], ["#entry-strain", "#strain-output"]].forEach(([inputSelector, outputSelector]) => {
    const input = $(inputSelector);
    $(outputSelector).textContent = input.dataset.touched ? `${input.value} von 10` : "nicht angegeben";
  });
}

function openEntry(entry = null) {
  $("#entry-form").reset();
  $("#entry-id").value = entry?.id || "";
  $("#entry-date").value = entry?.date || localDate();
  $("#entry-time").value = entry?.time || new Date().toTimeString().slice(0, 5);
  setScale($("#entry-craving"), entry?.cravingLevel);
  setScale($("#entry-strain"), entry?.strainLevel);
  updateScaleDisplays();

  const substances = entry?.substances?.length ? entry.substances
    : entry?.category ? [entry.category] : [];
  $$(".substance-check").forEach((cb) => { cb.checked = substances.includes(cb.value); });

  // Gespeicherte Einträge pro Substanz aufbauen (inkl. Rückwärtskompatibilität)
  let savedEntries = [];
  if (entry?.substanceEntries?.length) {
    savedEntries = entry.substanceEntries;
  } else if (entry) {
    savedEntries = substances.map((substance) => {
      if (substance === "Alkohol") {
        const alcoholItems = entry.alcoholItems?.length
          ? entry.alcoholItems
          : entry.alcoholAmount
            ? [{ type: entry.alcoholType || "beer", amount: entry.alcoholAmount, measure: entry.alcoholMeasure || "ml" }]
            : [];
        return { substance, alcoholItems, units: entry.units || "" };
      }
      const ci = entry.consumptionItems?.find((i) => i.substance === substance);
      return {
        substance,
        consumption: ci?.value || entry.consumption || "",
        situation:   entry.situation  || "",
        trigger:     entry.trigger    || "",
        strategy:    entry.strategy   || "",
        evaluation:  entry.evaluation || "",
      };
    });
  }

  renderSubstanceCards(savedEntries);
  setEntryMode(entry ? "full" : "quick");
  $("#entry-title").textContent = entry ? "Eintrag bearbeiten" : "Eintrag hinzufügen";
  $("#delete-entry").hidden = !entry;
  $("#entry-dialog").showModal();
}

function saveEntry(event) {
  event.preventDefault();
  const id = $("#entry-id").value || crypto.randomUUID();
  const entry = { id };
  entry.date = $("#entry-date").value;
  entry.time = $("#entry-time").value;
  entry.cravingLevel = $("#entry-craving").dataset.touched ? $("#entry-craving").value : "";
  entry.strainLevel = $("#entry-strain").dataset.touched ? $("#entry-strain").value : "";
  entry.substances = $$(".substance-check:checked").map((cb) => cb.value);
  entry.category = entry.substances.join(", ") || "Nicht angegeben";

  entry.substanceEntries = $$(".substance-card").map((card) => {
    const substance = card.dataset.substance;
    const isAlc = substance === "Alkohol";
    const obj = { substance };
    if (isAlc) {
      obj.alcoholItems = [...card.querySelectorAll(".alcohol-row")].map((row) => {
        const item = {
          type:   row.querySelector(".alcohol-type").value,
          amount: row.querySelector(".alcohol-amount").value,
          measure: row.querySelector(".alcohol-measure").value,
        };
        if (item.type === "custom") {
          item.customLabel = row.querySelector(".alcohol-label")?.value.trim() || "";
          item.alcPercent  = row.querySelector(".alcohol-percent")?.value      || "";
        }
        return item;
      }).filter((i) => i.amount);
      obj.units = card.querySelector("#entry-units")?.value || "";
    } else if (substance === "Glücksspiel / Medien") {
      obj.gamblingType    = card.querySelector(".gambling-type")?.value || "media";
      obj.gamblingHours   = card.querySelector(".gambling-hours")?.value || "";
      obj.gamblingMinutes = card.querySelector(".gambling-minutes")?.value || "";
      obj.gamblingAmount  = card.querySelector(".gambling-amount")?.value || "";
    } else {
      obj.consumption = card.querySelector(".sub-consumption")?.value.trim() || "";
      if (substance === "Sonstiges") {
        obj.sonstigesLabel = card.querySelector(".sonstiges-label")?.value.trim() || "";
      }
    }
    obj.situation  = card.querySelector(".sub-situation")?.value.trim()  || "";
    obj.trigger    = card.querySelector(".sub-trigger")?.value.trim()    || "";
    obj.strategy   = card.querySelector(".sub-strategy")?.value.trim()   || "";
    obj.evaluation = card.querySelector(".sub-evaluation")?.value.trim() || "";
    return obj;
  });

  // Abwärtskompatibilität für alte Exporte / Backup-Imports
  const alcEntry   = entry.substanceEntries.find((e) => e.substance === "Alkohol");
  const otherEntry = entry.substanceEntries.find((e) => e.substance !== "Alkohol");
  entry.alcoholItems = alcEntry?.alcoholItems || [];
  entry.units        = alcEntry?.units || "";
  entry.consumption  = otherEntry?.consumption || "";
  entry.situation    = otherEntry?.situation  || alcEntry?.situation  || "";
  entry.trigger      = otherEntry?.trigger    || alcEntry?.trigger    || "";
  entry.strategy     = otherEntry?.strategy   || alcEntry?.strategy   || "";
  entry.evaluation   = otherEntry?.evaluation || alcEntry?.evaluation || "";
  const index = state.entries.findIndex((item) => item.id === id);
  if (index >= 0) state.entries[index] = entry;
  else state.entries.push(entry);
  write(DATA_KEY, state.entries);
  $("#entry-dialog").close();
  renderToday();
  renderHistory();
}

function showConfirm(message, okLabel = "OK") {
  return new Promise((resolve) => {
    $("#confirm-message").textContent = message;
    $("#confirm-ok").textContent = okLabel;
    const dialog = $("#confirm-dialog");
    const onOk = () => { dialog.close(); resolve(true); };
    const onCancel = () => { dialog.close(); resolve(false); };
    $("#confirm-ok").addEventListener("click", onOk, { once: true });
    $("#confirm-cancel").addEventListener("click", onCancel, { once: true });
    dialog.addEventListener("cancel", onCancel, { once: true });
    dialog.showModal();
  });
}

function createAlcoholRow(item = {}) {
  const row = document.createElement("div");
  row.className = "alcohol-row";
  const typeOptions = ALCOHOL_TYPES.map((t) =>
    `<option value="${esc(t.id)}"${(item.type || "beer") === t.id ? " selected" : ""}>${esc(t.label)}</option>`
  ).join("");
  const isCustom = (item.type || "beer") === "custom";
  row.innerHTML = `
    <div class="alcohol-row-fields">
      <label>Getränk<select class="alcohol-type">${typeOptions}</select></label>
      <label class="alc-custom-field"${isCustom ? "" : " hidden"}>Bezeichnung<input class="alcohol-label" type="text" placeholder="z. B. Alcopop, Bier (alkoholfrei)" value="${esc(item.customLabel || "")}"></label>
      <label class="alc-percent-field"${isCustom ? "" : " hidden"}>Alk. %<input class="alcohol-percent" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="z. B. 5" value="${esc(item.alcPercent || "")}"></label>
      <label>Menge<input class="alcohol-amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 500" value="${esc(item.amount || "")}"></label>
      <label>Einheit<select class="alcohol-measure">
        <option value="ml"${(item.measure || "ml") === "ml" ? " selected" : ""}>ml</option>
        <option value="l"${item.measure === "l" ? " selected" : ""}>Liter</option>
      </select></label>
      <span class="row-se"></span>
    </div>
    <button type="button" class="remove-alcohol-row" aria-label="Getränk entfernen">×</button>`;
  row.querySelector(".alcohol-type").addEventListener("change", (e) => {
    const isCustom = e.target.value === "custom";
    row.querySelector(".alc-custom-field").hidden = !isCustom;
    row.querySelector(".alc-percent-field").hidden = !isCustom;
    updateAlcoholTotals();
  });
  row.querySelector(".remove-alcohol-row").addEventListener("click", () => {
    row.remove();
    updateAlcoholTotals();
  });
  row.addEventListener("input", updateAlcoholTotals);
  return row;
}

function updateAlcoholTotals() {
  if (!$("#units-output")) return; // Alkohol-Karte noch nicht gerendert
  let total = 0;
  $$(".alcohol-row").forEach((row) => {
    const amount = Number(row.querySelector(".alcohol-amount").value) || 0;
    const ml = row.querySelector(".alcohol-measure").value === "l" ? amount * 1000 : amount;
    const type = row.querySelector(".alcohol-type").value;
    let se = 0;
    if (type === "custom") {
      const pct = Number(row.querySelector(".alcohol-percent")?.value) || 0;
      // Formel: ml × Alkohol% / 100 × 0,8g/ml ÷ 10g pro SE
      se = pct && ml ? Math.round((ml * pct / 100 * 0.8 / 10) * 10) / 10 : 0;
    } else {
      const ref = ALCOHOL_TYPES.find((t) => t.id === type)?.referenceMl;
      se = ref && ml ? Math.round((ml / ref) * 10) / 10 : 0;
    }
    row.querySelector(".row-se").textContent = se ? `${se.toLocaleString("de-DE", { maximumFractionDigits: 1 })} SE` : "";
    total += se;
  });
  total = Math.round(total * 10) / 10;
  $("#entry-units").value = total || "";
  $("#units-output").textContent = `${total.toLocaleString("de-DE", { maximumFractionDigits: 1 })} SE`;
}

// Substanzen ohne "Wie viel?"-Feld
const NO_CONSUMPTION = ["Alkohol", "Kein Konsum", "Verlangen / Craving"];

function renderSubstanceCards(savedEntries = []) {
  const container = $("#substance-cards");
  // Bestehende Freitextwerte vor dem Neurender sichern
  const current = {};
  $$(".substance-card").forEach((card) => {
    const s = card.dataset.substance;
    current[s] = {
      consumption: card.querySelector(".sub-consumption")?.value || "",
      situation:   card.querySelector(".sub-situation")?.value   || "",
      trigger:     card.querySelector(".sub-trigger")?.value     || "",
      strategy:    card.querySelector(".sub-strategy")?.value    || "",
      evaluation:  card.querySelector(".sub-evaluation")?.value  || "",
    };
  });
  container.innerHTML = "";
  const checked = $$(".substance-check:checked").map((cb) => cb.value);
  if (!checked.length) return;

  checked.forEach((substance) => {
    const saved  = savedEntries.find((e) => e.substance === substance) || {};
    const prev   = current[substance] || {};
    const isAlc  = substance === "Alkohol";
    const noCons = NO_CONSUMPTION.includes(substance);

    const card = document.createElement("fieldset");
    card.className = "substance-card";
    card.dataset.substance = substance;

    const v = (field) => esc(saved[field] ?? prev[field] ?? "");

    let html = `<legend>${esc(substance)}</legend>`;
    if (isAlc) {
      html += `
        <div id="alcohol-items"></div>
        <button type="button" id="add-alcohol-item">+ Weiteres Getränk</button>
        <p class="calculation">Gesamt: <strong id="units-output">0 SE</strong></p>
        <input id="entry-units" type="hidden">`;
    } else if (substance === "Glücksspiel / Medien") {
      const gType = saved.gamblingType || "media";
      html += `
        <label>Art<select class="gambling-type">
          <option value="media"${gType === "media" ? " selected" : ""}>Bildschirmzeit / Medien</option>
          <option value="gambling"${gType === "gambling" ? " selected" : ""}>Glücksspiel</option>
        </select></label>
        <div class="duration-row">
          <label>Dauer – Stunden<input class="gambling-hours" type="number" min="0" max="23" step="1" inputmode="numeric" placeholder="0" value="${esc(saved.gamblingHours || "")}"></label>
          <label>Minuten<input class="gambling-minutes" type="number" min="0" max="59" step="5" inputmode="numeric" placeholder="0" value="${esc(saved.gamblingMinutes || "")}"></label>
        </div>
        <label class="gambling-amount-label"${gType !== "gambling" ? " hidden" : ""}>Eingesetzter Betrag (€) <small>optional</small><input class="gambling-amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="z. B. 20.00" value="${esc(saved.gamblingAmount || "")}"></label>`;
    } else if (!noCons) {
      if (substance === "Sonstiges") {
        html += `<label>Was genau? <small>optional</small><input class="sonstiges-label" type="text" placeholder="z. B. Tabak, Energy Drinks, Kaufsucht" value="${esc(saved.sonstigesLabel || "")}"></label>`;
      }
      html += `<label>Wie viel?<textarea class="sub-consumption" placeholder="z. B. 1 Joint, 1 Tablette">${v("consumption")}</textarea></label>`;
    }
    html += `
      <label>Situation <small>Wo? Mit wem? Was hast du gerade gemacht?</small><textarea class="sub-situation" placeholder="z. B. allein zu Hause, Freitagabend nach der Arbeit">${v("situation")}</textarea></label>
      <label>Auslöser <small>Äußerer Anlass oder inneres Gefühl / Gedanke</small><textarea class="sub-trigger" placeholder="z. B. Streit, Langeweile, Anspannung, Einladung von Freunden">${v("trigger")}</textarea></label>
      <p class="reflection-prompt">Strategie und Auswertung kannst du über „Reflexion ergänzen“ später nachtragen.</p>
      <label class="reflection-field">Strategie <small>Was habe ich versucht – auch wenn es nicht geklappt hat?</small><textarea class="sub-strategy" placeholder="z. B. kurz spazieren gegangen, jemanden angerufen, abgelenkt">${v("strategy")}</textarea></label>
      <label class="reflection-field">Auswertung <small>Muster, Erkenntnisse, was ich beim nächsten Mal anders machen könnte</small><textarea class="sub-evaluation" placeholder="z. B. passiert oft abends, wenn ich allein bin und gestresst war">${v("evaluation")}</textarea></label>`;

    card.innerHTML = html;
    container.appendChild(card);

    if (substance === "Glücksspiel / Medien") {
      card.querySelector(".gambling-type")?.addEventListener("change", (e) => {
        card.querySelector(".gambling-amount-label").hidden = e.target.value !== "gambling";
      });
    }

    if (isAlc) {
      const items = saved.alcoholItems?.length ? saved.alcoholItems : [{}];
      const alcoholContainer = card.querySelector("#alcohol-items");
      items.forEach((item) => alcoholContainer.appendChild(createAlcoholRow(item)));
      card.querySelector("#add-alcohol-item").addEventListener("click", () => {
        alcoholContainer.appendChild(createAlcoholRow());
        updateAlcoholTotals();
      });
      updateAlcoholTotals();
    }
  });
  setEntryMode(state.entryMode);
}

function updateSubstanceSelection(event) {
  const changed = event.currentTarget;
  if (changed.value === "Kein Konsum" && changed.checked) {
    $$(".substance-check").forEach((cb) => { cb.checked = cb === changed; });
  } else if (changed.checked) {
    const noConsumption = $$(".substance-check").find((cb) => cb.value === "Kein Konsum");
    if (noConsumption) noConsumption.checked = false;
  }
  renderSubstanceCards();
}

async function deleteEntry() {
  if (!await showConfirm("Diesen Eintrag wirklich löschen?", "Löschen")) return;
  state.entries = state.entries.filter((entry) => entry.id !== $("#entry-id").value);
  write(DATA_KEY, state.entries);
  $("#entry-dialog").close();
  renderToday();
  renderHistory();
}

function loadGoal() {
  const week = $("#goal-week").value || mondayOf();
  $("#goal-week").value = week;
  const goal = state.goals[week] || {};
  ["type", "subject", "risks", "strategies", "support", "worked", "difficult", "next"].forEach((key) => {
    $(`#goal-${key}`).value = goal[key] || (key === "type" ? "Nichts verändern, weiter beobachten" : "");
  });
  renderGoalHistory();
}

function renderGoalHistory() {
  const container = $("#goal-history");
  if (!container) return;
  const weeks = Object.keys(state.goals).sort((a, b) => b.localeCompare(a));
  const currentWeek = $("#goal-week").value;
  const past = weeks.filter((w) => w !== currentWeek);
  if (!past.length) { container.innerHTML = ""; return; }
  container.innerHTML = `
    <div class="content-heading" style="margin-top:28px"><div><p class="eyebrow">Rückblick</p><h2>Vergangene Wochen</h2></div></div>
    <div class="goal-history-list">
      ${past.map((w) => {
        const g = state.goals[w];
        return `<article class="panel goal-history-item" data-week="${esc(w)}">
          <div class="goal-history-header">
            <div><strong>${esc(formatDate(w, { day: "2-digit", month: "2-digit", year: "numeric" }))}</strong>
            ${g.type ? `<span class="tag">${esc(g.type)}</span>` : ""}</div>
          </div>
          ${g.subject ? `<p class="goal-subject">${esc(g.subject)}</p>` : ""}
          ${g.worked ? `<p class="goal-meta"><strong>Was hat funktioniert:</strong> ${esc(g.worked.slice(0, 120))}${g.worked.length > 120 ? " …" : ""}</p>` : ""}
        </article>`;
      }).join("")}
    </div>`;
  container.querySelectorAll(".goal-history-item").forEach((item) => {
    item.addEventListener("click", () => {
      $("#goal-week").value = item.dataset.week;
      loadGoal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

async function saveGoal(event) {
  event.preventDefault();
  const week = $("#goal-week").value;
  state.goals[week] = {};
  ["type", "subject", "risks", "strategies", "support", "worked", "difficult", "next"].forEach((key) => {
    state.goals[week][key] = $(`#goal-${key}`).value.trim();
  });
  write(GOALS_KEY, state.goals);
  const lastExport = localStorage.getItem(EXPORT_KEY);
  const daysSince = lastExport ? Math.round((new Date() - new Date(`${lastExport}T12:00:00`)) / 86400000) : Infinity;
  if (daysSince > 7) {
    const exportNow = await showConfirm(
      `Wochenziel gespeichert. Letzte Sicherung: ${lastExport ? `vor ${daysSince} Tagen` : "noch nie"}. Jetzt eine Sicherung exportieren?`,
      "Sicherung exportieren"
    );
    if (exportNow) exportData();
  }
  renderGoalHistory();
}

function exportData() {
  const payload = { format: "konsumtagebuch-backup", version: 2, exportedAt: new Date().toISOString(), entries: state.entries, goals: state.goals, profile: loadProfile() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `konsumtagebuch-sicherung-${localDate()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(EXPORT_KEY, localDate());
  renderBackupStatus();
}

function renderBackupStatus() {
  const lastExport = localStorage.getItem(EXPORT_KEY);
  const el = $("#backup-status");
  if (!el) return;
  if (!lastExport) {
    el.textContent = "Noch keine Sicherung erstellt.";
    el.className = "status warn";
    return;
  }
  const days = Math.round((new Date() - new Date(`${lastExport}T12:00:00`)) / 86400000);
  el.textContent = days === 0 ? "Letzte Sicherung: heute." : days === 1 ? "Letzte Sicherung: gestern." : `Letzte Sicherung: vor ${days} Tagen.`;
  el.className = days > 7 ? "status warn" : "status";
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (payload.format !== "konsumtagebuch-backup" || !Array.isArray(payload.entries)) throw new Error();
    if (!await showConfirm("Die vorhandenen lokalen Daten durch diese Sicherung ersetzen?", "Ersetzen")) return;
    state.entries = payload.entries;
    state.goals = payload.goals || {};
    write(DATA_KEY, state.entries);
    write(GOALS_KEY, state.goals);
    if (payload.profile && typeof payload.profile === "object") localStorage.setItem(PROFILE_KEY, JSON.stringify(payload.profile));
    applyProfile();
    renderToday();
    renderHistory();
    loadGoal();
    alert("Sicherung wurde importiert.");
  } catch { alert("Diese Datei ist keine gültige Konsumtagebuch-Sicherung."); }
  event.target.value = "";
}

async function checkUpdate() {
  const status = $("#update-status");
  status.textContent = "Version wird geprüft …";
  try {
    const response = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Versionsdatei nicht erreichbar");
    const latest = await response.json();
    if (latest.version === VERSION) {
      status.textContent = `Version ${VERSION} ist aktuell.`;
      return;
    }
    status.textContent = `Version ${latest.version} ist verfügbar.`;
    if (!await showConfirm(`Version ${latest.version} ist verfügbar. Deine lokalen Daten bleiben erhalten.`, "Jetzt aktualisieren")) return;
    const registration = await navigator.serviceWorker?.getRegistration();
    if (!registration) { location.reload(); return; }
    navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
    const tryActivate = () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return true;
      }
      return false;
    };
    // Neuer SW wartet bereits → sofort aktivieren
    if (tryActivate()) return;
    // Sonst auf Installation warten
    registration.addEventListener("updatefound", () => {
      registration.installing?.addEventListener("statechange", () => {
        if (registration.installing?.state === "installed") tryActivate();
      });
    });
    await registration.update();
    // Fallback: nach update() nochmal prüfen
    if (!tryActivate()) setTimeout(() => location.reload(), 2000);
  } catch { status.textContent = "Versionsprüfung nicht möglich. Die App bleibt offline nutzbar."; }
}

// ── Berichts-Export ──────────────────────────────────────────────────────────
// Erzeugt ein eigenständiges, ansprechendes HTML-Dokument mit Profildaten.
// detailed=false → kompakte Übersicht; detailed=true → mit allen Textfeldern
function generateReportHTML(entries, detailed = false) {
  const profile  = loadProfile();
  const today    = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const dates    = entries.map((e) => e.date).sort();
  const rangeLabel = dates.length
    ? dates.length === 1
      ? formatDate(dates[0])
      : `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
    : "keine Einträge";
  const totalSE  = Math.round(entries.reduce((s, e) => s + (Number(e.units) || 0), 0) * 10) / 10;
  const totalDays = new Set(entries.map((e) => e.date)).size;
  const title    = detailed ? "Detaillierter Verlaufsbericht" : "Verlaufsübersicht";

  // Farbpalette (inline, kein Zugriff auf SUBSTANCE_COLORS nötig)
  const COLORS = {
    "Alkohol":"#ef6c00","Opioide":"#b71c1c","Cannabis":"#2e7d32",
    "Glücksspiel / Medien":"#00695c","Medikamente / Benzodiazepine":"#0277bd",
    "Stimulanzien":"#6a1b9a","Verlangen / Craving":"#880e4f",
    "Kein Konsum":"#558b2f","Sonstiges":"#4e342e",
  };
  const stag = (s, label) => {
    const c = COLORS[s] || "#21b5ca";
    return `<span style="display:inline-block;padding:1.5pt 7pt;border-radius:99pt;border:.5pt solid ${c};background:${c}18;color:${c};font-size:6.8pt;font-weight:700;line-height:1.6;white-space:nowrap">${label || s}</span>`;
  };

  // Profilzeile
  const fullName = [profile.firstname, profile.lastname].filter(Boolean).join(" ");
  const profileRow = [
    fullName           && `<div><span class="lbl">Patient:in</span><strong>${fullName}</strong></div>`,
    profile.therapist && `<div><span class="lbl">Therapeut:in</span><strong>${profile.therapist}</strong></div>`,
    profile.ward      && `<div><span class="lbl">Station</span><strong>${profile.ward}</strong></div>`,
  ].filter(Boolean).join("");

  const metaRow = [
    `<div><span class="lbl">Zeitraum</span><strong>${rangeLabel}</strong></div>`,
    state.substanceFilter && `<div><span class="lbl">Filter</span><strong>${state.substanceFilter}</strong></div>`,
    `<div><span class="lbl">Erstellt</span><strong>${today}</strong></div>`,
  ].filter(Boolean).join("");

  const statsRow = [
    `<div class="stat"><strong>${totalDays}</strong><span>Tage<br>dokumentiert</span></div>`,
    `<div class="stat"><strong>${entries.length}</strong><span>Einträge<br>gesamt</span></div>`,
    totalSE ? `<div class="stat"><strong>${totalSE.toLocaleString("de-DE",{maximumFractionDigits:1})}</strong><span>Alkohol-SE<br>gesamt</span></div>` : "",
  ].filter(Boolean).join("");

  const entryRows = entries.map((entry) => {
    const sonstigesLabel = entry.substanceEntries?.find((e) => e.substance === "Sonstiges")?.sonstigesLabel;
    const substances = entry.substances || (entry.category ? [entry.category] : ["–"]);
    const tags = substances.map((s) => stag(s, s === "Sonstiges" && sonstigesLabel ? `Sonstiges: ${sonstigesLabel}` : s)).join(" ");

    // Kompakte Konsum-Zeile (immer sichtbar)
    const consLines = (entry.substanceEntries || []).flatMap((se) => {
      if (se.substance === "Alkohol") return entry.units ? [`${entry.units} SE Alkohol`] : [];
      if (se.substance === "Glücksspiel / Medien") {
        const hrs = se.gamblingHours ? `${se.gamblingHours} Std.` : "";
        const mins = se.gamblingMinutes ? `${se.gamblingMinutes} Min.` : "";
        const dur = [hrs, mins].filter(Boolean).join(" ");
        const amt = se.gamblingAmount ? ` · ${se.gamblingAmount} €` : "";
        return dur ? [`${dur}${amt}`] : [];
      }
      return se.consumption ? [se.consumption] : [];
    });
    if (entry.cravingLevel !== "" && entry.cravingLevel !== undefined) consLines.push(`Suchtdruck ${entry.cravingLevel}/10`);
    if (entry.strainLevel !== "" && entry.strainLevel !== undefined) consLines.push(`Belastung ${entry.strainLevel}/10`);
    const consLine = consLines.join(" · ");

    // Detailblöcke (nur wenn detailed=true und Felder befüllt)
    let detailBlocks = "";
    if (detailed && entry.substanceEntries?.length) {
      detailBlocks = entry.substanceEntries.flatMap((se) => {
        const rows = [];
        if (se.substance === "Alkohol") {
          const items = (se.alcoholItems || []).filter((i) => i.amount).map((i) => {
            const label = i.type === "custom"
              ? (i.customLabel || "Sonstiges")
              : (ALCOHOL_TYPES.find((t) => t.id === i.type)?.label ?? "Getränk");
            const pct = i.type === "custom" && i.alcPercent ? ` (${i.alcPercent}%)` : "";
            return `${i.amount} ${i.measure === "l" ? "Liter" : "ml"} ${label}${pct}`;
          }).join(", ");
          if (items)       rows.push(["Konsumiert", items]);
          if (entry.units) rows.push(["Standardeinheiten", `${entry.units} SE`]);
        } else if (se.substance === "Glücksspiel / Medien") {
          const art = se.gamblingType === "gambling" ? "Glücksspiel" : "Bildschirmzeit / Medien";
          const hrs = se.gamblingHours ? `${se.gamblingHours} Std.` : "";
          const mins = se.gamblingMinutes ? `${se.gamblingMinutes} Min.` : "";
          const dur = [hrs, mins].filter(Boolean).join(" ");
          const amt = se.gamblingAmount ? `${se.gamblingAmount} €` : "";
          const info = [art, dur, amt].filter(Boolean).join(", ");
          if (info) rows.push(["Dauer / Einsatz", info]);
        } else if (se.consumption) {
          rows.push(["Wie viel", se.consumption]);
        }
        if (se.situation)  rows.push(["Situation",  se.situation]);
        if (se.trigger)    rows.push(["Auslöser",   se.trigger]);
        if (se.strategy)   rows.push(["Strategie",  se.strategy]);
        if (se.evaluation) rows.push(["Auswertung", se.evaluation]);
        if (!rows.length) return [];
        const c = COLORS[se.substance] || "#21b5ca";
        const subLabel = se.substance === "Sonstiges" && sonstigesLabel ? `Sonstiges: ${sonstigesLabel}` : se.substance;
        return [`<div class="db" style="border-left:2.5pt solid ${c}20;border-left-color:${c}">
          <strong style="color:${c}">${subLabel}</strong>
          <table class="dt">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</table>
        </div>`];
      }).join("");
    }

    return `<article class="er">
      <div class="eh">
        <div class="ed">${formatDate(entry.date)}${entry.time ? `<span class="et"> · ${entry.time} Uhr</span>` : ""}</div>
        <div class="eg">${tags}</div>
      </div>
      ${consLine ? `<p class="ec">${consLine}</p>` : ""}
      ${detailBlocks ? `<div class="edl">${detailBlocks}</div>` : ""}
    </article>`;
  }).join("");

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>KLARA – ${title}</title>
<style>
@page{size:A4 portrait;margin:13mm 14mm 16mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;font-size:9pt;color:#1a2d3a;line-height:1.5}
/* Kopfzeile */
.rh{display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:8pt;border-bottom:2pt solid #1565c0;margin-bottom:10pt}
.rt h1{font-size:15pt;font-weight:900;color:#1565c0;letter-spacing:-.02em;line-height:1}
.rt p{font-size:8pt;color:#5a7080;margin-top:2pt}
.rc{text-align:right;font-size:7pt;color:#7a8fa0;line-height:1.5}
.rc strong{display:block;font-size:8.5pt;color:#1565c0;font-weight:800}
/* Info-Reihen */
.ir{display:grid;grid-template-columns:repeat(auto-fit,minmax(100pt,1fr));gap:4pt 14pt;padding:7pt 10pt;background:#f2f6fb;border-radius:5pt;margin-bottom:7pt}
.ir div{display:flex;flex-direction:column}
.lbl{font-size:6pt;text-transform:uppercase;letter-spacing:.08em;color:#8a9faa;font-weight:700;margin-bottom:1pt}
.ir strong{font-size:8.5pt;color:#1a2d3a;font-weight:700}
/* Statistik */
.sv{display:flex;gap:0;margin-bottom:10pt;border:.5pt solid #dce6ec;border-radius:5pt;overflow:hidden}
.stat{flex:1;padding:7pt 10pt;text-align:center;border-right:.5pt solid #dce6ec}
.stat:last-child{border-right:0}
.stat strong{display:block;font-size:13pt;font-weight:900;color:#1565c0;line-height:1.1}
.stat span{font-size:6.5pt;color:#7a8fa0;line-height:1.4}
/* Abschnitts-Label */
.sl{font-size:6.5pt;text-transform:uppercase;letter-spacing:.1em;color:#8a9faa;font-weight:700;padding:7pt 0 4pt;border-bottom:.5pt solid #dce6ec;margin-bottom:6pt}
/* Eintrags-Karten */
.er{padding:6pt 9pt;border:.5pt solid #dce6ec;border-radius:5pt;margin-bottom:4pt;break-inside:avoid;background:#fff}
.eh{display:flex;align-items:flex-start;gap:8pt;flex-wrap:wrap}
.ed{font-size:8.5pt;font-weight:700;color:#1a2d3a;white-space:nowrap;flex-shrink:0;padding-top:1pt}
.et{font-weight:400;color:#7a8fa0}
.eg{display:flex;flex-wrap:wrap;gap:3pt;flex:1}
.ec{font-size:7.5pt;color:#5a7080;margin-top:4pt}
/* Detail-Blöcke */
.edl{margin-top:6pt;padding-top:6pt;border-top:.5pt solid #edf2f6;display:grid;gap:5pt}
.db{padding:4pt 8pt;border-radius:3pt;background:#fafcfe}
.db strong{font-size:6.5pt;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3pt;font-weight:800}
.dt{width:100%;font-size:8pt;border-collapse:collapse}
.dt th{width:55pt;font-weight:600;color:#7a8fa0;text-align:left;vertical-align:top;padding:0 8pt 2.5pt 0}
.dt td{color:#1a2d3a;vertical-align:top;padding-bottom:2.5pt;line-height:1.4}
/* Fußzeile */
footer{margin-top:14pt;padding-top:6pt;border-top:.5pt solid #dce6ec;display:flex;justify-content:space-between;font-size:6.5pt;color:#9aafba}
@media screen{body{max-width:680px;margin:20px auto;padding:20px}
.pdf-hint{display:block!important}}
.pdf-hint{display:none;background:#1565c020;border:.5pt solid #1565c0;border-radius:5pt;padding:8pt 12pt;font-size:8.5pt;color:#1565c0;margin-bottom:14pt;font-weight:600}
</style>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400))<\/script>
</head><body>
<div class="pdf-hint">📄 Der Druckdialog öffnet gleich – wähle „Als PDF speichern", um die Datei zu speichern.</div>
<div class="rh">
  <div class="rt"><h1>KLARA</h1><p>${title}</p></div>
  <div class="rc"><strong>PP.rt</strong>Klinik für Psychiatrie und<br>Psychosomatik Reutlingen</div>
</div>
${profileRow ? `<div class="ir">${profileRow}</div>` : ""}
<div class="ir">${metaRow}</div>
<div class="sv">${statsRow}</div>
<div class="sl">Verlauf · ${entries.length} ${entries.length === 1 ? "Eintrag" : "Einträge"}</div>
${entryRows || '<p style="color:#7a8fa0;font-size:8.5pt">Keine Einträge im gewählten Zeitraum.</p>'}
<footer>
  <span>PP.rt · Klinik für Psychiatrie und Psychosomatik · Wörthstraße 52/1 · 72764 Reutlingen</span>
  <span>KLARA v${VERSION}</span>
</footer>
</body></html>`;
}

// Öffnet den Bericht in einem neuen Tab – Druckdialog startet automatisch.
// Im Druckdialog „Als PDF speichern" für PDF-Export wählen.
function openReport(detailed = false) {
  const allEntries = filteredEntries();
  const entries = state.substanceFilter
    ? allEntries.filter((e) => (e.substances || [e.category || "Eintrag"]).includes(state.substanceFilter))
    : allEntries;
  const html = generateReportHTML(entries, detailed);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

// Lädt den Bericht direkt als HTML-Datei herunter (zum Archivieren / per E-Mail versenden).
function saveReport(detailed = false) {
  const allEntries = filteredEntries();
  const entries = state.substanceFilter
    ? allEntries.filter((e) => (e.substances || [e.category || "Eintrag"]).includes(state.substanceFilter))
    : allEntries;
  const html = generateReportHTML(entries, detailed);
  const date = localDate().replace(/-/g, "");
  const label = detailed ? "Bericht" : "Uebersicht";
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Konsumtagebuch-${label}-${date}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15_000);
}
// ── Logo für PDF vorbereiten ──────────────────────────────────────────────────
// Lädt logo.png via Canvas, gibt JPEG-Bytes + Maße zurück (oder null bei Fehler).
async function loadLogoForPdf() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ar = img.naturalWidth / img.naturalHeight;
      const ch = 90; // Zielhöhe in px (30pt × 3 für Druckqualität)
      const cw = Math.round(ch * ar);
      const canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        blob.arrayBuffer().then((buf) => resolve({ bytes: new Uint8Array(buf), width: cw, height: ch }));
      }, 'image/jpeg', 0.90);
    };
    img.onerror = () => resolve(null);
    img.src = 'logo.png';
  });
}

// ── Echter PDF-Download (kein HTML) ──────────────────────────────────────────
// Erzeugt eine echte .pdf-Datei direkt im Browser ohne externe Bibliothek.
// Nutzt pdfgen.js (muss davor geladen sein).
async function generateReportPDF(detailed = false) {
  const allEntries = filteredEntries();
  const entries = state.substanceFilter
    ? allEntries.filter((e) => (e.substances || [e.category || "Eintrag"]).includes(state.substanceFilter))
    : allEntries;

  const profile   = loadProfile();
  const today     = new Date().toLocaleDateString("de-DE", { day:"2-digit", month:"2-digit", year:"numeric" });
  const dates     = entries.map((e) => e.date).sort();
  const range     = dates.length
    ? dates.length === 1 ? formatDate(dates[0])
      : `${formatDate(dates[0])} – ${formatDate(dates[dates.length-1])}`
    : "keine Einträge";
  const totalSE   = Math.round(entries.reduce((s,e) => s+(Number(e.units)||0), 0)*10)/10;
  const totalDays = new Set(entries.map((e) => e.date)).size;
  const title     = detailed ? "Detaillierter Verlaufsbericht" : "Verlaufsübersicht";

  const COLORS = {
    "Alkohol":"#ef6c00","Opioide":"#b71c1c","Cannabis":"#2e7d32",
    "Glücksspiel / Medien":"#00695c","Medikamente / Benzodiazepine":"#0277bd",
    "Stimulanzien":"#6a1b9a","Verlangen / Craving":"#880e4f",
    "Kein Konsum":"#558b2f","Sonstiges":"#4e342e",
  };

  // Logo vorab laden (schlägt still fehl → wird einfach weggelassen)
  const logoData = await loadLogoForPdf();

  const doc = new PDFDoc();
  if (logoData) doc.addJpegImage('Logo', logoData.bytes, logoData.width, logoData.height);

  const ML=40, MR=555, MW=MR-ML, YMAX=804;
  let pg, y;

  function addFooter() {
    pg.hline(826, { x1:ML, x2:MR, color:"#dce6ec" });
    pg.text("PP.rt · Klinik für Psychiatrie und Psychosomatik Reutlingen",
      ML, 834, { size:6.5, color:"#9aafba" });
    pg.text(`KLARA v${VERSION}`, MR-60, 834, { size:6.5, color:"#9aafba" });
  }
  function newPage() { pg = doc.newPage(); y = 40; }
  function ensureFits(h) {
    if (y + h > YMAX) { addFooter(); pg.finish(); newPage(); }
  }

  newPage();

  /* ── Logo oben rechts (weißer Bereich über dem Header) ─── */
  if (logoData) {
    const lh = 30; // Anzeigehöhe in pt
    const lw = Math.round(lh * logoData.width / logoData.height);
    pg.drawImage('Logo', MR - lw, 5, lw, lh);
  }

  /* ── Kopfzeile ─────────────────────────────────────────── */
  pg.rect(ML, y, MW, 40, { fill:"#1565c0" });
  pg.text("KLARA", ML+10, y+15, { bold:true, size:15, color:"#ffffff" });
  pg.text("Konsum · Lage · Auslöser · Reflexion · Auswertung", ML+10, y+26, { size:6.5, color:"#a0cfe8" });
  pg.text(title, ML+10, y+36, { size:7, color:"#90caf9" });
  const ppW = _pdfTw("PP.rt", 10);
  pg.text("PP.rt", MR-ppW-8, y+14, { bold:true, size:10, color:"#ffffff" });
  const subTitle = "Klinik für Psychiatrie und Psychosomatik";
  pg.text(subTitle, MR-_pdfTw(subTitle,6)-8, y+26, { size:6, color:"#a0cfe8" });
  y += 46;

  /* ── Info-Block ─────────────────────────────────────────── */
  const fullName = [profile.firstname, profile.lastname].filter(Boolean).join(" ");
  const info = [];
  if (fullName)          info.push(["Patient:in",   fullName]);
  if (profile.therapist) info.push(["Therapeut:in", profile.therapist]);
  if (profile.ward)      info.push(["Station",       profile.ward]);
  info.push(["Zeitraum", range]);
  if (state.substanceFilter) info.push(["Filter", state.substanceFilter]);
  info.push(["Erstellt", today]);
  const iH = Math.ceil(info.length/2) * 18 + 10;
  pg.rect(ML, y, MW, iH, { fill:"#f2f6fb" });
  for (let i = 0; i < info.length; i++) {
    const col = i%2, row = Math.floor(i/2);
    const fx = ML+8+col*(MW/2), fy = y+8+row*18;
    pg.text(info[i][0].toUpperCase(), fx, fy,   { size:6,   color:"#8a9faa" });
    pg.text(info[i][1],               fx, fy+9, { bold:true, size:8.5, color:"#1a2d3a" });
  }
  y += iH + 6;

  /* ── Statistik-Leiste ───────────────────────────────────── */
  const stats = [
    [String(totalDays),    "Tage dok."],
    [String(entries.length), "Einträge"],
    ...(totalSE ? [[totalSE.toLocaleString("de-DE",{maximumFractionDigits:1}), "Alkohol-SE"]] : []),
  ];
  const sw = MW / stats.length;
  pg.rect(ML, y, MW, 28, { fill:"#f2f6fb", stroke:"#dce6ec" });
  for (const [i, [val, lbl]] of stats.entries()) {
    if (i > 0) pg.vline(ML+i*sw, y, y+28, { color:"#dce6ec" });
    const cx = ML + (i+0.5)*sw;
    pg.text(val, cx - _pdfTw(val,12)/2, y+12, { bold:true, size:12, color:"#1565c0" });
    pg.text(lbl, cx - _pdfTw(lbl,6.5)/2, y+23, { size:6.5, color:"#7a8fa0" });
  }
  y += 34;

  /* ── Abschnitts-Label ───────────────────────────────────── */
  pg.hline(y, { color:"#dce6ec" });
  y += 5;
  pg.text(`VERLAUF  ·  ${entries.length} ${entries.length===1?"EINTRAG":"EINTRÄGE"}`,
    ML, y, { size:6.5, color:"#8a9faa" });
  y += 8;
  pg.hline(y, { color:"#dce6ec" });
  y += 8;

  /* ── Eintrags-Karten ────────────────────────────────────── */
  function detailRows(se, entry) {
    const rows = [];
    if (se.substance === "Alkohol") {
      const items = (se.alcoholItems||[]).filter((i) => i.amount).map((i) => {
        const lbl = i.type === "custom"
          ? (i.customLabel || "Sonstiges")
          : (ALCOHOL_TYPES.find((t) => t.id === i.type)?.label ?? "Getränk");
        const pct = i.type === "custom" && i.alcPercent ? ` (${i.alcPercent}%)` : "";
        return `${i.amount} ${i.measure==="l"?"Liter":"ml"} ${lbl}${pct}`;
      }).join(", ");
      if (items)        rows.push(["Konsumiert",        items]);
      if (entry.units)  rows.push(["Standardeinheiten", `${entry.units} SE`]);
    } else if (se.substance === "Glücksspiel / Medien") {
      const art = se.gamblingType==="gambling" ? "Glücksspiel" : "Bildschirmzeit/Medien";
      const dur = [
        se.gamblingHours   ? `${se.gamblingHours} Std.`   : "",
        se.gamblingMinutes ? `${se.gamblingMinutes} Min.`  : "",
      ].filter(Boolean).join(" ");
      const info = [art, dur, se.gamblingAmount ? `${se.gamblingAmount} €` : ""].filter(Boolean).join(", ");
      if (info) rows.push(["Dauer / Einsatz", info]);
    } else if (se.consumption) {
      rows.push(["Wie viel", se.consumption]);
    }
    if (se.situation)  rows.push(["Situation",  se.situation]);
    if (se.trigger)    rows.push(["Auslöser",   se.trigger]);
    if (se.strategy)   rows.push(["Strategie",  se.strategy]);
    if (se.evaluation) rows.push(["Auswertung", se.evaluation]);
    return rows;
  }

  function entryHeight(entry) {
    let h = 8 + 11 + 13 + 6; // top-pad + Datum + Tags + bottom-pad
    const hasConsLine = (entry.substanceEntries||[]).some((se) =>
      se.substance==="Alkohol" ? !!entry.units
        : se.substance==="Glücksspiel / Medien" ? !!(se.gamblingHours||se.gamblingMinutes)
        : !!se.consumption
    ) || (entry.cravingLevel !== "" && entry.cravingLevel !== undefined)
      || (entry.strainLevel !== "" && entry.strainLevel !== undefined);
    if (hasConsLine) h += 12;
    if (detailed && entry.substanceEntries?.length) {
      for (const se of entry.substanceEntries) {
        const rows = detailRows(se, entry);
        if (!rows.length) continue;
        h += 8;  // Trennlinie + Abstand
        h += 10; // Substanz-Label
        for (const [, val] of rows) {
          h += Math.max(1, Math.ceil(_pdfTw(val, 8) / (MW-88))) * (8 * 1.45);
        }
        h += 4;
      }
    }
    return h;
  }

  for (const entry of entries) {
    const sLabel = entry.substanceEntries?.find((e) => e.substance==="Sonstiges")?.sonstigesLabel;
    const subs   = entry.substances || (entry.category ? [entry.category] : ["–"]);
    const eh     = entryHeight(entry);

    ensureFits(eh + 4);

    // Karten-Hintergrund
    pg.rect(ML, y, MW, eh, { fill:"#ffffff", stroke:"#dce6ec" });
    let cy = y + 8;

    // Datum
    const ds = `${formatDate(entry.date)}${entry.time ? "  ·  "+entry.time+" Uhr" : ""}`;
    pg.text(ds, ML+8, cy, { bold:true, size:8.5, color:"#1a2d3a" });
    cy += 13;

    // Substanz-Tags
    let tx = ML+8;
    for (const sub of subs) {
      const lbl   = sub==="Sonstiges" && sLabel ? `Sonstiges: ${sLabel}` : sub;
      const color = COLORS[sub] || "#21b5ca";
      const tagW  = _pdfTw(lbl, 7) + 10;
      pg.rect(tx, cy-9, tagW, 11, { fill:_pdfLighten(color, 0.83), stroke:color });
      pg.text(lbl, tx+4, cy, { size:7, color });
      tx += tagW + 5;
    }
    cy += 13;

    // Konsum-Zeile
    const clParts = (entry.substanceEntries||[]).flatMap((se) => {
      if (se.substance==="Alkohol") return entry.units ? [`${entry.units} SE Alkohol`] : [];
      if (se.substance==="Glücksspiel / Medien") {
        const dur = [
          se.gamblingHours   ? `${se.gamblingHours} Std.`   : "",
          se.gamblingMinutes ? `${se.gamblingMinutes} Min.`  : "",
        ].filter(Boolean).join(" ");
        return dur ? [dur] : [];
      }
      return se.consumption ? [se.consumption] : [];
    });
    if (entry.cravingLevel !== "" && entry.cravingLevel !== undefined) clParts.push(`Suchtdruck ${entry.cravingLevel}/10`);
    if (entry.strainLevel !== "" && entry.strainLevel !== undefined) clParts.push(`Belastung ${entry.strainLevel}/10`);
    const cl = clParts.join("  ·  ");
    if (cl) { pg.text(cl, ML+8, cy, { size:7.5, color:"#5a7080" }); cy += 12; }

    // Detail-Blöcke (nur wenn detailed=true)
    if (detailed && entry.substanceEntries?.length) {
      for (const se of entry.substanceEntries) {
        const rows = detailRows(se, entry);
        if (!rows.length) continue;
        pg.hline(cy+2, { x1:ML+8, x2:MR-8, color:"#eef2f6" });
        cy += 8;
        const color = COLORS[se.substance] || "#21b5ca";
        const bl = se.substance==="Sonstiges" && sLabel ? `Sonstiges: ${sLabel}` : se.substance;
        pg.text(bl.toUpperCase(), ML+10, cy, { size:6.5, color });
        cy += 10;
        for (const [key, val] of rows) {
          pg.text(key, ML+10, cy, { size:8, color:"#7a8fa0" });
          cy = pg.textWrap(val, ML+80, cy, MW-88, { size:8, color:"#1a2d3a" });
        }
        cy += 4;
      }
    }

    y += eh + 4;
  }

  addFooter();
  pg.finish();

  const dateStr = localDate().replace(/-/g, "");
  doc.save(`Konsumtagebuch-${detailed?"Bericht":"Uebersicht"}-${dateStr}.pdf`);
}
// ─────────────────────────────────────────────────────────────────────────────

function bindEvents() {
  $$(".tabs button").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$("[data-jump]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.jump)));
  $$(".open-guide").forEach((button) => button.addEventListener("click", () => switchView("guide")));
  $("#quick-add").addEventListener("click", () => openEntry());
  window.addEventListener("popstate", handlePopState);
  bindSwipeBack();
  $("#close-dialog").addEventListener("click", () => $("#entry-dialog").close());
  $("#entry-form").addEventListener("submit", saveEntry);
  $$("[data-entry-mode]").forEach((button) => button.addEventListener("click", () => setEntryMode(button.dataset.entryMode)));
  ["#entry-craving", "#entry-strain"].forEach((selector) => $(selector).addEventListener("input", (event) => {
    event.currentTarget.dataset.touched = "1";
    updateScaleDisplays();
  }));
  $("#clear-scales").addEventListener("click", () => {
    setScale($("#entry-craving"), "");
    setScale($("#entry-strain"), "");
    updateScaleDisplays();
  });
  $$(".substance-check").forEach((checkbox) => checkbox.addEventListener("change", updateSubstanceSelection));
  $("#delete-entry").addEventListener("click", deleteEntry);
  $("#goal-form").addEventListener("submit", saveGoal);
  $("#goal-week").addEventListener("change", loadGoal);
  $("#history-range").addEventListener("click", (event) => {
    const button = event.target.closest("[data-days]");
    if (!button) return;
    $$("#history-range [data-days]").forEach((option) => option.classList.toggle("active", option === button));
    state.substanceFilter = null; // Filter zurücksetzen bei Zeitraumwechsel
    renderHistory();
  });
  $("#print-history").addEventListener("click", () => window.print());
  $("#export-overview").addEventListener("click", () => openReport(false));
  $("#export-detailed").addEventListener("click", () => openReport(true));
  $("#export-save").addEventListener("click", () => generateReportPDF(true));
  $("#save-profile")?.addEventListener("click", saveProfileData);
  $("#export-data").addEventListener("click", exportData);
  $("#import-data").addEventListener("change", importData);
  $("#check-update").addEventListener("click", checkUpdate);
  $("#delete-data").addEventListener("click", async () => {
    if (!await showConfirm("Wirklich alle Einträge, Wochenziele, Profildaten und App-Einstellungen auf diesem Gerät löschen?", "Alles löschen")) return;
    localStorage.removeItem(DATA_KEY);
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(EXPORT_KEY);
    localStorage.removeItem(DISCLAIMER_KEY);
    state.entries = [];
    state.goals = {};
    applyProfile();
    renderToday();
    renderHistory();
    loadGoal();
  });
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (target?.closest(".open-entry")) {
      openEntry();
      return;
    }
    const card = target?.closest(".entry");
    if (card) openEntry(state.entries.find((entry) => entry.id === card.dataset.id));
  });
  document.addEventListener("keydown", (event) => {
    const card = event.target.closest(".entry");
    if (card && (event.key === "Enter" || event.key === " ")) openEntry(state.entries.find((entry) => entry.id === card.dataset.id));
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    $("#install-app").hidden = false;
  });
  $("#install-app").addEventListener("click", async () => {
    await state.installPrompt?.prompt();
    state.installPrompt = null;
    $("#install-app").hidden = true;
  });
}

function showDisclaimer() {
  const dialog = $("#disclaimer-dialog");
  if (!dialog) return;
  if (!localStorage.getItem(DISCLAIMER_KEY)) {
    dialog.showModal();
    $("#disclaimer-ok").addEventListener("click", () => {
      localStorage.setItem(DISCLAIMER_KEY, "1");
      dialog.close();
    }, { once: true });
  }
}

async function start() {
  $("#app-version").textContent = VERSION;
  $("#copyright-year").textContent = new Date().getFullYear();
  applyProfile();
  $("#goal-week").value = mondayOf();

  // SE-Hilfetext aus ALCOHOL_TYPES generieren (Alkohol-Optionen in createAlcoholRow dynamisch erzeugt)
  $("#se-unit-grid").innerHTML = ALCOHOL_TYPES
    .filter((t) => t.guideLabel)
    .map((t) => `<span><strong>${esc(t.guideLabel)}</strong>${esc(t.label.split(" /")[0])}</span>`)
    .join("");

  bindEvents();
  showDisclaimer();
  history.replaceState({ view: "start" }, "");
  renderToday();
  loadGoal();
  renderBackupStatus();
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
      const registration = await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
      await registration.update();
    } catch { /* App remains usable online. */ }
  }
}
start();
