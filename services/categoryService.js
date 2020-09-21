const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id, { raw: true, nest: true })
            .then(category => {
              callback({ category, categories })
            }).catch(error => res.sendStatus(404))
        } else {
          callback({ categories })
        }
      }).catch(error => res.sendStatus(404))
  },

  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name: req.body.name
      }).then((category) => {
        callback({ status: 'success', message: "category was successfully created" })
      }).catch(error => res.sendStatus(404))
    }
  },

  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update(req.body)
            .then(category => {
              callback({ status: 'success', message: "category was successfully updated" })
              res.redirect('/admin/categories')
            }).catch(error => res.sendStatus(404))
        }).catch(error => res.sendStatus(404))
    }
  },
}

module.exports = categoryService