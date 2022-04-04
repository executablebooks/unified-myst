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
 * @typedef {import('@unified-myst/process-roles-directives').roleProcessor} roleProcessor
 * @typedef {import('@unified-myst/process-roles-directives').RawRoleNode} RawRoleNode
 * @typedef {import('@unified-myst/process-roles-directives').directiveProcessor} directiveProcessor
 *
 * @typedef Role
 * @property {boolean} override Whether this can override an existing directive of this name
 * @property {typeof import('./roleProcessor').RoleProcessor} processor
 * @property {string} extensionName
 *
 * @typedef {Omit<Role, "extensionName">} RoleExtension
 *
 * @typedef Directive
 * @property {boolean} override Whether this can override an existing directive of this name
 * @property {typeof import('./directiveProcessor').DirectiveProcessor} processor
 * @property {string} extensionName
 *
 * @typedef {Omit<Directive, "extensionName">} DirectiveExtension
 *
 * @typedef {(config: Object) => null} beforeConfigProcessor
 *  Intended for modifications of the config, before it is validated.
 * @typedef {(source: string | Uint8Array, config: Object, state: Object) => string | Uint8Array | null} beforeRead
 *  Intended for modification of the source text and setup of initial state.
 *  If a non-null value is returned, the source text is replaced with the returned value.
 * @typedef {(ast: Node, config: Object, state: Object) => null} afterReadProcessor
 *  Intended for modification of the AST.
 * @typedef {(ast: Node, config: Object, state: Object) => null} afterTransformsProcessor
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
 * @property {string} name
 * @property {Record<string, RoleExtension>} [roles]
 * @property {Record<string, DirectiveExtension>} [directives]
 * @property {HooksExtension} [hooks]
 * @property {Record<string, ConfigExtension>} [config]
 *
 */

import { fromMarkdown } from 'mdast-util-from-markdown'
import { processRolesDirectives } from '@unified-myst/process-roles-directives'
import {
    mystBreakMmarkExt,
    mystBreakMdastExt,
} from '@unified-myst/break-extension'
import {
    mystCommentMmarkExt,
    mystCommentMdastExt,
} from '@unified-myst/comment-extension'
import {
    mystRoleMmarkExt,
    mystRoleMdastExt,
} from '@unified-myst/role-extension'
import {
    mystTargetMmarkExt,
    mystTargetMdastExt,
} from '@unified-myst/target-extension'
import { frontmatter as frontmatterMmarkExt } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown as frontmatterMdastExt } from 'mdast-util-frontmatter'
import { gfmTable as gfmTableMmarkExt } from 'micromark-extension-gfm-table'
import { gfmTableFromMarkdown as gfmTableMdastExt } from 'mdast-util-gfm-table'
import { gfmFootnote as gfmFootnoteMmarkExt } from 'micromark-extension-gfm-footnote'
import { gfmFootnoteFromMarkdown as gfmFootnoteMdastExt } from 'mdast-util-gfm-footnote'

import { u } from 'unist-builder'
import Ajv from 'ajv'

import { NestedParser } from '@unified-myst/nested-parse'
import { deconstructNode } from './parseDirective.js'

export class Processor {
    constructor() {
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
         * @type {Record<string, Role>}
         */
        this.roles = {}
        /**
         * @private
         * @type {Record<string, Directive>}
         */
        this.directives = {}
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
        /**
         * @private
         * @type {Record<string, [any, any]>}
         */
        this.parsingExtensions = {
            comment: [mystCommentMmarkExt, mystCommentMdastExt],
            role: [mystRoleMmarkExt, mystRoleMdastExt],
            target: [mystTargetMmarkExt, mystTargetMdastExt],
            break: [mystBreakMmarkExt, mystBreakMdastExt],
            frontmatter: [
                frontmatterMmarkExt(['yaml']),
                frontmatterMdastExt(['yaml']),
            ],
            'gfm-table': [gfmTableMmarkExt, gfmTableMdastExt],
            'gfm-footnote': [gfmFootnoteMmarkExt(), gfmFootnoteMdastExt()],
        }
    }

    /**
     * @private
     * @param {string[]} [disableExtensions] list of extensions to disable
     * @param {string[]} [disableConstructs] list of constructs to disable
     */
    getMdastConfig(disableExtensions, disableConstructs) {
        // TODO how to extend parser?
        /** @type {{extensions: any[], mdastExtensions: any[]}} */
        const result = { extensions: [], mdastExtensions: [] }
        for (const name of [
            'comment',
            'role',
            'target',
            'break',
            'frontmatter',
            'gfm-table',
            'gfm-footnote',
        ]) {
            if (disableExtensions && disableExtensions.includes(name)) {
                continue
            }
            result.extensions.push(this.parsingExtensions[name][0])
            result.mdastExtensions.push(this.parsingExtensions[name][1])
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
    getConfig() {
        // TODO merge with defaults from schema
        return JSON.parse(JSON.stringify(this.config))
    }

    /** @param {string} name */
    getRole(name) {
        if (!this.roles[name]) {
            return null
        }
        return this.roles[name]
    }

    /** @param {string} name */
    getDirective(name) {
        if (!this.directives[name]) {
            return null
        }
        return this.directives[name]
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
    addExtension(extension) {
        // TODO don't allow extension to be added with same name twice
        if (extension.config) {
            this.configSchema.properties[extension.name] = {
                type: 'object',
                properties: extension.config,
                additionalProperties: false,
            }
        }
        if (extension.roles) {
            for (const [name, role] of Object.entries(extension.roles)) {
                if (!!role.override && this.roles[name]) {
                    throw new Error(
                        `Cannot add directive ${name} from extension ${extension.name} to parser, ` +
                            `already set by extension ${this.roles[name].extensionName}`
                    )
                }
                this.roles[name] = { ...role, extensionName: extension.name }
            }
        }
        if (extension.directives) {
            for (const [name, directive] of Object.entries(
                extension.directives
            )) {
                if (!!directive.override && this.directives[name]) {
                    throw new Error(
                        `Cannot add directive ${name} from extension ${extension.name} to parser, ` +
                            `already set by extension ${this.directives[name].extensionName}`
                    )
                }
                this.directives[name] = {
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
            hook.processor(config)
        }
        this.validateConfig(config)
        // Setup initial state
        state = state || {}
        for (const hook of this.iterHooks('beforeRead')) {
            const newText = hook.processor(text, config, state)
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
            state
        )
        // run post-parse hooks
        for (const hook of this.iterHooks('afterRead')) {
            hook.processor(ast, config, state)
        }
        for (const hook of this.iterHooks('afterTransforms')) {
            hook.processor(ast, config, state)
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
