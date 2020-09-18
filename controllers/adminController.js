const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      }).catch(error => res.sendStatus(404))
  },

  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return res.render('admin/create', { categories })
      }).catch(error => res.sendStatus(404))
  },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
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
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      }).catch(error => res.sendStatus(404))
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true, nest: true, include: [Category] })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant })
      }).catch(error => res.sendStatus(404))
  },

  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id, { raw: true, nest: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant, categories })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
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
            req.flash('success_messages', 'restaurant was successfully to update')
            res.redirect('/admin/restaurants')
          }).catch(error => res.sendStatus(404))
        }).catch(error => res.sendStatus(404))
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            res.redirect('/admin/restaurants')
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  getUsers: (req, res) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        res.render('admin/users', { users })
      }).catch(error => res.sendStatus(404))
  },

  putUsers: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', `root@example.com cannot be changed!`)
          res.redirect('/admin/users')
        } else {
          user.update({ isAdmin: user.isAdmin ? false : true })
            .then(user => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect('/admin/users')
            }).catch(error => res.sendStatus(404))
        }
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = adminController