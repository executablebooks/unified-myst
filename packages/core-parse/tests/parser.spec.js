import { Processor } from '../src/index.js'

describe('Parser', () => {
    test('parse', () => {
        const parser = new Processor()
        const result = parser.toAst('hallo world!')
        expect(result).toMatchSnapshot()
    })
})
