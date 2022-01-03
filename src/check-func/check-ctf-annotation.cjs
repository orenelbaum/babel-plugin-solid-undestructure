
/**
 * Checks that the function is annotated with the `component` CTF.
 */
function checkCtfAnnotation(path, state) {
	if (path.parent?.type !== "CallExpression") return false

	const wrappingFunctionName = path.parent.callee.name
	const bindings = path.context.scope.bindings
	const wrappingFunctionBinding = bindings[wrappingFunctionName]
	if (!wrappingFunctionBinding) return false
	const importSpecifier = wrappingFunctionBinding.path.node
	if (importSpecifier.type !== "ImportSpecifier") return false
	if (importSpecifier.imported.name !== "component") return false
	if (wrappingFunctionBinding.path.parent.source.value !== 'babel-plugin-solid-undestructure') return false

	state.isAnnotatedWithCtf = true
	state.annotatingCtfBinding = wrappingFunctionBinding

	return true
}

module.exports.checkCtfAnnotation = checkCtfAnnotation
