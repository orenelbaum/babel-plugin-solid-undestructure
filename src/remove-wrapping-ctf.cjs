
/**
 * If the function is annotated with the `component` CTF, remove it.
 */
const removeWrappingCtf = (funcPath, state) => {
   const { isAnnotatedWithCtf, annotatingCtfBinding } = state

	if (!isAnnotatedWithCtf) return

	// If the CTF import is not used again, remove it.
	if (annotatingCtfBinding.references === 1) {
		// If the CTF import is the only specifier in the import declaration, remove the
		// import declaration.
		if (annotatingCtfBinding.path.parentPath.node.specifiers.length === 1)
			annotatingCtfBinding.path.parentPath.remove()
		// Otherwise, remove the import specifier.
		else
			annotatingCtfBinding.path.remove()
	}
	else annotatingCtfBinding.references--
	
	funcPath.parentPath.replaceWith(funcPath)
}

module.exports.removeWrappingCtf = removeWrappingCtf
