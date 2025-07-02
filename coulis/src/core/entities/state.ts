export type StatesLike =
	| Record<
			string,
			(input: { className: string; declaration: string }) => string
	  >
	| undefined;
