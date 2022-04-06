# `@unified-myst/render-html`

Extends [`@unified-myst/core-parse`](../core-parse/README.md), to output HTML (via conversion to [HAST](https://github.com/syntax-tree/hast)).

```javascript
import { ProcessorHtml } from '@unified-myst/render-html'

const processor = new ProcessorHtml()

console.log(processor.toHtml('Hallo world!'))
// => '<p>Hallo world!</p>'
```
