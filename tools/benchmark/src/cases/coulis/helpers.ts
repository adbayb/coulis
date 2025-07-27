import { createCoulis } from "coulis";

export const { createKeyframes, createStyles, getMetadata, setGlobalStyles } =
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
