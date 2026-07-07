const CACHE_NAME = "zapominalka-v2";
const FILES_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./images/card-1.svg",
  "./images/card-2.svg",
  "./images/card-3.svg",
  "./images/card-4.svg",
  "./images/card-5.svg",
  "./images/card-6.svg",
  "./images/card-7.svg",
  "./images/card-8.svg",
  "./images/card-9.svg",
  "./images/card-10.svg",
  "./images/card-11.svg",
  "./images/card-12.svg",
  "./images/card-13.svg",
  "./images/card-14.svg",
  "./images/card-15.svg",
  "./images/card-16.svg",
  "./images/card-17.svg",
  "./images/card-18.svg",
  "./images/card-19.svg",
  "./images/card-20.svg",
  "./images/card-21.svg",
  "./images/card-22.svg",
  "./images/card-23.svg",
  "./images/card-24.svg",
  "./images/qr-code.svg",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      // Сначала пробуем взять из кэша
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Если в кэше нет — пробуем сеть
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // Если сеть недоступна (ошибка fetch) — проверяем, это запрос документа?
        if (event.request.destination === "document") {
          // Возвращаем index.html как fallback
          return await caches.match("./index.html");
        }
        // Для остальных ресурсов (картинки, скрипты и т.п.) можно вернуть ошибку или заглушку
        return new Response(null, { status: 404 });
      }
    })()
  );
});
