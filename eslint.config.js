import baseConfig from "@adbayb/stack/eslint";

export default [
	...baseConfig,
	{
		files: ["**/examples/**", "**/tools/**"],
		rules: {
			"import-x/no-default-export": "off",
			"sonarjs/file-name-differ-from-class": "off",
			"unicorn/filename-case": "off",
		},
	},
];
