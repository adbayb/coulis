/**
 * @file StyleX styles only exist once compiled: this build step runs the StyleX compiler on the
 *   case component, as a consumer application does through its bundler plugin, and outputs the
 *   compiled component and its style sheet in `dist/stylex`.
 */
import fs from "node:fs";
import path from "node:path";
import { transformSync } from "@babel/core";
import type { PluginObject } from "@babel/core";
import stylexPlugin from "@stylexjs/babel-plugin";

const SOURCE_FILE = path.resolve(import.meta.dirname, "component.tsx");
const OUTPUT_DIRECTORY = path.resolve(import.meta.dirname, "../../../dist/stylex");

// Relative imports are written from the source directory: they are rebased on the output one.
const rebaseRelativeImportsPlugin = (): PluginObject => {
	return {
		visitor: {
			ImportDeclaration({ node }) {
				if (node.source.value.startsWith(".")) {
					node.source.value = path.relative(
						OUTPUT_DIRECTORY,
						path.resolve(path.dirname(SOURCE_FILE), node.source.value),
					);
				}
			},
		},
	};
};

const output = transformSync(fs.readFileSync(SOURCE_FILE, "utf8"), {
	babelrc: false,
	configFile: false,
	filename: SOURCE_FILE,
	plugins: [
		["@babel/plugin-syntax-typescript", { isTSX: true }],
		"@babel/plugin-syntax-jsx",
		["@stylexjs/babel-plugin", { dev: false, runtimeInjection: false }],
		rebaseRelativeImportsPlugin,
	],
});

if (!output?.code) {
	throw new Error("Unable to compile the StyleX case.");
}

const { stylex: rules } = output.metadata as unknown as {
	stylex: Parameters<typeof stylexPlugin.processStylexRules>[0];
};

fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

// The output directory is outside the TypeScript project: the JSX runtime is set by the file itself.
fs.writeFileSync(
	path.join(OUTPUT_DIRECTORY, "component.tsx"),
	`/** @jsxRuntime automatic */\n${output.code}`,
);

fs.writeFileSync(
	path.join(OUTPUT_DIRECTORY, "stylex.css"),
	stylexPlugin.processStylexRules(rules, {}),
);
