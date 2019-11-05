'use strict'

// i'm gonna add event listeners to like 5000 nodes
let width = document.documentElement.clientWidth
let height = document.documentElement.clientHeight
let body = document.querySelector('body')
let li = document.querySelectorAll('li')
let allLinks = bazinga.allLinks // bazinga
let allTags = bazinga.allTags
let keyed = bazinga.completeKeyed

// add the little black boxes where we put links later,
// make sure they move when the mouse is moved.
let boxes = []
li.forEach(link => {
  link.addEventListener('mouseenter', event => {
    let box = createBox(link)
    let boxSize = boxdims(box, event.clientX, event.clientY)
    box.style.left = boxSize.x + 'px'
    box.style.top = boxSize.y + 'px'
    body.appendChild(box)
    boxes.push(box)
  })
  // yep, every link on the page listens for mouse movement,
  // and sets every boxes position according to that.
  // should work out if you only hover over one link at a time
  link.addEventListener('mousemove', event => {
    if (boxes.length > 0) {
      boxes.forEach(box => {
        let boxSize = boxdims(box, event.clientX, event.clientY)
        box.style.left = boxSize.x + 'px'
        box.style.top = boxSize.y + 'px'
      })
    }
  })
  // remove every box. there should never be more than one,
  // but you never know.
  link.addEventListener('mouseleave', event => {
    if (boxes.length > 0) {
      boxes.forEach(box => {
        body.removeChild(box)
      })
      boxes = []
    }
  })
})

function boxdims (box, mx, my) {
  let space = 10
  let x = mx
  let y = my
  if (mx + box.offsetWidth > width) x = mx - box.offsetWidth - space
  if (my + box.offsetHeight > height) y = height - box.offsetHeight - space - space
  return { x, y }
}

// decide which box to create depending on what type of
// link thats hovered

function createBox (link) {
    if (link.classList.contains('page')) {
        return createPageBox(link) // for the first four panes (links/tags)
    } else {
        return createFeyBox(link) // for the last pane (pages)
    }
}

function createPageBox (link) {
  let actualLink = link.getAttribute('data-link')
  let box = document.createElement('div')

  if (allTags[actualLink]) {
    let ul = document.createElement('div')
    ul.classList.add('sources')
    allTags[actualLink].forEach(target => {
      let li = document.createElement('span')
      li.innerText = target
      ul.appendChild(li)
    })
    box.appendChild(ul)
  }

  if (allLinks[actualLink]) {
    let ul = document.createElement('div')
    ul.classList.add('targets')
    allLinks[actualLink].forEach(target => {
      let li = document.createElement('span')
      li.innerText = target
      ul.appendChild(li)
    })
    box.appendChild(ul)
  }

  let br = document.createElement('br')
  br.style.clear = 'both'
  box.appendChild(br)
  box.classList.add('bawrks')
  return box
}

// this one might be a lil trickeir
function createFeyBox (link) {
  let pageName = link.getAttribute('data-page')
  let box = document.createElement('div')

  let reachableFrom = bazinga.pages[pageName].reachableFrom
  if (reachableFrom && reachableFrom.length > 0) {
    let ul = document.createElement('div')
    ul.classList.add('sources')
    reachableFrom.forEach(target => {
      let li = document.createElement('span')
      li.innerText = target
      ul.appendChild(li)
    })
    box.appendChild(ul)
  }

  let linksTo = bazinga.pages[pageName].linksTo
  if (linksTo && linksTo.length > 0) {
    let ul = document.createElement('div')
    ul.classList.add('targets')
    linksTo.forEach(target => {
      let li = document.createElement('span')
      li.innerText = target
      ul.appendChild(li)
    })
    box.appendChild(ul)
  }

  let br = document.createElement('br')
  br.style.clear = 'both'
  box.appendChild(br)
  box.classList.add('bawrks')
  return box
}
