declare global {
	var __RUN_BENCHMARK__: () => Promise<{
		fastestCase: string;
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		results: import("./types").BenchmarkOutput[];
	}>;
}

export {};
