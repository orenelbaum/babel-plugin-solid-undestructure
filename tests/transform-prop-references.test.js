import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import babelGenerator from "@babel/generator"
import { getPropsInfo } from '../src/get-props-info.cjs'
import { createNewPropsIdentifier } from '../src/create-new-props-identifier.cjs'
import { transformPropReferences } from '../src/transform-prop-references.cjs'

const traverse = babelTraverse.default
const generate = babelGenerator.default


test('transformPropReferences', () => {
	const assertAddMergePropsCall = (code, expects, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: funcPath => {
            const state = {}
            getPropsInfo(funcPath, state)
            createNewPropsIdentifier(funcPath, state)
				transformPropReferences(funcPath, state)
				funcPath.transformed = true
			}
		})

      const output = generate(ast, {}, code)

      assert.snapshot(output.code, expects, msg)
	}


	const src1 =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a, b }) => {a; b;});`

	const expectedOutput1 =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({
  a,
  b
}) => {
  _props.a;
  _props.b;
});`

	assertAddMergePropsCall(
		src1,
		expectedOutput1,
		"Basic case."
	)


	const src2 =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ a: c, b: d }) => {a; b; c; d;});`

	const expectedOutput2 =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({
  a: c,
  b: d
}) => {
  a;
  b;
  _props.a;
  _props.b;
});`

	assertAddMergePropsCall(
		src2,
		expectedOutput2,
		"PropRenaming."
	)
})

test.run()
