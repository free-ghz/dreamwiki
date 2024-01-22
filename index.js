'use strict'
import express from 'express'
import hbars from 'express-handlebars'
import { join } from 'path'
import { promises as fs } from 'fs'
import Transpiler from './wiki/transpiler.js'
import transpilerRoute from './routes/transpiler.js'
import statsRoute from './routes/stats.js'
import primerRoute from './routes/primer.js'
import indexRoute from './routes/index.js'

const porttu = 7004

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./static'))
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

app.use('/', transpilerRoute)
app.use('/', statsRoute)
app.use('/', primerRoute)
app.use('/', indexRoute)

app.use((request, response, next) => {
  response.status(404).send('404 lmao')
})
app.use((e, rq, rs, nx) => {
  if (e) {
    rs.status(500).send('500 lol: ' + e)
    console.log(e)
  }
})
