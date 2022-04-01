import { Parser } from '../src/index.js'

describe('Parser', () => {
    test('parse', () => {
        const parser = new Parser()
        const ast = parser.toAst('hallo world!')
        expect(ast).toMatchSnapshot()
    })
})
