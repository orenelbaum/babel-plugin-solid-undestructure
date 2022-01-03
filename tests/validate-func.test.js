import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import { validateFunc } from '../src/validate-func.cjs'

const traverse = babelTraverse.default


test('validateFunc', () => {
	const assertValidateFunc = (code, expectsThrowing) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: path => {
            if (expectsThrowing) assert.throws(() => validateFunc(path, {}, {}))
            else assert.not.throws(() => validateFunc(path, {}, {}))
				path.transformed = true
			}
		})
	}


	const code1 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp }) => {})
	`
	assertValidateFunc(
		code1,
		false
	)


	// Validate prop renaming
	const code2 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp: rename }) => {})
	`
	assertValidateFunc(
		code2,
		// true
		false
	)


	// Validate prop renaming with default props
	const code3 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp: rename = def }) => {})
	`
	assertValidateFunc(
		code3,
		// true
		false
	)
	

	// Validate nested destructuring
	const code4 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp: { nested } }) => {})
	`
	assertValidateFunc(
		code4,
		true
	)


	// Validate nested destructuring with default props
	const code5 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp: { nested } = def }) => {})
	`
	assertValidateFunc(
		code5,
		true
	)


	// Validate default props
	const code6 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp = def }) => {})
	`
	assertValidateFunc(
		code6,
		false
	)
})

test.run()
