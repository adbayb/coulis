import {
	createPropertyValue,
	createPropertyValueError,
	getDimensionValue,
} from "./helpers";

export const fontSize = createPropertyValue<number>("fontSize", (input) => {
	if (typeof input === "number") return input;

	if (typeof input !== "string")
		return createPropertyValueError("Unsupported value type");

	const value = getDimensionValue(input);

	if (typeof value === "string")
		return createPropertyValueError("Unsupported value unit");

	return value;
});
