const helpers = require('./helpers.js')
const shuffle = helpers.shuffle
const maxSpaces = 4

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
  console.log('`', row, 'zz`', 'z')
  while (row.length < 40) {
    row += ' '
  }
  console.log('´', row, '´\n')
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
  if (row.split(' ').length - 1 > maxSpaces) {
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

module.exports = { justifyCenter, justifyNone, justifyBlock, justifyAuto, justifyAutoLeft }
