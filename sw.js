/* Офлайн-кеш.
   Код (HTML, JS, CSS): есть интернет — берём свежий с сервера, нет (или не ответил за NETWORK_TIMEOUT_MS) — из кеша.
   Файлы из assets/ (фото, шрифты, иконки): сразу из кеша, чтобы на слабом Wi‑Fi ничего не ждало сеть.
   После правки файлов поднимите VERSION, чтобы кеш пересобрался целиком — заменённые фото тоже подтянутся. */
const VERSION = 'coffee-match-v8';
const NETWORK_TIMEOUT_MS = 3000;
const FILES = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'match.js',
  'fx.js',
  'app.js',
  'vendor/qrcode.js',
  'manifest.webmanifest',
  'assets/bg/gradient.png',
  'assets/flavours/berries.jpg',
  'assets/flavours/chocolate.jpg',
  'assets/flavours/florals.jpg',
  'assets/flavours/wild.jpg',
  'assets/fonts/NeueHaasDisplayBlack.ttf',
  'assets/fonts/NeueHaasDisplayBold.ttf',
  'assets/fonts/NeueHaasDisplayLight.ttf',
  'assets/fonts/NeueHaasDisplayMedium.ttf',
  'assets/fonts/NeueHaasDisplayRoman.ttf',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/back.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/level-hooked.svg',
  'assets/icons/level-nerd.svg',
  'assets/icons/level-rookie.svg',
  'assets/icons/logo-white.svg',
  'assets/icons/next.svg',
  'assets/icons/restart.svg',
  'assets/icons/share.svg',
  'assets/icons/tap-hand.svg',
  'assets/products/brazil-monteiro-capsules.jpg',
  'assets/products/brazil-monteiro-lobato.jpg',
  'assets/products/bubble-gum-capsules.jpg',
  'assets/products/colombia-condor-decaf.jpg',
  'assets/products/colombia-guava-banana.jpg',
  'assets/products/condor-decaf-capsules.jpg',
  'assets/products/decaf-drip.jpg',
  'assets/products/el-salvador-rufatti.jpg',
  'assets/products/ethiopia-kebena.jpg',
  'assets/products/ethiopia-kello-siko.jpg',
  'assets/products/geisha-drip.jpg',
  'assets/products/kenya-gititu.jpg',
  'assets/products/nitro-black.jpg',
  'assets/products/nitro-blood-orange.jpg',
  'assets/products/office-blend.jpg',
  'assets/products/rocket-flower-capsules.jpg',
  'assets/products/rocket-flower-drip.jpg'
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
  const fromCache = () => caches.match(key, { ignoreSearch: true });
  if (url.pathname.includes('/assets/')) {
    e.respondWith(fromCache().then((hit) => hit || fromNetwork(key)).catch(() => Response.error()));
    return;
  }
  e.respondWith(fromNetwork(key).catch(() => fromCache().then((hit) => hit || Response.error())));
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
