/**
 * @typedef {import('unist').Node} Node
 *
 * @typedef MystIdsMixin
 * @property {string[]} [mystIds]
 *
 * @typedef {import('unist').Node & MystIdsMixin} NodeWithMystIds
 */

/** Return a case- and whitespace-normalized name.
 * @param {string} label
 * @returns {string}
 */
export function normalizeId(label) {
    return `${label}`.replace(/\s+/g, ' ').trim().toLowerCase()
}

/**
 * @param {NodeWithMystIds} node
 * @param {string} name
 */
export function addMystId(node, name) {
    const id = normalizeId(name)
    node.mystIds = node.mystIds || []
    if (!node.mystIds.includes(id)) {
        node.mystIds.push(id)
    }
}
