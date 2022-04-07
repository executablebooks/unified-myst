/** Mathematics role and directive.
 *
 * Note node naming follows https://github.com/syntax-tree/mdast-util-math
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
        label: null,
        name: null,
        class: class_option,
        nowrap: flag,
    }
    run() {
        const node = u('math', {
            value: this.node.body,
            position: this.node.position,
        })
        this.addClasses(node)
        this.addName(node)
        if (this.node.options.label) {
            // @ts-ignore
            node.label = this.node.options.label
        } else if (this.node.options.name) {
            // @ts-ignore
            node.label = this.node.options.name
        }
        if (this.node.options.nowrap) {
            // @ts-ignore
            node.nowrap = true
        }
        return [node]
    }
}

export const mathExtension = {
    name: 'math',
    /** @type {Record<string, {processor: typeof RoleProcessor}>} */
    roles: { math: { processor: MathRole } },
    /** @type {Record<string, {processor: typeof DirectiveProcessor}>} */
    directives: { math: { processor: MathDirective } },
}
