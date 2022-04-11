/** Resolve linkReference by their definitions.
 *
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('../processor').Extension} Extension
 * @typedef {import('../processor').afterReadProcessor} afterReadProcessor
 */
import { ok as assert } from 'uvu/assert'
import { visit, SKIP, CONTINUE } from 'unist-util-visit'
import { u } from 'unist-builder'

/** @type {Extension} */
export const linkReferenceExtension = {
    name: 'target',
    hooks: {
        afterRead: {
            propagateTargets: {
                // TODO re-check priority
                priority: 100,
                processor: resolveLinkReferences,
            },
        },
    },
}

const own = {}.hasOwnProperty

/** Nodes whose children are PhrasingContent */
const phrasingContainers = new Set([
    'paragraph',
    'heading',
    'footnote',
    'tableCell',
    'link',
])

/**
 * @param {string} [value]
 * @returns {string}
 */
function clean(value) {
    return String(value || '').toUpperCase()
}

/**
 * Extract all definitions and replace linkReference with their definitions.
 *
 * @type {afterReadProcessor}
 */
function resolveLinkReferences(tree, _, __, logger) {
    // extract all definitions
    // based on: https://github.com/syntax-tree/mdast-util-definitions
    /** @type {Record<string, Definition>} */
    const cache = Object.create(null)
    visit(tree, (node, index, parent) => {
        if (phrasingContainers.has(node.type)) {
            // definitions cannot be a child of these nodes, so skip for performance
            return SKIP
        }
        if (node.type !== 'definition') {
            return CONTINUE
        }
        /** @type {Definition} */
        // @ts-ignore
        const definition = node
        const id = clean(definition.identifier)
        if (id && !own.call(cache, id)) {
            cache[id] = definition
        } else {
            logger.warning(
                `Duplicate definition identifier: ${definition.identifier}`,
                { position: definition.position, type: 'definition' }
            )
        }
        // remove the definition node
        assert(index !== null)
        assert(parent !== null)
        parent.children.splice(index, 1)
        return index
    })

    /**
     * Get a node from the bound definition-cache.
     *
     * @param {string} identifier
     * @returns {Definition|null}
     */
    function getDefinition(identifier) {
        const id = clean(identifier)
        return id && own.call(cache, id) ? cache[id] : null
    }

    // Replace linkReference with their definitions
    visit(tree, (node, index, parent) => {
        if (node.type !== 'linkReference') {
            return CONTINUE
        }
        /** @type {LinkReference} */
        // @ts-ignore
        const linkReference = node
        const definition = getDefinition(linkReference.identifier)
        if (definition) {
            // replace the linkReference with the definition
            assert(index !== null)
            assert(parent !== null)
            parent.children.splice(
                index,
                1,
                u(
                    'link',
                    {
                        url: definition.url,
                        title: definition.title,
                        position: linkReference.position,
                    },
                    linkReference.children
                )
            )
        } else {
            logger.warning(
                `No definition found for linkReference: ${linkReference.identifier}`,
                { position: linkReference.position, type: 'linkReference' }
            )
            // remove the linkReference node
            assert(index !== null)
            assert(parent !== null)
            parent.children.splice(index, 1)
            return index
        }
        return SKIP
    })
}
