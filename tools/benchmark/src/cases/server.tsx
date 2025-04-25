import { EmotionCase } from "./emotion/server";
import { CoulisCase } from "./coulis/server";
import { createBenchmark } from "../helpers";

const benchmark = createBenchmark([
	{
		name: "coulis",
		handler: CoulisCase,
	},
	{
		name: "emotion",
		handler: EmotionCase,
	},
]);

benchmark.run();
