import { createCoulis, createWebAdapter } from "coulis";

const {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	getMetadataAsString,
	setGlobalStyles,
} = createCoulis(createWebAdapter);

export {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	getMetadataAsString,
	setGlobalStyles,
};
