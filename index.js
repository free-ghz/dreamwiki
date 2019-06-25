'use strict'
const express = require('express')
const hbars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const porttu = 7004
const fs = require('fs').promises

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/static')))
app.engine('handlebars', hbars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.listen(porttu, () => { console.log('röjar ralf på port', porttu) })

fs.readFile('./static/complete.json', 'utf8').then(text => {
  global.complete = JSON.parse(text)
  console.log('read complete.json')
})
fs.readFile('./static/completeKeyed.json', 'utf8').then(text => {
  global.completeKeyed = JSON.parse(text)
  console.log('read completeKeyed.json')
})
fs.readFile('./static/allLinks.json', 'utf8').then(text => {
  global.allLinks = JSON.parse(text)
  console.log('read allLinks.json')
})
fs.readFile('./static/allTags.json', 'utf8').then(text => {
  global.allTags = JSON.parse(text)
  console.log('read allTags.json')
})
fs.readFile('./static/stats.json', 'utf8').then(text => {
  global.stats = JSON.parse(text)
  console.log('read stats.json')
})

app.use((request, response, next) => {
  // här kan du ha login å sån skittt yo
  next()
})

app.use('/', require('./routes/transpiler.js'))
app.use('/', require('./routes/stats.js'))
app.use('/', require('./routes/primer.js'))
app.use('/', require('./routes/index.js'))

app.use((request, response, next) => {
  response.status(404).send('404 lmao')
})
app.use((e, rq, rs, nx) => {
  if (e) {
    rs.status(500).send('500 lol: ' + e)
  }
})
