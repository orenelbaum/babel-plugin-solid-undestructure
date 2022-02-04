
/**
 * Checks if there are any remaining imports from `babel-plugin-solid-undestructure`.
 * If there are any remaining imports and any of them are used, an error is thrown.
 * Otherwise, if none are used, the remaining imports are removed.
 */
const handleRemainingPluginImports = programPath => {
   const pluginImportPaths = getPluginImportPaths(programPath)

   if (pluginImportPaths.length > 0) {
      const bindings = programPath.scope.bindings

      let someImportIsUsed = checkIfAnyImportsAreUsed(pluginImportPaths, bindings)

      if (someImportIsUsed) {
         throw new Error(
`babel-plugin-undestructure error: An import from 'babel-plugin-undestructure' remained after applying the transformation.
This is either a configuration problem or a bug in the plugin.
If the plugin is configured correctly, please open an issue on GitHub.`
         )
      }

      // Remove the import declarations.
      for (const importDeclarationPath of pluginImportPaths)
         importDeclarationPath.remove()
   }
}

function checkIfAnyImportsAreUsed(pluginImportPaths, bindings) {
   let someImportIsUsed = false

   for (const importDeclarationPath of pluginImportPaths){
      const importDeclaration = importDeclarationPath.node
      for (const specifier of importDeclaration.specifiers)
         if (bindings[specifier.local.name].references >= 1)
            someImportIsUsed = true
   }
   
   return someImportIsUsed
}

function getPluginImportPaths(programPath) {
   const bodyLength = programPath.node.body.length
   const pluginImportPaths = []

   for (let i = 0; i < bodyLength; i++) {
      const node = programPath.node.body[i]
      
      if (
         node.type === 'ImportDeclaration'
         && node.source.value === 'babel-plugin-solid-undestructure'
      )
         pluginImportPaths.push(programPath.get(`body.${i}`))
   }

   return pluginImportPaths
}

module.exports.handleRemainingPluginImports = handleRemainingPluginImports
