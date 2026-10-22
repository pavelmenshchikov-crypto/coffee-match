/* Офлайн-кеш: после первого открытия приложение работает без интернета.
   После любой правки файлов поднимите VERSION — iPad подтянет новое при следующем открытии с сетью. */
const VERSION = 'coffee-match-v1';
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
  'assets/icons/logo.svg',
  'assets/photos/acidity.jpg',
  'assets/photos/brew.jpg',
  'assets/photos/caffeine.jpg',
  'assets/photos/flavour.jpg',
  'assets/photos/level.jpg',
  'assets/photos/milk.jpg',
  'assets/photos/start.jpg',
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
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
