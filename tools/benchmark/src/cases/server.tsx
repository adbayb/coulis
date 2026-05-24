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

benchmark.run();
