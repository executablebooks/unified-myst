/** Containers for tables.
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { DirectiveProcessor } from '../directiveProcessor.js'
import { class_option } from '../directiveOptions.js'

/** A container for a single (Markdown) table, with an optional caption.
 *
 * Adapted from https://github.com/docutils-mirror/docutils/blob/9649abee47b4ce4db51be1d90fcb1fb500fa78b3/docutils/parsers/rst/directives/tables.py
 */
export class TableDirective extends DirectiveProcessor {
    static required_arguments = 0
    static optional_arguments = 1
    static final_argument_whitespace = true
    static has_content = true
    static option_spec = {
        class: class_option,
        name: null,
    }
    run() {
        // TODO the table directive in docutils is weird because,
        // rather than have a container for the table and caption (as figure is for image),
        // it places the caption as a table child, e.g.
        // <table>
        //     <title>
        //         My title
        //     <tgroup>
        //         ...
        // we diverge from that here, by creating a container for both the table and caption

        const nodes = this.nestedParse(this.node.value)
        if (nodes.length !== 1 || nodes[0].type !== 'table') {
            const error = this.logger.error(
                'Error parsing content block for the "table" directive: exactly one table expected.',
                { position: this.node.position }
            )
            return [error]
        }
        const table = nodes[0]
        const container = u(
            'container',
            { kind: 'table', position: this.node.position },
            [table]
        )
        this.addClasses(container)
        this.addName(container)

        if (this.node.args) {
            const caption = u(
                'caption',
                {},
                this.nestedInlineParse(this.node.args[0])
            )
            // @ts-ignore
            container.children.unshift(caption)
        }
        return [container]
    }
}

/** @type {Extension} */
export const tableExtension = {
    name: 'table',
    process: {
        mystDirectives: {
            table: { processor: TableDirective },
        },
    },
}
