let CACHE_NAME = 'cache-v12',
    URLs = [
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/css/info.css',
    '/js/productionHome.min.js',
    '/js/productionInfo.min.js',
    '/js/lazyload.min.js',
    '/js/idb.js'
]

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(URLs);
            })
    );
});
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (event.request.method == 'POST') {
    return;
  }
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/restaurants') {
      return;
    }
    if (requestUrl.pathname === '/reviews') {
      return;
    }
    if (requestUrl.pathname === '/restaurant.html') {
      event.respondWith(caches.match('/restaurant.html'));
      return;
    }
  }
  event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response)
                    return response;

                let clonedRequest = event.request.clone();
                return fetch(clonedRequest)
                    .then(function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        let responseForCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseForCache);
                            });
                        return response;
                    });
            })
        );
});
