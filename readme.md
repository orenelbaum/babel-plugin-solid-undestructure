# babel-plugin-solid-undestrcture

This babel plugin allows you to destructure your props in your Solid components without losing reactivity.

The plugin will "un-destructure" your props at build time, so the code you pass into the Solid compiler will not have destructured props. Instead the props will be accessed the normal way with `props.someProp`.

This plugin has two modes: a safe TypeScript mode and an unsafe JavaScript mode for vanilla JS users. A safe JavaScript mode is probably coming soon.

Using the Typescript mode with Vite currently requires disabling esbuild (see the section about the Typescript mode).

This plugin is in early development, so don't use this plugin in production without testing your code


## TypeScript mode

The TypeScript mode is the mode used by default.
It only transforms arrow components which are part of a variable declaration with a `Component` type annotation.

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

In this example, MyComponent won't be transformed.


## Unsafe JavaScript mode

**Disclaimer:** *Using the unsafe JavaScript mode could potentially break your code. Don't use it without testing. See more about safety below.*

The unsafe JavaScript mode is the only way to use this plugin without TypeScript at the moment. It "un-destructures" all of the functions in the code you feed to the plugin (with some exceptions, see options).
If you are using Solid with TypeScript don't use this mode, use the TypeScript mode.

You can use the unsafe JavaSript mode by setting the `mode` option to `js-unsafe`.

### Safety - Short version: ###
this unsafe JavaScript mode is not likely to (I think), but could break your code. If that's a deal breaker for you, I'm planning to create a safe JavaScript mode, so stay tuned.

### Safety - Long version: ###
The way this unsafe JavaScript mode works by default is by transforming every function declaration, function expression and arrow function in your code. This can be customized to some degree, but there is no way to configure the plugin to run only on solid components.

The reason for that is that Solid components don't necessarily have any distinguishing features from other functions, so there is no way for the plugin to know for sure which functions are component which aren't.

That means that the plugin is likely to "un-destructure" the first argument of functions which are not components. I don't think that it's likely to break anything, the only way I can think about that this plugin will break your code is if you feed into it functions that rely on the first argument being destructured, because if you "un-destrucutre" the first argument and access the properties of that argument with dot notation, it will either call a function with the argument as `this`, or will trigger a getter, a setter or a proxy.

So if your code relies on destructering in this way, it will break.

That being said, it is possible to transform only Solid components by adding a distinguisher. This is what the TypeScript mode does, it only transforms components with the `Component` type. This will also be possible with the safe JavaScript mode that is probably coming soon. The safe JavaScript mode will require you to wrap your components in a function that will act as a distinguisher.

So if you are worried about the unsafe JavaScript mode breaking your code, you can wait for the safe JavaScript version.

This plugin has some additional options that affect the safety. By default, in unsafe JavaScript mode the plugin will transform only function declarations and arrow functions. If you are not using any of the options you can turn them off to make the unsafe JavaScript mode slightly safer.


## Configuring Vite

Install the plugin with 

```sh
npm i -D babel-plugin-solid-undestructure
```

### TypeScript mode

Add this to the top of the plugin list in your Vite config:
```js
{
    ...babel({
        plugins: [
            ["@babel/plugin-syntax-typescript", { isTSX: true }],
            "./src/lib/babel-plugin-undestructure.js",
        ],
        extensions: [".tsx"]
    }),
    enforce: 'pre'
},
```

If you want this plugin to work with `.ts` files as well, add this this to the top of the plugin list as well:
```js
{
    ...babel({
        plugins: [
            "@babel/plugin-syntax-typescript",
            "./src/lib/babel-plugin-undestructure.js",
        ],
        extensions: [".ts"]
    }),
    enforce: 'pre'
},
```

### Unsafe JavaScript mode

In your Vite config, find the your vite-plugin-solid initialization.

The first argument this initialization function takes, is the options.

Add this to the initializer options:
```js
babel: {
    plugins: [ "babel-plugin-solid-undestructure" ]
}
```

If you want to configure this babel plugin, add this instead:
```js
babel: {
    plugins: [
        [
            "babel-plugin-solid-undestructure", 
            { 
                // Options go here
            }
        ]
    ]
}
```


## Options

`mode`

type: "ts" | "js-unsafe"

default: "ts"

Set the mode to TypeScript mode or unsafe JavaScript mode. See more about each mode above.

### Unsafe JavaScript mode options

These options control which types of functions will be transformed and which won't in unsafe JavaScript mode.

`functionDeclaration`

Type: boolean

Default: true

Controls whether function declarations will be transformed or not.

`arrowFunction`

Type: boolean

Default: true

Controls whether arrow functions will be transformed or not.

`functionExpression`

Type: boolean

Default: false

Controls whether function expressions will be transformed or not.

`objectMethod`

Type: boolean

Default: false

Controls whether object methods will be transformed or not.

`classMethod`

Type: boolean

Default: false

Controls whether class methods will be transformed or not.
