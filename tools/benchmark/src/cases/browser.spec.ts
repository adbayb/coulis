import { strict as assert } from "node:assert";
import { test } from "playwright/test";
import { createReport } from "../helpers";
import type { Measure } from "../types";

/** Each case runs in a page of its own, with the script and the style sheet of its folder only. */
const CASES: { name: string; styleSheetPath?: string }[] = [
	{ name: "coulis" },
	{ name: "emotion" },
	{ name: "goober" },
	{ name: "styled-components" },
	// StyleX styles are compiled into a style sheet at build time, the other libraries insert theirs at runtime.
	{ name: "stylex", styleSheetPath: "./dist/stylex/stylex.css" },
];

test("browser", async ({ browser }) => {
	const measures: Measure[] = [];

	for (const { name, styleSheetPath } of CASES) {
		const page = await browser.newPage();

		if (styleSheetPath) {
			await page.addStyleTag({ path: styleSheetPath });
		}

		await page.addScriptTag({ path: `./dist/${name}.js` });

		measures.push(
			await page.evaluate(async () => {
				return globalThis.__RUN_BENCHMARK__();
			}),
		);

		await page.close();
	}

	const output = createReport(measures);

	assert.equal(output.results.length, CASES.length);
	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
