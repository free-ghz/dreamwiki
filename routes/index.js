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
  // this all happens by row
  let rows = pagetext.split('\n')
  // fix overflowing lines
  let overflowCollector = []
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
  rows = overflowCollector

  let output = []
  let justifier = justifyAuto // default is auto
  rows.forEach(row => {
    if (row.startsWith('^')) {
      // commands n that
      let rowsplit = row.split('^')
      if (rowsplit.length >= 3) {
        let command = rowsplit[1].trim()
        let argument = rowsplit[2].trim()
        console.log(command, ':', argument)
        if (command === 'justify' || command === 'align') {
          if (argument === 'center') {
            justifier = justifyCenter
          } else if (argument === 'no' || argument === 'none') {
            justifier = justifyNone
          } else {
            justifier = justifyAuto
          }
        }
      } else {
        // comment
        console.log(row)
      }
      return
    }
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
    index += 1
  }
  return row
}

// do center for small rows or block for large ones
function justifyAuto (row) {
  if (row.length > 25) { // arbitrary
    return justifyBlock(row)
  } else {
    return justifyCenter(row)
  }
}

function findTokens (row) {
  let pos = 0
  let tokens = []
  let ack = row.substr(pos, 1)
  let type = tokenType(ack)
  pos += 1
  while (pos < 40) {
    let next = row.substr(pos, 1)
    if (tokenType(next) === type) {
      ack += next
    } else {
      tokens.push({ token: ack, type })
      ack = next
      type = tokenType(next)
    }
    pos += 1
  }
  tokens.push({ token: ack, type })
  return tokens
}

function tokenType (letter) {
  if (letter.match(/[0-9]/)) return 'grime'
  if (letter.match(/[a-z]/)) return 'lowercase'
  if (letter.match(/[A-Z_]/)) return 'uppercase'
  return 'etc'
}

function shuffle (arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let target = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[target]] = [arr[target], arr[i]]
  }
}
