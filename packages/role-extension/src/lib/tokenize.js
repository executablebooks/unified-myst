/**
 * @typedef {import('micromark-util-types').Code} Code
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { codeText } from 'micromark-core-commonmark'
import { codes } from 'micromark-util-symbol/codes.js'
import { constants } from 'micromark-util-symbol/constants.js'
import { types } from 'micromark-util-symbol/types.js'
import { ok as assert } from 'uvu/assert'

import { tokenTypes } from './constants.js'

/**
 * The micromark extension, to parse the source syntax to events.
 * Events are token enter/exits, which in-turn are references to slices of the source text.
 *
 * @type {Extension}
 */
export const mystRoleMmarkExt = {
    text: {
        [codes.leftCurlyBrace]: {
            name: 'mystRole',
            tokenize: tokenizeMystRole,
        },
    },
}

const nameCharRegex = /[a-zA-Z0-9_.\-+:]/

/**
 * Check whether a code matches the bound regex.
 *
 * @param {Code} code Character code
 * @returns {code is number} Whether the character code matches the bound regex
 */
function checkNameChar(code) {
    return code !== null && nameCharRegex.test(String.fromCharCode(code))
}

/** @type {Tokenizer} */
function tokenizeMystRole(effects, ok, nok) {
    let emptyName = true
    return start

    /** @type {State} */
    function start(code) {
        assert(code === codes.leftCurlyBrace, 'expected `{`')
        effects.enter(tokenTypes.mystRole)
        effects.enter(tokenTypes.mystRoleMarker)
        effects.consume(code)
        effects.exit(tokenTypes.mystRoleMarker)
        return afterOpen
    }

    /** @type {State} */
    function afterOpen(code) {
        if (!checkNameChar(code)) {
            return nok(code)
        }
        effects.enter(tokenTypes.mystRoleName)
        effects.enter(types.chunkString, {
            contentType: constants.contentTypeString,
        })
        return consumeName(code)
    }

    /** @type {State} */
    function consumeName(code) {
        if (code === codes.rightCurlyBrace) {
            if (emptyName) {
                return nok(code)
            }
            effects.exit(types.chunkString)
            effects.exit(tokenTypes.mystRoleName)
            effects.enter(tokenTypes.mystRoleMarker)
            effects.consume(code)
            effects.exit(tokenTypes.mystRoleMarker)
            return effects.attempt(codeText, closeRole, nok)
        }

        if (!checkNameChar(code)) {
            return nok(code)
        }

        effects.consume(code)
        emptyName = false
        return consumeName
    }

    /** @type {State} */
    function closeRole(code) {
        effects.exit(tokenTypes.mystRole)
        return ok(code)
    }
}
