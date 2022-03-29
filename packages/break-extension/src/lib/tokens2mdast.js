/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {any} MystBreakNode
 *   mdast node type for mystBreak
 */

// TODO how to properly define the MystBreakNode with JSDoc?

import { tokenTypes } from './constants.js'

/**
 * The MDAST extension, to convert mystBreak tokens to MDAST nodes.
 * @type {FromMarkdownExtension}
 */
export const mystBreakMdastExt = {
    enter: {
        [tokenTypes.mystBreak]: enterMystBreak,
    },
    exit: {
        [tokenTypes.mystBreak]: exitMystBreak,
    },
}

/**
 * @type {FromMarkdownHandle}
 */
function enterMystBreak(token) {
    this.enter(/** @type {MystBreakNode} */ ({ type: 'mystBreak' }), token)
    this.buffer()
}

/**
 * @type {FromMarkdownHandle}
 */
function exitMystBreak(token) {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    // @ts-ignore
    node.meta = data
    this.exit(token)
}
