'use strict'
const router = require('express').Router()
const fs = require('fs').promises

const helpers = require('../lib/helpers.js')
const choice = helpers.choice
const grimes = require('../lib/grimes.js')
const justify = require('../lib/justify.js')

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
      let tokenDisplay = token.token.replace(/_/g, ' ')
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
  let curtainer = randomCurtains()
  let curtainGrimer = grimes.randomGrimer()
  output.forEach(row => {
    curtainCommands.forEach(possibleCommand => {
      if (possibleCommand.rowNumber === rowNumber) {
        if (possibleCommand.command === 'curtains') {
          let a = possibleCommand.argument
          if (a === 'none' || a === 'no') {
            curtainer = noCurtains
          } else if (a === 'glow') {
            curtainer = glowCurtains
          } else if (a === 'reverseGlow') {
            curtainer = reversedGlowCurtains
          } else if (a === 'random') {
            curtainer = randomCurtains()
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
    let curtains = curtainer(curtainGrimer)
    outputAck += '<span class="grime">' + curtains.left + '</span> ' + row + ' <span class="grime">' + curtains.right + '</span>\n'
    rowNumber += 1
  })

  output = outputAck // output.join('\n')
  return { output, title, secrets }
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

function randomCurtains () {
  return choice([glowCurtains, glowCurtains, reversedGlowCurtains, zigzagCurtains(), zigzagCurtains()])
}

function glowCurtains (grimer) {
  let bias = Math.floor(Math.random() * 5) - 1
  let right = ''
  for (let i = 0; i < 10; i++) {
    let digit = i
    if (bias) digit = digit + bias
    if (digit > 9) digit = 9
    if (digit < 0) digit = 0
    if (bias) {
      bias += Math.floor(Math.random() * 3) - 1
      if (bias < -1) bias = -1
    }
    right += '' + grimer(digit)
  }
  let left = right.split('').reverse().join('')
  return { left, right }
}

function reversedGlowCurtains (grimer) {
  let c = glowCurtains(grimer)
  return { left: c.right, right: c.left }
}

function noCurtains () {
  return { left: '          ', right: '          ' }
}

function zigzagCurtains () {
  let min = 11
  let max = 24
  let thisTime = min + Math.floor(Math.random() * (max - min))
  let bias = Math.floor(Math.random() * 3) - 2
  let zag = ''
  for (let i = 0; i < thisTime; i++) {
    let digit = i
    if (bias) digit = digit + bias
    if (digit > 9) digit = 9
    if (digit < 0) digit = 0
    if (bias) {
      bias += Math.floor(Math.random() * 3) - 1
      if (bias < -1) bias = -1
    }
    zag += '' + digit
  }
  zag += zag

  let maxIns = thisTime - 10 // curtains are 10 wide
  let i = Math.floor(Math.random() * maxIns)
  let dir = Math.floor(Math.random() * 2) === 1
  if (i === 0) {
    dir = false
  } else if (i === maxIns) {
    dir = true
  }
  let reversed = Math.floor(Math.random() * 2) === 1
  return (grimer) => {
    let returnString = grimes.grimeString(zag.substr(i, 10), grimer)
    if (dir) {
      i -= 1
      if (i <= 0) dir = false
    } else {
      i += 1
      if (i >= maxIns) dir = true
    }

    let rev = returnString.split('').reverse().join('')
    if (reversed) return { left: rev, right: returnString }
    return { left: returnString, right: rev }
  }
}
