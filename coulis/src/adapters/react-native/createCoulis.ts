import { createMapCache } from "../../core/entities/cache";
import { isObject } from "../../core/entities/primitive";
import type { CreateCoulis } from "../../core/ports/createCoulis";
import { createUnsupportedLogger } from "./helpers";
import { transformDimension } from "./transformers/dimension";

type CreateCoulisOutput = Record<string, unknown>;

export const createCoulis: CreateCoulis<{
	Input: { WithCSSVariables: false };
	Output: CreateCoulisOutput;
}> = (contract) => {
	const unsupportedLogger = createUnsupportedLogger();

	const properties = contract.properties(
		contract.theme as Parameters<typeof contract.properties>[0],
	);

	const shorthands = (contract.shorthands ?? {}) as NonNullable<typeof contract.shorthands>;
	const stylesCache = createMapCache<string, CreateCoulisOutput>();

	const getResolvedPropertyValue = (name: string, styleValue: unknown) => {
		const propertyValue: unknown = properties[name as keyof typeof properties];
		let value: unknown = styleValue;

		if (typeof propertyValue === "function") {
			// oxlint-disable-next-line typescript/no-unsafe-call
			value = propertyValue(styleValue);
		} else if (isObject(propertyValue)) {
			value = propertyValue[styleValue as string] ?? styleValue;
		}

		return transformDimension({ name, value }).value;
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
				return cachedStyles;
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

			return styles;
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
