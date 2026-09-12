import type { BenchmarkOutput } from "./types";

declare global {
	var __RUN_BENCHMARK__: () => Promise<{
		fastestCase: string;
		results: BenchmarkOutput[];
	}>;
}

export {};
