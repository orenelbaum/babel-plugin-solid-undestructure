export const component = () => console.warn(
	'The "component" function is a compile time function. It was called at runtime, which means that babel-plugin-solid-undestructure wasn\'nt applied at build time. Please make sure to configure babel-plugin-solid undestructure correctly or remove the "component" function.'
)
