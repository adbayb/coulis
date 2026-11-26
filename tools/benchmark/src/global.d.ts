import type { Measure } from "./types";

declare global {
	var __RUN_BENCHMARK__: () => Promise<Measure>;
}

export {};
