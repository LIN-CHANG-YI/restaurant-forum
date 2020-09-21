const moment = require('moment')

module.exports = {
  ifCond: function (item1, item2, options) {
    return (item1 === item2) ? options.fn(this) : options.inverse(this)
  },

  moment: function (a) {
    return moment(a).fromNow()
  }
}