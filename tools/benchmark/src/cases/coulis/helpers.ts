import { createCoulis } from "coulis";

export const { createStyles, getMetadata } = createCoulis({
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
