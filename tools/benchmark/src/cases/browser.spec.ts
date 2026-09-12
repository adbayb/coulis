import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import { test } from "playwright/test";

test("browser", async ({ page }) => {
	await page.addScriptTag({
		content: await fs.readFile("./dist/browser.js", "utf8"),
	});

	const output = await page.evaluate(async () => {
		return globalThis.__RUN_BENCHMARK__();
	});

	assert.equal(output.results.length, 3);
	assert.ok(typeof output.fastestCase === "string" && output.fastestCase.length > 0);
	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
