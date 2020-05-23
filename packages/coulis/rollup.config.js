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
		...(!isDevelopment
			? terser({
					output: {
						comments: false,
					},
			  })
			: []),
	],
};
