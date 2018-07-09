/**
 * Restaurants.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {type: 'number', required: true},
    name: {type: 'string', required: true},
    neighborhood: {type: 'string'},
    photograph: {type: 'string'},
    address: {type: 'string'},
    latlng: {type: 'number'},
    cuisine_type: {type: 'string'},
    operating_hours: {type: 'string'},
    is_favorite: {type: 'boolean', required: true},
    reviews: {type: 'array'}  // review is an array of objects.
  }
};
