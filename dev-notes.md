# Dev Notes


## Default Props VS Fallback Props

This plugin supports 2 different ways of declaring default props:
- `({ x = defaultX, y = defaultY }) => ...`
- `({ x, y } = { x = defaultX, y = defaultY }) => ...`

In the source code I will refer to the first way as default props and the second way as fallback props.
