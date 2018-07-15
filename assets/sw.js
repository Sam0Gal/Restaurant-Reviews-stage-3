importScripts('js/idb.js', 'js/sync.js');
let CACHE_NAME = 'cache-v13',
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

onmessage = function(result) {
  self.newReview = result.data.theNewReview;
}

self.addEventListener('sync', function(event) {
  if (event.tag === 'syncReviews') {
    if (self.newReview != null) {
      event.waitUntil(addReviewToServer());
    }
  }
});

function addReviewToServer(newReview = self.newReview) {
  fetch(`http://localhost:1337/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(newReview)
  }).then(function() {
    fetch(`http://localhost:1337/reviews/?madeOffline=true`)
      .then(function(response) {
        return response.json();
      }).then(function(response) {
        self.reviewID = response[0].id;
        dbPromise.then(function(db) {
          const reviewsStore = db.transaction('reviews', 'readwrite').objectStore('reviews');
          reviewsStore.openCursor().then(function updateTheNewReview(cursor) {
            if (!cursor) return;
            if (cursor.value.madeOffline) {
              response[0].madeOffline = false;
              self.review = response[0];
              cursor.delete();
              reviewsStore.add(response[0]);
              return;
            }
            return cursor.continue().then(updateTheNewReview);
          }).then(function() {
            fetch(`http://localhost:1337/reviews/${self.reviewID}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json; charset=utf-8'
              },
              body: JSON.stringify(self.review)
            }).then(function(text) {
              console.log('Updating the new review done.', text);
              self.newReview = null;
            })
          })
        })
      })
    });
};
