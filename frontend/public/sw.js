// Basic Service Worker to allow PWA Installation prompts
const CACHE_NAME = 'lost-found-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to the network safely
  event.respondWith(
    fetch(event.request).catch(err => {
      // Return a basic error or just log it silently
      console.warn('[SW] Fetch failed for:', event.request.url);
      return new Response('Network error occurred', { status: 408, statusText: 'Network Error' });
    })
  );
});
