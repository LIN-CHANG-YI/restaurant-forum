const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      UserId: req.user.id,
      RestaurantId: req.body.restaurantId
    })
      .then(comment => {
        res.redirect(`/restaurants/${req.body.restaurantId}`)
      }).catch(error => res.sendStatus(404))
  },

  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(comment => {
            res.redirect(`/restaurants/${comment.RestaurantId}`)
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = commentController