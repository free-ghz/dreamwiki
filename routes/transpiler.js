'use strict'
const router = require('express').Router()
const fs = require('fs').promises


router.route('/transpiler/').all(async (req, res) => {
  let bookContents = await fs.readdir('./book/')
  bookContents = bookContents.filter(filename => { return !filename.startsWith('.') })
  let books = []
  // populate array of page objects which have all the incoming and outgoing links
  bookContents.forEach(fileName => {
    books.push(readBook(fileName))
  })
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

    // also want a 

    res.status(200).send(completeKeyed)
  }) // fs shit is async

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

function findTokens(word) {
  // check if there's manually highlighted stuff
  let uppercase = !(word.toLowerCase() === word)
  // osv. detta va inte vad jag skulle göra idag visar det sig
}
