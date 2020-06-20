'use strict'
const express = require('express')
const hbars = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const porttu = 7004
const fs = require('fs').promises
const Transpiler = require('./wiki/transpiler')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/static')))
app.engine('handlebars', hbars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.listen(porttu, () => { console.log('röjar ralf på port', porttu) })

// Read "offline" storage
const jsonColdStorage = [
  'complete',
  'completeKeyed',
  'allLinks',
  'allTags',
  'stats',
  'todos'
]
let needsUpdate = false
let index = 0
jsonColdStorage.forEach(async (variable) => {
  let filename = `./static/${variable}.json`
  await fs.readFile(filename, 'utf8').then(text => {
    global[variable] = JSON.parse(text)
    console.log(`read ${filename}`)
  }).catch(async err => {
    console.log(`couldn't read ${filename} - it will be created.`)
    needsUpdate = true
  })
  if (needsUpdate && index === jsonColdStorage.length - 1) {
    let transpiler = new Transpiler()
    transpiler.parseBooks()
  }
  index += 1
})

app.use((request, response, next) => {
  console.log(request.url)
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
    console.log(e)
  }
})
