import { SCOPES } from "../entities/scope";
import type { ScopeKey } from "../types";

/**
 * Collect the generated styles including global ones.
 * Useful for server-side style extraction to prevent FOUC while serving the document to the client.
 * @param options - Options to modify the extraction behavior.
 * @param options.flush - Enable cache auto flush after extraction.
 * @returns Object containing the content, attributes and a default `toString` operator.
 * @example
 * 	const styles = extract({ flush: true });
 *  return `<head>${styles}</head>`;
 */
export const extract = (
	options: {
		/**
		 * Automatically flush the cache after extraction.
		 * @default true - To prevent memory leaks. Set it to `false` if the cache needs to be preserved across requests.
		 */
		flush: boolean;
	} = { flush: true },
) => {
	let stringifiedStyles = "";
	const scopeKeys = Object.keys(SCOPES) as ScopeKey[];

	const output = scopeKeys.map((scopeKey) => {
		const { cache, styleSheet } = SCOPES[scopeKey];
		const content = styleSheet.getContent();
		const cacheKeys = cache.toString();
		const stringifiedStyle = `<style data-coulis-cache="${cacheKeys}" data-coulis-scope="${scopeKey}">${content}</style>`;

		stringifiedStyles += stringifiedStyle;

		const scopedOutput = {
			attributes: styleSheet.getAttributes(cacheKeys),
			content,
			toString() {
				return stringifiedStyle;
			},
		};

		if (options.flush && scopeKey !== "global") {
			// Flush only local styles to preserve styles defined globally as they're not re-rendered:
			cache.flush();
			styleSheet.flush();
		}

		return scopedOutput;
	});

	output.toString = () => {
		return stringifiedStyles;
	};

	return output;
};
