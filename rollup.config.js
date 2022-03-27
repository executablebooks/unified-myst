import {nodeResolve} from '@rollup/plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'

export default {
  input: "src/index.js",
  plugins: [
    nodeResolve({browser: true}) // resolve third party modules in node_modules
  ],
  output: [
    {
      file: "dist/esm/index.js",
      format: "esm",
      sourcemap: true
    },
    {
      file: "dist/esm/index.min.js",
      format: "esm",
      plugins: [terser()],
      sourcemap: true
    }
  ]
}
