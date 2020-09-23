const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const pageLimit = 10

const restController = {
  getRestaurants: (req, res, callback) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({ raw: true, nest: true, include: Category, where: whereQuery, offset, limit: pageLimit }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(restaurant => restaurant.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(restaurant => restaurant.id).includes(r.id)
      }))
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          callback({ restaurants: data, categories, categoryId, page, totalPage, prev, next })
        }).catch(error => res.sendStatus(404))
    })
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikedUsers' }] })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(user => user.id).includes(req.user.id)
        const isLiked = restaurant.LikedUsers.map(user => user.id).includes(req.user.id)
        restaurant.increment('viewsCount')
          .then(restaurant => {
            callback({ restaurant: restaurant.toJSON(), isFavorited, isLiked })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  getFeeds: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, limit: 10, include: [Category], order: [['createdAt', 'DESC']] })
      .then(restaurants => {
        Comment.findAll({ raw: true, nest: true, limit: 10, include: [Restaurant, User], order: [['createdAt', 'DESC']] })
          .then(comments => {
            callback({ restaurants, comments })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  getDashboard: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Comment, Category, { model: User, as: 'FavoritedUsers' }] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = restController