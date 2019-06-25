function choice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle (arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let target = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[target]] = [arr[target], arr[i]]
  }
}

module.exports = { choice, shuffle }
