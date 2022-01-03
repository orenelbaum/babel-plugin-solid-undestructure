const { getDestructredProperties } = require("./utils.cjs")


/**
 * This function stores the props, the default props and the fallback props in the state obj.
 */
const getPropsInfo = (funcPath, state) => {
	// Get fallback props
	{
		let firstParam = funcPath.node.params[0]
		if (firstParam.type == "AssignmentPattern") state.fallbackProps = firstParam.right
	}

	// Get props, prop renames, default props and rest element.
	{
		state.props = [], state.propRenames = {}, state.defaultProps = {}
	
		const propsDestructredProperties = getDestructredProperties(funcPath)
		for (const destructredProperty of propsDestructredProperties) {
			if (destructredProperty.type == "RestElement") {
				state.restElement = destructredProperty.argument
				continue
			}

			const destructredKeyIdentifier = destructredProperty.key
			state.props.push(destructredKeyIdentifier)
	
			const propertyValue = destructredProperty.value

			// If there's a default value
			if (propertyValue.type === "AssignmentPattern") {
				state.defaultProps[destructredKeyIdentifier.name] = propertyValue.right
				if (propertyValue.left.name !== destructredKeyIdentifier.name)
					state.propRenames[destructredKeyIdentifier.name] = propertyValue.left
			}
			else if (propertyValue.name !== destructredKeyIdentifier.name)
				state.propRenames[destructredKeyIdentifier.name] = propertyValue
		}
	}
}

module.exports.getPropsInfo = getPropsInfo
