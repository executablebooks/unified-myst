/** Roles for wrapping inline text in containers with semantic meaning. */
import { u } from 'unist-builder'

import { RoleProcessor } from '../roleProcessor.js'

export const spansExtension = {
    name: 'spans',
    /** @type {Record<string, {processor: typeof RoleProcessor}>} */
    roles: {},
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
    'title-reference',
]) {
    spansExtension.roles[role] = {
        processor: class extends RoleProcessor {
            run() {
                const node = u(role, {}, [
                    { type: 'text', value: this.node.content },
                ])
                return [node]
            }
        },
    }
}

const ABBR_PATTERN = /^(.+?)\(([^()]+)\)$/ // e.g. 'CSS (Cascading Style Sheets)'

/** Taken from https://github.com/sphinx-doc/sphinx/blob/bf010790ace78ba4bc4231445e73bcecf97e4947/sphinx/roles.py#L321 */
spansExtension.roles['abbr'] = {
    processor: class RoleAbbreviation extends RoleProcessor {
        run() {
            const match = ABBR_PATTERN.exec(this.node.content)
            const content = match?.[1]?.trim() ?? this.node.content.trim()
            const explanation = match?.[2]?.trim() ?? null
            const node = u('abbreviation', { explanation }, [
                { type: 'text', value: content },
            ])
            return [node]
        }
    },
}
