'use strict'
const router = require('express').Router()
const fs = require('fs').promises

router.route('/stats/').all(async (req, res) => {
  // build datasets
  let allIncoming = []
  let allOutgoing = []
  global.complete.forEach(page => {
    page.incoming.forEach(tag => {
      if (!allIncoming.includes(tag)) allIncoming.push(tag)
    })
    page.outgoing.forEach(link => {
      if (!allOutgoing.includes(link)) allOutgoing.push(link)
    })
  })

  // tags, ordered by how many pages use them (in their ^tags^ command)
  let tagReaches = []
  allIncoming.forEach(tag => {
    let reach = 0
    global.complete.forEach(page => {
      if (page.incoming.includes(tag)) reach += 1
    })
    let real = allOutgoing.includes(tag)
    tagReaches.push({ tag, reach, real })
  })
  tagReaches.sort((a, b) => {
    return b.reach - a.reach
  })

  // links, ordered by how many pages are using them (in their text)
  let linksFired = []
  allOutgoing.forEach(link => {
    let intensity = 0
    global.complete.forEach(page => {
      if (page.outgoing.includes(link)) intensity += 1
    })
    let real = allIncoming.includes(link)
    linksFired.push({ link, intensity, real })
  })
  linksFired.sort((a, b) => {
    return b.intensity - a.intensity
  })

  console.log(linksFired)

  let rendertime = '' + global.complete.length + ' pages~'
  if (req.query.time) rendertime += ' took ' + req.query.time + ' mseccs to build'
  res.render('stats.handlebars', { tagReaches, linksFired, rendertime })
})

module.exports = router
