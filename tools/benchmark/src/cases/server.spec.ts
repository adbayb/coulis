import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { EmotionCase } from "./emotion/server";
import { StyledComponentsCase } from "./styled-components/server";

/**
 * Note on interpreting results: all cases create styles during render and are the ones comparing
 * actual library performance.
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
		name: "styled-components",
		handler: StyledComponentsCase,
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	assert.equal(output.results.length, 3);
	assert.ok(typeof output.fastestCase === "string" && output.fastestCase.length > 0);

	for (const result of output.results) {
		assert.ok(result["Throughput mean (ops/s)"] > 0);
	}

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
