/** Resolution of target references in the AST.
 *
 * @typedef {import('../processor').Extension} Extension
 * @typedef {import('../processor').afterReadProcessor} afterReadProcessor
 */
import { ok as assert } from 'uvu/assert'
import { visit, SKIP, CONTINUE, EXIT } from 'unist-util-visit'

import { addMystId } from '../utils.js'

/** @type {Extension} */
export const targetExtension = {
    name: 'target',
    hooks: {
        afterRead: {
            propagateTargets: { priority: 260, processor: propagateTargets },
        },
    },
}

/** Nodes whose children are PhrasingContent */
const phrasingContainers = new Set([
    'paragraph',
    'heading',
    'footnote',
    'tableCell',
    'link',
    'linkReference',
])

// TODO nodes themselves should be able to define whether they are invisible
const invisibleNodes = new Set(['mystTarget', 'mystComment', 'comment'])

/**
 * Propagate target labels to the next viable node.
 * adapts: https://github.com/docutils-mirror/docutils/blob/227684c72ae8fcb37df3c7b26b0bfa2f63b742ef/docutils/transforms/references.py
 *
 * @type {afterReadProcessor}
 */
function propagateTargets(tree, _, __, logger) {
    visit(tree, (node, index, parent) => {
        if (phrasingContainers.has(node.type)) {
            // targets cannot be a child of these nodes, so skip for performance
            return SKIP
        }
        if (node.type !== 'mystTarget') {
            return CONTINUE
        }
        // search recursively for the next node; starting with the next sibling, and searching depth first
        // ignore other targets and "invisible" nodes
        assert(index !== null)
        assert(parent !== null)
        // @ts-ignore
        const label = node.label

        // Find the next sibling, to identifier the label to, ignoring invisible nodes
        while (++index < parent.children.length) {
            const next = parent.children[index]
            if (!invisibleNodes.has(next.type)) {
                // If the next node is a role/directive container, then we should look at its children
                if (next.type === 'mystRole' || next.type === 'mystDirective') {
                    // Note visit is depth-first
                    visit(next, (subNode) => {
                        if (node.type !== 'mystTarget') {
                            return CONTINUE
                        }
                        if (
                            subNode.type !== 'mystRole' &&
                            subNode.type !== 'mystDirective'
                        ) {
                            addMystId(subNode, label)
                            return EXIT
                        }
                    })
                } else {
                    // Otherwise, we can just add the target to the next node
                    addMystId(next, label)
                }
                return CONTINUE
            }
        }
        logger.warning(`No node found to propagate target label to: ${label}`, {
            position: node.position,
            type: 'propagateTargets',
        })
    })
}
