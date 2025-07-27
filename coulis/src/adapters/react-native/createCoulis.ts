import type { CreateCoulis } from "../../core/ports/createCoulis";
import { isObject } from "../../core/entities/primitive";
import { translator } from "./translator";
import { createUnsupportedLogger } from "./helpers";

type CreateCoulisOutput = Record<string, unknown>;

export const createCoulis: CreateCoulis<{
	Input: { WithCSSVariables: false };
	Output: CreateCoulisOutput;
}> = (contract) => {
	const unsupportedLogger = createUnsupportedLogger();

	const properties = contract.properties(
		contract.theme as Parameters<typeof contract.properties>[0],
	);

	const shorthands = (contract.shorthands ?? {}) as NonNullable<
		typeof contract.shorthands
	>;

	const shorthandNames = Object.keys(shorthands);

	const isCustomShorthandProperty = (name: string) => {
		return shorthandNames.includes(name);
	};

	return {
		createKeyframes() {
			unsupportedLogger.method("createKeyframes");

			return {};
		},
		createStyles(input) {
			const styles: CreateCoulisOutput = {};

			// TODO: cache (insert method)
			// eslint-disable-next-line unicorn/consistent-function-scoping
			const getStyleValue = (name: string, value: unknown) => {
				const getValue = (styleValue: unknown): unknown => {
					const propertyValue =
						properties[name as keyof typeof properties];

					const output: unknown =
						typeof propertyValue === "function"
							? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
								propertyValue(styleValue)
							: isObject(propertyValue)
								? propertyValue[styleValue as string]
								: styleValue;

					return translator[name]?.(output) ?? output;
				};

				if (isObject(value)) {
					unsupportedLogger.behavior(
						"States are not supported, ignoring non-base values.",
					);

					return getValue(value.base);
				}

				return getValue(value);
			};

			for (const propertyName of Object.keys(input)) {
				const value = input[propertyName as keyof typeof input];

				if (isCustomShorthandProperty(propertyName)) {
					const shorthandedPropertyNames = shorthands[
						propertyName
					] as string[] | undefined;

					if (shorthandedPropertyNames === undefined) continue;

					for (const shorthandedPropertyName of shorthandedPropertyNames) {
						styles[shorthandedPropertyName] = getStyleValue(
							shorthandedPropertyName,
							value,
						);
					}
				} else {
					styles[propertyName] = getStyleValue(propertyName, value);
				}
			}

			console.log(styles);

			return styles;
		},
		getContract() {
			return {
				propertyNames: [
					...shorthandNames,
					...Object.keys(properties),
				] as ReturnType<typeof this.getContract>["propertyNames"],
			};
		},
		getMetadata() {
			unsupportedLogger.method("getMetadata");

			return [];
		},
		setGlobalStyles() {
			unsupportedLogger.method("setGlobalStyles");
		},
	};
};
