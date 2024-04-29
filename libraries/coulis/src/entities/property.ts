export type Property<Value extends number | string = number | string> = {
	name: string;
	value: Value;
};
