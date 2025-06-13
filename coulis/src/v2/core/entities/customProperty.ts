export type CustomProperties = {
	[name: string]: CustomProperties | CustomProperty;
};

/**
 * Allow only string-based value to prevent type checking issues with property that doesn't accept `number` values (e.g. `color`, ...).
 * It'll also reduce the logic complexity: by enforcing string values, the unitless logic can be delegated and controlled consumer side.
 */
type CustomProperty = string;
