const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id, { raw: true, nest: true })
            .then(category => {
              res.render('admin/categories', { category, categories })
            }).catch(error => res.sendStatus(404))
        } else {
          return res.render('admin/categories', { categories })
        }
      }).catch(error => res.sendStatus(404))
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      }).then((category) => {
        res.redirect('/admin/categories')
      }).catch(error => res.sendStatus(404))
    }
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then(category => {
          category.update(req.body)
            .then(category => {
              res.redirect('/admin/categories')
            }).catch(error => res.sendStatus(404))
        }).catch(error => res.sendStatus(404))
    }
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
          .then(category => {
            res.redirect('/admin/categories')
          }).catch(error => res.sendStatus(404))
      }).catch(error => res.sendStatus(404))
  }
}

module.exports = categoryController