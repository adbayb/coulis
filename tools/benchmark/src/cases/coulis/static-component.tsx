import { BACKGROUND_COLORS, createRowIndexes } from "../constants";
import { TableShell } from "../table";
import { createStyles } from "./helpers";

const rowIndexes = createRowIndexes();

/**
 * Baseline: same DOM as `CoulisComponent` but styles hoisted to module scope. Each iteration only
 * looks up a precomputed class name, so no `createStyles` cost runs during render. Compare against
 * the dynamic case via `Overhead vs baseline`.
 */
const staticClassNames = BACKGROUND_COLORS.map((backgroundColor) => {
	return createStyles({ backgroundColor });
});

export const CoulisStaticComponent = () => {
	return (
		<TableShell>
			{rowIndexes.map((index) => {
				const className = staticClassNames[index % staticClassNames.length] as string;

				return (
					<tr key={index}>
						<td className={className}>The table body</td>
						<td className={className}>with two columns</td>
					</tr>
				);
			})}
		</TableShell>
	);
};
