/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').RawDirectiveNode} RawDirectiveNode
 * @typedef {import('@unified-myst/process-roles-directives').ParseContext} ParseContext
 * @typedef {import('@unified-myst/nested-parse').NestedParser} NestedParser
 *
 */

export class DirectiveProcessor {
    /** @type {number} */
    static required_arguments = 0
    /** @type {number} */
    static optional_arguments = 0
    /** @type {boolean} */
    static final_argument_whitespace = false
    /** @type {boolean} */
    static has_content = false
    /** @type {Record<string,any>} */
    static option_spec = {}

    /**
     * @param {RawDirectiveNode} node
     * @param {ParseContext} context
     * @param {NestedParser} parser
     */
    constructor(node, context, parser) {
        this.node = node
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
        return this.parser.parse(text, {
            stripPosition: true,
            definitions: [...this.context.definitions],
            footnotes: [...this.context.footnotes],
        })
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
