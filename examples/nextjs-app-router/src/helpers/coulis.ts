import { createCoulis, createWebAdapter } from "coulis";

const {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	getMetadata,
	setGlobalStyles,
} = createCoulis(createWebAdapter);

export {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	getMetadata,
	setGlobalStyles,
};
