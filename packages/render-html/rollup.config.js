export default [
    {
        // Build for use as a node module
        input: ['src/index.js'],
        plugins: [],
        external: [
            '@unified-myst/core-parse',
            'mdast-util-to-hast',
            'hast-util-to-html',
        ],
        output: {
            dir: 'dist/module',
            format: 'esm',
            preserveModules: true,
            sourcemap: false,
        },
    },
]
