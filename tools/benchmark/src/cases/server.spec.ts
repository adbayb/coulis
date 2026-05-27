import { test } from "node:test";

import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { EmotionCase } from "./emotion/server";

const benchmark = createBenchmark([
	{
		handler: CoulisCase,
		name: "coulis",
	},
	{
		handler: EmotionCase,
		name: "emotion",
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
