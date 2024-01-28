'use strict'
import { getDreamfiles, populateLinks } from "../filereader.js"
import { choice } from '../lib/helpers.js'

console.log('reading dreams from folder...')
let dreams = await getDreamfiles()
console.log(dreams.length, "files.")

// TODO add keys for external links to allTags somehow.
let allTags = dreams.reduce((tags, page) => {
    return new Set([...tags, ...page.tags])
}, new Set())
let sortedTags = [...allTags].sort((a, b) => b.length - a.length)
console.log("found", sortedTags.length, "declared tags.")

console.log("building graph...")
dreams.forEach(dream => tokenize(dream, sortedTags))
dreams.forEach(dream => populateLinks(dream, sortedTags))
let dreamsByFilename = dreams.reduce((dreamMap, dream) => dreamMap.set(dream.fileName, dream), new Map())
let dreamsByTag = new Map()
dreams.forEach(dream => {
    dream.tags.forEach(tag => {
        if (dreamsByTag.has(tag)) {
            dreamsByTag.get(tag).add(dream)
        } else {
            dreamsByTag.set(tag, new Set([dream]))
        }
    })
})


function tagExists(tag) {
    return allTags.has(tag.toLowerCase())
}

// tries to find a link to a page which isn't this one (verboten).
// links to verboten if not possible.
function randomLinkForTag(tag, exclude, verbose) {
    let candidates = [...(dreamsByTag.get(tag.toLowerCase()))].map(dream => dream.fileName)
    if (verbose) console.log("findlink", tag, "from", exclude, "candidates", candidates)
    if (candidates.length === 1 && candidates[0] == exclude) {
        if (verbose) console.log('oroborous link from', exclude, ':', tag)
        return exclude
    }
    do {
        var desiredPage = choice(candidates)
    } while (exclude && desiredPage === exclude)
    return desiredPage
}


function getCharType(char, previousType) {
    if (char == " ") return "whitespace"
    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)) return "grime"
    if (/[a-z]/.test(char)) return "lower"
    if (/[A-Z]/.test(char)) return "upper"
    if (previousType) return previousType
    return "lower" // not ideal, but should work
}

// supposes "tags" param being sorted in some useful fashion (length desc?)
function tokenize(dream, tags) {
    let tokenRows = []
    dream.data.forEach(row => {
        let tokens = []
        let currentType = undefined
        let tokenString = ""
        for (let i = 0; i < row.length; i++) {
            let char = row.substr(i, 1)
            if (char == "^") {
                tokenString = row
                currentType = "command"
                break
            }
            let charType = getCharType(char)
            if (currentType) {
                if (currentType == charType) {
                    tokenString += char
                } else {
                    tokens.push({
                        "type": currentType,
                        "content": tokenString
                    })
                    currentType = charType
                    tokenString = char
                }
            } else {
                currentType = charType
                tokenString = char
            }
        }
        if (row.length == 0) {
            currentType = "newline"
        }
        tokens.push({
            "type": currentType,
            "content": tokenString
        })

        tokenRows.push(tokens.flatMap(token => findLinksRecursive(token, tags)))
    })

    dream.tokens = tokenRows
}

function findLinksRecursive(token, tags) {
    if (token.type != "upper" && token.type != "lower") return [token]

    let tokens = []
    let text = token.content

    let foundTag = undefined
    let tagIndex = -1
    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i]
        tagIndex = text.indexOf(tag)
        if (tagIndex >= 0) {
            foundTag = tag
            break
        }
    }

    if (!foundTag) return [token]

    let before = {
        "type": token.type,
        "content": text.substring(0, tagIndex)
    }
    let after = {
        "type": token.type,
        "content": text.substring(tagIndex + foundTag.length)
    }
    if (before.content.length > 0) {
        let tagsBefore = findLinksRecursive(before, tags)
        tagsBefore.forEach(tag => tokens.push(tag))
    }
    tokens.push({
        "type": "link",
        "content": foundTag
    })
    if (after.content.length > 0) {
        let tagsAfter = findLinksRecursive(after, tags)
        tagsAfter.forEach(tag => tokens.push(tag))
    }

    return tokens
}

export default {
    dreams,
    dreamsByFilename,
    tagExists,
    randomLinkForTag
}