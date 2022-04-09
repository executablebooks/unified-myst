/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').FootnoteDefinition} FootnoteDefinition
 * @typedef {import('mdast').Code} Code
 *
 * @typedef RawRoleNode
 * @property {string} type
 * @property {string} name
 * @property {string} value
 * @property {Position} [position]
 *
 * @typedef RawDirectiveNode
 * @property {string} name
 * @property {string} value
 * @property {string?} [meta]
 * @property {Position} [position]
 *
 * @typedef ParseContext
 * @property {Object} state the global state of the parser
 * @property {any} logger the global logger
 * @property {Set<string>} definitions the set of all scoped definition identifiers
 * @property {Set<string>} footnotes the set of all scoped footnote identifiers
 *
 * @typedef {(node: RawRoleNode, context: ParseContext) => Node[]} roleProcessor
 * @typedef {(node: RawDirectiveNode, context: ParseContext) => Node} directiveProcessor
 */
import { visit, SKIP, CONTINUE } from 'unist-util-visit'
import { normalizeIdentifier } from 'micromark-util-normalize-identifier'

const codeLangRegex = /^\{([^\s}]+)\}$/

/**
 * Process all roles and directives in a tree.
 *
 * @param {Node} tree
 * @param {roleProcessor} processRole
 * @param {directiveProcessor} processDirective
 * @param {Object} [state] the global state
 * @param {any} [logger] the global logger
 * @param {Set<string>} [defs] Set of definition identifiers in the parent scope
 * @param {Set<string>} [foots] Set of GFM footnote identifiers in the parent scope
 */
export function processRolesDirectives(
    tree,
    processRole,
    processDirective,
    state,
    logger,
    defs,
    foots
) {
    const definedState = state || {}
    // Collect definition and footnote identifiers, above the level of the roles/directives,
    // so that we can add them to any nested parses and correctly resolve any references.
    const definitions = defs || new Set()
    const footnotes = foots || new Set()
    visit(tree, collectIdentifiers)
    /** @param {Node} node */
    function collectIdentifiers(node) {
        switch (node.type) {
            case 'paragraph' || 'heading' || 'mystRole' || 'mystDirective':
                // We don't need to search inside these nodes
                return SKIP
            case 'definition':
                // @ts-ignore
                definitions.add(normalizeIdentifier(node.identifier))
                return SKIP
            case 'footnoteDefinition':
                // @ts-ignore
                footnotes.add(normalizeIdentifier(node.identifier))
                return SKIP
        }
    }

    // Now walk through the tree and start to process the roles and directives
    visit(tree, processVisitor)

    /**
     * @param {Node} node
     * @param {number?} index
     * @param {Node} parent
     */
    function processVisitor(node, index, parent) {
        if (node.type === 'mystRole') {
            // @ts-ignore
            if (node.children !== undefined) {
                // The role is already processed, so we don't need to do anything
                return SKIP
            }
            /** @type RawRoleNode  */
            // @ts-ignore
            const role = node
            const children = processRole(role, {
                state: definedState,
                logger,
                definitions,
                footnotes,
            })
            // @ts-ignore
            node.children = children
            // TODO add guard to prevent infinite recursion?
            return CONTINUE
        }
        if (node.type == 'code') {
            /** @type Code */
            // @ts-ignore
            const code = node
            if (!code.lang || !codeLangRegex.test(code.lang)) {
                return CONTINUE
            }
            const directive = processDirective(
                {
                    name: code.lang.slice(1, code.lang.length - 1),
                    meta: code.meta,
                    value: code.value,
                    position: code.position,
                },
                {
                    state: definedState,
                    logger,
                    definitions,
                    footnotes,
                }
            )
            processRolesDirectives(
                directive,
                processRole,
                processDirective,
                definedState,
                logger,
                new Set(definitions),
                new Set(footnotes)
            )
            // @ts-ignore
            parent.children[index] = directive
            return SKIP
        }
    }
}
