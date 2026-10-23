/* Офлайн-кеш. Есть интернет — всегда берём свежие файлы с сервера и обновляем кеш.
   Нет интернета (или он не ответил за NETWORK_TIMEOUT_MS) — отдаём из кеша.
   После правки файлов поднимите VERSION, чтобы кеш для офлайна пересобрался целиком. */
const VERSION = 'coffee-match-v5';
const NETWORK_TIMEOUT_MS = 3000;
const FILES = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'match.js',
  'app.js',
  'manifest.webmanifest',
  'assets/fonts/NeueHaasDisplayBlack.ttf',
  'assets/fonts/NeueHaasDisplayMedium.ttf',
  'assets/fonts/NeueHaasDisplayRoman.ttf',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/logo.svg'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' — мимо HTTP-кеша браузера, иначе GitHub Pages (max-age=600) может подсунуть старые файлы
  const fresh = FILES.map((f) => new Request(f, { cache: 'reload' }));
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const key = url.origin + url.pathname;
  e.respondWith(
    fromNetwork(key).catch(() => caches.match(key, { ignoreSearch: true }).then((hit) => hit || Response.error()))
  );
});

// Сеть с таймаутом. Если сеть ответила позже таймаута, кеш всё равно обновится
function fromNetwork(key) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(reject, NETWORK_TIMEOUT_MS);
    fetch(new Request(key, { cache: 'no-cache' })).then((res) => {
      clearTimeout(timer);
      if (!res.ok) { reject(); return; }
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(key, copy));
      resolve(res);
    }, (err) => { clearTimeout(timer); reject(err); });
  });
}
