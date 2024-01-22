'use strict'

import { grimerFor } from '../lib/grimes.js'
import { curtainsFor } from '../lib/curtains.js'
import { justifierFor } from '../lib/justify.js'
import { capsFor } from '../lib/caps.js'
import colour from '../lib/colour.js'

class Projector {
    constructor(page, wiki) {
        this.page = page
        this.wiki = wiki

        this.secrets = []

        // randomize a default
        this.grimer = grimerFor('stable')
        this.curtains = curtainsFor('random', this.grimer)
        this.justifier = justifierFor('auto')
        this.caps = capsFor('random')
        this.colourScheme = colour.randomScheme()

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
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`
        }
        for (let row of this.page.textRows) {
            this.runCommandsForRow(index)

            let curtains = this.curtains(this.grimer)
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += this.decorateRow(this.justifier(row))
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`

            index += 1
        }
        this.runCommandsForRow(this.page.textRows.length) // stray tags after last text row
        for (let i = 0; i < 5; i++) {
            let curtains = this.curtains(this.grimer)
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`
        }

        this.output = output
    }

    runCommandsForRow(row) {
        this.page.commandRows.filter(command => command.row === row).forEach(command => {
            if (command.command === 'grimes') {
                this.grimer = grimerFor(command.params)
            }
            if (command.command === 'curtains') {
                this.curtains = curtainsFor(command.params)
            }
            if (command.command === 'justify' || command.command === 'align') {
                this.justifier = justifierFor(command.params)
            }
            if (command.command === 'caps') {
                this.caps = capsFor(command.params)
            }
            if (command.command === 'colour') {
                this.colourScheme = colour.schemeFromHex(command.params)
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
                rowout += '<span aria-hidden="true" class="grime">' + token.token + '</span>'
                return
            }

            let wordlink = this.linkExists(token.token, this.page.filename)
            let capsOrNot = ''
            let tokenDisplay = token.token.replace(/_/g, ' ')
            tokenDisplay = this.caps(tokenDisplay)
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
        if (!this.wiki.tagExists(word)) return false
        // can we reach somewhere else than here? (self is returned as last resort)
        if (filename && this.wiki.randomLinkForTag(word, filename) == filename) return false
        return true
    }
}

export default Projector
