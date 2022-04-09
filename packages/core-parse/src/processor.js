/**
 * @template P
 * @typedef Hook
 * @property {number} priority Hooks are executed, sorted by ascending order of priority (zero first).
 * @property {P} processor
 * @property {string} name
 * @property {string} extensionName
 */

/**
 * @template P
 * @typedef {Omit<Hook<P>, "name" | "extensionName">} HookExtension
 */

/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('micromark-util-types').Extension} TokenizerExtension
 * @typedef {import('mdast-util-from-markdown').Extension} TokenToMdastExtension
 * @typedef {import('@unified-myst/process-roles-directives').roleProcessor} roleProcessor
 * @typedef {import('@unified-myst/process-roles-directives').RawRoleNode} RawRoleNode
 * @typedef {import('@unified-myst/process-roles-directives').directiveProcessor} directiveProcessor
 *
 * @typedef {import('./logger').Logger} Logger
 *
 * @typedef ParsingExtension
 * @property {string} name
 * @property {TokenizerExtension} tokenizer
 * @property {TokenToMdastExtension} toMdast
 *
 * @typedef MystRole
 * @property {boolean} [override] Whether this can override an existing directive of this name
 * @property {typeof import('./roleProcessor').RoleProcessor} processor
 * @property {string} extensionName
 *
 * @typedef {Omit<MystRole, "extensionName">} MystRoleExtension
 *
 * @typedef MystDirective
 * @property {boolean} [override] Whether this can override an existing directive of this name
 * @property {typeof import('./directiveProcessor').DirectiveProcessor} processor
 * @property {string} extensionName
 *
 * @typedef {Omit<MystDirective, "extensionName">} MystDirectiveExtension
 *
 * @typedef ProcessHandles
 * @property {Record<string, MystRoleExtension>} [mystRoles] Mapping of role names to handlers
 * @property {Record<string, MystDirectiveExtension>} [mystDirectives] Mapping of directive names to handlers
 *
 * @typedef {(config: Object, logger: Logger) => null} beforeConfigProcessor
 *  Intended for modifications of the config, before it is validated.
 * @typedef {(source: string | Uint8Array, config: Object, state: Object, logger: Logger) => string | Uint8Array | null} beforeRead
 *  Intended for modification of the source text and setup of initial state.
 *  If a non-null value is returned, the source text is replaced with the returned value.
 * @typedef {(ast: Node, config: Object, state: Object, logger: Logger) => null} afterReadProcessor
 *  Intended for modification of the AST.
 * @typedef {(ast: Node, config: Object, state: Object, logger: Logger) => null} afterTransformsProcessor
 *  Intended for extraction of information from the AST.
 *
 * @typedef {{default: any, type: string, [keys: string]: any}} ConfigExtension
 *
 * @typedef HooksExtension
 * @property {Record<string, HookExtension<beforeConfigProcessor>>} [beforeConfig]
 * @property {Record<string, HookExtension<beforeRead>>} [beforeRead]
 * @property {Record<string, HookExtension<afterReadProcessor>>} [afterRead]
 * @property {Record<string, HookExtension<afterTransformsProcessor>>} [afterTransforms]
 *
 * @typedef Hooks
 * @property {Hook<beforeConfigProcessor>[]} beforeConfig
 * @property {Hook<beforeRead>[]} beforeRead
 * @property {Hook<afterReadProcessor>[]} afterRead
 * @property {Hook<afterTransformsProcessor>[]} afterTransforms
 *
 * @typedef HookMap
 * @property {Hook<beforeConfigProcessor>} beforeConfig
 * @property {Hook<beforeRead>} beforeRead
 * @property {Hook<afterReadProcessor>} afterRead
 * @property {Hook<afterTransformsProcessor>} afterTransforms
 *
 * @typedef Extension
 * @property {string} name Name of the extension
 * @property {Record<string, ConfigExtension>} [config] Mapping of config keys to json schema
 * @property {ParsingExtension[]} [parsing] Parsing extensions ot CommonMark
 * @property {ProcessHandles} [process]
 * @property {HooksExtension} [hooks] Mapping of names to event hook extensions
 *
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { processRolesDirectives } from '@unified-myst/process-roles-directives'

import { u } from 'unist-builder'
import Ajv from 'ajv'
import merge from 'lodash.merge'

