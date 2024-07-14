import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import { checkFunc } from '../src/check-func/check-func.cjs'

const traverse = babelTraverse.default


test('checkFunc', () => {
	const assertCheckFunc = (code, expects, msg, uppercaseFuncNames = true) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: path => {
				assert.equal(checkFunc(path, { uppercaseFuncNames }, {}), expects, msg)
				path.transformed = true
			}
		})
	}

	const code7 = /*javascript*/`
		const ArrowComp = ({ someProp }) => {}
	`
	assertCheckFunc(
		code7,
		{ funcAnnotation: false },
		"Returns false when uppercaseFuncNames is false even though the function starts with a capital letter.",
		false,
	)

	const code1 = /*javascript*/`
		const ArrowComp = ({ someProp }) => {}
	`
	assertCheckFunc(
		code1,
		{ funcAnnotation: true, propDestructuring: true },
		"Returns true for an arrow function that starts with a capital letter."
	)

	const code5 = /*javascript*/`
		function FuncComp({ someProp }) {}
	`
	assertCheckFunc(
		code5,
		{ funcAnnotation: true, propDestructuring: true },
		"Returns true for a function that starts with a capital letter."
	)

	const code6 = /*javascript*/`
		const ExprComp = function({ someProp }) {}
	`
	assertCheckFunc(
		code6,
		{ funcAnnotation: true, propDestructuring: true },
		"Returns true for a function expression that starts with a capital letter."
	)

	const code2 = /*javascript*/`
		const notAComp = ({ someProp }) => {}
	`
	assertCheckFunc(
		code2,
		{ funcAnnotation: false },
		"Returns false for a camelCase function."
	)
	
	const code4 = /*javascript*/`
		const ArrowComp = (props => {});
	`
	assertCheckFunc(
		code4,
		{ funcAnnotation: true, propDestructuring: false },
		"Returns false for a function with no prop destructuring."
	)
})

test.run()
