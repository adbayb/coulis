import { styled } from "styled-components";
import { BACKGROUND_COLORS, createRowIndexes } from "../constants";
import { TableShell } from "../table";

const rowIndexes = createRowIndexes();

/**
 * Baseline: same DOM as `StyledComponentsComponent` but styled components hoisted to module scope
 * (one per background color). Each iteration only looks up a prebuilt component, so no `styled`
 * creation cost runs during render. Compare against the dynamic case via `Overhead vs baseline`.
 */
const StaticCells = BACKGROUND_COLORS.map((backgroundColor) => {
	return styled.td`
		background-color: ${backgroundColor};
	`;
});

export const StyledComponentsStaticComponent = () => {
	return (
		<TableShell>
			{rowIndexes.map((index) => {
				const Cell = StaticCells[
					index % StaticCells.length
				] as (typeof StaticCells)[number];

				return (
					<tr key={index}>
						<Cell>The table body</Cell>
						<Cell>with two columns</Cell>
					</tr>
				);
			})}
		</TableShell>
	);
};
