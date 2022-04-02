# `@unified-myst/core-parse`

The core entry point for MyST parsing in [unified](https://unifiedjs.com/).

## Quickstart

```javascript
import { Parser } from '@unified-myst/core-parse'

const parser = new Parser()
const ast = parser.toAst('Hello world!')
console.log(JSON.stringify(ast, null, '  '))
```

yields:

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "Hello world!",
          "position": {
            "start": {
              "line": 1,
              "column": 1,
              "offset": 0
            },
            "end": {
              "line": 1,
              "column": 13,
              "offset": 12
            }
          }
        }
      ],
      "position": {
        "start": {
          "line": 1,
          "column": 1,
          "offset": 0
        },
        "end": {
          "line": 1,
          "column": 13,
          "offset": 12
        }
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1,
      "offset": 0
    },
    "end": {
      "line": 1,
      "column": 13,
      "offset": 12
    }
  }
}
```

## Parsing process

The parsing process is as follows:

- Parse the input text into [micromark tokens](https://github.com/micromark/micromark#parse).
  - These can be loosely regarded as a Concrete Syntax Tree (CST), directly mapping to the original source text.
  - The tokenizer is based on the [CommonMark](https://commonmark.org/) specification, with the additional core syntax extensions:
    - [YAML front-matter](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block)
    - [GFM tables](https://github.github.com/gfm/#tables-extension-)
    - [GFM footnotes](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes)
    - MyST targets
    - MyST breaks
    - MyST roles
    - MyST comments
  - At this point roles and directives are single tokens, and their content is not yet processed.

- Compile the tokens into an [MDAST syntax tree](https://github.com/syntax-tree/mdast)

- Walk the syntax tree and process all roles and directives, into additional syntax nodes.
  - See [`@unified-myst/process-roles-directives`](https://github.com/executablebooks/unified-myst/tree/main/packages/process-roles-directives#readme)

- Apply all transforms to the syntax tree, by priority order.
  - Transforms are operations which modify the syntax tree.
  - They can also be used to extract information from the syntax tree.

## Extension mechanism

TODO ...

Everything is an extension!

```javascript
import { Parser } from '@unified-myst/core-parse'

myExtension = {
  name: 'myExtension',
  roles: {rname: {processor}},
  directives: {dname: {processor}},
  transforms: {tname: {priority: 100, processor}},
  config: {cname: {default: '', type: 'string'}},
}
parser = Parser().addExtension(myExtension)
parser.setConfig({myExtension: {cname: 'value'}})
ast = parser.toAst('hallo')
```

Disabling extensions, and even specific directives/roles/transforms within an extension.

Add introspection to the parser, e.g. order of transforms.

## Design decisions

The design is intended to quite closely mirror that of [docutils](https://docutils.sourceforge.io) and [Sphinx](https://www.sphinx-doc.org).
Their documentation generation and extension mechanism has been developed over many years, and has a relatively large community.
So the similar API will facilitate for porting of existing Sphinx extensions.

It diverges from docutils/Sphinx though, in a number of key ways, to address some design shortfalls (in my opinion) of that system.

Firstly, the underlying AST is based on [MDAST](https://github.com/syntax-tree/mdast), rather than docutils nodes.
The key improvement of MDAST, is that it is JSONable, allowing for serialisation into a language agnostic format, and also for it to be manipulated/inspected by mdast's wide [ecosystem of utilities](https://github.com/syntax-tree/mdast#list-of-utilities).

Where possible, everything should be an extension and serializable to JSON.

non-global roles and directives

Introspectable parser: get config schema, see what roles/directives/transforms are loaded, ...

## TODO

- Is there any difference between [GFM footnotes](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes) and [Pandoc footnotes](https://pandoc.org/MANUAL.html#footnotes) (which is also the basis for [markdown-it footnotes](https://mdit-py-plugins.readthedocs.io/en/latest/#footnotes))?

- Add Logging (and create error nodes)

- Errors with node-resolve when trying to build the browser bundle

- Errors with workspace build of types, because of wrong order (since core-parse depends on other packages)

- Minimise AST walks:
  - Concept of transforms that are purely data collectors
    - Then they can be run at the same time, rather than performing multiple AST walks
    - Maybe even just separate to transforms (and run after)?
