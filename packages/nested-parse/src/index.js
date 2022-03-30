/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-util-types').Encoding} Encoding
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').ParseContext} ParseContext
 * @typedef {import('mdtoken-to-mdast').Options} Options
 * @typedef {import("micromark-util-types").Value} Value
 *
 * @typedef {(events: Event[]) => Root} Compiler
 * @typedef {Object} ParseOptions
 * @property {Encoding} [encoding="utf8"] - The encoding of the text
 * @property {boolean} [stripPosition] - Strip the position information from all generated nodes
 * @property {number} [offsetLine] - Apply a line offset to the position of all generated nodes
 * @property {number} [offsetColumn] - Apply a column offset to the position of all generated nodes
 *
 */
import { compiler } from 'mdtoken-to-mdast'
import { parse } from 'micromark/lib/parse'
import { postprocess } from 'micromark/lib/postprocess'
import { preprocess } from 'micromark/lib/preprocess'
import { visit } from 'unist-util-visit'

/**
 * A compiler for converting a token stream to an AST.
 */
export class NestedParser {
    /**
     * @param {Options} [options]
     */
    constructor(options) {
        /** @type {Options} */
        this.options = options || {}
        this.options.extensions = this.options.extensions || []
        // TODO remove/disable frontmatter plugin!
        /** @type {Compiler} */
        this.compiler = compiler(this.options)
    }

    /**
     * @param {Value} text
     * @param {ParseOptions} options
     * @returns {Content[]}
     */
    parse(text, options = {}) {
        if (!text) {
            return []
        }
        // TODO setting up definitions/footnotes
        // TODO allow for disabling headings construct
        const parser = parse(this.options)
        const events = postprocess(
            parser
                .document()
                .write(preprocess()(text, options.encoding || 'utf8', true))
        )
        const node = this.compiler(events)
        // TODO perhaps some per-node key that to identify it was nested parsed
        if (options.stripPosition) {
            visit(node, stripPositions)
        } else if (
            options.offsetLine !== undefined ||
            options.offsetColumn !== undefined
        ) {
            visit(
                node,
                offsetPositions(options.offsetLine, options.offsetColumn)
            )
        }
        return node.children
    }

    /**
     * @param {Value} text
     * @param {ParseOptions} options
     * @returns {PhrasingContent[]}
     */
    parseInline(text, options = {}) {
        if (!text) {
            return []
        }
        // TODO setting up definitions/footnotes
        const parser = parse(this.options)
        let events = postprocess(
            parser
                .text()
                .write(preprocess()(text, options.encoding || 'utf8', true))
        )
        // the compiler expects a list of events from a document parse
        // So we must wrap it in a paragraph token
        const paragraphToken = {
            type: 'paragraph',
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
        }
        events = [
            // @ts-ignore
            ['enter', paragraphToken, {}],
            // @ts-ignore
            ...events,
            // @ts-ignore
            ['exit', paragraphToken, {}],
        ]
        const node = this.compiler(events)
        // TODO perhaps some per-node key that to identify it was nested parsed
        if (options.stripPosition) {
            visit(node, stripPositions)
        } else if (
            options.offsetLine !== undefined ||
            options.offsetColumn !== undefined
        ) {
            // TODO how to deal with column offsetting when parsing of role content, which contains new lines?
            // maybe something like a separate offsetInitialLineColumn option here
            visit(
                node,
                offsetPositions(options.offsetLine, options.offsetColumn)
            )
        }
        // @ts-ignore
        return node.children[0].children
    }
}

/**
 * @param {Node} node
 */
function stripPositions(node) {
    delete node.position
}

/**
 * Create a node visitor for offsetting the positions of nodes in a source document.
 * @param {number} [offsetLine]
 * @param {number} [offsetColumn]
 */
function offsetPositions(offsetLine, offsetColumn) {
    const _offsetLine = offsetLine || 0
    const _offsetColumn = offsetColumn || 0
    return func
    /**
     * @param {Node} node
     */
    function func(node) {
        if (node.position) {
            node.position.start.line += _offsetLine
            node.position.start.column += _offsetColumn
            delete node.position.start.offset
            node.position.end.line += _offsetLine
            node.position.end.column += _offsetColumn
            delete node.position.end.offset
        }
    }
}
