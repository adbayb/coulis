import { strict as assert } from "node:assert";
import { fork } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { createReport } from "../helpers";
import type { Measure } from "../types";

/** Each case runs in a process of its own, with the `server.tsx` entry of its folder only. */
const CASES = ["coulis", "emotion", "goober", "styled-components", "stylex"];

const measureCase = async (name: string) => {
	return new Promise<Measure>((resolve, reject) => {
		const caseProcess = fork(path.resolve(import.meta.dirname, name, "server.tsx"), {
			execArgv: ["--import", "tsx"],
		});

		caseProcess.once("message", (measure) => {
			resolve(measure as Measure);
		});

		caseProcess.once("error", reject);

		caseProcess.once("exit", (code) => {
			reject(new Error(`Benchmark failed for: ${name} (exit code ${String(code)})`));
		});
	});
};

void test("server", async () => {
	const measures: Measure[] = [];

	// One after the other, so that a case never competes with another one for the processor.
	for (const name of CASES) {
		measures.push(await measureCase(name));
	}

	const output = createReport(measures);

	assert.equal(output.results.length, CASES.length);

	for (const result of output.results) {
		assert.ok(result["Throughput mean (ops/s)"] > 0);
	}

	console.log(`Fastest is ${output.fastestCase} ✨`);
	console.table(output.results);
});
