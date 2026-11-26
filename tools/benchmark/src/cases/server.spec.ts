import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { EmotionCase } from "./emotion/server";
import { GooberCase } from "./goober/server";
import { StyledComponentsCase } from "./styled-components/server";
import { StyleXCase } from "./stylex/server";

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
		name: "goober",
		handler: GooberCase,
	},
	{
		name: "styled-components",
		handler: StyledComponentsCase,
	},
	{
		name: "stylex",
		handler: StyleXCase,
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	assert.equal(output.results.length, 5);
	assert.ok(typeof output.fastestCase === "string" && output.fastestCase.length > 0);

	for (const result of output.results) {
		assert.ok(result["Throughput mean (ops/s)"] > 0);
	}

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
