'use strict'
import express from 'express';
import { promises as fs } from 'fs'

import { choice } from '../lib/helpers.js'
import Page from '../wiki/page.js'
import Projector from '../wiki/projector.js'

const router = express.Router();
router.route('/').all((req, res) => {
  return res.redirect('/welcome.dream/')
})
router.route('/:dreamfile').all(pagefuck)
router.route('/:dreamfile/:link').all((req, res) => {
  if (!linkExists(req.params.link)) res.redirect('/fourohfour.dream/')
  let desiredPage = findLink(req.params.link, req.params.dreamfile)
  if (desiredPage.match(/^https?:\/\/(.*)/)) {
    // external link
    return res.redirect(desiredPage)
  }
  return res.redirect('/' + desiredPage + '/')
})

export default router

async function pagefuck (req, res) {
  if (req.url.includes('..')) return req.next()
  if (req.url.includes('.') && !req.url.includes('.dream')) return req.next()

  // first of all, this is important bc of the url scheme
  if (!req.url.endsWith('/')) return res.redirect(req.url + '/')

  let dreamfile = 'welcome.dream'
  if (req.params.dreamfile) {
    // better security checks here later!
    if (req.params.dreamfile.endsWith('.dream')) {
      dreamfile = req.params.dreamfile
    } else if (linkExists(req.params.dreamfile)) {
      let desiredPage = findLink(req.params.dreamfile)
      return res.redirect('/' + desiredPage + '/')
    } else {
      return res.redirect('/fourohfour.dream/')
    }
  }

  let pagetext = await fs.readFile('./book/' + dreamfile, 'utf8').catch(err => {
    if (err.errno === -2) {
      res.redirect('/fourohfour.dream/')
    } else {
      console.err(err)
      res.status(500).send('500 somehow')
    }
  })
  if (pagetext === undefined) return

  let page = Page.readFromPage(pagetext, dreamfile)
  let projector = new Projector(page)

  let pageData = {
    title: page.title,
    filename: page.filename,
    secrets: projector.secrets,
    output: projector.output,
    colour: projector.colourScheme
  }

  return res.render('page.handlebars', pageData)
}

function linkExists (word) {
  if (!global.allLinks[word.toLowerCase()]) return false
  return true
}

// tries to find a link to a page which isn't this one (verboten).
// links to verboten if not possible.
function findLink (link, verboten) {
  let candidates = global.allLinks[link.toLowerCase()]
  console.log("findlink", link, "from", verboten, "candidates", candidates)
  if (candidates.length === 1 && candidates[0] == verboten) {
    console.log('returning identity!', verboten)
    return verboten
  }
  do {
    var desiredPage = choice(candidates)
  } while (verboten && desiredPage === verboten)
  return desiredPage
}
