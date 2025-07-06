import { createCoulis } from "coulis/web";

const { createKeyframes, createStyles, getMetadata, setGlobalStyles } =
	createCoulis({
		properties() {
			return {
				backgroundColor: true,
				border: true,
			};
		},
		states: {
			hover: "coulis[selector]:hover{coulis[declaration]}",
		},
	});

export { createKeyframes, createStyles, getMetadata, setGlobalStyles };
