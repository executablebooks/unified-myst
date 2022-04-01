/**
 *
 * @typedef extensionNameMixin
 * @property {string} extensionName
 *
 * @typedef nameMixin
 * @property {string} name
 *
 * @typedef RoleExtension
 * @property {any} processor
 * @typedef {RoleExtension & extensionNameMixin } Role
 *
 * @typedef DirectiveExtension
 * @property {any} processor
 * @typedef {DirectiveExtension & extensionNameMixin } Directive
 *
 * @typedef TransformExtension
 * @property {number} priority
 * @property {any} processor
 * @typedef {TransformExtension & extensionNameMixin & nameMixin} Transform
 *
 * @typedef {any} Config
 *
 * @typedef Extension
 * @property {string} name
 * @property {Record<string, RoleExtension>} [roles]
 * @property {Record<string, Directive>} [directives]
 * @property {Record<string, TransformExtension>} [transforms]
 * @property {Record<string, Config>} [config]
 *
 * @typedef {import('@unified-myst/process-roles-directives').roleProcessor} roleProcessor
 * @typedef {import('@unified-myst/process-roles-directives').directiveProcessor} directiveProcessor
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

export class Parser {
    constructor() {
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

    // TODO get config schema
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
    }

    /**
     * @param {import("micromark-util-types").Value} text
     */
    toAst(text) {
        // Initial parse
        const mdast = fromMarkdown(text, this.mdastExtensions)
        // process roles and directives
        processRolesDirectives(mdast, this.processRole, this.processDirective)
        // TODO apply transform
        return mdast
    }

    /**
     * @private
     * @type roleProcessor
     */
    processRole(node) {
        return [u('placeholder', { name: node.name })]
    }

    /**
     * @private
     * @type directiveProcessor
     */
    processDirective(node) {
        return u('placeholder', { name: node.name })
    }
}
