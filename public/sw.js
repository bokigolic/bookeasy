const CACHE = 'bookeasy-v1'
const SHELL = [
  '/',
  '/dashboard',
  '/offline.html',
  '/icon.svg',
  '/manifest.json',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return
  if (!request.url.startsWith(self.location.origin)) return
  // Skip Supabase API calls
  if (request.url.includes('supabase.co')) return

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp
        const clone = resp.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return resp
      }).catch(() => {
        // For navigate requests serve offline page
        if (request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
    })
  )
})
