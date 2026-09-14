import { styled } from "styled-components";
import { BACKGROUND_COLORS, createRowIndexes } from "../constants";
import { TableShell } from "../table";

const rowIndexes = createRowIndexes();

const Cell = styled.td<{ $backgroundColor: string }>`
	background-color: ${(properties) => {
		return properties.$backgroundColor;
	}};
`;

export const StyledComponentsComponent = () => {
	return (
		<TableShell>
			{rowIndexes.map((index) => {
				const backgroundColor = BACKGROUND_COLORS[
					index % BACKGROUND_COLORS.length
				] as string;

				return (
					<tr key={index}>
						<Cell $backgroundColor={backgroundColor}>The table body</Cell>
						<Cell $backgroundColor={backgroundColor}>with two columns</Cell>
					</tr>
				);
			})}
		</TableShell>
	);
};
