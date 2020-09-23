const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res, callback) => {
    return Comment.create({
      text: req.body.text,
      UserId: req.user.id,
      RestaurantId: req.body.restaurantId
    })
      .then(comment => {
        console.log(comment)
        callback({ status: 'success', message: '', RestaurantId: req.body.restaurantId })
      }).catch(error => res.sendStatus(404))
  },

  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(comment => {
            callback({ status: 'success', message: '', RestaurantId: comment.RestaurantId })
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = commentController