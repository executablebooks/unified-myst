# `@unified-myst/comment-extension`

Extension to support the MyST comment syntax (`% comment string`) in [unified](https://unifiedjs.com/).

Semantically, a comment is text that should be visible in the final rendering.

A comment is denoted by a line starting with the `%` character.
All characters after that string are considered to be the comment string.
For consecutive comment lines, their comment strings are joined together with the `\n` character, into a single comment.

For example:

```
% This is a comment.
% This is another comment.
```

is converted to the HTML:

```html
<!-- This is a comment.
 This is another comment. -->
```
