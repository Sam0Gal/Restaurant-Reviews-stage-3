/**
 * Common database helper functions.
 */
// The Service Worker
if (navigator.serviceWorker) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(reg) {
        console.log('service worker registeration successful!');
      }, function(err) {
        console.log('service worker registeration failed.');
      });
  });
}

let dbPromise = idb.open("restaurants reviews", 2, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
    upgradeDb.createObjectStore("restaurants", {
    keyPath: "id"
    });
    case 1:
    upgradeDb.createObjectStore('reviews', {
      keyPath: 'id'
    });
  }
});
let isCached = false;

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let isCached = false;
    dbPromise
      .then(function(db) {
        const tx = db.transaction("restaurants");
        const restaurantsStore = tx.objectStore("restaurants");
        return restaurantsStore.getAll();
      })
      .then(function(cached_restaurants) {
        if (Object.keys(cached_restaurants).length !== 0) {
          callback(null, cached_restaurants);
          isCached = true;
          console.log("data fetched from idb");
        }
        if (isCached) return;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", DBHelper.DATABASE_URL + 'restaurants');
        xhr.onload = () => {
          if (xhr.status === 200) {
            // Got a success response from server!
            const restaurants = JSON.parse(xhr.responseText);
            dbPromise
              .then(function(db) {
                const tx = db.transaction("restaurants", "readwrite");
                const restaurantsStore = tx.objectStore("restaurants");
                restaurants.forEach(restaurant => {
                  restaurantsStore.put(restaurant);
                });
              })
              .then(function() {
                console.log("data chached.");
              });

            callback(null, restaurants);
          } else {
            // Oops!. Got an error from server.
            const error = `Request failed. Returned status of ${xhr.status}`;
            callback(error, null);
          }
        };
        xhr.send();
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  static updateReviews(restaurant_id, callback) {
    fetch(DBHelper.DATABASE_URL + `reviews/?restaurant_id=${restaurant_id}`)
      .then(function(response) {
        return response.json();
      }).then(function(reviews) {
        dbPromise.then(function(db) {
          const tx = db.transaction('reviews', 'readwrite');
          const reviewsStore = tx.objectStore('reviews');
          reviews.forEach(review => {
            reviewsStore.put(review);
          });
          if (callback) callback(null, reviews);
        }).catch(function(error) {
          callback(error, null);
        })
    })
  }

  static fetchReviews(restaurant_id, callback) {
    let isCached = false;
    dbPromise.then(function(db) {
      const tx = db.transaction('reviews');
      const reviews = tx.objectStore('reviews');
      return reviews.getAll();
    }).then(function(cached_reviews) {
      cached_reviews = cached_reviews.filter(review => review.restaurant_id == restaurant_id);
      if (Object.keys(cached_reviews).length != 0) {
        callback(null, cached_reviews);
        isCached = true;
        console.log('reviews fetched from idb');
      }
      if (isCached) return;

      DBHelper.updateReviews(restaurant_id, callback);
    });
  }

  static fetchReviewsByRestaurantId(id, callback) {
    DBHelper.fetchReviews(id, (error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        if (reviews) {
          callback(null, reviews);
        } else {
          callback('reviews does not exist', null);
        }
      }
    })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
          {title: restaurant.name,
          alt: restaurant.name,
          url: DBHelper.urlForRestaurant(restaurant)
          })
          marker.addTo(newMap);
        return marker;
      }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */
  static updateFavorites(id) {
    dbPromise.then(function(db) {
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.openCursor(id);
    }).then(function(cursor) {
      if (!cursor) return;
      const is_favorite = cursor.value.is_favorite;
      let update = cursor.value;
      if (is_favorite) {
        update.is_favorite = false;
        cursor.update(update);
      } else {
        update.is_favorite = true;
        cursor.update(update);
      }
    });
  }
  static addNewReview(id, name, date, rating, review) {
    const theNewReview = {
      "restaurant_id": id,
      "name": name,
      "rating": `${rating}`,
      "comments": review,
      "createdAt": date
    };

    if (navigator.onLine) {
      fetch(DBHelper.DATABASE_URL + `reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(theNewReview)
      }).then(function() {
        console.log('The review added to the database.');
        let addReviewToPage = new Promise((resolve, reject) => {
          DBHelper.updateReviews(id);
          resolve();
        });
        addReviewToPage.then(function() {
          fillReviewsHTML(theNewReview);
        });
      });
    } else {
      // If user is offline
      theNewReview.id = Math.floor(Math.random() * 10000000);
      theNewReview.madeOffline = true;
      dbPromise.then(function(db) {
        const tx = db.transaction('reviews', 'readwrite');
        const reviewsStore = tx.objectStore('reviews');
        reviewsStore.put(theNewReview);
      }).then(function() {
        console.log('Review saved in idb.');


        theNewReview.id = undefined;
        navigator.serviceWorker.controller.postMessage({
          'theNewReview': theNewReview
        });


      });
      fillReviewsHTML(theNewReview);
    }
  }
}
