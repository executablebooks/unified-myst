/**
 * @typedef {import('@unified-myst/core-parse/dist/types/processor').Extension} Extension
 * @typedef {import('mdast').Root} Root
 */
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'
import { Processor } from '@unified-myst/core-parse'

export class ProcessorHtml extends Processor {
    constructor() {
        super()
        /** @private */
        this.htmlHandlers = []
    }
    /** @param {Extension} extension */
    use(extension) {
        super.use(extension)
        // TODO extract HTML specific stuff,
        // i.e. https://github.com/syntax-tree/mdast-util-to-hast#options
        // and https://github.com/syntax-tree/hast-util-to-html#tohtmltree-options
        // Should we "special case" adding an initial extension, which adds all this config
        // Then standard extensions can provide node handlers

        // Perhaps also add a hook, in-between the toHast and toHtml
        // (how do we extend the hooks)
        return this
    }
    /**
     * @param {string | Uint8Array} text
     * @param {Object} [state] the initial global state object, if undefined a new one will be created
     */
    toHtml(text, state) {
        const result = this.toHast(text, state)
        return result.hast ? toHtml(result.hast) : ''
    }
    /**
     * @param {string | Uint8Array} text
     * @param {Object} [state] the initial global state object, if undefined a new one will be created
     */
    toHast(text, state) {
        const result = this.toAst(text, state)
        return this.toHastFromAst(result.ast)
    }
    /** @param {Root} mdast */
    toHastFromAst(mdast) {
        // TODO add options.unknownHandler, which can log warnings
        return { hast: toHast(mdast) }
    }
}
