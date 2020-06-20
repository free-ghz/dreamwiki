let helpers = require('./helpers.js')
const floatBetween = helpers.floatBetween

function hsvToRgb (h, s, v) {
  let c = s * v
  let temp = h / 60
  let x = c * (1 - Math.abs((temp % 2) - 1))
  let m = v - c
  
  let r , g, b = 0
  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  r = r + m
  g = g + m
  b = b + m

  return { r, g, b }
}

function toHexNotation (colour) {
  let r = '00' + Math.floor(colour.r * 255).toString(16)
  r = r.substr(r.length - 2, 2)
  let g = '00' + Math.floor(colour.g * 255).toString(16)
  g = g.substr(g.length - 2, 2)
  let b = '00' + Math.floor(colour.b * 255).toString(16)
  b = b.substr(b.length - 2, 2)
  return '#' + r + g + b
}

function getColourScheme () {
  // let h = Math.random() * 360 
  let h = ((Math.random() * 240) + 340) % 360
  let s = floatBetween(0.1, 0.5)
  let v = floatBetween(0.6, 0.8)

  let prim = toHexNotation(hsvToRgb(h, s, v))

  let hintV = v + 0.6
  if (hintV > 1) hintV = 1
  let hintS = s + 0.23
  if (hintS > 1) hintS = 1
  let hint = toHexNotation(hsvToRgb((h + 330) % 360, hintS, hintV))

  let grime = toHexNotation(hsvToRgb(h, 1, v))

  let wall = toHexNotation(hsvToRgb((h + 40) % 360, floatBetween(s, 0.4), floatBetween(0.05, 0.2)))

  return { prim, hint, grime, wall }
}

module.exports = getColourScheme
