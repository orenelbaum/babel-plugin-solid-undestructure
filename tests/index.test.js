import { transformAsync } from '@babel/core'
import { test } from 'uvu'
import * as assert from 'uvu/assert'


test('index', async () => {
   await testBasicCase()
	await testAliasedCtf()
	await testTypeAnnotation()
	await testDefaultProps()
   await testFallbackProps()
	await testRestElement()
	await testNoDestructuring()
	await testNoAnnotation()
	await testNestedDestructuring()
	await testPropRenaming()

	await testDefaultPropsAndFallbackProps()
	await testDefaultPropsAndRestElement()
	await testDefaultPropsFallbackPropsAndRestElement()
	await testDefaultPropsFallbackPropsPropRenamingAndRestElement()
	await testDefaultPropsAndNestedDestructuring()
	await testDefaultPropsAndPropRenaming()
	await testFallbackPropsNoDestructuring()
	await testTwoComponentsBasicCase()
	await testTwoComponentsWithDefaultProps()
})

test.run()


async function testBasicCase() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a, b }) => {a; b;});`

	const expectedOutput =
/*javascript*/`_props => {
  _props.a;
  _props.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Basic case.')
}


async function testAliasedCtf() {
	const src =
/*javascript*/`import { component, component as comp } from 'babel-plugin-solid-undestructure';
component(({ a, b }) => {a; b;});
comp(({ a, b }) => {a; b;});`

	const expectedOutput =
/*javascript*/`_props => {
  _props.a;
  _props.b;
};

_props2 => {
  _props2.a;
  _props2.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Aliased CTF.')
}


async function testTypeAnnotation() {
	const src =
/*javascript*/`import { Component } from 'solid-js';
const comp: Component = ({ a, b }) => {a; b;};
const comp2: Component<T> = ({ a, b }) => {a; b;};`

	const expectedOutput =
/*javascript*/`import { Component } from 'solid-js';

const comp: Component = _props => {
  _props.a;
  _props.b;
};

const comp2: Component<T> = _props2 => {
  _props2.a;
  _props2.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["@babel/plugin-syntax-typescript", "./src/index.cjs"] }
	)

	assert.snapshot(res.code, expectedOutput, 'TS annotation.')
}


async function testAliasedTypeAnnotation() {
	const src =
/*javascript*/`import { Component, Component as Comp } from 'solid-js';
const comp: Component = ({ a, b }) => {a; b;};
const comp2: Component<T> = ({ a, b }) => {a; b;};`

	const expectedOutput =
/*javascript*/`import { Component } from 'solid-js';

const comp: Component = _props => {
  _props.a;
  _props.b;
};

const comp2: Comp<T> = _props2 => {
  _props2.a;
  _props2.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["@babel/plugin-syntax-typescript", "./src/index.cjs"] }
	)

	assert.snapshot(res.code, expectedOutput, 'TS annotation.')
}


async function testDefaultProps() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a = 1, b = 2 }) => {a; b;});`

	const expectedOutput =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";

_props => {
  _props = _mergeProps({
    a: 1,
    b: 2
  }, _props);
  _props.a;
  _props.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Default props.')
}


async function testFallbackProps() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a, b } = c) => {a; b;});`

	const expectedOutput =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";

_props => {
  _props = _mergeProps(c, {}, _props);
  _props.a;
  _props.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Fallback props.')
}


async function testRestElement() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a, b, c, ...other }) => {a; b; c; other;});`

	const expectedOutput =
/*javascript*/`import { splitProps as _splitProps } from "solid-js";

_props => {
  let other;
  [_props, other] = _splitProps(_props, ["a", "b", "c"]);
  _props.a;
  _props.b;
  _props.c;
  other;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Rest element.')
}


async function testNoDestructuring() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(props => {props.a});`

	const expectedOutput =
/*javascript*/`props => {
  props.a;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'No destructuring.')
}


async function testNoAnnotation() {
	const src =
/*javascript*/`props => {props.a};`

	const expectedOutput =
/*javascript*/`props => {
  props.a;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'No destructuring.')
}


async function testNestedDestructuring() {
	const src = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure';
		component(({ a: { b } }) => {b;});
	`

	let threw = true
	try {
		await transformAsync(
			src,
			{ plugins: ["./src/index.cjs"] }
		)
		threw = false
	} catch {}
	assert.ok(threw, 'Nested desctructuring.')
}


async function testPropRenaming() {
	const src = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure';
		component(({ a: b }) => {b;});
	`

	let threw = true
	try {
		await transformAsync(
			src,
			{ plugins: ["./src/index.cjs"] }
		)
		threw = false
	} catch {}
	assert.not.ok(threw, 'Prop renaming.')
}


