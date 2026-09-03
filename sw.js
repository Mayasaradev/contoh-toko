const CACHE_NAME = "todo-pwa-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon.png"
];

// Install: simpan semua file ke cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Fetch: kalau offline, ambil dari cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});