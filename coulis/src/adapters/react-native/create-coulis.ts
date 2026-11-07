import { isObject } from "../../core/entities/primitive";
import { resolvePropertyValue } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/create-coulis";
import { createUnsupportedLogger } from "./helpers";
import { transformDimension } from "./transformers/dimension";

type CreateCoulisOutput = Record<string, unknown>;

/**
 * Creates a React Native instance that resolves styles to native values and dimensions.
 *
 * @param contract - Style properties, theme, states, and shorthand definitions.
 * @returns React Native styling methods for the configured contract.
 */
export const createCoulis: CreateCoulis<{
	Input: { WithCSSVariables: false };
	Output: CreateCoulisOutput;
}> = (contract) => {
	const unsupportedLogger = createUnsupportedLogger();

	const properties = contract.properties(
		contract.theme as Parameters<typeof contract.properties>[0],
	);

	const shorthands = (contract.shorthands ?? {}) as NonNullable<typeof contract.shorthands>;
	const stylesCache = new Map<string, CreateCoulisOutput>();

	const getResolvedPropertyValue = (name: string, value: unknown) => {
		return transformDimension({
			name,
			value: resolvePropertyValue(properties[name as keyof typeof properties], value),
		}).value;
	};

	const getStyleValue = (name: string, value: unknown) => {
		if (isObject(value)) {
			unsupportedLogger.warn("States are not supported, ignoring non-base values.");

			return getResolvedPropertyValue(name, value.base);
		}

		return getResolvedPropertyValue(name, value);
	};

	return {
		createKeyframes() {
			unsupportedLogger.warnUnsupportedMethod("createKeyframes");

			return {};
		},
		createStyles(input) {
			const cacheKey = JSON.stringify(input);
			const cachedStyles = stylesCache.get(cacheKey);

			if (cachedStyles) {
				// Return a copy so callers cannot mutate the object stored in the cache.
				return { ...cachedStyles };
			}

			const styles: CreateCoulisOutput = {};

			for (const propertyName of Object.keys(input)) {
				const value = input[propertyName as keyof typeof input];

				const expandedPropertyNames = (shorthands[propertyName] ?? [
					propertyName,
				]) as string[];

				for (const expandedPropertyName of expandedPropertyNames) {
					styles[expandedPropertyName] = getStyleValue(expandedPropertyName, value);
				}
			}

			stylesCache.set(cacheKey, styles);

			// Return a copy so callers cannot mutate the object stored in the cache.
			return { ...styles };
		},
		getContract() {
			return {
				propertyNames: [
					...Object.keys(shorthands),
					...Object.keys(properties),
				] as ReturnType<typeof this.getContract>["propertyNames"],
			};
		},
		getMetadata() {
			unsupportedLogger.warnUnsupportedMethod("getMetadata");

			return [];
		},
		setGlobalStyles() {
			unsupportedLogger.warnUnsupportedMethod("setGlobalStyles");
		},
	};
};
