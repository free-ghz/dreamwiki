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
  - page width?
  - curtain width?
  - grime pools
  - open graph stuff
  - port
  - host? do we need it?


# bugs
- sometimes

- doesn't vibe with words longer than 40 chars (might be independently true of all adjustment variants)

- titlecase caps treats composite_links as one word, only capitalizing first letter of whole token

- titlecase caps treats PARTial links as two words, capitalizing it like `PartIal`

- commands _under_ last text row not taken into account (might just be `^secret^`)

## also
transpile should be called "commit"  
og means open graph

## tools
- syntax highlighting for vscode in `tools/node-highlight/dreamwiki`
