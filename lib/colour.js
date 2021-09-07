let helpers = require('./helpers.js')
const floatBetween = helpers.floatBetween

// hsv here is 360, 1.0, 1.0
function hsvToRgb(h, s, v) {
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

  return [ r, g, b ]
}

function rgbToHsv(r, g, b) {
  r = r/255
  g = g/255
  b = b/255
  let min = Math.min(r, g, b)
  let max = Math.max(r, g, b)
  let v = max
  let delta = max - min
  let h, s = 0

  // darkness is an edge case
  if (max <= 0 || delta < 0.0001) {
    return [0, 0, v]
  }

  s = delta / max
  if (r == max) {
    h = (g - b) / delta
  } else if (g == max) {
    h = 2 + (b - r) / delta
  } else {
    h = 4 + (r - g) / delta
  }

  h *= 60
  if (h < 0) h += 360

  return [h, s, v]
}

function fromHexNotation(hex) {
  if (hex.startsWith('#')) {
    hex = hex.substr(1)
  }
  let r = parseInt(hex.substr(0, 2), 16)
  let g = parseInt(hex.substr(2, 2), 16)
  let b = parseInt(hex.substr(4, 2), 16)
  return [r, g, b]
}


function toHexNotation(r, g, b) {
  r = '00' + Math.floor(r * 255).toString(16)
  r = r.substr(r.length - 2, 2)
  g = '00' + Math.floor(g * 255).toString(16)
  g = g.substr(g.length - 2, 2)
  b = '00' + Math.floor(b * 255).toString(16)
  b = b.substr(b.length - 2, 2)
  return '#' + r + g + b
}

function randomPrimary() {
  // let h = ((Math.random() * 240) + 340) % 360
  let h = ((Math.random() * 200) + 20) % 360
  let s = floatBetween(0.1, 0.4)
  let v = floatBetween(0.6, 0.8)
  return [ h, s, v ]
}

function generateFullScheme(h, s, v) {

  let prim = toHexNotation(...hsvToRgb(h, s, v))

  let hintV = v + 0.6
  if (hintV > 1) hintV = 1
  let hintS = s + 0.3
  if (hintS > 1) hintS = 1
  let hint = toHexNotation(...hsvToRgb((h + 330) % 360, hintS, hintV))

  let grimeV = v - 0.2
  if (grimeV < 0.45) grimeV = 0.45
  let grime = toHexNotation(...hsvToRgb(h, 1, grimeV))

  let wall = toHexNotation(...hsvToRgb((h + 40) % 360, floatBetween(s, 0.4), floatBetween(0.05, 0.2)))

  return { prim, hint, grime, wall }
}

function variation(h, s, v) {
  h += Math.floor(floatBetween(0,40))
  s += floatBetween(0, 0.05)
  v += floatBetween(0, 0.05)
  h = (h + 360) % 360
  s = Math.min(1, Math.max(v, 0))
  v = Math.min(1, Math.max(v, 0))
  return [h, s, v]
}

function randomScheme() {
  return generateFullScheme(...randomPrimary())
}

function schemeFromHex(hex) {
  return generateFullScheme(...variation(...rgbToHsv(...fromHexNotation(hex))))
}

module.exports = { randomScheme, schemeFromHex }
