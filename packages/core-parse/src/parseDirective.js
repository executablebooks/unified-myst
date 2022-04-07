// Note this is adapted from https://github.com/executablebooks/markdown-it-docutils/blob/bd22f504ac388a744da7b4f83baef21259d35827/src/directives/main.ts#L1
/**
 *
 *
 * @typedef {import('@unified-myst/process-roles-directives').RawDirectiveNode} RawDirectiveNode
 *
 * @typedef {(value: string, options?: any) => any} OptionSpecConverter
 *
 * @typedef IDirectiveSpec Data required to parse a directive first line and content to its structure
 * @property {number} required_arguments number of required arguments
 * @property {number} optional_arguments number of optional arguments
 * @property {boolean} [final_argument_whitespace] indicating if the final argument may contain whitespace
 * @property {Record<string, OptionSpecConverter | null>} [option_spec] mapping known option names to conversion functions
 * @property {boolean} [has_content] if body content is allowed
 * @property {boolean} [rawOptions] If true, do not attempt to validate/convert options.
 *
 * @typedef IDirectiveData
 * @property {string[]} args
 * @property {Record<string, any>} options
 * @property {string} value Content of the body
 * @property {number} bodyOffset
 */
import yaml from 'js-yaml'

/** Raise on parsing/validation error. */
export class DirectiveParsingError extends Error {
    name = 'DirectiveParsingError'
}

/**
 * This function contains the logic to take the first line of a directive,
 * and the content, and turn it into the three core components:
 * arguments (list), options (key: value mapping), and body (text).
 *
 * @param {RawDirectiveNode} node
 * @param {IDirectiveSpec} directive
 * @returns {IDirectiveData}
 */
export function deconstructNode(node, directive) {
    const firstLine = node.meta || ''
    const content = node.value
    let body = content.trim() ? content.split(/\r?\n/) : []
    let bodyOffset = 0
    let options = {}
    if (Object.keys(directive.option_spec || {}) || directive.rawOptions) {
        ;[body, options, bodyOffset] = parseDirectiveOptions(body, directive)
    }
    /** @type string[] */
    let args = []
    if (!directive.required_arguments && !directive.optional_arguments) {
        if (firstLine) {
            bodyOffset = 0
            body = [firstLine].concat(body)
        }
    } else {
        args = parseDirectiveArguments(firstLine, directive)
    }
    // remove first line of body if blank, to allow space between the options and the content
    if (body.length && !body[0].trim()) {
        body.shift()
        bodyOffset++
    }
    // check for body content
    if (body.length && !directive.has_content) {
        throw new DirectiveParsingError('Has content but content not allowed')
    }
    return {
        args,
        options,
        value: body.join('\n'),
        bodyOffset,
    }
}

/**
 *
 * @param {string[]} content
 * @param {IDirectiveSpec} fullSpec
 * @returns {[string[], { [key: string]: any }, number]}
 */
function parseDirectiveOptions(content, fullSpec) {
    // instantiate options
    let bodyOffset = 1
    /** @type {{ [key: string]: any } } */
    let options = {}
    /** @type {null | string[]} */
    let yamlBlock = null

    // TODO allow for indented content (I can't remember why this was needed?)

    if (content.length && content[0].startsWith('---')) {
        // options contained in YAML block, ending with '---'
        bodyOffset++
        /** @type string[] */
        const newContent = []
        yamlBlock = []
        let foundDivider = false
        for (const line of content.slice(1)) {
            if (line.startsWith('---')) {
                bodyOffset++
                foundDivider = true
                continue
            }
            if (foundDivider) {
                newContent.push(line)
            } else {
                bodyOffset++
                yamlBlock.push(line)
            }
        }
        content = newContent
    } else if (content.length && content[0].startsWith(':')) {
        /** @type string[] */
        const newContent = []
        yamlBlock = []
        let foundDivider = false
        for (const line of content) {
            if (!foundDivider && !line.startsWith(':')) {
                foundDivider = true
                newContent.push(line)
                continue
            }
            if (foundDivider) {
                newContent.push(line)
            } else {
                bodyOffset++
                yamlBlock.push(line.slice(1))
            }
        }
        content = newContent
    }

    if (yamlBlock !== null) {
        try {
            const output = yaml.load(yamlBlock.join('\n'))
            if (output !== null && typeof output === 'object') {
                options = output
            } else {
                throw new DirectiveParsingError(`not dict: ${output}`)
            }
        } catch (error) {
            throw new DirectiveParsingError(`Invalid options YAML: ${error}`)
        }
    }

    if (fullSpec.rawOptions) {
        return [content, options, bodyOffset]
    }

    for (const [name, value] of Object.entries(options)) {
        const convertor = fullSpec.option_spec
            ? fullSpec.option_spec[name]
            : undefined
        if (convertor === undefined) {
            throw new DirectiveParsingError(`Unknown option: ${name}`)
        }
        let converted_value = value
        if (value === null || value === false) {
            converted_value = ''
        }
        // In docutils all values are simply read as strings,
        // but loading with YAML these can be converted to other types, so we convert them back first
        // TODO check that it is sufficient to simply do this conversion, or if there is a better way
        converted_value = `${converted_value || ''}`
        if (convertor !== null) {
            try {
                converted_value = convertor(converted_value)
            } catch (error) {
                throw new DirectiveParsingError(
                    `Invalid option value: (option: '${name}'; value: ${value})\n${error}`
                )
            }
        }
        options[name] = converted_value
    }

    return [content, options, bodyOffset]
}

/**
 *
 * @param {string} firstLine
 * @param {IDirectiveSpec} fullSpec
 * @returns {string[]}
 */
function parseDirectiveArguments(firstLine, fullSpec) {
    let args = firstLine.trim() ? firstLine.trim()?.split(/\s+/) : []
    const totalArgs =
        (fullSpec.required_arguments || 0) + (fullSpec.optional_arguments || 0)
    if (args.length < (fullSpec.required_arguments || 0)) {
        throw new DirectiveParsingError(
            `${fullSpec.required_arguments} argument(s) required, ${args.length} supplied`
        )
    } else if (args.length > totalArgs) {
        if (fullSpec.final_argument_whitespace) {
            // note split limit does not work the same as in python
            const arr = firstLine.split(/\s+/)
            args = arr.splice(0, totalArgs - 1)
            // TODO is it ok that we effectively replace all whitespace with single spaces?
            args.push(arr.join(' '))
        } else {
            throw new DirectiveParsingError(
                `maximum ${totalArgs} argument(s) allowed, ${args.length} supplied`
            )
        }
    }
    return args
}
