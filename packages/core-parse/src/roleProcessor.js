/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').RawRoleNode} RawRoleNode
 * @typedef {import('@unified-myst/process-roles-directives').ParseContext} ParseContext
 * @typedef {import('@unified-myst/nested-parse').NestedParser} NestedParser
 *
 * @typedef {import('./logger').Logger} Logger
 *
 */

export class RoleProcessor {
    /**
     * @param {RawRoleNode} node
     * @param {ParseContext} context
     * @param {NestedParser} parser
     */
    constructor(node, context, parser) {
        this.node = node
        this.state = context.state
        /** @type {Logger} */
        this.logger = context.logger
        /** @private */
        this.parser = parser
        /** @private */
        this.context = context
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
    nestedInlineParse(text) {
        // TODO create offset position
        return this.parser.parseInline(text, {
            stripPosition: true,
            definitions: [...this.context.definitions],
            footnotes: [...this.context.footnotes],
        })
    }
}
