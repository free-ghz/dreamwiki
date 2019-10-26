'use strict'
const router = require('express').Router()
const fs = require('fs').promises

const helpers = require('../lib/helpers.js')
const choice = helpers.choice
const grimes = require('../lib/grimes.js')
const curtains = require('../lib/curtains.js')
const justify = require('../lib/justify.js')
const colourScheme = require('../lib/colour.js')

router.route('/').all((req, res) => {
  return res.redirect('/welcome.dream/')
})
router.route('/:dreamfile').all(pagefuck)
router.route('/:dreamfile/:link').all((req, res) => {
  if (!linkExists(req.params.link, req.params.dreamfile)) res.redirect('/fourohfour.dream/')
  let desiredPage = findLink(req.params.link, req.params.dreamfile)
  if (desiredPage.match(/^https?:\/\/(.*)/)) {
    // external link
    return res.redirect(desiredPage)
  }
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

  let pagetext = await fs.readFile('./book/' + dreamfile, 'utf8').catch(err => {
    if (err.errno === -2) {
      res.redirect('/fourohfour.dream/')
    } else {
      console.err(err)
      res.status(500).send('500 somehow')
    }
  })
  if (pagetext === undefined) return
  let page = pagemachine(pagetext, dreamfile)
  page.colour = colourScheme()

  return res.render('page.handlebars', page)
}

var grimer = grimes.stableGrimes() // will only be run once per server restart!
function pagemachine (pagetext, filename) {
  grimer = grimes.stableGrimes() // ensures new randomization every time!
  let title = filename
  let secrets = []
  // this all happens by row
  let rows = pagetext.split('\n')
  // fix overflowing lines
  let overflowCollector = []
  for (let i = 0; i < 5; i++) overflowCollector.push('') // five row spacing before every page
  rows.forEach(row => {
    if (row.startsWith('^')) return overflowCollector.push(row) // preserve
    if (row.length <= 40) return overflowCollector.push(row)
    let words = row.split(' ')
    let i = 1
    let newRow = words[0]
    while (i < words.length) {
      if (newRow.length + words[i].length + 1 <= 40) {
        newRow += ' ' + words[i]
      } else {
        overflowCollector.push(newRow)
        newRow = words[i]
      }
      i += 1
    }
    overflowCollector.push(newRow)
  })
  for (let i = 0; i < 5; i++) overflowCollector.push('') // five row spacing after
  rows = overflowCollector

  let output = []
  let curtainCommands = [] // curtains are to be generated afterwards so we should save the commands for em
  let justifier = justify.justifyAuto // default is auto
  let rowNumber = 0
  rows.forEach(row => {
    // console.log('|------------------()------------------|')
    if (row.startsWith('^')) {
      // commands n that
      let rowsplit = row.split('^')
      if (rowsplit.length >= 3) {
        let command = rowsplit[1].trim()
        let argument = rowsplit[2].trim()
        if (command === 'justify' || command === 'align') {
          if (argument === 'center') {
            justifier = justify.justifyCenter
          } else if (argument === 'no' || argument === 'none') {
            justifier = justify.justifyNone
          } else if (argument === 'left') {
            justifier = justify.justifyAutoLeft
          } else if (argument === 'block') {
            justifier = justify.justifyBlock
          } else if (argument === 'random') {
            justifier = choice([justify.justifyBlock, justify.justifyCenter, justify.justifyNone, justify.justifyAutoLeft])
          } else {
            justifier = justify.justifyAuto
          }
        } else if (command === 'grimes') {
          if (argument === 'stable') {
            grimer = grimes.stableGrimes() // create a new instance of a stableGrimer
          } else {
            grimer = grimes.unstableGrimes // same function every time (grimer is a function)
          }
        } else if (command === 'secret') {
          secrets.push(argument)
        } else if (command === 'title') {
          title = argument
        } else if (command === 'curtains' || command === 'curtainGrimes') {
          let skvaller = { rowNumber, command, argument }
          if (skvaller.rowNumber === 5) skvaller.rowNumber = 0 // first row of text is actually the fifth but go off
          curtainCommands.push(skvaller)
        } else if (command === 'tags') {
          // ignored, not useful in this context
        } else {
          // could be known if i have put some weird stuff in there
          console.log(filename, '\t- i donno what to do with ----> \t', command, ':', argument)
        }
      } else {
        // comment
        console.log(row)
      }
      return
    }
    rowNumber += 1 // safe to increase here (before actual row work is done), only really used in commands
    row = justifier(row)
    let tokens = findTokens(row)
    let rowout = ''
    tokens.forEach(token => {
      if (token.type === 'etc') {
        rowout += token.token
        return
      }
      if (token.type === 'grime') {
        rowout += '<span class="grime">' + token.token + '</span>'
        return
      }

      let wordlink = linkExists(token.token, filename)
      let capsOrNot = ''
      let tokenDisplay = token.token.replace(/_/g, ' ').toUpperCase()
      if (token.type === 'uppercase') {
        capsOrNot = 'class="link"'
      }
      if (wordlink) {
        rowout += '<a href="' + token.token.toLowerCase() + '/" ' + capsOrNot + '>' + tokenDisplay + '</a>'
      } else {
        rowout += tokenDisplay
      }
    })
    return output.push(rowout)
  })

  // create curtains
  let outputAck = ''
  rowNumber = 0
  let curtainer = curtains.randomCurtains()
  let curtainGrimer = grimes.randomGrimer()
  output.forEach(row => {
    curtainCommands.forEach(possibleCommand => {
      if (possibleCommand.rowNumber === rowNumber) {
        if (possibleCommand.command === 'curtains') {
          let a = possibleCommand.argument
          if (a === 'none' || a === 'no') {
            curtainer = curtains.noCurtains
          } else if (a === 'glow') {
            curtainer = curtains.glowCurtains
          } else if (a === 'reverseGlow') {
            curtainer = curtains.reversedGlowCurtains
          } else if (a === 'zigzag') {
            curtainer = curtains.zigzagCurtains()
          } else if (a === 'random') {
            curtainer = curtains.randomCurtains()
          } else if (a === 'undefined') {
            curtainer = curtains.undefinedCurtains
          }
        } else if (possibleCommand.command === 'curtainGrimes') {
          if (possibleCommand.argument === 'stable') {
            curtainGrimer = grimes.stableGrimes()
          } else {
            curtainGrimer = grimes.unstableGrimes
          }
        }
      }
    })
    let c = curtainer(curtainGrimer)
    outputAck += '<span class="grime">' + c.left + '</span> ' + row + ' <span class="grime">' + c.right + '</span>\n'
    rowNumber += 1
  })

  output = outputAck // output.join('\n')
  return { output, title, secrets, filename }
}

function linkExists (word, filename) {
  if (!global.allLinks[word.toLowerCase()]) return false
  if (filename && global.allLinks[word.toLowerCase()].length === 1 && global.allLinks[word.toLowerCase()][0] === filename) return false
  return true
}

function findLink (link, verboten) {
  do {
    var desiredPage = choice(global.allLinks[link.toLowerCase()])
  } while (verboten && desiredPage === verboten)
  return desiredPage
}

function findTokens (row) {
  let pos = 0
  let tokens = []
  let ack = ''
  let type = 'nada'
  while (pos < 40) {
    let next = row.substr(pos, 1)
    if (pos === 0) type = tokenType(next)
    if (tokenType(next) !== type && next !== '_') {
      tokens.push({ token: ack, type })
      type = tokenType(next)
      ack = ''
    }
    // ill try to do the grime duty here
    if (type === 'grime') {
      ack += grimer(next)
    } else {
      ack += next
    }
    pos += 1
  }
  tokens.push({ token: ack, type })
  return tokens
}

function tokenType (letter) {
  if (letter.match(/[0-9]/)) return 'grime'
  if (letter.match(/[a-z_]/)) return 'lowercase'
  if (letter.match(/[A-Z_]/)) return 'uppercase'
  return 'etc'
}
