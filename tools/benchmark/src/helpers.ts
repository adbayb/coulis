import { Bench } from "tinybench";
import type { BenchmarkOutput } from "./types";

type Case = {
	name: string;
	handler: () => void;
};

type CompletedResult = {
	name: string;
	latencyMean: number;
	latencyMedian: number;
	throughputMean: number;
	throughputMedian: number;
};

export const createBenchmark = (cases: Case[]) => {
	const benchmark = new Bench({
		iterations: 16,
		time: 500,
		warmupIterations: 5,
		warmupTime: 100,
	});

	for (const { name, handler } of cases) {
		benchmark.add(name, handler);
	}

	return {
		async run() {
			const tasks = await benchmark.run();
			const completed: CompletedResult[] = [];
			let fastestThroughput = 0;

			for (const { name, result } of tasks) {
				if (result.state !== "completed") {
					throw new Error(`Benchmark failed for: ${name}`);
				}

				const throughputMean = result.throughput.mean;

				if (throughputMean > fastestThroughput) {
					fastestThroughput = throughputMean;
				}

				completed.push({
					name,
					latencyMean: result.latency.mean,
					latencyMedian: result.latency.p50,
					throughputMean,
					throughputMedian: result.throughput.p50,
				});
			}

			const results: BenchmarkOutput[] = completed.map((completedResult) => {
				return {
					"name": completedResult.name,
					"Latency mean (ms)": toFixed(completedResult.latencyMean),
					"Latency med (ms)": toFixed(completedResult.latencyMedian),
					"Slower than fastest": `${toFixed(((fastestThroughput - completedResult.throughputMean) / fastestThroughput) * 100)}%`,
					"Throughput mean (ops/s)": toFixed(completedResult.throughputMean),
					"Throughput med (ops/s)": toFixed(completedResult.throughputMedian),
				};
			});

			const sortedResults = results.toSorted((a, b) => {
				return b["Throughput mean (ops/s)"] - a["Throughput mean (ops/s)"];
			});

			const [fastestCase] = sortedResults;

			if (!fastestCase) {
				throw new Error("Unable to find fastest case");
			}

			return {
				fastestCase: fastestCase.name,
				results: sortedResults,
			};
		},
	};
};

const toFixed = (input: number) => {
	return Number(input.toFixed(4));
};
