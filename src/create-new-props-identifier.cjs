const { getProgram } = require("./utils.cjs")


/**
 * Create a unique props identifier and store it in state.
 */
function createNewPropsIdentifier(funcPath, state) {
   const program = getProgram(funcPath)
	state.newPropsIdentifier = program.scope.generateUidIdentifier("props")
}

module.exports.createNewPropsIdentifier = createNewPropsIdentifier
