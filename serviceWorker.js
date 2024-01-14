self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("your-app-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/academicHistory.html",
        "/professionalHistory.html",
        "/testimonials.html",
        "/mySkills.html",
        "/contactMe.html",
        "/styles.css",
        "/script.js",
        "/manifest.json",
        "/icons/icon1.png",
        "/icons/icon2.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
