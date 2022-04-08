/** Admonitions to visualise programming codes.
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { DirectiveProcessor } from '../directiveProcessor.js'
import { class_option, optional_int, flag, int } from '../directiveOptions.js'

/** Mark up content of a code block
 *
 * Adapted from https://github.com/sphinx-doc/sphinx/blob/e675ad2ec91407d516a51304f6bd7fd683f2371c/sphinx/directives/patches.py
 */
export class CodeDirective extends DirectiveProcessor {
    static required_arguments = 0
    static optional_arguments = 1
    static final_argument_whitespace = false
    static has_content = true
    static option_spec = {
        /** Add line numbers, optionally starting from a particular number. */
        'number-lines': optional_int,
        /** Ignore minor errors on highlighting */
        force: flag,
        name: null,
        class: class_option,
    }
    run() {
        const node = u('code', {
            value: this.node.value,
            position: this.node.position,
        })
        this.addName(node)
        this.addClasses(node)
        if (this.node.args[0]) {
            // @ts-ignore
            node.lang = this.node.args[0]
        }
        if (this.node.options['number-lines']) {
            // @ts-ignore
            node.showLineNumbers = true
            // @ts-ignore
            node.startingLineNumber = this.node.options['number-lines']
        }
        if (this.node.options.force) {
            // @ts-ignore
            node.force = true
        }
        return [node]
    }
}

/** Mark up content of a code block with more settings
 *
 * Adapted from https://github.com/sphinx-doc/sphinx/blob/e675ad2ec91407d516a51304f6bd7fd683f2371c/sphinx/directives/patches.py
 */
export class CodeBlockDirective extends DirectiveProcessor {
    static required_arguments = 0
    static optional_arguments = 1
    static final_argument_whitespace = false
    static has_content = true
    static option_spec = {
        linenos: flag,
        'lineno-start': int,
        // TODO
        dedent: optional_int,
        // TODO
        'emphasize-lines': null,
        caption: null,
        force: flag,
        name: null,
        class: class_option,
    }
    run() {
        let node = u('code', {
            value: this.node.value,
            position: this.node.position,
        })
        if (this.node.args[0]) {
            // @ts-ignore
            node.lang = this.node.args[0]
        }
        if (this.node.options.linenos || this.node.options['lineno-start']) {
            // @ts-ignore
            node.showLineNumbers = true
            if (this.node.options['lineno-start']) {
                // @ts-ignore
                node.startingLineNumber = this.node.options['number-lines']
            }
        }
        if (this.node.options.force) {
            // @ts-ignore
            node.force = true
        }
        this.addClasses(node)
        if (this.node.options.caption) {
            // If there is a caption, we wrap the code and caption within a container
            // classes and identifiers will be added to this container
            const caption = u(
                'caption',
                // TODO position
                {},
                this.nestedParse(this.node.options.caption)
            )
            const container = u(
                'container',
                { kind: 'code', position: this.node.position },
                [caption, node]
            )
            // @ts-ignore
            node = container
        }
        // TODO it would be ideal, if the container could also have classes
        this.addName(node)

        return [node]
    }
}

/** @type {Extension} */
export const highlightExtension = {
    name: 'highlight',
    process: {
        mystDirectives: {
            code: { processor: CodeDirective },
            'code-block': { processor: CodeBlockDirective },
        },
    },
    // TODO add option for default language
}
