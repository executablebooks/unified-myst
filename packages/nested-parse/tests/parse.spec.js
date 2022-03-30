import { NestedParser } from '../src/index.js'

const fixtures = ['a', '- a', '[a]: b']

describe('Parse block text', () => {
    test.each(fixtures)(`%j`, (content) => {
        const parser = new NestedParser()
        const nodes = parser.parse(content)
        expect(nodes).toMatchSnapshot()
    })
})

const fixturesInline = ['a', '- a']

describe('Parse inline text', () => {
    test.each(fixturesInline)(`%j`, (content) => {
        const parser = new NestedParser()
        const nodes = parser.parseInline(content)
        expect(nodes).toMatchSnapshot()
    })
})

describe('Parse strip position', () => {
    test('block', () => {
        const parser = new NestedParser()
        const nodes = parser.parse('a\n> b', { stripPosition: true })
        expect(nodes).toMatchSnapshot()
    })

    test('inline', () => {
        const parser = new NestedParser()
        const nodes = parser.parseInline('a\nb', { stripPosition: true })
        expect(nodes).toMatchSnapshot()
    })
})

describe('Parse with offsets', () => {
    test('block', () => {
        const parser = new NestedParser()
        const nodes = parser.parse('a\n> b', { offsetLine: 2, offsetColumn: 3 })
        expect(nodes).toMatchSnapshot()
    })

    test('inline', () => {
        const parser = new NestedParser()
        const nodes = parser.parseInline('a\nb', {
            offsetLine: 2,
            offsetColumn: 3,
        })
        expect(nodes).toMatchSnapshot()
    })
})
