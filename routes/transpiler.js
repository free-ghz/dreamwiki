'use strict'
const router = require('express').Router()
const fs = require('fs').promises

router.route('/!transpiler/').all(async (req, res) => {
  let timeBegin = new Date().getTime()
  let bookContents = await fs.readdir('./book/')
  bookContents = bookContents.filter(filename => { return !filename.startsWith('.') })
  let books = []
  // populate array of page objects which have all the incoming and outgoing links
  bookContents.forEach(fileName => {
    if (!fileName.endsWith('.dream')) return
    books.push(readBook(fileName))
  })
  // fs shit is async, + i didnt get `await Prommis.all(books)` to work?
  Promise.all(books).then(books => {
    // this time we shall cross-reference the pages and see if they link eachother
    // fuckign O(n^4)
    books.forEach(sender => {
      books.forEach(receiver => {
        if (sender !== receiver) {
          sender.outgoing.forEach(link => {
            if (receiver.incoming.has(link)) {
              sender.linksTo.add(receiver.fileName)
              receiver.reachableFrom.add(sender.fileName)
            }
          })
        }
      })
    })

    // convert all the sets to arrays bc thats not in json spec
    let complete = []
    let completeKeyed = {}
    books.forEach(book => {
      let completeBook = {
        title: book.title,
        fileName: book.fileName,
        incoming: Array.from(book.incoming),
        outgoing: Array.from(book.outgoing),
        linksTo: Array.from(book.linksTo),
        reachableFrom: Array.from(book.reachableFrom)
      }
      complete.push(completeBook)
      completeKeyed[book.fileName] = completeBook
    })

    // also want a list with link -> pages for easy lookup
    let allLinks = {}
    complete.forEach(page => {
      page.incoming.forEach(tag => {
        if (allLinks[tag]) {
          allLinks[tag].push(page.fileName)
        } else {
          allLinks[tag] = [page.fileName]
        }
      })
    })

    // ive gotten requests by myself to do this (tag -> list of pages)
    let allTags = {}
    complete.forEach(page => {
      page.outgoing.forEach(tag => {
        if (allTags[tag]) {
          allTags[tag].push(page.fileName)
        } else {
          allTags[tag] = [page.fileName]
        }
      })
    })

    let timeEnd = new Date().getTime()
    let time = timeEnd - timeBegin

    global.complete = complete
    global.completeKeyed = completeKeyed
    global.allLinks = allLinks
    global.allTags = allTags
    fs.writeFile('./static/complete.json', JSON.stringify(complete), 'utf8')
    fs.writeFile('./static/completeKeyed.json', JSON.stringify(completeKeyed), 'utf8')
    fs.writeFile('./static/allLinks.json', JSON.stringify(allLinks), 'utf8')
    fs.writeFile('./static/allTags.json', JSON.stringify(allTags), 'utf8')

    /*
      also build the stats here i guess!
    */

    let allIncoming = []
    let allOutgoing = []
    global.complete.forEach(page => {
      page.incoming.forEach(tag => {
        if (!allIncoming.includes(tag)) allIncoming.push(tag)
      })
      page.outgoing.forEach(link => {
        if (!allOutgoing.includes(link)) allOutgoing.push(link)
      })
    })

    // tags, ordered by how many pages use them (in their ^tags^ command)
    let tagReaches = []
    allIncoming.forEach(tag => {
      let reach = 0
      global.complete.forEach(page => {
        if (page.incoming.includes(tag)) reach += 1
      })
      let real = allOutgoing.includes(tag)
      tagReaches.push({ tag, reach, real })
    })
    tagReaches.sort((a, b) => {
      return b.reach - a.reach
    })

    // links, ordered by how many pages are using them (in their text)
    let linksFired = []
    allOutgoing.forEach(link => {
      let intensity = 0
      global.complete.forEach(page => {
        if (page.outgoing.includes(link)) intensity += 1
      })
      let real = allIncoming.includes(link)
      linksFired.push({ link, intensity, real })
    })
    linksFired.sort((a, b) => {
      return b.intensity - a.intensity
    })

    let timeEnd2 = new Date().getTime()
    let time2 = timeEnd2 - timeEnd

    global.stats = { tagReaches, linksFired, time, time2 }
    fs.writeFile('./static/stats.json', JSON.stringify(global.stats), 'utf8')

    res.redirect('/!stats/')
  })
})

module.exports = router

async function readBook (fileName) {
  let incoming = new Set()
  let outgoing = new Set()
  let content = await fs.readFile('./book/' + fileName, 'utf8')
  let rows = content.split('\n')
  let title = '(undefined)'
  rows.forEach(row => {
    if (row.startsWith('^')) {
      let split = row.split('^')
      if (split[1].includes('tag')) {
        let tagstring = split[2].split(' ')
        tagstring.forEach(tag => {
          if (tag.trim().length > 0) incoming.add(tag.trim())
        })
      } else if (split[1].includes('title')) {
        title = split[2].trim()
      }
    } else {
      let row2 = row.replace(/[^a-zA-Z_]+/g, ' ')
      row2 = row2.replace(/\s+/g, ' ')
      let words = row2.split(' ')
      words.forEach(word => {
        if (word.trim().length === 0) return
        if (word.toLowerCase() === word) {
          outgoing.add(word.toLowerCase())
        } else {
          word = word.replace(/[^A-Z]/, '')
          if (word.trim().length === 0) return
          outgoing.add(word.toLowerCase())
        }
      })
    }
  })
  return { incoming, outgoing, fileName, title, linksTo: new Set(), reachableFrom: new Set() }
}
