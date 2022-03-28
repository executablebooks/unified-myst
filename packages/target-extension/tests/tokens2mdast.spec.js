import { fromMarkdown } from 'mdast-util-from-markdown'

import { mystTargetMmarkExt, mystTargetMdastExt } from '../src/index.js'

const fixtures = [
    '(abc)=',
    ' (abc)=',
    '(abc)= ',
    '(a bc)=',
    String.raw`(ab\\c)=`,
]

describe('Convert source to MDAST', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystTargetMmarkExt],
            mdastExtensions: [mystTargetMdastExt],
        }
        const mdast = fromMarkdown(content, options)
        expect(mdast).toMatchSnapshot()
    })
})
