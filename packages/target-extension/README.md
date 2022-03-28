# `@unified-myst/target-extension`

Extension to support the MyST target syntax (`(name)=`) in [unified](https://unifiedjs.com/).

## TODO

Parsing considerations:

- whitespace inside `(...)`
- target within other flow level elements
- What to do with non-whitespace after `=`?
  - Should it invalidate the line?
  - Should a new block be allowed?
- identifier normalisation?
