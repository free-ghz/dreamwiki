'use strict'
const router = require('express').Router()
const helpers = require('../lib/helpers.js')
const choice = helpers.choice


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
    todos: global.todos,
    bazinga }

  // we should have processor cycles for ONE sort dontcha think
  let wew = [...global.complete]
  wew.sort((a, b) => {
    return a.incoming - b.incoming // largest one last
  })
  datta.allPages = wew

  // counterintuitive names of these two arrays but it checks out. trust me
  let unusedLinks = global.stats.tagReaches.filter(item => !item.real);
  let unusedTags = global.stats.linksFired.filter(item => !item.real);

  let hallucinations = []
  for (let i = 0; i < 5; i++) {
    let item = {
      tags: [],
      links: []
    };
    hallucinations.push(item);
    for (let j = 0; j < 5; j++) {
      item.tags.push(choice(unusedTags).link);
      item.links.push(choice(unusedLinks).tag);
    }
  }
  datta.hallucinations = hallucinations;

  res.render('stats.handlebars', datta)
})

module.exports = router
