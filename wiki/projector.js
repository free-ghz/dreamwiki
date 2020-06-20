'use strict'
const grimes = require('../lib/grimes.js')
const curtains = require('../lib/curtains.js')
const justify = require('../lib/justify.js')

class Projector {
    constructor(page) {
        this.page = page

        this.grimer = grimes.grimerFor('stable')
        this.curtains = curtains.curtainsFor('random', this.grimer)
        this.justifier = justify.justifierFor('center')
    }

    render() {
        let output = ""
        for (let row of this.page.textRows) {
            let curtains = this.curtains(this.grimer)
            output += `<span class="grimes">${curtains.left}</span> `
            output += this.justifier(row) + " "
            output += ` <span class="grimes">${curtains.right}</span>\n`
        }
        return output
    }

    commandsForRow(row) {
        return this.page.commandRows.filter(command => command.row === row)
    }
}

module.exports = Projector