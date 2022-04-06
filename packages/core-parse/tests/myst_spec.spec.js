import * as data from 'myst-spec/dist/myst.tests.json'
import { removePosition } from 'unist-util-remove-position'

import { Processor } from '../src/index.js'

/** @type {{title: string, myst: string, mdast: any}[]} */
const cases = data.default

describe('Test spec cmark_spec', () => {
    test.each(
        cases.filter((value) => {
            return value.title.startsWith('cmark_spec')
        })
    )(`%j`, (data) => {
        const parser = new Processor()
        const result = parser.toAst(data.myst)
        expect(removePosition(result.ast, true)).toEqual(data.mdast)
    })
})
