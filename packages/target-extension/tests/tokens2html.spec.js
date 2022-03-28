import { micromark } from 'micromark'

import { mystTargetMmarkExt, mystTargetHtmlExt } from '../src/index.js'

const fixtures = [
    '()=',
    '(abc)',
    '(abc)=',
    ' (abc)=',
    '(abc)= ',
    '(a bc)=',
    String.raw`(ab\\c)=`,
    '(abc)= d',
]

describe('Convert source to HTML', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystTargetMmarkExt],
            htmlExtensions: [mystTargetHtmlExt],
        }
        const htmlText = micromark(content, options)
        expect(htmlText).toMatchSnapshot()
    })
})
