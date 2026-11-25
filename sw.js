// Garde la calculette en mémoire pour qu'elle marche sans internet.
// Change VERSION à chaque mise à jour des fichiers.
const VERSION = 'v1';
const CACHE = `calculette-${VERSION}`;
const FILES = ['./', './index.html', './style.css', './script.js', './install.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('calculette-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Réseau d'abord (dernière version), sinon la copie en mémoire
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request)
    .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