import { NestedParser } from '@unified-myst/nested-parse'
import { deconstructNode } from './parseDirective.js'
import { getSchemaDefaults } from './schemaDefaults.js'
import { ConsoleLogger } from './logger'

export class Processor {
    /**
     * @param {Logger} [logger]
     */
    constructor(logger) {
        /** @type {Logger} */
        this.logger = logger || new ConsoleLogger()
        /**
         * @private
         * @type {string[]} */
        this.extensionNames = []
        /**
         * @private
         * @type {{type: string, properties: Record<string, Object>, additionalProperties: boolean}}
         */
        this.configSchema = {
            type: 'object',
            properties: {},
            additionalProperties: false,
        }
        /**
         * @private
         * @type {{[keys: string]: any}}
         */
        this.config = {}
        /**
         * @private
         * @type {ParsingExtension[]}
         */
        this.parsingExtensions = []
        /**
         * @private
         * @type {Record<string, MystRole>}
         */
        this.mystRoles = {}
        /**
         * @private
         * @type {Record<string, MystDirective>}
         */
        this.mystDirectives = {}
        /**
         * @private
         * @type {Hooks}
         */
        this.hooks = {
            beforeConfig: [],
            beforeRead: [],
            afterRead: [],
            afterTransforms: [],
        }
    }

    /**
     * @private
     * @param {string[]} [disableExtensions] list of extension names to disable
     * @param {string[]} [disableConstructs] list of constructs to disable
     */
    getMdastConfig(disableExtensions, disableConstructs) {
        /** @type {{extensions: TokenizerExtension[], mdastExtensions: TokenToMdastExtension[]}} */
        const result = { extensions: [], mdastExtensions: [] }
        for (const ext of this.parsingExtensions) {
            if (disableExtensions && disableExtensions.includes(ext.name)) {
                continue
            }
            result.extensions.push(ext.tokenizer)
            result.mdastExtensions.push(ext.toMdast)
        }
        if (disableConstructs) {
            // see: https://github.com/micromark/micromark#case-turn-off-constructs
            result.extensions.push({ disable: { null: disableConstructs } })
        }
        return result
    }

    /** Return a copy of the config schema */
    getConfigSchema() {
        return JSON.parse(JSON.stringify(this.configSchema))
    }

    /**
     * @param {{ [keys: string]: any; }} config
     */
    validateConfig(config) {
        const ajv = new Ajv()
        const validate = ajv.compile(this.configSchema)
        const valid = validate(config)
        if (!valid) {
            throw new Error(
                `Config validation failed: ${JSON.stringify(
                    validate.errors,
                    null,
                    ' '
                )}`
            )
        }
    }
    /**
     * @param {{ [keys: string]: any; }} config
     */
    setConfig(config) {
        this.validateConfig(config)
        this.config = config
        return this
    }
    /** @param {boolean} [original] Do not merge with schema defaults */
    getConfig(original) {
        if (original) {
            return JSON.parse(JSON.stringify(this.config))
        }
        const config = getSchemaDefaults(this.configSchema)
        return merge(config, this.config)
    }

    /** @param {string} name */
    getRole(name) {
        if (!this.mystRoles[name]) {
            return null
        }
        return this.mystRoles[name]
    }

    /** @param {string} name */
    getDirective(name) {
        if (!this.mystDirectives[name]) {
            return null
        }
        return this.mystDirectives[name]
    }

    /** Iterate hooks for an event, sorted by ascending order of priority
     * @template {keyof Hooks} T
     * @param {T} event
     * @returns {Generator<HookMap[T], void, undefined>}
     */
    *iterHooks(event) {
        if (!this.hooks[event]) {
            return
        }
        for (const hook of this.hooks[event].sort(
            (a, b) => a.priority - b.priority
        )) {
            // @ts-ignore
            yield hook
        }
    }

