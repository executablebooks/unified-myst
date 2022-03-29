/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { factorySpace } from 'micromark-factory-space'
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
            tokenize: tokenizeMystComment,
        },
    },
}

/** @type {Construct} */
const nextLine = { tokenize: tokenizeNextLine, partial: true }

/** @type {Tokenizer} */
function tokenizeMystComment(effects, ok) {
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
        if (code === codes.eof) {
            return finalise(code)
        }

        if (markdownLineEnding(code)) {
            return effects.attempt(nextLine, afterMarker, finalise)
        }

        // start parsing the content of the comment
        effects.enter(types.chunkString, {
            contentType: constants.contentTypeString,
        })
        return insideContent(code)
    }

    /** @type {State} */
    function insideContent(code) {
        if (code === codes.eof) {
            effects.exit(types.chunkString)
            return finalise(code)
        }

        if (markdownLineEnding(code)) {
            effects.exit(types.chunkString)
            return effects.attempt(nextLine, afterMarker, finalise)
        }

        // Consume content of the comment
        effects.consume(code)
        return insideContent
    }

    /** @type {State} */
    function finalise(code) {
        effects.exit(tokenTypes.mystComment)
        return ok(code)
    }
}

/** @type {Tokenizer} */
function tokenizeNextLine(effects, ok, nok) {
    return lineEnd

    /** @type {State} */
    function lineEnd(code) {
        // Consume the previous line ending, then allow for up to three spaces
        effects.enter(types.lineEnding)
        effects.consume(code)
        effects.exit(types.lineEnding)
        return factorySpace(
            effects,
            afterPrefix,
            types.linePrefix,
            constants.tabSize - 1
        )
    }

    /** @type {State} */
    function afterPrefix(code) {
        if (code !== codes.percentSign) {
            return nok(code)
        }
        effects.enter(tokenTypes.mystCommentMarker)
        effects.consume(code)
        effects.exit(tokenTypes.mystCommentMarker)
        return ok(code)
    }
}
