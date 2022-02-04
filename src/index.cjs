const { babel } = require("@rollup/plugin-babel")
const { handleRemainingPluginImports } = require("./handle-remaining-plugin-imports.cjs")
const { funcVisitor } = require("./func-visitor.cjs")


// This is the entry point for babel.
module.exports = function babelPluginUndestructure () {
	const visitor = {
		FunctionDeclaration: funcVisitor,
		FunctionExpression: funcVisitor,
		ArrowFunctionExpression: funcVisitor,
		Program: { exit: handleRemainingPluginImports }
	}

	return { name: "babel-plugin-solid-undestructure", visitor }
}


// This export is used for configuration.
module.exports.undestructurePlugin = mode => {
	if (!mode || mode === 'ts') return [
		{
			...babel({
				plugins: [
					["@babel/plugin-syntax-typescript", { isTSX: true }],
					"babel-plugin-solid-undestructure",
				],
				extensions: [".tsx"]
			}),
			enforce: 'pre'
	  	},
		{
			...babel({
				plugins: [
					"@babel/plugin-syntax-typescript",
					"babel-plugin-solid-undestructure",
				],
				extensions: [".ts"]
			}),
			enforce: 'pre'
	  	}
	]

	else if (mode === "vanilla-js")
		return ["babel-plugin-solid-undestructure", { mode: "vanilla-js" }]
	
	else throw new Error(
`babel-plugin-solid-undestructure error: Invalid mode.
Mode must be either 'ts' or 'vanilla-js'
`
	)
}
