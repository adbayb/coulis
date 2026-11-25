import type { RecordLike, WithNewLeafNodes } from "../entities/primitive";
import type {
	GlobalStyles,
	Keyframes,
	PropertiesLike,
	ShorthandsLike,
	StatesLike,
	Styles,
} from "../entities/style";

export type CreateCoulis<
	CreateCoulisGeneric extends {
		/**
		 * `WithCSSVariables` controls how theme values are exposed to the `properties` callback:
		 * `true` (web adapter) replaces leaf values by CSS custom property references
		 * (`var(--token-name)`) and injects the matching `:root { --token-name: value }` rule,
		 * `false` (react-native adapter) passes them as is, since CSS variables are not supported
		 * on native platforms.
		 */
		Input: { WithCSSVariables: boolean };
		Output: unknown;
	},
> = <
	const Properties extends PropertiesLike, // `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	Shorthands extends ShorthandsLike<Properties> | undefined = undefined,
	States extends StatesLike | undefined = undefined,
	Theme extends RecordLike | undefined = undefined,
>(contract: {
	properties: (
		theme: ResolveTheme<CreateCoulisGeneric["Input"]["WithCSSVariables"], Theme>,
	) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme?: Theme;
}) => {
	/**
	 * Creates a CSS `@keyframes` animation rule from a map of keyframe selectors (e.g. `"from"`,
	 * `"to"`, `"50%"`, or a plain number interpreted as a percentage) to style objects. Returns the
	 * generated animation name, which can be passed directly to an `animation` or `animationName`
	 * property. Not supported on React Native.
	 *
	 * @example
	 * 	const spin = createKeyframes({
	 * 		from: { transform: "rotate(0deg)" },
	 * 		to: { transform: "rotate(360deg)" },
	 * 	});
	 * 	createStyles({ animation: `${spin} 1s linear infinite` });
	 */
	createKeyframes: (input: Keyframes<Properties, Shorthands>) => CreateCoulisGeneric["Output"];
	/**
	 * Creates the styles of a given style object. On the web, each property/value pair produces its
	 * own atomic CSS rule and the space-separated class names are returned (identical inputs always
	 * return the same class names). On React Native, a style object is returned.
	 *
	 * State variants (e.g. `{ base: "red", hover: "blue" }`) are supported on the web when `states`
	 * is configured in the contract.
	 *
	 * @example
	 * 	const className = createStyles({ color: "neutralDark", display: "flex" });
	 */
	createStyles: (input: Styles<Properties, Shorthands, States>) => CreateCoulisGeneric["Output"];
	/**
	 * Returns the list of all property names (including shorthands) accepted by `createStyles` and
	 * `setGlobalStyles`. Useful for runtime introspection or building tooling on top of a coulis
	 * instance.
	 */
	getContract: () => {
		propertyNames: (keyof Properties | keyof Shorthands)[];
	};
	/**
	 * Returns the style sheets a rendered HTML needs (critical styles): the atomic rules whose
	 * class names are used in the HTML, plus every global rule and keyframes. Same output as
	 * `getStyleSheets`. Not supported on React Native.
	 *
	 * @example
	 * 	const body = renderToString(<App />);
	 * 	const html = `<head>${String(getCriticalStyleSheets(body))}</head><body>${body}</body>`;
	 */
	getCriticalStyleSheets: (html: string) => StyleSheets;
	/**
	 * Returns every style sheet generated so far by the instance, as an array of `{ attributes,
	 * content }` objects to render as `<style>` elements. `String()` on the result gives the
	 * `<style>` tags. Not supported on React Native.
	 *
	 * Styles are cached for the instance lifetime and shared by every request on a server: use it
	 * when the rendered HTML is not available (e.g. streaming rendering). Call it after rendering
	 * to include the styles generated during the render.
	 *
	 * @example
	 * 	useServerInsertedHTML(() => {
	 * 		return <div dangerouslySetInnerHTML={{ __html: String(getStyleSheets()) }} />;
	 * 	});
	 */
	getStyleSheets: () => StyleSheets;
	/**
	 * Injects global (non-component) CSS rules: element selectors, `@import`, `@font-face`,
	 * `@charset`, and any other top-level CSS constructs. Rules are deduplicated: calling it
	 * several times with the same input only injects them once. Not supported on React Native.
	 *
	 * Returns a function removing the rules, to call once. Calls with the same input are reference
	 * counted: the rules are removed once every caller has removed them (e.g. nested providers
	 * setting the same theme-dependent rules).
	 *
	 * @example
	 * 	const removeGlobalStyles = setGlobalStyles({
	 * 		"html,body": { margin: "none", padding: "none" },
	 * 		"@import": "url('https://fonts.googleapis.com/css?family=Open+Sans')",
	 * 	});
	 */
	setGlobalStyles: (input: GlobalStyles<Properties, Shorthands>) => () => void;
};

type ResolveTheme<WithCSSVariables extends boolean, Theme> = Theme extends RecordLike
	? WithCSSVariables extends false
		? Theme
		: WithNewLeafNodes<Theme, string>
	: undefined;

/** Style sheets to render as `<style>` elements. `String()` gives the `<style>` tags. */
type StyleSheets = {
	attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
	content: string;
}[] & { toString: () => string };
