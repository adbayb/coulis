import { coulis } from "../entities/coulis";

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
		initialRender: DecoratedRender,
	) => DecoratedRender;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-id", string>;
		content: string;
		toString: () => string;
	}[];
};

export const createServerContext = (): ServerContext => {
	let hasRenderBeenCalled = false;
	const staticCacheIds: string[] = [];

	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	staticCacheIds;

	return {
		createRenderer(initialRender) {
			return ((...arguments_) => {
				/**
				 * Console.log(coulis.getCache().getAll());. // TODO.
				 */

				const output = initialRender(
					...(arguments_ as Parameters<typeof initialRender>),
				) as ReturnType<typeof initialRender>;

				hasRenderBeenCalled = true;

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return output;
			}) as typeof initialRender;
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
				const { /* flush, */ getAttributes, getContent } =
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

				/*
				 * // TODO: flush cache selectively
				 * if (flushOption && id !== "global") {
				 * 	// Flush only local styles to preserve styles defined globally as they're not re-rendered:
				 * 	flush();
				 * }
				 */

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
