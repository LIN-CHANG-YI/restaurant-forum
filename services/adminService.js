const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        callback({ restaurants })
      }).catch(error => res.sendStatus(404))
  },

  createRestaurant: (req, res, callback) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        callback({ categories })
      }).catch(error => res.sendStatus(404))
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      .then(restaurant => {
        callback({ restaurant })
      }).catch(error => res.sendStatus(404))
  },

  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        }).catch(error => res.sendStatus(404))
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        callback({ status: 'success', message: 'restaurant was successfully created' })
      }).catch(error => res.sendStatus(404))
    }
  },

  editRestaurant: (req, res, callback) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
          .then(restaurant => {
            callback({ restaurant, categories })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            }).then((restaurant) => {
              callback({ status: 'success', message: 'restaurant was successfully to update' })
            }).catch(error => res.sendStatus(404))
          }).catch(error => res.sendStatus(404))
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            callback({ status: 'success', message: 'restaurant was successfully to update' })
          }).catch(error => res.sendStatus(404))
        }).catch(error => res.sendStatus(404))
    }
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        callback({ users })
      }).catch(error => res.sendStatus(404))
  },

  putUsers: (req, res, callback) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        if (user.email === 'root@example.com') {
          callback({ status: 'error', message: 'root@example.com cannot be changed!' })
        } else {
          user.update({ isAdmin: user.isAdmin ? false : true })
            .then(user => {
              callback({ status: 'success', message: 'user was successfully to update' })
            }).catch(error => res.sendStatus(404))
        }
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = adminService