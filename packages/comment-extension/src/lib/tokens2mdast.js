/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {any} MystCommentNode
 *   mdast node type for mystComment
 */

// TODO how to properly define the MystCommentNode with JSDoc?

import { tokenTypes } from './constants.js'

/**
 * The MDAST extension, to convert mystComment tokens to MDAST nodes.
 * @type {FromMarkdownExtension}
 */
export const mystCommentMdastExt = {
    enter: {
        [tokenTypes.mystComment]: enterMystComment,
    },
    exit: {
        [tokenTypes.mystComment]: exitMystComment,
    },
}

/**
 * @type {FromMarkdownHandle}
 */
function enterMystComment(token) {
    this.enter(/** @type {MystCommentNode} */ ({ type: 'comment' }), token)
    this.buffer()
}

/**
 * @type {FromMarkdownHandle}
 */
function exitMystComment(token) {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    // @ts-ignore
    node.value = data
    this.exit(token)
}
