const { getProgram } = require("../utils.cjs")

/**
 * Checks that the function is annotated with the `component` CTF.
 */
function checkCtfAnnotation(path, state) {
	if (path.parent?.type !== "CallExpression") return false

	const wrappingFunctionName = path.parent.callee.name
	const bindings = getProgram(path).scope.bindings
	const wrappingFunctionBinding = bindings[wrappingFunctionName]
	if (!wrappingFunctionBinding) return false
	const importSpecifier = wrappingFunctionBinding.path.node
	if (importSpecifier.type !== "ImportSpecifier") return false
	if (importSpecifier.imported.name !== "component") return false
	if (wrappingFunctionBinding.path.parent.source.value !== 'undestructure-macros') return false


	state.isAnnotatedWithCtf = true
	state.annotatingCtfBinding = wrappingFunctionBinding

	return true
}

module.exports.checkCtfAnnotation = checkCtfAnnotation
