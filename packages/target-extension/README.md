# `@unified-myst/target-extension`

Extension to support the MyST target syntax (`(name)=`) in [unified](https://unifiedjs.com/).

Semantically, a target is an identifier for referencing the preceding syntax block.

For example:

```markdown
(name)=
# Header
```

Allows for the header to be referenced by the identifier `name`.

Multiple targets can be defined, such that all identifiers will be applied to the preceding (non-target) syntax block, e.g.

```markdown
(name1)=
(name2)=
# Header
```

Targets must be unique, across the entire document.

## See Also

- [RST internal hyperlink targets](https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#hyperlink-targets)

## TODO

Parsing considerations:

- whitespace inside `(...)`
- target within other flow level elements
- What to do with non-whitespace after `=`?
  - Should it invalidate the line?
  - Should a new block be allowed?
- identifier normalisation?
