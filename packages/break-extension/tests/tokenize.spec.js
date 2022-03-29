import { parse } from 'micromark/lib/parse'
import { postprocess } from 'micromark/lib/postprocess'
import { preprocess } from 'micromark/lib/preprocess'

import { mystBreakMmarkExt } from '../src/index.js'

const fixtures = [
    '+',
    '+++',
    '+++\n',
    '+++{}',
    '+++{}\n',
    '+++ {"key": "value"}',
]

describe('Convert source to tokens', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = { extensions: [mystBreakMmarkExt] }
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
