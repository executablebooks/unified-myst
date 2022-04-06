/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 *
 * @typedef {any} MystRoleNode
 *   mdast node type for mystRole
 * @typedef {any} MystRoleNameNode
 *   mdast node type for mystRole name
 * @typedef {any} InlineCodeNode
 */

// TODO how to properly define the MystRoleNode with JSDoc?

import { tokenTypes, nodeTypes } from './constants.js'

/**
 * The MDAST extension, to convert mystRole tokens to MDAST nodes.
 * @type {FromMarkdownExtension}
 */
export const mystRoleMdastExt = {
    enter: {
        [tokenTypes.mystRole]: enterMystRole,
        [tokenTypes.mystRoleName]: enterMystRoleName,
    },
    exit: {
        [tokenTypes.mystRole]: exitMystRole,
        [tokenTypes.mystRoleName]: exitMystRoleName,
    },
}

/**
 * @type {FromMarkdownHandle}
 */
function enterMystRole(token) {
    this.enter(
        /** @type {MystRoleNode} */ ({
            type: nodeTypes.mystRole,
            children: [],
        }),
        token
    )
}

/**
 * @type {FromMarkdownHandle}
 */
function exitMystRole(token) {
    /** @type {MystRoleNode} */
    const node = this.stack[this.stack.length - 1]
    /** @type {object[]} */
    const children = node.children
    // expecting a mystRoleName node, then an inlineCode node
    if (children.length !== 2) {
        throw new Error(
            `Expected 2 children for mystRole, but got ${children.length}`
        )
    }
    /** @type {MystRoleNameNode} */
    const nameNode = children[0]
    /** @type {InlineCodeNode} */
    const codeNode = children[1]
    if (nameNode.type !== nodeTypes.mystRoleName) {
        throw new Error(`Expected mystRoleName node, but got ${nameNode.type}`)
    }
    if (codeNode.type !== 'inlineCode') {
        throw new Error(`Expected inlineCode node, but got ${codeNode.type}`)
    }
    delete node.children
    node.name = nameNode.value
    node.value = codeNode.value
    this.exit(token)
}

/**
 * @type {FromMarkdownHandle}
 */
function enterMystRoleName(token) {
    this.enter(
        /** @type {MystRoleNameNode} */ ({ type: nodeTypes.mystRoleName }),
        token
    )
    this.buffer()
}

/**
 * @type {FromMarkdownHandle}
 */
function exitMystRoleName(token) {
    const name = this.resume()
    const node = this.stack[this.stack.length - 1]
    // @ts-ignore
    node.value = name
    this.exit(token)
}
