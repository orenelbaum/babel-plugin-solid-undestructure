import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import babelGenerator from "@babel/generator"
import { removeWrappingCtf } from '../src/remove-wrapping-ctf.cjs'
import { checkFunc } from '../src/check-func/check-func.cjs'

const traverse = babelTraverse.default
const generate = babelGenerator.default


test('removeWrappingCtf', () => {
	const assertRemoveWrappingCtf = (code, expects, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: funcPath => {
            const state = {}
            checkFunc(funcPath, {}, state)
				removeWrappingCtf(funcPath, state)
				funcPath.transformed = true
			}
		})

      const output = generate(ast, {}, code)

      assert.snapshot(output.code, expects, msg)
	}


	const src =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ someProp }) => {});`

	const expectedOutput =
/*javascript*/`({
  someProp
}) => {};`

	assertRemoveWrappingCtf(
		src,
		expectedOutput,
		"Basic case."
	)


	const src2 =
/*javascript*/`import { component } from 'babel-plugin-solid-undestructure';
component(({ someProp }) => {});
component(({ someProp }) => {});`

	const expectedOutput2 =
/*javascript*/`({
  someProp
}) => {};

({
  someProp
}) => {};`

	assertRemoveWrappingCtf(
		src2,
		expectedOutput2,
		"Two annotated functions."
	)	
})

test.run()
