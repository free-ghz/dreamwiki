const helpers = require('./helpers.js')
const choice = helpers.choice

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

function grimeString (string, grimer) {
  let out = ''
  for (let i = 0; i < string.length; i++) {
    out += grimer(string.substr(i, 1))
  }
  return out
}

function grimerFor(key) {
  if (key === 'stable') {
    return stableGrimes() // create a new instance of a stableGrimer
  }
  
  return unstableGrimes // same function every time (grimer is a function)
}

module.exports = { randomGrimer, unstableGrimes, stableGrimes, grimeString, grimerFor }
