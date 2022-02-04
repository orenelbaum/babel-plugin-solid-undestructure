const { types } = require("@babel/core")


module.exports.getDestructredProperties = funcPath => {
	const firstParam = funcPath.node.params[0]

	const objectPattern = firstParam.type == "AssignmentPattern"
		? firstParam.left
		: firstParam
	
	return objectPattern.properties
}


const getProgram = path => path.findParent(path => path.isProgram())
module.exports.getProgram = getProgram


const addImportDeclarationToProgram = (types, program, specifier, imported, source) => {
	program.node.body.unshift(
		types.importDeclaration(
			[types.importSpecifier(specifier, types.identifier(imported))],
			types.stringLiteral(source)
		)
	)
}
module.exports.addImportDeclarationToProgram = addImportDeclarationToProgram


module.exports.addStatementToFunction = (funcPath, statement) => {
	if (funcPath.node.body.type === 'BlockStatement') {
		funcPath.node.body.body.unshift(statement)
	} else {
		funcPath.node.body = types.blockStatement([
			statement,
			types.returnStatement(funcPath.node.body)
		])
	}
}


/**
 * Looks for an existing unique import. If none is found, we create a new import and add it
 * to the file.
 */
 module.exports.getOrCreateUniqueImport = (funcPath, specifier) => {
	let uniqueName = lookForUniqueImport(funcPath, specifier)
            
	// If not found, create one
	if (!uniqueName) {
		const program = getProgram(funcPath)

		uniqueName = program.scope.generateUidIdentifier(specifier)
		// We mark the identifier as unique so we can find it later
		uniqueName.unique = true
		addImportDeclarationToProgram(types, program, uniqueName, specifier, "solid-js")
	}
  
	return uniqueName
}


/**
 * Looks for an existing `mergeProps` import declaration that is marked as unique.
 */
function lookForUniqueImport(funcPath, targetSpecifier) {
	const program = getProgram(funcPath)
	
	let mergePropsUniqueName

	program.traverse({
		ImportDeclaration(path) {
			if (path.node.source.value !== "solid-js")
				return
			for (const specifier of path.node.specifiers)
				if (specifier.imported
					&& specifier.imported.name === targetSpecifier
					&& specifier.local.unique
				) {
					mergePropsUniqueName = specifier.local
					return
				}
		}
	})

	return mergePropsUniqueName
}
