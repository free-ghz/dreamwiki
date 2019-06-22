'use strict'
const router = require('express').Router()

router.route('/!stats/').all(async (req, res) => {
  let bazinga = { allLinks: global.allLinks, allTags: global.allTags }
  bazinga = JSON.stringify(bazinga)

  let datta = { layout: 'secret',
    pages: global.complete.length,
    time: global.stats.time,
    time2: global.stats.time2,
    tagReaches: global.stats.tagReaches,
    linksFired: global.stats.linksFired,
    bazinga }

  res.render('stats.handlebars', datta)
})

module.exports = router
