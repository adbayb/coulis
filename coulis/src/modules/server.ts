import { coulis } from "../entities/coulis";
import type { CacheKey } from "../entities/cache";

type ServerContext = {
	/**
	 * Collect the generated styles including global ones.
	 * Useful for server-side style extraction to prevent FOUC while serving the document to the client.
	 * To prevent memory leaks and avoid cross-request state pollution, the dynamic cache (by dynamic, we mean dependent on function executions) is reset at each request (static cache shared globally at module level is preserved across requests).
	 * @returns Object containing the content, attributes and a default `toString` operator.
	 * @example
	 * 	const styles = extractStyles({ flush: true });
	 *  return `<head>${styles}</head>`;
	 */
	createRenderer: <
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		DecoratedRender extends (...arguments_: any[]) => any,
	>(
		initialRender?: DecoratedRender,
	) => DecoratedRender;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-id", string>;
		content: string;
		toString: () => string;
	}[];
};

export const createServerContext = (): ServerContext => {
	const globalCacheKeys: CacheKey[] = [];
	let hasRenderBeenCalled = false;

	return {
		createRenderer(initialRender) {
			const renderFunction = (initialRender ??
				(() => {
					// No-op method
				})) as NonNullable<typeof initialRender>;

			return ((...arguments_) => {
				for (const styleSheetId of coulis.getStyleSheetIds()) {
					const styleSheet = coulis.getStyleSheet(styleSheetId);

					// Global cache keys are keys defined outside the rendering step (so, before rendering the component).
					globalCacheKeys.push(...styleSheet.getCacheKeys());
				}

				hasRenderBeenCalled = true;

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return renderFunction(
					...(arguments_ as Parameters<typeof renderFunction>),
				);
			}) as typeof renderFunction;
		},
		getMetadata() {
			if (!hasRenderBeenCalled) {
				throw new Error(
					"Metadata have not been extracted. Make sure to call the `render` method before getting extracted styles.",
				);
			}

			let stringifiedStyles = "";
			const ids = coulis.getStyleSheetIds();

			const output = ids.map((id) => {
				const { getAttributes, getContent, remove } =
					coulis.getStyleSheet(id);

				const content = getContent();
				const attributes = getAttributes();

				const toString = () => {
					const stringifiedAttributes = (
						Object.keys(attributes) as (keyof typeof attributes)[]
					)
						.map(
							// eslint-disable-next-line sonarjs/no-nested-functions
							(attributeKey) =>
								`${attributeKey}="${attributes[attributeKey]}"`,
						)
						.join(" ");

					return `<style ${stringifiedAttributes}>${content}</style>`;
				};

				stringifiedStyles += toString();

				// To prevent [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution), flush styles generated dynamically while preserving, via the `globalCacheKeys` input, the ones shared/defined globally (at file/module scope):
				remove(globalCacheKeys);

				return {
					attributes,
					content,
					toString,
				};
			});

			output.toString = () => {
				return stringifiedStyles;
			};

			return output;
		},
	};
};
