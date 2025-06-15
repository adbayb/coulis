import { createCoulis, createWebAdapter } from "coulis";

const { createStyles, getMetadataAsString } = createCoulis(createWebAdapter);

export { createStyles, getMetadataAsString };
