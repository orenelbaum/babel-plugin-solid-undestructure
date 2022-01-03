const { types } = require("@babel/core")

function transformPropReferences(funcPath, state) {   
	for (const destructredProperty of state.props)
		mergePropsUniqueName = handleDestructuredProperty(destructredProperty, funcPath, state)
}


function handleDestructuredProperty(destructredProperty, funcPath, state) {
   // e.g. `props.myProp` instead of `prop`
	const undestructuredPropExpression = types.memberExpression(
      state.newPropsIdentifier,
      destructredProperty
   )

	funcPath.scope.crawl()
	const componentScopeBindings = funcPath.scope.bindings
	const { referencePaths, constantViolations } = componentScopeBindings[
		state.propRenames[destructredProperty.name]?.name || destructredProperty.name
	]

	for (const referencePath of referencePaths)
		referencePath.replaceWith(undestructuredPropExpression)

	for (const constantViolation of constantViolations)
		if (constantViolation.node) constantViolation.node.left = undestructuredPropExpression
}


module.exports.transformPropReferences = transformPropReferences
