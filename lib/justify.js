import { shuffle, lengthOfRow } from './helpers.js'
const maxSpaces = 4

function justifierFor(key) {

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
  let length = lengthOfRow(row)
  if (length < 40) {
    let diff = 40 - length
    return [...row, whitespaceToken(diff)]
  }
  return row
}

// fill spaces randomly until it's 40 wide
function justifyBlock (row) {
  row = trimRow(row)
  if (row.length == 0) return [whitespaceToken(40)]
  if (row.length == 1) {
    return justifyCenter(row)
  }
  
  let length = lengthOfRow(row)
  let diff = 40 - length
  let whitespaces = []
  row.forEach((token, index) => {
    if (token.type === "whitespace") whitespaces.push(index)
  })
  if (whitespaces.length == 0) {
    return justifyCenter(row)
  }

  shuffle(whitespaces)
  for (let i = 0; i < diff; i++) {
    let index = whitespaces[i%whitespaces.length]
    let target = row[index]
    target.content = target.content + " "
  }
  return row
}

// do center for small rows or block for large ones
function justifyAuto (row) {
  if (row.length - 1 > maxSpaces) {
    return justifyBlock(row)
  } else {
    return justifyCenter(row)
  }
}

function justifyAutoLeft (row) {
  let length = lengthOfRow(row)
  if (length > 25) {
    return justifyBlock(row)
  } else {
    return justifyNone(row)
  }
}

export { justifierFor }
