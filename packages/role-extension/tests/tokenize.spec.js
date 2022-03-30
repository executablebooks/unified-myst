import { parse } from 'micromark/lib/parse'
import { postprocess } from 'micromark/lib/postprocess'
import { preprocess } from 'micromark/lib/preprocess'

import { mystRoleMmarkExt } from '../src/index.js'

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

describe('Convert source to tokens', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = { extensions: [mystRoleMmarkExt] }
        const events = postprocess(
            parse(options).document().write(preprocess()(content, 'utf8', true))
        )
        const tokens = events.map((event) => {
            return [
                event[0],
                event[1].type,
                `${event[1].start.line}.${event[1].start.column}`,
                `${event[1].end.line}.${event[1].end.column}`,
            ]
        })
        expect(tokens).toMatchSnapshot()
    })
})
