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

// must be up here due to the order things are used
var grimeTable = [
  '#', // 0
  '##@',
  '##@@£¶',
  '#@£§&¤', // 3
  '@££$$§%%&*¤',
  '%%§$=†**^', // 5
  '†/\\=;:*^', // 6
  '=~~-«»', // 7
  ':,,.^~-', // 8
  '.,¨' // 9
]

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

  return res.render('page.handlebars', page)
}

var grimer = stableGrimes() // will only be run once per server restart!
function pagemachine (pagetext, filename) {
  grimer = stableGrimes() // ensures new randomization every time!
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
  let justifier = justifyAuto // default is auto
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
            justifier = justifyCenter
          } else if (argument === 'no' || argument === 'none') {
            justifier = justifyNone
          } else if (argument === 'left') {
            justifier = justifyAutoLeft
          } else if (argument === 'random') {
            justifier = choice([justifyBlock, justifyCenter, justifyNone, justifyAutoLeft])
          } else {
            justifier = justifyAuto
          }
        } else if (command === 'grimes') {
          if (argument === 'stable') {
            grimer = stableGrimes() // create a new instance of a stableGrimer
          } else {
            grimer = unstableGrimes // same function every time (grimer is a function)
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
      if (token.type === 'etc') return rowout += token.token
      if (token.type === 'grime') return rowout += '<span class="grime">' + token.token + '</span>'

      let wordlink = linkExists(token.token, filename)
      let capsOrNot = ''
      let tokenDisplay = token.token
      if (token.type === 'uppercase') {
        capsOrNot = 'class="link"'
        tokenDisplay = tokenDisplay.replace(/_/g, ' ')
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
  let curtainGrimer = randomGrimer()
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
            curtainGrimer = stableGrimes()
          } else {
            curtainGrimer = unstableGrimes
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

// center the text on the row, random tiebreaker
function justifyCenter (row) {
  row = row.trim()
  while (row.length < 39) {
    row = ' ' + row + ' '
  }
  if (row.length !== 40) {
    if (Math.random() < 0.5) {
      row = ' ' + row
    } else {
      row += ' '
    }
  }
  return row
}

// dont mess with the text, just add space to the right if needed
function justifyNone (row) {
  while (row.length < 40) {
    row += ' '
  }
  return row
}

// fill spaces randomly until it's 40 wide
function justifyBlock (row) {
  row = row.trim()
  if (row.length === 40) return row
  // find indices of spaces
  let lastspace = 0
  let spaces = []
  do {
    let ind = row.indexOf(' ', lastspace)
    if (ind === -1) {
      break
    }
    spaces.push(ind)
    lastspace = ind + 1
  } while (true)
  // fill em out
  shuffle(spaces)
  let index = 0
  while (row.length < 40) {
    let place = spaces[index]
    // adjust other spaces
    for (let i = 0; i < spaces.length; i++) {
      if (spaces[i] > place) spaces[i] += 1
    }
    row = row.slice(0, place) + ' ' + row.slice(place, row.length)
    index = (index + 1 + spaces.length) % spaces.length
  }
  return row
}

// do center for small rows or block for large ones
function justifyAuto (row) {
  if (row.trim().length > 25) { // arbitrary
    return justifyBlock(row)
  } else {
    return justifyCenter(row)
  }
}

function justifyAutoLeft (row) {
  if (row.trim().length > 25) { // arbitrary
    return justifyBlock(row)
  } else {
    return justifyNone(row)
  }
}

function findTokens (row) {
  let pos = 0
  let tokens = []
  let ack = '' // row.substr(pos, 1)
  let type = 'nada'
  // pos += 0
  while (pos < 40) {
    let next = row.substr(pos, 1)
    if (tokenType(next) === type || pos === 0) {
      if (pos === 0) type = tokenType(next)
      // ill try to do the grime duty here
      if (type === 'grime') {
        ack += grimer(next)
      } else {
        ack += next
      }
    } else {
      tokens.push({ token: ack, type })
      type = tokenType(next)
      if (type === 'grime') {
        ack = grimer(next)
      } else {
        ack = next
      }
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

function shuffle (arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let target = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[target]] = [arr[target], arr[i]]
  }
}

function randomGrimer () {
  return choice([unstableGrimes, stableGrimes()])
}

function unstableGrimes (number) {
  return grimeTable[number].substr(Math.floor(Math.random() * grimeTable[number].length), 1)
}
function stableGrimes () {
  let localTable = []
  for (let i = 0; i < 10; i++) {
    localTable.push(grimeTable[i].substr(Math.floor(Math.random() * grimeTable[i].length), 1))
  }
  return (number) => {
    return localTable[number]
  }
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
    let returnString = grimeString(zag.substr(i, 10), grimer)
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

function grimeString (string, grimer) {
  let out = ''
  for (let i = 0; i < string.length; i++) {
    out += grimer(string.substr(i,1))
  }
  return out
}
