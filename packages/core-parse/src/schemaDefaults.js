/**
 * Obtain nested defaults from a JSON schema.
 * Note this function currently only habdles simple schema, ignoring constructs such as definitions and all
 * @param {{ [x: string]: any; }} schema
 */
export function getSchemaDefaults(schema) {
    /** @type {{ [x: string]: any; }} */
    const defaults = {}
    if (schema.default !== undefined) {
        return schema.default
    }
    if (schema.type != 'object') {
        return undefined
    }
    for (const [key, prop] of Object.entries(schema.properties || {})) {
        const value = getSchemaDefaults(prop)
        if (value !== undefined) {
            defaults[key] = value
        }
    }
    return defaults
}
