import { u } from 'unist-builder'
import { processRolesDirectives } from '../src/index.js'

/**
 * @param {any} node
 * @param {any} context
 */
function processRoleSimple(node, context) {
    /** @type any */
    const props = { name: node.name }
    if (context.definitions.size) {
        props.definitions = context.definitions
    }
    if (context.footnotes.size) {
        props.footnotes = context.footnotes
    }
    return [u('element', { name: node.name, ...props })]
}
/**
 * @param {any} node
 */
function processRoleNested(node) {
    if (node.name === 'nested') {
        return [u('leaf')]
    }
    return [u('mystRole', { name: 'nested' })]
}

/**
 * @param {any} node
 */
function processDirectiveSimple(node) {
    return u('mystDirective', node)
}

/**
 * @param {any} node
 */
function processDirectiveNested(node) {
    if (node.name === 'nested') {
        return u('mystDirective', node)
    }
    return u('mystDirective', [
        u('code', {
            lang: '{nested}',
            meta: 'argument',
            value: 'content',
        }),
    ])
}

function processDirectiveRole() {
    return u('mystDirective', [u('mystRole', { name: 'name' })])
}

/**
 * @param {any} node
 * @param {any} context
 */
function processDirectiveDefinition(node, context) {
    if (node.name === 'nested') {
        return u('mystDirective', context)
    }
    return u('mystDirective', [
        u('leaf', context),
        u('code', {
            lang: '{nested}',
            meta: 'argument',
            value: 'content',
        }),
        u('definition', { identifier: 'other' }),
    ])
}

/**
 * @param {any} node
 * @param {any} context
 */
function processDirectiveFootnote(node, context) {
    if (node.name === 'nested') {
        return u('mystDirective', context)
    }
    return u('mystDirective', [
        u('leaf', context),
        u('code', {
            lang: '{nested}',
            meta: 'argument',
            value: 'content',
        }),
        u('footnoteDefinition', { identifier: 'other' }),
    ])
}

describe('Process roles', () => {
    test('null', () => {
        const tree = u('root', [u('paragraph', [u('text', 'Hello')])])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('basic', () => {
        const tree = u('root', [
            u('paragraph', [u('mystRole', { name: 'name' })]),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('multiple', () => {
        const tree = u('root', [
            u('paragraph', [
                u('mystRole', { name: 'name1' }),
                u('mystRole', { name: 'name2' }),
            ]),
            u('paragraph', [u('mystRole', { name: 'name3' })]),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('pre-processed', () => {
        const tree = u('root', [
            u('paragraph', [
                u('mystRole', { name: 'name1' }, [u('text', 'Hello')]),
            ]),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('nested', () => {
        const tree = u('root', [
            u('paragraph', [u('mystRole', { name: 'name' })]),
        ])
        processRolesDirectives(tree, processRoleNested, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('definition', () => {
        const tree = u('root', [
            u('paragraph', [u('mystRole', { name: 'name' })]),
            u('definition', { identifier: 'test' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('footnote', () => {
        const tree = u('root', [
            u('paragraph', [u('mystRole', { name: 'name' })]),
            u('footnoteDefinition', { identifier: 'test' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
})

describe('Process directives', () => {
    test('null', () => {
        const tree = u('root', [
            u('code', { lang: 'name', meta: 'argument', value: 'content' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('basic', () => {
        const tree = u('root', [
            u('code', { lang: '{name}', meta: 'argument', value: 'content' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveSimple)
        expect(tree).toMatchSnapshot()
    })
    test('nested', () => {
        const tree = u('root', [
            u('code', { lang: '{name}', meta: 'argument', value: 'content' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveNested)
        expect(tree).toMatchSnapshot()
    })
    test('nested definition', () => {
        const tree = u('root', [
            u('code', { lang: '{name}', meta: 'argument', value: 'content' }),
            u('definition', { identifier: 'test' }),
        ])
        processRolesDirectives(
            tree,
            processRoleSimple,
            processDirectiveDefinition
        )
        expect(tree).toMatchSnapshot()
    })
    test('nested footnote', () => {
        const tree = u('root', [
            u('code', { lang: '{name}', meta: 'argument', value: 'content' }),
            u('footnoteDefinition', { identifier: 'test' }),
        ])
        processRolesDirectives(
            tree,
            processRoleSimple,
            processDirectiveFootnote
        )
        expect(tree).toMatchSnapshot()
    })
    test('role in directive', () => {
        const tree = u('root', [
            u('code', { lang: '{name}', meta: 'argument', value: 'content' }),
        ])
        processRolesDirectives(tree, processRoleSimple, processDirectiveRole)
        expect(tree).toMatchSnapshot()
    })
})
