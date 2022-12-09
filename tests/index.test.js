import { transformAsync } from '@babel/core'
import { test } from 'uvu'
import * as assert from 'uvu/assert'


test('index', async () => {
   await testBasicCase()
	await testAliasedCtf()
	await testComponentTypeAnnotation()
	await testAliasedTypeAnnotation()
	await testDefaultProps()
   await testFallbackProps()
	await testRestElement()
	await testNoDestructuring()
	await testNoAnnotation()
	await testNestedDestructuring()
	await testPropRenaming()
	await testComponentInsideTsNamespace()
	await testNamedExport()

	await testDefaultPropsAndFallbackProps()
	await testDefaultPropsAndRestElement()
	await testDefaultPropsFallbackPropsAndRestElement()
	await testDefaultPropsFallbackPropsPropRenamingAndRestElement()
	await testDefaultPropsAndNestedDestructuring()
	await testDefaultPropsAndPropRenaming()
	await testFallbackPropsNoDestructuring()
	await testTwoComponentsBasicCase()
	await testTwoComponentsWithDefaultProps()
	await testPropRenamingWithComputedPropertyAccess()
	await testNestedComponents()
	await testNestedComponentsTypeAnnotation()
})

test.run()


async function testBasicCase() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component, component as comp } from 'undestructure-macros';
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


async function testComponentTypeAnnotation() {
	const src =
/*javascript*/`import type { Component } from 'solid-js';
const comp: Component = ({ a, b }) => {a; b;};
const comp2: Component<T> = ({ a, b }) => {a; b;};`

	const expectedOutput =
/*javascript*/`import type { Component } from 'solid-js';
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


async function testParentComponentTypeAnnotation() {
	const src =
/*javascript*/`import type { ParentComponent } from 'solid-js';
const comp: ParentComponent = ({ a, b }) => {a; b;};
const comp2: ParentComponent<T> = ({ a, b }) => {a; b;};`

	const expectedOutput =
/*javascript*/`import type { ParentComponent } from 'solid-js';
const comp: ParentComponent = _props => {
  _props.a;
  _props.b;
};
const comp2: ParentComponent<T> = _props2 => {
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
/*javascript*/`import type { Component, Component as Comp } from 'solid-js';
const comp: Component = ({ a, b }) => {a; b;};
const comp2: Comp<T> = ({ a, b }) => {a; b;};`

	const expectedOutput =
/*javascript*/`import type { Component, Component as Comp } from 'solid-js';
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

	assert.snapshot(res.code, expectedOutput, 'Aliased TS annotation.')
}


async function testDefaultProps() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
		import { component } from 'undestructure-macros';
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
	assert.ok(threw, 'Nested destructuring.')
}


async function testPropRenaming() {
	const src = /*javascript*/`
		import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
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
	assert.snapshot(res.code, expectedOutput, 'Default props + fallback props + rest element.')
}


async function testDefaultPropsFallbackPropsPropRenamingAndRestElement() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';
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
	assert.snapshot(res.code, expectedOutput, 'Default props + fallback props + prop renaming + rest element.')
}


async function testDefaultPropsAndNestedDestructuring() {
	const src = /*javascript*/`
		import { component } from 'undestructure-macros';
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
	const src = /*javascript*/`
		import { component } from 'undestructure-macros';
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
/*javascript*/`import { component } from 'undestructure-macros';
component((props = a) => {props.b});`

	const expectedOutput =
/*javascript*/`(props = a) => {
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
/*javascript*/`import { component } from 'undestructure-macros';
component(({ a, b }) => {a; b;});
component(({ c, d }) => {c; d;});`

	const expectedOutput =
/*javascript*/`_props => {
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
/*javascript*/`import { component } from 'undestructure-macros';
component(({ a = 1, b = 2 }) => {a; b;});
component(({ c = 3, d = 4 }) => {c; d;});`

	const expectedOutput =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";
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


async function testPropRenamingWithComputedPropertyAccess() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';
component(({ "!@#$": b }) => {b;});`

	const expectedOutput =
/*javascript*/`_props => {
  _props["!@#$"];
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Prop renaming with computed property access.')
}


async function testComponentInsideTsNamespace() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';

export namespace Foo{
	export const Bar = component(({ a }) => {a;});
}`

	const expectedOutput =
/*javascript*/`export namespace Foo {
  export const Bar = _props => {
    _props.a;
  };
}`

	const res = await transformAsync(
		src,
		{ plugins: ["@babel/plugin-syntax-typescript", "./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Component inside TS namespace')
}

async function testNamedExport() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';

export const Bar = component(({ a }) => {a;});
`

	const expectedOutput =
/*javascript*/`export const Bar = _props => {
  _props.a;
};`

	const res = await transformAsync(
		src,
		{ plugins: ["./src/index.cjs"] }
	)
	assert.snapshot(res.code, expectedOutput, 'Named export')
}

// Test deep nested multiple components
async function testNestedComponents() {
	const src =
/*javascript*/`import { component } from 'undestructure-macros';

export const Parent = component(({ a }) => {
	a;
	const Child1 = component(({ b }) => {
		a; b;
		const GrandChild1 = component(({ c }) => {
			a; b; c;
		});
		const GrandChild2 = component(({ d }) => {
			a; b; d;
		});
	});
	const Child2 = component(({ e }) => {
		a; e;
		const GrandChild3 = component(({ f }) => {
			a; e; f;
		});
		const GrandChild4 = component(({ g }) => {
			a; e; g;
		});
	});
});`

	const expectedOutput =
/*javascript*/`export const Parent = _props => {
  _props.a;
  const Child1 = _props2 => {
    _props.a;
    _props2.b;
    const GrandChild1 = _props3 => {
      _props.a;
      _props2.b;
      _props3.c;
    };
    const GrandChild2 = _props4 => {
      _props.a;
      _props2.b;
      _props4.d;
    };
  };
  const Child2 = _props5 => {
    _props.a;
    _props5.e;
    const GrandChild3 = _props6 => {
      _props.a;
      _props5.e;
      _props6.f;
    };
    const GrandChild4 = _props7 => {
      _props.a;
      _props5.e;
      _props7.g;
    };
  };
};`

	let res
	try {
		res = await transformAsync(
			src,
			{ plugins: ["./src/index.cjs"] }
		)
	}
	catch (e) {
		assert.unreachable(e.message);
	}
	assert.snapshot(res.code, expectedOutput, 'Nested components')
}

async function testNestedComponentsTypeAnnotation() {
	const src =
/*javascript*/`import { Component } from 'solid-js';

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

	const expectedOutput = /*javascript*/`import { Component } from 'solid-js';
export const Parent: Component = _props => {
  _props.a;
  const Child1: Component = _props2 => {
    _props.a;
    _props2.b;
    const GrandChild1: Component = _props3 => {
      _props.a;
      _props2.b;
      _props3.c;
    };
    const GrandChild2: Component = _props4 => {
      _props.a;
      _props2.b;
      _props4.d;
    };
  };
  const Child2: Component = _props5 => {
    _props.a;
    _props5.e;
    const GrandChild3: Component = _props6 => {
      _props.a;
      _props5.e;
      _props6.f;
    };
    const GrandChild4: Component = _props7 => {
      _props.a;
      _props5.e;
      _props7.g;
    };
  };
};`

	let res
	try {
		res = await transformAsync(
			src,
			{ plugins: ["@babel/plugin-syntax-typescript", "./src/index.cjs"] }
		)
	}
	catch (e) {
		assert.unreachable(e.message)
	}
	assert.snapshot(res.code, expectedOutput, 'Nested components with type annotation')
}