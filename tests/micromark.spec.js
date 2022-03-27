import { parse } from 'micromark/lib/parse'
import { postprocess } from 'micromark/lib/postprocess'
import { preprocess } from 'micromark/lib/preprocess'

import { mystTargetMmarkExt } from '../src/index.js'

describe('Convert source to tokens', () => {
    test.each(['()=', '(abc)=', ' (abc)=', '(abc)= ', '(a bc)='])(
        `%j`,
        (content) => {
            const options = { extensions: [mystTargetMmarkExt] }
            const events = postprocess(
                parse(options)
                    .document()
                    .write(preprocess()(content, 'utf8', true))
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
        }
    )
})
