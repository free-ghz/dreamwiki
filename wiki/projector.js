'use strict'

const helpers = require('../lib/helpers.js')
const choice = helpers.choice

const grimes = require('../lib/grimes.js')
const curtains = require('../lib/curtains.js')
const justify = require('../lib/justify.js')

class Projector {
    constructor(page) {
        this.page = page

        this.secrets = []

        // randomize a default
        this.grimer = grimes.grimerFor('stable')
        this.curtains = curtains.curtainsFor('random', this.grimer)
        this.justifier = justify.justifierFor('auto')

        // override it if there's something on row 0
        this.runCommandsForRow(0)

        // generate the page
        this.render()
    }

    render() {
        let output = ""
        let index = 0
        for (let i = 0; i < 5; i++) {
            let curtains = this.curtains(this.grimer)
            output += `<span class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span class="grime">${curtains.right}</span>\n`
        }
        for (let row of this.page.textRows) {
            if (index > 0) this.runCommandsForRow(index)

            let curtains = this.curtains(this.grimer)
            output += `<span class="grime">${curtains.left}</span> `
            output += this.decorateRow(this.justifier(row))
            output += ` <span class="grime">${curtains.right}</span>\n`

            index += 1
        }
        for (let i = 0; i < 5; i++) {
            let curtains = this.curtains(this.grimer)
            output += `<span class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span class="grime">${curtains.right}</span>\n`
        }

        this.output = output
    }

    runCommandsForRow(row) {
        this.page.commandRows.filter(command => command.row === row).forEach(command => {
            if (command.command === 'grimes') {
                this.grimer = grimes.grimerFor(command.params)
            }
            if (command.command === 'curtains') {
                this.curtains = curtains.curtainsFor(command.params)
            }
            if (command.command === 'justify' || command.command === 'align') {
                this.justifier = justify.justifierFor(command.params)
            }
            if (command.command === 'secret') {
                this.secrets.push(command.params)
            }
        })
    }

    decorateRow(row) {
        let tokens = this.findTokens(row)
        let rowout = ''
        tokens.forEach(token => {
            if (token.type === 'etc') {
                rowout += token.token
                return
            }
            if (token.type === 'grime') {
                rowout += '<span class="grime">' + token.token + '</span>'
                return
            }

            let wordlink = this.linkExists(token.token, this.page.filename)
            let capsOrNot = ''
            let tokenDisplay = token.token.replace(/_/g, ' ').toUpperCase()
            if (token.type === 'uppercase') {
                capsOrNot = 'class="link"'
            }
            if (wordlink) {
                rowout += '<a href="' + token.token.toLowerCase() + '/" ' + capsOrNot + '>' + tokenDisplay + '</a>'
            } else {
                rowout += tokenDisplay
            }
        })
        return rowout
    }

    findTokens(row) {
        let pos = 0
        let tokens = []
        let ack = ''
        let type = 'nada'
        while (pos < 40) {
            let next = row.substr(pos, 1)
            if (pos === 0) type = this.tokenType(next)
            if (this.tokenType(next) !== type && next !== '_') {
                tokens.push({ token: ack, type })
                type = this.tokenType(next)
                ack = ''
            }
            // ill try to do the grime duty here
            if (type === 'grime') {
                ack += this.grimer(next)
            } else {
                ack += next
            }
            pos += 1
        }
        tokens.push({ token: ack, type })
        return tokens
    }
      
    tokenType(letter) {
        if (letter.match(/[0-9]/)) return 'grime'
        if (letter.match(/[a-z_]/)) return 'lowercase'
        if (letter.match(/[A-Z_]/)) return 'uppercase'
        return 'etc'
    }

    linkExists (word, filename) {
        if (!global.allLinks[word.toLowerCase()]) return false
        if (filename && global.allLinks[word.toLowerCase()].length === 1 && global.allLinks[word.toLowerCase()][0] === filename) return false
        return true
    }
}

module.exports = Projector