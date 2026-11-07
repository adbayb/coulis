import { css } from "goober";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

export const GooberComponent = () => {
	return (
		<TableShell>
			{ROW_INDEXES.map((index) => {
				const className = css({
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
