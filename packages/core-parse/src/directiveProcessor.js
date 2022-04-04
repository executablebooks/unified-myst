/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').ParseContext} ParseContext
 * @typedef {import('@unified-myst/nested-parse').NestedParser} NestedParser
 *
 * @typedef DirectiveNode
 * @property {string} type
 * @property {string} name
 * @property {import('@unified-myst/process-roles-directives').Position} [position]
 * @property {string[]} args
 * @property {Record<string, any>} options
 * @property {string} body
 * @property {number} bodyOffset
 *
 */

export class DirectiveProcessor {
    /** The number of required arguments
     * @type {number} */
    static required_arguments = 0
    /** The number of optional arguments
     * @type {number} */
    static optional_arguments = 0
    /** indicate if the final argument may contain whitespace
     * @type {boolean} */
    static final_argument_whitespace = false
    /** @type {boolean} */
    static has_content = false
    /**
     * Mapping specifying each option name and the corresponding conversion function.
     * Option conversion functions take a single parameter, the option argument, validate it and/or convert it to the appropriate form.
     * @type {Record<string,null | ((option: string)=>any)>} */
    static option_spec = {}

    /**
     * @param {DirectiveNode} node
     * @param {ParseContext} context
     * @param {NestedParser} parser
     */
    constructor(node, context, parser) {
        this.node = node
        this.state = context.state
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

    /**
     * Add the name option (if specified) to the node, in a normalized format.
     * @param {Node} node
     */
    addName(node) {
        if (this.node.options.name) {
            const name = `${this.node.options.name}`
                .replace(/\s+/g, ' ')
                .toLowerCase()
            // @ts-ignore
            node.names = [...(node.names || []), name]
        }
    }
}
