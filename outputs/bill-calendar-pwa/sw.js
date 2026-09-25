const APP_VERSION = "v20";
const CACHE_NAME = `billpocket-${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./csv-import.js",
  "./transaction-splits.js",
  "./transaction-ui.js",
  "./vendor/papaparse.min.js",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

self.addEventListener("message", (event) => {
  if (event.data?.type === "GET_VERSION") event.ports[0]?.postMessage({ version: APP_VERSION });
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("billpocket-") && key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const key = event.request.mode === "navigate" ? "./index.html" : event.request;
      const cached = await cache.match(key);
      return cached || fetch(event.request);
    })
  );
});
