/**
 * Restaurants.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    restaurants: {type: 'string', required: true},
    id: {type: 'number', required: true},
    name: {type: 'string', required: true},
    neighborhood: {type: 'string'},
    photograph: {type: 'string'},
    address: {type: 'string'},
    latlng: {type: 'number'},
    cuisine_type: {type: 'string'},
    operating_hours: {type: 'string'},
    reviews: {type: 'string'}
  }
};
