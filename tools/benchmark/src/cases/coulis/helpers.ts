import { createCoulis } from "coulis";

const { createKeyframes, createMetadata, createStyles, setGlobalStyles } =
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

export { createKeyframes, createMetadata, createStyles, setGlobalStyles };
