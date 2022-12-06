const { transformAsync } = require("@babel/core")


// Change the following code and and run `pnpm run playground`
// const src=/*javascript*/`
// import { Component } from 'solid-js'
// import x from 'babel-plugin-solid-undestructure'
// const MyComp: Component<T> = ({ a, b, c, ...other }) => {a; b; c; other;}
// `
const src=/*javascript*/`import { Component } from 'solid-js';

export const Parent: Component = ({ a }) => {
	a;
	const Child1: Component = ({ b }) => {
		a; b;
		const GrandChild1: Component = ({ c }) => {
			a; b; c;
		};
		const GrandChild2: Component = ({ d }) => {
			a; b; d;
		};
	};
	const Child2: Component = ({ e }) => {
		a; e;
		const GrandChild3: Component = ({ f }) => {
			a; e; f;
		};
		const GrandChild4: Component = ({ g }) => {
			a; e; g;
		};
	};
};`


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
