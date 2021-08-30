# babel-plugin-solid-undestrcture

This babel plugin allows you to destructure your props in your Solid components without losing reactivity.

The plugin will "un-destructure" your props at build time, so the code you pass into the Solid compiler will not have destructured props. Instead the props will be accessed the normal way with `props.someProp`.

**Disclaimer:** *This plugin could potentially break your code. Don't use it without testing. See more about safety below.*

## Usage with vite-plugin-solid

Install the plugin with 

```sh
npm i -D babel-plugin-solid-undestructure
```

In your vite config, find the your vite-plugin-solid initialization.

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


## Safety

### Short version: ###
this plugin is not likely to (I think), but could break your code. It's also in early development, So don't use this plugin in production without testing your code. If that's a deal breaker for you, I'm planning to create a safer version with TypeScript that is very unlikely to break your code, and maybe even add safety features to this plugin, so stay tuned.

### Long version: ###
The way this plugin works by default is by transforming every function declaration, function expression and arrow function in your code. This can be customized to some degree, but there is no way to configure the plugin to run only on solid components.

The reason for that is that Solid components don't necessarily have any distinguishing features from other functions, so there is no way for the plugin to know for sure which functions are component which aren't.

That means that the plugin is likely to "un-destructure" the first argument of functions which are not components. I don't think that it's likely to break anything, the only way I can think about that this plugin will break your code is if you feed into it functions that rely on the first argument being destructured, because if you "un-destrucutre" the first argument and access the properties of that argument with dot notation, it will either call a function with the argument as `this`, or will trigger a getter, a setter or a proxy.

So if your code relies on destructering in this way, it will break.

That being said, it is possible to transform only Solid components by adding a distinguisher. This is what I'm planning to do with a TypeScript version that only goes through components with the `Component` type. This will maybe also be possible with this plugin in the future, by wrapping your components with a special function, or some other distinguisher.

So if you are worried about this plugin breaking your code, you can wait for the TypeScript version.

This plugin has some options that affect the safety. By default the plugin will transform only function declarations, function expressions and arrow functions. If you are using TypeScript, you are probably only using arrow functions for your components, so you could make this plugin slightly safer by turning off function declarations and function expressions in the options.

## Options

The options control which types of functions will be transformed and which types won't be transformed.

`functionDeclaration`

Type: boolean

Default: false

Controls whether function declarations will be transformed or not.

`arrowFunction`

Type: boolean

Default: false

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
