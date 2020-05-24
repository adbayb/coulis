import replace from "@rollup/plugin-replace";
// @note issue with @rollup/plugin-typescript in watch mode https://github.com/rollup/plugins/issues/225
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const isDevelopment = process.env.NODE_ENV !== "production";

export default {
	input: pkg.source,
	output: [
		{
			file: pkg.main,
			format: "cjs",
		},
		{
			file: pkg.module,
			format: "es",
		},
	],
	plugins: [
		typescript(),
		// @note: environment raw value injection for dead code elimination:
		replace({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
		...(!isDevelopment
			? [
					terser({
						output: {
							comments: false,
						},
					}),
			  ]
			: []),
	],
};
