import { css } from "@emotion/css";
import { BACKGROUND_COLORS, createRowIndexes } from "../constants";
import { TableShell } from "../table";

const rowIndexes = createRowIndexes();

export const EmotionComponent = () => {
	return (
		<TableShell>
			{rowIndexes.map((index) => {
				const className = css`
					background-color: ${BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]};
				`;

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
