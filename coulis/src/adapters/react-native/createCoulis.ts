import type { CreateCoulis } from "../../core/ports/createCoulis";

export const createCoulis: CreateCoulis<Record<string, unknown>> = (_input) => {
	return {
		createKeyframes() {
			throw new Error("Not implement yet");
		},
		createMetadata() {
			throw new Error("Not implement yet");
		},
		createStyles() {
			throw new Error("Not implement yet");
		},
		getContract() {
			throw new Error("Not implement yet");
		},
		getMetadataAsString() {
			throw new Error("Not implement yet");
		},
		setGlobalStyles() {
			throw new Error("Not implement yet");
		},
	};
};
