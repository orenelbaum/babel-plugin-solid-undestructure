import { test } from 'uvu'
import * as assert from 'uvu/assert'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import babelGenerator from '@babel/generator'
import { handleRemainingPluginImports } from '../src/handle-remaining-plugin-imports.cjs'

const traverse = babelTraverse.default
const generate = babelGenerator.default


test('handleRemainingPluginImports', () => {
	const assertThrows = (code, msg) => {
		const ast = babelParser.parse(code, { sourceType: "module" })
	
      const applyCheck = () => traverse(
         ast,
         { Program: handleRemainingPluginImports } 
      )

      assert.throws(applyCheck, null, msg)
   }

	const assertTransformedCode = (src, expects, msg) => {
		const ast = babelParser.parse(src, { sourceType: "module" })
	
      traverse(
         ast,
         { Program: handleRemainingPluginImports } 
      )

      const output = generate(ast, {}, src)

      assert.snapshot(output.code, expects, msg)
   }


	const src1 = /*javascript*/`(({ someProp }) => {})`
	const expectedOutput1 =
/*javascript*/`({
  someProp
}) => {};`
	assertTransformedCode(
		src1,
		expectedOutput1,
		"No remaining import."
	)


	const src2 = /*javascript*/`
      import { component } from 'undestructure-macros'
      component(({ someProp }) => {})
   `
	assertThrows(
		src2,
		true,
		"Used remaining named import"
	)


	const src3 = /*javascript*/`
      import component from 'undestructure-macros'
      component(({ someProp }) => {})
   `
	assertThrows(
		src3,
		true,
		"Used remaining default import"
	)


	const src4 = /*javascript*/`
import a, { b as c } from 'undestructure-macros'
import d, { e as f } from 'undestructure-macros'

(({ someProp }) => {})`

	const expectedOutput4 =
/*javascript*/`({
  someProp
}) => {};`

	assertTransformedCode(
		src4,
		expectedOutput4,
		"Unused remaining imports."
	)
})

test.run()
