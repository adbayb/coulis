/* eslint-disable n/prefer-global/process */
export const logger = {
	debug(input: string) {
		if (process.env.NODE_ENV === "production") return;

		console.debug(input);
	},
};
