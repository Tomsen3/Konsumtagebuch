const VERSION = "1.8.5";
const CACHE_NAME = `konsumtagebuch-app-v${VERSION}`;
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "pdfgen.js",
  "manifest.webmanifest",
  "icon.svg",
  "logo.png",
  "apple-touch-icon.png",
  "version.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(ASSETS.map(async (asset) => {
        const separator = asset.includes("?") ? "&" : "?";
        const response = await fetch(`${asset}${separator}v=${VERSION}`, { cache: "reload" });
        if (!response.ok) throw new Error(`Asset konnte nicht geladen werden: ${asset}`);
        await cache.put(asset, response);
      })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("konsumtagebuch-app-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put("./", response.clone()));
          return response;
        })
        .catch(() => caches.match("./", { cacheName: CACHE_NAME }))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const network = fetch(event.request).then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
