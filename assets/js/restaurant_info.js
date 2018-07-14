let restaurant;
// var map; google map
var newMap;


/**
 * Initialize leaflet map
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZWxxbm55IiwiYSI6ImNqamQxNHFwdTAyMXYzcHBhaHpwaGVwYTEifQ.FKXd-SMgNLFqFxyPmSB6yQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      newMap.dragging.disable();
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}


/**
 * Initialize Google map, called from HTML.
 */
// window.initMap = () => {
//   fetchRestaurantFromURL((error, restaurant) => {
//     if (error) {
//       // Got an error!
//       console.error(error);
//     } else {
//       self.map = new google.maps.Map(document.getElementById("map"), {
//         zoom: 16,
//         center: restaurant.latlng,
//         scrollwheel: false
//       });
//       fillBreadcrumb();
//       DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
//     }
//   });
// };

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
// To use when adding a new review.
  self.id = id;

  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }


      callback(null, restaurant);
    });
    DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.setAttribute("tabindex", "0"); // Make it accessible.
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.setAttribute("tabindex", "0"); // Make it accessible.
  address.innerHTML = restaurant.address;
  // picture


  let imageUrl = DBHelper.imageUrlForRestaurant(restaurant);
  if (imageUrl === "/img/undefined") {
    const notAvailable = document.createElement("div");
    notAvailable.className = "restaurant-img";
    const txt = document.createElement("p");
    txt.append("Image's not available.");

    notAvailable.append(txt);
    name.insertAdjacentElement("afterend", notAvailable);
  } else {
    const picture = document.createElement("picture");

    const img_source1 = document.createElement("source");
    img_source1.media = "(min-width: 550px)";
    img_source1.srcset = `${imageUrl}_small2x.jpg`;

    const img_source2 = document.createElement("source");
    img_source2.srcset = `${imageUrl}_small.jpg, ${imageUrl}_small2x.jpg 2x, ${imageUrl}_small2x.jpg 3x`;

    const img_source3 = document.createElement("source");
    img_source3.media = "(min-width: 550px)";
    img_source3.srcset = `${imageUrl}_small2x.webp`;

    const img_source4 = document.createElement("source");
    img_source4.srcset = `${imageUrl}_small.webp, ${imageUrl}_small2x.webp 2x, ${imageUrl}_small2x.webp 3x`;

    picture.prepend(img_source2); // 3 and 4 for browsers that supports  webp formats
    picture.prepend(img_source1);
    picture.prepend(img_source4);
    picture.prepend(img_source3);
    //picture
    const image = document.createElement("img");
    image.className = "restaurant-img";
    image.src = `${imageUrl}_small2x.jpg`;
    image.alt = `${restaurant.name} image.`;

    picture.append(image);

    name.insertAdjacentElement('afterend', picture);
  }
  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");
    row.setAttribute("tabindex", "0"); // Make it accessible.

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
    const container = document.getElementById("reviews-container");
    if (!reviews.length) {
      const title = document.createElement("h4");
      title.innerHTML = "Reviews";
      container.appendChild(title);
    }

    if (!reviews) {
      const noReviews = document.createElement("p");
      noReviews.innerHTML = "No reviews yet!";
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById("reviews-list");
    // To add the new review.
    if (!reviews.length) {
      ul.appendChild(createReviewHTML(reviews));
    } else {
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);

    }
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  li.setAttribute("tabindex", "0"); // Make it accessible.

  const reviewer = document.createElement("div");
  reviewer.className = "reviewer";
  li.appendChild(reviewer);

  const name = document.createElement("p");
  name.innerHTML = review.name;
  name.classList.add('name');
  reviewer.appendChild(name);

  const ceatedAt = document.createElement("p");
  let date = new Date(parseInt(review.createdAt));
  let day = date.getUTCDay();
  let month = date.getUTCMonth();
  let year = date.getUTCFullYear();
  ceatedAt.innerHTML = `${day}/${month}/${year}`;
  reviewer.appendChild(ceatedAt);

  // const updatedAt = document.createElement("p");
  // date = new Date(parseInt(review.updatedAt));
  // day = date.getUTCDay();
  // month = date.getUTCMonth();
  // year = date.getUTCFullYear();
  // updatedAt.innerHTML = 'Updated at: ' + `${day}/${month}/${year}`;
  // reviewer.appendChild(updatedAt);

  const rating = document.createElement("span");
  rating.className = "rating";
  rating.innerHTML = `${"⭐".repeat(review.rating)}`;
  reviewer.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);

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

  breadcrumb.insertAdjacentElement('afterend', favorite);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// remove focus from google map for keyboard users.
