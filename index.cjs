const { babel } = require("@rollup/plugin-babel")


const functionVisitor = types => (path, { opts }) => {
	{
		const { mode = 'ts' } = opts
        
		if (mode !== 'ts' && mode !== 'vanilla-js')
			throw new Error("Invalid configuration: mode must be 'ts' or 'vanilla-js'.")

		const type = path?.type
      
		if (mode === 'ts') {
			if (type !== "ArrowFunctionExpression") return
			if (path.parent?.type !== "VariableDeclarator") return
			const bindings = path.context?.scope?.bindings
			if (!path.parent?.id?.typeAnnotation) return
			const typeAnnotation = path.parent.id.typeAnnotation.typeAnnotation
			if (typeAnnotation?.type !== "TSTypeReference") return
			if (typeAnnotation?.typeName?.type === "Identifier") {
				const typeName = typeAnnotation.typeName.name
				const typeBinding = bindings?.[typeName]
				if (!typeBinding) return
				const importSpecifier = typeBinding.path?.node
				if (importSpecifier?.type !== "ImportSpecifier") return
				if (importSpecifier?.imported?.name !== "Component") return
				if (typeBinding?.path?.parent?.source?.value !== "solid-js") return
			}
			else if (typeAnnotation?.typeName?.type === "TSQualifiedName") {
				if (typeAnnotation.typeName?.right?.name !== "Component") return
				const typeQualification = typeAnnotation.typeName?.left
				if (typeQualification?.type !== "Identifier") return
				const typeQualificationName = typeQualification?.name
				const typeQualificationBinding = bindings?.[typeQualificationName]
				if (!typeQualificationBinding) return
				const importSpecifier = typeQualificationBinding?.path?.node
				if (importSpecifier?.type !== "ImportDefaultSpecifier") return
				if (typeQualificationBinding?.path?.parent?.source?.value !== "solid-js") return
			}
			else return
		}

		if (mode === 'vanilla-js') {
			if (path.parent?.type !== "CallExpression") return
			const wrappingFunctionName = path.parent.callee?.name
			const bindings = path.context?.scope?.bindings
			const wrappingFunctionBinding = bindings?.[wrappingFunctionName]
			if (!wrappingFunctionBinding) return
			const importSpecifier = wrappingFunctionBinding.path?.node
			if (importSpecifier?.type !== "ImportSpecifier") return
			if (importSpecifier?.imported?.name !== "component") return

			if (wrappingFunctionBinding.path.parent?.source?.value !== 'babel-plugin-solid-undestructure') return
			wrappingFunctionBinding.path.parentPath.remove()
      	path.parentPath.replaceWith(path)
		}
	}

	const firstParam = path.node?.params?.[0]
	if (!firstParam || firstParam.type !== "ObjectPattern") return
	
	const program = path?.findParent(path => path.isProgram())
	const newPropsIdentifier =
		program?.scope?.generateUidIdentifier("props")
	
	const propsDestructredProperties = firstParam?.properties
	const componentScopeBindings = path.scope?.bindings
	
	for (const DestructredProperty of propsDestructredProperties)
		if (!DestructredProperty?.value?.name) return
	
	for (const DestructredProperty of propsDestructredProperties) {
		const DestructredKeyIdentifier = DestructredProperty.key
		const undestructuredPropExpression = 
			  types.memberExpression(newPropsIdentifier, DestructredKeyIdentifier)
		
		const DestructredName = DestructredProperty.value?.name

		const { referencePaths, constantViolations } = componentScopeBindings?.[DestructredName]
		
		for (const referencePath of referencePaths)
			referencePath?.replaceWith(undestructuredPropExpression)
		
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