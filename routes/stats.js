'use strict'
const router = require('express').Router()

router.route('/!stats/').all(async (req, res) => {
  let bazinga = { allLinks: global.allLinks, allTags: global.allTags, pages: global.completeKeyed }
  bazinga = JSON.stringify(bazinga)
  bazinga = Buffer.from(bazinga, 'binary').toString('base64') 

  let datta = {
    title: 'dw stats',
    layout: 'secret',
    pages: global.complete.length,
    time: global.stats.time,
    time2: global.stats.time2,
    tagReaches: global.stats.tagReaches,
    linksFired: global.stats.linksFired,
    fractions: global.stats.fractions,
    bazinga }

  // we should have processor cycles for ONE sort dontcha think
  let wew = [...global.complete]
  wew.sort((a, b) => {
    return a.incoming - b.incoming // largest one last
  })
  datta.allPages = wew

  res.render('stats.handlebars', datta)
})

module.exports = router
