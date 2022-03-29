/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
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
export const mystBreakMmarkExt = {
    flow: {
        [codes.plusSign]: {
            name: 'mystBreak',
            tokenize: tokenizeMystBreak,
        },
    },
}

const mystBreakMarkerCountMin = 3

/** @type {Tokenizer} */
function tokenizeMystBreak(effects, ok, nok) {
    let size = 0
    return start

    /** @type {State} */
    function start(code) {
        assert(code === codes.plusSign, 'expected `+`')
        effects.enter(tokenTypes.mystBreak)
        return consumeMarker(code)
    }

    /** @type {State} */
    function consumeMarker(code) {
        if (code === codes.plusSign) {
            effects.enter(tokenTypes.mystBreakMarker)
            return sequence(code)
        }

        if (markdownSpace(code)) {
            return factorySpace(effects, consumeMarker, types.whitespace)(code)
        }

        if (size < mystBreakMarkerCountMin) {
            return nok(code)
        }

        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(tokenTypes.mystBreak)
            return ok(code)
        }

        // start parsing the content of the comment
        effects.enter(types.chunkString, {
            contentType: constants.contentTypeString,
        })
        return consumeContent(code)
    }

    /** @type {State} */
    function sequence(code) {
        if (code === codes.plusSign) {
            effects.consume(code)
            size++
            return sequence
        }
        effects.exit(tokenTypes.mystBreakMarker)
        return consumeMarker(code)
    }

    /** @type {State} */
    function consumeContent(code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.chunkString)
            effects.exit(tokenTypes.mystBreak)
            return ok(code)
        }
        // Consume content of the comment
        effects.consume(code)
        return consumeContent
    }
}
