import { STYLESHEETS } from "../entities/stylesheet";

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
	const ids = Object.keys(STYLESHEETS) as (keyof typeof STYLESHEETS)[];

	const output = ids.map((id) => {
		const { flush, getAttributes, target } = STYLESHEETS[id];
		const content = target.getContent();
		const attributes = getAttributes();

		const toString = () => {
			const stringifiedAttributes = (
				Object.keys(attributes) as (keyof typeof attributes)[]
			)
				.map(
					(attributeKey) =>
						`${attributeKey}="${attributes[attributeKey]}"`,
				)
				.join(" ");

			return `<style ${stringifiedAttributes}>${content}</style>`;
		};

		stringifiedStyles += toString();

		const scopedOutput = {
			attributes,
			content,
			toString,
		};

		if (options.flush && id !== "global") {
			// Flush only local styles to preserve styles defined globally as they're not re-rendered:
			flush();
		}

		return scopedOutput;
	});

	output.toString = () => {
		return stringifiedStyles;
	};

	return output;
};
