export type Transform = (input: {
	name: string;
	value: unknown;
}) => typeof input;
