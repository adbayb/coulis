import { createCoulis } from "coulis/web";

const { createKeyframes, createStyles, getMetadata, setGlobalStyles } =
	createCoulis({
		properties() {
			return {
				backgroundColor: true,
				border: true,
			};
		},
	});

export { createKeyframes, createStyles, getMetadata, setGlobalStyles };
