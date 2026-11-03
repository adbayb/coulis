import { Bench } from "tinybench";
import type { BenchmarkOutput } from "./types";

type Case = {
	name: string;
	/**
	 * Optional static counterpart, excluded from the dynamic ranking and used to calculate
	 * `Overhead vs baseline`.
	 */
	baseline?: () => void;
	handler: () => void;
};

type Measure = {
	name: string;
	baselineFor: string | undefined;
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

	const baselineForByName = new Map<string, string>();

	for (const { name, baseline, handler } of cases) {
		benchmark.add(name, handler);

		if (baseline) {
			const baselineName = `${name} (baseline)`;

			benchmark.add(baselineName, baseline);
			baselineForByName.set(baselineName, name);
		}
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
					baselineFor: baselineForByName.get(name),
					latencyMean: result.latency.mean,
					latencyMedian: result.latency.p50,
					throughputMean: result.throughput.mean,
					throughputMedian: result.throughput.p50,
				};
			});

			const dynamicMeasures = measures
				.filter(({ baselineFor }) => {
					return baselineFor === undefined;
				})
				.toSorted(byThroughputDescending);

			const baselineMeasures = measures
				.filter(({ baselineFor }) => {
					return baselineFor !== undefined;
				})
				.toSorted(byThroughputDescending);

			const [fastestMeasure] = dynamicMeasures;

			if (!fastestMeasure) {
				throw new Error("Unable to find fastest case");
			}

			const baselineThroughputByName = new Map(
				baselineMeasures.map(({ baselineFor, throughputMean }) => {
					return [baselineFor, throughputMean];
				}),
			);

			return {
				fastestCase: fastestMeasure.name,
				results: [
					...dynamicMeasures.map((measure) => {
						const baselineThroughput = baselineThroughputByName.get(measure.name);

						return toOutput(measure, {
							overheadVsBaseline:
								baselineThroughput === undefined
									? "n/a"
									: getSlowdown(baselineThroughput, measure.throughputMean),
							slowerThanFastest: getSlowdown(
								fastestMeasure.throughputMean,
								measure.throughputMean,
							),
						});
					}),
					...baselineMeasures.map((measure) => {
						return toOutput(measure, {
							overheadVsBaseline: "— (baseline)",
							slowerThanFastest: "— (baseline)",
						});
					}),
				],
			};
		},
	};
};

const byThroughputDescending = (a: Measure, b: Measure) => {
	return b.throughputMean - a.throughputMean;
};

const getSlowdown = (referenceThroughput: number, throughput: number) => {
	return `${toFixed(((referenceThroughput - throughput) / referenceThroughput) * 100)}%`;
};

const toOutput = (
	measure: Measure,
	comparison: { overheadVsBaseline: string; slowerThanFastest: string },
): BenchmarkOutput => {
	return {
		"name": measure.name,
		"Latency mean (ms)": toFixed(measure.latencyMean),
		"Latency med (ms)": toFixed(measure.latencyMedian),
		"Overhead vs baseline": comparison.overheadVsBaseline,
		"Slower than fastest": comparison.slowerThanFastest,
		"Throughput mean (ops/s)": toFixed(measure.throughputMean),
		"Throughput med (ops/s)": toFixed(measure.throughputMedian),
	};
};

const toFixed = (input: number) => {
	return Number(input.toFixed(4));
};
