import path from "path";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const isDevelopment = process.env.NODE_ENV !== "production";

export default {
	input: pkg.source,
	output: [
		{
			dir: path.dirname(pkg.main),
			entryFileNames: path.basename(pkg.main),
			format: "cjs",
		},
		{
			dir: path.dirname(pkg.module),
			entryFileNames: path.basename(pkg.module),
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
