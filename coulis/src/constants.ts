/* eslint-disable n/prefer-global/process, unicorn/prefer-global-this */

export const IS_PROD_ENV =
	typeof process !== "undefined"
		? process.env.NODE_ENV === "production"
		: "production";

export const IS_BROWSER_ENV = typeof window !== "undefined";
