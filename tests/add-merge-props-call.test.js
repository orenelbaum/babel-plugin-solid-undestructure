import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import babelGenerator from "@babel/generator"
import { addMergePropsCall } from '../src/add-merge-props-call.cjs'
import { getPropsInfo } from '../src/get-props-info.cjs'
import { createNewPropsIdentifier } from '../src/create-new-props-identifier.cjs'

const traverse = babelTraverse.default
const generate = babelGenerator.default


test('addMergePropsCall', () => {
	const assertAddMergePropsCall = (code, expects, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: funcPath => {
            const state = {}
            getPropsInfo(funcPath, state)
            createNewPropsIdentifier(funcPath, state)
				addMergePropsCall(funcPath, state)
				funcPath.transformed = true
			}
		})

      const output = generate(ast, {}, code)

      assert.snapshot(output.code, expects, msg)
	}


	const src1 =
/*javascript*/`import { component } from 'undestructure-macros';
component(({ someProp }) => {});`

	const expectedOutput1 =
/*javascript*/`import { component } from 'undestructure-macros';
component(({
  someProp
}) => {});`

	assertAddMergePropsCall(
		src1,
		expectedOutput1,
		"No default props or fallback props."
	)


	const src2 =
/*javascript*/`import { component } from 'undestructure-macros';
component(({ someProp = a } = b) => {});`

	const expectedOutput2 =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";
import { component } from 'undestructure-macros';
component(({
  someProp = a
} = b) => {
  _props = _mergeProps(b, {
    someProp: a
  }, _props);
});`

	assertAddMergePropsCall(
		src2,
		expectedOutput2,
		"Default props and fallback props."
	)


	const src3 =
/*javascript*/`import { component } from 'undestructure-macros';
component(({ someProp = a } = b) => {});
component(({ someProp = a } = b) => {});`

	const expectedOutput3 =
/*javascript*/`import { mergeProps as _mergeProps } from "solid-js";
import { component } from 'undestructure-macros';
component(({
  someProp = a
} = b) => {
  _props = _mergeProps(b, {
    someProp: a
  }, _props);
});
component(({
  someProp = a
} = b) => {
  _props2 = _mergeProps(b, {
    someProp: a
  }, _props2);
});`

	assertAddMergePropsCall(
		src3,
		expectedOutput3,
		"Two components with default props and fallback props."
	)

})

test.run()
