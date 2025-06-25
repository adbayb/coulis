export type StatesLike = Record<
	string,
	(input: { className: string; declaration: string }) => string
> & {
	// The `base` state cannot be overwritten consumer-side
	base?: never;
};
