const { babel } = require("@rollup/plugin-babel")
const { validateFunc } = require("./validate-func.cjs")
const { checkFunc } = require("./check-func/check-func.cjs")
const { getPropsInfo } = require("./get-props-info.cjs")
const { removeWrappingCtf } = require("./remove-wrapping-ctf.cjs")
const { addMergePropsCall } = require("./add-merge-props-call.cjs")
const { transformPropsParam } = require("./transform-props-param.cjs")
const { createNewPropsIdentifier } = require("./create-new-props-identifier.cjs")
const { transformPropReferences } = require("./transform-prop-references.cjs")
const { handleRestElement } = require("./handle-rest-element.cjs")


const funcVisitor = (funcPath, { opts }) => {
	const state = {}

	// Check that the function needs to be transformed.
	const checkRes =  checkFunc(funcPath, opts, state)

	if (!checkRes?.funcAnnotation) return

	removeWrappingCtf(funcPath, state)

	if (!checkRes.propDestructuring) return

	// Validate that the function doesn't use unsupported syntax.
	validateFunc(funcPath)

	getPropsInfo(funcPath, state)
	
	// Create a unique props identifier and store it in state.
	createNewPropsIdentifier(funcPath, state)

	addMergePropsCall(funcPath, state)
	
	handleRestElement(funcPath, state)
	
	transformPropReferences(funcPath, state)
	
	transformPropsParam(funcPath, state)

	funcPath.transformed = true
}


// This is the entry point for babel.
module.exports = function babelPluginUndestructure ({ types }) {
	const visitor = {
		FunctionDeclaration: funcVisitor,
		FunctionExpression: funcVisitor,
		ArrowFunctionExpression: funcVisitor
	}

	return {
		name: "babel-plugin-solid-undestructure",
		visitor
	}
}


// This export is used for configuration.
module.exports.undestructurePlugin = mode => {
	if (!mode || mode === 'ts') return [
		{
			...babel({
				plugins: [
					["@babel/plugin-syntax-typescript", { isTSX: true }],
					"babel-plugin-solid-undestructure",
				],
				extensions: [".tsx"]
			}),
			enforce: 'pre'
	  	},
		{
			...babel({
				plugins: [
					"@babel/plugin-syntax-typescript",
					"babel-plugin-solid-undestructure",
				],
				extensions: [".ts"]
			}),
			enforce: 'pre'
	  	}
	]

	else if (mode === "vanilla-js")
		return ["babel-plugin-solid-undestructure", { mode: "vanilla-js" }]
	
	else throw new Error(
		"babel-plugin-solid-undestructure error: Invalid mode. Mode must be either 'ts' or 'vanilla-js'"
	)
}
