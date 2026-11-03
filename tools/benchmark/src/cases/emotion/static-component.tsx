import { css } from "@emotion/css";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

/**
 * Baseline: same DOM as `EmotionComponent` but styles hoisted to module scope. Each iteration only
 * looks up a precomputed class name, so no `css` cost runs during render. Compare against the
 * dynamic case via `Overhead vs baseline`.
 */
const staticClassNames = BACKGROUND_COLORS.map((backgroundColor) => {
	return css`
		background-color: ${backgroundColor};
	`;
});

export const EmotionStaticComponent = () => {
	return (
		<TableShell>
			{ROW_INDEXES.map((index) => {
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
