import { grimeString } from './grimes.js'
import { choice, randomBinary } from './helpers.js'
import cellular from './cellular.js'

function curtainsFor(key) {
  if (key === 'none' || key === 'no') {
    return noCurtains
  } else if (key === 'glow') {
    return glowCurtains
  } else if (key === 'reverseGlow') {
    return reversedGlowCurtains
  } else if (key === 'zigzag') {
    return zigzagCurtains()
  } else if (key === 'automata') {
    return cellularCurtains()
  } else if (key === 'random') {
    return randomCurtains()
  } else if (key === 'stars') {
    return stars
  } else if (key === 'undefined') {
    return undefinedCurtains
  }

  return customCurtains(key)
}

function randomCurtains () {
  return choice([glowCurtains, reversedGlowCurtains, zigzagCurtains(), zigzagCurtains(), cellularCurtains(), cellularCurtains()])
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

function cellularCurtains() {
  let ruleNumber = choice([60, 102, 99, 26, 129]) // nice rules for 1D automata
  let rule = cellular.ruleForInt(ruleNumber)
  let length = 40 + 2 + 20 // text area + padding + curtain width
  let state = randomBinary(length) // start seed
  return (grimer) => {
    state = cellular.iterate(state, rule)
    let dreamified = cellular.translate(state, [9, 3])
    return {
      left: grimeString(dreamified.slice(0, 10), grimer),
      right: grimeString(dreamified.slice(-10), grimer)
    }
  }
}

function stars(grimer) {
  return {
    left: starPane(grimer),
    right: starPane(grimer)
  }
}

function starPane(grimer) {
  let doStar = Math.random() < 0.2;
  if (!doStar) return "          ";
  let star = "          " + grimeString(choice(["5", "8", "9", "9", "9"]), grimer) + "          "
  let starPos = Math.round(Math.random() * 10)
  return star.substring(starPos, starPos+10)
}

function customCurtains(design) {
  var left;
  var right;
  let split = design.split(" ")
  if (split.length == 1) {
    right = design
    left = design.split('').reverse().join('')
  } else {
    right = split[1]
    left = split[0]
  }
  left = left.replace(/\./g, ' ')
  right = right.replace(/\./g, ' ')
  left = "          " + left;
  left = left.substring(left.length - 10);
  right = (right + "          ").substring(0, 10);

  return (grimer) => {
    left = grime(left, grimer)
    right = grime(right, grimer)
    return {left, right}
  }
}

// this sucks
var numberRegex = /^[0-9]+$/
function grime(string, grimer) {
  return string.split('').map(letter => {
    if (letter.match(numberRegex) != null) return grimeString(letter, grimer)
    return letter
  }).join('')
}

export { curtainsFor }

