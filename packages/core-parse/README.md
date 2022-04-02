# `@unified-myst/core-parse`

The core entry point for MyST parsing in [unified](https://unifiedjs.com/).

## Quickstart

```javascript
import { Processor } from '@unified-myst/core-parse'

const parser = new Processor()
const result = parser.toAst('Hello world!')
console.log(JSON.stringify(result.ast, null, '  '))
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

- Run all `beforeConfig` event hooks, by priority order.
  - `beforeConfig` processors are operations which modify the config, before it is validated.

- Run all `beforeRead` event hooks, by priority order.
  - `beforeRead` processors are operations which initialise global state adn can also modify the source text.

- Parse the source text into [micromark tokens](https://github.com/micromark/micromark#parse).
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

- Run all `afterRead` event hooks, by priority order.
  - `afterRead` processors are operations which modify the syntax tree.

- Run all `afterTransforms` event hooks, by priority order.
  - `afterTransforms` processors are operations which extract information from the syntax tree to the global state.

## Extension mechanism

TODO ...

Everything is an extension!

```javascript
import { Processor } from '@unified-myst/core-parse'

myExtension = {
  name: 'myExtension',
  roles: {rname: {processor}},
  directives: {dname: {processor}},
  hooks: {afterRead: {tname: {priority: 100, processor}}},
  config: {cname: {default: '', type: 'string'}},
}
parser = Processor().addExtension(myExtension)
parser.setConfig({myExtension: {cname: 'value'}})
result = parser.toAst('hallo')
```

Disabling extensions, and even specific directives/roles/transforms within an extension.

Add introspection to the parser, e.g. order of transforms.

## Design decisions

The design is intended to quite closely mirror that of [docutils](https://docutils.sourceforge.io) and [Sphinx](https://www.sphinx-doc.org).
Their documentation generation and extension mechanism has been developed over many years, and has a relatively large community.
So the similar API will facilitate for porting of existing Sphinx extensions.

It diverges from docutils/Sphinx though, in a number of key ways, to address some design shortfalls (in my opinion) of that system.

Firstly, the underlying AST is based on [MDAST](https://github.com/syntax-tree/mdast), rather than docutils nodes.
The key improvement of MDAST, is that it is JSONable, allowing for serialisation into a language agnostic format.
Together with [myst-spec](https://github.com/executablebooks/myst-spec), this allows for a better separation of concerns, between AST generation (e.g. parsing from Markdown) and rendering (e.g. outputting HTML).
It can also be inspected and manipulated by mdast's existing [ecosystem of utilities](https://github.com/syntax-tree/mdast#list-of-utilities).

Similarly, for configuration, this is parsed in a JSON format, and extensions can add their own configuration options, that include a [JSON Schema](https://json-schema.org/) "stub" to validate a specific configuration key.
In this way, a schema can be auto-generated, to validate the entire configuration in a language agnostic manner.
Configuration variables are also name-spaced by extension name, to make it clearer and avoid key clashes.

Improvements to the extension API... extensions are first-class citizens

transforms -> afterRead event hooks

non-global roles and directives

Introspectable parser: get config schema, see what roles/directives/transforms are loaded, ...

## TODO

- Is there any difference between [GFM footnotes](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes) and [Pandoc footnotes](https://pandoc.org/MANUAL.html#footnotes) (which is also the basis for [markdown-it footnotes](https://mdit-py-plugins.readthedocs.io/en/latest/#footnotes))?

- Add Logging (and create error nodes)

- allow for roles/directives/transforms to read/write to a document wide state object, and also access the config

- Allow for extensions to hook into "events", e.g. before/after parsing
  - See <https://www.sphinx-doc.org/en/master/extdev/appapi.html#sphinx-core-events>
  - with priority
  - should transforms actually just be an event?

- Errors with node-resolve when trying to build the browser bundle

- Errors with workspace build of types, because of wrong order (since core-parse depends on other packages)

- Minimise AST walks:
  - Concept of transforms that are purely data collectors
    - Then they can be run at the same time, rather than performing multiple AST walks
    - Maybe even just separate to transforms (and run after)?
    - Probably just be an event
