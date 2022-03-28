import { fromMarkdown } from 'mdast-util-from-markdown'

import { mystCommentMmarkExt, mystCommentMdastExt } from '../src/index.js'

const fixtures = ['%', '% ', '% abc', '% abc\n% def']

describe('Convert source to MDAST', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystCommentMmarkExt],
            mdastExtensions: [mystCommentMdastExt],
        }
        const mdast = fromMarkdown(content, options)
        expect(mdast).toMatchSnapshot()
    })
})
