const { babel } = require("@rollup/plugin-babel")


function addImportDeclarationToProgram(types, program, specifier, imported, source) {
	program.node.body.unshift(
		types.importDeclaration(
			[types.importSpecifier(specifier, types.identifier(imported))],
			types.stringLiteral(source)
		)
	)
}

function addStatementToFunction(types, path, statement) {
	if (path.node.body.type === 'BlockStatement') {
		path.node.body.body.unshift(statement)
	} else {
		path.node.body = types.blockStatement([
			statement,
			types.returnStatement(path.node.body)
		])
	}
}

function getMergePropsUniqueName(types, path, program) {
	let mergePropsUniqueName
	// Look for `mergeProps` import
	program.traverse({
		ImportDeclaration(path) {
			if (path.node.source.value !== "solid-js") return
			for (const specifier of path.node.specifiers)
				if (
					specifier.imported
					&& specifier.imported.name === "mergeProps"
					&& specifier.local.unique
				) {
					mergePropsUniqueName = specifier.local
					return
				}
		}
	})
            
	// If not found, create one
	if (!mergePropsUniqueName) {
		mergePropsUniqueName = program.scope.generateUidIdentifier("mergeProps")
		mergePropsUniqueName.unique = true
		addImportDeclarationToProgram(types, program, mergePropsUniqueName, "mergeProps", "solid-js")
	}
  
    return mergePropsUniqueName
}

const functionVisitor = types => (path, { opts }) => {
	{
		const { mode = 'vanilla-js' } = opts
        
		if (mode !== 'ts' && mode !== 'vanilla-js')
			throw new Error("babel-plugin-solid-undestructure error: Invalid configuration - mode must be either 'ts' or 'vanilla-js'.")

		const type = path.type
      
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

		if (mode === 'vanilla-js') {
			if (path.parent.type !== "CallExpression") return
			const wrappingFunctionName = path.parent.callee.name
			const bindings = path.context.scope.bindings
			const wrappingFunctionBinding = bindings[wrappingFunctionName]
			if (!wrappingFunctionBinding) return
			const importSpecifier = wrappingFunctionBinding.path.node
			if (importSpecifier.type !== "ImportSpecifier") return
			if (importSpecifier.imported.name !== "component") return

			if (wrappingFunctionBinding.path.parent.source.value !== 'babel-plugin-solid-undestructure') return
			if (wrappingFunctionBinding.references === 1) wrappingFunctionBinding.path.parentPath.remove()
			else wrappingFunctionBinding.references--
			path.parentPath.replaceWith(path)
		}
	}

	let mergePropsUniqueName
	let defaultPropsObject = types.objectExpression([])
    
	let firstParam = path.node.params[0]
	if (
    	!firstParam
    	|| (
        	firstParam.type !== "ObjectPattern"
        	&& (
            	firstParam.type !== "AssignmentPattern"
            	|| firstParam.left.type !== "ObjectPattern"
            )
		)
	) return
  
  	const program = path.findParent(path => path.isProgram())
	const newPropsIdentifier = program.scope.generateUidIdentifier("props")
  
	let defaultPropsWhole = types.objectExpression([])
	if (firstParam.type == "AssignmentPattern") {
		defaultPropsWhole = firstParam.right
		firstParam = firstParam.left
      
     	mergePropsUniqueName = getMergePropsUniqueName(types, path, program)

		const callExpression = types.callExpression(mergePropsUniqueName, [defaultPropsWhole, defaultPropsObject, newPropsIdentifier])
		const assignmentStatement = types.expressionStatement(types.assignmentExpression("=", newPropsIdentifier, callExpression))
		addStatementToFunction(types, path, assignmentStatement)
	}
	
	const propsDestructredProperties = firstParam.properties
	const componentScopeBindings = path.scope.bindings
    
	for (const DestructredProperty of propsDestructredProperties) {
		if (DestructredProperty.type === "RestElement") throw new Error("babel-plugin-solid-undestructure error: Rest elements are not supported.")
		if (
        	(
				// Nested destructuring
        		DestructredProperty.value.type !== "Identifier"
        		&& DestructredProperty.value.type !== "AssignmentPattern"
			)
        	|| (
				// Nested destructuring + default value
				DestructredProperty.value.type !== "Identifier"
				&& DestructredProperty.value.left.type !== "Identifier"
			)
		)
        	throw new Error("babel-plugin-solid-undestructure error: Nested destructuring is not supported.")
      
		// Handle default props
		if (DestructredProperty.value.type === "AssignmentPattern") {
			if (!mergePropsUniqueName) {
        		mergePropsUniqueName = getMergePropsUniqueName(types, path, program)

				const callExpression = types.callExpression(mergePropsUniqueName, [defaultPropsWhole, defaultPropsObject, newPropsIdentifier])
				const assignmentStatement = types.expressionStatement(types.assignmentExpression("=", newPropsIdentifier, callExpression))
				addStatementToFunction(types, path, assignmentStatement)
			}
        
			defaultPropsObject.properties.push(types.objectProperty(DestructredProperty.value.left ,DestructredProperty.value.right))
		}
      
		const DestructredKeyIdentifier = DestructredProperty.key
		const undestructuredPropExpression =  types.memberExpression(newPropsIdentifier, DestructredKeyIdentifier)
		
		const DestructredName = DestructredProperty.value.name || DestructredProperty.value.left.name

		path.scope.crawl()
		const componentScopeBindings = path.scope.bindings
		const { referencePaths, constantViolations } = componentScopeBindings[DestructredName]
		
		for (const referencePath of referencePaths)
			referencePath.replaceWith(undestructuredPropExpression)
		
		for (const constantViolation of constantViolations)
			constantViolation.node && (constantViolation.node.left = undestructuredPropExpression)
	}
 
	path.node.params[0] = newPropsIdentifier
}


module.exports = function babelPluginUndestructure ({ types }) {
	const visitor = {
		FunctionDeclaration: functionVisitor(types),
		FunctionExpression: functionVisitor(types),
		ArrowFunctionExpression: functionVisitor(types)
	}

	return {
		name: "babel-plugin-solid-undestructure",
		visitor
	}
}


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
	
	else throw new Error("babel-plugin-solid-undestructure error: Invalid mode. Mode must be either 'ts' or 'vanilla-js'")
}