document
  .querySelector("#breadcrumb a")
  .addEventListener("keydown", skipMap);
document
  .querySelector("#restaurant-name")
  .addEventListener("keydown", skipMap2);

function skipMap(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector("a").focus();
    } else {
      document.querySelector("#restaurant-name").focus();
    }
  }
  e.preventDefault();
}

function skipMap2(e) {
  if (e.keyCode === 9 && e.shiftKey) {
    document.querySelector("#breadcrumb a").focus();
    e.preventDefault();
  }
}
(function selectRating() {
  let rateChoosed = false;
  let ratingElements = document.querySelectorAll('form div span');
  ratingElements = Array.from(ratingElements);

  function chooseRate(i) {
    self.rating = i + 1;
    let selectedElements = ratingElements.slice(0, i + 1);
    for (const selectedElement of selectedElements) {
      selectedElement.style.color = '#ffe000';
      selectedElement.classList.add('selected');
    }
    let theRest = ratingElements.slice(i + 1);
    for (const element of theRest) {
      element.style.color = 'grey';
      element.classList.remove('selected');
    }
    if (!rateChoosed) {
      document.querySelector('button').removeAttribute('disabled');
      rateChoosed = true;
    }
  }

  function focusOnRate(i) {
    let selectedElements = ratingElements.slice(0, i + 1);
      for (const selectedElement of selectedElements) {
        if (selectedElement.classList.contains('selected')) continue;
        selectedElement.style.color = '#ffff93';
      }
      let theRest = ratingElements.slice(i + 1);
      for (const element of theRest) {
        if (element.classList.contains('selected')) continue;
        element.style.color = 'grey';
      }
  }

  // ratingElements = Array.prototype.slice.apply(rating); // to use with forEach()
  for (let i = 0; i < ratingElements.length; i++) {

    ratingElements[i].addEventListener('mouseover', function(event) {
      focusOnRate(i);
    });
    ratingElements[i].addEventListener('focus', function(event) {
      focusOnRate(i);
    });
    ratingElements[i].addEventListener('focusout', function(event) {
      let theRest = ratingElements;
      for (const element of theRest) {
        if (element.classList.contains('selected')) continue;
        element.style.color = 'grey';
      }
    });

    ratingElements[i].addEventListener('click', function(event) {
      chooseRate(i);

    });
    ratingElements[i].addEventListener('keyup', function(event) {
      if (event.keyCode == 13) {
        chooseRate(i);
      }
    })
  }
  const ratingContainer = document.querySelector('form div');
  ratingContainer.addEventListener('mouseout', function(event) {
    for (element of ratingElements) {
      if (element.classList.contains('selected')) continue;
      element.style.color = 'grey';
    }
  });

})();

document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.querySelector('input');
  const review = document.querySelector('textarea');
  const creationDate = Date.now();
  DBHelper.addNewReview(self.id, name.value, creationDate, self.rating, review.value);

  name.value = '';
  review.value = '';
  document.querySelectorAll('form div span').forEach(function(star) {
    star.style.color = 'grey';
    star.classList.remove('selected');
  });
  self.rating = null;
});
document.querySelector('button').addEventListener('click', function(event) {
  const ratingContainer = document.querySelector('form .validateRate');
  if (!self.rating) {
    ratingContainer.setCustomValidity('Please choose rate');
  }
});
