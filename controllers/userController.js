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
const userService = require('../services/userService.js')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          }).catch(error => res.sendStatus(404))
        }
      }).catch(error => res.sendStatus(404))
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('userProfile', data)
    })
  },

  editUser: (req, res) => {
    userService.editUser(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      return res.render('editProfile')
    })
  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.redirect(`/users/${req.params.id}`)
    })
  },

  addFavorite: (req, res) => {
    return Favorite.findOrCreate({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        return res.redirect('back')
      }).catch(error => res.sendStatus(404))
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        if (!restaurant) {
          req.flash('error_messages', '已移除收藏')
          return res.redirect('back')
        }
        return restaurant.destroy()
          .then(restaurant => {
            res.redirect('back')
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  addLike: (req, res) => {
    return Like.findOrCreate({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        return res.redirect('back')
      }).catch(error => res.sendStatus(404))
  },

  removeLike: (req, res) => {
    return Like.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        if (!restaurant) {
          req.flash('error_messages', '已許消喜歡')
          return res.redirect('back')
        }
        return restaurant.destroy()
          .then(restaurant => {
            res.redirect('back')
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  },

  getTopUser: (req, res) => {
    User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(following => following.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users })
      }).catch(error => res.sendStatus(404))
  },

  addFollowing: (req, res) => {
    if (req.user.id === Number(req.params.userId)) {
      req.flash('error_messages', "You can't follow yourself")
      return res.redirect('back')
    } else {
      return Followship.create({ followingId: req.params.userId, followerId: req.user.id })
        .then(followship => {
          return res.redirect('back')
        }).catch(error => res.sendStatus(404))
    }
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({ where: { followingId: req.params.userId, followerId: req.user.id } })
      .then(followship => {
        followship.destroy()
          .then(followship => {
            return res.redirect('back')
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = userController