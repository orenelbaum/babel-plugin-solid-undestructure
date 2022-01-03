const { types } = require("@babel/core")
const { addStatementToFunction, getOrCreateUniqueImport } = require("./utils.cjs")


/**
 * Creates the default props object literal.
 */
function createDefaultPropsObj(state) {
	const defaultPropsObj = types.objectExpression([])

	for (const prop in state.defaultProps) {
		const key = types.identifier(prop)
		defaultPropsObj.properties.push(
			types.objectProperty(key, state.defaultProps[prop])
		)
	}

	return defaultPropsObj
}


/**
 * If there are default props or fallback props, we add a `mergeProps` call to the start of
 * the function.
 * If no `mergeProps` import exists in the current file, we add a new import.
 */
function addMergePropsCall(funcPath, state) {
	const defaultPropsIsEmpty = Object.keys(state.defaultProps).length === 0
	if (defaultPropsIsEmpty && !state.fallbackProps) return

	const defaultPropsObj = createDefaultPropsObj(state)

   const mergePropsUniqueName = getOrCreateUniqueImport(funcPath, "mergeProps")

	const callExpression = types.callExpression(
		mergePropsUniqueName,
		state.fallbackProps
			? [state.fallbackProps, defaultPropsObj, state.newPropsIdentifier]
			: [defaultPropsObj, state.newPropsIdentifier]
	)
	const assignmentStatement = types.expressionStatement(
		types.assignmentExpression("=", state.newPropsIdentifier, callExpression)
	)

	addStatementToFunction(funcPath, assignmentStatement)
}

module.exports.addMergePropsCall = addMergePropsCall
