/* eslint-disable perfectionist/sort-objects */
import { Bench } from "tinybench";

import type { BenchmarkOutput } from "./types";

type Case = {
	handler: () => void;
	name: string;
};

export const createBenchmark = (cases: Case[]) => {
	const benchmark = new Bench({ time: 1000 });

	for (const { handler, name } of cases) {
		benchmark.add(name, handler);
	}

	return {
		async run() {
			const tasks = await benchmark.run();

			const results = tasks
				.map(({ name, result }) => {
					if (result.state !== "completed") return undefined;

					return {
						name,
						"Throughput mean (ops/s)": toFixed(
							result.throughput.mean,
						),
						"Throughput med (ops/s)": toFixed(
							result.throughput.p50,
						),
						"Latency mean (ns)": toFixed(result.latency.mean),
						"Latency med (ns)": toFixed(result.latency.p50),
					};
				})
				.filter(Boolean) as BenchmarkOutput[];

			const fastestCase = cases[
				tasks.reduce(
					(fastestTask, currentTask, index) => {
						if (currentTask.result.state !== "completed")
							return fastestTask;

						const currentThroughput =
							currentTask.result.throughput.mean;

						if (currentThroughput > fastestTask.throughput)
							return { index, throughput: currentThroughput };

						return fastestTask;
					},
					{ index: 0, throughput: 0 },
				).index
			] as Case;

			return {
				fastestCase: fastestCase.name,
				results,
			};
		},
	};
};

const toFixed = (input: number) => {
	return Number(input.toFixed(4));
};
