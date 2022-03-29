/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 */

import { tokenTypes } from './constants.js'

/**
 * The micromark HTML extension, to convert mystComment tokens directly to HTML.
 * @type {HtmlExtension}
 */
export const mystCommentHtmlExt = {
    enter: { [tokenTypes.mystComment]: enterMystComment },
    exit: { [tokenTypes.mystComment]: exitMystComment },
}

/**
 * @type {Handle}
 */
function enterMystComment() {
    this.buffer()
}

/**
 * @type {Handle}
 */
function exitMystComment() {
    const content = this.encode(this.resume())
    this.tag('<!-- ')
    this.raw(content.trim())
    this.tag(' -->')
}
