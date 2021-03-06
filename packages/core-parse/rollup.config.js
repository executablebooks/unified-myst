// import { nodeResolve } from '@rollup/plugin-node-resolve'
// import { terser } from 'rollup-plugin-terser'

import babel from '@rollup/plugin-babel'

// transpile ES6/7 code
// This follows micromark-build,
// to replace unnecessary asserts.
const babelPlugin = babel({
    babelHelpers: 'bundled',
    plugins: [
        [
            'babel-plugin-unassert',
            {
                modules: [
                    'assert',
                    'node:assert',
                    'power-assert',
                    'uvu/assert',
                ],
            },
        ],
    ],
})

export default [
    {
        // Build for use as a node module
        input: ['src/index.js', 'src/extensions/index.js'],
        plugins: [babelPlugin],
        external: [
            '@unified-myst/process-roles-directives',
            '@unified-myst/break-extension',
            '@unified-myst/comment-extension',
            '@unified-myst/role-extension',
            '@unified-myst/target-extension',
            '@unified-myst/nested-parse',
            'ajv',
            'js-yaml',
            'lodash.merge',
            'mdast-util-from-markdown',
            'micromark-extension-frontmatter',
            'mdast-util-frontmatter',
            'micromark-extension-gfm-table',
            'mdast-util-gfm-table',
            'micromark-extension-gfm-footnote',
            'mdast-util-gfm-footnote',
            'unist-builder',
            'unist-util-visit',
        ],
        output: {
            dir: 'dist/module',
            format: 'esm',
            preserveModules: true,
            sourcemap: false,
        },
    },
    // {
    //     // Build for use as a browser module
    //     input: 'src/index.js',
    //     plugins: [
    //         // resolve third party modules in node_modules
    //         nodeResolve({
    //             browser: true,
    //         }),
    //     ],
    //     output: {
    //         file: 'dist/index.esm.min.js',
    //         format: 'esm',
    //         plugins: [terser()],
    //         sourcemap: true,
    //     },
    // },
]
