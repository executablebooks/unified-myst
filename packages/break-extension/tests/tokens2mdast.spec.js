import { fromMarkdown } from 'mdast-util-from-markdown'

import { mystBreakMmarkExt, mystBreakMdastExt } from '../src/index.js'

const fixtures = [
    '+',
    '+++',
    '+++\n',
    '+++{}',
    '+++{}\n',
    '+++ {"key": "value"}',
]

describe('Convert source to MDAST', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystBreakMmarkExt],
            mdastExtensions: [mystBreakMdastExt],
        }
        const mdast = fromMarkdown(content, options)
        expect(mdast).toMatchSnapshot()
    })
})
