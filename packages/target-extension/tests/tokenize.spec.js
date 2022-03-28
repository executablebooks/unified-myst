import { parse } from 'micromark/lib/parse'
import { postprocess } from 'micromark/lib/postprocess'
import { preprocess } from 'micromark/lib/preprocess'

import { mystTargetMmarkExt } from '../src/index.js'

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

describe('Convert source to tokens', () => {
    test.each(fixtures)(`%j`, (content) => {
        const options = { extensions: [mystTargetMmarkExt] }
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
