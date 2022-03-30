import { fromMarkdown } from 'mdast-util-from-markdown'

import { mystRoleMmarkExt, mystRoleMdastExt } from '../src/index.js'

const fixtures = ['{name}`content`', '{name}`multi\nline`\n']

describe('Convert source to MDAST', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystRoleMmarkExt],
            mdastExtensions: [mystRoleMdastExt],
        }
        const mdast = fromMarkdown(content, options)
        expect(mdast).toMatchSnapshot()
    })
})
