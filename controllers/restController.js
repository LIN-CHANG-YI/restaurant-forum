const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
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
        isFavorited: req.user.FavoritedRestaurants.map(restaurant => restaurant.id).includes(r.id)
      }))
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          return res.render('restaurants', { restaurants: data, categories, categoryId, page, totalPage, prev, next })
        })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }] })
      .then(restaurant => {
        restaurant.increment('viewsCount')
          .then(restaurant => {
            return res.render('restaurant', { restaurant: restaurant.toJSON() })
          })
      })
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, limit: 10, include: [Category], order: [['createdAt', 'DESC']] })
      .then(restaurants => {
        Comment.findAll({ raw: true, nest: true, limit: 10, include: [Restaurant, User], order: [['createdAt', 'DESC']] })
          .then(comments => {
            return res.render('feeds', { restaurants, comments })
          })
      })
  },

  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Comment, Category] })
      .then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
  }
}

module.exports = restController