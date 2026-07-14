declare global {
	var __RUN_BENCHMARK__: () => Promise<{
		fastestCase: string;
		// oxlint-disable-next-line typescript/consistent-type-imports
		results: import("./types").BenchmarkOutput[];
	}>;
}

export {};
