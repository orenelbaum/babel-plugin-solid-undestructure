const { checkCtfAnnotation } = require("./check-ctf-annotation.cjs")
const { checkTypeAnnotation } = require("./check-type-annotation.cjs")


const possibleAnnotationKinds = ['type', 'ctf', 'pragma']


/**
 * Checks if the function is annotated with the `Component` type or the `component` CTF.
 * @todo Add support for pragma annotations.
 */
function checkFuncAnnotation(opts, path, state) {
	const { acceptedAnnotationKinds = possibleAnnotationKinds } = opts

	validateAcceptedAnnotationKinds(acceptedAnnotationKinds)

	if (acceptedAnnotationKinds.includes('type') && checkTypeAnnotation(path)) return true
	if (acceptedAnnotationKinds.includes('ctf') && checkCtfAnnotation(path, state)) return true
	return false
}


/**
 * Checks that `acceptedAnnotationKinds` is a non empty array of type `Array<"type" | "ctf" | "pragma">`.
 */
function validateAcceptedAnnotationKinds(acceptedAnnotationKinds) {
	if (Array.isArray(acceptedAnnotationKinds)) {
		if (acceptedAnnotationKinds.length === 0)
			throw new Error(
				'babel-plugin-solid-undestructure error: Invalid configuration - `acceptedAnnotationKinds` can\'t be an empty array.'
			)
		for (const annotationKind of acceptedAnnotationKinds)
			if (!possibleAnnotationKinds.includes(annotationKind))
				throw new Error(
					'babel-plugin-solid-undestructure error: Invalid configuration - `acceptedAnnotationKinds` must be of type `Array<"type" | "ctf" | "pragma">`.'
				)
	}
	else
		throw new Error(
			'babel-plugin-solid-undestructure error: Invalid configuration - `acceptedAnnotationKinds` must be of type `Array<"type" | "ctf" | "pragma">`.'
		)
}


exports.checkFuncAnnotation = checkFuncAnnotation
