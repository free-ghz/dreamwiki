let grimes = require('./grimes.js')
let helpers = require('./helpers.js')
const choice = helpers.choice

function curtainsFor(key) {
  if (key === 'none' || key === 'no') {
    return noCurtains
  } else if (key === 'glow') {
    return glowCurtains
  } else if (key === 'reverseGlow') {
    return reversedGlowCurtains
  } else if (key === 'zigzag') {
    return zigzagCurtains()
  } else if (key === 'random') {
    return randomCurtains()
  }

  // suits you well
  return undefinedCurtains
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

function undefinedCurtains() {
  return { left: '~undefined', right: 'undefined~' }
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

module.exports = { undefinedCurtains, randomCurtains, glowCurtains, reversedGlowCurtains, noCurtains, zigzagCurtains, curtainsFor }

