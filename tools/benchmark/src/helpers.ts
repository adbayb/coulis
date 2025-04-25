import { Bench } from "tinybench";

type Case = {
	name: string;
	handler: () => void;
};

export const createBenchmark = (cases: Case[]) => {
	const benchmark = new Bench({ time: 1000 });

	for (const { name, handler } of cases) {
		benchmark.add(name, handler);
	}

	return {
		run() {
			benchmark.runSync();

			const fastestCase = cases[
				benchmark.results.reduce(
					(fastestResult, currentResult, index) => {
						const currentThroughput =
							currentResult?.throughput.mean;

						if (currentThroughput === undefined)
							return fastestResult;

						if (currentThroughput > fastestResult.throughput)
							return { index, throughput: currentThroughput };

						return fastestResult;
					},
					{ index: 0, throughput: 0 },
				).index
			] as Case;

			console.log("Fastest is", fastestCase.name, "✨");
			console.table(benchmark.table());

			process.exit(0);
		},
	};
};
