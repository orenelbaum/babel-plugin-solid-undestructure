const { types } = require("@babel/core")
const { addStatementToFunction, getOrCreateUniqueImport } = require("./utils.cjs")


/**
 * If there are default props or fallback props, we add a `splitProps` call to the start of
 * the function.
 * If no `splitProps` import exists in the current file, we add a new import.
 */
function handleRestElement(funcPath, state) {
	if (!state.restElement) return

	const restVariableDeclaration = types.variableDeclaration(
		"let",
		[types.variableDeclarator(state.restElement)]
	)

   const splitPropsUniqueName = getOrCreateUniqueImport(funcPath, "splitProps")

	const propNameArray = state.props.map(prop => types.stringLiteral(prop.name))
	const propsArrExpression = types.arrayExpression(propNameArray)

	const callExpression = types.callExpression(
		splitPropsUniqueName,
		[state.newPropsIdentifier, propsArrExpression]
	)

	const assigmentExpressionLeft = types.arrayPattern([state.newPropsIdentifier, state.restElement])

	const assignmentStatement = types.expressionStatement(
		types.assignmentExpression(
			"=",
			assigmentExpressionLeft,
			callExpression
		)
	)

	addStatementToFunction(funcPath, assignmentStatement)

	addStatementToFunction(funcPath, restVariableDeclaration)
}

module.exports.handleRestElement = handleRestElement
