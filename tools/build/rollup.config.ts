import { createRequire } from "node:module";
import { join } from "node:path";
import type { RollupOptions } from "rollup";
// eslint-disable-next-line import/no-named-as-default
import dts from "rollup-plugin-dts";
import externals from "rollup-plugin-node-externals";
import summary from "rollup-plugin-output-size";
import { swc } from "rollup-plugin-swc3";

const require = createRequire(import.meta.url);

const PKG = require(join(process.cwd(), "./package.json")) as {
	exports?: {
		import: string;
		require: string;
		source: string;
		types: string;
	};
	main: string;
	module: string;
	source: string;
	types: string;
};

const createMainConfig = (): RollupOptions => ({
	input: PKG.source,
	output: [
		{
			file: PKG.main,
			format: "cjs",
			sourcemap: false,
		},
		{
			file: PKG.module,
			format: "es",
			sourcemap: false,
		},
	],
	plugins: [
		externals({
			deps: true,
			/**
			 * As they're not installed consumer side, `devDependencies` are declared as internal dependencies (via the `false` value)
			 * and bundled into the dist if and only if imported and not listed as `peerDependencies` (otherwise, they're considered external).
			 */
			devDeps: false,
			peerDeps: true,
		}),
		swc({
			minify: false,
			sourceMaps: false,
		}),
		summary(),
	].filter(Boolean),
});

const createTypesConfig = (): RollupOptions => ({
	input: PKG.source,
	output: [{ file: PKG.types }],
	plugins: [
		dts({
			compilerOptions: {
				incremental: false,
			},
		}),
		summary(),
	],
});

const config = [createMainConfig(), createTypesConfig()];

export default config;
