/** Mathematics role and directive.
 *
 * Note node naming follows https://github.com/syntax-tree/mdast-util-math
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { RoleProcessor } from '../roleProcessor.js'
import { DirectiveProcessor } from '../directiveProcessor.js'
import { class_option, flag } from '../directiveOptions.js'

class MathRole extends RoleProcessor {
    run() {
        return [
            u(
                'inlineMath',
                { value: this.node.value, position: this.node.position },
                []
            ),
        ]
    }
}

/** Adapted from https://github.com/sphinx-doc/sphinx/blob/e675ad2ec91407d516a51304f6bd7fd683f2371c/sphinx/directives/patches.py
 */
export class MathDirective extends DirectiveProcessor {
    static required_arguments = 0
    static optional_arguments = 0
    static final_argument_whitespace = false
    static has_content = true
    static option_spec = {
        name: null,
        class: class_option,
        nowrap: flag,
        label: null,
    }
    run() {
        const node = u('math', {
            value: this.node.value,
            position: this.node.position,
        })
        this.addClasses(node)
        // label is a duplication of name: https://github.com/sphinx-doc/sphinx/issues/8476
        // but is prioritised by sphinx
        if (this.node.options.label) {
            // TODO is name also set, log warning that we are overriding it
            if (this.node.options.name) {
                this.logger.warning(
                    'name and label are both set, name will be ignored',
                    { type: 'math', position: this.node.position }
                )
            }
            // @ts-ignore
            this.node.options.name = this.node.options.label
        }
        this.addName(node)
        if (this.node.options.nowrap) {
            // @ts-ignore
            node.nowrap = true
        }
        return [node]
    }
}

/** @type {Extension} */
export const mathExtension = {
    name: 'math',
    process: {
        mystRoles: { math: { processor: MathRole } },
        mystDirectives: { math: { processor: MathDirective } },
    },
}
