import { Processor } from '../src/index.js'
import * as ext from '../src/extensions'

describe('Parser', () => {
    test('parse', () => {
        const parser = new Processor()
        const result = parser.toAst('hallo world!')
        expect(result).toMatchSnapshot()
    })
    test('abbr', () => {
        const parser = new Processor()
            .use(ext.syntaxMystExtension)
            .use(ext.inlineMarkupExtension)
        const result = parser.toAst('{abbr}`CSS (Cascading Style Sheets)`')
        expect(result).toMatchSnapshot()
    })
    test('abbreviation', () => {
        const parser = new Processor()
            .use(ext.syntaxMystExtension)
            .use(ext.inlineMarkupExtension)
        const result = parser.toAst(
            '{abbreviation}`CSS (Cascading Style Sheets)`'
        )
        expect(result).toMatchSnapshot()
    })
})
