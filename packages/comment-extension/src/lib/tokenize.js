/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { markdownLineEnding } from 'micromark-util-character'
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
export const mystCommentMmarkExt = {
    flow: {
        [codes.percentSign]: {
            name: 'mystComment',
            tokenize: mystCommentTokenize,
        },
    },
}

/** @type {Tokenizer} */
function mystCommentTokenize(effects, ok) {
    return start

    /** @type {State} */
    function start(code) {
        assert(code === codes.percentSign, 'expected `%`')
        effects.enter(tokenTypes.mystComment)
        effects.enter(tokenTypes.mystCommentMarker)
        effects.consume(code)
        effects.exit(tokenTypes.mystCommentMarker)
        return afterMarker
    }

    /** @type {State} */
    function afterMarker(code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(tokenTypes.mystComment)
            return ok(code)
        }

        // Anything else: allow character references and escapes.
        effects.enter(types.chunkString, {
            contentType: constants.contentTypeString,
        })
        return insideValue(code)
    }

    /** @type {State} */
    function insideValue(code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.chunkString)
            effects.exit(tokenTypes.mystComment)
            return ok(code)
        }

        // Anything else.
        effects.consume(code)
        return insideValue
    }
}
