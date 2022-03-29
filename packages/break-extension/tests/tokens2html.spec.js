import { micromark } from 'micromark'

import { mystBreakMmarkExt, mystBreakHtmlExt } from '../src/index.js'

const fixtures = [
    '+',
    '+++',
    '+++\n',
    '+++\na',
    '+++{}',
    '+++{}\n',
    '+++ {"key": "value"}',
]

describe('Convert source to HTML', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystBreakMmarkExt],
            htmlExtensions: [mystBreakHtmlExt],
        }
        const htmlText = micromark(content, options)
        expect(htmlText).toMatchSnapshot()
    })
})
