
/**
 * e.g. transform `({ a, b }) => ...` into `_props => ...`
 */
const transformPropsParam = (funcPath, state) => {
   funcPath.node.params[0] = state.newPropsIdentifier
}

module.exports.transformPropsParam = transformPropsParam
