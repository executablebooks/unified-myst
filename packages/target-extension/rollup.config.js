import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

// transpile ES6/7 code
// This follows micromark-build,
// to replace unnecessary asserts and constant aliases.
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
        [
            'babel-plugin-inline-constants',
            {
                modules: [
                    'micromark-util-symbol/codes.js',
                    'micromark-util-symbol/constants.js',
                    'micromark-util-symbol/types.js',
                    'micromark-util-symbol/values.js',
                ],
            },
        ],
    ],
})

export default [
    {
        // Build for use as a node module
        input: 'src/index.js',
        plugins: [babelPlugin],
        external: ['micromark-factory-space', 'micromark-util-character'],
        output: {
            dir: 'dist/module',
            format: 'esm',
            preserveModules: true,
            sourcemap: false,
        },
    },
    {
        // Build for use as a browser module
        input: 'src/index.js',
        plugins: [
            babelPlugin,
            // resolve third party modules in node_modules
            nodeResolve({
                browser: true,
            }),
        ],
        output: {
            file: 'dist/index.esm.min.js',
            format: 'esm',
            plugins: [terser()],
            sourcemap: true,
        },
    },
]
