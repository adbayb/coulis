import { Bench } from "tinybench";
import type { BenchmarkOutput } from "./types";

type Case = {
	name: string;
	/**
	 * Baseline cases (styles hoisted to module scope) measure the theoretical ceiling for a given
	 * library. They are reported for `Overhead vs baseline` computation only and are excluded from
	 * `fastestCase` / `Slower than fastest` ranking. Static vs dynamic: static evaluates styles
	 * once at startup (module scope, outside the measured iterations) so each iteration only
	 * re-renders, while dynamic creates styles during render and pays the per-render library cost.
	 */
	baseline?: boolean;
	/** Name of the dynamic case this baseline belongs to. Required when `baseline` is true. */
	baselineFor?: string;
	handler: () => void;
};

type CompletedResult = {
	name: string;
	baseline: boolean;
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

	for (const { name, handler } of cases) {
		benchmark.add(name, handler);
	}

	const caseByName = new Map(
		cases.map((current) => {
			return [current.name, current];
		}),
	);

	return {
		async run() {
			const tasks = await benchmark.run();
			const completed: CompletedResult[] = [];
			let fastestThroughput = 0;

			for (const { name, result } of tasks) {
				if (result.state !== "completed") {
					throw new Error(`Benchmark failed for: ${name}`);
				}

				const meta = caseByName.get(name);

				if (meta?.baseline && !meta.baselineFor) {
					throw new Error(`Baseline case missing "baselineFor": ${name}`);
				}

				const throughputMean = result.throughput.mean;
				const isBaseline = meta?.baseline ?? false;

				if (!isBaseline && throughputMean > fastestThroughput) {
					fastestThroughput = throughputMean;
				}

				completed.push({
					name,
					baseline: isBaseline,
					baselineFor: meta?.baselineFor,
					latencyMean: result.latency.mean,
					latencyMedian: result.latency.p50,
					throughputMean,
					throughputMedian: result.throughput.p50,
				});
			}

			const baselineThroughputByDynamicName = new Map<string, number>();

			for (const completedResult of completed) {
				if (completedResult.baseline && completedResult.baselineFor) {
					baselineThroughputByDynamicName.set(
						completedResult.baselineFor,
						completedResult.throughputMean,
					);
				}
			}

			const results: BenchmarkOutput[] = completed.map((completedResult) => {
				if (completedResult.baseline) {
					return {
						"name": completedResult.name,
						"Latency mean (ms)": toFixed(completedResult.latencyMean),
						"Latency med (ms)": toFixed(completedResult.latencyMedian),
						"Overhead vs baseline": "— (baseline)",
						"Slower than fastest": "— (baseline)",
						"Throughput mean (ops/s)": toFixed(completedResult.throughputMean),
						"Throughput med (ops/s)": toFixed(completedResult.throughputMedian),
					};
				}

				const baselineThroughput = baselineThroughputByDynamicName.get(
					completedResult.name,
				);

				return {
					"name": completedResult.name,
					"Latency mean (ms)": toFixed(completedResult.latencyMean),
					"Latency med (ms)": toFixed(completedResult.latencyMedian),
					"Overhead vs baseline":
						baselineThroughput === undefined
							? "n/a"
							: `${toFixed(((baselineThroughput - completedResult.throughputMean) / baselineThroughput) * 100)}%`,
					"Slower than fastest": `${toFixed(((fastestThroughput - completedResult.throughputMean) / fastestThroughput) * 100)}%`,
					"Throughput mean (ops/s)": toFixed(completedResult.throughputMean),
					"Throughput med (ops/s)": toFixed(completedResult.throughputMedian),
				};
			});

			const dynamicResults = results
				.filter((result) => {
					return !caseByName.get(result.name)?.baseline;
				})
				.toSorted((a, b) => {
					return b["Throughput mean (ops/s)"] - a["Throughput mean (ops/s)"];
				});

			const baselineResults = results
				.filter((result) => {
					return caseByName.get(result.name)?.baseline;
				})
				.toSorted((a, b) => {
					return b["Throughput mean (ops/s)"] - a["Throughput mean (ops/s)"];
				});

			const sortedResults = [...dynamicResults, ...baselineResults];
			const [fastestCase] = dynamicResults;

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
