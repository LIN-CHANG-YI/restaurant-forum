const moment = require('moment')

module.exports = {
  ifCond: (item1, item2, options) => {
    return (item1 === item2) ? options.fn(this) : options.inverse(this)
  },

  moment: a => {
    return moment(a).fromNow()
  }
}