async function testDefaultPropsAndFallbackProps() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a = 1, b = 2 } = c) => {a; b;});`

	const expectedOutput =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";

_props => {
  _props = _mergeProps(c, {
    a: 1,
    b: 2
  }, _props);
  _props.a;
  _props.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Default props + fallback props.')
}


async function testDefaultPropsAndRestElement() {
	const src =
/*javascript*/ `import { component } from 'babel-plugin-solid-undestructure';
component(({ a = 1, b = 2, c = 3, ...other }) => {a; b; c;});`

	const expectedOutput =
/*javascript*/`import { splitProps as _splitProps } from "solid-js";
import { mergeProps as _mergeProps } from "solid-js";

_props => {
  let other;
  [_props, other] = _splitProps(_props, ["a", "b", "c"]);
  _props = _mergeProps({
    a: 1,
    b: 2,
    c: 3
  }, _props);
  _props.a;
  _props.b;
  _props.c;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Default props + rest element.')
}


async function testDefaultPropsFallbackPropsAndRestElement() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a = 1, b = 2, c = 3, ...other } = fallback) => {a; b; c;});`

	const expectedOutput =
/*javascript*/`import { splitProps as _splitProps } from "solid-js";
import { mergeProps as _mergeProps } from "solid-js";

_props => {
  let other;
  [_props, other] = _splitProps(_props, ["a", "b", "c"]);
  _props = _mergeProps(fallback, {
    a: 1,
    b: 2,
    c: 3
  }, _props);
  _props.a;
  _props.b;
  _props.c;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Default props + fallback props.')
}


async function testDefaultPropsFallbackPropsPropRenamingAndRestElement() {
	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a: d = 1, b: e = 2, c: f = 3, ...other } = fallback) => {a; b; c; d; e; f;});`

	const expectedOutput =
/*javascript*/`import { splitProps as _splitProps } from "solid-js";
import { mergeProps as _mergeProps } from "solid-js";

_props => {
  let other;
  [_props, other] = _splitProps(_props, ["a", "b", "c"]);
  _props = _mergeProps(fallback, {
    a: 1,
    b: 2,
    c: 3
  }, _props);
  a;
  b;
  c;
  _props.a;
  _props.b;
  _props.c;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	console.log(res.code);
	assert.snapshot(res.code, expectedOutput, 'Default props + fallback props.')
}


async function testDefaultPropsAndNestedDestructuring() {
	const src = /*javascript*/ `
		import { component } from 'babel-plugin-solid-undestructure';
		component(({ a: { b } = c }) => {b;});
	`

	let threw = true
	try {
		await transformAsync(
			src,
			{ plugins: ["./src/index.cjs"] }
		)
		threw = false
	} catch {}
	assert.ok(threw, 'Default props + nested destructuring.')
}


async function testDefaultPropsAndPropRenaming() {
	const src = /*javascript*/ `
		import { component } from 'babel-plugin-solid-undestructure';
		component(({ a: b = c }) => {b;});
	`

	let threw = true
	try {
		await transformAsync(
			src,
			{ plugins: ["./src/index.cjs"] }
		)
		threw = false
	} catch {}
	assert.not.ok(threw, 'Default props + prop renaming.')
}


async function testFallbackPropsNoDestructuring() {
	const src =
/*javascript*/ `import { component } from 'babel-plugin-solid-undestructure';
component((props = a) => {props.b});`

	const expectedOutput =
/*javascript*/ `(props = a) => {
  props.b;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Fallback props + no destructuring.')
}


async function testTwoComponentsBasicCase() {
	const src =
/*javascript*/ `import { component } from 'babel-plugin-solid-undestructure';
component(({ a, b }) => {a; b;});
component(({ c, d }) => {c; d;});`

	const expectedOutput =
/*javascript*/ `_props => {
  _props.a;
  _props.b;
};

_props2 => {
  _props2.c;
  _props2.d;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Two components, basic case.')
}


async function testTwoComponentsWithDefaultProps() {
	const src =
/*javascript*/ `import { component } from 'babel-plugin-solid-undestructure';
component(({ a = 1, b = 2 }) => {a; b;});
component(({ c = 3, d = 4 }) => {c; d;});`

	const expectedOutput =
/*javascript*/ `import { mergeProps as _mergeProps } from "solid-js";

_props => {
  _props = _mergeProps({
    a: 1,
    b: 2
  }, _props);
  _props.a;
  _props.b;
};

_props2 => {
  _props2 = _mergeProps({
    c: 3,
    d: 4
  }, _props2);
  _props2.c;
  _props2.d;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Two components with default props.')
}
