'use strict'
import express from 'express'
import { engine } from 'express-handlebars'
import transpilerRoute from './routes/transpiler.js'
import statsRoute from './routes/stats.js'
import primerRoute from './routes/primer.js'
import indexRoute from './routes/index.js'
import slurpRoute from './routes/slurp.js'
import wiki from './wiki/wiki.js'

const porttu = 7004

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./static'))
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.listen(porttu, () => { console.log('röjar ralf på port', porttu) })

app.use((request, response, next) => {
  console.log(request.url)
  // här kan du ha login å sån skittt yo
  next()
})

app.use('/', transpilerRoute)
app.use('/', statsRoute)
app.use('/', primerRoute)
app.use('/', slurpRoute(wiki))
app.use('/', indexRoute(wiki))

app.use((request, response, next) => {
  response.status(404).send('404 lmao')
})
app.use((e, rq, rs, nx) => {
  if (e) {
    rs.status(500).send('500 lol: ' + e)
    console.log(e)
  }
})
