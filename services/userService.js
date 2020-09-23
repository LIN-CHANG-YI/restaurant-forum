const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  getUser: (req, res, callback) => {
    const userSelf = req.user.id === Number(req.params.id) ? true : false
    return User.findByPk(req.params.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
      .then(user => {
        Comment.findAll({ raw: true, nest: true, where: { UserId: req.params.id }, include: Restaurant, order: [['createdAt', 'DESC']] })
          .then(comments => {
            // 不重複評論餐廳邏輯
            const ids = new Set()
            commentsArray = []
            comments.forEach(r => {
              if (!ids.has(r.RestaurantId)) {
                ids.add(r.RestaurantId)
                commentsArray.push(r)
              }
            })
            //
            const followship = req.user.Followings.map(following => following.id).includes(user.toJSON().id)
            callback({ profileUser: user.toJSON(), userSelf, followship, comments: commentsArray })
          }).catch(error => res.sendStatus(404))
      })
  },

  editUser: (req, res, callback) => {
    if (req.user.id !== Number(req.params.id)) {
      callback({ status: 'error', message: 'Permission denied' })
    }
    return User.findByPk(req.params.id)
      .then(user => {
        callback({ status: 'success', message: '' })
      }).catch(error => res.sendStatus(404))
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : null
            }).then(user => {
              callback({ status: 'success', message: 'user was successfully update' })
            }).catch(error => res.sendStatus(404))
          }).catch(error => res.sendStatus(404))
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          }).then(user => {
            callback({ status: 'success', message: 'user was successfully update' })
          }).catch(error => res.sendStatus(404))
        }).catch(error => res.sendStatus(404))
    }
  }
}

module.exports = userController