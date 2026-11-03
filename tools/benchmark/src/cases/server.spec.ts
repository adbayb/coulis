import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { CoulisStaticCase } from "./coulis/static-server";
import { EmotionCase } from "./emotion/server";
import { EmotionStaticCase } from "./emotion/static-server";
import { GooberCase } from "./goober/server";
import { GooberStaticCase } from "./goober/static-server";
import { StyledComponentsCase } from "./styled-components/server";
import { StyledComponentsStaticCase } from "./styled-components/static-server";

const benchmark = createBenchmark([
	{
		name: "coulis",
		baseline: CoulisStaticCase,
		handler: CoulisCase,
	},
	{
		name: "emotion",
		baseline: EmotionStaticCase,
		handler: EmotionCase,
	},
	{
		name: "goober",
		baseline: GooberStaticCase,
		handler: GooberCase,
	},
	{
		name: "styled-components",
		baseline: StyledComponentsStaticCase,
		handler: StyledComponentsCase,
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	assert.equal(output.results.length, 8);
	assert.ok(typeof output.fastestCase === "string" && output.fastestCase.length > 0);

	for (const result of output.results) {
		assert.ok(result["Throughput mean (ops/s)"] > 0);
	}

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
