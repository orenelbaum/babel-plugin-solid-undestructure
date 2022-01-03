import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import { getPropsInfo } from '../src/get-props-info.cjs'

const traverse = babelTraverse.default


test('getPropsInfo', () => {
	const assertGetPropsInfo = (code, validateResultingState, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
		traverse(ast, {
			Function: funcPath => {
            const state = {}
            getPropsInfo(funcPath, state)
				assert.ok(validateResultingState(state), msg)
				funcPath.transformed = true
			}
		})
	}


	const code1 = /*javascript*/`
		({ a, b }) => {}
	`
	assertGetPropsInfo(
		code1,
		state => {
         if (state.props[0].type !== "Identifier") return false
         if (state.props[0].name !== "a") return false
         if (state.props[1].type !== "Identifier") return false
         if (state.props[1].name !== "b") return false
         if (Object.keys(state.defaultProps).length !== 0) return false
         if (Object.keys(state.propRenames).length !== 0) return false
         return true
      },
		"Basic case."
	)


	// Default props
	const code2 = /*javascript*/`
		({ a = 1, b = 2 }) => {}
	`
	assertGetPropsInfo(
		code2,
		state => {
         if (state.props[0].type !== "Identifier") return false
         if (state.props[0].name !== "a") return false
         if (state.props[1].type !== "Identifier") return false
         if (state.props[1].name !== "b") return false
         if (state.defaultProps.a.type !== 'NumericLiteral') return false
			if (state.defaultProps.a.value !== 1) return false
         if (state.defaultProps.b.type !== 'NumericLiteral') return false
			if (state.defaultProps.b.value !== 2) return false
         if (Object.keys(state.propRenames).length !== 0) return false
         return true
      },
		"Default props."
	)


	const code3 = /*javascript*/`
		({ a, b } = c) => {}
	`
	assertGetPropsInfo(
		code3,
		state => {
         if (state.props[0].type !== "Identifier") return false
         if (state.props[0].name !== "a") return false
         if (state.props[1].type !== "Identifier") return false
         if (state.props[1].name !== "b") return false
         if (state.fallbackProps.type !== "Identifier") return false
         if (state.fallbackProps.name !== "c") return false
         return true
      },
		"Fallback props."
	)


	const code4 = /*javascript*/`
		({ ...x }) => {}
	`
	assertGetPropsInfo(
		code4,
		state => {
         if (state.restElement.type !== "Identifier") return false
         if (state.restElement.name !== "x") return false
         return true
      },
		"Rest element."
	)


	const code5 = /*javascript*/`
		({ a: b, c: d }) => {}
	`
	assertGetPropsInfo(
		code5,
		state => {
			if (state.props[0].type !== "Identifier") return false
			if (state.props[0].name !== "a") return false
			if (state.props[1].type !== "Identifier") return false
			if (state.props[1].name !== "c") return false
			if (state.propRenames.a.type !== "Identifier") return false
			if (state.propRenames.a.name !== "b") return false
			if (state.propRenames.c.type !== "Identifier") return false
			if (state.propRenames.c.name !== "d") return false
			if (Object.keys(state.defaultProps).length !== 0) return false
			return true
		},
		"Prop renames."
	)

	// Default props + fallback props + rest element + prop renames
	const code6 = /*javascript*/`
		({ a: b = 1, c: d = 2, ...e } = f) => {}
	`
	assertGetPropsInfo(
		code6,
		state => {
			if (state.props[0].type !== "Identifier") return false
			if (state.props[0].name !== "a") return false
			if (state.props[1].type !== "Identifier") return false
			if (state.props[1].name !== "c") return false
			if (state.defaultProps.a.type !== 'NumericLiteral') return false
			if (state.defaultProps.a.value !== 1) return false
			if (state.defaultProps.c.type !== 'NumericLiteral') return false
			if (state.defaultProps.c.value !== 2) return false
			if (state.fallbackProps.type !== "Identifier") return false
			if (state.fallbackProps.name !== "f") return false
			if (state.restElement.type !== "Identifier") return false
			if (state.restElement.name !== "e") return false
			if (state.propRenames.a.type !== "Identifier") return false
			if (state.propRenames.a.name !== "b") return false
			if (state.propRenames.c.type !== "Identifier") return false
			if (state.propRenames.c.name !== "d") return false
			return true
		}
	)
})

test.run()
