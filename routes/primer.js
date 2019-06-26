'use strict'
const router = require('express').Router()

router.route('/!primer/').all(async (req, res) => {
  let datta = { layout: 'secret', title: 'dw primer' }
  res.render('primer.handlebars', datta)
})

module.exports = router
