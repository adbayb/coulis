import { Bench } from "tinybench";
import type { BenchmarkOutput, Measure } from "./types";

type Case = {
	name: string;
	handler: () => void;
};

/**
 * Measures cases one after the other.
 *
 * @param cases - The cases to measure.
 * @returns The measure of each case, in the given order.
 */
export const measureCases = async (cases: Case[]): Promise<Measure[]> => {
	const benchmark = new Bench({
		iterations: 16,
		time: 500,
		warmupIterations: 5,
		warmupTime: 100,
	});

	for (const { name, handler } of cases) {
		benchmark.add(name, handler);
	}

	const tasks = await benchmark.run();

	return tasks.map(({ name, result }) => {
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
};

/**
 * Ranks measures by throughput, each compared with the fastest one.
 *
 * @param measures - The measures to rank.
 * @returns The fastest case name and the ranked results.
 */
export const createReport = (measures: Measure[]) => {
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
