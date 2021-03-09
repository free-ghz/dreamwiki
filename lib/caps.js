const { choice } = require("./helpers")

function uppercase(text) {
    return text.toUpperCase()
}

function lowercase(text) {
    return text.toLowerCase()
}

function titlecase(text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
}

function dice(text) {
    return text.split("").map(letter => choice([uppercase, lowercase])(letter)).join("")
}

function terezi(text) {
    return uppercase(text).replace('A', '4').replace('E', '3').replace('I', '1')
}

function randomCaps() {
    return choice([uppercase, uppercase, uppercase, lowercase, titlecase, terezi])
}


function capsFor(key) {
    if (key === 'lowercase') return lowercase
    if (key === 'titlecase') return titlecase
    if (key === 'dicecase') return dice
    if (key === 'terezi') return terezi

    if (key === 'random') return randomCaps()

    return uppercase
}

module.exports = { capsFor }