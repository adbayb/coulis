/**
 * Partial `react-native` module for tests (the real one cannot be loaded outside React Native): a
 * 400x800 window that never changes.
 */
export const Dimensions = {
	addEventListener() {
		// No window change to listen to.
	},
	get() {
		return { height: 800, width: 400 };
	},
};
