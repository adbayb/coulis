import { Bench } from "tinybench";
import type { BenchmarkOutput } from "./types";

type Case = {
	name: string;
	handler: () => void;
};

type Measure = {
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

			const measures: Measure[] = tasks.map(({ name, result }) => {
				if (result.state !== "completed") {
					throw new Error(`Benchmark failed for: ${name}`);
				}

				return {
					name,
					latencyMean: result.latency.mean,
					latencyMedian: result.latency.p50,
					throughputMean: result.throughput.mean,
					throughputMedian: result.throughput.p50,
				};
			});

			const sortedMeasures = measures.toSorted(byThroughputDescending);
			const [fastestMeasure] = sortedMeasures;

			if (!fastestMeasure) {
				throw new Error("Unable to find fastest case");
			}

			return {
				fastestCase: fastestMeasure.name,
				results: sortedMeasures.map((measure) => {
					return toOutput(
						measure,
						getSlowdown(fastestMeasure.throughputMean, measure.throughputMean),
					);
				}),
			};
		},
	};
};

const byThroughputDescending = (a: Measure, b: Measure) => {
	return b.throughputMean - a.throughputMean;
};

const getSlowdown = (fastestThroughput: number, throughput: number) => {
	return `${toFixed(((fastestThroughput - throughput) / fastestThroughput) * 100)}%`;
};

const toOutput = (measure: Measure, slowerThanFastest: string): BenchmarkOutput => {
	return {
		"name": measure.name,
		"Latency mean (ms)": toFixed(measure.latencyMean),
		"Latency med (ms)": toFixed(measure.latencyMedian),
		"Slower than fastest": slowerThanFastest,
		"Throughput mean (ops/s)": toFixed(measure.throughputMean),
		"Throughput med (ops/s)": toFixed(measure.throughputMedian),
	};
};

const toFixed = (input: number) => {
	return Number(input.toFixed(4));
};
