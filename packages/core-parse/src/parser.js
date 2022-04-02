/**
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('@unified-myst/process-roles-directives').roleProcessor} roleProcessor
 * @typedef {import('@unified-myst/process-roles-directives').RawRoleNode} RawRoleNode
 * @typedef {import('@unified-myst/process-roles-directives').directiveProcessor} directiveProcessor
 *
 * @typedef extensionNameMixin
 * @property {string} extensionName
 *
 * @typedef nameMixin
 * @property {string} name
 *
 * @typedef {import('./roleProcessor').RoleProcessor} RoleProcessor
 * TODO how to specify the type of the RoleProcessor class (not instance)?
 * @typedef RoleExtension
 * @property {any} processor
 * @typedef {RoleExtension & extensionNameMixin } Role
 *
 * @typedef {import('./directiveProcessor').DirectiveProcessor} DirectiveProcessor
 * TODO how to specify the type of the DirectiveProcessor class (not instance)?
 * @typedef DirectiveExtension
 * @property {any} processor
 * @typedef {DirectiveExtension & extensionNameMixin } Directive
 *
 * @typedef TransformExtension
 * @property {number} priority
 * @property {any} processor
 * @typedef {TransformExtension & extensionNameMixin & nameMixin} Transform
 *
 * @typedef {{default: any, type: string, [keys: string]: any}} Config
 *
 * @typedef Extension
 * @property {string} name
 * @property {Record<string, RoleExtension>} [roles]
 * @property {Record<string, Directive>} [directives]
 * @property {Record<string, TransformExtension>} [transforms]
 * @property {Record<string, Config>} [config]
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

export class Parser {
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
         * @type {Transform[]}
         */
        this.transforms = []
        /**
         * @private
         */
        this.mdastExtensions = {
            extensions: [
                mystCommentMmarkExt,
                mystBreakMmarkExt,
                mystRoleMmarkExt,
                mystTargetMmarkExt,
                frontmatterMmarkExt(['yaml']),
                gfmTableMmarkExt,
                gfmFootnoteMmarkExt(),
            ],
            mdastExtensions: [
                mystCommentMdastExt,
                mystBreakMdastExt,
                mystRoleMdastExt,
                mystTargetMdastExt,
                frontmatterMdastExt(['yaml']),
                gfmTableMdastExt,
                gfmFootnoteMdastExt(),
            ],
        }
    }

    /** Return a copy of the config schema */
    getConfigSchema() {
        return JSON.parse(JSON.stringify(this.configSchema))
    }

    /**
     * @param {{ [keys: string]: any; }} config
     */
    setConfig(config) {
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
        this.config = config
        return this
    }
    getConfig() {
        // TODO merge with defaults from schema
        return this.config
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

    /** Iterate by order of priority */
    *iterTransforms() {
        for (const transform of this.transforms) {
            yield transform
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
                // TODO throw error, unless override=true
                this.roles[name] = { ...role, extensionName: extension.name }
            }
        }
        if (extension.directives) {
            for (const [name, directive] of Object.entries(
                extension.directives
            )) {
                // TODO throw error, unless override=true
                this.directives[name] = {
                    ...directive,
                    extensionName: extension.name,
                }
            }
        }
        if (extension.transforms) {
            for (const [name, transform] of Object.entries(
                extension.transforms
            )) {
                this.transforms.push({
                    ...transform,
                    name,
                    extensionName: extension.name,
                })
                // TODO sort transforms by priority
            }
        }
        return this
    }

    /**
     * @param {string | Uint8Array} text
     */
    toAst(text) {
        // TODO this.getConfig() and cache for duration of parse
        // Initial parse
        const mdast = fromMarkdown(text, this.mdastExtensions)
        // process roles and directives
        processRolesDirectives(
            mdast,
            this.processRole.bind(this),
            this.processDirective.bind(this)
        )
        // TODO apply transform
        return mdast
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
            new NestedParser(this.mdastExtensions)
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
            new NestedParser(this.mdastExtensions)
        ).run()
        return newNode
    }
}
