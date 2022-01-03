
export const component = () => console.warn(
	`The "component" function is a compile time function.
	It was called at runtime, which means that either babel-plugin-solid-undestructure wasn't applied.
	Make sure to configure babel-plugin-solid undestructure correctly or remove the "component" function.`
)
