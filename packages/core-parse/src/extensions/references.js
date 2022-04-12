/** Extension for handling "standard" references
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { RoleProcessor } from '../roleProcessor.js'
import { normalizeId } from '../utils.js'

const EXPLICIT_PATTERN = /^(.+?)<([^<>]+)>$/ // e.g. 'Labeled Reference <ref>'

/**
 * @param {string} domain
 * @param {string} kind
 */
function createXRefRole(domain, kind) {
    /**
     * Generate a reference node
     *
     * Adapted from https://github.com/sphinx-doc/sphinx/commit/c23835ef0600e3ab30bf285580df960c34ab625f
     */
    return class XRefRole extends RoleProcessor {
        run() {
            const match = EXPLICIT_PATTERN.exec(this.node.value)

            if (match) {
                const explicitText = match[1].trim()
                const target = normalizeId(match[2])

                const node = u(
                    'crossReference',
                    {
                        target,
                        explicit: true,
                        domain,
                        kind,
                        position: this.node.position,
                    },
                    [u('text', { value: explicitText })]
                )
                return [node]
            }

            const target = normalizeId(this.node.value)
            const node = u('crossReference', {
                target,
                explicit: false,
                domain,
                kind,
                position: this.node.position,
            })
            return [node]
        }
    }
}

/** @type {Extension} */
export const stdReferencesExtension = {
    name: 'stdReferences',
    process: {
        mystRoles: {
            ref: { processor: createXRefRole('std', 'ref') },
            'std:ref': { processor: createXRefRole('std', 'ref') },
            numref: { processor: createXRefRole('std', 'numref') },
            'std:numref': { processor: createXRefRole('std', 'numref') },
        },
    },
}
