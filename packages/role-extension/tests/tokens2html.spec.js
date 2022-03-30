import { micromark } from 'micromark'

import { mystRoleMmarkExt, mystRoleHtmlExt } from '../src/index.js'

const fixtures = [
    '{}',
    '{ }',
    '{name}',
    '{name}`',
    '{name} `content`',
    '{}`content`',
    '{ }`content`',
    '{ a}`content`',
    '{name}`content`',
]

describe('Convert source to HTML', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = {
            extensions: [mystRoleMmarkExt],
            htmlExtensions: [mystRoleHtmlExt],
        }
        const htmlText = micromark(content, options)
        expect(htmlText).toMatchSnapshot()
    })
})
