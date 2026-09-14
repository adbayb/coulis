import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createBenchmark } from "../helpers";
import { CoulisCase } from "./coulis/server";
import { CoulisStaticCase } from "./coulis/static-server";
import { EmotionCase } from "./emotion/server";
import { EmotionStaticCase } from "./emotion/static-server";
import { StyledComponentsCase } from "./styled-components/server";
import { StyledComponentsStaticCase } from "./styled-components/static-server";

/**
 * Note on interpreting results: dynamic cases create styles during render and are the ones
 * comparing actual library performance (`fastestCase` / `Slower than fastest` only rank them).
 * Static vs dynamic: static baselines hoist styles to module scope, so styles are evaluated once at
 * startup (outside the measured iterations) and each iteration only re-renders, measuring the
 * theoretical ceiling per library; use `Overhead vs baseline` to read how far each dynamic case is
 * from its static computation.
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
	{
		name: "coulis (baseline)",
		baseline: true,
		baselineFor: "coulis",
		handler: CoulisStaticCase,
	},
	{
		name: "emotion (baseline)",
		baseline: true,
		baselineFor: "emotion",
		handler: EmotionStaticCase,
	},
	{
		name: "styled-components (baseline)",
		baseline: true,
		baselineFor: "styled-components",
		handler: StyledComponentsStaticCase,
	},
]);

void test("server", async () => {
	const output = await benchmark.run();

	assert.equal(output.results.length, 6);
	assert.ok(typeof output.fastestCase === "string" && output.fastestCase.length > 0);

	for (const result of output.results) {
		assert.ok(result["Throughput mean (ops/s)"] > 0);
	}

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
