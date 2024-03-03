'use strict'

import { grimerFor, grimeString } from '../lib/grimes.js'
import { curtainsFor } from '../lib/curtains.js'
import { justifierFor } from '../lib/justify.js'
import { capsFor } from '../lib/caps.js'
import colour from '../lib/colour.js'

class Projector {
    constructor(dream, wiki) {
        this.dream = dream
        this.wiki = wiki

        this.secrets = []

        // randomize a default
        this.grimer = grimerFor('stable')
        this.curtains = curtainsFor('random', this.grimer)
        this.justifier = justifierFor('auto')
        this.caps = capsFor('random')
        this.colourScheme = colour.randomScheme()

        // generate the page
        this.render()
    }

    render() {
        for (let row of this.dream.tokens) {
            if (row[0].type === "command") {
                this.runCommandsForRow(row[0])
            } else {
                break
            }
        }
        let output = ""
        let index = 0
        for (let i = 0; i < 5; i++) {
            let curtains = this.curtains(this.grimer)
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`
        }
        for (let row of this.dream.tokens) {
            let disposableCopy = this.createCopy(row)
            if (disposableCopy[0].type === "command") {
                if (index > 0) {
                    this.runCommandsForRow(disposableCopy[0])
                }
                continue
            }

            let curtains = this.curtains(this.grimer)
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += this.decorateRow(disposableCopy)
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`

            index += 1
        }
        for (let i = 0; i < 5; i++) {
            let curtains = this.curtains(this.grimer)
            output += `<span aria-hidden="true" class="grime">${curtains.left}</span> `
            output += ' '.repeat(40)
            output += ` <span aria-hidden="true" class="grime">${curtains.right}</span>\n`
        }

        this.output = output
    }

    createCopy(row) {
        let copy = []
        row.forEach(tokie => {
            copy.push({...tokie})
        })
        return copy
    }

    runCommandsForRow(row) {
        let particles = row.content.split("^")
        if (particles.length < 3) return

        let command = particles[1].trim()
        let params = particles[2].trim()
        if (command === 'grimes') {
            this.grimer = grimerFor(params)
        }
        if (command === 'curtains') {
            this.curtains = curtainsFor(params)
        }
        if (command === 'justify' || command === 'align') {
            this.justifier = justifierFor(params)
        }
        if (command === 'caps') {
            this.caps = capsFor(params)
        }
        if (command === 'colour') {
            this.colourScheme = colour.schemeFromHex(params)
        }
        if (command === 'secret') {
            this.secrets.push(params)
        }
    }

    decorateRow(row) {
        row = this.justifier(row)

        let rowout = ''
        row.forEach(token => {
            if (token.type === 'etc' || token.type === 'whitespace') {
                rowout += token.content
                return
            }
            if (token.type === 'grime') {
                rowout += '<span aria-hidden="true" class="grime">'
                       + grimeString(token.content, this.grimer)
                       + '</span>'
                return
            }

            let wordlink = this.linkExists(token.content, this.dream.fileName)
            let extraAttributesForElement = ''
            let tokenDisplay = token.content.replace(/_/g, ' ')
            tokenDisplay = this.caps(tokenDisplay)
            if (token.type === 'upper') {
                extraAttributesForElement = 'class="link"'
            }
            if (wordlink) {
                rowout += '<a href="' + token.content.toLowerCase() + '/" ' + extraAttributesForElement + '>' + tokenDisplay + '</a>'
            } else {
                rowout += tokenDisplay
            }
        })
        return rowout
    }

    linkExists (word, filename) {
        if (!this.wiki.tagExists(word)) return false
        // can we reach somewhere else than here? (self is returned as last resort)
        if (filename && this.wiki.randomLinkForTag(word, filename) == filename) return false
        return true
    }
}

export default Projector
