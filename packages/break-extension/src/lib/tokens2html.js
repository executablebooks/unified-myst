/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 */

import { tokenTypes } from './constants.js'

/**
 * The micromark HTML extension, to convert mystBreak tokens directly to HTML.
 * @type {HtmlExtension}
 */
export const mystBreakHtmlExt = {
    enter: { [tokenTypes.mystBreak]: enterMystBreak },
    exit: { [tokenTypes.mystBreak]: exitMystBreak },
}

/**
 * @type {Handle}
 */
function enterMystBreak() {
    this.buffer()
}

/**
 * @type {Handle}
 */
function exitMystBreak() {
    this.resume()
    this.lineEndingIfNeeded()
    this.tag('<hr class="myst-break"/>')
}
