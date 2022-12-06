const { transformAsync } = require("@babel/core")


// Change the following code and and run `pnpm run playground`
const src=/*javascript*/`
import { Component } from 'solid-js'
import x from 'undestructure-macros'
const MyComp: Component<T> = ({ a, b, c, ...other }) => {a; b; c; other;}
`


;(async () => {
   const res = await transformAsync(
      src,
      { plugins: [
         ["@babel/plugin-syntax-typescript", { isTSX: true }],
         "./src/index.cjs"
      ] }
   )

   console.log(res.code)
})()
