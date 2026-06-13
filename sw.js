// Cache-Name wird aus version.json gelesen.
// Beim Release nur version.json und app.js (VERSION) aktualisieren — sw.js bleibt unverändert.
const ASSETS = ["./", "index.html", "styles.css", "app.js", "pdfgen.js", "manifest.webmanifest", "icon.svg", "logo.png"];

let _cacheName;
function cacheName() {
  if (!_cacheName) {
    _cacheName = fetch("version.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ version }) => `konsumtagebuch-app-v${version}`);
  }
  return _cacheName;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheName().then((name) => caches.open(name).then((cache) => cache.addAll(ASSETS)))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    cacheName().then((name) =>
      caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== name).map((k) => caches.delete(k))))
        .then(() => self.clients.claim())
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    cacheName().then((name) =>
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((response) => {
          if (
            new URL(event.request.url).origin === self.location.origin &&
            !event.request.url.includes("version.json")
          ) {
            caches.open(name).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
      )
    )
  );
});
