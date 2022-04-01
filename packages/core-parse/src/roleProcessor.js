/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').RawRoleNode} RawRoleNode
 * @typedef {import('@unified-myst/process-roles-directives').ParseContext} ParseContext
 * @typedef {import('@unified-myst/nested-parse').NestedParser} NestedParser
 *
 */

export class RoleProcessor {
    /**
     * @param {RawRoleNode} role
     * @param {ParseContext} context
     * @param {NestedParser} parser
     */
    constructor(role, context, parser) {
        this.role = role
        this.context = context
        this.parser = parser
    }
    /**
     * @abstract
     * @returns {Node[]}
     */
    run() {
        throw new Error('must be implemented by subclass!')
    }

    /**
     * @param {string | Uint8Array} text
     */
    nestedParse(text) {
        // TODO create offset position
        return this.parser.parseInline(text, {
            stripPosition: true,
            definitions: [...this.context.definitions],
            footnotes: [...this.context.footnotes],
        })
    }
}
