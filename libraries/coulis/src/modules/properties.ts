import type { Property } from "../entities/property";
import { SCOPES } from "../entities/scope";
import { isObject } from "../helpers";
import type { RecordLike } from "../types";

/**
 * Allow only string-based value to prevent type checking issues with property that doesn't accept `number` values (e.g. `color`, ...).
 * It'll also reduce the logic complexity: by enforcing string values, the unitless logic can be delegated and controlled consumer side.
 */
type PropertyValue = Property<string>["value"];

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to match the `LeafType`.
 */
type WithNewLeafNodes<Obj extends RecordLike, LeafType> = {
	[Key in keyof Obj]: Obj[Key] extends PropertyValue
		? LeafType
		: Obj[Key] extends RecordLike
			? WithNewLeafNodes<Obj[Key], LeafType>
			: never;
};

type Properties = {
	[key: string]: Properties | PropertyValue;
};

/**
 * This method aims to create one or several custom properties globally scoped.
 * A [custom property](https://www.w3.org/TR/css-variables-1/) is any property whose name starts with two dashes.
 * Its main functional purpose is theming: a theme defines a set of consistent and contextual properties (aka [design tokens](https://www.designtokens.org/glossary/)).
 * A design token is an indivisible design decision of a design system (such as colors, spacing, typography scale, ...).
 * @param properties - Record of custom properties .
 * @returns Ready-to-consume CSS custom properties.
 * @example
 * const properties = createCustomProperties({}); // TODO
 */
export const createCustomProperties = <P extends Properties>(properties: P) => {
	const { collectedProperties, nodes } =
		createCustomPropertiesWithoutSideEffects(properties);

	SCOPES.global.commit({
		key: JSON.stringify(collectedProperties),
		createRules() {
			return [
				`:root{${collectedProperties.reduce(
					(output, property) =>
						`${output}--${property.name}:${property.value};`,
					"",
				)}}`,
			];
		},
	});

	return nodes;
};

const createCustomPropertiesWithoutSideEffects = <P extends Properties>(
	properties: P,
	propertyNameParts: Property["name"][] = [],
	collectedProperties: Property[] = [],
) => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const nodes = {} as WithNewLeafNodes<P, PropertyValue>;
	const tokenNames = Object.keys(properties) as (keyof P)[];

	for (const tokenName of tokenNames) {
		const value = properties[tokenName];

		propertyNameParts.push(tokenName as string);

		if (isObject(value)) {
			const output = createCustomPropertiesWithoutSideEffects(
				value,
				propertyNameParts,
				collectedProperties,
			);

			propertyNameParts = [];
			nodes[tokenName] = output.nodes as (typeof nodes)[keyof P];
		} else {
			const property: Property = {
				name: propertyNameParts.join("-"),
				value: value as string,
			};

			nodes[tokenName] =
				`var(--${property.name})` as (typeof nodes)[keyof P];
			collectedProperties.push(property);
			propertyNameParts.pop();
		}
	}

	return { collectedProperties, nodes };
};
