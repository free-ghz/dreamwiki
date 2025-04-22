import { choice } from "./helpers.js"

function uppercase(text) {
    return text.toUpperCase()
}

function lowercase(text) {
    return text.toLowerCase()
}

function dice(text) {
    return text.split("").map(letter => choice([uppercase, lowercase])(letter)).join("")
}

function terezi(text) {
    return uppercase(text).replaceAll('A', '4').replaceAll('E', '3').replaceAll('I', '1')
}

function randomCaps() {
    return choice([uppercase, uppercase, uppercase, lowercase, terezi])
}


function capsFor(key) {
    if (key === 'lowercase') return lowercase
    if (key === 'dicecase') return dice
    if (key === 'terezi') return terezi

    if (key === 'random') return randomCaps()

    return uppercase
}

export { capsFor }