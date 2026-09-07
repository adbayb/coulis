import { styled } from "styled-components";
import { NUMBER_OF_DATA } from "../../constants";
import { SHADES } from "../constants";

const Cell = styled.td<{ $backgroundColor: string }>`
	background-color: ${(properties) => {
		return properties.$backgroundColor;
	}};
`;

export const StyledComponentsComponent = () => {
	return (
		<table>
			<thead>
				<tr>
					<th>Column1</th>
				</tr>
			</thead>
			<tbody>
				{Array.from({ length: NUMBER_OF_DATA }, (_, index) => {
					return (
						<tr key={index}>
							<Cell $backgroundColor={SHADES[index % SHADES.length] as string}>
								The table body
							</Cell>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
