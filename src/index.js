const functionVisitor = types => (path, { opts }) => {
	{
		const {
			functionDeclaration = true,
			arrowFunction = true,
			functionExpression = false,
			objectMethod = false,
			classMethod = false
		} = opts
		const { type } = path

		if (type === "FunctionDeclaration" && !functionDeclaration) return
		if (type === "ArrowFunctionExpression" && !arrowFunction) return
		if (type === "FunctionExpression" && !functionExpression) return
		if (type === "ObjectMethod" && !objectMethod) return
		if (type === "ClassMethod" && !classMethod) return
	}

	const firstParam = path.node.params[0]
	if (!firstParam || firstParam.type !== "ObjectPattern") return
	
	const program = path.findParent(path => path.isProgram())
	const newPropsIdentifier =
		program.scope.generateUidIdentifier("props")
	
	const propsDestructredProperties = firstParam.properties
	const componentScopeBindings = path.scope.bindings
	
	for (const DestructredProperty of propsDestructredProperties)
		if(!DestructredProperty.value.name) return
	
	for (const DestructredProperty of propsDestructredProperties) {
		const DestructredKeyIdentifier = DestructredProperty.key
		const undestructuredPropExpression = 
			  types.memberExpression(newPropsIdentifier, DestructredKeyIdentifier)
		
		const DestructredName = DestructredProperty.value.name

		const { referencePaths, constantViolations } = componentScopeBindings[DestructredName]
		
		for (const referencePath of referencePaths)
			referencePath.replaceWith(undestructuredPropExpression)
		
		for (const constantViolation of constantViolations)
			constantViolation.node.left = undestructuredPropExpression
	}
  
	path.node.params[0] = newPropsIdentifier
}

module.exports = function ({ types }) {	
	const visitor = {
		// The algorithm's only entry point is through functions
		FunctionDeclaration: functionVisitor(types),
		FunctionExpression: functionVisitor(types),
		ArrowFunctionExpression: functionVisitor(types),
		ObjectMethod: functionVisitor(types),
		ClassMethod: functionVisitor(types)
	}

	return {
		name: "babel-plugin-undestructure",
			visitor
		}
}
