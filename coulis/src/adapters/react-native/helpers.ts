type UnsupportedMethod =
	| "createKeyframes"
	| "getCriticalStyleSheets"
	| "getStyleSheets"
	| "setGlobalStyles";

/**
 * Creates a logger reporting unsupported usages: each message is logged once, and never in
 * production.
 *
 * @returns The logger.
 */
export const createUnsupportedLogger = () => {
	const loggedMessages = new Set<string>();

	const warn = (message: string) => {
		if (loggedMessages.has(message)) {
			return;
		}

		if (process.env.NODE_ENV !== "production") {
			console.debug(message);
		}

		loggedMessages.add(message);
	};

	return {
		warn,
		warnUnsupportedMethod(method: UnsupportedMethod) {
			warn(
				`The \`react-native\` platform does not support \`${method}\` method. Ignoring the call...`,
			);
		},
	};
};
