# `@unified-myst/role-extension`

Extension to support the MyST role syntax (``{name}`content` ``) in [unified](https://unifiedjs.com/).

A MyST role consists of a name, followed by a content string.
The content string is interpreted according to the name, and can be thought of as an inline extension point for Markdown, similar to a function call:

```javascript
function name(content) {return ast}
```
