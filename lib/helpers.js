function choice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle (arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let target = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[target]] = [arr[target], arr[i]]
  }
}

function floatBetween (a, b) {
  if (!a) a = 0
  if (!b) b = 1
  return a + ((b - a) * Math.random())
}

function randomBinary (length) {
  let str = ''
  for (let i = 0; i < length; i++) {
    str += (Math.round(Math.random())).toString()
  }
  return str
}

module.exports = { choice, shuffle, floatBetween, randomBinary }
