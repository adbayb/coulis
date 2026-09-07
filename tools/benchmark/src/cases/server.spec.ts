import { test } from "node:test";
import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { CoulisStaticCase } from "./coulis/static-server";
import { EmotionCase } from "./emotion/server";
import { EmotionStaticCase } from "./emotion/static-server";

/**
 * Note on interpreting results: the static cases hoist all styles to module scope, so each
 * iteration mostly measures `renderToString`; barely any styling-library code runs (which is why
 * coulis and emotion score similarly there). The default cases create styles during render (dynamic
 * injection) and are the ones comparing actual library performance.
 */
const benchmark = createBenchmark([
	{
		name: "coulis",
		handler: CoulisCase,
	},
	{
		name: "emotion",
		handler: EmotionCase,
	},
	{
		name: "coulis (static)",
		handler: CoulisStaticCase,
	},
	{
		name: "emotion (static)",
		handler: EmotionStaticCase,
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
