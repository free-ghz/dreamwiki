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

export default {
    dreams,
    dreamsByFilename,
    tagExists,
    randomLinkForTag
}