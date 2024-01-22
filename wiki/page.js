'use strict'

class Page {
    constructor(data) {
        this.title = data.title
        this.filename = data.filename
        this.textRows = data.textRows
        this.commandRows = data.commandRows
        this.tags = data.tags
    }

    static readFromPage(text, filename) {
        let rows = text.split(/\r?\n/)
        let textRows = []
        let commandRows = []
        let rowNumber = 0
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            if (row.startsWith('^')) {
                let rowsplit = row.split('^')
                if (rowsplit.length >= 3) {
                    let command = rowsplit[1].trim()
                    let params = rowsplit[2].trim()
                    commandRows.push({ command, params, row: rowNumber})
                }
                continue
            }

            if (row.length <= 40) {
                textRows.push(row)
                rowNumber += 1
                continue
            }
            
            while (row.length > 40) {
                let reasonableBreakingPlace = row.substr(0, 40).lastIndexOf(' ')
                textRows.push(row.substr(0, reasonableBreakingPlace))
                rowNumber += 1
                row = row.substr(reasonableBreakingPlace + 1) 
            }
            textRows.push(row)
            rowNumber += 1
        }

        let commandData = this.getMetadataFromCommands(commandRows)
        let page = {
            filename,
            textRows,
            commandRows,
            ...commandData
        }

        return new Page(page)
    }

    static getMetadataFromCommands(commands) {
        let title = ""
        let tags = []
        commands.forEach(command => {
            if (command.command === 'title') {
                title = command.params
            } else if (command.command.startsWith('tag')) { // however 'tags' is the sanctioned spelling
                command.params.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0).forEach(tag => tags.push(tag))
            }
        })
        return { title, tags }
    }
}

export default Page