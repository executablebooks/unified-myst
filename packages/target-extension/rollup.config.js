import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
    input: 'src/index.js',
    plugins: [
        babel({
            babelHelpers: 'bundled',
            // transpile ES6/7 code
            // This follows micromark-build, to replace unnecessary constant aliases.
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
        }),
    ],
    output: [
        {
            dir: 'dist/module',
            format: 'esm',
            preserveModules: true,
            sourcemap: true,
        },
        {
            file: 'dist/index.esm.min.js',
            format: 'esm',
            plugins: [
                nodeResolve({ browser: true }), // resolve third party modules in node_modules
                terser(),
            ],
            sourcemap: true,
        },
    ],
}
