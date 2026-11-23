// Kampala Mart V63.1 - NO CACHE for index, so visitors always get latest cloud version
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate' || e.request.url.includes('index.html')) {
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
