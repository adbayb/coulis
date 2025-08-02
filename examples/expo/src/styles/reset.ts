import { setGlobalStyles } from "./styles";

export const resetStyles = () => {
	setGlobalStyles({
		"*": {
			all: "unset",
			display: "revert",
			margin: "none",
			outline: "revert",
			padding: "none",
		},
		"*, *::before, *::after": {
			boxSizing: "inherit",
		},
		":root": {
			"-webkit-font-smoothing": "antialiased",
			"boxSizing": "border-box",
			"color": "foregroundSecondary",
			"font-family": "InterVariable, sans-serif",
			"font-optical-sizing": "auto",
			"fontSize": "base",
		},
		"html,body": {
			height: "100%",
		},
		"ul": {
			listStyleType: "none",
		},
	});

	setGlobalStyles({
		"@font-face": {
			fontDisplay: "swap",
			fontFamily: "InterVariable",
			fontStyle: "normal",
			fontWeight: "100 900",
			src: 'url("InterVariable.woff2") format("woff2")',
		},
	});

	setGlobalStyles({
		"@font-face": {
			fontDisplay: "swap",
			fontFamily: "InterVariable",
			fontStyle: "italic",
			fontWeight: "100 900",
			src: 'url("InterVariableItalic.woff2") format("woff2")',
		},
	});
};
