import { styled } from "styled-components";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

const Cell = styled.td<{ $backgroundColor: string }>`
	background-color: ${(properties) => {
		return properties.$backgroundColor;
	}};
`;

export const StyledComponentsComponent = () => {
	return (
		<TableShell>
			{ROW_INDEXES.map((index) => {
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
