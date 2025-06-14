// Service Worker for caching critical resources
const CACHE_NAME = 'formayaptirma-v1.0.0';
const STATIC_CACHE_NAME = 'formayaptirma-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'formayaptirma-dynamic-v1.0.0';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/assets/js/react-vendor-DRtXIexf.js',
  '/assets/js/ui-vendor-BVK-SPUK.js',
  '/assets/js/Index-D2ppzKVE.js',
  '/assets/index-BQFmTqfX.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png'
];

// Resources to cache on first use
const RUNTIME_CACHE = [
  '/gallery',
  '/about',
  '/blog',
  '/faq',
  '/contact-us'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Critical resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache critical resources', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip browser extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Skip API requests to Supabase
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Stale While Revalidate for API data
    if (isAPIRequest(url)) {
      return await staleWhileRevalidate(request);
    }
    
    // Strategy 3: Network First for pages
    if (isPageRequest(url)) {
      return await networkFirst(request);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy - for pages
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy - for API data
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || await networkResponsePromise;
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.hostname.includes('supabase');
}

function isPageRequest(url) {
  return url.pathname.startsWith('/') && !isStaticAsset(url) && !isAPIRequest(url);
}

async function getOfflineFallback(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  if (request.destination === 'document') {
    return await cache.match('/') || new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
  
  return new Response('Resource not available offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'performance-data') {
    event.waitUntil(syncPerformanceData());
  }
});

async function syncPerformanceData() {
  // Send cached performance data when back online
  console.log('Service Worker: Syncing performance data');
}

// Push notifications support
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      tag: 'formayaptirma-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
