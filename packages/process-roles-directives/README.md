# `@unified-myst/process-roles-directives`

Utility for walking the AST and applying processors to roles and directives.

Note this package does not actually implement the processors.

Definition and footnote identifiers are scoped, such that content in a role or directive can only reference definitions/footnotes, specified within that directive, or specified in a parent construct, e.g.

``````markdown
```{note}
This can reference [a] and [b]

[b]: https://other.com
```
```{note}
This can reference [a] but NOT [b]
```
[a]: https://example.com
``````

## TODO

For directives, currently [Code](https://github.com/syntax-tree/mdast#code) nodes are searched for, where the code language is of the correct form (`{name}`).
Ideally though, directive syntax would be directly parsed at the token level, and the (unprocessed) node generated.
This probably requires <https://github.com/executablebooks/myst-spec/issues/7>

Make more performant (reduce tree walks)?
