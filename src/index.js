const functionVisitor = types => (path, { opts }) => {
	{
		const {
          	mode = 'ts',
			functionDeclaration = true,
			arrowFunction = true,
			functionExpression = false,
			objectMethod = false,
			classMethod = false,
		} = opts
        
        if (mode !== 'ts' && mode !== 'js-unsafe')
            throw new Error("Invalid configuration: mode must be 'ts' or 'js-unsafe'.")

		const { type } = path

		if (mode === 'js-unsafe') {
			if (type === "FunctionDeclaration" && !functionDeclaration) return
			if (type === "ArrowFunctionExpression" && !arrowFunction) return
			if (type === "FunctionExpression" && !functionExpression) return
			if (type === "ObjectMethod" && !objectMethod) return
			if (type === "ClassMethod" && !classMethod) return
		}
      
      	if (mode === 'ts') {
            if (type !== "ArrowFunctionExpression") return
          	if (path.parent.type !== "VariableDeclarator") return
          	const bindings = path.context.scope.bindings
            if (!path.parent.id.typeAnnotation) return
            const typeAnnotation = path.parent.id.typeAnnotation.typeAnnotation
            if (typeAnnotation.type !== "TSTypeReference") return
          	if (typeAnnotation.typeName.type === "Identifier") {
                const typeName = typeAnnotation.typeName.name
                const typeBinding = bindings[typeName]
                if (!typeBinding) return
                const importSpecifier = typeBinding.path.node
                if (importSpecifier.type !== "ImportSpecifier") return
          	    if (importSpecifier.imported.name !== "Component") return
              	if (typeBinding.path.parent.source.value !== "solid-js") return
            }
          	else if (typeAnnotation.typeName.type === "TSQualifiedName") {
                if (typeAnnotation.typeName.right.name !== "Component") return
                const typeQualification = typeAnnotation.typeName.left
                if (typeQualification.type !== "Identifier") return
                const typeQualificationName = typeQualification.name
                const typeQualificationBinding = bindings[typeQualificationName]
                if (!typeQualificationBinding) return
              	const importSpecifier = typeQualificationBinding.path.node
                if (importSpecifier.type !== "ImportDefaultSpecifier") return
              	if (typeQualificationBinding.path.parent.source.value !== "solid-js") return
            }
          	else return
        }
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
		ClassMethod: functionVisitor(types),
	}

	return {
		name: "babel-plugin-undestructure",
			visitor
		}
}
