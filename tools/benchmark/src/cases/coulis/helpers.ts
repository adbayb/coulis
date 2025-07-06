import { createCoulis } from "coulis";

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
