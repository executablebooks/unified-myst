/** Interface for a logger
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 *
 * @typedef LogProps
 * @property {Position} [position]
 * @property {string} [type]  Category of log message
 * @property {string} [subtype] Subcategory of log message
 * @property {string} [extension] the extension it originated from
 *
 * @typedef {(message: string, props?: LogProps) => Node} logMethod
 *  Log a method and return a log node that can be added to the tree
 *
 * @typedef Logger
 * @property {logMethod} debug
 * @property {logMethod} info
 * @property {logMethod} warning
 * @property {logMethod} error
 * @property {(id: number, callback: (node: Node) => void) => void} attachObserver
 * @property {(id: number) => void} detachObserver
 *
 */
import { u } from 'unist-builder'

export class ConsoleLogger {
    constructor() {
        /** @private */
        this._nodeName = 'log'
        /** @private
         * @type {Record<number, (node: Node) => void>}
         */
        this._observers = {}
    }
    /**
     * @param {number} id
     * @param {(node: Node) => void} callback
     */
    attachObserver(id, callback) {
        this._observers[id] = callback
    }
    /**
     * @param {number} id
     */
    detachObserver(id) {
        delete this._observers[id]
    }
    /**
     * @private
     * @param {any} data
     */
    _log(data) {
        const node = u(this._nodeName, data)
        Object.values(this._observers).forEach((callback) => callback(node))
        return node
    }
    /** @type {logMethod} */
    debug(message, props) {
        const data = { message, level: 'debug', ...props }
        console.debug(data)
        return this._log(data)
    }
    /** @type {logMethod} */
    info(message, props) {
        const data = { message, level: 'info', ...props }
        console.info(data)
        return this._log(data)
    }
    /** @type {logMethod} */
    warning(message, props) {
        const data = { message, level: 'warning', ...props }
        console.warn(data)
        return this._log(data)
    }
    /** @type {logMethod} */
    error(message, props) {
        const data = { message, level: 'error', ...props }
        console.error(data)
        return this._log(data)
    }
}
