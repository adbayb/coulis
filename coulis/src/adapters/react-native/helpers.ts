import { logger } from "../../core/entities/logger";

export const createUnsupportedLogger = () => {
	type Method = "createKeyframes" | "getMetadata" | "setGlobalStyles";

	const loggedMessages = new Set<string>(); // To log only once.

	const warn = (message: string) => {
		if (loggedMessages.has(message)) {
			return;
		}

		logger.debug(message);
		loggedMessages.add(message);
	};

	return {
		warn,
		warnUnsupportedMethod(method: Method) {
			warn(
				`The \`react-native\` platform does not support \`${method}\` method. Ignoring the call...`,
			);
		},
	};
};
