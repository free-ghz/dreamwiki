'use strict'
import express from 'express';
import Transpiler from '../wiki/transpiler.js';

const router = express.Router();
router.route('/!transpiler/').all(async (req, res) => {
  
  let transpiler = new Transpiler();
  await transpiler.parseBooks();

  res.redirect('/!stats/')
})

export default router

