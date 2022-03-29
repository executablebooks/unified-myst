# `@unified-myst/break-extension`

Extension to support the MyST block break syntax (`+++ {}`) in [unified](https://unifiedjs.com/).

A MyST block break is equivalent to a CommonMark [thematic break](https://spec.commonmark.org/0.30/#thematic-breaks),
except it allows a inline JSON dictionary to be added after the marker, containing metadata about the block.

For example:

```markdown
Paragraph 1

+++ {"type": "slide"}

Paragraph 2
```

## TODO

Should the content be enforced as JSON dictionary at parse?
