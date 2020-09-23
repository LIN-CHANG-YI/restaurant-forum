const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const pageLimit = 10
const restService = require('../services/restService.js')

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.render('restaurants', data)
    })
  },

  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.render('restaurant', data)
    })
  },

  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.render('feeds', data)
    })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Comment, Category, { model: User, as: 'FavoritedUsers' }] })
      .then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      }).catch(error => res.sendStatus(404))
  },

  getTopRestaurant: (req, res) => {
    Restaurant.findAll({ include: [{ model: User, as: 'FavoritedUsers' }] })
      .then(restaurants => {
        restaurants = restaurants.map(r => ({
          ...r.dataValues,
          description: r.dataValues.description.substring(0, 50),
          FavoriteCount: r.FavoritedUsers.length,
          isFavorited: req.user.FavoritedRestaurants.map(restaurant => restaurant.id).includes(r.id)
        }))
        restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount).slice(0, 10)
        return res.render('topRestaurant', { restaurants })
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = restController