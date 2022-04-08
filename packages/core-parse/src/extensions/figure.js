/** Containers for images.
 *
 * @typedef {import('../processor').Extension} Extension
 */
import { u } from 'unist-builder'

import { DirectiveProcessor } from '../directiveProcessor.js'
import {
    class_option,
    percentage,
    length_or_percentage_or_unitless,
    length_or_unitless,
    create_choice,
    length_or_percentage_or_unitless_figure,
} from '../directiveOptions.js'

const shared_option_spec = {
    alt: null,
    align: create_choice(['left', 'center', 'right']),
    height: length_or_unitless,
    width: length_or_percentage_or_unitless,
    scale: percentage,
    class: class_option,
    name: null,
    // TODO handle
    target: null,
}

/** A single image
 *
 * Adapted from https://github.com/docutils-mirror/docutils/blob/9649abee47b4ce4db51be1d90fcb1fb500fa78b3/docutils/parsers/rst/directives/images.py
 */
export class ImageDirective extends DirectiveProcessor {
    static required_arguments = 1
    static optional_arguments = 0
    static final_argument_whitespace = true
    static option_spec = shared_option_spec
    run() {
        const node = u('image', {
            url: this.node.args[0],
            position: this.node.position,
        })
        for (const value of ['alt', 'height', 'width', 'scale']) {
            if (this.node.options[value]) {
                // @ts-ignore
                node[value] = this.node.options[value]
            }
        }
        this.addName(node)
        this.addClasses(node)
        return [node]
    }
}

/** A container for a single image with a caption.
 *
 * Adapted from https://github.com/sphinx-doc/sphinx/blob/9273140ee257fd754ff036198cd506cd07fb4e4a/sphinx/directives/patches.py
 * and https://github.com/docutils-mirror/docutils/blob/9649abee47b4ce4db51be1d90fcb1fb500fa78b3/docutils/parsers/rst/directives/images.py
 */
export class FigureDirective extends DirectiveProcessor {
    static required_arguments = 1
    static optional_arguments = 0
    static final_argument_whitespace = true
    static has_content = true
    static option_spec = {
        ...shared_option_spec,
        figwidth: length_or_percentage_or_unitless_figure,
        figclass: class_option,
    }
    run() {
        const image = u('image', {
            url: this.node.args[0],
            position: this.node.position,
        })
        for (const value of ['alt', 'height', 'width', 'scale']) {
            if (this.node.options[value]) {
                // @ts-ignore
                image[value] = this.node.options[value]
            }
        }
        this.addClasses(image)
        const caption = u(
            'caption',
            { position: this.node.position },
            this.nestedParse(this.node.value, {
                keepPosition: true,
                offsetLine: this.node.bodyOffset,
            })
        )
        // TODO handle splitting of caption into caption and legend
        const container = u(
            'container',
            { kind: 'figure', position: this.node.position },
            [image, caption]
        )
        if (this.node.options.figwidth) {
            // TODO handle if figwidth is 'image'
            // @ts-ignore
            container.width = this.node.options.figwidth
        }
        if (this.node.options.figclass) {
            // @ts-ignore
            container.classes = this.node.options.figclass
        }
        this.addName(container)
        return [container]
    }
}

/** @type {Extension} */
export const figureExtension = {
    name: 'figure',
    process: {
        mystDirectives: {
            image: { processor: ImageDirective },
            figure: { processor: FigureDirective },
        },
    },
}
