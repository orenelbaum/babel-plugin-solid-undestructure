
/**
 * Checks if the function is annotated with the `Component` or `ParentComponent` types.
 */
function checkTypeAnnotation(path) {
	// Check that the func is an arrow function which is assigned to a variable.
	if (path.type !== "ArrowFunctionExpression") return false
	if (path.parent.type !== "VariableDeclarator") return false

	// Check the type annotation of the variable.
	if (!path.parent.id.typeAnnotation) return false
	const allScopeBindings = path.scope.getAllBindings()
	const typeAnnotation = path.parent.id.typeAnnotation.typeAnnotation
	if (typeAnnotation.type !== "TSTypeReference") return false
	if (typeAnnotation.typeName.type === "Identifier") {
		const typeName = typeAnnotation.typeName.name
		const typeBinding = allScopeBindings[typeName]
		if (!typeBinding) return false

		const importSpecifier = typeBinding.path.node
		if (importSpecifier.type !== "ImportSpecifier") return false
		if (
			importSpecifier.imported.name !== "Component"
      && importSpecifier.imported.name !== "ParentComponent"
      && importSpecifier.imported.name !== "VoidComponent"
		) return false
		if (typeBinding.path.parent.source.value !== "solid-js") return false
	}
	else if (typeAnnotation.typeName.type === "TSQualifiedName") {
		if (
			typeAnnotation.typeName.right.name !== "Component"
      && typeAnnotation.typeName.right.name !== "ParentComponent"
      && typeAnnotation.typeName.right.name !== "VoidComponent"
		) return false
		const typeQualification = typeAnnotation.typeName.left
		if (typeQualification.type !== "Identifier") return false
		const typeQualificationName = typeQualification.name
		const typeQualificationBinding = allScopeBindings[typeQualificationName]
		if (!typeQualificationBinding) return false
		const importSpecifier = typeQualificationBinding.path.node
		if (importSpecifier.type !== "ImportDefaultSpecifier") return false
		if (typeQualificationBinding.path.parent.source.value !== "solid-js") return false
	}
	else return false

	return true
}

module.exports.checkTypeAnnotation = checkTypeAnnotation
