/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 */

import { tokenTypes } from './constants.js'

/**
 * The micromark HTML extension, to convert mystRole tokens directly to HTML.
 * @type {HtmlExtension}
 */
export const mystRoleHtmlExt = {
    enter: { [tokenTypes.mystRole]: enterMystRole },
    exit: { [tokenTypes.mystRole]: exitMystRole },
}

/**
 * @type {Handle}
 */
function enterMystRole() {
    this.tag('<span class="myst-role">')
}

/**
 * @type {Handle}
 */
function exitMystRole() {
    this.tag('</span>')
}
