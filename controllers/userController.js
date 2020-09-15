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
          })
        }
      })
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
    const userSelf = req.user.id === Number(req.params.id) ? true : false
    return User.findByPk(req.params.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    })
      .then(user => {
        Comment.findAndCountAll({ raw: true, nest: true, where: { UserId: req.params.id }, include: Restaurant })
          .then(result => {
            // 不重複評論餐廳邏輯
            const restaurantsIdArray = []
            const restaurantsArray = []
            result.rows.forEach(r => {
              if (!restaurantsIdArray.includes(r.RestaurantId)) {
                restaurantsIdArray.push(r.RestaurantId)
                restaurantsArray.push(r)
              }
            })
            //
            const followship = req.user.Followings.map(following => following.id).includes(user.toJSON().id)
            return res.render('userProfile', { profileUser: user.toJSON(), userSelf, followship, comment: restaurantsArray, commentNum: restaurantsIdArray })
          })
      })
  },

  editUser: (req, res) => {
    if (req.user.id !== Number(req.params.id)) {
      req.flash('error_messages', 'Permission denied')
      return res.redirect('back')
    }
    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('editProfile')
      })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
              req.flash('success_messages', 'user was successfully update')
              res.redirect(`/users/${user.id}`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          }).then(user => {
            req.flash('success_messages', 'user was successfully update')
            res.redirect(`/users/${user.id}`)
          })
        })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({ UserId: req.user.id, RestaurantId: req.params.restaurantId })
      .then(restaurant => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({ UserId: req.user.id, RestaurantId: req.params.restaurantId })
      .then(restaurant => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    return Like.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('back')
          })
      })
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
      })
  },

  addFollowing: (req, res) => {
    if (req.user.id === Number(req.params.userId)) {
      req.flash('error_messages', "You can't follow yourself")
      return res.redirect('back')
    } else {
      return Followship.create({ followingId: req.params.userId, followerId: req.user.id })
        .then(followship => {
          return res.redirect('back')
        })
    }

  },

  removeFollowing: (req, res) => {
    return Followship.findOne({ where: { followingId: req.params.userId, followerId: req.user.id } })
      .then(followship => {
        followship.destroy()
          .then(followship => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController