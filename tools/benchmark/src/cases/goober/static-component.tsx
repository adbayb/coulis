import { css } from "goober";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

const staticClassNames = BACKGROUND_COLORS.map((backgroundColor) => {
	return css({ backgroundColor });
});

export const GooberStaticComponent = () => {
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
