
const CACHE_NAME = 'edusticker-cache-v1';
// Daftar URL yang akan di-cache. Untuk Next.js, caching halaman dinamis lebih kompleks.
// Service worker ini akan fokus pada caching aset inti dan strategi network-first atau cache-first sederhana.
const urlsToCache = [
  '/manifest.json', // Cache manifest
  '/', // Cache root path (start_url)
  // Aset statis lainnya bisa ditambahkan di sini,
  // tapi Next.js menangani bundling JS/CSS dengan baik.
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching', event.request.url);
  // Strategi Cache-First untuk aset yang sudah di-cache, Network-First untuk lainnya
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('Service Worker: Found in cache', event.request.url);
          return response; // Sajikan dari cache jika tersedia
        }
        // console.log('Service Worker: Not in cache, fetching from network', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Optional: Cache new requests dynamically if needed
            // if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension://')) {
            //   return caches.open(CACHE_NAME).then(cache => {
            //     cache.put(event.request, networkResponse.clone());
            //     return networkResponse;
            //   });
            // }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed; returning offline page if available or error.', error);
          // Anda bisa menambahkan fallback ke halaman offline di sini jika ada
          // return caches.match('/offline.html');
        });
      })
  );
});
