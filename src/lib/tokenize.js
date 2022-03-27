/**
 * The micromark extension, to parse the source syntax to events.
 * Events are token enter/exits, which in-turn are references to slices of the source text.
 *
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { factorySpace } from 'micromark-factory-space'
import { codes } from 'micromark-util-symbol/codes.js'
import { constants } from 'micromark-util-symbol/constants.js'
import { types } from 'micromark-util-symbol/types.js'
import { ok as assert } from 'uvu/assert'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { tokenTypes } from './constants.js'

/**
 * The mystTarget extension, to parse the source syntax to events.
 * @type {Extension}
 */
export const mystTargetMmarkExt = {
    flow: {
        [codes.leftParenthesis]: {
            name: 'mystTarget',
            tokenize: mystTargetTokenize,
        },
    },
}

/** @type {Tokenizer} */
function mystTargetTokenize(effects, ok, nok) {
    /**
     * Check if non-whitespace is found between the parentheses.
     * @type {boolean}
     */
    let data
    return start

    /** @type {State} */
    function start(code) {
        assert(code === codes.leftParenthesis, 'expected `(`')
        effects.enter(tokenTypes.mystTarget)
        effects.enter(tokenTypes.mystTargetMarker)
        effects.consume(code)
        effects.exit(tokenTypes.mystTargetMarker)
        effects.enter(tokenTypes.mystTargetString)
        return atBreak
    }

    /** @type {State} */
    function atBreak(code) {
        if (
            code === codes.eof ||
            markdownLineEnding(code) ||
            (code === codes.rightParenthesis && !data)
            // TODO max size?
        ) {
            return nok(code)
        }

        if (code === codes.rightParenthesis) {
            effects.exit(tokenTypes.mystTargetString)
            effects.enter(tokenTypes.mystTargetMarker)
            effects.consume(code)
            return closingEquals
        }

        effects.enter(types.chunkString, {
            contentType: constants.contentTypeString,
        })
        return label(code)
    }

    /** @type {State} */
    function label(code) {
        if (
            code === codes.eof ||
            code === codes.rightParenthesis ||
            markdownLineEnding(code)
            // TODO max size?
        ) {
            effects.exit(types.chunkString)
            return atBreak(code)
        }

        effects.consume(code)
        data = data || !markdownSpace(code)
        return code === codes.backslash ? labelEscape : label
    }

    /** @type {State} */
    function labelEscape(code) {
        if (code === codes.backslash || code === codes.rightParenthesis) {
            effects.consume(code)
            return label
        }
        return label(code)
    }

    /**
     * Parse the final `=`
     * @type {State}
     */
    function closingEquals(code) {
        if (code !== codes.equalsTo) {
            return nok(code)
        }
        effects.consume(code)
        effects.exit(tokenTypes.mystTargetMarker)
        return factorySpace(effects, end, types.whitespace)
    }

    /**
     * Close the mystTarget, if no additional non-whitespace is found.
     * @type {State}
     */
    function end(code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(tokenTypes.mystTarget)
            return ok(code)
        }
        return nok(code)
    }
}
