/** Roles for wrapping inline text in containers with semantic meaning.
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { RoleProcessor } from '../roleProcessor.js'

/** @type {Extension} */
export const inlineMarkupExtension = {
    name: 'inlineMarkup',
    process: { mystRoles: {} },
}

/** Taken from https://github.com/live-clones/docutils/blob/48bb76093b4ba83654b2f2c86e7c52c4bb39c63b/docutils/docutils/parsers/rst/roles.py#L257-L264 */
for (const role of [
    'abbreviation',
    'acronym',
    'literal',
    'emphasis',
    'strong',
    'subscript',
    'superscript',
]) {
    // @ts-ignore
    inlineMarkupExtension.process.mystRoles[role] = {
        processor: class extends RoleProcessor {
            run() {
                const node = u(role, {}, [
                    { type: 'text', value: this.node.value },
                ])
                return [node]
            }
        },
    }
}

const ABBR_PATTERN = /^(.+?)\(([^()]+)\)$/ // e.g. 'CSS (Cascading Style Sheets)'

/** Taken from https://github.com/sphinx-doc/sphinx/blob/bf010790ace78ba4bc4231445e73bcecf97e4947/sphinx/roles.py#L321 */

class RoleAbbreviation extends RoleProcessor {
    run() {
        const match = ABBR_PATTERN.exec(this.node.value)
        const content = match?.[1]?.trim() ?? this.node.value.trim()
        const title = match?.[2]?.trim() ?? null
        const node = u('abbreviation', { title }, [
            { type: 'text', value: content },
        ])
        return [node]
    }
}
// @ts-ignore
inlineMarkupExtension.process.mystRoles['abbr'] = {
    processor: RoleAbbreviation,
}
