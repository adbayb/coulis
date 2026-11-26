import { measureCases } from "../helpers";

/**
 * Bootstraps a case in its process. `server.spec.ts` runs the `server.tsx` entry of each case
 * folder in a process of its own, which sends its measure back: a library never shares its runtime
 * (heap, compiled code, caches) with another one.
 *
 * @param name - The case name.
 * @param handler - The server rendering measured by the case.
 */
export const bootstrapServerCase = (name: string, handler: () => void) => {
	const sendMeasure = async () => {
		const [measure] = await measureCases([{ name, handler }]);

		if (!measure) {
			throw new Error(`Unable to measure: ${name}`);
		}

		process.send?.(measure);
		// The channel with `server.spec.ts` would keep the process alive.
		process.disconnect?.();
	};

	void sendMeasure();
};
