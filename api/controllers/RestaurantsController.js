/**
 * RestaurantsController
 *
 * @description :: Server-side logic for managing restaurants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	view: function(req, res) {
    // Restaurants.find({}).exec(function(err, restaurants) {
    //   if (err) {
    //     res.send(500, {error: 'Database Error'});
    //   }
    //   res.view('index', {restaurants:restaurants});
    // });
    res.view('index');
  }
};
