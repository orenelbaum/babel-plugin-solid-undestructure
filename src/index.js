
export const component = () => console.error(
	`babel-plugin-undestructure error: The "component" function is a compile time function.
	It was called at runtime, which means that babel-plugin-solid-undestructure wasn't applied.
	This is either a configuration problem or a bug in the plugin.
	Make sure to configure babel-plugin-solid undestructure correctly or remove the "component" function.
	If the plugin is already configured correctly, please open an issue on GitHub.`
)
