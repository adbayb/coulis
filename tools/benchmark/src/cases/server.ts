import { measureCases } from "../helpers";

/**
 * Bootstraps a case in its process. `server.spec.ts` runs the `server.tsx` entry of each case
 * folder in a process of its own, which sends its measure back: a library never shares its runtime
 * (heap, compiled code, caches) with another one.
 *
 * The response of each rendering is encoded, as a server does to send it. Otherwise, the rendered
 * HTML (a string React concatenates lazily) would only be read, so only be put together, by the
 * libraries extracting their styles from it: they alone would bear a cost every server pays.
 *
 * @param name - The case name.
 * @param render - The server rendering measured by the case: it returns the response (the styles to
 *   send, if any, then the HTML).
 */
export const bootstrapServerCase = (name: string, render: () => string) => {
	const handler = () => {
		Buffer.from(render());
	};

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
