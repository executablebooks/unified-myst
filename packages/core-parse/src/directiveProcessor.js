/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').ParseContext} ParseContext
 * @typedef {import('@unified-myst/nested-parse').NestedParser} NestedParser
 *
 * @typedef {import('./logger').Logger} Logger
 *
 * @typedef DirectiveNode
 * @property {string} type
 * @property {string} name
 * @property {import('@unified-myst/process-roles-directives').Position} [position]
 * @property {string[]} args
 * @property {Record<string, any>} options
 * @property {string} value
 * @property {number} bodyOffset
 *
 */

import { addMystId } from './utils.js'

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
     * @param {{keepPosition?: boolean, offsetLine?: number}} [options]
     */
    nestedParse(text, options) {
        return this.parser.parse(text, {
            stripPosition: !(options?.keepPosition ?? false),
            offsetColumn: (this.node.position?.start?.column ?? 1) - 1,
            offsetLine: options?.offsetLine,
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
     * Add the `class` option (if specified) to the node, as a list of strings.
     * @param {Node} node
     * @param {string[]} [additional] Any additional classes to append
     */
    addClasses(node, additional) {
        const classes = [
            ...(this.node.options.class || []),
            ...(additional || []),
        ]
        if (classes.length > 0) {
            // TODO ensure no whitespace?
            // @ts-ignore
            node.classes = classes
        }
    }

    /**
     * Add the `name` option (if specified) to the node, in a standard format.
     * @param {Node} node
     */
    addName(node) {
        if (this.node.options.name) {
            // @ts-ignore
            node.label = this.node.options.name
            addMystId(node, this.node.options.name)
        }
    }
}
