/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 */

import { tokenTypes } from './constants.js'

/**
 * The mystTarget extension, to convert the syntax tokens to HTML.
 * @type {HtmlExtension}
 */
export const mystTargetHtmlExt = {
    enter: { [tokenTypes.mystTargetString]: enterMystTarget },
    exit: { [tokenTypes.mystTargetString]: exitMystTarget },
}

/**
 * @type {Handle}
 */
function enterMystTarget() {
    this.buffer()
}

/**
 * @type {Handle}
 */
function exitMystTarget() {
    const id = this.encode(this.resume())
    this.tag('<a class="anchor" id="' + id + '" ' + 'href="#' + id + '">')
    this.raw('🔗')
    this.tag('</a>')
}
