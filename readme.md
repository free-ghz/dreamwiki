# dreamwiki
welcome in the thing  
  
garden of associative thought slurry, like so:  .,.-:^¤%¶#  
combined field notes - carefully grown

colourful projector of interlinking pages or index cards or whatever. look in `book/` for examples on what they look like unprocessed

![logo](https://raw.githubusercontent.com/free-ghz/dreamwiki/master/static/drw-smaller-trans.png "logo")

## demo

check it out on https://dreamwiki.sixey.es/

read the official documentation on https://dreamwiki.sixey.es/!primer

# todo
- grimes stable per row?
- 'random' should just give ya a random page instead of going through the tag system
- password protect the "transpiler" or something
- global config
  - ~~page width?~~ no, we are committed to 40. deal! ^^
  - curtain width?
  - grime pools
  - open graph stuff
  - port
  - host? do we need it?
- more alignment modes
  - centered where spaces aren't stripped so you could draw something thats 20 chars wide and it would get padded with 10 on each side regardless of if it contains whitespace or no
  - centered except the two edgemost tokens on each row are flushed to the sides to create like a pipe situation
- stats view
  - have X -> X tags where it appears as tag and link for a single page only, show as both X -> () and () -> X, as in both a tag without a link to it and a link without a receiving tag


# bugs
- sometimes

- doesn't vibe with words longer than 40 chars (might be independently true of all adjustment variants)
- titlecase caps treats composite_links as one word, only capitalizing first letter of whole token
- titlecase caps treats PARTial links as two words, capitalizing it like `PartIal`
- `astral_projectionS` creates the link `stral_projections` instead of `astral_projection`
- tags before the first text rows are output twice. multiple rows like this: ABCABC rather than AABBCC
- terezi only works for first occurence of wovel - AAA becomes 4AA rather than 444

## also
transpile should be called "commit"  
og means open graph

## tools
- syntax highlighting for vscode in `tools/node-highlight/dreamwiki`
