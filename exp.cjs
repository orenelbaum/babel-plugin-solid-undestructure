const { transformAsync } = require("@babel/core");

(async () => {
   const src=/*javascript*/`
      import { component } from 'babel-plugin-solid-undestructure'
      const Child = component(({ count: c = 100, ...other }) => {
         // return (
         //    <button onclick={other.increment}>{c}</button>
         // );
      });
   `
   
   const res = await transformAsync(
      src,
      { plugins: ["./src/index.cjs"] }
   )
   
   console.log(res.code);
})()