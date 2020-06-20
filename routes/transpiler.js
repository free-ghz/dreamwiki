'use strict'
const Transpiler = require('../wiki/transpiler')
const router = require('express').Router()

router.route('/!transpiler/').all(async (req, res) => {
  
  let transpiler = new Transpiler();
  await transpiler.parseBooks();

  res.redirect('/!stats/')
})

module.exports = router

