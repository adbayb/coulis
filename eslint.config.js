import baseConfig from "@adbayb/stack/eslint";

export default [
	...baseConfig,
	{
		files: ["**/examples/**", "**/tools/**"],
		rules: {
			"import-x/no-default-export": "off",
			"n/prefer-global/process": "off",
			"react/no-array-index-key": "off",
			"sonarjs/file-name-differ-from-class": "off",
			"sort-keys-custom-order/object-keys": "off",
			"unicorn/filename-case": "off",
			"unicorn/no-process-exit": "off",
		},
	},
];
