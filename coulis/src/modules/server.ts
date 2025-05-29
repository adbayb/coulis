import { coulis } from "../entities/coulis";
import type { CacheKey } from "../entities/cache";

type ServerContext = {
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-id", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
};

export const createServerContext = (): ServerContext => {
	const globalCacheKeys: CacheKey[] = [];

	for (const styleSheetId of coulis.getStyleSheetIds()) {
		const styleSheet = coulis.getStyleSheet(styleSheetId);

		// Global cache keys are keys defined outside the rendering step (so, before rendering the component).
		globalCacheKeys.push(...styleSheet.getCacheKeys());
	}

	const getMetadata: ServerContext["getMetadata"] = () => {
		return coulis.getStyleSheetIds().map((id) => {
			const { getAttributes, getContent, remove } =
				coulis.getStyleSheet(id);

			const content = getContent();
			const attributes = getAttributes();

			// To prevent [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution), flush styles generated dynamically while preserving, via the `globalCacheKeys` input, the ones shared/defined globally (at file/module scope):
			remove(globalCacheKeys);

			return {
				attributes,
				content,
			};
		});
	};

	return {
		getMetadata,
		getMetadataAsString() {
			return getMetadata().reduce((output, { attributes, content }) => {
				const stringifiedAttributes = (
					Object.keys(attributes) as (keyof typeof attributes)[]
				)
					.map(
						(attributeKey) =>
							`${attributeKey}="${attributes[attributeKey]}"`,
					)
					.join(" ");

				output += `<style ${stringifiedAttributes}>${content}</style>`;

				return output;
			}, "");
		},
	};
};
