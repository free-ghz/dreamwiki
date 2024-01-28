'use strict'
import express from 'express';

import Page from '../wiki/page.js'
import Projector from '../wiki/projector.js'

function generateRouter(wiki) {
  const pagefuck = async (req, res) => {
    // first of all, this is important bc of the url scheme
    if (!req.url.endsWith('/')) return res.redirect(req.url + '/')
  
    let dreamfile = 'welcome.dream'
    if (req.params.dreamfile) {
      if (req.params.dreamfile.endsWith('.dream')) {
        dreamfile = req.params.dreamfile
      } else if (wiki.tagExists(req.params.dreamfile)) {
        let desiredPage = wiki.randomLinkForTag(req.params.dreamfile, null, true)
        return res.redirect('/' + desiredPage + '/')
      } else {
        return res.redirect('/fourohfour.dream/')
      }
    }
  
    let pagetext = wiki.dreamsByFilename.get(dreamfile).data;
    if (pagetext === undefined) return
  
    let page = Page.readFromPage(pagetext, dreamfile)
    let projector = new Projector(page, wiki)
  
    let pageData = {
      title: page.title,
      filename: page.filename,
      secrets: projector.secrets,
      output: projector.output,
      colour: projector.colourScheme
    }
  
    return res.render('page.handlebars', pageData)
  }

  const router = express.Router();
  router.route('/').all((req, res) => {
    return res.redirect('/welcome.dream/')
  })
  router.route('/:dreamfile').all(pagefuck)
  router.route('/:dreamfile/:link').all((req, res) => {
    if (!wiki.tagExists(req.params.link)) res.redirect('/fourohfour.dream/')
    let desiredPage = wiki.randomLinkForTag(req.params.link, req.params.dreamfile, true)
    if (desiredPage.match(/^https?:\/\/(.*)/)) {
      // external link
      return res.redirect(desiredPage)
    }
    return res.redirect('/' + desiredPage + '/')
  })

  return router
}

export default generateRouter
