/**
 * Compose multiple class names together.
 * @param classNames - A collection of string-based class names.
 * @returns The composed class names.
 * @example
 * const classNames = compose(styles({ backgroundColor: "red" }), styles({ color: "red" }));
 * document.getElementById("my-element-id").className = classNames;
 */
export const compose = (...classNames: string[]) => {
	return classNames.join(" ");
};

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};

export const createError = (params: {
	api: string;
	cause: string;
	solution: string;
}) => {
	return `\`${params.api}\`: ${params.cause}. ${params.solution}.`;
};
