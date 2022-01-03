import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import { checkFunc } from '../src/check-func/check-func.cjs'

const traverse = babelTraverse.default


test('checkFunc', () => {
	const assertCheckFunc = (code, expects, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: path => {
				assert.equal(checkFunc(path, {}, {}), expects, msg)
				path.transformed = true
			}
		})
	}


	const code1 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(({ someProp }) => {})
	`
	assertCheckFunc(
		code1,
		{ funcAnnotation: true, propDestructuring: true },
		"Returns true for a CTF annotated function."
	)


	const code2 = /*javascript*/`
		import { wrongCtfName } from 'babel-plugin-solid-undestructure'
		wrongCtfName(({ someProp }) => {})
	`
	assertCheckFunc(
		code2,
		{ funcAnnotation: false },
		"Returns false for a function annotated with the wrong CTF."
	)


	const code3 = /*javascript*/`
		import { component } from 'wrong-import-path'
		component(({ someProp }) => {})
	`
	assertCheckFunc(
		code3,
		{ funcAnnotation: false },
		"Returns false for a function annotated with a CTF imported from the wrong path."
	)
	
	
	const code4 = /*javascript*/`
		import { component } from 'babel-plugin-solid-undestructure'
		component(props => {})
	`
	assertCheckFunc(
		code4,
		{ funcAnnotation: true, propDestructuring: false },
		"Returns false for a function with no prop destructuring."
	)
});

test.run()
