'use strict'
const router = require('express').Router()
const fs = require('fs').promises

router.route('/').all((req, res) => {
  return res.redirect('/welcome.dream/')
})
router.route('/:dreamfile').all(pagefuck)
router.route('/:dreamfile/:link').all((req, res) => {
  if (!linkExists(req.params.link, req.params.dreamfile)) res.redirect('/fourohfour.dream/')
  let desiredPage = findLink(req.params.link, req.params.dreamfile)
  return res.redirect('/' + desiredPage + '/')
})

module.exports = router

async function pagefuck (req, res) {
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

  let pagetext = await fs.readFile('./book/' + dreamfile, 'utf8')
  let page = pagemachine(pagetext, dreamfile)

  return res.render('page.handlebars', { page })
}

// 1. fixa spaces (för det behöver en normal tecken count)
// 2. fixa links (för det behöver att texten ser OK ut)
// 3. fixa siffror för det behöver ingenting
//      hur har jag gjort i gamla dw för att undvika fuckups i filnamn med siffror i?

function pagemachine (pagetext, filename) {
  let output = []
  // this all happens by row
  let rows = pagetext.split('\n')
  rows.forEach(row => {
    let rowout = []
    let words = row.split(' ')
    words.forEach(word => {
      if (word.trim().length === 0) return
      let wordlink = linkExists(word, filename)
      if (wordlink) {
        rowout.push('<a href="' + word.toLowerCase() + '">' + word + '</a>')
      } else {
        rowout.push(word)
      }
    })
    output.push(rowout.join(' '))
  })
  output = output.join('\n')
  return output
}

function choice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function linkExists (word, filename) {
  if (!global.allLinks[word.toLowerCase()]) return false
  if (filename && global.allLinks[word.toLowerCase()].length == 1 && global.allLinks[word.toLowerCase()][0] === filename) return false
  return true
}

function findLink (link, verboten) {
  do {
    var desiredPage = choice(global.allLinks[link.toLowerCase()])
  } while (verboten && desiredPage === verboten)
  return desiredPage
}
