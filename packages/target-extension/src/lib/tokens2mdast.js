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
    this.enter(/** @type {MystTargetNode} */ ({ type: 'mystTarget' }), token)
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
    // @ts-ignore
    node.identifier = normalizeId(data)
    this.exit(token)
}

/** Return a case- and whitespace-normalized name.
 * @param {string} label
 * @returns {string}
 */
function normalizeId(label) {
    return `${label}`.replace(/\s+/g, ' ').trim().toLowerCase()
}
