const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app)