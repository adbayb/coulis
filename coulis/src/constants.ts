// eslint-disable-next-line n/prefer-global/process
export const IS_PROD_ENV = process.env.NODE_ENV === "production"; // TODO: fallback
// eslint-disable-next-line unicorn/prefer-global-this
export const IS_BROWSER_ENV = typeof window !== "undefined";
