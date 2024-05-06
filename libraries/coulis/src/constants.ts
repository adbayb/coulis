export const IS_PROD_ENV = process.env.NODE_ENV === "production";
export const IS_BROWSER_ENV = typeof window !== "undefined";
