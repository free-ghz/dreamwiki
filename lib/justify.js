import { shuffle, lengthOfRow } from './helpers.js'
const maxSpaces = 4

function justifierFor(key) {
  return justifyCenter

  if (key === 'center') {
    return justifyCenter
  } else if (key === 'no' || key === 'none') {
    return justifyNone
  } else if (key === 'left') {
    return justifyAutoLeft
  } else if (key === 'block') {
    return justifyBlock
  } else if (key === 'random') {
    return choice([justifyBlock, justifyCenter, justifyNone, justifyAutoLeft])
  }
  
  return justifyAuto
}

function trimRow(row) {
  if (row[0].type === "whitespace") {
    row = row.slice(1)
  }
  if (row[row.length-1] === "whitespace") {
    row = row.slice(0, row.length-1)
  }
  return row
}

function whitespaceToken(length) {
  return {
    type: "whitespace",
    content: ' '.repeat(length)
  }
}

// center the text on the row, random tiebreaker
function justifyCenter (row) {
  if (row.length > 1) {
    row = trimRow(row)
  }
  let length = lengthOfRow(row)
  let extraNeeded = Math.floor((40 - length) / 2)

  let modifier = (length % 2) 
  let tiebreaker = Math.random() < 0.5 ? 1 : 0
  let tiebreaker2 = (1 - tiebreaker) * modifier
  tiebreaker = tiebreaker * modifier

  let before = whitespaceToken(extraNeeded + tiebreaker)
  let after = whitespaceToken(extraNeeded + tiebreaker2)
  return [before, ...row, after]
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
  if (spaces.length == 0) {
    return justifyCenter(row)
  }
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

export { justifierFor }
