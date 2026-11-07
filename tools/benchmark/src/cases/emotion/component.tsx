import { css } from "@emotion/css";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

export const EmotionComponent = () => {
	return (
		<TableShell>
			{ROW_INDEXES.map((index) => {
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
