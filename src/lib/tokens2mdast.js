/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {any} MystTargetNode
 *   mdast node type for mystTarget
 */

// TODO how to properly define the MystTargetNode with JSDoc?

import { tokenTypes } from './constants.js'

/**
 * The MDAST extension, to convert mystTarget tokens to MDAST nodes.
 * @type {FromMarkdownExtension}
 */
export const mystTargetMdastExt = {
    enter: {
        [tokenTypes.mystTarget]: enterMystTarget,
    },
    exit: {
        [tokenTypes.mystTarget]: exitMystTarget,
    },
}

/**
 * @type {FromMarkdownHandle}
 */
function enterMystTarget(token) {
    this.enter(/** @type {MystTargetNode} */ ({ type: 'target' }), token)
    this.buffer()
}

/**
 * @type {FromMarkdownHandle}
 */
function exitMystTarget(token) {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    // @ts-ignore
    node.label = data
    this.exit(token)
}
