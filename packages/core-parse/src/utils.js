/** Return a case- and whitespace-normalized name.
 * @param {string} label
 * @returns {string}
 */
export function normalizeId(label) {
    return `${label}`.replace(/\s+/g, ' ').trim().toLowerCase()
}
