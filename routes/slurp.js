'use strict'
import express from 'express';

function describeDream(dream) {
    let tags = "(" + [...dream.tags].join(" ") + ")"
    let titleName = dream.fileName + "<" + dream.title + ">"
    let arrow = "-->"
    let content = dream.tokens
        .map(row => row
            .map(token => {
                return token.content
            })
            .join("")
        )
        .join("\\n")
    content = "{" + content + "}"

    return tags + " " + arrow + " " + titleName + content
}


function generateRouter(wiki) {
  let a = wiki.dreams.map(describeDream).join("\n")
  const router = express.Router();
  router.route('/!slurp/').all((req, res) => {
    res.end(a)
  })

  return router
}

export default generateRouter
