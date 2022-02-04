const { transformAsync } = require("@babel/core")


// Change the following code and and run `npm run playground`
const src=`import { Component } from 'solid-js'
import x from 'babel-plugin-solid-undestructure'
const MyComp: Component<T> = ({ a, b, c, ...other }) => {a; b; c; other;}`


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
