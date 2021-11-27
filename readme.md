# babel-plugin-solid-undestrcture

<p align="center">
  <img
    src="https://github.com/orenelbaum/babel-plugin-solid-undestructure/blob/main/example.png?raw=true"
    alt="Usage example"
    style="width: 80%; height: auto;"
  />
</p>

This babel plugin allows you to destructure your props in your Solid components without losing reactivity.

The plugin will "un-destructure" your props at build time, so the code you pass into the Solid compiler will not have destructured props at runtime. Instead the props will be accessed the normal way with `props.someProp`.

This plugin has two modes: TypeScript mode and vanilla JavaScript mode.

This plugin is in early development and it's not recommended for use in production.


## TypeScript mode

The TypeScript mode is the mode used by default.
It transforms all arrow function components which are part of a variable declaration with a `Component` type annotation.

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


## Vanilla Javascript mode

The Vanilla Javascript mode can be used if you are using vanilla JS or you don't want to rely on types to manipulate runtime behavior like the Typescript mode does.
It transforms all component that are wrapped in the `component` compile-time function provided by this plugin.

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
import { undestructurePlugin } from "undestructure-exp"
```

### TypeScript mode

Add this to the top of the plugin list in your Vite config:

```js
...undestructurePlugin("ts")
```

### Vanilla JavaScript mode

In your Vite config, find the your vite-plugin-solid initialization (in the default Solid template it will be imported as `solidPlugin`).

The first argument this initialization function takes, is the options object.

Add this field to the initializer options:
```js
babel: {
	plugins: [undestructurePlugin("vanilla-js")]
} 
```
