/** Directives for creating admonitions, also known as call-outs,
 * for including side content without significantly interrupting the document flow.
 */
import { u } from 'unist-builder'

import { class_option } from '../directiveOptions.js'
import { DirectiveProcessor } from '../directiveProcessor.js'

/** Directives for admonition boxes.
 *
 * Adapted from: https://github.com/live-clones/docutils/blob/48bb76093b4ba83654b2f2c86e7c52c4bb39c63b/docutils/docutils/parsers/rst/directives/admonitions.py#L1
 */
export class BaseAdmonition extends DirectiveProcessor {
    static final_argument_whitespace = true
    static has_content = true
    static option_spec = {
        class: class_option,
        name: null,
    }
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = ''
        this.kind = ''
    }
    run() {
        const admonition = u(
            'admonition',
            {
                kind: this.kind,
                class: [...(this.node.options.class || []), 'admonition'],
                position: this.node.position,
            },
            this.nestedParse(this.node.body, {
                keepPosition: true,
                offsetLine: this.node.bodyOffset,
            })
        )
        this.addName(admonition)
        const title = u(
            'title',
            {},
            this.nestedInlineParse(this.node.args[0] || this.title)
        )
        // @ts-ignore
        admonition.children.unshift(title)
        return [admonition]
    }
}

export class Admonition extends BaseAdmonition {
    static required_arguments = 1
}

export class Attention extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Attention'
        this.kind = 'attention'
    }
}

export class Caution extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Caution'
        this.kind = 'caution'
    }
}

export class Danger extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Danger'
        this.kind = 'danger'
    }
}

export class Error extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Error'
        this.kind = 'error'
    }
}

export class Important extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Important'
        this.kind = 'important'
    }
}

export class Hint extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Hint'
        this.kind = 'hint'
    }
}

export class Note extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Note'
        this.kind = 'note'
    }
}

export class SeeAlso extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'See Also'
        this.kind = 'seealso'
    }
}

export class Tip extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Tip'
        this.kind = 'tip'
    }
}

export class Warning extends BaseAdmonition {
    constructor() {
        // @ts-ignore
        super(...arguments)
        this.title = 'Warning'
        this.kind = 'warning'
    }
}

export const admonitionsExtension = {
    name: 'admonitions',
    directives: {
        admonition: { processor: Admonition },
        attention: { processor: Attention },
        caution: { processor: Caution },
        danger: { processor: Danger },
        error: { processor: Error },
        important: { processor: Important },
        hint: { processor: Hint },
        note: { processor: Note },
        seealso: { processor: SeeAlso },
        tip: { processor: Tip },
        warning: { processor: Warning },
    },
}
