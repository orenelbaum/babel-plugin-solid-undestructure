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
	const checkRes = checkFunc(funcPath, opts, state)

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

module.exports = { funcVisitor }
