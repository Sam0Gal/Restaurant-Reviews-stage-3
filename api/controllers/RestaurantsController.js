/**
 * RestaurantsController
 *
 * @description :: Server-side logic for managing restaurants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	view: function(req, res) {
    res.view('index');
  },
  restaurantInfo: function(req, res) {
    res.view('restaurant');
  }
};
