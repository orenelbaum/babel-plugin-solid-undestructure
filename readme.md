# babel-plugin-solid-undestructure

This Babel plugin allows you to destructure your props in your Solid components without losing reactivity.

The plugin will "un-destructure" your props at build time, so the code you pass into the Solid compiler will not have destructured props at runtime. Instead the props will be accessed the normal way with `props.someProp`.

Usage with examples:

```jsx
// Use the `Component` type to mark components that will be transformed by the plugin.

import { Component } from 'solid-js'
const MyComp: Component<...> = ({ a, b, c }) => {a; b; c;}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { Component } from 'solid-js'
const MyComp: Component<...> = props => {props.a; props.b; props.c;}


// You can use a compile time function instead of using the `Component` type (works with vanilla JS).

import { component } from 'babel-plugin-solid-undestructure'
const MyComp = component(({ a, b, c }) => {a; b; c;})

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

const MyComp = props => {props.a; props.b; props.c;}


// You can use default props.

import { Component } from 'solid-js'
const MyComp: Component<...> = (
  { a = 1, b = 2, c = 3 } = defaultProps
) => {a; b; c;}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { Component, mergeProps } from 'solid-js'
const MyComp: Component<...> = props => {
  props = mergeProps(defaultProps, { a: 1, b: 2, c: 3 }, props)
  props.a; props.b; props.c;
}


// You can rename props.

import { Component } from 'solid-js'
const MyComp: Component<...> = (
  { a: d, b: e, c: f } = defaultProps
) => {d; e; f;}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { Component, mergeProps } from 'solid-js'
const MyComp: Component<...> = props => {
  props.a; props.b; props.c;
}


// You can use rest element destructuring.

import { Component } from 'solid-js'
const MyComp: Component<...> = ({ a, b, c, ...other }) => {a; b; c; other;}

//  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

import { Component, splitProps } from 'solid-js'
const MyComp: Component<...> = props => {
  let other;
  [props, other] = splitProps(props, ["a", "b", "c"])
  props.a; props.b; props.c; other;
}
```

See also [undestructure-example](https://github.com/orenelbaum/undestructure-example).

This plugin is still in early development and still has some bugs.

## `Component` type annotation

When this option is enabled (it is enabled by default), the plugin transforms all arrow function components which are part of a variable declaration with a `Component` type annotation.

The type annotation must be a direct reference to the Solid `Component` type import, or an annotation of the form `Solid.Component` where `Solid` is a reference to the default import of Solid.

In both cases you can use the 'import as' syntax.

Examples:

```tsx
import { Component } from 'solid-js'

const MyComponent: Component = // ...
```

```tsx
import Solid from 'solid-js'

const MyComponent: Solid.Component = // ...
```

```tsx
import { Component as ComponentAlias } from 'solid-js'

const MyComponent: ComponentAlias = // ...
```

This example won't work:

```tsx
import { Component } from 'solid-js'

type ComponentAlias = Component

const MyComponent: ComponentAlias = // ...
```

In this last example, `MyComponent` won't be transformed.


## Compile type function annotation (supports vanilla JS)

This option can be used if you are using vanilla JS or you don't want to rely on types to manipulate runtime behavior like the type annotation does.
When this option is enabled (it is enabled by default), the plugin transforms all component that are wrapped in the `component` compile-time function provided by this plugin.

The `component` compile-time function must be a direct reference to the `component` named export from `babel-plugin-solid-undestructure`

You can also use the 'import as' syntax.

Examples:

```jsx
import { component } from 'babel-plugin-solid-undestructure'

const MyComponent = component(/* your component goes here. */)
```

```tsx
import { component as c } from 'babel-plugin-solid-undestructure'

const MyComponent = c(/* your component goes here. */)
```

This example won't work:

```tsx
import { component } from 'babel-plugin-solid-undestructure'

const c = component

const MyComponent = c(/* your component goes here. */)
```

In this last example, `MyComponent` won't be transformed.


## Configuring Vite

Install the plugin with 

```sh
npm i -D babel-plugin-solid-undestructure
```

In your Vite config, import `undestructurePlugin` from `babel-plugin-solid-undestructure`

```js
import { undestructurePlugin } from "babel-plugin-solid-undestructure"
```

### TS with Type annotation support

If your'e working with TypeScript code and you want to use the `Component` type annotation, add this to the top of the plugin list in your Vite config:

```js
...undestructurePlugin("ts")
```

With this configuration you can use both the `Component` type and the `component` compile time function to annotate components.

### TS or vanilla JS, no type annotation support

In your Vite config, find the your vite-plugin-solid initialization (in the default Solid template it will be imported as `solidPlugin`).

The first argument this initialization function takes, is the options object.

Add this field to the initializer options:
```js
babel: {
	plugins: [undestructurePlugin("vanilla-js")]
} 
```

With this configuration you can use both the `Component` type and the `component` compile time function to annotate components.



## Other cool plugins for Solid:

- https://github.com/orenelbaum/babel-plugin-reactivars-solid - Svelte like "reactive variables" for Solid that lets you pass reactive variables (getter + setter) around in a concise way (also made by me).
- https://github.com/LXSMNSYC/babel-plugin-solid-labels - Solid labels is more of an all in one plugin. It has reactive variables, prop destructuring (like this plugin) and some more stuff.
- https://github.com/LXSMNSYC/solid-sfc - An experimental SFC compiler for SolidJS.
