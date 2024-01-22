'use strict'
import { promises as fs } from 'fs'

// find .dream-files and read them into a basic object.
async function getDreamfiles() {
    let dreams = await fs.readdir('./book/')
    dreams = dreams.filter(filename => { return filename.endsWith('.dream') })
    dreams = await Promise.all(dreams.map(dream => readBook(dream)))
    return dreams
}

// given a filename, read that file and separate out simple metadata.
async function readBook(fileName) {
    let tags = new Set()
    let title = '(undefined)'

    let content = await fs.readFile('./book/' + fileName, 'utf8')
    let rows = content.split('\n')
    rows.forEach(row => {
        if (row.startsWith('^')) {
            let split = row.split('^')
            if (split[1].includes('tag')) {
                let tagstring = split[2].split(' ')
                tagstring.forEach(tag => {
                    if (tag.trim().length > 0) tags.add(tag.trim())
                })
            } else if (split[1].includes('title')) {
                title = split[2].trim()
            }
        }
    })
    return {
        fileName,
        title,
        tags,
        data: rows
    }
}

// supposes "tags" param being sorted in some useful fashion (length desc?)
// TODO this doesn't not find partial links. doesn't -> doe
function populateLinks(dream, tags) {
    let links = new Set()

    let data = dream.data.filter(row => !row.startsWith("^")).join(" ").toLowerCase()
    tags.forEach(tag => {
        var tagIndex = data.indexOf(tag)
        if (tagIndex === -1) return
        links.add(tag)
        while(tagIndex >= 0) {
            data = data.substring(0, tagIndex) + data.substring(tagIndex + tag.length)
            tagIndex = data.indexOf(tag)
        }
    })
    dream.links = links
}

export { getDreamfiles, populateLinks }