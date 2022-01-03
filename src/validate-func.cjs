const { getDestructredProperties } = require("./utils.cjs")


/**
 * Validate that the function doesn't use nested destructuring or props renaming.
 */
const validateFunc = funcPath => {
	const propsDestructredProperties = getDestructredProperties(funcPath)
	for (const destructredProperty of propsDestructredProperties) {
		// Validate no nested destructuring
		if (
			(
				// Nested destructuring w/o default value e.g. `({ x: { y } }) => ...`
            destructredProperty.type !== "RestElement"
            && destructredProperty.value.type !== "Identifier"
            && destructredProperty.value.type !== "AssignmentPattern"
			)
			|| (
				// Nested destructuring with default value e.g. `({ x: { y } = z }) => ...`
				destructredProperty.type !== "RestElement"
				&& destructredProperty.value.type !== "Identifier"
				&& destructredProperty.value.left.type !== "Identifier"
		 	)
	 	)
         throw new Error(
            "babel-plugin-solid-undestructure error: Nested destructuring is not supported."
         )

		// // Validate no prop rename
		// if (
		// 	(
		// 		// Prop rename with default value e.g. `({ x: y = z }) => ...`
		// 		destructredProperty.type !== "RestElement"
		// 		&& destructredProperty.value.type === "AssignmentPattern"
		// 		&& destructredProperty.value.left.name !== destructredProperty.key.name
		// 	)
		// 	|| (
		// 		// Prop rename w/o default value e.g. `({ x: y }) => ...`
		// 		destructredProperty.type !== "RestElement"
		// 		&& destructredProperty.value.type !== "AssignmentPattern"
		// 		&& destructredProperty.value.name !== destructredProperty.key.name
		// 	)
		// )
		// 	throw new Error(
		// 		"babel-plugin-solid-undestructure error: Prop renaming is not supported."
		// 	)
	}
}

module.exports.validateFunc = validateFunc
