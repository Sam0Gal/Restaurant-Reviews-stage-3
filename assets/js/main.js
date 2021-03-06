let restaurants,
  neighborhoods,
  cuisines
// var map  google map
var newMap // leaflet map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
          center: [40.722216, -73.987501],
          zoom: 12,
          scrollWheelZoom: false
        });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: '<access_Token>',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(newMap);

    newMap.dragging.disable();
    updateRestaurants();
  }
  /**
 * Initialize Google map, called from HTML.
 */
  /* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  // self.markers.forEach(m => m.setMap(null)); For google map
  if (self.markers) { // For leaflet map
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  // Lazy load images.
  new LazyLoad();
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  let imageUrl = DBHelper.imageUrlForRestaurant(restaurant);

  if (imageUrl === '/img/undefined') {
    const notAvailable = document.createElement('div');
    notAvailable.className = 'restaurant-img';
    const txt = document.createElement('p');
    txt.append('Image\'s not available.');

    notAvailable.append(txt);
    li.append(notAvailable);
  } else {
    const picture = document.createElement('picture');
    li.append(picture);

    const img_source1 = document.createElement('source');
    img_source1.media = '(min-width: 600px) and (max-width: 700px)';
    img_source1.dataset.srcset = `${imageUrl}_small2x.jpg`;

    const img_source2 = document.createElement('source');
    img_source2.dataset.srcset = `${imageUrl}_small.jpg, ${imageUrl}_small2x.jpg 2x, ${imageUrl}_small2x.jpg 3x`

    const img_source3 = document.createElement('source');
    img_source3.media = '(min-width: 600px) and (max-width: 700px)';
    img_source3.dataset.srcset = `${imageUrl}_small2x.webp`;

    const img_source4 = document.createElement('source');
    img_source4.dataset.srcset = `${imageUrl}_small.webp, ${imageUrl}_small2x.webp 2x, ${imageUrl}_small2x.webp 3x`

    picture.append(img_source3); // 3 and 4 for browsers that supports  webp formats
    picture.append(img_source4);
    picture.append(img_source1);
    picture.append(img_source2);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.dataset.src = imageUrl+'_small.jpg';
    image.alt = `${restaurant.name} restaurant image`;
    picture.append(image);

  }


  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  name.setAttribute('tabindex', '0');
  li.append(name);


  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  const favorite = document.createElement('span');
  favorite.innerHTML = '🟊';
  favorite.setAttribute('tabindex', '0');
  favorite.setAttribute('role', 'button');
  favorite.classList.add('favorite');
  if (restaurant.is_favorite) {
    favorite.classList.add('added-to-favorite');
    favorite.style.color = 'yellow';
  }
  favorite.addEventListener('click', function(event) {
    toggleFavorite(favorite, restaurant.id);
  });
  favorite.addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
      toggleFavorite(favorite, restaurant.id);
    }
  });
  li.append(favorite);


  return li
}
function toggleFavorite(favorite, id) {
  if (favorite.classList.contains('added-to-favorite')) {
    favorite.classList.remove('added-to-favorite');
    favorite.style.color = 'rgb(90, 88, 88)';
  } else {
    favorite.classList.add('added-to-favorite');
    favorite.style.color = 'yellow';
  }
  DBHelper.updateFavorites(id);
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => { // For leaflet
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
// For Accessibility
// remove focus from google map for keyboard users.
document.querySelector('a').addEventListener('keydown', skipMap);
document.querySelector('select').addEventListener('keydown', skipMap2);

function skipMap(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector('#footer a').focus();
    } else {
      document.querySelector('select').focus();
    }
  }
  e.preventDefault();
}

function skipMap2(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector('a').focus();
      e.preventDefault();
    }
  }
}