    /** @param {Extension} extension */
    use(extension) {
        // Do not allow extension to be added with same name twice
        if (this.extensionNames.includes(extension.name)) {
            throw new Error(`Extension ${extension.name} already added`)
        }
        this.extensionNames.push(extension.name)
        if (extension.config) {
            this.configSchema.properties[extension.name] = {
                type: 'object',
                properties: extension.config,
                additionalProperties: false,
            }
        }
        if (extension.parsing) {
            this.parsingExtensions.push(...extension.parsing)
        }
        if (extension.process?.mystRoles) {
            for (const [name, role] of Object.entries(
                extension.process.mystRoles
            )) {
                if (!!role.override && this.mystRoles[name]) {
                    throw new Error(
                        `Cannot add mystRole ${name} from extension ${extension.name} to parser, ` +
                            `already set by extension ${this.mystRoles[name].extensionName}`
                    )
                }
                this.mystRoles[name] = {
                    ...role,
                    extensionName: extension.name,
                }
            }
        }
        if (extension.process?.mystDirectives) {
            for (const [name, directive] of Object.entries(
                extension.process.mystDirectives
            )) {
                if (!!directive.override && this.mystDirectives[name]) {
                    throw new Error(
                        `Cannot add mystDirective ${name} from extension ${extension.name} to parser, ` +
                            `already set by extension ${this.mystDirectives[name].extensionName}`
                    )
                }
                this.mystDirectives[name] = {
                    ...directive,
                    extensionName: extension.name,
                }
            }
        }
        if (extension.hooks) {
            for (const [eventName, events] of Object.entries(extension.hooks)) {
                /** @type {keyof Hooks} */
                // @ts-ignore
                const eventNameTyped = eventName
                for (const [name, hook] of Object.entries(events)) {
                    this.hooks[eventNameTyped].push({
                        ...hook,
                        name: name,
                        extensionName: extension.name,
                    })
                }
            }
        }
        return this
    }

    /**
     * @param {string | Uint8Array} text
     * @param {Object} [state] the initial global state object, if undefined a new one will be created
     */
    toAst(text, state) {
        // Setup configuration
        const config = this.getConfig()
        for (const hook of this.iterHooks('beforeConfig')) {
            hook.processor(config, this.logger)
        }
        this.validateConfig(config)
        // Setup initial state
        state = state || {}
        for (const hook of this.iterHooks('beforeRead')) {
            const newText = hook.processor(text, config, state, this.logger)
            if (newText !== null) {
                text = newText
            }
        }
        // parse source-text
        const ast = fromMarkdown(text, this.getMdastConfig())
        // process roles and directives
        processRolesDirectives(
            ast,
            this.processRole.bind(this),
            this.processDirective.bind(this),
            state,
            this.logger
        )
        // run post-parse hooks
        for (const hook of this.iterHooks('afterRead')) {
            hook.processor(ast, config, state, this.logger)
        }
        for (const hook of this.iterHooks('afterTransforms')) {
            hook.processor(ast, config, state, this.logger)
        }
        return { ast, state }
    }

    /**
     * @private
     * @type roleProcessor
     */
    processRole(node, context) {
        const role = this.getRole(node.name)
        if (!role) {
            return [
                u('error', {
                    value: `Unknown role: ${node.name}`,
                    position: node.position,
                }),
            ]
        }
        // @ts-ignore
        return new role.processor(
            node,
            context,
            // TODO maybe better to cache getMdastExtensions
            new NestedParser(
                this.getMdastConfig(
                    ['frontmatter'],
                    ['headingAtx', 'setextUnderline']
                )
            )
        ).run()
    }

    /**
     * @private
     * @type directiveProcessor
     */
    processDirective(node, context) {
        const directive = this.getDirective(node.name)
        if (!directive) {
            return u('error', {
                value: `Unknown directive: ${node.name}`,
                position: node.position,
            })
        }
        // deconstruct the node
        let data
        try {
            data = deconstructNode(node, directive.processor)
        } catch (err) {
            return u('error', {
                value: `Parsing directive: ${err}`,
                position: node.position,
            })
        }
        // create the containing node
        const newNode = u('mystDirective', {
            name: node.name,
            position: node.position,
            ...data,
        })
        // create the children
        // @ts-ignore
        newNode.children = new directive.processor(
            newNode,
            context,
            // TODO maybe better to cache getMdastExtensions
            new NestedParser(
                this.getMdastConfig(
                    ['frontmatter'],
                    // TODO these are disabled, because docutils AST only allows headers at the top level
                    // but technically this does not have to be the case here?
                    // docutils also provides the "match_titles" option, to toggle this on/off
                    ['headingAtx', 'setextUnderline']
                )
            )
        ).run()
        return newNode
    }
}
