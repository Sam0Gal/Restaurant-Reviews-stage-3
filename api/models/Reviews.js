/**
 * Reviews.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    id: {type: 'number', required: true},
    restaurant_id: {type: 'number', required: true},
    name: {type: 'string', required: true},
    rating: {type: 'string', required: true},
    comments: {type: 'string', required: true},
    createdAt: {type: 'number'},
    updatedAt: {type: 'number'},
  }
};
