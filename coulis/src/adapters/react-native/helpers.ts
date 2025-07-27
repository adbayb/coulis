import { logger } from "../../core/entities/logger";

export const createUnsupportedLogger = () => {
	type Method = "createKeyframes" | "getMetadata" | "setGlobalStyles";

	const cache = new Set<string>(); // To log only once.

	const log = (input: string) => {
		if (cache.has(input)) return;

		logger.debug(input);

		cache.add(input);
	};

	return {
		behavior: log,
		method(method: Method) {
			log(
				`The \`react-native\` platform does not support \`${method}\` method. Ignoring the call...`,
			);
		},
	};
};
