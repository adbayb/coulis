import { BACKGROUND_COLORS, createRowIndexes } from "../constants";
import { TableShell } from "../table";
import { createStyles } from "./helpers";

const rowIndexes = createRowIndexes();

export const CoulisComponent = () => {
	return (
		<TableShell>
			{rowIndexes.map((index) => {
				const className = createStyles({
					backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
				});

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
