import type { CreateAdapter } from "../../core/ports/adapter";
import { STYLE_TYPES } from "../../core/entities/style";
import type { StyleType } from "../../core/entities/style";
import { createVirtualStyleSheet } from "./stylesheet/virtual";
import type { ClassName, StyleSheet } from "./stylesheet/types";
import { createDomStyleSheet } from "./stylesheet/dom";
import { createDeclarations, createId, isNumber } from "./helpers";
import { IS_SERVER_ENVIRONMENT } from "./constants";

export const createWebAdapter: CreateAdapter<ClassName> = (
	createIntermediateRepresentation,
) => {
	const createStyleSheet = IS_SERVER_ENVIRONMENT
		? createVirtualStyleSheet
		: createDomStyleSheet;

	const styleSheetByTypeAdaptee = STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = createStyleSheet(type);

			return output;
		},
		{} as Record<StyleType, StyleSheet>,
	);

	const hydratedClassNames = new Set(
		Object.values(styleSheetByTypeAdaptee).flatMap((styleSheet) =>
			styleSheet.getHydratedClassNames(),
		),
	);

	return {
		createCustomProperties(input) {
			return input;
		},
		createKeyframes(input) {
			const { id, isCached, payload } = createIntermediateRepresentation({
				id: createId(input),
				payload: input,
				type: "global",
			});

			if (isCached || hydratedClassNames.has(id)) return id;

			let rule = "";
			const selectors = Object.keys(payload) as (keyof typeof payload)[];

			for (const selector of selectors) {
				const style = payload[selector];

				if (!style) continue;

				const ruleSelector = isNumber(selector)
					? `${selector}%`
					: String(selector);

				rule += `${ruleSelector}{${createDeclarations(style)}}`;
			}

			styleSheetByTypeAdaptee.global.insert(id, rule);

			return id;
		},
		createStyles() {
			return "todo";
		},
		createVariants() {
			return () => {
				return "todo";
			};
		},
		getMetadata() {
			return [
				{
					attributes: {
						"data-coulis-cache": "todo",
						"data-coulis-type": "todo",
					},
					content: "todo",
				},
			];
		},
		getMetadataAsString() {
			return "todo";
		},
		setGlobalStyles(input) {
			const { id, isCached, payload } = createIntermediateRepresentation({
				id: createId(input),
				payload: input,
				type: "global",
			});

			if (isCached || hydratedClassNames.has(id)) return;

			let rule = "";
			const selectors = Object.keys(payload);

			for (const selector of selectors) {
				const style = payload[selector];

				if (style === undefined) continue;

				rule +=
					typeof style === "string"
						? `${selector} ${style};`
						: `${selector}{${createDeclarations(style)}}`;
			}

			styleSheetByTypeAdaptee.global.insert(id, rule);
		},
	};
};
