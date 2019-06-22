// i'm gonna add event listeners to like 5000 nodes
let width = document.documentElement.clientWidth
let height = document.documentElement.clientHeight
let body = document.querySelector('body')
let li = document.querySelectorAll('li.page')
let allLinks = bazinga.allLinks // bazinga
let allTags = bazinga.allTags
console.log(allLinks)
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
  link.addEventListener('mousemove', event => {
    if (boxes.length > 0) {
      boxes.forEach(box => {
        let boxSize = boxdims(box, event.clientX, event.clientY)
        box.style.left = boxSize.x + 'px'
        box.style.top = boxSize.y + 'px'
      })
    }
  })
  link.addEventListener('mouseleave', event => {
    if (boxes.length > 0) {
      boxes.forEach(box => {
        body.removeChild(box)
      })
      boxes = []
    }
  })
})
console.log('foreach')

function boxdims (box, mx, my) {
  let space = 10
  let x = mx
  let y = my
  if (mx + box.offsetWidth > width) x = mx - box.offsetWidth - space
  if (my + box.offsetHeight > height) y = height - box.offsetHeight - space - space
  return { x, y }
}

function createBox (link) {
  let actualLink = link.innerHTML.split(' ')[0].trim()
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
