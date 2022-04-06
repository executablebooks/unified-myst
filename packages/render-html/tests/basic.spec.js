import { ProcessorHtml } from '../src/index.js'

describe('Parser', () => {
    test('parse', () => {
        const parser = new ProcessorHtml()
        const result = parser.toHtml('hallo world!')
        expect(result).toMatchSnapshot()
    })
})
