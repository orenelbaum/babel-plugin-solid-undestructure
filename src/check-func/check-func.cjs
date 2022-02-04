const { checkFuncAnnotation } = require("./check-func-annotation.cjs")


/**
 * Check that the first param ( `props` ) exists and is an object pattern.
 * 
 * Accepts `({x}) =>` , `({x} = y) =>` .
 * 
 * Doesn't accept `(x) =>` .
 */
const checkFirstParam = path => {
   const firstParam = path.node.params[0]
   return (
      firstParam
      && (
         firstParam.type === "ObjectPattern"
         || (
            firstParam.type === "AssignmentPattern"
            && firstParam.left.type === "ObjectPattern"
         )
      )
   )
}


/**
 * Checks if the visited function needs to be transformed (if the function is annotated
 * and and the first argument is destructured).
 * If the function is annotated with a CTF, mark it in the state.
 */
const checkFunc = (funcPath, opts, state) => {
   // Make sure the function wasn't already transformed.
   if (funcPath.transformed) return false

	if (!checkFuncAnnotation(opts, funcPath, state)) return { funcAnnotation: false }

	if (!checkFirstParam(funcPath)) return {
      funcAnnotation: true,
      propDestructuring: false
   }

	return {
      funcAnnotation: true,
      propDestructuring: true
   }
}

module.exports.checkFunc = checkFunc
