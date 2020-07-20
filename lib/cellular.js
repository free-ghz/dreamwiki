
function ruleForInt(ruleNumber) {
    let binary = ruleNumber.toString(2)
    return ("00000000" + binary).slice(-8).split('')
}

function iterate(previous, rule) {
    let output = ''
    for (let i = 0; i < previous.length; i++) {
        let mask = 0;
        if (previous.substr((i + previous.length - 1) % previous.length, 1) == '1') mask += 4
        if (previous.substr(i, 1) == '1') mask += 2
        if (previous.substr((i + previous.length + 1) % previous.length, 1) == '1') mask += 1
        output += rule[mask].toString()
    }
    return output
}

// lookup table for what to give to the grimer. automata uses 0 or 1 for state, so we can use an array here
// with a number in the 0th and 1st positions.
function translate(input, table) {
    let output = ''
    for (let i = 0; i < input.length; i++) {
        output += table[parseInt(input.substr(i, 1))].toString()
    }
    return output
}

module.exports = { ruleForInt, iterate, translate }